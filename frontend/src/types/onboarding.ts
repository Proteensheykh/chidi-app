export type MessageSender = 'user' | 'assistant' | 'system';

export type MessageType = 
  | 'text'
  | 'options'
  | 'form'
  | 'rich_text'
  | 'action_card'
  | 'system_message'
  | 'user_message'
  | 'assistant_message'
  | 'typing_indicator'
  | 'option_selection'
  | 'form_submission'
  | 'action_trigger'
  | 'error';

export interface MessageOption {
  id: string;
  text: string;
  value: string;
  action?: string;
}

export interface FormInput {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{
    label: string;
    value: string;
  }>;
  value?: any;
}

export interface RichContent {
  html: string;
}

export interface ActionCard {
  type: string;
  title: string;
  description?: string;
  actionText: string;
  icon?: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
}

export interface OnboardingMessage {
  id: string;
  content: string;
  sender: MessageSender;
  timestamp: string;
  messageType?: MessageType;
  attachments?: Attachment[];
  options?: MessageOption[];
  formInputs?: FormInput[];
  richContent?: RichContent;
  actionCard?: ActionCard;
}

export interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  percentage: number;
  businessData: Record<string, any>;
  conversationHistory: OnboardingMessage[];
}
