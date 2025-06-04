import logging
from typing import Dict, Any, List
import httpx
from app.core.celery_app import celery_app
from app.core.config import settings
from prisma import Prisma

logger = logging.getLogger(__name__)

@celery_app.task(name="app.tasks.embeddings.generate_embeddings")
async def generate_embeddings(knowledge_item_id: str) -> Dict[str, Any]:
    """
    Generate embeddings for a knowledge item using OpenAI's embeddings API.
    
    Args:
        knowledge_item_id: ID of the knowledge item to generate embeddings for
        
    Returns:
        Dict containing status and knowledge_item_id
    """
    try:
        # Initialize Prisma client
        prisma = Prisma()
        await prisma.connect()
        
        # Get the knowledge item
        knowledge_item = await prisma.knowledgeitem.find_unique(
            where={"id": knowledge_item_id}
        )
        
        if not knowledge_item:
            logger.error(f"Knowledge item with ID {knowledge_item_id} not found")
            return {"status": "error", "message": "Knowledge item not found"}
        
        # Generate embeddings using OpenAI API
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/embeddings",
                headers={
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "input": knowledge_item.content,
                    "model": "text-embedding-ada-002"
                }
            )
            
            if response.status_code != 200:
                logger.error(f"Error generating embeddings: {response.text}")
                return {"status": "error", "message": "Error generating embeddings"}
            
            data = response.json()
            embedding = data["data"][0]["embedding"]
            
            # Update the knowledge item with the embedding
            # Note: This is a placeholder as the actual implementation would depend on
            # how vector data is stored in your Supabase database
            # await prisma.knowledgeitem.update(
            #     where={"id": knowledge_item_id},
            #     data={"embedding": embedding}
            # )
            
            logger.info(f"Successfully generated embeddings for knowledge item {knowledge_item_id}")
            return {"status": "success", "knowledge_item_id": knowledge_item_id}
    
    except Exception as e:
        logger.error(f"Error in generate_embeddings task: {str(e)}")
        return {"status": "error", "message": str(e)}
    finally:
        # Disconnect Prisma client
        if prisma.is_connected():
            await prisma.disconnect()

@celery_app.task(name="app.tasks.embeddings.search_similar_items")
async def search_similar_items(query: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Search for knowledge items similar to the query using vector similarity.
    
    Args:
        query: The search query
        limit: Maximum number of results to return
        
    Returns:
        List of similar knowledge items
    """
    try:
        # Initialize Prisma client
        prisma = Prisma()
        await prisma.connect()
        
        # Generate embeddings for the query
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/embeddings",
                headers={
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "input": query,
                    "model": "text-embedding-ada-002"
                }
            )
            
            if response.status_code != 200:
                logger.error(f"Error generating query embeddings: {response.text}")
                return []
            
            data = response.json()
            query_embedding = data["data"][0]["embedding"]
            
            # Search for similar items using vector similarity
            # Note: This is a placeholder as the actual implementation would depend on
            # how vector similarity search is implemented in your Supabase database
            # similar_items = await prisma.query_raw(
            #     """
            #     SELECT id, title, content, source,
            #     embedding <-> $1 as similarity
            #     FROM knowledge_items
            #     ORDER BY similarity ASC
            #     LIMIT $2
            #     """,
            #     query_embedding,
            #     limit
            # )
            
            # For now, return a placeholder result
            similar_items = await prisma.knowledgeitem.find_many(
                take=limit,
                order_by={"createdAt": "desc"}
            )
            
            return [
                {
                    "id": item.id,
                    "title": item.title,
                    "content": item.content,
                    "source": item.source
                }
                for item in similar_items
            ]
    
    except Exception as e:
        logger.error(f"Error in search_similar_items task: {str(e)}")
        return []
    finally:
        # Disconnect Prisma client
        if prisma.is_connected():
            await prisma.disconnect()
