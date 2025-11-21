import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProductIdea {
  title: string;
  description: string;
  audience: string;
  problem: string;
}

interface IdeaSelectorProps {
  onIdeaSelect: (idea: ProductIdea) => void;
  onCancel: () => void;
}

const INTEREST_OPTIONS = [
  "AI & Machine Learning",
  "Productivity Tools",
  "E-commerce",
  "Healthcare",
  "Education",
  "Finance",
  "Social Impact",
  "Content Creation",
  "Gaming",
  "Sustainability",
  "Remote Work",
  "Developer Tools",
];

export const IdeaSelector = ({ onIdeaSelect, onCancel }: IdeaSelectorProps) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [ideas, setIdeas] = useState<ProductIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<number | null>(null);
  const { toast } = useToast();

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const generateIdeas = async () => {
    if (selectedInterests.length === 0) {
      toast({
        title: "Select interests",
        description: "Please select at least one area of interest",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-product-ideas",
        {
          body: { interests: selectedInterests },
        }
      );

      if (error) throw error;

      if (data?.ideas) {
        setIdeas(data.ideas);
      }
    } catch (error: any) {
      console.error("Error generating ideas:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate ideas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleIdeaClick = (index: number) => {
    setSelectedIdea(index);
  };

  const confirmSelection = () => {
    if (selectedIdea !== null) {
      onIdeaSelect(ideas[selectedIdea]);
    }
  };

  return (
    <div className="space-y-6">
      {ideas.length === 0 ? (
        <>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">What interests you?</h3>
            <p className="text-sm text-muted-foreground">
              Select areas that excite you, and we'll suggest product ideas
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => (
              <Badge
                key={interest}
                variant={
                  selectedInterests.includes(interest) ? "default" : "outline"
                }
                className="cursor-pointer hover-scale"
                onClick={() => toggleInterest(interest)}
              >
                {interest}
                {selectedInterests.includes(interest) && (
                  <Check className="w-3 h-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={generateIdeas}
              disabled={loading || selectedInterests.length === 0}
              className="flex-1 gradient-primary"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Ideas...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Ideas
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">
              Here are your personalized ideas
            </h3>
            <p className="text-sm text-muted-foreground">
              Select one to get started
            </p>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {ideas.map((idea, index) => (
              <Card
                key={index}
                className={`p-4 cursor-pointer transition-all hover-lift ${
                  selectedIdea === index
                    ? "border-primary shadow-lg"
                    : "border-border"
                }`}
                onClick={() => handleIdeaClick(index)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedIdea === index
                        ? "border-primary bg-primary"
                        : "border-muted"
                    }`}
                  >
                    {selectedIdea === index && (
                      <Check className="w-3 h-3 text-primary-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{idea.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {idea.description}
                    </p>
                    <div className="space-y-1 text-xs">
                      <p>
                        <span className="font-medium">For:</span> {idea.audience}
                      </p>
                      <p>
                        <span className="font-medium">Solves:</span>{" "}
                        {idea.problem}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={confirmSelection}
              disabled={selectedIdea === null}
              className="flex-1 gradient-primary"
            >
              Use This Idea
            </Button>
            <Button variant="outline" onClick={() => setIdeas([])}>
              Back
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
