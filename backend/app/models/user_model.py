"""
User model for the CHIDI application.
"""
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """Base User model with common fields."""
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    phone_number: Optional[str] = None
    is_active: bool = True


class UserCreate(UserBase):
    """User model for creation."""
    supabase_auth_id: Optional[str] = None


class UserUpdate(BaseModel):
    """User model for updates."""
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    phone_number: Optional[str] = None
    is_active: Optional[bool] = None
    last_login_at: Optional[datetime] = None


class UserInDB(UserBase):
    """User model with DB fields."""
    id: str
    supabase_auth_id: Optional[str] = None
    last_login_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class User(UserInDB):
    """Complete User model."""
    pass
