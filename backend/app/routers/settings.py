from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.chat import ChatHistory, ChatSession
from app.models import MoodLog

router = APIRouter(prefix="/settings", tags=["Settings"])

# ─── Schemas ───────────────────────────────────────────
class ProfileUpdate(BaseModel):
    first_name: str
    last_name: str
    companion_tone: str
    notifications: bool

# ─── Endpoints ─────────────────────────────────────────
@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user)):
    """Fetch the user's current settings."""
    return {
        "email": current_user.email,
        "first_name": current_user.first_name or "",
        "last_name": current_user.last_name or "",
        "companion_tone": current_user.companion_tone or "Empathetic",
        "notifications": current_user.notifications if current_user.notifications is not None else True
    }

@router.put("/profile")
def update_profile(body: ProfileUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Update the user's names and AI tone."""
    current_user.first_name = body.first_name
    current_user.last_name = body.last_name
    current_user.companion_tone = body.companion_tone
    current_user.notifications = body.notifications
    db.commit()
    return {"message": "Profile updated successfully"}

@router.get("/export")
def export_data(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Gathers all chat history and formats it as a downloadable JSON file."""
    sessions = db.query(ChatSession).filter(ChatSession.user_id == current_user.id).all()
    export_data = []
    
    for s in sessions:
        messages = db.query(ChatHistory).filter(ChatHistory.session_id == s.id).order_by(ChatHistory.timestamp).all()
        export_data.append({
            "session_id": s.id,
            "title": s.title,
            "date": s.created_at.isoformat() if s.created_at else None,
            "mood": s.primary_mood,
            "messages": [{"sender": "AI" if m.is_ai_response else "User", "text": m.message, "time": m.timestamp.isoformat()} for m in messages]
        })
        
    return JSONResponse(content={"user_email": current_user.email, "chat_history": export_data})

@router.delete("/account")
def delete_account(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Permanently deletes the user and all their data."""
    # 1. Delete all related data first to prevent database foreign-key errors
    db.query(MoodLog).filter(MoodLog.user_id == current_user.id).delete()
    db.query(ChatHistory).filter(ChatHistory.user_id == current_user.id).delete()
    db.query(ChatSession).filter(ChatSession.user_id == current_user.id).delete()
    
    # 2. Delete the user
    db.query(User).filter(User.id == current_user.id).delete()
    db.commit()
    return {"message": "Account permanently deleted"}