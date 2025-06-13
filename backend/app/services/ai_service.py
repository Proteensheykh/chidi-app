import logging
import asyncio
import uuid
import json
from datetime import datetime
from typing import Dict, Any, List, Optional, AsyncGenerator

import openai
from openai import AsyncOpenAI

from app.core.config import settings
from app.schemas.onboarding import OnboardingMessage, OnboardingState, MessageOption, FormInput, RichContent, ActionCard

logger = logging.getLogger(__name__)

# Initialize OpenAI client
openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

async def generate_onboarding_response(
    user_message: OnboardingMessage, 
    onboarding_state: OnboardingState
) -> OnboardingMessage:
    """
    Generate an AI response for the onboarding process using OpenAI.
    
    Args:
        user_message: The user's message
        onboarding_state: The current onboarding state
    
    Returns:
        An AI response message
    """
    # Check if OpenAI API key is configured
    if not settings.OPENAI_API_KEY:
        logger.warning("OpenAI API key not set. Using fallback responses.")
        return await generate_fallback_response(user_message, onboarding_state)
    
    try:
        # Get current step
        current_step = onboarding_state.currentStep
        
        # Create conversation history for context
        conversation_history = create_conversation_history(onboarding_state)
        
        # Generate response using OpenAI
        response = await generate_ai_response(user_message, conversation_history, current_step)
        return response
        
    except Exception as e:
        logger.error(f"Error generating AI response: {str(e)}")
        # Fall back to rule-based responses if AI fails
        return await generate_fallback_response(user_message, onboarding_state)


async def generate_ai_response(
    user_message: OnboardingMessage,
    conversation_history: List[Dict[str, Any]],
    current_step: int
) -> OnboardingMessage:
    """
    Generate a response using OpenAI API.
    
    Args:
        user_message: The user's message
        conversation_history: The conversation history
        current_step: The current onboarding step
    
    Returns:
        An AI-generated response message
    """
    # Create system prompt based on current step
    system_prompt = get_system_prompt(current_step)
    
    # Define the expected response format based on the current step
    function_definitions = get_function_definitions(current_step)
    
    messages = [
        {"role": "system", "content": system_prompt},
        *conversation_history,
        {"role": "user", "content": user_message.content if user_message.content else "[User selected an option or submitted a form]"}
    ]
    
    # Call OpenAI API
    response = await openai_client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=messages,
        functions=function_definitions if function_definitions else None,
        function_call="auto" if function_definitions else None,
        temperature=0.7,
    )
    
    # Process the response
    ai_message = response.choices[0].message
    
    # Check if the response includes a function call
    if ai_message.function_call:
        # Parse function call
        function_name = ai_message.function_call.name
        function_args = json.loads(ai_message.function_call.arguments)
        
        # Create appropriate message based on function call
        return create_message_from_function_call(function_name, function_args)
    else:
        # Create a simple text message
        return OnboardingMessage(
            id=str(uuid.uuid4()),
            content=ai_message.content,
            sender="assistant",
            timestamp=datetime.utcnow(),
            messageType="text"
        )


def create_conversation_history(onboarding_state: OnboardingState) -> List[Dict[str, Any]]:
    """
    Create a conversation history from the onboarding state for context.
    
    Args:
        onboarding_state: The current onboarding state
    
    Returns:
        A list of message dictionaries for the OpenAI API
    """
    history = []
    
    for message in onboarding_state.messages:
        if message.sender == "user":
            if message.messageType == "text":
                history.append({"role": "user", "content": message.content})
            elif message.messageType == "option_selected" and message.selectedOption:
                history.append({"role": "user", "content": f"I selected: {message.selectedOption.text}"})
            elif message.messageType == "form_submitted" and message.formData:
                form_content = "I submitted the form with the following information:\n"
                for key, value in message.formData.items():
                    form_content += f"- {key}: {value}\n"
                history.append({"role": "user", "content": form_content})
        else:  # assistant messages
            if message.messageType == "text" or message.messageType == "rich_text":
                history.append({"role": "assistant", "content": message.content})
            elif message.messageType == "options" and message.options:
                options_text = message.content + "\nOptions: " + ", ".join([opt.text for opt in message.options])
                history.append({"role": "assistant", "content": options_text})
            elif message.messageType == "form" and message.formInputs:
                form_text = message.content + "\nForm with fields: " + ", ".join([input.label for input in message.formInputs])
                history.append({"role": "assistant", "content": form_text})
    
    # Limit history to last 10 messages to avoid token limits
    return history[-10:]


def get_system_prompt(current_step: int) -> str:
    """
    Get the system prompt based on the current onboarding step.
    
    Args:
        current_step: The current onboarding step
    
    Returns:
        A system prompt string
    """
    base_prompt = (
        "You are an AI assistant helping a user set up their business workspace in the CHIDI app. "
        "Your goal is to gather relevant information about their business to personalize their experience. "
        "Be professional, friendly, and helpful. Ask one question at a time and guide the user through the onboarding process."
    )
    
    step_prompts = {
        1: base_prompt + " Start by asking for their business name in a welcoming way.",
        2: base_prompt + " Ask about their business type. Provide options like Retail, Service, Manufacturing, Technology, or Other.",
        3: base_prompt + " Ask for details about their business using a form with fields for description, number of employees, and year founded.",
        4: base_prompt + " Ask about their target audience. Provide options like B2C, B2B, or Both.",
        5: base_prompt + " Ask if they want to import existing business data. Provide an action card for file upload."
    }
    
    return step_prompts.get(current_step, base_prompt)


def get_function_definitions(current_step: int) -> List[Dict[str, Any]]:
    """
    Get the function definitions based on the current onboarding step.
    
    Args:
        current_step: The current onboarding step
    
    Returns:
        A list of function definitions for the OpenAI API
    """
    # Define functions for different steps
    functions = {
        2: [
            {
                "name": "provide_business_type_options",
                "description": "Provide options for business types",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "message": {
                            "type": "string",
                            "description": "The message to show before the options"
                        },
                        "options": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "text": {"type": "string", "description": "The display text for the option"},
                                    "value": {"type": "string", "description": "The value for the option"}
                                },
                                "required": ["text", "value"]
                            },
                            "description": "The list of business type options"
                        }
                    },
                    "required": ["message", "options"]
                }
            }
        ],
        3: [
            {
                "name": "create_business_details_form",
                "description": "Create a form to collect business details",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "message": {
                            "type": "string",
                            "description": "The message to show before the form"
                        },
                        "formInputs": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "id": {"type": "string", "description": "The ID for the form input"},
                                    "type": {"type": "string", "description": "The type of input (text, textarea, number, etc.)"},
                                    "label": {"type": "string", "description": "The label for the input"},
                                    "placeholder": {"type": "string", "description": "The placeholder text"},
                                    "required": {"type": "boolean", "description": "Whether the input is required"}
                                },
                                "required": ["id", "type", "label"]
                            },
                            "description": "The list of form inputs"
                        }
                    },
                    "required": ["message", "formInputs"]
                }
            }
        ],
        4: [
            {
                "name": "provide_target_audience_options",
                "description": "Provide options for target audience",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "message": {
                            "type": "string",
                            "description": "The message to show before the options"
                        },
                        "richContent": {
                            "type": "string",
                            "description": "HTML content to display"
                        },
                        "options": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "text": {"type": "string", "description": "The display text for the option"},
                                    "value": {"type": "string", "description": "The value for the option"}
                                },
                                "required": ["text", "value"]
                            },
                            "description": "The list of target audience options"
                        }
                    },
                    "required": ["message", "options"]
                }
            }
        ],
        5: [
            {
                "name": "create_data_import_action",
                "description": "Create an action card for data import",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "message": {
                            "type": "string",
                            "description": "The message to show before the action card"
                        },
                        "title": {
                            "type": "string",
                            "description": "The title of the action card"
                        },
                        "description": {
                            "type": "string",
                            "description": "The description of the action card"
                        },
                        "actionText": {
                            "type": "string",
                            "description": "The text for the action button"
                        }
                    },
                    "required": ["message", "title", "description", "actionText"]
                }
            }
        ]
    }
    
    return functions.get(current_step, [])


def create_message_from_function_call(function_name: str, args: Dict[str, Any]) -> OnboardingMessage:
    """
    Create an appropriate message based on the function call from OpenAI.
    
    Args:
        function_name: The name of the function called
        args: The arguments passed to the function
    
    Returns:
        An OnboardingMessage with the appropriate type and content
    """
    message_id = str(uuid.uuid4())
    timestamp = datetime.utcnow()
    
    if function_name == "provide_business_type_options":
        return OnboardingMessage(
            id=message_id,
            content=args.get("message", "What type of business do you have?"),
            sender="assistant",
            timestamp=timestamp,
            messageType="options",
            options=[
                MessageOption(id="business_type", text=opt["text"], value=opt["value"])
                for opt in args.get("options", [])
            ]
        )
    
    elif function_name == "create_business_details_form":
        return OnboardingMessage(
            id=message_id,
            content=args.get("message", "Please provide some details about your business:"),
            sender="assistant",
            timestamp=timestamp,
            messageType="form",
            formInputs=[
                FormInput(
                    id=input.get("id", f"field_{i}"),
                    type=input.get("type", "text"),
                    label=input.get("label", f"Field {i}"),
                    placeholder=input.get("placeholder", ""),
                    required=input.get("required", False)
                )
                for i, input in enumerate(args.get("formInputs", []))
            ]
        )
    
    elif function_name == "provide_target_audience_options":
        return OnboardingMessage(
            id=message_id,
            content=args.get("message", "Who is your target audience?"),
            sender="assistant",
            timestamp=timestamp,
            messageType="rich_text" if args.get("richContent") else "options",
            richContent=RichContent(html=args.get("richContent", "")) if args.get("richContent") else None,
            options=[
                MessageOption(id="audience", text=opt["text"], value=opt["value"])
                for opt in args.get("options", [])
            ]
        )
    
    elif function_name == "create_data_import_action":
        return OnboardingMessage(
            id=message_id,
            content=args.get("message", "Would you like to import existing business data?"),
            sender="assistant",
            timestamp=timestamp,
            messageType="action_card",
            actionCard=ActionCard(
                type="upload",
                title=args.get("title", "Import Business Data"),
                description=args.get("description", "Upload a CSV or Excel file with your business data"),
                actionText=args.get("actionText", "Upload File"),
                icon="upload"
            )
        )
    
    # Default to text message if function is not recognized
    return OnboardingMessage(
        id=message_id,
        content=str(args),
        sender="assistant",
        timestamp=timestamp,
        messageType="text"
    )


async def generate_fallback_response(
    user_message: OnboardingMessage, 
    onboarding_state: OnboardingState
) -> OnboardingMessage:
    """
    Generate a fallback response when OpenAI is not available.
    
    Args:
        user_message: The user's message
        onboarding_state: The current onboarding state
    
    Returns:
        A fallback response message
    """
    # Get current step
    current_step = onboarding_state.currentStep
    
    # Generate response based on current step
    if current_step == 1:
        # Welcome step - ask for business name
        return OnboardingMessage(
            id=str(uuid.uuid4()),
            content="Let's get started with setting up your workspace. What's the name of your business?",
            sender="assistant",
            timestamp=datetime.utcnow(),
            messageType="text"
        )
    
    elif current_step == 2:
        # Business type step - provide options
        return OnboardingMessage(
            id=str(uuid.uuid4()),
            content="What type of business do you have?",
            sender="assistant",
            timestamp=datetime.utcnow(),
            messageType="options",
            options=[
                MessageOption(id="business_type", text="Retail", value="retail"),
                MessageOption(id="business_type", text="Service", value="service"),
                MessageOption(id="business_type", text="Manufacturing", value="manufacturing"),
                MessageOption(id="business_type", text="Technology", value="technology"),
                MessageOption(id="business_type", text="Other", value="other")
            ]
        )
    
    elif current_step == 3:
        # Business details step - provide form
        return OnboardingMessage(
            id=str(uuid.uuid4()),
            content="Please provide some details about your business:",
            sender="assistant",
            timestamp=datetime.utcnow(),
            messageType="form",
            formInputs=[
                FormInput(
                    id="description",
                    type="textarea",
                    label="Business Description",
                    placeholder="Describe your business in a few sentences",
                    required=True
                ),
                FormInput(
                    id="employees",
                    type="number",
                    label="Number of Employees",
                    placeholder="e.g., 10",
                    required=False
                ),
                FormInput(
                    id="founded",
                    type="text",
                    label="Year Founded",
                    placeholder="e.g., 2020",
                    required=False
                )
            ]
        )
    
    elif current_step == 4:
        # Target audience step - rich text and options
        return OnboardingMessage(
            id=str(uuid.uuid4()),
            content="Who is your target audience?",
            sender="assistant",
            timestamp=datetime.utcnow(),
            messageType="rich_text",
            richContent=RichContent(
                html="<p>Understanding your <strong>target audience</strong> helps us customize your workspace.</p>"
            ),
            options=[
                MessageOption(id="audience", text="Consumers (B2C)", value="b2c"),
                MessageOption(id="audience", text="Businesses (B2B)", value="b2b"),
                MessageOption(id="audience", text="Both B2B and B2C", value="both")
            ]
        )
    
    elif current_step == 5:
        # Final step - action card for data import
        return OnboardingMessage(
            id=str(uuid.uuid4()),
            content="Would you like to import existing business data?",
            sender="assistant",
            timestamp=datetime.utcnow(),
            messageType="action_card",
            actionCard=ActionCard(
                type="upload",
                title="Import Business Data",
                description="Upload a CSV or Excel file with your business data",
                actionText="Upload File",
                icon="upload"
            )
        )
    
    else:
        # Default response
        return OnboardingMessage(
            id=str(uuid.uuid4()),
            content=f"I received your message: {user_message.content}",
            sender="assistant",
            timestamp=datetime.utcnow(),
            messageType="text"
        )
