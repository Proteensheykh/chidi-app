from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class OnboardingData(BaseModel):
    business_name: str
    industry: str
    description: str
    target_audience: Optional[str] = None
    goals: Optional[List[str]] = None
    products: Optional[List[Dict[str, Any]]] = None
    
    class Config:
        from_attributes = True

class WorkspaceChat(BaseModel):
    id: str
    user_id: str
    messages: List[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class WorkspaceChatCreate(BaseModel):
    initial_message: Optional[str] = None

class KnowledgeItem(BaseModel):
    id: str
    user_id: str
    business_id: Optional[str] = None
    title: str
    content: str
    source: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class KnowledgeItemCreate(BaseModel):
    title: str
    content: str
    business_id: Optional[str] = None
    source: Optional[str] = None
