"""
Vector Embedding models for the CHIDI application.
"""
from typing import List, Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field


class BusinessContextEmbeddingBase(BaseModel):
    """Base BusinessContextEmbedding model with common fields."""
    vector: List[float] = Field(..., description="OpenAI embedding vector with 1536 dimensions")


class BusinessContextEmbeddingCreate(BusinessContextEmbeddingBase):
    """BusinessContextEmbedding model for creation."""
    chunk_id: str


class BusinessContextEmbeddingUpdate(BaseModel):
    """BusinessContextEmbedding model for updates."""
    vector: Optional[List[float]] = None


class BusinessContextEmbeddingInDB(BusinessContextEmbeddingBase):
    """BusinessContextEmbedding model with DB fields."""
    id: str
    chunk_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class BusinessContextEmbedding(BusinessContextEmbeddingInDB):
    """Complete BusinessContextEmbedding model."""
    pass


class VectorSearchResult(BaseModel):
    """Model for vector similarity search results."""
    id: str
    content: str
    similarity: float
    metadata: Optional[dict] = None
