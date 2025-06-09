"""
Pytest configuration file for the CHIDI app backend tests.
"""
import pytest
import asyncio
from typing import AsyncGenerator

from prisma import Prisma
from app.db.client import get_prisma_client, close_db_connection


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test session.
    
    This fixture ensures that the same event loop is used for all tests in the session,
    preventing 'Event loop is closed' errors between tests.
    """
    policy = asyncio.get_event_loop_policy()
    loop = policy.new_event_loop()
    asyncio.set_event_loop(loop)
    yield loop
    # Don't close here to avoid 'Event loop is closed' errors
    # The loop will be closed when the Python process exits


@pytest.fixture(scope="session")
async def prisma_client() -> AsyncGenerator[Prisma, None]:
    """
    Create a Prisma client for testing.
    
    This fixture provides a Prisma client that can be used for all tests
    in the session, and ensures proper cleanup after tests are complete.
    """
    # Reset any existing client connections
    try:
        await close_db_connection()
    except Exception:
        pass
        
    # Create a fresh client
    client = await get_prisma_client()
    
    # Yield the client for tests to use
    yield client
    
    # Cleanup after all tests are done
    try:
        await close_db_connection()
    except Exception:
        pass
