import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Sparkles, X, Check, Trash2, Headphones, MessageSquare, Upload } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { TeamChat } from "./TeamChat";
import { AIChat } from "./AIChat";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  onRequestSupport?: () => void;
  onChatWithAI?: () => void;
  canvasContext?: {
    sectionTitle: string;
    sectionSubtitle: string;
    currentContent: string;
    projectData?: any;
  };
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
  onRequestSupport,
  onChatWithAI,
  canvasContext,
}: ExpandedCanvasEditorProps) => {
  const [activeChatPanel, setActiveChatPanel] = useState<'support' | 'ai' | null>(null);
  const { toast } = useToast();
  const [isAddingToDashboard, setIsAddingToDashboard] = useState(false);

  const handleRequestSupport = () => {
    setActiveChatPanel(activeChatPanel === 'support' ? null : 'support');
    onRequestSupport?.();
  };

  const handleChatWithAI = () => {
    setActiveChatPanel(activeChatPanel === 'ai' ? null : 'ai');
    onChatWithAI?.();
  };

  const handleAddToDashboard = async () => {
    if (!value || value.trim().length === 0) {
      toast({
        title: "Nothing to add",
        description: "Please add some content before adding to the dashboard",
        variant: "destructive",
      });
      return;
    }

    setIsAddingToDashboard(true);

    // Get or create user session ID
    let userId = localStorage.getItem("boardUserId");
    if (!userId) {
      userId = `user_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("boardUserId", userId);
    }

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const { error } = await supabase
      .from("dashboard_elements")
      .insert({
        user_id: userId,
        section_key: canvasContext?.sectionTitle || title,
        section_title: title,
        content: value,
        position_x: 100 + Math.random() * 200,
        position_y: 100 + Math.random() * 200,
        width: 350,
        height: 220,
        color: randomColor,
      });

    setIsAddingToDashboard(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add to dashboard. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Added to Dashboard!",
      description: "Your content has been added to the interactive board",
    });
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[85vh]">
        <DrawerHeader className="border-b border-border">
          <div className="max-w-7xl mx-auto w-full px-6 flex items-start justify-between">
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

        <div className="flex-1 overflow-hidden">
          <div className="max-w-7xl mx-auto w-full h-full flex gap-4 px-6 py-6">
            {/* Main Editor Section */}
            <ScrollArea className={`${activeChatPanel ? 'flex-1' : 'w-full'} transition-all`}>
              <div className="space-y-8 pr-4">
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

            {/* Chat Panel Section */}
            {activeChatPanel && (
              <div className="w-[420px] h-full border-l border-border pl-4 animate-slide-in-right">
                {activeChatPanel === 'support' && (
                  <div className="h-full flex flex-col">
                    <TeamChat 
                      isOpen={true} 
                      onClose={() => setActiveChatPanel(null)}
                      embedded={true}
                    />
                  </div>
                )}
                {activeChatPanel === 'ai' && (
                  <div className="h-full flex flex-col">
                    <AIChat 
                      isOpen={true} 
                      onClose={() => setActiveChatPanel(null)}
                      canvasContext={canvasContext}
                      embedded={true}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DrawerFooter className="border-t border-border">
          <div className="max-w-7xl mx-auto w-full px-6 flex flex-col gap-3">
            <div className="flex flex-col md:flex-row gap-3">
              <Button
                variant={activeChatPanel === 'support' ? 'default' : 'outline'}
                className="flex-1 hover-scale"
                onClick={handleRequestSupport}
              >
                <Headphones className="w-4 h-4 mr-2" />
                {activeChatPanel === 'support' ? 'Hide Support' : 'Request Launch Support'}
              </Button>
              <Button
                variant={activeChatPanel === 'ai' ? 'default' : 'outline'}
                className="flex-1 hover-scale"
                onClick={handleChatWithAI}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {activeChatPanel === 'ai' ? 'Hide AI Chat' : 'Chat with AI'}
              </Button>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleAddToDashboard}
                disabled={isAddingToDashboard || !value}
                className="flex-1"
                variant="secondary"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isAddingToDashboard ? "Adding..." : "Add to Online Dashboard"}
              </Button>
              <Button onClick={onClose} className="flex-1">
                Done
              </Button>
            </div>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
