import pytest
import json
from datetime import datetime
from unittest.mock import patch, MagicMock

from main import app
from app.schemas.onboarding import OnboardingMessage, OnboardingState
from tests.utils.websocket_test_client import WebSocketTestClient


# Mock the verify_supabase_token function
@pytest.fixture
def mock_auth():
    with patch("app.core.auth.verify_supabase_token") as mock:
        mock.return_value = {"id": "test-user-id", "email": "test@example.com"}
        yield mock


# Mock the AI service
@pytest.fixture
def mock_ai_service():
    with patch("app.services.ai_service.generate_onboarding_response") as mock:
        mock.return_value = "This is a test AI response"
        yield mock


@pytest.mark.asyncio
async def test_onboarding_websocket_integration(mock_auth, mock_ai_service):
    """
    Integration test for the onboarding WebSocket endpoint.
    
    This test uses WebSocketTestClient to establish a real WebSocket connection
    and test the full message flow, including:
    1. Connection establishment
    2. Welcome message reception
    3. Sending user messages and receiving responses
    4. Option selection and form submission
    5. Disconnection
    """
    # Create a valid JWT token for testing
    token = "test-jwt-token"
    
    # Create a WebSocket test client
    ws_client = WebSocketTestClient(
        app,
        f"/api/v1/onboarding/ws?token={token}",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # Connect to the WebSocket
    connected = ws_client.connect()
    assert connected, "Failed to connect to WebSocket"
    
    try:
        # Receive the welcome message
        welcome_message = ws_client.receive_json()
        assert welcome_message["type"] == "welcome"
        assert "content" in welcome_message
        
        # Test sending a user message
        ws_client.send_json({
            "type": "user_message",
            "content": "Hello, I'm setting up my workspace"
        })
        
        # Receive typing indicator
        typing_indicator = ws_client.receive_json()
        assert typing_indicator["type"] == "typing_indicator"
        assert typing_indicator["isTyping"] is True
        
        # Receive AI response
        ai_response = ws_client.receive_json()
        assert ai_response["type"] == "assistant_message"
        assert "content" in ai_response
        
        # Receive typing indicator off
        typing_off = ws_client.receive_json()
        assert typing_off["type"] == "typing_indicator"
        assert typing_off["isTyping"] is False
        
        # Test option selection
        ws_client.send_json({
            "type": "option_selection",
            "optionId": "business_type",
            "optionValue": "technology"
        })
        
        # Receive option selection confirmation
        option_confirmation = ws_client.receive_json()
        assert option_confirmation["type"] == "option_confirmation"
        assert option_confirmation["optionId"] == "business_type"
        assert option_confirmation["optionValue"] == "technology"
        
        # Test form submission
        ws_client.send_json({
            "type": "form_submission",
            "formData": {
                "description": "AI-powered business solutions",
                "employees": 10,
                "founded": "2023"
            }
        })
        
        # Receive form submission confirmation
        form_confirmation = ws_client.receive_json()
        assert form_confirmation["type"] == "form_confirmation"
        assert "formData" in form_confirmation
        
        # Receive AI response to form submission
        form_response = ws_client.receive_json()
        assert form_response["type"] == "assistant_message"
        assert "content" in form_response
        
        # Test action trigger
        ws_client.send_json({
            "type": "action_trigger",
            "actionType": "upload"
        })
        
        # Receive action trigger confirmation
        action_confirmation = ws_client.receive_json()
        assert action_confirmation["type"] == "action_confirmation"
        assert action_confirmation["actionType"] == "upload"
        
        # Test state update
        state_update = ws_client.receive_json()
        assert state_update["type"] == "state_update"
        assert "state" in state_update
        
    finally:
        # Disconnect from the WebSocket
        ws_client.disconnect()


@pytest.mark.asyncio
async def test_onboarding_websocket_authentication_failure():
    """
    Test that the WebSocket connection is rejected with an invalid token.
    """
    # Create an invalid JWT token for testing
    token = "invalid-token"
    
    # Create a WebSocket test client
    ws_client = WebSocketTestClient(
        app,
        f"/api/v1/onboarding/ws?token={token}",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # Attempt to connect to the WebSocket
    connected = ws_client.connect()
    
    # Connection should fail due to invalid token
    assert not connected, "WebSocket connection should have failed with invalid token"


@pytest.mark.asyncio
async def test_onboarding_websocket_error_handling(mock_auth):
    """
    Test error handling in the WebSocket endpoint.
    """
    # Create a valid JWT token for testing
    token = "test-jwt-token"
    
    # Create a WebSocket test client
    ws_client = WebSocketTestClient(
        app,
        f"/api/v1/onboarding/ws?token={token}",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # Connect to the WebSocket
    connected = ws_client.connect()
    assert connected, "Failed to connect to WebSocket"
    
    try:
        # Receive the welcome message
        welcome_message = ws_client.receive_json()
        assert welcome_message["type"] == "welcome"
        
        # Send an invalid message format
        ws_client.send_json({
            "invalid_key": "invalid_value"
        })
        
        # Receive error message
        error_message = ws_client.receive_json()
        assert error_message["type"] == "error"
        assert "message" in error_message
        
    finally:
        # Disconnect from the WebSocket
        ws_client.disconnect()
