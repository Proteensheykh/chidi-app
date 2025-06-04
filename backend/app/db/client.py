import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Optional
from prisma import Prisma
from app.core.config import settings

logger = logging.getLogger(__name__)

# Global Prisma client instance
_prisma_client: Optional[Prisma] = None

async def get_prisma_client() -> Prisma:
    """
    Get or initialize the global Prisma client.
    
    Returns:
        Prisma: The Prisma client instance
    """
    global _prisma_client
    
    if _prisma_client is None or not _prisma_client.is_connected():
        logger.info("Initializing new Prisma client connection")
        _prisma_client = Prisma()
        await _prisma_client.connect()
    
    return _prisma_client

@asynccontextmanager
async def get_db() -> AsyncGenerator[Prisma, None]:
    """
    Context manager for database operations.
    
    Yields:
        Prisma: The Prisma client instance
    """
    client = await get_prisma_client()
    try:
        yield client
    except Exception as e:
        logger.error(f"Database operation error: {e}")
        raise
    # We don't disconnect here to reuse the connection

async def close_db_connection() -> None:
    """
    Close the database connection.
    Should be called when the application shuts down.
    """
    global _prisma_client
    
    if _prisma_client and _prisma_client.is_connected():
        logger.info("Closing Prisma client connection")
        await _prisma_client.disconnect()
        _prisma_client = None
