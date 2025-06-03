'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  options?: string[];
  files?: {
    name: string;
    url: string;
    type: string;
  }[];
}

interface ConversationalUIProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onOptionSelect?: (option: string) => void;
  onFileUpload?: (files: File[]) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

export function ConversationalUI({
  messages,
  onSendMessage,
  onOptionSelect,
  onFileUpload,
  isLoading = false,
  placeholder = 'Type a message...',
  className
}: ConversationalUIProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onFileUpload) {
      onFileUpload(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex items-start gap-3 max-w-[80%]",
              message.role === 'user' ? "ml-auto" : "mr-auto"
            )}
          >
            {message.role === 'assistant' && (
              <Avatar className="h-8 w-8 bg-[#1A4A3A]">
                <AvatarFallback className="text-white">C</AvatarFallback>
              </Avatar>
            )}
            
            <div className="flex flex-col gap-2">
              <div
                className={cn(
                  "rounded-lg p-3",
                  message.role === 'user'
                    ? "bg-[#1A4A3A] text-white"
                    : "bg-[#E8F2ED] text-[#1A4A3A]"
                )}
              >
                {message.content}
              </div>
              
              {message.options && message.options.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {message.options.map((option, optIndex) => (
                    <Button
                      key={optIndex}
                      variant="outline"
                      size="sm"
                      className="border-[#1A4A3A] text-[#1A4A3A] hover:bg-[#E8F2ED]"
                      onClick={() => onOptionSelect && onOptionSelect(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}
              
              {message.files && message.files.length > 0 && (
                <div className="flex flex-col gap-2 mt-2">
                  {message.files.map((file, fileIndex) => (
                    <div
                      key={fileIndex}
                      className="flex items-center gap-2 p-2 rounded bg-[#F8FAFC] border border-[#E2E8F0]"
                    >
                      <Icons.file className="h-4 w-4 text-[#64748B]" />
                      <span className="text-sm text-[#334155] truncate">{file.name}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="text-xs text-[#94A3B8] ml-auto">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            
            {message.role === 'user' && (
              <Avatar className="h-8 w-8 bg-[#64748B]">
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start gap-3 max-w-[80%] mr-auto">
            <Avatar className="h-8 w-8 bg-[#1A4A3A]">
              <AvatarFallback className="text-white">C</AvatarFallback>
            </Avatar>
            <div className="bg-[#E8F2ED] text-[#1A4A3A] rounded-lg p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#1A4A3A] rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-[#1A4A3A] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-[#1A4A3A] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t border-[#E2E8F0] bg-white">
        <div className="flex items-center gap-2">
          {onFileUpload && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-[#64748B] hover:text-[#1A4A3A]"
                onClick={() => fileInputRef.current?.click()}
              >
                <Icons.paperclip className="h-5 w-5" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
            </>
          )}
          
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className="flex-1 border-[#E2E8F0] focus-visible:ring-[#1A4A3A]"
            disabled={isLoading}
          />
          
          <Button
            type="submit"
            variant="default"
            size="icon"
            className="bg-[#1A4A3A] hover:bg-[#0D3625]"
            disabled={!inputValue.trim() || isLoading}
          >
            <Icons.send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
