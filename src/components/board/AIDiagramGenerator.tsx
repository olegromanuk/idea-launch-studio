import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2 } from "lucide-react";

interface DiagramType {
  value: string;
  label: string;
  description: string;
  category: string;
}

const DIAGRAM_CATEGORIES = [
  { id: "business", label: "Business Strategy", icon: "📊" },
  { id: "technical", label: "Technical Architecture", icon: "🏗️" },
  { id: "organization", label: "Organization & Planning", icon: "👥" },
  { id: "userexperience", label: "User Experience", icon: "🎯" },
  { id: "process", label: "Process & Flow", icon: "🔄" },
];

const DIAGRAM_TYPES: DiagramType[] = [
  // Business Strategy
  { value: "businessmodel", label: "Business Model Canvas", description: "9-block canvas for business model design", category: "business" },
  { value: "leancanvas", label: "Lean Canvas", description: "Startup-focused business planning", category: "business" },
  { value: "valueproposition", label: "Value Proposition Canvas", description: "Customer needs vs. your offering", category: "business" },
  { value: "swot", label: "SWOT Analysis", description: "Strengths, Weaknesses, Opportunities, Threats", category: "business" },
  { value: "competitive", label: "Competitive Analysis", description: "Compare competitors across dimensions", category: "business" },
  
  // Technical Architecture
  { value: "architecture", label: "System Architecture", description: "Components and system layers", category: "technical" },
  { value: "dataflow", label: "Data Flow Diagram", description: "How data moves through systems", category: "technical" },
  { value: "network", label: "Network Topology", description: "Connected systems and devices", category: "technical" },
  { value: "entityrelationship", label: "Entity Relationship", description: "Database design and relationships", category: "technical" },
  
  // Organization & Planning
  { value: "orgchart", label: "Org Chart", description: "Hierarchical organization structure", category: "organization" },
  { value: "stakeholder", label: "Stakeholder Map", description: "Influence and interest matrix", category: "organization" },
  { value: "roadmap", label: "Product Roadmap", description: "Phases and deliverables timeline", category: "organization" },
  { value: "gantt", label: "Gantt Chart", description: "Project tasks and dependencies", category: "organization" },
  { value: "kanban", label: "Kanban Board", description: "Tasks in columns (To Do, Doing, Done)", category: "organization" },
  { value: "timeline", label: "Timeline", description: "Sequential events or milestones", category: "organization" },
  
  // User Experience
  { value: "userjourney", label: "User Journey Map", description: "Customer experience stages", category: "userexperience" },
  { value: "serviceblueprin", label: "Service Blueprint", description: "Frontstage and backstage activities", category: "userexperience" },
  { value: "persona", label: "User Persona", description: "User profile with goals and pain points", category: "userexperience" },
  
  // Process & Flow
  { value: "flowchart", label: "Flowchart", description: "Process flows and decision trees", category: "process" },
  { value: "processmap", label: "Process Map", description: "Detailed process with inputs/outputs", category: "process" },
  { value: "mindmap", label: "Mind Map", description: "Ideas branching from central concept", category: "process" },
];

interface GeneratedElement {
  section_key: string;
  section_title: string;
  content: string;
  color: string;
  position_x: number;
  position_y: number;
}

interface AIDiagramGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (elements: GeneratedElement[]) => void;
}

export const AIDiagramGenerator = ({
  open,
  onOpenChange,
  onGenerate,
}: AIDiagramGeneratorProps) => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("business");
  const [diagramType, setDiagramType] = useState("businessmodel");
  const [topic, setTopic] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredTypes = DIAGRAM_TYPES.filter((t) => t.category === selectedCategory);
  const selectedType = DIAGRAM_TYPES.find((t) => t.value === diagramType);
  const selectedCategoryInfo = DIAGRAM_CATEGORIES.find((c) => c.id === selectedCategory);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const firstInCategory = DIAGRAM_TYPES.find((t) => t.category === category);
    if (firstInCategory) {
      setDiagramType(firstInCategory.value);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter a topic for the diagram",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-board-diagram", {
        body: {
          diagramType,
          topic: topic.trim(),
          additionalContext: additionalContext.trim(),
        },
      });

      if (error) throw error;

      if (data?.elements && Array.isArray(data.elements)) {
        onGenerate(data.elements);
        setTopic("");
        setAdditionalContext("");
        onOpenChange(false);

        toast({
          title: "Diagram generated",
          description: `Created ${data.elements.length} elements for your ${selectedType?.label || diagramType}`,
        });
      } else {
        throw new Error("Invalid response from AI");
      }
    } catch (error) {
      console.error("Error generating diagram:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate diagram",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Diagram Generator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="flex flex-wrap gap-2">
              {DIAGRAM_CATEGORIES.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryChange(category.id)}
                  className="text-sm"
                >
                  <span className="mr-1">{category.icon}</span>
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Diagram Type Selection */}
          <div className="space-y-2">
            <Label>Diagram Type</Label>
            <Select value={diagramType} onValueChange={setDiagramType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filteredTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex flex-col">
                      <span>{type.label}</span>
                      <span className="text-xs text-muted-foreground">{type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedType && (
              <p className="text-sm text-muted-foreground">
                {selectedCategoryInfo?.icon} {selectedType.description}
              </p>
            )}
          </div>

          {/* Topic Input */}
          <div className="space-y-2">
            <Label htmlFor="topic">Topic / Subject</Label>
            <Input
              id="topic"
              placeholder={getPlaceholderForType(diagramType)}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          {/* Additional Context */}
          <div className="space-y-2">
            <Label htmlFor="context">Additional Context (optional)</Label>
            <Textarea
              id="context"
              placeholder="Add industry, constraints, specific requirements, or focus areas..."
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGenerating}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={!topic.trim() || isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Diagram
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

function getPlaceholderForType(type: string): string {
  const placeholders: Record<string, string> = {
    businessmodel: "e.g., SaaS subscription platform for small businesses",
    leancanvas: "e.g., Mobile app for food delivery in urban areas",
    valueproposition: "e.g., Project management tool for remote teams",
    swot: "e.g., E-commerce startup entering European market",
    competitive: "e.g., Cloud storage solutions (Dropbox, Google Drive, OneDrive)",
    architecture: "e.g., Microservices e-commerce platform",
    dataflow: "e.g., Customer order processing system",
    network: "e.g., Corporate office network with remote access",
    entityrelationship: "e.g., Hospital patient management system",
    orgchart: "e.g., Tech startup with 50 employees",
    stakeholder: "e.g., New product launch initiative",
    roadmap: "e.g., Mobile app development Q1-Q4 2024",
    gantt: "e.g., Website redesign project (3 months)",
    kanban: "e.g., Sprint tasks for development team",
    timeline: "e.g., Company history and key milestones",
    userjourney: "e.g., Customer booking a hotel room online",
    serviceblueprin: "e.g., Restaurant dining experience",
    persona: "e.g., Target user for fitness tracking app",
    flowchart: "e.g., User authentication and login process",
    processmap: "e.g., Customer support ticket handling",
    mindmap: "e.g., Product feature brainstorming session",
  };
  return placeholders[type] || "Enter your topic or subject...";
}
