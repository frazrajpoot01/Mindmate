import datetime

from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import mapped_column
from app.database import Base


class MoodLog(Base):
    __tablename__ = "mood_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    mood_type = Column(String(10), nullable=False)  # Positive | Negative | Neutral
    date = Column(Date, default=datetime.date.today)
    
    # ─── ADDED COLUMN FOR AI TRACKING ───────────────────────────
    note = Column(String, nullable=True)
    # ────────────────────────────────────────────────────────────