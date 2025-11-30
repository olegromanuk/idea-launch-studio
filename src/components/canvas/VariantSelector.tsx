import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Sparkles, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Variant {
  label: string;
  description: string;
  content: string;
}

interface VariantSelectorProps {
  variants: Variant[];
  onSelect: (content: string) => void;
  onRegenerate: () => void;
  onClose: () => void;
  isLoading?: boolean;
  sectionTitle: string;
}

export const VariantSelector = ({
  variants,
  onSelect,
  onRegenerate,
  onClose,
  isLoading,
  sectionTitle,
}: VariantSelectorProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleApply = () => {
    if (selectedIndex !== null && variants[selectedIndex]) {
      onSelect(variants[selectedIndex].content);
    }
  };

  const variantStyles = [
    { bg: "bg-blue-500/10", border: "border-blue-500/30", badge: "bg-blue-500/20 text-blue-700 dark:text-blue-300" },
    { bg: "bg-purple-500/10", border: "border-purple-500/30", badge: "bg-purple-500/20 text-purple-700 dark:text-purple-300" },
    { bg: "bg-emerald-500/10", border: "border-emerald-500/30", badge: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col glass shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg gradient-primary">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Choose Your Best Variant</h2>
              <p className="text-sm text-muted-foreground">
                {sectionTitle} - Select the approach that fits your vision
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Variants */}
        <ScrollArea className="flex-1 p-6">
          <div className="grid gap-4">
            {variants.map((variant, index) => {
              const style = variantStyles[index % variantStyles.length];
              const isSelected = selectedIndex === index;
              
              return (
                <Card
                  key={index}
                  className={cn(
                    "p-4 cursor-pointer transition-all duration-200 hover:shadow-md",
                    style.bg,
                    isSelected 
                      ? `ring-2 ring-primary ${style.border}` 
                      : "border-transparent hover:border-border/50"
                  )}
                  onClick={() => setSelectedIndex(index)}
                >
                  <div className="flex items-start gap-4">
                    {/* Selection indicator */}
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-colors",
                      isSelected 
                        ? "bg-primary border-primary" 
                        : "border-muted-foreground/30"
                    )}>
                      {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={cn("font-medium", style.badge)}>
                          {variant.label}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {variant.description}
                        </span>
                      </div>
                      
                      <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                        {variant.content.length > 500 
                          ? `${variant.content.slice(0, 500)}...` 
                          : variant.content}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border/50 bg-muted/30">
          <Button
            variant="outline"
            onClick={onRegenerate}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            Regenerate Options
          </Button>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleApply}
              disabled={selectedIndex === null}
              className="gradient-primary text-primary-foreground gap-2"
            >
              <Check className="w-4 h-4" />
              Apply Selected
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
