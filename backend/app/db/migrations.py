"""
Database migration management functions.
"""
import logging
import subprocess
import sys
import os
from pathlib import Path
from typing import Tuple, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)

def run_prisma_migration(migration_name: str = "initial") -> Tuple[bool, Optional[str]]:
    """
    Run Prisma migration to create and apply database schema changes.
    
    Args:
        migration_name: Name for the migration
        
    Returns:
        Tuple[bool, Optional[str]]: Success status and migration ID if successful
    """
    logger.info(f"Running Prisma migration: {migration_name}...")
    
    try:
        # Get the backend directory path
        backend_dir = Path(__file__).parent.parent.parent.absolute()
        
        # Run prisma migrate dev command
        result = subprocess.run(
            ["prisma", "migrate", "dev", "--name", migration_name],
            cwd=backend_dir,
            capture_output=True,
            text=True,
            check=True
        )
        
        # Extract migration ID from output if possible
        migration_id = None
        for line in result.stdout.splitlines():
            if "Migration" in line and "created successfully" in line:
                parts = line.split()
                for part in parts:
                    if part.startswith("2"):  # Migration IDs typically start with timestamp
                        migration_id = part
                        break
        
        logger.info(f"Prisma migration '{migration_name}' completed successfully")
        logger.debug(result.stdout)
        return True, migration_id
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to run Prisma migration: {e}")
        logger.error(f"Error output: {e.stderr}")
        return False, None
    except Exception as e:
        logger.error(f"Unexpected error running Prisma migration: {e}")
        return False, None


def apply_pending_migrations() -> bool:
    """
    Apply any pending migrations to the database.
    
    Returns:
        bool: True if successful, False otherwise
    """
    logger.info("Applying pending migrations...")
    
    try:
        # Get the backend directory path
        backend_dir = Path(__file__).parent.parent.parent.absolute()
        
        # Run prisma migrate deploy command
        result = subprocess.run(
            ["prisma", "migrate", "deploy"],
            cwd=backend_dir,
            capture_output=True,
            text=True,
            check=True
        )
        
        logger.info("Pending migrations applied successfully")
        logger.debug(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to apply pending migrations: {e}")
        logger.error(f"Error output: {e.stderr}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error applying pending migrations: {e}")
        return False


def reset_database() -> bool:
    """
    Reset the database (CAUTION: This will delete all data).
    Only available in development environment.
    
    Returns:
        bool: True if successful, False otherwise
    """
    if settings.ENVIRONMENT != "development":
        logger.error("Database reset is only available in development environment")
        return False
    
    logger.warning("Resetting database - ALL DATA WILL BE LOST")
    
    try:
        # Get the backend directory path
        backend_dir = Path(__file__).parent.parent.parent.absolute()
        
        # Run prisma migrate reset command
        result = subprocess.run(
            ["prisma", "migrate", "reset", "--force"],
            cwd=backend_dir,
            capture_output=True,
            text=True,
            check=True
        )
        
        logger.info("Database reset successfully")
        logger.debug(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to reset database: {e}")
        logger.error(f"Error output: {e.stderr}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error resetting database: {e}")
        return False
