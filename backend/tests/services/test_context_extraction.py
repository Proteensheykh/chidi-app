import pytest
import json
from datetime import datetime
from typing import Dict, Any

from app.schemas.onboarding import OnboardingState, OnboardingMessage, MessageOption
from app.services.context_extraction_service import (
    extract_business_context,
    extract_business_profile,
    extract_keywords,
    generate_business_insights,
    generate_recommendations,
    extract_basic_context
)


@pytest.fixture
def sample_onboarding_state():
    """Create a sample onboarding state for testing."""
    # Create a list of messages simulating an onboarding conversation
    messages = [
        OnboardingMessage(
            id="1",
            content="Welcome to CHIDI! Let's set up your business workspace. What's your business name?",
            sender="assistant",
            timestamp=datetime.utcnow(),
            messageType="text"
        ),
        OnboardingMessage(
            id="2",
            content="TechSolutions Inc.",
            sender="user",
            timestamp=datetime.utcnow(),
            messageType="text"
        ),
        OnboardingMessage(
            id="3",
            content="Great! What type of business is TechSolutions Inc.?",
            sender="assistant",
            timestamp=datetime.utcnow(),
            messageType="options",
            options=[
                MessageOption(id="1", text="Technology", value="technology", action=None),
                MessageOption(id="2", text="Retail", value="retail", action=None),
                MessageOption(id="3", text="Service", value="service", action=None),
                MessageOption(id="4", text="Manufacturing", value="manufacturing", action=None),
                MessageOption(id="5", text="Other", value="other", action=None)
            ]
        ),
        OnboardingMessage(
            id="4",
            content="",
            sender="user",
            timestamp=datetime.utcnow(),
            messageType="option_selected",
            selectedOption=MessageOption(id="1", text="Technology", value="technology", action=None)
        ),
        OnboardingMessage(
            id="5",
            content="Please tell me more about your business. What does TechSolutions Inc. do?",
            sender="assistant",
            timestamp=datetime.utcnow(),
            messageType="text"
        ),
        OnboardingMessage(
            id="6",
            content="We develop AI-powered software solutions for small businesses to automate their customer support and data analysis.",
            sender="user",
            timestamp=datetime.utcnow(),
            messageType="text"
        ),
        OnboardingMessage(
            id="7",
            content="That sounds interesting! Let me collect some more details about your business.",
            sender="assistant",
            timestamp=datetime.utcnow(),
            messageType="form",
            formInputs=[
                {"id": "employees", "type": "number", "label": "Number of employees", "required": True},
                {"id": "yearFounded", "type": "number", "label": "Year founded", "required": True},
                {"id": "website", "type": "text", "label": "Website URL", "required": False}
            ]
        ),
        OnboardingMessage(
            id="8",
            content="",
            sender="user",
            timestamp=datetime.utcnow(),
            messageType="form_submitted",
            formData={
                "employees": "15",
                "yearFounded": "2020",
                "website": "https://techsolutions.example.com"
            }
        ),
        OnboardingMessage(
            id="9",
            content="Who is your target audience?",
            sender="assistant",
            timestamp=datetime.utcnow(),
            messageType="options",
            options=[
                MessageOption(id="1", text="B2B (Business to Business)", value="b2b", action=None),
                MessageOption(id="2", text="B2C (Business to Consumer)", value="b2c", action=None),
                MessageOption(id="3", text="Both B2B and B2C", value="both", action=None)
            ]
        ),
        OnboardingMessage(
            id="10",
            content="",
            sender="user",
            timestamp=datetime.utcnow(),
            messageType="option_selected",
            selectedOption=MessageOption(id="1", text="B2B (Business to Business)", value="b2b", action=None)
        )
    ]
    
    # Create the business data dictionary
    business_data = {
        "name": "TechSolutions Inc.",
        "type": "Technology",
        "description": "We develop AI-powered software solutions for small businesses to automate their customer support and data analysis.",
        "employees": "15",
        "yearFounded": "2020",
        "website": "https://techsolutions.example.com",
        "targetAudience": "B2B (Business to Business)"
    }
    
    # Create and return the onboarding state
    return OnboardingState(
        currentStep=5,  # Completed all steps
        totalSteps=5,
        stepTitle="Complete",
        percentage=100,
        businessData=business_data,
        conversationHistory=messages
    )


@pytest.mark.asyncio
async def test_extract_basic_context(sample_onboarding_state):
    """Test basic context extraction without OpenAI."""
    business_id = "test_business_id"
    
    # Extract context using the basic method
    context = await extract_basic_context(business_id, sample_onboarding_state)
    
    # Verify the extracted context
    assert context.business_id == business_id
    assert context.profile.name == "TechSolutions Inc."
    assert context.profile.type == "Technology"
    assert context.profile.description == "We develop AI-powered software solutions for small businesses to automate their customer support and data analysis."
    assert context.profile.employees == 15
    assert context.profile.year_founded == 2020
    assert context.profile.target_audience == "B2B (Business to Business)"
    assert "Technology" in context.keywords


@pytest.mark.asyncio
async def test_extract_business_context_integration(sample_onboarding_state, monkeypatch):
    """Test the full business context extraction flow with mocked OpenAI."""
    business_id = "test_business_id"
    
    # Mock the OpenAI client to avoid actual API calls
    async def mock_extract_business_profile(*args, **kwargs):
        return {
            "name": "TechSolutions Inc.",
            "type": "Technology - AI Software",
            "description": "AI-powered software solutions for small businesses",
            "employees": 15,
            "year_founded": 2020,
            "target_audience": "B2B",
            "products_services": ["AI Customer Support", "Data Analysis Tools"],
            "key_challenges": ["Market competition", "Technical talent acquisition"],
            "goals": ["Expand product line", "Increase market share"],
            "unique_selling_points": ["AI-powered automation", "Small business focus"],
            "competitors": ["BigAI Corp", "SmartSolutions Ltd"]
        }
    
    async def mock_extract_keywords(*args, **kwargs):
        return ["AI", "Software", "Automation", "Small Business", "Customer Support", "Data Analysis", "B2B", "Technology"]
    
    async def mock_generate_business_insights(*args, **kwargs):
        return {
            "market_positioning": "Niche provider of AI solutions for small businesses",
            "growth_opportunities": "Expanding into medium-sized business market",
            "potential_challenges": "Competition from larger, established AI companies"
        }
    
    async def mock_generate_recommendations(*args, **kwargs):
        return [
            "Focus on vertical-specific AI solutions",
            "Develop partnership program with complementary service providers",
            "Invest in AI talent acquisition and retention"
        ]
    
    # Apply the mocks
    monkeypatch.setattr("app.services.context_extraction_service.extract_business_profile", 
                       lambda *args, **kwargs: mock_extract_business_profile(*args, **kwargs))
    monkeypatch.setattr("app.services.context_extraction_service.extract_keywords", 
                       lambda *args, **kwargs: mock_extract_keywords(*args, **kwargs))
    monkeypatch.setattr("app.services.context_extraction_service.generate_business_insights", 
                       lambda *args, **kwargs: mock_generate_business_insights(*args, **kwargs))
    monkeypatch.setattr("app.services.context_extraction_service.generate_recommendations", 
                       lambda *args, **kwargs: mock_generate_recommendations(*args, **kwargs))
    
    # Extract context
    context = await extract_business_context(business_id, sample_onboarding_state)
    
    # Verify the extracted context
    assert context.business_id == business_id
    assert context.profile.name == "TechSolutions Inc."
    assert context.profile.type == "Technology - AI Software"
    assert "AI" in context.keywords
    assert "Software" in context.keywords
    assert "market_positioning" in context.insights
    assert len(context.recommendations) == 3
    
    # Print the context for debugging
    print(json.dumps(context.model_dump(), indent=2, default=str))
