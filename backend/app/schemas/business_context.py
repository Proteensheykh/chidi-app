from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class BusinessProfile(BaseModel):
    """Business profile information extracted from onboarding conversations."""
    name: Optional[str] = Field(None, description="Business name")
    type: Optional[str] = Field(None, description="Business type/industry")
    description: Optional[str] = Field(None, description="Business description")
    employees: Optional[int] = Field(None, description="Number of employees")
    year_founded: Optional[int] = Field(None, description="Year the business was founded")
    target_audience: Optional[str] = Field(None, description="Target audience (B2B, B2C, Both)")
    products_services: Optional[List[str]] = Field(None, description="Products or services offered")
    key_challenges: Optional[List[str]] = Field(None, description="Key business challenges")
    goals: Optional[List[str]] = Field(None, description="Business goals")
    unique_selling_points: Optional[List[str]] = Field(None, description="Unique selling points")
    competitors: Optional[List[str]] = Field(None, description="Known competitors")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class BusinessContext(BaseModel):
    """Complete business context including profile and extracted insights."""
    business_id: str = Field(..., description="Business ID")
    profile: BusinessProfile = Field(default_factory=BusinessProfile, description="Business profile information")
    keywords: List[str] = Field(default_factory=list, description="Keywords extracted from business context")
    insights: Dict[str, Any] = Field(default_factory=dict, description="AI-generated insights about the business")
    recommendations: List[str] = Field(default_factory=list, description="AI-generated recommendations")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ContextExtractionRequest(BaseModel):
    """Request for extracting business context from onboarding data."""
    business_id: str
    onboarding_data: Dict[str, Any]
    conversation_history: List[Dict[str, Any]]


class ContextExtractionResponse(BaseModel):
    """Response with extracted business context."""
    business_id: str
    context: BusinessContext
    extraction_timestamp: datetime = Field(default_factory=datetime.utcnow)
