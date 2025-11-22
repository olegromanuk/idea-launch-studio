import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, TrendingUp, Users, Lightbulb, CheckCircle2, ThumbsUp, ThumbsDown, RefreshCw } from "lucide-react";
import type { Step } from "@/pages/Canvas";

interface Suggestion {
  icon: string;
  type: string;
  title: string;
  content: string;
}

interface AIAssistantProps {
  step: Step;
  projectData: any;
  suggestions: Suggestion[];
  isLoading: boolean;
  onRegenerate: () => void;
}

export const AIAssistant = ({ step, projectData, suggestions, isLoading, onRegenerate }: AIAssistantProps) => {
  const [feedback, setFeedback] = useState<Record<number, 'up' | 'down' | null>>({});

  const handleFeedback = (index: number, type: 'up' | 'down') => {
    setFeedback(prev => ({
      ...prev,
      [index]: prev[index] === type ? null : type
    }));
  };

  const getIconComponent = (iconType: string) => {
    switch (iconType) {
      case "trend": return TrendingUp;
      case "users": return Users;
      case "lightbulb": return Lightbulb;
      case "check": return CheckCircle2;
      default: return Lightbulb;
    }
  };

  return (
    <Card className="gradient-card border-primary/20 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold">AI Co-Pilot Suggestions</h4>
            <p className="text-xs text-muted-foreground">
              Personalized insights based on your project
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRegenerate}
          disabled={isLoading}
          className="hover-scale"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Regenerate
        </Button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Click "Regenerate" to get AI suggestions for this step</p>
          </div>
        ) : (
          suggestions.map((suggestion, index) => {
            const IconComponent = getIconComponent(suggestion.icon);
            return (
              <div
                key={index}
                className="flex gap-3 p-4 rounded-lg bg-card hover:bg-muted/50 transition-colors group border border-border/50"
              >
                <div className="mt-0.5">
                  <IconComponent className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-sm font-medium">{suggestion.title}</h5>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {suggestion.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{suggestion.content}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeedback(index, 'up')}
                      className={`h-7 px-2 ${feedback[index] === 'up' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeedback(index, 'down')}
                      className={`h-7 px-2 ${feedback[index] === 'down' ? 'bg-destructive/10 text-destructive' : 'text-muted-foreground'}`}
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

