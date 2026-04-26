from sqlalchemy import Column, Integer, Text, Boolean, DateTime, String, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # AI-generated metadata for the Journal
    title = Column(String(255), default="New Conversation")
    summary = Column(Text, default="")
    primary_mood = Column(String(50), default="Neutral")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    is_closed = Column(Boolean, default=False)

    # Relationship to fetch all messages in this session easily
    messages = relationship("ChatHistory", back_populates="session", cascade="all, delete-orphan")


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # NEW: Link this message to a specific session
    session_id = Column(Integer, ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    
    message = Column(Text, nullable=False)
    is_ai_response = Column(Boolean, default=False, nullable=False)
    
    # Positive | Negative | Neutral | None (AI responses have no mood tag)
    mood = Column(String(50), nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship back to the session
    session = relationship("ChatSession", back_populates="messages")