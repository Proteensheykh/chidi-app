#!/usr/bin/env python
"""
Database setup script for the CHIDI App backend.
This script generates the Prisma client and sets up the database.
"""
import os
import sys
import subprocess
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

def check_environment():
    """Check if the required environment variables are set."""
    if not settings.DATABASE_URL:
        logger.error("DATABASE_URL environment variable is not set.")
        return False
    return True

def generate_prisma_client():
    """Generate the Prisma client."""
    try:
        logger.info("Generating Prisma client...")
        result = subprocess.run(
            ["prisma", "generate"],
            cwd=str(Path(__file__).parent.parent),
            check=True,
            capture_output=True,
            text=True,
        )
        logger.info(f"Prisma client generation output: {result.stdout}")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Error generating Prisma client: {e}")
        logger.error(f"Error output: {e.stderr}")
        return False

def run_migrations():
    """Run Prisma migrations."""
    try:
        logger.info("Running Prisma migrations...")
        result = subprocess.run(
            ["prisma", "migrate", "dev", "--name", "init"],
            cwd=str(Path(__file__).parent.parent),
            check=True,
            capture_output=True,
            text=True,
        )
        logger.info(f"Migration output: {result.stdout}")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Error running migrations: {e}")
        logger.error(f"Error output: {e.stderr}")
        return False

def main():
    """Main function to set up the database."""
    logger.info("Starting database setup...")
    
    if not check_environment():
        logger.error("Environment check failed. Exiting.")
        sys.exit(1)
    
    if not generate_prisma_client():
        logger.error("Prisma client generation failed. Exiting.")
        sys.exit(1)
    
    if not run_migrations():
        logger.error("Database migrations failed. Exiting.")
        sys.exit(1)
    
    logger.info("Database setup completed successfully.")

if __name__ == "__main__":
    main()
