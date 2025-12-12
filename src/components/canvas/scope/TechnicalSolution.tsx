import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sparkles,
  Cpu,
  CheckCircle2,
  Circle,
  Edit3,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

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
  const [isEditing, setIsEditing] = useState(false);
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
            {hasContent && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <>
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit
                  </>
                )}
              </Button>
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

        {isEditing || !hasContent ? (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Describe your technical architecture, tech stack choices, infrastructure decisions, and key technical considerations..."
            className="min-h-[200px] resize-none font-mono text-sm"
          />
        ) : (
          <div className="min-h-[200px] p-4 rounded-lg bg-muted/30 border border-border prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-xl font-bold text-foreground mt-4 mb-2 first:mt-0">{children}</h1>,
                h2: ({ children }) => <h2 className="text-lg font-semibold text-foreground mt-4 mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-base font-semibold text-foreground mt-3 mb-1">{children}</h3>,
                p: ({ children }) => <p className="text-sm text-foreground mb-2">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside text-sm text-foreground mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside text-sm text-foreground mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-sm text-foreground">{children}</li>,
                code: ({ children }) => <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono text-foreground">{children}</code>,
                pre: ({ children }) => <pre className="p-3 rounded-lg bg-muted overflow-x-auto text-sm mb-2">{children}</pre>,
                strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
              }}
            >
              {value}
            </ReactMarkdown>
          </div>
        )}
        
        <p className="text-xs text-muted-foreground mt-2">
          {isEditing || !hasContent 
            ? "Include: Tech stack, architecture pattern, hosting/infrastructure, key libraries, and technical trade-offs"
            : "Click Edit to modify the technical solution"
          }
        </p>
      </div>
    </Card>
  );
};
