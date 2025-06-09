"""
AI Response Log model for the CHIDI application.
"""
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class AIResponseLogBase(BaseModel):
    """Base AIResponseLog model with common fields."""
    message_id: Optional[str] = None  # Optional reference to the message
    prompt_sent: str
    raw_response: str
    processed_response: Optional[str] = None
    detected_intent: Optional[str] = None
    confidence_score: Optional[float] = None
    processing_time_ms: Optional[int] = None
    action_taken: Optional[str] = None
    error_occurred: bool = False
    error_message: Optional[str] = None


class AIResponseLogCreate(AIResponseLogBase):
    """AIResponseLog model for creation."""
    pass


class AIResponseLogUpdate(BaseModel):
    """AIResponseLog model for updates."""
    processed_response: Optional[str] = None
    detected_intent: Optional[str] = None
    confidence_score: Optional[float] = None
    processing_time_ms: Optional[int] = None
    action_taken: Optional[str] = None
    error_occurred: Optional[bool] = None
    error_message: Optional[str] = None


class AIResponseLogInDB(AIResponseLogBase):
    """AIResponseLog model with DB fields."""
    id: str
    created_at: datetime

    class Config:
        orm_mode = True


class AIResponseLog(AIResponseLogInDB):
    """Complete AIResponseLog model."""
    pass
