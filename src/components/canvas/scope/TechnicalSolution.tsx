import { useState } from "react";
import { Button } from "@/components/ui/button";
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
    <div className="relative bg-[#0A0A0A] border border-white/[0.08] overflow-hidden">
      {/* Blueprint corner accents */}
      <div className="absolute -top-px -left-px w-2 h-2 border-t-2 border-l-2 border-[#00f0ff] opacity-70" />
      <div className="absolute -bottom-px -right-px w-2 h-2 border-b-2 border-r-2 border-[#00f0ff] opacity-70" />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-4">
          <h2 className="font-mono text-xs text-[#00f0ff] uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
            Technical_Solution
          </h2>
          <div className="flex items-center gap-2">
            {hasContent ? (
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border border-green-500/30 text-green-400 bg-green-500/10 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Completed
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border border-white/10 text-slate-500 flex items-center gap-1">
                <Circle className="w-3 h-3" />
                Pending
              </span>
            )}
            <Cpu className="w-5 h-5 text-slate-700" />
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 mb-4">
          {hasContent && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="font-mono text-xs uppercase tracking-wider border-white/10 hover:border-[#00f0ff]/30 hover:text-[#00f0ff] bg-transparent"
            >
              {isEditing ? (
                <>
                  <Eye className="w-4 h-4 mr-1.5" />
                  Preview
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4 mr-1.5" />
                  Edit
                </>
              )}
            </Button>
          )}
          <Button
            size="sm"
            onClick={onAIGenerate}
            disabled={isGenerating}
            className="font-mono text-xs uppercase tracking-wider bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30 hover:border-[#00f0ff]/50 shadow-[0_0_10px_rgba(0,240,255,0.1)] hover:shadow-[0_0_20px_rgba(0,240,255,0.2)]"
          >
            <Sparkles className={cn("w-4 h-4 mr-1.5", isGenerating && "animate-spin")} />
            {isGenerating ? "Generating..." : "AI Generate"}
          </Button>
        </div>

        {isEditing || !hasContent ? (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Describe your technical architecture, tech stack choices, infrastructure decisions, and key technical considerations..."
            className="min-h-[200px] resize-none bg-[#0F0F0F] border-white/10 focus:border-[#00f0ff]/50 font-mono text-sm"
          />
        ) : (
          <div className="min-h-[200px] p-4 bg-[#0F0F0F] border border-white/5 prose prose-sm prose-invert max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-lg font-bold text-white mt-4 mb-2 first:mt-0 font-mono uppercase tracking-wider">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-semibold text-white mt-4 mb-2 font-mono uppercase tracking-wider">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-semibold text-white mt-3 mb-1 font-mono uppercase tracking-wider">{children}</h3>,
                p: ({ children }) => <p className="text-sm text-slate-400 mb-2">{children}</p>,
                ul: ({ children }) => <ul className="text-sm text-slate-400 mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="text-sm text-slate-400 mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => (
                  <li className="text-sm text-slate-400 flex items-start gap-2">
                    <span className="text-[#00f0ff] mt-1">•</span>
                    <span>{children}</span>
                  </li>
                ),
                code: ({ children }) => <code className="px-1.5 py-0.5 bg-slate-800 text-[#00f0ff] text-sm font-mono">{children}</code>,
                pre: ({ children }) => <pre className="p-3 bg-slate-900 overflow-x-auto text-sm mb-2 border border-white/5">{children}</pre>,
                strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                em: ({ children }) => <em className="italic text-slate-300">{children}</em>,
              }}
            >
              {value}
            </ReactMarkdown>
          </div>
        )}
        
        <p className="text-[10px] text-slate-600 mt-2 font-mono uppercase tracking-wider">
          {isEditing || !hasContent 
            ? "Include: Tech stack, architecture pattern, hosting/infrastructure, key libraries, and trade-offs"
            : "Click Edit to modify the technical solution"
          }
        </p>
      </div>
    </div>
  );
};
