from fastapi import APIRouter, Depends, HTTPException, status, Body
from typing import Any, List

from app.core.auth import get_current_user
from app.schemas.user import User
from app.schemas.business_context import BusinessContext, ContextExtractionRequest, ContextExtractionResponse
from app.services.context_extraction_service import extract_business_context
from app.schemas.onboarding import OnboardingState

router = APIRouter()


@router.post("/extract", response_model=ContextExtractionResponse, 
          summary="Extract Business Context",
          description="Extract structured business context from onboarding data")
async def extract_context(
    request: ContextExtractionRequest = Body(
        ...,
        example={
            "business_id": "b12345",
            "onboarding_data": {
                "name": "Acme Corp",
                "type": "Technology",
                "description": "AI-powered business solutions"
            },
            "conversation_history": [
                {"role": "user", "content": "I'm starting a tech company"},
                {"role": "assistant", "content": "What kind of tech products will you offer?"}
            ]
        }
    ),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Extract business context from onboarding data.
    
    - **business_id**: ID of the business to extract context for
    - **onboarding_data**: Business data collected during onboarding
    - **conversation_history**: Conversation history from onboarding
    
    Returns the extracted business context.
    """
    # Create an OnboardingState from the request data
    onboarding_state = OnboardingState(
        currentStep=5,  # Assume onboarding is complete
        businessData=request.onboarding_data,
        conversationHistory=[]  # We'll populate this from the request
    )
    
    # Extract business context
    context = await extract_business_context(request.business_id, onboarding_state)
    
    # Create and return the response
    return ContextExtractionResponse(
        business_id=request.business_id,
        context=context
    )


@router.get("/{business_id}", response_model=BusinessContext,
         summary="Get Business Context",
         description="Get stored business context for a specific business")
async def get_business_context(
    business_id: str,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get business context for a specific business.
    
    - **business_id**: ID of the business to get context for
    
    Returns the business context if found.
    Raises 404 if business context not found or 403 if user doesn't have access.
    """
    # In a real implementation, we would retrieve the context from the database
    # For now, return a placeholder
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Business context retrieval not yet implemented"
    )


@router.put("/{business_id}", response_model=BusinessContext,
         summary="Update Business Context",
         description="Update business context for a specific business")
async def update_business_context(
    business_id: str,
    context: BusinessContext = Body(
        ...,
        example={
            "business_id": "b12345",
            "profile": {
                "name": "Acme Corp",
                "type": "Technology",
                "description": "AI-powered business solutions"
            },
            "keywords": ["AI", "Technology", "Business Solutions"],
            "insights": {
                "market_positioning": "Premium AI solutions provider"
            },
            "recommendations": [
                "Focus on enterprise clients",
                "Develop specialized AI solutions"
            ]
        }
    ),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update business context for a specific business.
    
    - **business_id**: ID of the business to update context for
    - **context**: Updated business context
    
    Returns the updated business context.
    Raises 404 if business context not found or 403 if user doesn't have access.
    """
    # In a real implementation, we would update the context in the database
    # For now, return a placeholder
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Business context update not yet implemented"
    )
