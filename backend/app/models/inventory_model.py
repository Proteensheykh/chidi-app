"""
Inventory models for the CHIDI application.
"""
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class ProductVariantOptionBase(BaseModel):
    """Base ProductVariantOption model with common fields."""
    value: str


class ProductVariantOptionCreate(ProductVariantOptionBase):
    """ProductVariantOption model for creation."""
    variant_id: str


class ProductVariantOptionUpdate(BaseModel):
    """ProductVariantOption model for updates."""
    value: Optional[str] = None


class ProductVariantOptionInDB(ProductVariantOptionBase):
    """ProductVariantOption model with DB fields."""
    id: str
    variant_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class ProductVariantOption(ProductVariantOptionInDB):
    """Complete ProductVariantOption model."""
    pass


class InventoryItemBase(BaseModel):
    """Base InventoryItem model with common fields."""
    sku: str
    price: float
    sale_price: Optional[float] = None
    stock_quantity: int = 0
    low_stock_threshold: int = 5
    barcode: Optional[str] = None
    weight: Optional[float] = None
    dimensions: Optional[str] = None
    is_active: bool = True


class InventoryItemCreate(InventoryItemBase):
    """InventoryItem model for creation."""
    product_id: str
    variant_option_ids: Optional[List[str]] = None


class InventoryItemUpdate(BaseModel):
    """InventoryItem model for updates."""
    price: Optional[float] = None
    sale_price: Optional[float] = None
    stock_quantity: Optional[int] = None
    low_stock_threshold: Optional[int] = None
    barcode: Optional[str] = None
    weight: Optional[float] = None
    dimensions: Optional[str] = None
    is_active: Optional[bool] = None
    variant_option_ids: Optional[List[str]] = None


class InventoryItemInDB(InventoryItemBase):
    """InventoryItem model with DB fields."""
    id: str
    product_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class InventoryItem(InventoryItemInDB):
    """Complete InventoryItem model."""
    variant_options: Optional[List[ProductVariantOption]] = None
