from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum


class MessageType(str, Enum):
    USER_MESSAGE = "user_message"
    ASSISTANT_MESSAGE = "assistant_message"
    SYSTEM_MESSAGE = "system_message"
    TYPING_INDICATOR = "typing_indicator"
    OPTION_SELECTION = "option_selection"
    FORM_SUBMISSION = "form_submission"
    ACTION_TRIGGER = "action_trigger"
    ERROR = "error"


class MessageOption(BaseModel):
    id: str
    text: str
    value: str
    action: Optional[str] = None


class FormInput(BaseModel):
    id: str
    type: str
    label: str
    placeholder: Optional[str] = None
    required: Optional[bool] = False
    options: Optional[List[Dict[str, str]]] = None
    value: Optional[Any] = None


class RichContent(BaseModel):
    html: str


class ActionCard(BaseModel):
    type: str
    title: str
    description: Optional[str] = None
    actionText: str
    icon: Optional[str] = None


class Attachment(BaseModel):
    id: str
    name: str
    url: str
    type: str


class OnboardingMessage(BaseModel):
    id: str = Field(..., description="Unique message identifier")
    content: str = Field(..., description="Message content")
    sender: str = Field(..., description="Message sender (user or assistant)")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Message timestamp")
    messageType: Optional[str] = Field(None, description="Type of message (text, options, form, etc.)")
    attachments: Optional[List[Attachment]] = Field(None, description="Message attachments")
    options: Optional[List[MessageOption]] = Field(None, description="Options for selection")
    formInputs: Optional[List[FormInput]] = Field(None, description="Form inputs for data collection")
    richContent: Optional[RichContent] = Field(None, description="Rich formatted content")
    actionCard: Optional[ActionCard] = Field(None, description="Action card for special interactions")


class OnboardingState(BaseModel):
    currentStep: int = Field(1, description="Current onboarding step")
    totalSteps: int = Field(5, description="Total number of onboarding steps")
    stepTitle: str = Field("Welcome", description="Title of the current step")
    percentage: int = Field(0, description="Percentage of onboarding completed")
    businessData: Dict[str, Any] = Field(default_factory=dict, description="Collected business data")
    conversationHistory: List[OnboardingMessage] = Field(default_factory=list, description="Conversation history")


class WebSocketMessage(BaseModel):
    type: MessageType
    content: Optional[str] = None
    options: Optional[List[MessageOption]] = None
    formInputs: Optional[List[FormInput]] = None
    formData: Optional[Dict[str, Any]] = None
    actionType: Optional[str] = None
    conversationId: Optional[str] = None
