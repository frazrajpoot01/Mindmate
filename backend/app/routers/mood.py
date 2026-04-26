from datetime import date, timedelta
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.mood import MoodLog
from app.models.user import User
from app.schemas.mood import MoodHistoryResponse, MoodLogEntry, MoodLogRequest

router = APIRouter(tags=["Mood Tracking"])

VALID_MOODS = {"Positive", "Negative", "Neutral"}


@router.post("/save-mood", status_code=status.HTTP_201_CREATED)
def save_mood(
    body: MoodLogRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Manually log a mood for the current user.

    Args:
        body.mood_type: Must be one of Positive | Negative | Neutral.

    Returns:
        Confirmation message and the created log's ID.
    """
    if body.mood_type not in VALID_MOODS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"mood_type must be one of: {', '.join(VALID_MOODS)}",
        )

    log = MoodLog(user_id=current_user.id, mood_type=body.mood_type)
    db.add(log)
    db.commit()
    db.refresh(log)

    return {"message": "Mood logged successfully.", "id": log.id}


@router.get("/get-mood-history", response_model=MoodHistoryResponse)
def get_mood_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return mood logs for the current user over the last 30 days.

    Data isolation: filtered by current_user.id — users cannot access
    each other's mood history.
    """
    since = date.today() - timedelta(days=30)

    logs = (
        db.query(MoodLog)
        .filter(
            MoodLog.user_id == current_user.id,  # strict isolation
            MoodLog.date >= since,
        )
        .order_by(MoodLog.date.asc())
        .all()
    )

    return MoodHistoryResponse(
        mood_logs=[MoodLogEntry.model_validate(log) for log in logs],
        total=len(logs),
    )
