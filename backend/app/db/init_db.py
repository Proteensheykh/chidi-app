"""
Database initialization and management functions.
"""
import logging
import subprocess
import sys
import os
from pathlib import Path

from app.core.config import settings

logger = logging.getLogger(__name__)

def generate_prisma_client() -> bool:
    """
    Generate the Prisma client using the schema.
    
    Returns:
        bool: True if successful, False otherwise
    """
    logger.info("Generating Prisma client...")
    
    try:
        # Get the backend directory path
        backend_dir = Path(__file__).parent.parent.parent.absolute()
        
        # Run prisma generate command
        result = subprocess.run(
            ["prisma", "generate"],
            cwd=backend_dir,
            capture_output=True,
            text=True,
            check=True
        )
        
        logger.info("Prisma client generated successfully")
        logger.debug(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to generate Prisma client: {e}")
        logger.error(f"Error output: {e.stderr}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error generating Prisma client: {e}")
        return False

async def init_db() -> bool:
    """
    Initialize the database with Prisma.
    
    Returns:
        bool: True if successful, False otherwise
    """
    logger.info("Initializing database...")
    
    # Validate database configuration
    if not settings.validate_database_config():
        logger.error("Database configuration is invalid")
        return False
    
    # Generate Prisma client if needed
    if not generate_prisma_client():
        logger.error("Failed to generate Prisma client")
        return False
    
    logger.info("Database initialized successfully")
    return True
