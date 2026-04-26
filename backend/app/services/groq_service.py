"""
groq_service.py
===============
Manages all communication with the Groq API.

Context window: The last 20 messages from chat_history are fetched and
included in the conversation payload so MindMate feels like a continuous
companion rather than a stateless bot.
"""

from typing import List

from groq import Groq
from sqlalchemy.orm import Session

from app.config import settings
from app.models.chat import ChatHistory
from app.models.user import User  # <-- Import User model to read preferences

CONTEXT_WINDOW = 6 # Number of previous messages to include as context

_client = Groq(api_key=settings.GROQ_API_KEY)


# ─── ADDED session_id HERE ──────────────────────────────────────────────────
def _build_messages(db: Session, user_id: int, session_id: int, new_message: str) -> List[dict]:
# ────────────────────────────────────────────────────────────────────────────
    """Build the OpenAI-compatible messages list for the Groq API call.

    Fetches the last CONTEXT_WINDOW messages for this user from the DB and
    prepends a DYNAMIC system prompt based on their settings.
    """
    # 1. FETCH USER SETTINGS
    user = db.query(User).filter(User.id == user_id).first()
    
    # Safely get the name and tone (fallback to defaults if missing)
    first_name = user.first_name if user and user.first_name else "friend"
    tone_setting = user.companion_tone if user and user.companion_tone else "Empathetic"

    # 2. BUILD DYNAMIC SYSTEM PROMPT
    base_prompt = (
        f"You are MindMate, a private AI mental health companion. "
        f"You are talking to {first_name}. Use their name naturally occasionally. "
        "NEVER give medical advice. "
        "Respond empathetically, naturally, and warmly. "
        "\n\n--- EMERGENCY PROTOCOL --- "
        "1. If the user expresses a clear, dangerous intent to commit suicide, self-harm, or overdose, you MUST begin your response exactly with the token: [CRISIS_DETECTED]. "
        "2. PERSISTENT CRISIS: If the user expressed severe self-harm or suicidal intent EARLIER in this conversation, you MUST NOT let them change the subject. You MUST continue to output the [CRISIS_DETECTED] token and urge them to seek immediate help, even if they try to ask about the weather or say hello. "
        "3. For ALL safe conversations, normal venting, or initial greetings where NO self-harm has been mentioned, you MUST NOT use the token."
    )

    if tone_setting == "Direct":
        tone_prompt = "You are straightforward, logical, and solution-focused. You are kind but clinical, helping the user break down problems objectively without excessive emotional padding."
    elif tone_setting == "Motivational":
        tone_prompt = "You are energetic, encouraging, and action-oriented. You help the user build momentum, focus on their strengths, and take positive steps forward."
    else:  # Default to Empathetic
        tone_prompt = "You are warm, non-judgmental, and deeply supportive. You validate the user's feelings and help them feel heard."

    full_system_prompt = base_prompt + tone_prompt

    # 3. FETCH HISTORY
    history: List[ChatHistory] = (
        db.query(ChatHistory)
        .filter(
            ChatHistory.user_id == user_id,
            ChatHistory.session_id == session_id # ─── THE MAGIC FIX: ONLY THIS SESSION ───
        )
        .order_by(ChatHistory.timestamp.desc())
        .limit(CONTEXT_WINDOW)
        .all()
    )
    # Reverse so oldest messages come first
    history = list(reversed(history))

    # 4. ASSEMBLE PAYLOAD
    messages = [{"role": "system", "content": full_system_prompt}]

    for entry in history:
        # Note: We skip the background summary prompts so they don't confuse the AI context
        if not entry.message.startswith("Analyze this conversation"):
            role = "assistant" if entry.is_ai_response else "user"
            messages.append({"role": role, "content": entry.message})

    # Append the brand-new user message at the end
    messages.append({"role": "user", "content": new_message})

    return messages

# ─── ADDED session_id HERE ──────────────────────────────────────────────────
def get_response(db: Session, user_id: int, session_id: int, user_message: str) -> str:
# ────────────────────────────────────────────────────────────────────────────
    """Call the Groq API and return the AI reply text."""
    messages = _build_messages(db, user_id, session_id, user_message)

    completion = _client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,  # type: ignore[arg-type]
        temperature=0.7,
        max_tokens=1024,
    )

    reply: str = completion.choices[0].message.content or ""
    return reply.strip()