import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  CheckCircle2,
  Circle,
  AlertCircle,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ScopeBlockCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  gradient: string;
  children: ReactNode;
  summaryContent: ReactNode;
  itemCount?: number;
  completedCount?: number;
  onAIGenerate?: () => void;
  isGenerating?: boolean;
  defaultExpanded?: boolean;
}

export const ScopeBlockCard = ({
  title,
  subtitle,
  icon: Icon,
  gradient,
  children,
  summaryContent,
  itemCount = 0,
  completedCount = 0,
  onAIGenerate,
  isGenerating = false,
  defaultExpanded = false,
}: ScopeBlockCardProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  const hasContent = itemCount > 0;
  const isComplete = completedCount > 0 && completedCount === itemCount;
  const progress = itemCount > 0 ? Math.round((completedCount / itemCount) * 100) : 0;

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300",
      "border-border/50 bg-card/80 backdrop-blur-sm",
      isExpanded && "ring-2 ring-primary/20"
    )}>
      {/* Header - Always visible */}
      <div 
        className="relative cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Gradient accent bar */}
        <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", gradient)} />
        
        <div className="p-5 flex items-center gap-4">
          {/* Icon */}
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
            "bg-gradient-to-br shadow-lg",
            gradient
          )}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          
          {/* Title & Stats */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg text-foreground">{title}</h3>
              {hasContent ? (
                isComplete ? (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Complete
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                    {itemCount} items
                  </Badge>
                )
              ) : (
                <Badge variant="outline" className="bg-muted text-muted-foreground text-xs">
                  <Circle className="w-3 h-3 mr-1" />
                  Empty
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            {onAIGenerate && !isExpanded && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAIGenerate();
                }}
                disabled={isGenerating}
                className="gap-1.5"
              >
                <Sparkles className={cn("w-4 h-4", isGenerating && "animate-spin")} />
                <span className="hidden sm:inline">Generate</span>
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Summary content - shown when collapsed */}
        {!isExpanded && hasContent && (
          <div className="px-5 pb-4 pt-0">
            <div className="p-3 rounded-lg bg-muted/50 border border-border/30">
              {summaryContent}
            </div>
          </div>
        )}
      </div>
      
      {/* Expanded content */}
      <div className={cn(
        "overflow-hidden transition-all duration-300",
        isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="p-5 pt-0 border-t border-border/30">
          {children}
        </div>
      </div>
    </Card>
  );
};
