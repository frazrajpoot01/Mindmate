"""
crisis_service.py
=================
CRITICAL SAFETY LAYER — This module is the FIRST thing executed on every
/chat request. If scan() returns True, the caller MUST return the emergency
response immediately and MUST NOT call the Groq API.

Design principles:
  - Case-insensitive matching (message is lowercased before comparison).
  - Punctuation-normalised: commas, apostrophes, etc. are stripped so
    "I can't do this anymore" and "I cant do this anymore" both match.
  - Substring matching: a keyword appearing anywhere in the sentence triggers.
  - Zero external dependencies — pure Python stdlib so it can never fail due
    to a third-party import error.
"""

import re
import unicodedata
from typing import List

# ---------------------------------------------------------------------------
# Keyword list — extend this list as needed; never remove entries.
# ---------------------------------------------------------------------------
CRISIS_KEYWORDS: List[str] = [
    "suicide",
    "suicidal",
    "kill myself",
    "killing myself",
    "want to die",
    "wanna die",
    "end it all",
    "end my life",
    "take my life",
    "i can't do this anymore",
    "i cant do this anymore",
    "i cannot do this anymore",
    "life isn't worth living",
    "life is not worth living",
    "don't want to live",
    "dont want to live",
    "no reason to live",
    "not worth living",
    "harm myself",
    "self harm",
    "self-harm",
    "hurt myself",
    "slit my wrists",
    "overdose",
    "jump off",
    "hang myself",
    "hanging myself",
    "shoot myself",
    "die alone",
    "better off dead",
    "better off without me",
    "no point in living",
    "give up on life",
    "can't go on",
    "cant go on",
    "nothing to live for",
    "make it all stop",
    "end the pain",
    "i give up",
    "ready to die",
    "want to disappear forever",
    "goodbye forever",
]

# ---------------------------------------------------------------------------
# Emergency response payload — returned verbatim by the /chat router.
# ---------------------------------------------------------------------------
EMERGENCY_RESPONSE = {
    "is_emergency": True,
    "message": (
        "We're deeply concerned about you and we care about your safety. "
        "You are not alone. Please reach out to one of these helplines right now — "
        "they are free, confidential, and available to help you."
    ),
    "helplines": [
        {"name": "Pakistan Mental Health Helpline", "number": "1166"},
        {"name": "Umang Helpline (24/7)", "number": "0317-4288665"},
        {"name": "Rozan Counselling Helpline", "number": "051-2890505"},
        {"name": "Edhi Foundation", "number": "115"},
    ],
    "action": "SHOW_EMERGENCY_PANEL",
}


def _normalise(text: str) -> str:
    """Lower-case, remove accents, collapse whitespace, strip punctuation.

    This ensures 'SuIcIdE', 'suïcide', 'suicide!!!' all match the same keyword.
    """
    # Unicode normalise → decompose accented chars
    text = unicodedata.normalize("NFD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = text.lower()
    # Remove punctuation except spaces (keep spaces so multi-word phrases match)
    text = re.sub(r"[^\w\s]", " ", text)
    # Collapse multiple spaces
    text = re.sub(r"\s+", " ", text).strip()
    return text


def scan(message: str) -> bool:
    """Return True if the message contains any crisis keyword.

    This function is intentionally simple and fast. No ML, no network calls.

    Args:
        message: Raw user message string.

    Returns:
        True  → crisis detected; caller MUST stop and return EMERGENCY_RESPONSE.
        False → message is safe to pass to the AI.
    """
    normalised = _normalise(message)
    for keyword in CRISIS_KEYWORDS:
        # Normalise the keyword too (handles apostrophes in the list itself)
        if _normalise(keyword) in normalised:
            return True
    return False
