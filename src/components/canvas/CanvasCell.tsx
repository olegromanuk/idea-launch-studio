import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Maximize2, CheckCircle2, Circle, Lightbulb, Eye, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkdownContent } from "./MarkdownContent";

interface CanvasCellProps {
  title: string;
  subtitle: string;
  value: string;
  onChange: (value: string) => void;
  onAIGenerate: () => void;
  onExpand: () => void;
  isGenerating: boolean;
  className?: string;
  index?: number;
}

const SECTION_ICONS: Record<string, { gradient: string; shadowColor: string }> = {
  problem: { gradient: "from-red-500 to-orange-500", shadowColor: "shadow-red-500/20" },
  targetAudience: { gradient: "from-blue-500 to-cyan-500", shadowColor: "shadow-blue-500/20" },
  uniqueValueProposition: { gradient: "from-purple-500 to-pink-500", shadowColor: "shadow-purple-500/20" },
  revenueModel: { gradient: "from-emerald-500 to-teal-500", shadowColor: "shadow-emerald-500/20" },
  marketTrends: { gradient: "from-amber-500 to-yellow-500", shadowColor: "shadow-amber-500/20" },
  successMetrics: { gradient: "from-indigo-500 to-violet-500", shadowColor: "shadow-indigo-500/20" },
  coreFeatures: { gradient: "from-cyan-500 to-blue-500", shadowColor: "shadow-cyan-500/20" },
  userFlow: { gradient: "from-green-500 to-emerald-500", shadowColor: "shadow-green-500/20" },
  techStack: { gradient: "from-slate-500 to-zinc-600", shadowColor: "shadow-slate-500/20" },
  dataRequirements: { gradient: "from-orange-500 to-red-500", shadowColor: "shadow-orange-500/20" },
  integrations: { gradient: "from-violet-500 to-purple-500", shadowColor: "shadow-violet-500/20" },
  securityConsiderations: { gradient: "from-rose-500 to-pink-500", shadowColor: "shadow-rose-500/20" },
  positioning: { gradient: "from-fuchsia-500 to-pink-500", shadowColor: "shadow-fuchsia-500/20" },
  acquisitionChannels: { gradient: "from-sky-500 to-blue-500", shadowColor: "shadow-sky-500/20" },
  pricingModel: { gradient: "from-lime-500 to-green-500", shadowColor: "shadow-lime-500/20" },
  launchPlan: { gradient: "from-orange-500 to-amber-500", shadowColor: "shadow-orange-500/20" },
  contentStrategy: { gradient: "from-teal-500 to-cyan-500", shadowColor: "shadow-teal-500/20" },
  growthLoops: { gradient: "from-yellow-500 to-orange-500", shadowColor: "shadow-yellow-500/20" },
};

export const CanvasCell = ({ 
  title, 
  subtitle, 
  value, 
  onChange, 
  onAIGenerate,
  onExpand,
  isGenerating,
  className = "",
  index = 0
}: CanvasCellProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const hasContent = value && value.trim().length > 0;
  const sectionKey = title.toLowerCase().replace(/[^a-z]/g, '');
  
  // Find matching style or use default
  const style = Object.entries(SECTION_ICONS).find(([key]) => 
    sectionKey.includes(key.toLowerCase()) || key.toLowerCase().includes(sectionKey)
  )?.[1] || { gradient: "from-primary to-accent", shadowColor: "shadow-primary/20" };

  return (
    <div 
      className={cn(
        "group relative rounded-2xl transition-all duration-500 animate-fade-in",
        isFocused ? "scale-[1.02] z-10" : "hover:scale-[1.01]",
        className
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Background glow effect */}
      <div className={cn(
        "absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 blur-xl",
        `bg-gradient-to-br ${style.gradient}`,
        isFocused ? "opacity-20" : "group-hover:opacity-10"
      )} />
      
      {/* Main card */}
      <div className={cn(
        "relative overflow-hidden rounded-2xl border transition-all duration-300",
        "bg-card/80 backdrop-blur-sm",
        isFocused 
          ? `border-primary/50 ${style.shadowColor} shadow-xl` 
          : "border-border/50 hover:border-border shadow-md hover:shadow-lg"
      )}>
        {/* Header section */}
        <div className="relative p-5 pb-3">
          {/* Decorative accent line */}
          <div className={cn(
            "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
            style.gradient,
            "opacity-80"
          )} />
          
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              {/* Status indicator */}
              <div className={cn(
                "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                hasContent 
                  ? `bg-gradient-to-br ${style.gradient} shadow-lg ${style.shadowColor}` 
                  : "bg-muted"
              )}>
                {hasContent ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base text-foreground mb-0.5 truncate">
                  {title}
                </h3>
                <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                  {subtitle}
                </p>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-1.5">
              {hasContent && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className={cn(
                    "h-8 w-8 p-0 rounded-lg transition-all duration-200",
                    "hover:bg-muted",
                    isEditing ? "bg-muted text-foreground" : "opacity-60 group-hover:opacity-100"
                  )}
                  title={isEditing ? "View formatted" : "Edit raw"}
                >
                  {isEditing ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onExpand}
                className={cn(
                  "h-8 w-8 p-0 rounded-lg transition-all duration-200",
                  "hover:bg-primary/10 hover:text-primary",
                  "opacity-60 group-hover:opacity-100"
                )}
                title="Expand for focused editing"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onAIGenerate}
                disabled={isGenerating}
                className={cn(
                  "h-8 w-8 p-0 rounded-lg transition-all duration-200",
                  "hover:bg-accent/10 hover:text-accent",
                  isGenerating ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                )}
                title="Generate AI suggestions"
              >
                <Sparkles className={cn(
                  "w-4 h-4 transition-all",
                  isGenerating && "animate-spin text-accent"
                )} />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Content area */}
        <div className="px-5 pb-5">
          <div className={cn(
            "relative rounded-xl transition-all duration-300 overflow-hidden",
            isFocused ? "ring-2 ring-primary/30 ring-offset-2 ring-offset-card" : ""
          )}>
            {/* Show textarea when editing or no content, show markdown when viewing */}
            {isEditing || !hasContent ? (
              <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => {
                  setIsFocused(true);
                  setIsEditing(true);
                }}
                onBlur={() => setIsFocused(false)}
                placeholder="Type here or click ✨ for AI suggestions..."
                className={cn(
                  "min-h-[120px] resize-none text-sm border-0",
                  "bg-muted/50 focus:bg-background",
                  "placeholder:text-muted-foreground/50",
                  "transition-all duration-300"
                )}
              />
            ) : (
              <div 
                className="min-h-[120px] p-3 bg-muted/30 rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setIsEditing(true)}
              >
                <MarkdownContent content={value} className="line-clamp-6" />
              </div>
            )}
            
            {/* Empty state hint */}
            {!hasContent && !isFocused && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex items-center gap-2 text-muted-foreground/40">
                  <Lightbulb className="w-4 h-4" />
                  <span className="text-xs">Click to start or use AI</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Progress indicator */}
          <div className="mt-3 flex items-center justify-between">
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
            </div>
            {value && (
              <span className="text-xs text-muted-foreground">
                {value.split(/\s+/).filter(Boolean).length} words
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
