from typing import Optional, List
from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str


class HelplineInfo(BaseModel):
    name: str
    number: str


class EmergencyResponse(BaseModel):
    is_emergency: bool = True
    message: str
    helplines: List[HelplineInfo]
    action: str = "SHOW_EMERGENCY_PANEL"


class ChatResponse(BaseModel):
    is_emergency: bool = False
    reply: str
    mood: Optional[str] = None  # Positive | Negative | Neutral
