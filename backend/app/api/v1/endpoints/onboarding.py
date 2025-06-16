from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status, Query
from typing import Any, List, Dict, Optional
import json
import logging
from datetime import datetime
import uuid

from app.core.auth import get_current_user, verify_supabase_token
from app.schemas.user import User
from app.schemas.onboarding import OnboardingMessage, OnboardingState, WebSocketMessage, MessageType
from app.services.websocket import manager
from app.services.ai_service import generate_onboarding_response
from app.core.json import json_dumps

logger = logging.getLogger(__name__)
router = APIRouter()

# In-memory storage for onboarding state (would be replaced with database in production)
onboarding_states: Dict[str, OnboardingState] = {}

# Track users who have already received welcome messages
welcome_message_sent: Dict[str, bool] = {}


@router.websocket("/ws")
async def onboarding_websocket(
    websocket: WebSocket,
    token: str = Query(...),
    conversation_id: Optional[str] = Query(None)
):
    """
    WebSocket endpoint for the onboarding process.
    
    Args:
        websocket: The WebSocket connection
        token: The Supabase JWT token for authentication
        conversation_id: Optional ID of the conversation to join
    """
    # Development bypass for authentication
    # In production, this would be removed and only proper JWT verification would be used
    if token == "dev-token-123":
        logger.warning("Using development token bypass for WebSocket authentication")
        user_id = "dev-user-123"
    else:
        # Verify the token and get user data
        user_data = await verify_supabase_token(token)
        if not user_data:
            await websocket.close(code=1008, reason="Invalid authentication token")
            return
        
        user_id = user_data.get("id")
        if not user_id:
            await websocket.close(code=1008, reason="User ID not found in token")
            return
    
    # Initialize or get onboarding state
    if user_id not in onboarding_states:
        onboarding_states[user_id] = OnboardingState()
    
    # Connect the WebSocket client
    connection_id = await manager.connect(websocket, user_id, conversation_id)
    
    # Check if this is the first connection for this user
    is_first_connection = user_id not in welcome_message_sent or not welcome_message_sent[user_id]
    
    # Only send welcome message on first connection
    if is_first_connection:
        # Create welcome message
        welcome_message = OnboardingMessage(
            id=str(uuid.uuid4()),
            content="Welcome to CHIDI App onboarding! I'll help you set up your workspace.",
            sender="assistant",
            messageType="text"
        )
        
        # Add welcome message to conversation history
        onboarding_states[user_id].conversationHistory.append(welcome_message)
        
        # Send welcome message
        await manager.send_personal_message(welcome_message.dict(), connection_id)
        
        # Mark welcome message as sent for this user
        welcome_message_sent[user_id] = True
        
        logger.info(f"Sent welcome message to user {user_id}")
    else:
        logger.info(f"Skipping welcome message for user {user_id} (already sent)")

    
    # Send onboarding state
    await manager.send_personal_message({
        "type": "onboarding_state",
        "state": onboarding_states[user_id].dict()
    }, connection_id)
    
    try:
        while True:
            # Receive and process messages
            data = await websocket.receive_text()
            try:
                message_data = json.loads(data)
                message_type = message_data.get("type", MessageType.USER_MESSAGE)
                
                # Process different message types
                if message_type == MessageType.USER_MESSAGE:
                    content = message_data.get("content", "")
                    
                    # Create user message
                    user_message = OnboardingMessage(
                        id=str(uuid.uuid4()),
                        content=content,
                        sender="user",
                        timestamp=datetime.utcnow()
                    )
                    
                    # Add to conversation history
                    onboarding_states[user_id].conversationHistory.append(user_message)
                    
                    # Send user message back to confirm receipt
                    await manager.send_personal_message(user_message.dict(), connection_id)
                    
                    # Send typing indicator
                    await manager.send_personal_message({
                        "type": MessageType.TYPING_INDICATOR,
                        "is_typing": True
                    }, connection_id)
                    
                    # Generate AI response (this would be replaced with actual AI service)
                    ai_response = await generate_onboarding_response(
                        user_message, 
                        onboarding_states[user_id]
                    )
                    
                    # Add AI response to conversation history
                    onboarding_states[user_id].conversationHistory.append(ai_response)
                    
                    # Update onboarding state based on conversation progress
                    # This is a simplified example - real implementation would analyze the conversation
                    if len(onboarding_states[user_id].conversationHistory) > 2:
                        onboarding_states[user_id].currentStep = min(
                            onboarding_states[user_id].currentStep + 1,
                            onboarding_states[user_id].totalSteps
                        )
                        onboarding_states[user_id].percentage = int(
                            (onboarding_states[user_id].currentStep / onboarding_states[user_id].totalSteps) * 100
                        )
                    
                    # Stop typing indicator
                    await manager.send_personal_message({
                        "type": MessageType.TYPING_INDICATOR,
                        "is_typing": False
                    }, connection_id)
                    
                    # Send AI response
                    await manager.send_personal_message(ai_response.dict(), connection_id)
                    
                    # Send updated onboarding state
                    await manager.send_personal_message({
                        "type": "onboarding_state",
                        "state": onboarding_states[user_id].dict()
                    }, connection_id)
                
                elif message_type == MessageType.OPTION_SELECTION:
                    option_id = message_data.get("optionId")
                    option_value = message_data.get("optionValue")
                    
                    logger.info(f"User {user_id} selected option: {option_id} = {option_value}")
                    
                    # Update business data with the selected option
                    onboarding_states[user_id].businessData[option_id] = option_value
                    
                    # Send confirmation
                    await manager.send_personal_message({
                        "type": "option_selected",
                        "optionId": option_id,
                        "optionValue": option_value
                    }, connection_id)
                
                elif message_type == MessageType.FORM_SUBMISSION:
                    form_data = message_data.get("formData", {})
                    
                    logger.info(f"User {user_id} submitted form data: {form_data}")
                    
                    # Update business data with form values
                    onboarding_states[user_id].businessData.update(form_data)
                    
                    # Send confirmation
                    await manager.send_personal_message({
                        "type": "form_submitted",
                        "formData": form_data
                    }, connection_id)
                    
                    # Generate AI response to form submission
                    ai_response = OnboardingMessage(
                        id=str(uuid.uuid4()),
                        content=f"Thank you for providing that information!",
                        sender="assistant",
                        timestamp=datetime.utcnow()
                    )
                    
                    # Add AI response to conversation history
                    onboarding_states[user_id].conversationHistory.append(ai_response)
                    
                    # Send AI response
                    await manager.send_personal_message(ai_response.dict(), connection_id)
                
                elif message_type == MessageType.ACTION_TRIGGER:
                    action_type = message_data.get("actionType")
                    
                    logger.info(f"User {user_id} triggered action: {action_type}")
                    
                    # Handle different action types
                    if action_type == "upload":
                        # This would be handled by a separate file upload endpoint
                        await manager.send_personal_message({
                            "type": "action_response",
                            "actionType": action_type,
                            "status": "ready_for_upload"
                        }, connection_id)
                    
                    elif action_type == "connect":
                        # Simulate connection to external service
                        await manager.send_personal_message({
                            "type": "action_response",
                            "actionType": action_type,
                            "status": "connected"
                        }, connection_id)
                
            except json.JSONDecodeError:
                logger.error(f"Invalid JSON received from client: {data[:50]}...")
                error_message = {
                    "type": MessageType.ERROR,
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


@router.post("/save-state", response_model=OnboardingState)
async def save_onboarding_state(
    state: OnboardingState,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Save the onboarding state for a user.
    """
    user_id = current_user.id
    onboarding_states[user_id] = state
    logger.info(f"Saved onboarding state for user {user_id}")
    return state


@router.get("/state", response_model=OnboardingState)
async def get_onboarding_state(
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get the onboarding state for a user.
    """
    user_id = current_user.id
    if user_id not in onboarding_states:
        onboarding_states[user_id] = OnboardingState()
    
    logger.info(f"Retrieved onboarding state for user {user_id}")
    return onboarding_states[user_id]
