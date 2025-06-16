import logging
import json
import numpy as np
from typing import List, Dict, Any, Optional, Union
from openai import AsyncOpenAI

from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize OpenAI client
openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def generate_embedding(text: str) -> Optional[List[float]]:
    """
    Generate an embedding vector for the given text using OpenAI's embedding API.
    
    Args:
        text: The text to generate an embedding for
    
    Returns:
        A list of floats representing the embedding vector, or None if generation fails
    """
    if not settings.OPENAI_API_KEY:
        logger.warning("OpenAI API key not set. Cannot generate embeddings.")
        return None
    
    try:
        # Truncate text if it's too long (OpenAI has token limits)
        # A simple truncation strategy - in production you might want something more sophisticated
        max_chars = 8000  # Approximate character limit for embedding models
        if len(text) > max_chars:
            logger.warning(f"Text too long ({len(text)} chars), truncating to {max_chars} chars")
            text = text[:max_chars]
        
        # Call OpenAI API to generate embedding
        response = await openai_client.embeddings.create(
            model="text-embedding-ada-002",  # Default embedding model
            input=text
        )
        
        # Extract the embedding from the response
        embedding = response.data[0].embedding
        
        return embedding
    
    except Exception as e:
        logger.error(f"Error generating embedding: {str(e)}")
        return None


async def generate_embeddings_batch(texts: List[str]) -> List[Optional[List[float]]]:
    """
    Generate embeddings for a batch of texts.
    
    Args:
        texts: List of texts to generate embeddings for
    
    Returns:
        List of embedding vectors (or None for failed generations)
    """
    if not settings.OPENAI_API_KEY:
        logger.warning("OpenAI API key not set. Cannot generate embeddings.")
        return [None] * len(texts)
    
    try:
        # Truncate texts if they're too long
        max_chars = 8000
        processed_texts = []
        for text in texts:
            if len(text) > max_chars:
                logger.warning(f"Text too long ({len(text)} chars), truncating to {max_chars} chars")
                processed_texts.append(text[:max_chars])
            else:
                processed_texts.append(text)
        
        # Call OpenAI API to generate embeddings for the batch
        response = await openai_client.embeddings.create(
            model="text-embedding-ada-002",
            input=processed_texts
        )
        
        # Extract embeddings from the response
        embeddings = [item.embedding for item in response.data]
        
        return embeddings
    
    except Exception as e:
        logger.error(f"Error generating batch embeddings: {str(e)}")
        return [None] * len(texts)


def calculate_similarity(embedding1: List[float], embedding2: List[float]) -> float:
    """
    Calculate cosine similarity between two embedding vectors.
    
    Args:
        embedding1: First embedding vector
        embedding2: Second embedding vector
    
    Returns:
        Cosine similarity score (0-1, higher is more similar)
    """
    # Convert to numpy arrays for efficient calculation
    vec1 = np.array(embedding1)
    vec2 = np.array(embedding2)
    
    # Calculate cosine similarity
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    
    if norm1 == 0 or norm2 == 0:
        return 0.0  # Handle zero vectors
    
    similarity = dot_product / (norm1 * norm2)
    
    return float(similarity)


async def generate_business_context_embedding(business_context: Dict[str, Any]) -> Optional[List[float]]:
    """
    Generate an embedding for a business context object.
    
    Args:
        business_context: Business context dictionary
    
    Returns:
        Embedding vector for the business context
    """
    # Extract relevant text from the business context
    text_parts = []
    
    # Add business profile information
    profile = business_context.get("profile", {})
    if profile.get("name"):
        text_parts.append(f"Business name: {profile.get('name')}")
    if profile.get("type"):
        text_parts.append(f"Business type: {profile.get('type')}")
    if profile.get("description"):
        text_parts.append(f"Description: {profile.get('description')}")
    if profile.get("products_services"):
        products = ", ".join(profile.get("products_services", []))
        text_parts.append(f"Products/Services: {products}")
    if profile.get("target_audience"):
        text_parts.append(f"Target audience: {profile.get('target_audience')}")
    
    # Add keywords
    keywords = business_context.get("keywords", [])
    if keywords:
        text_parts.append(f"Keywords: {', '.join(keywords)}")
    
    # Add insights
    insights = business_context.get("insights", {})
    for key, value in insights.items():
        text_parts.append(f"{key}: {value}")
    
    # Combine all text parts
    combined_text = "\n".join(text_parts)
    
    # Generate and return the embedding
    return await generate_embedding(combined_text)
