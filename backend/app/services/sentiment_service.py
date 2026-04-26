"""
sentiment_service.py
====================
Uses TextBlob's polarity score to categorise user messages into:
  - Positive  (polarity > 0.1)
  - Negative  (polarity < -0.1)
  - Neutral   (-0.1 <= polarity <= 0.1)

This runs on every user message in /chat and the result is stored in
chat_history.mood for mood trend analysis.
"""

from textblob import TextBlob


def get_mood(text: str) -> str:
    """Analyse text sentiment and return a mood label.

    Args:
        text: User message string.

    Returns:
        One of "Positive", "Negative", or "Neutral".
    """
    blob = TextBlob(text)
    polarity: float = blob.sentiment.polarity  # type: ignore[attr-defined]

    if polarity > 0.1:
        return "Positive"
    elif polarity < -0.1:
        return "Negative"
    else:
        return "Neutral"
