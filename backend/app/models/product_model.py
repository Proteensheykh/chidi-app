"""
Product model for the CHIDI application.
"""
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, HttpUrl


class ProductBase(BaseModel):
    """Base Product model with common fields."""
    name: str
    description: Optional[str] = None
    base_price: float
    sku: Optional[str] = None
    is_active: bool = True
    image_urls: List[str] = Field(default_factory=list)
    category: Optional[str] = None
    tags: List[str] = Field(default_factory=list)


class ProductCreate(ProductBase):
    """Product model for creation."""
    business_id: str


class ProductUpdate(BaseModel):
    """Product model for updates."""
    name: Optional[str] = None
    description: Optional[str] = None
    base_price: Optional[float] = None
    sku: Optional[str] = None
    is_active: Optional[bool] = None
    image_urls: Optional[List[str]] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None


class ProductInDB(ProductBase):
    """Product model with DB fields."""
    id: str
    business_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class Product(ProductInDB):
    """Complete Product model."""
    pass


class ProductVariantBase(BaseModel):
    """Base ProductVariant model with common fields."""
    name: str
    description: Optional[str] = None


class ProductVariantCreate(ProductVariantBase):
    """ProductVariant model for creation."""
    product_id: str


class ProductVariantUpdate(BaseModel):
    """ProductVariant model for updates."""
    name: Optional[str] = None
    description: Optional[str] = None


class ProductVariantInDB(ProductVariantBase):
    """ProductVariant model with DB fields."""
    id: str
    product_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class ProductVariant(ProductVariantInDB):
    """Complete ProductVariant model."""
    pass
