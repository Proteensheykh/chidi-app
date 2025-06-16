from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Any, List, Optional

from app.core.auth import get_current_user
from app.schemas.user import User
from app.services.user_profile_service import (
    get_user_businesses,
    get_user_conversations,
    get_user_preferences
)
from app.services.business_context_service import get_business_context
from app.services.workspace_chat_service import get_conversation

router = APIRouter()


@router.get("/context", 
         summary="Get Sidebar Context",
         description="Get all context data for the sidebar including businesses, conversations, and preferences")
async def get_sidebar_context(
    business_id: Optional[str] = Query(None, description="Filter by business ID"),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get all context data for the sidebar.
    
    - **business_id**: Optional business ID to filter conversations by
    
    Returns a dictionary with businesses, conversations, and user preferences.
    """
    # Get user businesses
    businesses = await get_user_businesses(current_user.id)
    
    # Get user conversations
    conversations = await get_user_conversations(current_user.id, business_id)
    
    # Get user preferences
    preferences = await get_user_preferences(current_user.id)
    
    # Return combined context
    return {
        "businesses": businesses,
        "conversations": conversations,
        "preferences": preferences
    }


@router.get("/businesses", 
         summary="Get User Businesses",
         description="Get businesses associated with the current user")
async def get_user_businesses_endpoint(
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get businesses associated with the current user.
    
    Returns a list of businesses.
    """
    businesses = await get_user_businesses(current_user.id)
    return {"businesses": businesses}


@router.get("/conversations", 
         summary="Get User Conversations",
         description="Get conversations associated with the current user")
async def get_user_conversations_endpoint(
    business_id: Optional[str] = Query(None, description="Filter by business ID"),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get conversations associated with the current user.
    
    - **business_id**: Optional business ID to filter conversations by
    
    Returns a list of conversations.
    """
    conversations = await get_user_conversations(current_user.id, business_id)
    return {"conversations": conversations}


@router.get("/preferences", 
         summary="Get User Preferences",
         description="Get preferences for the current user")
async def get_user_preferences_endpoint(
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get preferences for the current user.
    
    Returns a dictionary of user preferences.
    """
    preferences = await get_user_preferences(current_user.id)
    return {"preferences": preferences}


@router.get("/business-context/{business_id}", 
         summary="Get Business Context",
         description="Get business context for a specific business")
async def get_business_context_endpoint(
    business_id: str,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get business context for a specific business.
    
    - **business_id**: ID of the business to get context for
    
    Returns the business context if found.
    Raises 404 if business context not found.
    """
    context = await get_business_context(business_id)
    
    if not context:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Business context not found for business ID: {business_id}"
        )
    
    return {"context": context}


@router.get("/conversation/{conversation_id}", 
         summary="Get Conversation",
         description="Get a specific conversation")
async def get_conversation_endpoint(
    conversation_id: str,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get a specific conversation.
    
    - **conversation_id**: ID of the conversation to get
    
    Returns the conversation if found.
    Raises 404 if conversation not found.
    """
    conversation = await get_conversation(conversation_id, current_user.id)
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation not found with ID: {conversation_id}"
        )
    
    return {"conversation": conversation}
