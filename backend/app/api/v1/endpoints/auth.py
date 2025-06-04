from fastapi import APIRouter, Depends, HTTPException, Request, status
from typing import Any, Dict

from app.core.auth import get_current_user, verify_supabase_token
from app.schemas.token import Token
from app.schemas.user import User

router = APIRouter()

@router.post("/verify-token")
async def verify_token(request: Request) -> Dict[str, Any]:
    """
    Verify a Supabase JWT token and return user information.
    This endpoint allows the frontend to verify Supabase authentication with our backend.
    """
    # Extract the token from the Authorization header
    authorization = request.headers.get("Authorization")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = authorization.replace("Bearer ", "")
    user_data = await verify_supabase_token(token)
    
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return {"valid": True, "user": user_data}

@router.get("/me", response_model=Dict[str, Any])
async def get_user_info(current_user: User = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Get information about the currently authenticated user.
    """
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
    }
