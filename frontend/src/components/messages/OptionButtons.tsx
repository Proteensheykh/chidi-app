"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageOption } from "@/types/message";

interface OptionButtonsProps {
  options: MessageOption[];
  onOptionSelect: (option: MessageOption) => void;
  disabled?: boolean;
}

export function OptionButtons({ options, onOptionSelect, disabled = false }: OptionButtonsProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleOptionClick = (option: MessageOption) => {
    setSelectedOption(option.id);
    onOptionSelect(option);
  };

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {options.map((option) => (
        <Button
          key={option.id}
          variant={selectedOption === option.id ? "default" : "outline"}
          size="sm"
          onClick={() => handleOptionClick(option)}
          disabled={disabled || selectedOption !== null}
          className={`
            text-sm font-medium 
            ${selectedOption === option.id ? "bg-chidi-forest text-white" : "bg-white text-charcoal border-light-border"}
            ${selectedOption !== null && selectedOption !== option.id ? "opacity-50" : ""}
            hover:bg-soft-sage hover:text-charcoal transition-colors
          `}
        >
          {option.text}
        </Button>
      ))}
    </div>
  );
}
