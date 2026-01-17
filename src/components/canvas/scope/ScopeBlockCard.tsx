import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { 
  Sparkles,
  ArrowRight,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ScopeBlockCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  gradient: string;
  children: ReactNode;
  itemCount?: number;
  completedCount?: number;
  onViewAll: () => void;
  onAIGenerate?: () => void;
  isGenerating?: boolean;
  sectionNumber?: string;
}

export const ScopeBlockCard = ({
  title,
  subtitle,
  icon: Icon,
  gradient,
  children,
  itemCount = 0,
  completedCount = 0,
  onViewAll,
  onAIGenerate,
  isGenerating = false,
  sectionNumber,
}: ScopeBlockCardProps) => {
  const hasContent = itemCount > 0;

  return (
    <div className="relative bg-[#0A0A0A] border border-white/[0.08] overflow-hidden group">
      {/* Blueprint corner accents */}
      <div className="absolute -top-px -left-px w-2 h-2 border-t-2 border-l-2 border-[#00f0ff] opacity-70" />
      <div className="absolute -bottom-px -right-px w-2 h-2 border-b-2 border-r-2 border-[#00f0ff] opacity-70" />
      
      {/* Header */}
      <div className="flex justify-between items-start p-5 border-b border-white/5">
        <h2 className="font-mono text-xs text-[#00f0ff] uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
          {sectionNumber && <span className="text-slate-600">{sectionNumber}_</span>}
          {title.replace(/\s+/g, '_')}
        </h2>
        <div className="flex items-center gap-2">
          {onAIGenerate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onAIGenerate}
              disabled={isGenerating}
              className="h-8 px-3 text-xs font-mono uppercase tracking-wider text-slate-400 hover:text-[#00f0ff] hover:bg-[#00f0ff]/5 border border-white/10 hover:border-[#00f0ff]/30 transition-all"
            >
              <Sparkles className={cn("w-3.5 h-3.5 mr-1.5", isGenerating && "animate-spin")} />
              {isGenerating ? "..." : "AI"}
            </Button>
          )}
          <Icon className="w-5 h-5 text-slate-700" />
        </div>
      </div>
      
      {/* Stats bar */}
      <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Items</span>
            <span className="text-lg font-bold text-white font-mono">{itemCount}</span>
          </div>
          {completedCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Done</span>
              <span className="text-lg font-bold text-[#00f0ff] font-mono">{completedCount}</span>
            </div>
          )}
        </div>
        {hasContent && (
          <div className="flex items-center gap-2">
            <div className="text-[10px] font-mono text-slate-500 uppercase">
              {Math.round((completedCount / itemCount) * 100)}%
            </div>
            <div className="w-16 h-1 bg-slate-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.5)] transition-all duration-500"
                style={{ width: `${(completedCount / itemCount) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-5">
        {hasContent ? (
          <div className="space-y-2">
            {children}
          </div>
        ) : (
          <div className="py-8 text-center border border-dashed border-white/10 bg-[#0F0F0F]">
            <p className="text-sm text-slate-500 font-mono mb-3">NO_DATA</p>
            {onAIGenerate && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAIGenerate}
                disabled={isGenerating}
                className="gap-1.5 font-mono text-xs uppercase tracking-wider border-[#00f0ff]/30 text-[#00f0ff] hover:bg-[#00f0ff]/5 hover:border-[#00f0ff]/50"
              >
                <Sparkles className={cn("w-3.5 h-3.5", isGenerating && "animate-spin")} />
                Generate with AI
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="px-5 pb-5">
        <button
          onClick={onViewAll}
          className="w-full p-3 bg-[#0F0F0F] border border-white/5 hover:border-[#00f0ff]/30 transition-all duration-300 group/btn flex items-center justify-between"
        >
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 group-hover/btn:text-[#00f0ff] transition-colors">
            {hasContent ? `View & Edit All ${itemCount} Items` : "Add Items"}
          </span>
          <ArrowRight className="w-4 h-4 text-slate-600 group-hover/btn:text-[#00f0ff] group-hover/btn:translate-x-1 transition-all" />
        </button>
      </div>
    </div>
  );
};
