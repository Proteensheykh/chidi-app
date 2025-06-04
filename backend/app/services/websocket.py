from typing import Dict, List, Any, Optional
from fastapi import WebSocket
import json
import logging
import uuid
from datetime import datetime

logger = logging.getLogger(__name__)

class ConnectionManager:
    """
    WebSocket connection manager for handling real-time messaging.
    """
    def __init__(self):
        # Map of connection_id to WebSocket instance
        self.active_connections: Dict[str, WebSocket] = {}
        # Map of user_id to list of connection_ids
        self.user_connections: Dict[str, List[str]] = {}
        # Map of conversation_id to list of connection_ids
        self.conversation_connections: Dict[str, List[str]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str, conversation_id: Optional[str] = None) -> str:
        """
        Connect a new WebSocket client.
        
        Args:
            websocket: The WebSocket connection
            user_id: The ID of the authenticated user
            conversation_id: Optional ID of the conversation to join
            
        Returns:
            The connection ID
        """
        await websocket.accept()
        connection_id = str(uuid.uuid4())
        self.active_connections[connection_id] = websocket
        
        # Add to user connections
        if user_id not in self.user_connections:
            self.user_connections[user_id] = []
        self.user_connections[user_id].append(connection_id)
        
        # Add to conversation connections if provided
        if conversation_id:
            if conversation_id not in self.conversation_connections:
                self.conversation_connections[conversation_id] = []
            self.conversation_connections[conversation_id].append(connection_id)
        
        logger.info(f"Client connected: {connection_id} (User: {user_id}, Conversation: {conversation_id})")
        return connection_id
    
    def disconnect(self, connection_id: str):
        """
        Disconnect a WebSocket client.
        
        Args:
            connection_id: The connection ID to disconnect
        """
        if connection_id not in self.active_connections:
            return
        
        # Remove from active connections
        del self.active_connections[connection_id]
        
        # Remove from user connections
        for user_id, connections in list(self.user_connections.items()):
            if connection_id in connections:
                connections.remove(connection_id)
                if not connections:
                    del self.user_connections[user_id]
        
        # Remove from conversation connections
        for conversation_id, connections in list(self.conversation_connections.items()):
            if connection_id in connections:
                connections.remove(connection_id)
                if not connections:
                    del self.conversation_connections[conversation_id]
        
        logger.info(f"Client disconnected: {connection_id}")
    
    async def send_personal_message(self, message: Any, connection_id: str):
        """
        Send a message to a specific connection.
        
        Args:
            message: The message to send
            connection_id: The connection ID to send to
        """
        if connection_id not in self.active_connections:
            logger.warning(f"Attempted to send message to non-existent connection: {connection_id}")
            return
        
        websocket = self.active_connections[connection_id]
        if isinstance(message, dict) or isinstance(message, list):
            await websocket.send_json(message)
        else:
            await websocket.send_text(str(message))
    
    async def broadcast_to_user(self, message: Any, user_id: str):
        """
        Broadcast a message to all connections for a specific user.
        
        Args:
            message: The message to send
            user_id: The user ID to broadcast to
        """
        if user_id not in self.user_connections:
            logger.warning(f"Attempted to broadcast to non-existent user: {user_id}")
            return
        
        for connection_id in self.user_connections[user_id]:
            await self.send_personal_message(message, connection_id)
    
    async def broadcast_to_conversation(self, message: Any, conversation_id: str):
        """
        Broadcast a message to all connections in a specific conversation.
        
        Args:
            message: The message to send
            conversation_id: The conversation ID to broadcast to
        """
        if conversation_id not in self.conversation_connections:
            logger.warning(f"Attempted to broadcast to non-existent conversation: {conversation_id}")
            return
        
        for connection_id in self.conversation_connections[conversation_id]:
            await self.send_personal_message(message, connection_id)
    
    async def broadcast(self, message: Any):
        """
        Broadcast a message to all active connections.
        
        Args:
            message: The message to send
        """
        for connection_id in self.active_connections:
            await self.send_personal_message(message, connection_id)

# Create a global connection manager instance
manager = ConnectionManager()
