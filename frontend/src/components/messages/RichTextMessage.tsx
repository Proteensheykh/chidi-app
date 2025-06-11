"use client";

import { RichContent } from "@/types/message";

interface RichTextMessageProps {
  content: RichContent;
}

export function RichTextMessage({ content }: RichTextMessageProps) {
  return (
    <div 
      className="rich-text-content text-sm"
      dangerouslySetInnerHTML={{ __html: content.html }}
    />
  );
}
