from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

# Message models
class MessageBase(BaseModel):
    content: str
    sender: str  # "user" or "assistant"

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: str
    conversation_id: str
    timestamp: datetime

    class Config:
        from_attributes = True

# Conversation models
class ConversationBase(BaseModel):
    title: Optional[str] = None

class ConversationCreate(ConversationBase):
    pass

class ConversationUpdate(ConversationBase):
    pass

class Conversation(ConversationBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    messages: List[Message] = []

    class Config:
        from_attributes = True
