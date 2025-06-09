"""
Database client for Prisma ORM integration with Supabase.
"""
import logging
import contextlib
from typing import AsyncGenerator

from prisma import Prisma
from prisma.errors import PrismaError

from app.core.config import settings

logger = logging.getLogger(__name__)

# Global Prisma client instance
_prisma_client: Prisma = None


async def get_prisma_client() -> Prisma:
    """
    Get or initialize the Prisma client.
    
    Returns:
        Prisma: The Prisma client instance
    """
    global _prisma_client
    
    if _prisma_client is None:
        logger.info("Initializing Prisma client...")
        try:
            _prisma_client = Prisma()
            await _prisma_client.connect()
            logger.info("Prisma client connected successfully")
        except PrismaError as e:
            logger.error(f"Failed to initialize Prisma client: {e}")
            raise
    
    return _prisma_client


async def close_db_connection() -> None:
    """
    Close the Prisma client connection.
    """
    global _prisma_client
    
    if _prisma_client is not None:
        logger.info("Closing Prisma client connection...")
        try:
            await _prisma_client.disconnect()
            _prisma_client = None
            logger.info("Prisma client disconnected successfully")
        except PrismaError as e:
            logger.error(f"Error closing Prisma client connection: {e}")


@contextlib.asynccontextmanager
async def get_db() -> AsyncGenerator[Prisma, None]:
    """
    Context manager for database operations.
    
    Yields:
        Prisma: The Prisma client instance
    """
    client = await get_prisma_client()
    try:
        yield client
    except PrismaError as e:
        logger.error(f"Database operation error: {e}")
        raise
