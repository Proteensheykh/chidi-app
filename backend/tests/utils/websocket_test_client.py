import json
from typing import Any, Dict, List, Optional, Union
from fastapi.testclient import TestClient
from fastapi.websockets import WebSocket
from starlette.testclient import WebSocketTestSession


class WebSocketTestClient:
    """
    A test client for WebSocket connections.
    
    This class wraps FastAPI's TestClient to provide a more convenient
    interface for testing WebSocket endpoints.
    """
    
    def __init__(self, app, url: str, headers: Optional[Dict[str, str]] = None):
        """
        Initialize the WebSocket test client.
        
        Args:
            app: The FastAPI application to test
            url: The WebSocket URL to connect to
            headers: Optional headers to include in the connection request
        """
        self.app = app
        self.url = url
        self.headers = headers or {}
        self.client = TestClient(app)
        self.ws: Optional[WebSocketTestSession] = None
    
    def connect(self) -> bool:
        """
        Connect to the WebSocket endpoint.
        
        Returns:
            True if the connection was successful, False otherwise
        """
        try:
            self.ws = self.client.websocket_connect(self.url, headers=self.headers)
            return True
        except Exception as e:
            print(f"WebSocket connection failed: {str(e)}")
            return False
    
    def disconnect(self) -> None:
        """
        Disconnect from the WebSocket endpoint.
        """
        if self.ws:
            self.ws.close()
            self.ws = None
    
    def send_text(self, data: str) -> None:
        """
        Send a text message to the WebSocket endpoint.
        
        Args:
            data: The text message to send
        """
        if not self.ws:
            raise RuntimeError("WebSocket not connected")
        
        self.ws.send_text(data)
    
    def send_json(self, data: Dict[str, Any]) -> None:
        """
        Send a JSON message to the WebSocket endpoint.
        
        Args:
            data: The JSON data to send
        """
        if not self.ws:
            raise RuntimeError("WebSocket not connected")
        
        self.ws.send_json(data)
    
    def receive_text(self) -> str:
        """
        Receive a text message from the WebSocket endpoint.
        
        Returns:
            The received text message
        """
        if not self.ws:
            raise RuntimeError("WebSocket not connected")
        
        return self.ws.receive_text()
    
    def receive_json(self) -> Dict[str, Any]:
        """
        Receive a JSON message from the WebSocket endpoint.
        
        Returns:
            The received JSON data
        """
        if not self.ws:
            raise RuntimeError("WebSocket not connected")
        
        return self.ws.receive_json()
    
    def receive_messages(self, count: int = 1) -> List[Dict[str, Any]]:
        """
        Receive multiple JSON messages from the WebSocket endpoint.
        
        Args:
            count: Number of messages to receive
            
        Returns:
            List of received JSON messages
        """
        if not self.ws:
            raise RuntimeError("WebSocket not connected")
        
        messages = []
        for _ in range(count):
            try:
                message = self.ws.receive_json()
                messages.append(message)
            except Exception as e:
                print(f"Error receiving message: {str(e)}")
                break
        
        return messages
