import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ChevronDown, ChevronRight, Users, MessageSquare, Headphones } from "lucide-react";
import { AIAssistant } from "./AIAssistant";
import { CanvasCell } from "./CanvasCell";
import { ExpandedCanvasEditor } from "./ExpandedCanvasEditor";

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
  expanded: boolean;
}

interface StepCardProps {
  step: Step;
  index: number;
  projectData: any;
  canvasData: any;
  loadingSection: string | null;
  aiSuggestions: any[];
  loadingAISuggestions: boolean;
  onToggle: () => void;
  onComplete: () => void;
  onCanvasChange: (field: string, value: string) => void;
  onGenerateSuggestions: (section: string) => void;
  onRegenerateAI: () => void;
  onOpenChat: () => void;
}

export const StepCard = ({ 
  step, 
  index, 
  projectData, 
  canvasData,
  loadingSection,
  aiSuggestions,
  loadingAISuggestions,
  onToggle, 
  onComplete,
  onCanvasChange,
  onGenerateSuggestions,
  onRegenerateAI,
  onOpenChat
}: StepCardProps) => {
  const Icon = step.icon;
  const canvasSections = getStepCanvasSections(step.id);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [pendingSuggestion, setPendingSuggestion] = useState<string | null>(null);
  const aiAssistantRef = useRef<HTMLDivElement>(null);

  const handleChatWithAI = () => {
    aiAssistantRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleExpandSection = (sectionKey: string) => {
    setExpandedSection(sectionKey);
    setPendingSuggestion(null);
  };

  const handleGenerateForExpanded = async (section: string) => {
    await onGenerateSuggestions(section);
    // The suggestion will appear in the canvasData after generation
  };

  const handleAcceptSuggestion = () => {
    if (pendingSuggestion && expandedSection) {
      onCanvasChange(expandedSection, pendingSuggestion);
      setPendingSuggestion(null);
    }
  };

  const handleDiscardSuggestion = () => {
    setPendingSuggestion(null);
  };

  const currentExpandedSection = canvasSections.find(s => s.key === expandedSection);

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

            {/* Lean Canvas Sections */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-foreground mb-4">
                Lean Canvas Sections
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {canvasSections.map((section) => (
                  <CanvasCell
                    key={section.key}
                    title={section.title}
                    subtitle={section.subtitle}
                    value={canvasData[section.key]}
                    onChange={(value) => onCanvasChange(section.key, value)}
                    onAIGenerate={() => onGenerateSuggestions(section.key)}
                    onExpand={() => handleExpandSection(section.key)}
                    isGenerating={loadingSection === section.key}
                  />
                ))}
              </div>
            </div>

            {/* Expanded Canvas Editor */}
            {currentExpandedSection && (
              <ExpandedCanvasEditor
                isOpen={expandedSection !== null}
                onClose={() => setExpandedSection(null)}
                title={currentExpandedSection.title}
                subtitle={currentExpandedSection.subtitle}
                value={canvasData[expandedSection]}
                onChange={(value) => onCanvasChange(expandedSection, value)}
                onAIGenerate={() => handleGenerateForExpanded(expandedSection)}
                isGenerating={loadingSection === expandedSection}
                aiSuggestion={pendingSuggestion || undefined}
                onAcceptSuggestion={handleAcceptSuggestion}
                onDiscardSuggestion={handleDiscardSuggestion}
              />
            )}

          {/* AI Assistant */}
          <div ref={aiAssistantRef}>
            <AIAssistant 
              step={step} 
              projectData={projectData}
              suggestions={aiSuggestions}
              isLoading={loadingAISuggestions}
              onRegenerate={onRegenerateAI}
            />
          </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-border">
              {!step.completed && (
                <Button
                  onClick={onComplete}
                  className="gradient-primary text-white hover-glow"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark as Complete
                </Button>
              )}
              <Button
                variant="outline"
                onClick={onOpenChat}
                className="hover-lift"
              >
                <Headphones className="w-4 h-4 mr-2" />
                Request Launch Support
              </Button>
              <Button
                variant="outline"
                onClick={handleChatWithAI}
                className="hover-lift"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat with AI
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

function getStepCanvasSections(stepId: number) {
  const sections: Record<number, Array<{ key: string; title: string; subtitle: string }>> = {
    1: [
      { key: "problem", title: "Problem", subtitle: "List your top 1-3 problems" },
      { key: "existingAlternatives", title: "Existing Alternatives", subtitle: "How are these problems solved today" },
      { key: "solution", title: "Solution", subtitle: "Outline a possible solution for each problem" },
      { key: "keyMetrics", title: "Key Metrics", subtitle: "Key numbers that tell you how your business is doing" },
    ],
    2: [
      { key: "uniqueValueProposition", title: "Unique Value Proposition", subtitle: "Why you are different and worth attention" },
      { key: "highLevelConcept", title: "High-Level Concept", subtitle: "Your X for Y analogy (e.g. YouTube = Flickr for videos)" },
      { key: "customerSegments", title: "Customer Segments", subtitle: "List your target customers and users" },
      { key: "earlyAdopters", title: "Early Adopters", subtitle: "Characteristics of your ideal customers" },
    ],
    3: [
      { key: "solution", title: "Solution", subtitle: "Outline core features and functionality" },
      { key: "keyMetrics", title: "Key Metrics", subtitle: "Metrics to track feature success" },
    ],
    4: [
      { key: "highLevelConcept", title: "High-Level Concept", subtitle: "Visual identity and brand analogy" },
      { key: "uniqueValueProposition", title: "Unique Value Proposition", subtitle: "Design that communicates your unique value" },
    ],
    5: [
      { key: "unfairAdvantage", title: "Unfair Advantage", subtitle: "Something that cannot easily be bought or copied" },
      { key: "costStructure", title: "Cost Structure", subtitle: "List your fixed and variable costs" },
    ],
    6: [
      { key: "channels", title: "Channels", subtitle: "Your path to customers (inbound or outbound)" },
      { key: "revenueStreams", title: "Revenue Streams", subtitle: "List your sources of revenue" },
      { key: "unfairAdvantage", title: "Unfair Advantage", subtitle: "Leverage points for market penetration" },
    ],
  };

  return sections[stepId] || [];
}
