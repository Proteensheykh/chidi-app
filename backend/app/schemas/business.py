from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

# Shared properties
class BusinessBase(BaseModel):
    name: str
    industry: Optional[str] = None
    description: Optional[str] = None

# Properties to receive via API on creation
class BusinessCreate(BusinessBase):
    pass

# Properties to receive via API on update
class BusinessUpdate(BusinessBase):
    name: Optional[str] = None

# Properties shared by models stored in DB
class BusinessInDBBase(BusinessBase):
    id: str
    owner_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Additional properties to return via API
class Business(BusinessInDBBase):
    pass
