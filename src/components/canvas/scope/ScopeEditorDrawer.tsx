import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Sparkles, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScopeEditorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  gradient: string;
  children: ReactNode;
  onAIGenerate?: () => void;
  isGenerating?: boolean;
}

export const ScopeEditorDrawer = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  gradient,
  children,
  onAIGenerate,
  isGenerating = false,
}: ScopeEditorDrawerProps) => {
  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[90vh] bg-[hsl(222,47%,8%)] border-t border-cyan-500/30">
        {/* Blueprint corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-cyan-500/50 rounded-tl-sm" />
        <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-cyan-500/50 rounded-tr-sm" />
        
        <DrawerHeader className="border-b border-cyan-500/20 bg-[hsl(222,47%,6%)]">
          <div className="max-w-5xl mx-auto w-full px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Icon with blueprint glow */}
              <div className={cn(
                "relative w-12 h-12 rounded-xl flex items-center justify-center",
                "bg-gradient-to-br shadow-lg",
                "before:absolute before:inset-0 before:rounded-xl before:bg-cyan-500/10 before:animate-pulse",
                gradient
              )}>
                <Icon className="w-6 h-6 text-white relative z-10" />
                <div className="absolute inset-0 rounded-xl border border-cyan-500/30" />
              </div>
              <div>
                <DrawerTitle className="text-xl font-bold text-white font-mono tracking-wide">
                  {title}
                </DrawerTitle>
                <DrawerDescription className="text-sm text-cyan-400/70 font-mono">
                  {subtitle}
                </DrawerDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {onAIGenerate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAIGenerate}
                  disabled={isGenerating}
                  className={cn(
                    "gap-2 font-mono text-xs",
                    "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
                    "hover:bg-cyan-500/20 hover:border-cyan-500/50",
                    "transition-all duration-300"
                  )}
                >
                  <Sparkles className={cn("w-4 h-4", isGenerating && "animate-spin")} />
                  {isGenerating ? "GENERATING..." : "GENERATE WITH AI"}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-cyan-500/30"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1 h-full">
          <div className="max-w-5xl mx-auto w-full px-4 py-6">
            {children}
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};
