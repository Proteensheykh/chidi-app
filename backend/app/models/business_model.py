"""
Business model for the CHIDI application.
"""
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, HttpUrl


class BusinessBase(BaseModel):
    """Base Business model with common fields."""
    name: str
    description: Optional[str] = None
    industry: Optional[str] = None
    logo_url: Optional[HttpUrl] = None
    website_url: Optional[HttpUrl] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    founded_year: Optional[int] = None
    employee_count: Optional[int] = None
    target_audience: Optional[str] = None
    mission_statement: Optional[str] = None
    value_proposition: Optional[str] = None
    is_active: bool = True
    onboarding_completed: bool = False


class BusinessCreate(BusinessBase):
    """Business model for creation."""
    user_id: str


class BusinessUpdate(BaseModel):
    """Business model for updates."""
    name: Optional[str] = None
    description: Optional[str] = None
    industry: Optional[str] = None
    logo_url: Optional[HttpUrl] = None
    website_url: Optional[HttpUrl] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    founded_year: Optional[int] = None
    employee_count: Optional[int] = None
    target_audience: Optional[str] = None
    mission_statement: Optional[str] = None
    value_proposition: Optional[str] = None
    is_active: Optional[bool] = None
    onboarding_completed: Optional[bool] = None


class BusinessInDB(BusinessBase):
    """Business model with DB fields."""
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class Business(BusinessInDB):
    """Complete Business model."""
    pass


class BusinessContextChunkBase(BaseModel):
    """Base BusinessContextChunk model."""
    business_id: str
    chunk_text: str
    source_field: Optional[str] = None


class BusinessContextChunkCreate(BusinessContextChunkBase):
    """BusinessContextChunk model for creation."""
    pass


class BusinessContextChunkUpdate(BaseModel):
    """BusinessContextChunk model for updates."""
    chunk_text: Optional[str] = None
    source_field: Optional[str] = None


class BusinessContextChunkInDB(BusinessContextChunkBase):
    """BusinessContextChunk model with DB fields."""
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class BusinessContextChunk(BusinessContextChunkInDB):
    """Complete BusinessContextChunk model."""
    pass
