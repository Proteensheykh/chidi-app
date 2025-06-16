import logging
import numpy as np
from typing import List, Dict, Any, Optional, Tuple, Union
import json

from app.services.embedding_service import calculate_similarity, generate_embedding
from app.schemas.business_context import BusinessContext

logger = logging.getLogger(__name__)


async def retrieve_similar_contexts(
    query: str,
    contexts: List[BusinessContext],
    top_k: int = 3,
    similarity_threshold: float = 0.7
) -> List[Tuple[BusinessContext, float]]:
    """
    Retrieve business contexts similar to the query text.
    
    Args:
        query: The query text to find similar contexts for
        contexts: List of business contexts to search within
        top_k: Number of top results to return
        similarity_threshold: Minimum similarity score (0-1) to include in results
    
    Returns:
        List of (business_context, similarity_score) tuples, sorted by similarity
    """
    # Generate embedding for the query
    query_embedding = await generate_embedding(query)
    
    if not query_embedding:
        logger.error("Failed to generate embedding for query")
        return []
    
    # Calculate similarity scores for each context
    results = []
    
    for context in contexts:
        # Convert context to a dictionary for embedding generation
        context_dict = context.model_dump()
        
        # Generate embedding for the context (or use pre-computed embedding if available)
        if hasattr(context, "embedding") and context.embedding:
            context_embedding = context.embedding
        else:
            context_embedding = await generate_embedding(json.dumps(context_dict))
        
        if not context_embedding:
            logger.warning(f"Failed to generate embedding for context {context.business_id}")
            continue
        
        # Calculate similarity score
        similarity = calculate_similarity(query_embedding, context_embedding)
        
        # Add to results if above threshold
        if similarity >= similarity_threshold:
            results.append((context, similarity))
    
    # Sort by similarity score (descending) and take top_k
    results.sort(key=lambda x: x[1], reverse=True)
    return results[:top_k]


async def retrieve_context_by_keywords(
    keywords: List[str],
    contexts: List[BusinessContext],
    top_k: int = 3,
    match_threshold: int = 1
) -> List[Tuple[BusinessContext, int]]:
    """
    Retrieve business contexts by matching keywords.
    
    Args:
        keywords: List of keywords to match
        contexts: List of business contexts to search within
        top_k: Number of top results to return
        match_threshold: Minimum number of keyword matches to include in results
    
    Returns:
        List of (business_context, match_count) tuples, sorted by match count
    """
    # Convert keywords to lowercase for case-insensitive matching
    lowercase_keywords = [k.lower() for k in keywords]
    
    results = []
    
    for context in contexts:
        # Get context keywords and convert to lowercase
        context_keywords = [k.lower() for k in context.keywords]
        
        # Count matching keywords
        match_count = sum(1 for k in lowercase_keywords if k in context_keywords)
        
        # Add to results if above threshold
        if match_count >= match_threshold:
            results.append((context, match_count))
    
    # Sort by match count (descending) and take top_k
    results.sort(key=lambda x: x[1], reverse=True)
    return results[:top_k]


async def retrieve_similar_contexts_hybrid(
    query: str,
    keywords: List[str],
    contexts: List[BusinessContext],
    top_k: int = 3,
    vector_weight: float = 0.7,
    keyword_weight: float = 0.3
) -> List[Tuple[BusinessContext, float]]:
    """
    Retrieve business contexts using a hybrid approach combining vector similarity and keyword matching.
    
    Args:
        query: The query text to find similar contexts for
        keywords: List of keywords to match
        contexts: List of business contexts to search within
        top_k: Number of top results to return
        vector_weight: Weight for vector similarity scores (0-1)
        keyword_weight: Weight for keyword matching scores (0-1)
    
    Returns:
        List of (business_context, combined_score) tuples, sorted by combined score
    """
    # Ensure weights sum to 1
    total_weight = vector_weight + keyword_weight
    if total_weight != 1.0:
        vector_weight = vector_weight / total_weight
        keyword_weight = keyword_weight / total_weight
    
    # Get vector similarity results
    vector_results = await retrieve_similar_contexts(query, contexts, top_k=len(contexts))
    
    # Get keyword matching results
    keyword_results = await retrieve_context_by_keywords(keywords, contexts, top_k=len(contexts))
    
    # Create dictionaries for easy lookup
    vector_scores = {context.business_id: score for context, score in vector_results}
    keyword_scores = {context.business_id: score / max(len(keywords), 1) for context, score in keyword_results}
    
    # Combine scores
    combined_results = []
    
    for context in contexts:
        vector_score = vector_scores.get(context.business_id, 0.0)
        keyword_score = keyword_scores.get(context.business_id, 0.0)
        
        # Calculate combined score
        combined_score = (vector_score * vector_weight) + (keyword_score * keyword_weight)
        
        combined_results.append((context, combined_score))
    
    # Sort by combined score (descending) and take top_k
    combined_results.sort(key=lambda x: x[1], reverse=True)
    return combined_results[:top_k]


async def extract_keywords_from_query(query: str, max_keywords: int = 5) -> List[str]:
    """
    Extract keywords from a query text.
    
    Args:
        query: The query text to extract keywords from
        max_keywords: Maximum number of keywords to extract
    
    Returns:
        List of extracted keywords
    """
    # This is a simple implementation that splits the query into words,
    # removes stop words, and returns the most frequent words.
    # In a production system, you would use a more sophisticated approach,
    # such as TF-IDF, TextRank, or a pre-trained keyword extraction model.
    
    # Define a simple list of stop words
    stop_words = {
        "a", "an", "the", "and", "or", "but", "if", "because", "as", "what",
        "when", "where", "how", "who", "which", "this", "that", "these", "those",
        "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
        "do", "does", "did", "can", "could", "will", "would", "should", "shall",
        "may", "might", "must", "to", "for", "with", "about", "against", "between",
        "into", "through", "during", "before", "after", "above", "below", "from",
        "up", "down", "in", "out", "on", "off", "over", "under", "again", "further",
        "then", "once", "here", "there", "all", "any", "both", "each", "few", "more",
        "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same",
        "so", "than", "too", "very", "just", "now"
    }
    
    # Tokenize the query
    words = query.lower().split()
    
    # Remove stop words and punctuation
    filtered_words = []
    for word in words:
        # Remove punctuation
        word = ''.join(c for c in word if c.isalnum())
        
        # Skip stop words and short words
        if word and word not in stop_words and len(word) > 2:
            filtered_words.append(word)
    
    # Count word frequencies
    word_counts = {}
    for word in filtered_words:
        word_counts[word] = word_counts.get(word, 0) + 1
    
    # Sort by frequency and take top max_keywords
    sorted_words = sorted(word_counts.items(), key=lambda x: x[1], reverse=True)
    keywords = [word for word, count in sorted_words[:max_keywords]]
    
    return keywords
