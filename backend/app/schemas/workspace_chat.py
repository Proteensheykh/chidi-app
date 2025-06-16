from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID, uuid4

from app.schemas.business_context import BusinessContext


class ChatMessage(BaseModel):
    """Schema for a chat message in workspace conversations."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    content: str = Field(..., description="Message content")
    sender: str = Field(..., description="Message sender (user or assistant)")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    message_type: str = Field(default="text", description="Message type (text, rich_text, etc.)")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional message metadata")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "msg_123456",
                "content": "How can I improve my customer acquisition strategy?",
                "sender": "user",
                "timestamp": "2025-06-13T16:45:54",
                "message_type": "text",
                "metadata": {}
            }
        }


class ChatContext(BaseModel):
    """Schema for context associated with a chat message."""
    business_context: Optional[BusinessContext] = Field(None, description="Business context")
    knowledge_items: List[Dict[str, Any]] = Field(default_factory=list, description="Knowledge items")
    related_messages: List[str] = Field(default_factory=list, description="IDs of related messages")
    
    class Config:
        json_schema_extra = {
            "example": {
                "business_context": {
                    "business_id": "b12345",
                    "profile": {
                        "name": "Acme Corp",
                        "type": "Technology"
                    },
                    "keywords": ["AI", "Technology"]
                },
                "knowledge_items": [
                    {"id": "k1", "title": "Marketing Strategy", "content": "..."}
                ],
                "related_messages": ["msg_111", "msg_222"]
            }
        }


class ChatConversation(BaseModel):
    """Schema for a workspace chat conversation."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    title: str = Field(..., description="Conversation title")
    business_id: str = Field(..., description="Associated business ID")
    user_id: str = Field(..., description="User ID who owns the conversation")
    messages: List[ChatMessage] = Field(default_factory=list, description="Conversation messages")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional conversation metadata")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "conv_123456",
                "title": "Marketing Strategy Discussion",
                "business_id": "b12345",
                "user_id": "u67890",
                "messages": [
                    {
                        "id": "msg_123456",
                        "content": "How can I improve my customer acquisition strategy?",
                        "sender": "user",
                        "timestamp": "2025-06-13T16:45:54",
                        "message_type": "text",
                        "metadata": {}
                    }
                ],
                "created_at": "2025-06-13T16:45:54",
                "updated_at": "2025-06-13T16:45:54",
                "metadata": {}
            }
        }


class ChatMessageRequest(BaseModel):
    """Schema for a chat message request."""
    content: str = Field(..., description="Message content")
    conversation_id: str = Field(..., description="Conversation ID")
    message_type: str = Field(default="text", description="Message type (text, rich_text, etc.)")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional message metadata")
    
    class Config:
        json_schema_extra = {
            "example": {
                "content": "How can I improve my customer acquisition strategy?",
                "conversation_id": "conv_123456",
                "message_type": "text",
                "metadata": {}
            }
        }


class ChatMessageResponse(BaseModel):
    """Schema for a chat message response."""
    message: ChatMessage = Field(..., description="The created message")
    context: Optional[ChatContext] = Field(None, description="Context used for the response")
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": {
                    "id": "msg_123456",
                    "content": "Based on your business profile, I recommend focusing on digital marketing channels...",
                    "sender": "assistant",
                    "timestamp": "2025-06-13T16:46:12",
                    "message_type": "text",
                    "metadata": {}
                },
                "context": {
                    "business_context": {
                        "business_id": "b12345",
                        "profile": {
                            "name": "Acme Corp",
                            "type": "Technology"
                        }
                    },
                    "knowledge_items": [],
                    "related_messages": []
                }
            }
        }


class CreateConversationRequest(BaseModel):
    """Schema for creating a new conversation."""
    title: str = Field(..., description="Conversation title")
    business_id: str = Field(..., description="Associated business ID")
    initial_message: Optional[str] = Field(None, description="Optional initial message")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional conversation metadata")
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "Marketing Strategy Discussion",
                "business_id": "b12345",
                "initial_message": "Let's discuss marketing strategies for my business",
                "metadata": {"category": "marketing"}
            }
        }


class ConversationListResponse(BaseModel):
    """Schema for listing conversations."""
    conversations: List[ChatConversation] = Field(..., description="List of conversations")
    total: int = Field(..., description="Total number of conversations")
    page: int = Field(1, description="Current page number")
    page_size: int = Field(10, description="Number of items per page")
    
    class Config:
        json_schema_extra = {
            "example": {
                "conversations": [
                    {
                        "id": "conv_123456",
                        "title": "Marketing Strategy Discussion",
                        "business_id": "b12345",
                        "user_id": "u67890",
                        "messages": [],
                        "created_at": "2025-06-13T16:45:54",
                        "updated_at": "2025-06-13T16:45:54",
                        "metadata": {}
                    }
                ],
                "total": 1,
                "page": 1,
                "page_size": 10
            }
        }
