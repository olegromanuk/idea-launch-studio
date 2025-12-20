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
      <DrawerContent className="h-[90vh]">
        <DrawerHeader className="border-b border-border">
          <div className="max-w-5xl mx-auto w-full px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                "bg-gradient-to-br shadow-lg",
                gradient
              )}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <DrawerTitle className="text-xl font-bold">
                  {title}
                </DrawerTitle>
                <DrawerDescription className="text-sm">
                  {subtitle}
                </DrawerDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onAIGenerate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAIGenerate}
                  disabled={isGenerating}
                  className="gap-2"
                >
                  <Sparkles className={cn("w-4 h-4", isGenerating && "animate-spin")} />
                  {isGenerating ? "Generating..." : "Generate with AI"}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
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
