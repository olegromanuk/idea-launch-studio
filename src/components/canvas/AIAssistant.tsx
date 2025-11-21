import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, TrendingUp, Users, Lightbulb, CheckCircle2 } from "lucide-react";
import type { Step } from "@/pages/Canvas";

interface AIAssistantProps {
  step: Step;
  projectData: any;
}

export const AIAssistant = ({ step, projectData }: AIAssistantProps) => {
  const suggestions = getAISuggestions(step.id, projectData);

  return (
    <Card className="gradient-card border-primary/20 p-6 space-y-4">
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

      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="flex gap-3 p-4 rounded-lg bg-card hover:bg-muted/50 transition-colors group"
          >
            <div className="mt-0.5">
              {suggestion.icon === "trend" && <TrendingUp className="w-4 h-4 text-primary" />}
              {suggestion.icon === "users" && <Users className="w-4 h-4 text-primary" />}
              {suggestion.icon === "lightbulb" && <Lightbulb className="w-4 h-4 text-primary" />}
              {suggestion.icon === "check" && <CheckCircle2 className="w-4 h-4 text-primary" />}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h5 className="text-sm font-medium">{suggestion.title}</h5>
                <Badge variant="secondary" className="text-xs">
                  {suggestion.type}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{suggestion.content}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

function getAISuggestions(stepId: number, projectData: any) {
  // Mock AI suggestions based on step and project data
  const suggestions: Record<number, any[]> = {
    1: [
      {
        icon: "trend",
        type: "Market Analysis",
        title: "Growing Market Opportunity",
        content:
          "The freelance economy is projected to grow 40% by 2027. Your timing is excellent for entering this market.",
      },
      {
        icon: "users",
        type: "Competition",
        title: "Differentiation Strategy",
        content:
          "Consider focusing on niche verticals (e.g., designers, writers) where existing solutions are generic.",
      },
      {
        icon: "lightbulb",
        type: "Value Prop",
        title: "Unique Angle",
        content:
          "Emphasize automation + AI-powered insights rather than just time tracking to stand out.",
      },
    ],
    2: [
      {
        icon: "users",
        type: "Persona",
        title: "Primary User Segment",
        content:
          "Focus on freelancers earning $50k-$150k annually who value their time and want professional invoicing.",
      },
      {
        icon: "lightbulb",
        type: "Pain Point",
        title: "Key Problem to Solve",
        content:
          "Most freelancers lose 15-20% of billable hours due to poor tracking. This is your core value driver.",
      },
    ],
    3: [
      {
        icon: "check",
        type: "Core Feature",
        title: "Must-Have for MVP",
        content:
          "Automatic time tracking, invoice generation, and client portal should be your v1.0 features.",
      },
      {
        icon: "lightbulb",
        type: "Nice-to-Have",
        title: "Future Enhancements",
        content:
          "Expense tracking, tax calculations, and payment processing can come in v2.0.",
      },
    ],
    4: [
      {
        icon: "lightbulb",
        type: "Design System",
        title: "Visual Direction",
        content:
          "Clean, professional aesthetic with calming blues/greens. Avoid overly corporate or cluttered interfaces.",
      },
    ],
    5: [
      {
        icon: "trend",
        type: "Tech Stack",
        title: "Recommended Stack",
        content:
          "Consider React + Node.js + PostgreSQL for scalability, or no-code tools like Bubble for faster MVP.",
      },
    ],
    6: [
      {
        icon: "users",
        type: "Marketing",
        title: "Launch Strategy",
        content:
          "Start with ProductHunt launch, freelancer communities (Reddit, FB groups), and content marketing.",
      },
    ],
  };

  return suggestions[stepId] || [];
}
