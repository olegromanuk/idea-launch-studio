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

const DIAGRAM_TYPES = [
  { value: "flowchart", label: "Flowchart", description: "Process flows and decision trees" },
  { value: "mindmap", label: "Mind Map", description: "Ideas branching from a central concept" },
  { value: "orgchart", label: "Org Chart", description: "Hierarchical organization structure" },
  { value: "timeline", label: "Timeline", description: "Sequential events or milestones" },
  { value: "kanban", label: "Kanban Board", description: "Tasks in columns (To Do, Doing, Done)" },
  { value: "swot", label: "SWOT Analysis", description: "Strengths, Weaknesses, Opportunities, Threats" },
  { value: "userjourney", label: "User Journey", description: "Steps in user experience flow" },
  { value: "architecture", label: "Architecture Diagram", description: "System components and connections" },
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
  const [diagramType, setDiagramType] = useState("flowchart");
  const [topic, setTopic] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

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
          description: `Created ${data.elements.length} elements for your ${diagramType}`,
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

  const selectedType = DIAGRAM_TYPES.find((t) => t.value === diagramType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Diagram Generator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Diagram Type</Label>
            <Select value={diagramType} onValueChange={setDiagramType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIAGRAM_TYPES.map((type) => (
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
              <p className="text-sm text-muted-foreground">{selectedType.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Topic / Subject</Label>
            <Input
              id="topic"
              placeholder="e.g., User authentication flow, Company structure, Product launch timeline"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Additional Context (optional)</Label>
            <Textarea
              id="context"
              placeholder="Add any specific details, requirements, or constraints..."
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
