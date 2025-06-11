"use client";

import { useState } from "react";
import { ActionCard as ActionCardType } from "@/types/message";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Link, Plug, ArrowRight, Loader2 } from "lucide-react";

interface ActionCardProps {
  card: ActionCardType;
  onAction: (type: string) => void;
  disabled?: boolean;
}

export function ActionCard({ card, onAction, disabled = false }: ActionCardProps) {
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    try {
      await onAction(card.type);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = () => {
    switch (card.type) {
      case "upload":
        return <Upload className="h-5 w-5" />;
      case "link":
        return <Link className="h-5 w-5" />;
      case "connect":
        return <Plug className="h-5 w-5" />;
      default:
        return <ArrowRight className="h-5 w-5" />;
    }
  };

  return (
    <Card className="w-full max-w-md mt-2 border-light-border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-charcoal flex items-center gap-2">
          {getIcon()}
          {card.title}
        </CardTitle>
        {card.description && (
          <CardDescription className="text-sm text-slate-gray">
            {card.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent></CardContent>
      <CardFooter className="pt-0">
        <Button
          onClick={handleAction}
          disabled={disabled || loading}
          className="w-full bg-chidi-forest hover:bg-chidi-forest/90 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            card.actionText
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
