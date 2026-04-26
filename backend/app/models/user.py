from sqlalchemy import Column, Integer, String, DateTime, func, Boolean
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    
    # ─── ADDED COLUMNS ──────────────────────────────────────────
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    companion_tone = Column(String, default="Empathetic", nullable=True)
    notifications = Column(Boolean, default=True)
    # ────────────────────────────────────────────────────────────

    created_at = Column(DateTime(timezone=True), server_default=func.now())