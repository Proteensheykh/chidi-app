"""
Workspace Chat Message model for the CHIDI application.
"""
from typing import List, Optional
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field


class MessageRole(str, Enum):
    """Enum for message roles."""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class WorkspaceChatMessageBase(BaseModel):
    """Base WorkspaceChatMessage model with common fields."""
    content: str
    role: MessageRole


class WorkspaceChatMessageCreate(WorkspaceChatMessageBase):
    """WorkspaceChatMessage model for creation."""
    user_id: str


class WorkspaceChatMessageUpdate(BaseModel):
    """WorkspaceChatMessage model for updates."""
    content: Optional[str] = None
    role: Optional[MessageRole] = None


class WorkspaceChatMessageInDB(WorkspaceChatMessageBase):
    """WorkspaceChatMessage model with DB fields."""
    id: str
    user_id: str
    created_at: datetime

    class Config:
        orm_mode = True


class WorkspaceChatMessage(WorkspaceChatMessageInDB):
    """Complete WorkspaceChatMessage model."""
    pass
