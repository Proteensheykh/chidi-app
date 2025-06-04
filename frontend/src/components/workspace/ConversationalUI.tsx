"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export type MessageType = {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
};

export type OnboardingProgressType = {
  percentage: number;
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
};

interface ConversationalUIProps {
  messages: MessageType[];
  onSendMessage: (message: string) => void;
  onFileUpload?: (file: File) => void;
  isTyping?: boolean;
  isOnboarding?: boolean;
  onboardingProgress?: OnboardingProgressType;
}

export function ConversationalUI({
  messages,
  onSendMessage,
  onFileUpload,
  isTyping = false,
  isOnboarding = false,
  onboardingProgress,
}: ConversationalUIProps) {
  const [inputValue, setInputValue] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && onFileUpload) {
      setIsUploading(true);
      try {
        await onFileUpload(files[0]);
      } catch (error) {
        console.error("Error uploading file:", error);
      } finally {
        setIsUploading(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-full bg-white border border-light-border rounded-md">
      {/* Onboarding Progress Bar - Only shown during onboarding */}
      {isOnboarding && onboardingProgress && (
        <div className="px-4 py-3 bg-soft-sage border-b border-light-border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-charcoal">
              {onboardingProgress.stepTitle}
            </span>
            <span className="text-sm text-slate-gray">
              Step {onboardingProgress.currentStep} of {onboardingProgress.totalSteps}
            </span>
          </div>
          <Progress 
            value={onboardingProgress.percentage} 
            className="h-2 bg-light-border [&>div]:bg-fresh-mint" 
          />
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-tech-gray/50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.sender === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "flex gap-3 max-w-[80%]",
                message.sender === "user" && "flex-row-reverse"
              )}
            >
              <Avatar className={cn(
                "h-8 w-8 flex items-center justify-center",
                message.sender === "assistant" ? "bg-chidi-forest text-pure-white" : "bg-fresh-mint text-charcoal border border-white shadow-sm"
              )}>
                <span className="text-xs font-bold">
                  {message.sender === "assistant" ? "AI" : "You"}
                </span>
              </Avatar>
              
              <div className="space-y-1">
                {message.sender === "user" ? (
                  <div className="bg-fresh-mint text-charcoal p-3 inline-block rounded-2xl min-w-[120px] shadow-sm border border-fresh-mint">
                    <p className="text-sm whitespace-pre-wrap font-medium">
                      {message.content || "Liz and co"}
                    </p>
                  </div>
                ) : (
                  <div className="bg-soft-sage text-charcoal p-3 inline-block rounded-2xl min-w-[120px] shadow-sm border border-light-border">
                    <p className="text-sm whitespace-pre-wrap font-medium">
                      {message.content || "(Empty message)"}
                    </p>
                  </div>
                )}
                
                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {message.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center bg-tech-gray rounded-lg p-2 text-xs"
                      >
                        <Paperclip className="h-3 w-3 mr-1" />
                        <span className="truncate max-w-[120px]">
                          {attachment.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div
                  className={cn(
                    "text-xs text-slate-gray",
                    message.sender === "user" ? "text-right" : "text-left"
                  )}
                >
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[80%]">
              <Avatar className="h-8 w-8 bg-chidi-forest text-white">
                <span className="text-xs">AI</span>
              </Avatar>
              <Card className="p-3 inline-block rounded-2xl bg-soft-sage">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-slate-gray rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 bg-slate-gray rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 bg-slate-gray rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </Card>
            </div>
          </div>
        )}
        
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-light-border p-4 bg-white shadow-inner">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          
          {onFileUpload && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={triggerFileUpload}
              disabled={isUploading}
              className="text-slate-gray hover:text-charcoal hover:bg-soft-sage"
            >
              {isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Paperclip className="h-5 w-5" />
              )}
            </Button>
          )}
          
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border-light-border bg-white focus-visible:ring-chidi-forest h-10 text-base px-4"
          />
          
          <Button
            type="submit"
            size="icon"
            disabled={!inputValue.trim()}
            className="bg-chidi-forest text-base hover:bg-chidi-forest/90 shadow-md h-10 w-10"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
