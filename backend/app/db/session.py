from prisma import Prisma
from contextlib import asynccontextmanager

# Create a global Prisma client instance
prisma_client = Prisma()

@asynccontextmanager
async def get_db():
    """
    Get a database session as an async context manager.
    """
    if not prisma_client.is_connected():
        await prisma_client.connect()
    try:
        yield prisma_client
    except Exception:
        # If an exception occurs, ensure we disconnect properly
        if prisma_client.is_connected():
            await prisma_client.disconnect()
        raise
