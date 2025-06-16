import logging
from typing import List, Dict, Any, Optional
import json

from app.core.celery_app import celery_app
from app.services.embedding_service import (
    generate_embedding,
    generate_embeddings_batch,
    generate_business_context_embedding
)
from app.schemas.business_context import BusinessContext

logger = logging.getLogger(__name__)


@celery_app.task(name="app.tasks.embeddings.generate_text_embedding")
def generate_text_embedding_task(text: str) -> Optional[List[float]]:
    """
    Celery task to generate an embedding for a text string.
    
    Args:
        text: The text to generate an embedding for
    
    Returns:
        A list of floats representing the embedding vector, or None if generation fails
    """
    import asyncio
    
    # Create a new event loop for async execution within the Celery task
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        # Run the async function in the event loop
        embedding = loop.run_until_complete(generate_embedding(text))
        return embedding
    except Exception as e:
        logger.error(f"Error in generate_text_embedding_task: {str(e)}")
        return None
    finally:
        # Clean up the event loop
        loop.close()


@celery_app.task(name="app.tasks.embeddings.generate_batch_embeddings")
def generate_batch_embeddings_task(texts: List[str]) -> List[Optional[List[float]]]:
    """
    Celery task to generate embeddings for a batch of texts.
    
    Args:
        texts: List of texts to generate embeddings for
    
    Returns:
        List of embedding vectors (or None for failed generations)
    """
    import asyncio
    
    # Create a new event loop for async execution within the Celery task
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        # Run the async function in the event loop
        embeddings = loop.run_until_complete(generate_embeddings_batch(texts))
        return embeddings
    except Exception as e:
        logger.error(f"Error in generate_batch_embeddings_task: {str(e)}")
        return [None] * len(texts)
    finally:
        # Clean up the event loop
        loop.close()


@celery_app.task(name="app.tasks.embeddings.generate_business_context_embedding_task")
def generate_business_context_embedding_task(business_context_json: str) -> Optional[List[float]]:
    """
    Celery task to generate an embedding for a business context.
    
    Args:
        business_context_json: JSON string representation of the business context
    
    Returns:
        Embedding vector for the business context
    """
    import asyncio
    
    # Create a new event loop for async execution within the Celery task
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        # Parse the JSON string to a dictionary
        business_context = json.loads(business_context_json)
        
        # Run the async function in the event loop
        embedding = loop.run_until_complete(generate_business_context_embedding(business_context))
        return embedding
    except json.JSONDecodeError as e:
        logger.error(f"Error decoding business context JSON: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Error in generate_business_context_embedding_task: {str(e)}")
        return None
    finally:
        # Clean up the event loop
        loop.close()


# Helper functions to call Celery tasks from async code
async def async_generate_text_embedding(text: str) -> Optional[List[float]]:
    """
    Async wrapper to call the Celery task for generating a text embedding.
    
    Args:
        text: The text to generate an embedding for
    
    Returns:
        A list of floats representing the embedding vector, or None if generation fails
    """
    # For development with task_always_eager=True, we can call the task directly
    from app.core.config import settings
    
    if settings.ENVIRONMENT == "development":
        # In development, we can run the async function directly
        return await generate_embedding(text)
    else:
        # In production, we queue the task
        task = generate_text_embedding_task.delay(text)
        return task.get()  # This will block until the task completes


async def async_generate_business_context_embedding(business_context: BusinessContext) -> Optional[List[float]]:
    """
    Async wrapper to call the Celery task for generating a business context embedding.
    
    Args:
        business_context: The business context to generate an embedding for
    
    Returns:
        A list of floats representing the embedding vector, or None if generation fails
    """
    # For development with task_always_eager=True, we can call the task directly
    from app.core.config import settings
    
    # Convert the business context to a JSON string
    business_context_json = business_context.model_dump_json()
    
    if settings.ENVIRONMENT == "development":
        # In development, we can run the async function directly
        business_context_dict = business_context.model_dump()
        return await generate_business_context_embedding(business_context_dict)
    else:
        # In production, we queue the task
        task = generate_business_context_embedding_task.delay(business_context_json)
        return task.get()  # This will block until the task completes
