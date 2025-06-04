import logging
from prisma import Prisma
from app.core.config import settings

logger = logging.getLogger(__name__)

async def init_db() -> None:
    """
    Initialize database connections and perform initial setup.
    """
    try:
        # Initialize Prisma client
        prisma = Prisma()
        await prisma.connect()
        
        # Verify connection
        result = await prisma.query_raw("SELECT 1")
        if result:
            logger.info("Successfully connected to the database")
        
        # Close connection
        await prisma.disconnect()
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
        raise
