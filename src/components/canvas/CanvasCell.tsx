import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";

interface CanvasCellProps {
  title: string;
  subtitle: string;
  value: string;
  onChange: (value: string) => void;
  onAIGenerate: () => void;
  isGenerating: boolean;
  className?: string;
}

export const CanvasCell = ({ 
  title, 
  subtitle, 
  value, 
  onChange, 
  onAIGenerate, 
  isGenerating,
  className = "" 
}: CanvasCellProps) => {
  return (
    <div className={`bg-muted/30 rounded-lg p-4 flex flex-col border border-border ${className}`}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3 className="font-bold text-sm uppercase tracking-wide mb-1 text-foreground">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground italic leading-tight">
            {subtitle}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAIGenerate}
          disabled={isGenerating}
          className="h-7 w-7 p-0 hover:bg-primary/10"
          title="Generate AI suggestions"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-pulse text-primary' : 'text-muted-foreground'}`} />
        </Button>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type here or click ✨ for AI suggestions..."
        className="flex-1 min-h-[100px] resize-none text-sm"
      />
    </div>
  );
};
