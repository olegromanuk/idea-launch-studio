import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Sparkles, X, Check, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ExpandedCanvasEditorProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  value: string;
  onChange: (value: string) => void;
  onAIGenerate: () => void;
  isGenerating: boolean;
  aiSuggestion?: string;
  onAcceptSuggestion?: () => void;
  onDiscardSuggestion?: () => void;
}

export const ExpandedCanvasEditor = ({
  isOpen,
  onClose,
  title,
  subtitle,
  value,
  onChange,
  onAIGenerate,
  isGenerating,
  aiSuggestion,
  onAcceptSuggestion,
  onDiscardSuggestion,
}: ExpandedCanvasEditorProps) => {
  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[80vh]">
        <DrawerHeader className="border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <DrawerTitle className="text-xl font-bold uppercase tracking-wide">
                {title}
              </DrawerTitle>
              <DrawerDescription className="text-sm italic mt-1">
                {subtitle}
              </DrawerDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="py-6 space-y-6">
            {/* Main Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Your Content
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAIGenerate}
                  disabled={isGenerating}
                  className="gap-2"
                >
                  <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-pulse' : ''}`} />
                  {isGenerating ? "Generating..." : "Generate with AI"}
                </Button>
              </div>
              <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Type your content here or generate AI suggestions..."
                className="min-h-[200px] text-base resize-none"
              />
            </div>

            {/* AI Suggestion Section */}
            {aiSuggestion && (
              <div className="space-y-2 animate-fade-in">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI Suggestion
                  </Badge>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 border border-border space-y-3">
                  <div className="text-sm text-foreground whitespace-pre-wrap">
                    {aiSuggestion}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={onAcceptSuggestion}
                      className="gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Accept & Replace
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onDiscardSuggestion}
                      className="gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Discard
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Tips Section */}
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
              <h4 className="text-sm font-semibold text-foreground mb-2">
                💡 Tips for better results:
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Be specific and detailed in your descriptions</li>
                <li>Use AI suggestions as a starting point, then customize</li>
                <li>Reference your product idea: "{title}"</li>
              </ul>
            </div>
          </div>
        </ScrollArea>

        <DrawerFooter className="border-t border-border">
          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
