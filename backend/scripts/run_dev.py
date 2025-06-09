#!/usr/bin/env python
"""
Development server script for the CHIDI App backend.
This script runs the FastAPI server in development mode.
"""
import asyncio
import os
import sys
import subprocess
import uvicorn
import logging
from pathlib import Path

# Add the parent directory to the path so we can import from app
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.config import settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

def check_prisma_installation():
    """Check if Prisma CLI is installed."""
    try:
        result = subprocess.run(["prisma", "--version"], check=True, capture_output=True, text=True)
        logger.info(f"Prisma CLI version: {result.stdout.strip()}")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        logger.error("Prisma CLI is not installed. Please install it using 'npm install -g prisma'")
        return False

def generate_prisma_client():
    """Generate Prisma client."""
    logger.info("Generating Prisma client...")
    try:
        backend_dir = Path(__file__).parent.parent.absolute()
        result = subprocess.run(
            ["prisma", "generate"],
            cwd=backend_dir,
            check=True,
            capture_output=True,
            text=True
        )
        logger.info("Prisma client generated successfully")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to generate Prisma client: {e.stderr}")
        return False

def run_prisma_migrate():
    """Run Prisma migrations to update the database schema."""
    logger.info("Running Prisma migrations...")
    try:
        backend_dir = Path(__file__).parent.parent.absolute()
        result = subprocess.run(
            ["prisma", "migrate", "deploy"],
            cwd=backend_dir,
            check=True,
            capture_output=True,
            text=True
        )
        logger.info("Prisma migrations applied successfully")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to run Prisma migrations: {e.stderr}")
        return False

def main():
    """Run the development server."""
    logger.info(f"Starting development server for {settings.PROJECT_NAME}...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"API Version: {settings.API_V1_STR}")
    logger.info(f"CORS Origins: {settings.CORS_ORIGINS}")
    
    # Check database configuration
    if not settings.validate_database_config():
        logger.error("Database URL is not configured. Please check your .env file.")
        sys.exit(1)
    
    # Check Prisma installation
    if not check_prisma_installation():
        logger.error("Prisma CLI is not installed. Please install it using 'npm install -g prisma'")
        sys.exit(1)
        
    # Run Prisma migrations
    if not run_prisma_migrate():
        logger.error("Failed to run database migrations. Please check the errors above.")
        sys.exit(1)
    
    # Generate Prisma client
    if not generate_prisma_client():
        logger.error("Failed to generate Prisma client. Please check the errors above.")
        sys.exit(1)
    
    # Run the server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )

if __name__ == "__main__":
    main()
