"use client";

import { useState } from "react";
import { FormInput as FormInputType } from "@/types/message";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface FormInputsProps {
  inputs: FormInputType[];
  onSubmit: (values: Record<string, string | number | boolean>) => void;
  disabled?: boolean;
}

export function FormInputs({ inputs, onSubmit, disabled = false }: FormInputsProps) {
  const [values, setValues] = useState<Record<string, string | number | boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (id: string, value: string | number | boolean) => {
    setValues((prev) => ({
      ...prev,
      [id]: value,
    }));
    
    // Clear error when field is filled
    if (errors[id] && value) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handleSubmit = () => {
    // Validate required fields
    const newErrors: Record<string, string> = {};
    inputs.forEach((input) => {
      if (input.required && !values[input.id]) {
        newErrors[input.id] = "This field is required";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(values);
  };

  return (
    <div className="space-y-4 mt-2 p-4 bg-white border border-light-border rounded-lg">
      {inputs.map((input) => (
        <div key={input.id} className="space-y-2">
          <Label htmlFor={input.id} className="text-sm font-medium text-charcoal">
            {input.label}
            {input.required && <span className="text-red-500 ml-1">*</span>}
          </Label>

          {input.type === "text" && (
            <Input
              id={input.id}
              placeholder={input.placeholder}
              value={values[input.id] as string || ""}
              onChange={(e) => handleChange(input.id, e.target.value)}
              disabled={disabled}
              className={errors[input.id] ? "border-red-500" : ""}
            />
          )}

          {input.type === "textarea" && (
            <Textarea
              id={input.id}
              placeholder={input.placeholder}
              value={values[input.id] as string || ""}
              onChange={(e) => handleChange(input.id, e.target.value)}
              disabled={disabled}
              className={errors[input.id] ? "border-red-500" : ""}
            />
          )}

          {input.type === "number" && (
            <Input
              id={input.id}
              type="number"
              placeholder={input.placeholder}
              value={values[input.id] as number || ""}
              onChange={(e) => handleChange(input.id, Number(e.target.value))}
              disabled={disabled}
              className={errors[input.id] ? "border-red-500" : ""}
            />
          )}

          {input.type === "select" && input.options && (
            <Select
              disabled={disabled}
              onValueChange={(value) => handleChange(input.id, value)}
              value={values[input.id] as string || ""}
            >
              <SelectTrigger className={errors[input.id] ? "border-red-500" : ""}>
                <SelectValue placeholder={input.placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {input.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {input.type === "checkbox" && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={input.id}
                checked={Boolean(values[input.id])}
                onCheckedChange={(checked) => handleChange(input.id, Boolean(checked))}
                disabled={disabled}
              />
              <Label htmlFor={input.id} className="text-sm text-slate-gray">
                {input.placeholder}
              </Label>
            </div>
          )}

          {input.type === "radio" && input.options && (
            <RadioGroup
              value={values[input.id] as string || ""}
              onValueChange={(value) => handleChange(input.id, value)}
              disabled={disabled}
              className={errors[input.id] ? "border-red-500 border p-2 rounded" : ""}
            >
              {input.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${input.id}-${option.value}`} />
                  <Label htmlFor={`${input.id}-${option.value}`} className="text-sm text-slate-gray">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {errors[input.id] && (
            <p className="text-xs text-red-500">{errors[input.id]}</p>
          )}
        </div>
      ))}

      <div className="flex justify-end mt-4">
        <Button
          onClick={handleSubmit}
          disabled={disabled}
          className="bg-chidi-forest hover:bg-chidi-forest/90 text-white"
        >
          Submit <Send className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
