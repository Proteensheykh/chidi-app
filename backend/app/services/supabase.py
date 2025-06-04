"""
Supabase service for authentication and database operations.
"""
import logging
from typing import Dict, Any, Optional, List
import httpx
from supabase import create_client, Client
import jwt
from datetime import datetime

from app.core.config import settings
from app.schemas.user import User, UserCreate

logger = logging.getLogger(__name__)

# Initialize Supabase client
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

class SupabaseService:
    """
    Service for interacting with Supabase for authentication and database operations.
    """
    
    @staticmethod
    async def verify_token(token: str) -> Optional[Dict[str, Any]]:
        """
        Verify a Supabase JWT token and return user data if valid.
        
        Args:
            token: The JWT token to verify
            
        Returns:
            Dict with user data if token is valid, None otherwise
        """
        try:
            # In a production environment, you should verify the token with Supabase's JWKS
            # This is a simplified version for development
            headers = {"Authorization": f"Bearer {token}"}
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{settings.SUPABASE_URL}/auth/v1/user",
                    headers=headers
                )
                if response.status_code == 200:
                    return response.json()
                logger.warning(f"Failed to verify token: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            logger.error(f"Error verifying token: {str(e)}")
            return None
    
    @staticmethod
    async def get_user_by_id(user_id: str) -> Optional[User]:
        """
        Get a user by ID from Supabase.
        
        Args:
            user_id: The user ID to look up
            
        Returns:
            User object if found, None otherwise
        """
        try:
            # Using the service role key to access auth.users table
            headers = {
                "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{settings.SUPABASE_URL}/auth/v1/admin/users/{user_id}",
                    headers=headers
                )
                
                if response.status_code == 200:
                    user_data = response.json()
                    return User(
                        id=user_data.get("id"),
                        email=user_data.get("email"),
                        full_name=user_data.get("user_metadata", {}).get("full_name", ""),
                        avatar_url=user_data.get("user_metadata", {}).get("avatar_url", ""),
                        created_at=datetime.fromisoformat(user_data.get("created_at").replace("Z", "+00:00")),
                        updated_at=datetime.fromisoformat(user_data.get("updated_at").replace("Z", "+00:00"))
                    )
                
                logger.warning(f"Failed to get user by ID: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            logger.error(f"Error getting user by ID: {str(e)}")
            return None
    
    @staticmethod
    async def get_user_from_token(token: str) -> Optional[User]:
        """
        Extract user information from a Supabase JWT token.
        
        Args:
            token: The JWT token
            
        Returns:
            User object if token is valid, None otherwise
        """
        try:
            # Decode the JWT token to get user information
            # Note: In production, you should verify the token with Supabase's JWKS
            payload = jwt.decode(token, options={"verify_signature": False})
            
            user_id = payload.get("sub")
            if not user_id:
                logger.warning("No user ID found in token")
                return None
            
            # Get additional user data from Supabase
            return await SupabaseService.get_user_by_id(user_id)
        except jwt.PyJWTError as e:
            logger.error(f"JWT error: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Error getting user from token: {str(e)}")
            return None
