import logging
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.api.v1.api import api_router
from app.core.config import settings
from app.db.init_db import init_db
from app.db.client import close_db_connection
from app.core.auth import get_current_user

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="CHIDI App API - AI-powered business context management",
    version="0.1.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    swagger_ui_parameters={
        "deepLinking": True,  # Enables deep linking to specific operations
        "persistAuthorization": True,  # Persists authorization data between page refreshes
        "displayRequestDuration": True,  # Shows how long requests take
        "defaultModelsExpandDepth": 3,  # Expands models to show properties
        "defaultModelExpandDepth": 3,  # Expands nested models
        "tryItOutEnabled": True,  # Enables the "Try it out" feature by default
        "filter": True,  # Enables filtering operations by tag or text
        "syntaxHighlight": {"activate": True, "theme": "monokai"}  # Syntax highlighting for JSON
    }
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Health check endpoint (public)
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": "0.1.0"
    }

# Protected health check endpoint (requires authentication)
@app.get("/health/protected")
async def protected_health_check(current_user = Depends(get_current_user)):
    return {
        "status": "authenticated", 
        "user_id": current_user.id,
        "email": current_user.email
    }

@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting up {settings.PROJECT_NAME} in {settings.ENVIRONMENT} environment")
    try:
        await init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down application...")
    try:
        await close_db_connection()
        logger.info("Database connections closed successfully")
    except Exception as e:
        logger.error(f"Error closing database connections: {e}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
