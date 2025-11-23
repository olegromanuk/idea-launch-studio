import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CanvasCell } from "@/components/canvas/CanvasCell";
import { ExpandedCanvasEditor } from "@/components/canvas/ExpandedCanvasEditor";
import { TeamChat } from "@/components/canvas/TeamChat";
import { AIChat } from "@/components/canvas/AIChat";
import { CelebrationModal } from "@/components/canvas/CelebrationModal";
import { ValidationModal } from "@/components/canvas/ValidationModal";
import { ArrowLeft, Download, Home, Briefcase, Code, Megaphone, CheckCircle2, Lock, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CanvasSection {
  key: string;
  title: string;
  subtitle: string;
}

interface CanvasTab {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  sections: CanvasSection[];
}

const Canvas = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projectData, setProjectData] = useState<any>(null);
  const [loadingSection, setLoadingSection] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [pendingSuggestion, setPendingSuggestion] = useState<string>("");
  const [activeTab, setActiveTab] = useState("business");
  const [celebrationBlock, setCelebrationBlock] = useState<{ id: string; title: string } | null>(null);
  const [completedBlocks, setCompletedBlocks] = useState<Set<string>>(new Set());
  const [validationBlock, setValidationBlock] = useState<{ id: string; title: string } | null>(null);
  const [validatedBlocks, setValidatedBlocks] = useState<Set<string>>(new Set());
  const [unlockedBlock, setUnlockedBlock] = useState<string | null>(null);
  
  const [canvasData, setCanvasData] = useState({
    // Business Logic
    problem: "",
    targetAudience: "",
    uniqueValueProposition: "",
    revenueModel: "",
    marketTrends: "",
    successMetrics: "",
    
    // Development
    coreFeatures: "",
    userFlow: "",
    techStack: "",
    dataRequirements: "",
    integrations: "",
    securityConsiderations: "",
    
    // Go-to-Market
    positioning: "",
    acquisitionChannels: "",
    pricingModel: "",
    launchPlan: "",
    contentStrategy: "",
    growthLoops: "",
  });

  const canvasTabs: CanvasTab[] = [
    {
      id: "business",
      title: "Business Logic",
      icon: Briefcase,
      sections: [
        { key: "problem", title: "Problem", subtitle: "What problem are you solving?" },
        { key: "targetAudience", title: "Target Audience", subtitle: "Who has this problem?" },
        { key: "uniqueValueProposition", title: "Unique Value Proposition", subtitle: "Why you over competitors?" },
        { key: "revenueModel", title: "Revenue Model / Monetization", subtitle: "How will you make money?" },
        { key: "marketTrends", title: "Market Trends & Validation", subtitle: "What market signals support this?" },
        { key: "successMetrics", title: "Success Metrics", subtitle: "How will you measure success?" },
      ],
    },
    {
      id: "development",
      title: "Development",
      icon: Code,
      sections: [
        { key: "coreFeatures", title: "Core Features", subtitle: "What are the must-have features?" },
        { key: "userFlow", title: "User Flow", subtitle: "How do users interact with your product?" },
        { key: "techStack", title: "Tech Stack", subtitle: "What technologies will you use?" },
        { key: "dataRequirements", title: "Data Requirements", subtitle: "What data do you need to collect/store?" },
        { key: "integrations", title: "Integrations", subtitle: "What third-party services will you integrate?" },
        { key: "securityConsiderations", title: "Security Considerations", subtitle: "How will you protect user data?" },
      ],
    },
    {
      id: "gtm",
      title: "Go-to-Market",
      icon: Megaphone,
      sections: [
        { key: "positioning", title: "Positioning & Messaging", subtitle: "How will you position your product?" },
        { key: "acquisitionChannels", title: "Acquisition Channels", subtitle: "Where will you find customers?" },
        { key: "pricingModel", title: "Pricing Model", subtitle: "What will you charge?" },
        { key: "launchPlan", title: "Launch Plan", subtitle: "How will you launch?" },
        { key: "contentStrategy", title: "Content Strategy", subtitle: "What content will you create?" },
        { key: "growthLoops", title: "Growth Loops", subtitle: "How will you drive viral growth?" },
      ],
    },
  ];

  useEffect(() => {
    const data = localStorage.getItem("productIdea");
    if (!data) {
      navigate("/");
      return;
    }
    setProjectData(JSON.parse(data));
    
    // Load saved canvas data if exists
    const savedCanvas = localStorage.getItem("multiCanvas");
    if (savedCanvas) {
      setCanvasData(JSON.parse(savedCanvas));
    }

    // Load completed blocks
    const savedCompletions = localStorage.getItem("completedBlocks");
    if (savedCompletions) {
      setCompletedBlocks(new Set(JSON.parse(savedCompletions)));
    }

    // Load validated blocks
    const savedValidations = localStorage.getItem("validatedBlocks");
    if (savedValidations) {
      setValidatedBlocks(new Set(JSON.parse(savedValidations)));
    }
  }, [navigate]);

  useEffect(() => {
    // Auto-save canvas data
    localStorage.setItem("multiCanvas", JSON.stringify(canvasData));

    // Check for newly completed blocks
    canvasTabs.forEach((tab) => {
      const progress = calculateCanvasProgress(tab.id);
      if (progress === 100 && !completedBlocks.has(tab.id)) {
        // Block just completed!
        setCelebrationBlock({ id: tab.id, title: tab.title });
        const newCompleted = new Set(completedBlocks);
        newCompleted.add(tab.id);
        setCompletedBlocks(newCompleted);
        localStorage.setItem("completedBlocks", JSON.stringify([...newCompleted]));
      }
    });
  }, [canvasData]);

  const handleCanvasChange = (field: string, value: string) => {
    setCanvasData(prev => ({ ...prev, [field]: value }));
  };

  const generateSuggestions = async (section: string) => {
    setLoadingSection(section);
    try {
      const { data, error } = await supabase.functions.invoke('generate-canvas-suggestions', {
        body: { section, productIdea: projectData }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      if (data?.suggestions) {
        handleCanvasChange(section, data.suggestions);
        toast({
          title: "Suggestions generated!",
          description: "AI suggestions have been added to the section.",
        });
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to generate suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingSection(null);
    }
  };

  const handleExpandSection = (sectionKey: string) => {
    setExpandedSection(sectionKey);
    setPendingSuggestion("");
  };

  const handleAcceptSuggestion = () => {
    if (expandedSection && pendingSuggestion) {
      handleCanvasChange(expandedSection, pendingSuggestion);
      setPendingSuggestion("");
    }
  };

  const calculateCanvasProgress = (tabId: string) => {
    const tab = canvasTabs.find(t => t.id === tabId);
    if (!tab) return 0;
    
    const filledSections = tab.sections.filter(section => {
      const value = canvasData[section.key as keyof typeof canvasData];
      return value && value.trim().length > 0;
    });
    
    return (filledSections.length / tab.sections.length) * 100;
  };

  const calculateOverallProgress = () => {
    const allSections = canvasTabs.flatMap(tab => tab.sections);
    const filledSections = allSections.filter(section => {
      const value = canvasData[section.key as keyof typeof canvasData];
      return value && value.trim().length > 0;
    });
    return (filledSections.length / allSections.length) * 100;
  };

  const handleValidateBlock = (blockId: string) => {
    const newValidated = new Set(validatedBlocks);
    newValidated.add(blockId);
    setValidatedBlocks(newValidated);
    localStorage.setItem("validatedBlocks", JSON.stringify([...newValidated]));
    
    // Check if this unlocks the next block
    let nextBlock: string | null = null;
    if (blockId === "business") {
      nextBlock = "development";
    } else if (blockId === "development") {
      nextBlock = "gtm";
    }
    
    if (nextBlock) {
      // Trigger unlock animation
      setUnlockedBlock(nextBlock);
      setTimeout(() => setUnlockedBlock(null), 2000);
      
      // Show unlock notification
      setTimeout(() => {
        const nextBlockTitle = canvasTabs.find(t => t.id === nextBlock)?.title;
        toast({
          title: "🎉 New Block Unlocked!",
          description: `${nextBlockTitle} is now available. Great progress!`,
        });
      }, 800);
    }
    
    toast({
      title: "Validation Submitted",
      description: "Your canvas has been submitted for review. You'll be notified once it's approved.",
    });
  };

  const isBlockLocked = (blockId: string) => {
    if (blockId === "business") return false;
    if (blockId === "development") return !validatedBlocks.has("business");
    if (blockId === "gtm") return !validatedBlocks.has("development");
    return false;
  };

  const overallProgress = calculateOverallProgress();

  if (!projectData) return null;

  return (
    <div className="min-h-screen gradient-subtle">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="hover-scale"
              >
                <Home className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="font-semibold text-foreground">
                  {projectData?.idea || "Your Product Journey"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {Math.round(overallProgress)}% complete across all canvases
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="hover-lift"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
              <Button
                size="sm"
                className="gradient-accent text-white hover-accent-glow"
              >
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={overallProgress} className="h-2" />
          </div>
        </div>
      </header>

      {/* Canvas Tabs */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <TooltipProvider>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                {canvasTabs.map((tab) => {
                  const Icon = tab.icon;
                  const progress = calculateCanvasProgress(tab.id);
                  const isLocked = isBlockLocked(tab.id);
                  const isUnlocking = unlockedBlock === tab.id;
                  const previousBlockName = tab.id === "development" ? "Business Logic" : "Development";
                  
                    return (
                     <TabsTrigger
                       key={tab.id}
                       value={tab.id}
                       className={cn(
                         "flex flex-col items-center gap-1 py-3 transition-all",
                         isLocked && "opacity-50",
                         isUnlocking && "animate-[pulse_0.5s_ease-in-out_3] scale-105 shadow-glow"
                       )}
                       onClick={(e) => {
                         if (isLocked) {
                           e.preventDefault();
                           e.stopPropagation();
                           toast({
                             title: "Block Locked",
                             description: "Please complete and validate the previous block first.",
                             variant: "destructive",
                           });
                         }
                       }}
                     >
                      <div className="flex items-center gap-2 relative">
                        <Icon className={cn("w-4 h-4", isUnlocking && "animate-scale-in")} />
                        <span className="hidden sm:inline">{tab.title}</span>
                        {isLocked && !isUnlocking && (
                          <div className="flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <Tooltip delayDuration={100}>
                              <TooltipTrigger asChild>
                                <span 
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center justify-center cursor-help"
                                >
                                  <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent 
                                side="bottom" 
                                className="max-w-xs bg-popover text-popover-foreground border-border shadow-lg z-50 p-3"
                                sideOffset={5}
                              >
                                <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                                  <Lock className="w-4 h-4" />
                                  Block Locked
                                </p>
                                <p className="text-xs leading-relaxed">
                                  Complete and validate <strong className="text-foreground font-semibold">{previousBlockName}</strong> to unlock this block.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        )}
                        {isUnlocking && <span className="text-xs animate-fade-in">🔓</span>}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(progress)}%
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {canvasTabs.map((tab) => {
                const isLocked = isBlockLocked(tab.id);
                const previousBlockName = tab.id === "development" ? "Business Logic" : "Development";
                
                return (
                <TabsContent key={tab.id} value={tab.id} className="space-y-6">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-2xl font-bold text-foreground">
                        {tab.title}
                      </h3>
                      {!isLocked && (
                        <Button
                          onClick={() => setValidationBlock({ id: tab.id, title: tab.title })}
                          className="gradient-accent text-white hover-accent-glow"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Validate
                        </Button>
                      )}
                    </div>
                    <Progress
                      value={calculateCanvasProgress(tab.id)}
                      className="h-2"
                    />
                  </div>

                  {isLocked ? (
                    <div className="glass p-8 rounded-lg text-center space-y-6">
                      <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <Lock className="w-8 h-8 text-primary" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xl font-semibold text-foreground">
                          This Section is Locked
                        </h4>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          Before you can access the <strong>{tab.title}</strong> canvas, you must complete and validate the <strong>{previousBlockName}</strong> block.
                        </p>
                      </div>
                      
                      {/* Unlock Requirements */}
                      <div className="glass-dark p-4 rounded-lg max-w-lg mx-auto text-left space-y-3">
                        <h5 className="font-semibold text-foreground text-sm">How to unlock this block:</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">1.</span>
                            <span className="text-muted-foreground">
                              Complete all sections in the <strong className="text-foreground">{previousBlockName}</strong> canvas
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">2.</span>
                            <span className="text-muted-foreground">
                              Click the <strong className="text-foreground">"Validate"</strong> button to submit your canvas for review
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">3.</span>
                            <span className="text-muted-foreground">
                              Once validated, the <strong className="text-foreground">{tab.title}</strong> block will automatically unlock
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => {
                          if (tab.id === "development") {
                            setActiveTab("business");
                          } else if (tab.id === "gtm") {
                            setActiveTab("development");
                          }
                        }}
                        className="mt-4"
                      >
                        Go to {previousBlockName}
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tab.sections.map((section) => (
                        <CanvasCell
                          key={section.key}
                          title={section.title}
                          subtitle={section.subtitle}
                          value={canvasData[section.key as keyof typeof canvasData]}
                          onChange={(value) => handleCanvasChange(section.key, value)}
                          onAIGenerate={() => generateSuggestions(section.key)}
                          onExpand={() => handleExpandSection(section.key)}
                          isGenerating={loadingSection === section.key}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
                );
              })}
            </Tabs>
          </TooltipProvider>
        </div>
      </main>

      {/* Expanded Editor */}
      <ExpandedCanvasEditor
        isOpen={expandedSection !== null}
        onClose={() => {
          setExpandedSection(null);
          setPendingSuggestion("");
        }}
        title={
          canvasTabs
            .flatMap((t) => t.sections)
            .find((s) => s.key === expandedSection)?.title || ""
        }
        subtitle={
          canvasTabs
            .flatMap((t) => t.sections)
            .find((s) => s.key === expandedSection)?.subtitle || ""
        }
        value={expandedSection ? canvasData[expandedSection as keyof typeof canvasData] : ""}
        onChange={(value) => {
          if (expandedSection) {
            handleCanvasChange(expandedSection, value);
          }
        }}
        onAIGenerate={() => {
          if (expandedSection) {
            generateSuggestions(expandedSection);
          }
        }}
        isGenerating={loadingSection === expandedSection}
        aiSuggestion={pendingSuggestion}
        onAcceptSuggestion={handleAcceptSuggestion}
        onDiscardSuggestion={() => setPendingSuggestion("")}
        onRequestSupport={() => setIsChatOpen(true)}
        onChatWithAI={() => setIsAIChatOpen(true)}
      />

      {/* Team Chat Panel */}
      <TeamChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* AI Chat Panel */}
      <AIChat 
        isOpen={isAIChatOpen} 
        onClose={() => setIsAIChatOpen(false)}
        canvasContext={expandedSection ? {
          sectionTitle: canvasTabs
            .flatMap((t) => t.sections)
            .find((s) => s.key === expandedSection)?.title || "",
          sectionSubtitle: canvasTabs
            .flatMap((t) => t.sections)
            .find((s) => s.key === expandedSection)?.subtitle || "",
          currentContent: canvasData[expandedSection as keyof typeof canvasData] || "",
          projectData
        } : undefined}
      />

      {/* Celebration Modal */}
      <CelebrationModal
        isOpen={celebrationBlock !== null}
        onClose={() => setCelebrationBlock(null)}
        blockId={celebrationBlock?.id || ""}
        blockTitle={celebrationBlock?.title || ""}
      />

      {/* Validation Modal */}
      <ValidationModal
        isOpen={validationBlock !== null}
        onClose={() => setValidationBlock(null)}
        blockId={validationBlock?.id || ""}
        blockTitle={validationBlock?.title || ""}
        progress={validationBlock ? calculateCanvasProgress(validationBlock.id) : 0}
        onValidate={() => validationBlock && handleValidateBlock(validationBlock.id)}
      />
    </div>
  );
};

export default Canvas;
