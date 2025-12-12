import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sparkles,
  Cpu,
  CheckCircle2,
  Circle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TechnicalSolutionProps {
  value: string;
  onChange: (value: string) => void;
  onAIGenerate: () => void;
  isGenerating: boolean;
}

export const TechnicalSolution = ({ 
  value, 
  onChange, 
  onAIGenerate, 
  isGenerating 
}: TechnicalSolutionProps) => {
  const hasContent = value && value.trim().length > 0;

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-500 to-zinc-600" />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500 to-zinc-600 flex items-center justify-center shadow-lg shadow-slate-500/20">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">Technical Solution</h3>
              <p className="text-sm text-muted-foreground">
                Architecture and technology decisions
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {hasContent ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
                <CheckCircle2 className="w-3 h-3" />
                Completed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                <Circle className="w-3 h-3" />
                Pending
              </span>
            )}
            <Button
              size="sm"
              onClick={onAIGenerate}
              disabled={isGenerating}
              className="bg-gradient-to-r from-slate-500 to-zinc-600 text-white"
            >
              <Sparkles className={cn("w-4 h-4 mr-1", isGenerating && "animate-spin")} />
              {isGenerating ? "Generating..." : "AI Generate"}
            </Button>
          </div>
        </div>

        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Describe your technical architecture, tech stack choices, infrastructure decisions, and key technical considerations..."
          className="min-h-[200px] resize-none"
        />
        
        <p className="text-xs text-muted-foreground mt-2">
          Include: Tech stack, architecture pattern, hosting/infrastructure, key libraries, and technical trade-offs
        </p>
      </div>
    </Card>
  );
};
