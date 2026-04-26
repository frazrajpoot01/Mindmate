"""
test_mood.py
============
Tests for /save-mood and /get-mood-history endpoints.
Uses shared client + DB fixtures from conftest.py.
"""

import pytest


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _register_and_login(client, email, password="testpass123"):
    client.post("/auth/signup", json={"email": email, "password": password})
    token = client.post(
        "/auth/login", json={"email": email, "password": password}
    ).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------------------------
# Save Mood
# ---------------------------------------------------------------------------
class TestSaveMood:
    def test_save_positive_mood(self, client):
        headers = _register_and_login(client, "mood1@example.com")
        response = client.post("/save-mood", json={"mood_type": "Positive"}, headers=headers)
        assert response.status_code == 201
        assert response.json()["message"] == "Mood logged successfully."

    def test_save_negative_mood(self, client):
        headers = _register_and_login(client, "mood2@example.com")
        response = client.post("/save-mood", json={"mood_type": "Negative"}, headers=headers)
        assert response.status_code == 201

    def test_save_neutral_mood(self, client):
        headers = _register_and_login(client, "mood3@example.com")
        response = client.post("/save-mood", json={"mood_type": "Neutral"}, headers=headers)
        assert response.status_code == 201

    def test_invalid_mood_type_rejected(self, client):
        headers = _register_and_login(client, "mood4@example.com")
        response = client.post("/save-mood", json={"mood_type": "Excited"}, headers=headers)
        assert response.status_code == 422

    def test_unauthenticated_save_mood_rejected(self, client):
        response = client.post("/save-mood", json={"mood_type": "Positive"})
        assert response.status_code == 403


# ---------------------------------------------------------------------------
# Get Mood History
# ---------------------------------------------------------------------------
class TestGetMoodHistory:
    def test_empty_history(self, client):
        headers = _register_and_login(client, "hist1@example.com")
        response = client.get("/get-mood-history", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert data["mood_logs"] == []

    def test_history_contains_saved_moods(self, client):
        headers = _register_and_login(client, "hist2@example.com")
        client.post("/save-mood", json={"mood_type": "Positive"}, headers=headers)
        client.post("/save-mood", json={"mood_type": "Negative"}, headers=headers)

        response = client.get("/get-mood-history", headers=headers)
        data = response.json()
        assert data["total"] == 2
        moods = [log["mood_type"] for log in data["mood_logs"]]
        assert "Positive" in moods
        assert "Negative" in moods

    def test_unauthenticated_history_rejected(self, client):
        response = client.get("/get-mood-history")
        assert response.status_code == 403

    def test_data_isolation_between_users(self, client):
        """User A's moods must NOT appear in User B's history."""
        headers_a = _register_and_login(client, "userA@example.com")
        headers_b = _register_and_login(client, "userB@example.com")

        # User A saves 3 moods
        for _ in range(3):
            client.post("/save-mood", json={"mood_type": "Positive"}, headers=headers_a)

        # User B has none
        response = client.get("/get-mood-history", headers=headers_b)
        assert response.json()["total"] == 0

    def test_history_response_structure(self, client):
        headers = _register_and_login(client, "struct@example.com")
        client.post("/save-mood", json={"mood_type": "Neutral"}, headers=headers)

        response = client.get("/get-mood-history", headers=headers)
        log = response.json()["mood_logs"][0]
        assert "id" in log
        assert "mood_type" in log
        assert "date" in log
