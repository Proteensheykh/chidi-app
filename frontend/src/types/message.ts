export type MessageType = {
  id: string;
  content: string;
  sender: "user" | "assistant" | "system";
  timestamp: Date;
  messageType?: "text" | "options" | "form" | "richText" | "actionCard";
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
  options?: MessageOption[];
  formInputs?: FormInput[];
  richContent?: RichContent;
  actionCard?: ActionCard;
};

export type MessageOption = {
  id: string;
  text: string;
  value: string;
  action?: "submit" | "next" | "select";
};

export type FormInput = {
  id: string;
  type: "text" | "select" | "number" | "textarea" | "checkbox" | "radio";
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  value?: string | number | boolean;
};

export type RichContent = {
  html: string;
};

export type ActionCard = {
  type: "upload" | "link" | "connect" | "custom";
  title: string;
  description?: string;
  actionText: string;
  icon?: string;
};

export type OnboardingProgressType = {
  percentage: number;
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
};
