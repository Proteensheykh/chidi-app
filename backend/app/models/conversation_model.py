"""
Conversation and Message models for the CHIDI application.
"""
from typing import List, Optional
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field


class ConversationStatus(str, Enum):
    """Enum for conversation status."""
    NEW = "NEW"
    ACTIVE_AI = "ACTIVE_AI"
    ACTIVE_HUMAN = "ACTIVE_HUMAN"
    WAITING_CUSTOMER = "WAITING_CUSTOMER"
    ESCALATED_HUMAN_NEEDED = "ESCALATED_HUMAN_NEEDED"
    RESOLVED_BY_AI = "RESOLVED_BY_AI"
    RESOLVED_BY_HUMAN = "RESOLVED_BY_HUMAN"
    CLOSED = "CLOSED"


class MessageSenderType(str, Enum):
    """Enum for message sender types."""
    CUSTOMER = "CUSTOMER"
    AI_BOT = "AI_BOT"
    BUSINESS_HUMAN = "BUSINESS_HUMAN"


class ConversationBase(BaseModel):
    """Base Conversation model with common fields."""
    title: str
    status: ConversationStatus = ConversationStatus.NEW
    platform_conversation_id: Optional[str] = None


class ConversationCreate(ConversationBase):
    """Conversation model for creation."""
    user_id: str
    business_id: Optional[str] = None


class ConversationUpdate(BaseModel):
    """Conversation model for updates."""
    title: Optional[str] = None
    status: Optional[ConversationStatus] = None
    platform_conversation_id: Optional[str] = None


class ConversationInDB(ConversationBase):
    """Conversation model with DB fields."""
    id: str
    user_id: str
    business_id: Optional[str] = None
    last_message_at: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class Conversation(ConversationInDB):
    """Complete Conversation model."""
    pass


class MessageBase(BaseModel):
    """Base Message model with common fields."""
    content: str
    role: str  # "user", "assistant", "system"
    sender_type: MessageSenderType
    platform_message_id: Optional[str] = None


class MessageCreate(MessageBase):
    """Message model for creation."""
    conversation_id: str
    user_id: Optional[str] = None


class MessageUpdate(BaseModel):
    """Message model for updates."""
    content: Optional[str] = None
    role: Optional[str] = None
    sender_type: Optional[MessageSenderType] = None
    platform_message_id: Optional[str] = None


class MessageInDB(MessageBase):
    """Message model with DB fields."""
    id: str
    conversation_id: str
    user_id: Optional[str] = None
    created_at: datetime

    class Config:
        orm_mode = True


class Message(MessageInDB):
    """Complete Message model."""
    pass
