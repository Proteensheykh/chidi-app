#!/usr/bin/env python
"""
Database setup script for initializing and migrating the database.
"""
import asyncio
import argparse
import logging
import sys
import os
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.append(str(Path(__file__).parent.parent))

from app.db.init_db import init_db, generate_prisma_client
from app.db.migrations import run_prisma_migration, apply_pending_migrations, reset_database
from app.core.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


async def setup_database(args):
    """
    Set up the database based on command line arguments.
    """
    # Validate environment
    if not settings.validate_database_config():
        logger.error("Database configuration is invalid. Check your environment variables.")
        return False

    # Reset database if requested
    if args.reset:
        if settings.ENVIRONMENT != "development":
            logger.error("Database reset is only allowed in development environment")
            return False
        
        logger.warning("Resetting database - ALL DATA WILL BE LOST")
        if not reset_database():
            logger.error("Failed to reset database")
            return False
        logger.info("Database reset successfully")

    # Generate Prisma client
    if args.generate or args.all:
        if not generate_prisma_client():
            logger.error("Failed to generate Prisma client")
            return False
        logger.info("Prisma client generated successfully")

    # Run migration
    if args.migrate or args.all:
        success, migration_id = run_prisma_migration(args.name)
        if not success:
            logger.error("Failed to run migration")
            return False
        logger.info(f"Migration completed successfully: {migration_id}")

    # Apply pending migrations
    if args.deploy or args.all:
        if not apply_pending_migrations():
            logger.error("Failed to apply pending migrations")
            return False
        logger.info("Pending migrations applied successfully")

    # Initialize database
    if args.init or args.all:
        if not await init_db():
            logger.error("Failed to initialize database")
            return False
        logger.info("Database initialized successfully")

    return True


def main():
    """
    Main function to parse arguments and run database setup.
    """
    parser = argparse.ArgumentParser(description="Database setup utility")
    parser.add_argument("--all", action="store_true", help="Run all database setup steps")
    parser.add_argument("--generate", action="store_true", help="Generate Prisma client")
    parser.add_argument("--migrate", action="store_true", help="Run Prisma migration")
    parser.add_argument("--deploy", action="store_true", help="Apply pending migrations")
    parser.add_argument("--init", action="store_true", help="Initialize database")
    parser.add_argument("--reset", action="store_true", help="Reset database (DEVELOPMENT ONLY)")
    parser.add_argument("--name", default="initial", help="Migration name (default: initial)")
    
    args = parser.parse_args()
    
    # If no arguments provided, show help
    if not any([args.all, args.generate, args.migrate, args.deploy, args.init, args.reset]):
        parser.print_help()
        return 1
    
    # Run setup
    success = asyncio.run(setup_database(args))
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
