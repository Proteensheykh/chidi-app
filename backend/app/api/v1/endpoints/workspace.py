from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status, Query
from typing import Any, List, Dict, Optional
import json
import logging
from datetime import datetime

from app.core.auth import get_current_user, verify_supabase_token
from app.schemas.user import User
from app.schemas.workspace import OnboardingData, WorkspaceChat
from app.services.websocket import manager

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/onboarding", response_model=OnboardingData)
async def save_onboarding_data(
    data: OnboardingData,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Save onboarding data for a user's workspace.
    """
    # Implementation will be added once database models are set up
    logger.info(f"Saving onboarding data for user {current_user.id}")
    return data

@router.get("/onboarding", response_model=OnboardingData)
async def get_onboarding_data(
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get onboarding data for a user's workspace.
    """
    # Implementation will be added once database models are set up
    logger.info(f"Retrieving onboarding data for user {current_user.id}")
    return {
        "business_name": "Example Business",
        "industry": "Technology",
        "description": "AI-powered business solutions",
        "target_audience": "Small to medium businesses",
        "goals": ["Increase efficiency", "Improve customer satisfaction"]
    }

@router.websocket("/chat")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
    conversation_id: Optional[str] = Query(None)
):
    """
    WebSocket endpoint for real-time chat in the workspace.
    This will be used for the onboarding conversational UI.
    
    Args:
        websocket: The WebSocket connection
        token: The Supabase JWT token for authentication
        conversation_id: Optional ID of the conversation to join
    """
    # Verify the token and get user data
    user_data = await verify_supabase_token(token)
    if not user_data:
        await websocket.close(code=1008, reason="Invalid authentication token")
        return
    
    user_id = user_data.get("id")
    if not user_id:
        await websocket.close(code=1008, reason="User ID not found in token")
        return
    
    # Connect the WebSocket client
    connection_id = await manager.connect(websocket, user_id, conversation_id)
    
    # Send a welcome message
    welcome_message = {
        "type": "system_message",
        "content": "Connected to CHIDI App chat server",
        "timestamp": datetime.utcnow().isoformat()
    }
    await manager.send_personal_message(welcome_message, connection_id)
    
    try:
        while True:
            # Receive and process messages
            data = await websocket.receive_text()
            try:
                message_data = json.loads(data)
                message_type = message_data.get("type", "user_message")
                content = message_data.get("content", "")
                
                # Log the received message
                logger.info(f"Received {message_type} from user {user_id}: {content[:50]}...")
                
                # Process the message based on type
                if message_type == "user_message":
                    # In a real implementation, this would process the message with AI
                    # and store it in the database
                    
                    # Echo the message back with a simulated AI response
                    user_message = {
                        "id": f"msg_{datetime.utcnow().timestamp()}",
                        "type": "user_message",
                        "content": content,
                        "sender": "user",
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    
                    # Send typing indicator
                    typing_indicator = {
                        "type": "typing_indicator",
                        "is_typing": True
                    }
                    await manager.send_personal_message(typing_indicator, connection_id)
                    
                    # Simulate AI processing delay
                    import asyncio
                    await asyncio.sleep(1)
                    
                    # Send AI response
                    ai_response = {
                        "id": f"msg_{datetime.utcnow().timestamp()}",
                        "type": "assistant_message",
                        "content": f"I received your message: {content}",
                        "sender": "assistant",
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    
                    # Stop typing indicator
                    typing_indicator = {
                        "type": "typing_indicator",
                        "is_typing": False
                    }
                    
                    # Send all messages
                    await manager.send_personal_message(user_message, connection_id)
                    await manager.send_personal_message(ai_response, connection_id)
                    await manager.send_personal_message(typing_indicator, connection_id)
                    
                    # If in a conversation, broadcast to all participants
                    if conversation_id:
                        await manager.broadcast_to_conversation(user_message, conversation_id)
                        await manager.broadcast_to_conversation(ai_response, conversation_id)
                
            except json.JSONDecodeError:
                logger.error(f"Invalid JSON received from client: {data[:50]}...")
                error_message = {
                    "type": "error",
                    "content": "Invalid message format"
                }
                await manager.send_personal_message(error_message, connection_id)
    
    except WebSocketDisconnect:
        # Handle disconnect
        logger.info(f"WebSocket client disconnected: {connection_id}")
        manager.disconnect(connection_id)
    
    except Exception as e:
        # Handle other exceptions
        logger.error(f"WebSocket error: {str(e)}")
        manager.disconnect(connection_id)
