from datetime import date
from typing import List
from pydantic import BaseModel, ConfigDict


class MoodLogRequest(BaseModel):
    mood_type: str  # Positive | Negative | Neutral


class MoodLogEntry(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    mood_type: str
    date: date


class MoodHistoryResponse(BaseModel):
    mood_logs: List[MoodLogEntry]
    total: int

