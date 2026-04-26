import json
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.chat import ChatHistory, ChatSession
from app.models.user import User
from app.models import MoodLog  # Ensures we can save the AI detected mood
from app.schemas.chat import ChatRequest, ChatResponse, EmergencyResponse
from app.services import crisis_service, groq_service, sentiment_service

router = APIRouter(tags=["Chat"])

# ─── Schemas ──────────────────────────────────────────────────────────────────

class ChatHistoryMessage(BaseModel):
    id: int
    session_id: int
    message: str
    is_ai_response: bool
    mood: Optional[str] = None

    class Config:
        from_attributes = True

class ChatHistoryResponse(BaseModel):
    messages: List[ChatHistoryMessage]
    total: int


# ─── Background Task ──────────────────────────────────────────────────────────

def generate_session_summary(db: Session, session_id: int, user_id: int):
    """Background task to generate a title, summary, and auto-log mood for a chat session."""
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        return

    messages = (
        db.query(ChatHistory)
        .filter(ChatHistory.session_id == session_id)
        .order_by(ChatHistory.timestamp.asc())
        .all()
    )
    
    # Format chat log for the prompt
    chat_log = "\n".join([f"{'AI' if m.is_ai_response else 'User'}: {m.message}" for m in messages])
    
    prompt = f"""
    Analyze this conversation and provide a JSON response with exactly three keys. Do NOT include markdown formatting or backticks, just raw JSON:
    {{
        "title": "A short, 3 to 5 word title summarizing the chat",
        "summary": "A 2-sentence summary of the user's emotional state and what was discussed",
        "mood": "Choose strictly one: Positive, Neutral, or Negative"
    }}
    
    Conversation:
    {chat_log}
    """
    
    try:
        raw_response = groq_service._client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=200,
        ).choices[0].message.content or ""
        
        clean_json = raw_response.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        data = json.loads(clean_json)
        
        # 1. Update the chat session for the Journal Archive
        session.title = data.get("title", session.title)
        session.summary = data.get("summary", session.summary)
        session.primary_mood = data.get("mood", session.primary_mood)
        
        # 2. SILENT AUTO-LOG TO MOOD DASHBOARD
        ai_detected_mood = data.get("mood")
        
        if ai_detected_mood:
            hidden_tag = f"[Auto-Session-{session_id}]"
            
            # Check if we already logged a mood for this specific chat
            existing_log = db.query(MoodLog).filter(
                MoodLog.user_id == user_id,
                MoodLog.note.like(f"%{hidden_tag}%")
            ).first()

            if existing_log:
                # Update the existing log if the AI changed its mind
                existing_log.mood_type = ai_detected_mood 
            else:
                # Create a brand new entry for the dashboard
                new_mood_log = MoodLog(
                    user_id=user_id,
                    mood_type=ai_detected_mood, 
                    note=hidden_tag 
                )
                db.add(new_mood_log)

        db.commit()
    except Exception as e:
        print(f"Background summarization failed for session {session_id}: {e}")


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/journal")
def get_journal_archive(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Returns a list of all chat sessions for the React Journal Archive page."""
    sessions = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == current_user.id,ChatSession.title != "[CRISIS_LOG]")
        .order_by(ChatSession.updated_at.desc())
        .all()
    )
    
    result = []
    for s in sessions:
        raw_date = None
        if s.updated_at:
            raw_date = s.updated_at.isoformat()
            if not raw_date.endswith("Z") and "+" not in raw_date:
                raw_date += "Z"

        result.append({
            "id": s.id,
            "session_id": s.id,
            "date": raw_date,
            "mood": s.primary_mood,
            "title": s.title,
            "summary": s.summary
        })
        
    return {"logs": result}


@router.get("/chat-history", response_model=ChatHistoryResponse)
def get_chat_history(
    session_id: Optional[int] = None,
    limit: int = Query(default=50, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return chat messages. If no session_id is provided, returns ONLY the active, unclosed session."""
    
    # 1. If React didn't ask for a specific old session, find the active one.
    if not session_id:
        two_hours_ago = datetime.utcnow() - timedelta(hours=2)
        active_session = (
            db.query(ChatSession)
            .filter(
                ChatSession.user_id == current_user.id,
                ChatSession.updated_at >= two_hours_ago,
                ChatSession.is_closed == False # MUST NOT BE CLOSED
            )
            .order_by(ChatSession.updated_at.desc())
            .first()
        )
        
        # Start with a blank screen if no active session exists
        if not active_session:
            return ChatHistoryResponse(messages=[], total=0)
            
        session_id = active_session.id

    # 2. STRICTLY filter messages by the single session ID
    query = db.query(ChatHistory).filter(
        ChatHistory.user_id == current_user.id,
        ChatHistory.session_id == session_id
    )
        
    messages = query.order_by(ChatHistory.timestamp.asc()).limit(limit).all()
    
    return ChatHistoryResponse(
        messages=[ChatHistoryMessage.model_validate(m) for m in messages],
        total=len(messages),
    )


@router.post("/chat")
def chat(
    request: Request,
    body: ChatRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Main chat endpoint with strict Session Management and Lock Verification."""
    message = body.message.strip()
    if not message:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Message cannot be empty.",
        )

    # 1. FIND OR CREATE ACTIVE SESSION (RESPECTING THE LOCK)
    two_hours_ago = datetime.utcnow() - timedelta(hours=2)
    active_session = (
        db.query(ChatSession)
        .filter(
            ChatSession.user_id == current_user.id,
            ChatSession.updated_at >= two_hours_ago,
            ChatSession.is_closed == False  
        )
        .order_by(ChatSession.updated_at.desc())
        .first()
    )

    if not active_session:
        active_session = ChatSession(user_id=current_user.id)
        db.add(active_session)
        db.commit()
        db.refresh(active_session)

    # 2. SENTIMENT ANALYSIS
    mood_tag = sentiment_service.get_mood(message)

    # 3. PERSIST USER MESSAGE (MUST HAPPEN BEFORE CRISIS SCAN)
    user_entry = ChatHistory(
        user_id=current_user.id,
        session_id=active_session.id,
        message=message,
        is_ai_response=False,
        mood=mood_tag,
    )
    db.add(user_entry)
    
    # Update the session's last active time right away
    active_session.updated_at = datetime.utcnow()
    db.commit()

    # 4. CRISIS SCAN (LAYER 1)
    if crisis_service.scan(message):
        active_session.title = "[CRISIS_LOG]" # <--- SECRETLY FLAG IT
        db.commit()
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=crisis_service.EMERGENCY_RESPONSE,
        )

    # 5. CALL GROQ API
    try:
        # Pass active_session.id to isolate Groq memory
        ai_reply = groq_service.get_response(db, current_user.id, active_session.id, message)
    except Exception as exc:
        print(f"🚨 CRITICAL AI ERROR: {exc}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI service temporarily unavailable: {exc}",
        )
        
    # ─── NEW: LAYER 2 AI CRISIS DETECTION ───
    if ai_reply.strip().startswith("[CRISIS_DETECTED]"):
        active_session.title = "[CRISIS_LOG]" # <--- SECRETLY FLAG IT
        db.commit()
        # The AI caught a hidden self-harm intent!
        # Return the red emergency screen instantly, and do NOT save the AI's text.
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=crisis_service.EMERGENCY_RESPONSE,
        )
    # ────────────────────────────────────────   

    # 6. PERSIST AI RESPONSE
    ai_entry = ChatHistory(
        user_id=current_user.id,
        session_id=active_session.id,
        message=ai_reply,
        is_ai_response=True,
        mood=None, 
    )
    db.add(ai_entry)
    db.commit()

    # 7. BACKGROUND SUMMARIZATION
    message_count = db.query(ChatHistory).filter(ChatHistory.session_id == active_session.id).count()
    if message_count > 0 and message_count % 4 == 0:
        background_tasks.add_task(generate_session_summary, db, active_session.id, current_user.id)

    # 8. RETURN
    return ChatResponse(is_emergency=False, reply=ai_reply, mood=mood_tag)


# ─── Soft Close Chat Session ─────────────────────────────────────────────

@router.delete("/chat/clear")
def clear_active_chat(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Ends the current active chat session.
    It does NOT delete data. It just archives it to the Journal 
    and forces the next message to start a brand new session.
    """
    
    two_hours_ago = datetime.utcnow() - timedelta(hours=2)
    active_session = (
        db.query(ChatSession)
        .filter(
            ChatSession.user_id == current_user.id,
            ChatSession.updated_at >= two_hours_ago,
            ChatSession.is_closed == False
        )
        .order_by(ChatSession.updated_at.desc())
        .first()
    )

    if active_session:
        # Close the session securely
        active_session.is_closed = True
        db.commit()

    return {"message": "Session securely closed and archived."}