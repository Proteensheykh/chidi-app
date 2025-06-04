from datetime import datetime
from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
import jwt
from supabase import create_client, Client

from app.core.config import settings
from app.schemas.user import User

# Supabase client setup
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

# Security scheme for JWT tokens from Supabase
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """
    Validate the Supabase JWT token and get the current user.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Verify the JWT token with Supabase
        token = credentials.credentials
        
        # Decode the JWT token to get user information
        # Note: In production, you should verify the token with Supabase's JWKS
        payload = jwt.decode(token, options={"verify_signature": False})
        
        user_id: str = payload.get("sub")
        email: str = payload.get("email")
        
        if user_id is None or email is None:
            raise credentials_exception
        
        # In a real implementation, you might want to fetch additional user data from your database
        user = User(
            id=user_id,
            email=email,
            full_name=payload.get("user_metadata", {}).get("full_name", ""),
            created_at=datetime.utcnow(),  # This would come from the database in a real implementation
            updated_at=datetime.utcnow()   # This would come from the database in a real implementation
        )
        
        return user
    except (jwt.JWTError, jwt.ExpiredSignatureError):
        raise credentials_exception

async def verify_supabase_token(token: str) -> Optional[dict]:
    """
    Verify a Supabase JWT token with the Supabase API.
    Returns the user data if the token is valid.
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
            return None
    except Exception:
        return None
