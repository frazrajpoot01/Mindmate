"""
test_chat.py
============
Priority test suite — heavily focused on Crisis Detection logic.
Uses shared client + DB fixtures from conftest.py.

Critical assertions:
  - Every crisis keyword triggers the emergency response.
  - Mixed casing & punctuation variations still trigger.
  - Keywords embedded in sentences trigger.
  - Groq API is NEVER called when a crisis is detected (mock assertion).
  - Normal messages → Groq is called, response is saved.
  - Sentiment tagging works correctly.
  - Unauthenticated requests are rejected.
"""

import pytest
from unittest.mock import patch

from app.services.crisis_service import CRISIS_KEYWORDS, scan


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_token(client, email="chat@example.com", password="chatpass123"):
    client.post("/auth/signup", json={"email": email, "password": password})
    return client.post(
        "/auth/login", json={"email": email, "password": password}
    ).json()["access_token"]


def _auth(token):
    return {"Authorization": f"Bearer {token}"}


# ===========================================================================
# SECTION 1: Crisis Detection Unit Tests (crisis_service.scan directly)
# ===========================================================================
class TestCrisisServiceScan:
    """Pure unit tests on scan() — no HTTP, no DB."""

    def test_exact_keyword_suicide(self):
        assert scan("I am thinking about suicide") is True

    def test_exact_keyword_kill_myself(self):
        assert scan("I want to kill myself") is True

    def test_exact_keyword_end_it_all(self):
        assert scan("I just want to end it all") is True

    def test_exact_keyword_want_to_die(self):
        assert scan("I want to die") is True

    def test_exact_keyword_suicidal(self):
        assert scan("I feel suicidal") is True

    def test_exact_keyword_harm_myself(self):
        assert scan("I want to harm myself") is True

    def test_exact_keyword_self_harm(self):
        assert scan("I've been doing self harm") is True

    def test_exact_keyword_self_harm_hyphen(self):
        assert scan("self-harm is something I think about") is True

    def test_exact_keyword_overdose(self):
        assert scan("I'm going to overdose") is True

    def test_exact_keyword_hang_myself(self):
        assert scan("I want to hang myself") is True

    def test_exact_keyword_shoot_myself(self):
        assert scan("I could shoot myself") is True

    def test_exact_keyword_no_reason_to_live(self):
        assert scan("There is no reason to live anymore") is True

    def test_exact_keyword_better_off_dead(self):
        assert scan("Everyone would be better off dead if I wasn't here") is True

    def test_exact_keyword_better_off_without_me(self):
        assert scan("They're better off without me") is True

    def test_exact_keyword_end_my_life(self):
        assert scan("I want to end my life") is True

    def test_exact_keyword_life_not_worth_living(self):
        assert scan("life is not worth living") is True

    def test_exact_keyword_life_isnt_worth_living(self):
        assert scan("life isn't worth living") is True

    def test_exact_keyword_goodbye_forever(self):
        assert scan("goodbye forever everyone") is True

    # --- Casing variations ---
    def test_mixed_case_suicide(self):
        assert scan("SuIcIdE is on my mind") is True

    def test_all_caps_suicide(self):
        assert scan("SUICIDE") is True

    def test_mixed_case_kill_myself(self):
        assert scan("I Want To KILL MYSELF") is True

    def test_title_case_end_it_all(self):
        assert scan("End It All") is True

    # --- Punctuation / apostrophe variations ---
    def test_apostrophe_cant(self):
        assert scan("I can't do this anymore") is True

    def test_no_apostrophe_cant(self):
        assert scan("I cant do this anymore") is True

    def test_keyword_with_exclamation(self):
        assert scan("suicide!!!") is True

    def test_keyword_with_ellipsis(self):
        assert scan("I just want to die...") is True

    # --- Embedded in longer sentences ---
    def test_embedded_in_long_sentence(self):
        assert scan(
            "I've been feeling really low lately and honestly sometimes I think about suicide more than I should"
        ) is True

    def test_embedded_harm_myself(self):
        assert scan("My therapist asked if I ever wanted to harm myself and I said yes") is True

    # --- Safe messages MUST NOT trigger ---
    def test_safe_message_happy(self):
        assert scan("I had a great day today, feeling good!") is False

    def test_safe_message_neutral(self):
        assert scan("What is the weather like today?") is False

    def test_safe_message_sad_but_not_crisis(self):
        assert scan("I feel a bit sad and lonely") is False

    def test_safe_message_empty(self):
        assert scan("") is False

    # --- Verify all keywords in the list are caught ---
    def test_all_keywords_in_list_are_detected(self):
        """Each entry in CRISIS_KEYWORDS must trigger scan()."""
        failed = []
        for kw in CRISIS_KEYWORDS:
            if not scan(kw):
                failed.append(kw)
        assert failed == [], f"These keywords were NOT detected: {failed}"


# ===========================================================================
# SECTION 2: /chat endpoint — Crisis Branch (HTTP level)
# ===========================================================================
class TestChatEndpointCrisis:
    """Integration tests: crisis messages must return emergency payload and
    NEVER call groq_service.get_response."""

    CRISIS_MESSAGES = [
        "I want to kill myself",
        "I am thinking about suicide",
        "end it all tonight",
        "I cant do this anymore",
        "I want to die",
        "SuIcIdE",
        "SUICIDE",
        "I feel suicidal today",
        "I want to harm myself",
        "life isn't worth living",
        "no reason to live",
        "better off dead",
        "I'm going to overdose",
    ]

    @patch("app.routers.chat.groq_service.get_response")
    def test_crisis_returns_emergency_response(self, mock_groq, client):
        token = _get_token(client, "crisis1@example.com")
        for msg in self.CRISIS_MESSAGES:
            response = client.post(
                "/chat",
                json={"message": msg},
                headers=_auth(token),
            )
            data = response.json()
            assert response.status_code == 200, f"Failed for: {msg}"
            assert data["is_emergency"] is True, f"is_emergency not True for: {msg}"
            assert data["action"] == "SHOW_EMERGENCY_PANEL", f"Wrong action for: {msg}"
            assert len(data["helplines"]) > 0, f"No helplines for: {msg}"

    @patch("app.routers.chat.groq_service.get_response")
    def test_groq_never_called_on_crisis(self, mock_groq, client):
        """THE most important test: Groq must NEVER be called for crisis messages."""
        token = _get_token(client, "groqtest@example.com")
        for msg in self.CRISIS_MESSAGES:
            mock_groq.reset_mock()
            client.post("/chat", json={"message": msg}, headers=_auth(token))
            mock_groq.assert_not_called(), f"Groq WAS called for crisis message: {msg}"

    @patch("app.routers.chat.groq_service.get_response")
    def test_emergency_response_contains_helplines(self, mock_groq, client):
        token = _get_token(client, "helpline@example.com")
        response = client.post(
            "/chat", json={"message": "I want to kill myself"}, headers=_auth(token)
        )
        helplines = response.json()["helplines"]
        numbers = [h["number"] for h in helplines]
        assert "1166" in numbers  # Pakistan Mental Health Helpline

    @patch("app.routers.chat.groq_service.get_response")
    def test_crisis_mixed_case_triggers(self, mock_groq, client):
        token = _get_token(client, "casetest@example.com")
        response = client.post(
            "/chat", json={"message": "SuiCiDe Is My Only Option"}, headers=_auth(token)
        )
        assert response.json()["is_emergency"] is True
        mock_groq.assert_not_called()


# ===========================================================================
# SECTION 3: /chat endpoint — Normal (safe) messages
# ===========================================================================
class TestChatEndpointNormal:
    @patch("app.routers.chat.groq_service.get_response", return_value="I hear you. Tell me more.")
    def test_safe_message_returns_reply(self, mock_groq, client):
        token = _get_token(client, "safe@example.com")
        response = client.post(
            "/chat", json={"message": "I feel a bit anxious today"}, headers=_auth(token)
        )
        assert response.status_code == 200
        data = response.json()
        assert data["is_emergency"] is False
        assert data["reply"] == "I hear you. Tell me more."
        assert data["mood"] in ("Positive", "Negative", "Neutral")

    @patch("app.routers.chat.groq_service.get_response", return_value="That sounds tough.")
    def test_groq_is_called_for_safe_message(self, mock_groq, client):
        token = _get_token(client, "safecall@example.com")
        client.post(
            "/chat", json={"message": "I had a tough week"}, headers=_auth(token)
        )
        mock_groq.assert_called_once()

    def test_unauthenticated_chat_rejected(self, client):
        response = client.post("/chat", json={"message": "Hello"})
        assert response.status_code == 403

    def test_invalid_token_rejected(self, client):
        response = client.post(
            "/chat",
            json={"message": "Hello"},
            headers={"Authorization": "Bearer invalid.token.here"},
        )
        assert response.status_code == 401

    def test_empty_message_rejected(self, client):
        token = _get_token(client, "empty@example.com")
        response = client.post(
            "/chat", json={"message": "   "}, headers=_auth(token)
        )
        assert response.status_code == 422


# ===========================================================================
# SECTION 4: Sentiment Analysis
# ===========================================================================
class TestSentimentService:
    """Unit tests on sentiment_service.get_mood directly."""

    def test_positive_sentiment(self):
        from app.services.sentiment_service import get_mood
        assert get_mood("I am so happy and grateful today!") == "Positive"

    def test_negative_sentiment(self):
        from app.services.sentiment_service import get_mood
        assert get_mood("I feel terrible, everything is awful and horrible.") == "Negative"

    def test_neutral_sentiment(self):
        from app.services.sentiment_service import get_mood
        result = get_mood("The meeting is at 3pm on Tuesday.")
        assert result == "Neutral"
