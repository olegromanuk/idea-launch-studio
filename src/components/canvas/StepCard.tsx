import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import { AIAssistant } from "./AIAssistant";
import type { Step } from "@/pages/Canvas";

interface StepCardProps {
  step: Step;
  index: number;
  projectData: any;
  onToggle: () => void;
  onComplete: () => void;
}

export const StepCard = ({ step, index, projectData, onToggle, onComplete }: StepCardProps) => {
  const Icon = step.icon;

  return (
    <Card
      className={`overflow-hidden transition-all duration-500 hover-lift ${
        step.completed
          ? "border-success bg-success/5"
          : step.expanded
          ? "border-primary shadow-glow"
          : "glass"
      }`}
    >
      {/* Step Header */}
      <div
        className="p-6 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div
              className={`p-3 rounded-xl transition-all ${
                step.completed
                  ? "bg-success text-success-foreground"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {step.completed ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <Icon className="w-6 h-6" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="text-xs font-mono">
                  Step {index + 1}
                </Badge>
                {step.completed && (
                  <Badge className="bg-success text-success-foreground text-xs">
                    Completed
                  </Badge>
                )}
              </div>
              <h3 className="text-xl font-semibold mb-1">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hover-scale"
          >
            {step.expanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Step Content (Expanded) */}
      {step.expanded && (
        <div className="px-6 pb-6 space-y-6 animate-accordion-down">
          <div className="border-t border-border pt-6">
            <div className="prose prose-sm max-w-none mb-6">
              <h4 className="text-sm font-semibold text-foreground mb-3">
                What you'll accomplish in this step:
              </h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                {getStepGuidance(step.id).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            {/* AI Assistant */}
            <AIAssistant step={step} projectData={projectData} />

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-border">
              {!step.completed && (
                <Button
                  onClick={onComplete}
                  className="gradient-primary text-white hover-glow"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark as Complete
                </Button>
              )}
              <Button variant="outline" className="hover-lift">
                <Sparkles className="w-4 h-4 mr-2" />
                Get AI Suggestions
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

function getStepGuidance(stepId: number): string[] {
  const guidance: Record<number, string[]> = {
    1: [
      "Research existing solutions and competitors",
      "Identify your unique value proposition",
      "Validate market demand and opportunity size",
      "Define success metrics for your MVP",
    ],
    2: [
      "Create detailed user personas",
      "Map out customer pain points and needs",
      "Craft your value proposition statement",
      "Identify key user segments to target",
    ],
    3: [
      "Define core features and functionality",
      "Create user flow diagrams",
      "Prioritize features for MVP vs future versions",
      "Map out technical dependencies",
    ],
    4: [
      "Design wireframes for key screens",
      "Establish visual design system",
      "Define user interaction patterns",
      "Create mockups and prototypes",
    ],
    5: [
      "Choose appropriate tech stack",
      "Plan database architecture",
      "Define API structure and integrations",
      "Establish development workflow",
    ],
    6: [
      "Create launch timeline and milestones",
      "Develop marketing messaging and channels",
      "Plan user acquisition strategy",
      "Set up analytics and tracking",
    ],
  };

  return guidance[stepId] || [];
}
