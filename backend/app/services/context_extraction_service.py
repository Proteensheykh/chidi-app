import logging
import json
import asyncio
from typing import Dict, Any, List, Optional

import openai
from openai import AsyncOpenAI

from app.core.config import settings
from app.schemas.business_context import BusinessProfile, BusinessContext
from app.schemas.onboarding import OnboardingState, OnboardingMessage

logger = logging.getLogger(__name__)

# Initialize OpenAI client
openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def extract_business_context(business_id: str, onboarding_state: OnboardingState) -> BusinessContext:
    """
    Extract structured business context from onboarding conversations.
    
    Args:
        business_id: The business ID
        onboarding_state: The onboarding state containing conversation history
    
    Returns:
        Structured business context
    """
    # Check if OpenAI API key is configured
    if not settings.OPENAI_API_KEY:
        logger.warning("OpenAI API key not set. Using basic context extraction.")
        return await extract_basic_context(business_id, onboarding_state)
    
    try:
        # Create conversation history for context
        conversation_history = _prepare_conversation_for_extraction(onboarding_state)
        
        # Extract business profile using OpenAI
        profile = await extract_business_profile(conversation_history)
        
        # Extract keywords
        keywords = await extract_keywords(conversation_history, profile)
        
        # Generate insights
        insights = await generate_business_insights(conversation_history, profile)
        
        # Generate recommendations
        recommendations = await generate_recommendations(profile, insights)
        
        # Create and return the business context
        return BusinessContext(
            business_id=business_id,
            profile=profile,
            keywords=keywords,
            insights=insights,
            recommendations=recommendations
        )
        
    except Exception as e:
        logger.error(f"Error extracting business context: {str(e)}")
        # Fall back to basic extraction if AI fails
        return await extract_basic_context(business_id, onboarding_state)


async def extract_basic_context(business_id: str, onboarding_state: OnboardingState) -> BusinessContext:
    """
    Extract basic business context from onboarding state without using AI.
    
    Args:
        business_id: The business ID
        onboarding_state: The onboarding state containing business data
    
    Returns:
        Basic business context
    """
    profile = BusinessProfile()
    
    # Extract data from businessData dictionary
    business_data = onboarding_state.businessData
    
    if business_data:
        if "name" in business_data:
            profile.name = business_data["name"]
        
        if "type" in business_data:
            profile.type = business_data["type"]
        
        if "description" in business_data:
            profile.description = business_data["description"]
        
        if "employees" in business_data:
            try:
                profile.employees = int(business_data["employees"])
            except (ValueError, TypeError):
                pass
        
        if "yearFounded" in business_data:
            try:
                profile.year_founded = int(business_data["yearFounded"])
            except (ValueError, TypeError):
                pass
        
        if "targetAudience" in business_data:
            profile.target_audience = business_data["targetAudience"]
    
    # Create a basic context with just the profile
    return BusinessContext(
        business_id=business_id,
        profile=profile,
        keywords=[profile.type] if profile.type else [],
        insights={},
        recommendations=[]
    )


def _prepare_conversation_for_extraction(onboarding_state: OnboardingState) -> List[Dict[str, Any]]:
    """
    Prepare conversation history for context extraction.
    
    Args:
        onboarding_state: The onboarding state
    
    Returns:
        A list of message dictionaries suitable for context extraction
    """
    history = []
    
    # Add business data as a system message for context
    if onboarding_state.businessData:
        business_data_str = "Business data collected during onboarding:\n"
        for key, value in onboarding_state.businessData.items():
            business_data_str += f"- {key}: {value}\n"
        history.append({"role": "system", "content": business_data_str})
    
    # Add conversation history
    for message in onboarding_state.conversationHistory:
        if message.sender == "user":
            if message.messageType == "text":
                history.append({"role": "user", "content": message.content})
            elif message.messageType == "option_selected" and hasattr(message, 'selectedOption') and message.selectedOption:
                history.append({"role": "user", "content": f"I selected: {message.selectedOption.text}"})
            elif message.messageType == "form_submitted" and hasattr(message, 'formData') and message.formData:
                form_content = "I submitted the form with the following information:\n"
                for key, value in message.formData.items():
                    form_content += f"- {key}: {value}\n"
                history.append({"role": "user", "content": form_content})
        else:  # assistant messages
            if message.messageType in ["text", "rich_text"]:
                history.append({"role": "assistant", "content": message.content})
            elif message.messageType == "options" and message.options:
                options_text = message.content + "\nOptions: " + ", ".join([opt.text for opt in message.options])
                history.append({"role": "assistant", "content": options_text})
            elif message.messageType == "form" and message.formInputs:
                form_text = message.content + "\nForm with fields: " + ", ".join([input.label for input in message.formInputs])
                history.append({"role": "assistant", "content": form_text})
    
    return history


async def extract_business_profile(conversation_history: List[Dict[str, Any]]) -> BusinessProfile:
    """
    Extract business profile information from conversation history using OpenAI.
    
    Args:
        conversation_history: The conversation history
    
    Returns:
        A structured business profile
    """
    system_prompt = """
    You are an AI assistant that extracts structured business profile information from conversations.
    Extract as much relevant information as possible about the business from the conversation.
    Focus on factual information only, do not make assumptions.
    """
    
    function_definition = {
        "name": "extract_business_profile",
        "description": "Extract business profile information from conversation",
        "parameters": {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string",
                    "description": "Business name"
                },
                "type": {
                    "type": "string",
                    "description": "Business type/industry"
                },
                "description": {
                    "type": "string",
                    "description": "Business description"
                },
                "employees": {
                    "type": "integer",
                    "description": "Number of employees"
                },
                "year_founded": {
                    "type": "integer",
                    "description": "Year the business was founded"
                },
                "target_audience": {
                    "type": "string",
                    "description": "Target audience (B2B, B2C, Both)"
                },
                "products_services": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Products or services offered"
                },
                "key_challenges": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Key business challenges"
                },
                "goals": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Business goals"
                },
                "unique_selling_points": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Unique selling points"
                },
                "competitors": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Known competitors"
                }
            },
            "required": []
        }
    }
    
    messages = [
        {"role": "system", "content": system_prompt},
        *conversation_history
    ]
    
    # Call OpenAI API
    response = await openai_client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=messages,
        functions=[function_definition],
        function_call={"name": "extract_business_profile"},
        temperature=0.1,  # Low temperature for more factual extraction
    )
    
    # Process the response
    ai_message = response.choices[0].message
    
    if ai_message.function_call:
        # Parse function call
        function_args = json.loads(ai_message.function_call.arguments)
        return BusinessProfile(**function_args)
    else:
        # Fallback to empty profile if no function call
        return BusinessProfile()


async def extract_keywords(
    conversation_history: List[Dict[str, Any]], 
    profile: BusinessProfile
) -> List[str]:
    """
    Extract relevant keywords from conversation history and business profile.
    
    Args:
        conversation_history: The conversation history
        profile: The business profile
    
    Returns:
        A list of keywords
    """
    system_prompt = """
    You are an AI assistant that extracts relevant business keywords from conversations.
    Extract 5-10 keywords that best represent the business and its context.
    Focus on industry-specific terms, business categories, and distinctive features.
    Return only the keywords as a JSON array of strings.
    """
    
    # Add profile information to the conversation for better context
    profile_dict = profile.model_dump()
    profile_message = "Business profile information:\n"
    for key, value in profile_dict.items():
        if value and key not in ["created_at", "updated_at"]:
            profile_message += f"- {key}: {value}\n"
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": profile_message},
        *conversation_history
    ]
    
    function_definition = {
        "name": "extract_keywords",
        "description": "Extract business keywords",
        "parameters": {
            "type": "object",
            "properties": {
                "keywords": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of business keywords"
                }
            },
            "required": ["keywords"]
        }
    }
    
    # Call OpenAI API
    response = await openai_client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=messages,
        functions=[function_definition],
        function_call={"name": "extract_keywords"},
        temperature=0.3,
    )
    
    # Process the response
    ai_message = response.choices[0].message
    
    if ai_message.function_call:
        # Parse function call
        function_args = json.loads(ai_message.function_call.arguments)
        return function_args.get("keywords", [])
    else:
        # Fallback to empty list if no function call
        return []


async def generate_business_insights(
    conversation_history: List[Dict[str, Any]],
    profile: BusinessProfile
) -> Dict[str, Any]:
    """
    Generate business insights based on conversation history and profile.
    
    Args:
        conversation_history: The conversation history
        profile: The business profile
    
    Returns:
        A dictionary of business insights
    """
    system_prompt = """
    You are an AI assistant that generates business insights from conversations and profile data.
    Generate 3-5 key insights about the business based on the information provided.
    Focus on actionable insights related to market positioning, growth opportunities, and potential challenges.
    Structure your response as a JSON object with insight categories as keys and detailed insights as values.
    """
    
    # Add profile information to the conversation for better context
    profile_dict = profile.model_dump()
    profile_message = "Business profile information:\n"
    for key, value in profile_dict.items():
        if value and key not in ["created_at", "updated_at"]:
            profile_message += f"- {key}: {value}\n"
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": profile_message},
        *conversation_history
    ]
    
    function_definition = {
        "name": "generate_business_insights",
        "description": "Generate business insights",
        "parameters": {
            "type": "object",
            "properties": {
                "market_positioning": {
                    "type": "string",
                    "description": "Insight about market positioning"
                },
                "growth_opportunities": {
                    "type": "string",
                    "description": "Insight about growth opportunities"
                },
                "potential_challenges": {
                    "type": "string",
                    "description": "Insight about potential challenges"
                },
                "competitive_advantage": {
                    "type": "string",
                    "description": "Insight about competitive advantage"
                },
                "customer_needs": {
                    "type": "string",
                    "description": "Insight about customer needs"
                }
            },
            "required": []
        }
    }
    
    # Call OpenAI API
    response = await openai_client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=messages,
        functions=[function_definition],
        function_call={"name": "generate_business_insights"},
        temperature=0.5,
    )
    
    # Process the response
    ai_message = response.choices[0].message
    
    if ai_message.function_call:
        # Parse function call
        function_args = json.loads(ai_message.function_call.arguments)
        return {k: v for k, v in function_args.items() if v}
    else:
        # Fallback to empty dict if no function call
        return {}


async def generate_recommendations(
    profile: BusinessProfile,
    insights: Dict[str, Any]
) -> List[str]:
    """
    Generate business recommendations based on profile and insights.
    
    Args:
        profile: The business profile
        insights: The business insights
    
    Returns:
        A list of business recommendations
    """
    system_prompt = """
    You are an AI assistant that generates business recommendations based on profile and insights.
    Generate 3-5 actionable recommendations for the business.
    Each recommendation should be clear, specific, and actionable.
    Return only the recommendations as a JSON array of strings.
    """
    
    # Create messages with profile and insights
    profile_dict = profile.model_dump()
    profile_message = "Business profile information:\n"
    for key, value in profile_dict.items():
        if value and key not in ["created_at", "updated_at"]:
            profile_message += f"- {key}: {value}\n"
    
    insights_message = "Business insights:\n"
    for key, value in insights.items():
        insights_message += f"- {key}: {value}\n"
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": profile_message},
        {"role": "user", "content": insights_message}
    ]
    
    function_definition = {
        "name": "generate_recommendations",
        "description": "Generate business recommendations",
        "parameters": {
            "type": "object",
            "properties": {
                "recommendations": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of business recommendations"
                }
            },
            "required": ["recommendations"]
        }
    }
    
    # Call OpenAI API
    response = await openai_client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=messages,
        functions=[function_definition],
        function_call={"name": "generate_recommendations"},
        temperature=0.5,
    )
    
    # Process the response
    ai_message = response.choices[0].message
    
    if ai_message.function_call:
        # Parse function call
        function_args = json.loads(ai_message.function_call.arguments)
        return function_args.get("recommendations", [])
    else:
        # Fallback to empty list if no function call
        return []
