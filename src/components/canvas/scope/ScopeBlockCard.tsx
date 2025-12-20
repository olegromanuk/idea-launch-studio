import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles,
  CheckCircle2,
  Circle,
  ArrowRight,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ScopeBlockCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  gradient: string;
  children: ReactNode; // Summary content (latest 5 items)
  itemCount?: number;
  completedCount?: number;
  onViewAll: () => void;
  onAIGenerate?: () => void;
  isGenerating?: boolean;
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
}: ScopeBlockCardProps) => {
  const hasContent = itemCount > 0;
  const isComplete = completedCount > 0 && completedCount === itemCount;

  return (
    <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
      {/* Gradient accent bar */}
      <div className={cn("h-1 bg-gradient-to-r", gradient)} />
      
      {/* Header */}
      <div className="p-5 pb-4 flex items-center gap-4">
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
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          {onAIGenerate && !hasContent && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAIGenerate}
              disabled={isGenerating}
              className="gap-1.5"
            >
              <Sparkles className={cn("w-4 h-4", isGenerating && "animate-spin")} />
              Generate
            </Button>
          )}
        </div>
      </div>
      
      {/* Content - Latest items summary */}
      <div className="px-5 pb-4">
        {hasContent ? (
          <div className="space-y-2">
            {children}
          </div>
        ) : (
          <div className="py-8 text-center rounded-lg bg-muted/30 border border-dashed border-border">
            <p className="text-sm text-muted-foreground mb-3">No items yet</p>
            {onAIGenerate && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAIGenerate}
                disabled={isGenerating}
                className="gap-1.5"
              >
                <Sparkles className={cn("w-4 h-4", isGenerating && "animate-spin")} />
                Generate with AI
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* Footer - View All button */}
      <div className="px-5 pb-5">
        <Button
          variant="outline"
          className="w-full justify-between group"
          onClick={onViewAll}
        >
          <span>{hasContent ? `View & Edit All ${itemCount} Items` : "Add Items"}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </Card>
  );
};
