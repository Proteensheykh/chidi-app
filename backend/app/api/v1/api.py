from fastapi import APIRouter

from app.api.v1.endpoints import users, auth, businesses, conversations, workspace

api_router = APIRouter()

# Include routers for different resource endpoints
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(businesses.router, prefix="/businesses", tags=["Businesses"])
api_router.include_router(conversations.router, prefix="/conversations", tags=["Conversations"])
api_router.include_router(workspace.router, prefix="/workspace", tags=["Workspace"])
