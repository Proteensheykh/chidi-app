"""
Social Connection model for the CHIDI application.
"""
from typing import List, Optional
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field


class SocialPlatformType(str, Enum):
    """Enum for social platform types."""
    INSTAGRAM = "INSTAGRAM"
    WHATSAPP = "WHATSAPP"
    FACEBOOK = "FACEBOOK"
    TWITTER = "TWITTER"
    OTHER = "OTHER"


class SocialConnectionBase(BaseModel):
    """Base SocialConnection model with common fields."""
    platform: SocialPlatformType
    account_id: str
    account_name: Optional[str] = None
    is_active: bool = True


class SocialConnectionCreate(SocialConnectionBase):
    """SocialConnection model for creation."""
    user_id: str
    business_id: str
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_expires_at: Optional[datetime] = None


class SocialConnectionUpdate(BaseModel):
    """SocialConnection model for updates."""
    account_name: Optional[str] = None
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_expires_at: Optional[datetime] = None
    is_active: Optional[bool] = None


class SocialConnectionInDB(SocialConnectionBase):
    """SocialConnection model with DB fields."""
    id: str
    user_id: str
    business_id: str
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class SocialConnection(SocialConnectionInDB):
    """Complete SocialConnection model."""
    pass
