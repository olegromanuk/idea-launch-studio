import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CanvasCell } from "@/components/canvas/CanvasCell";
import { ExpandedCanvasEditor } from "@/components/canvas/ExpandedCanvasEditor";
import { TeamChat } from "@/components/canvas/TeamChat";
import { CelebrationModal } from "@/components/canvas/CelebrationModal";
import { ValidationModal } from "@/components/canvas/ValidationModal";
import { ArrowLeft, Download, Home, Briefcase, Code, Megaphone, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [pendingSuggestion, setPendingSuggestion] = useState<string>("");
  const [activeTab, setActiveTab] = useState("business");
  const [celebrationBlock, setCelebrationBlock] = useState<{ id: string; title: string } | null>(null);
  const [completedBlocks, setCompletedBlocks] = useState<Set<string>>(new Set());
  const [validationBlock, setValidationBlock] = useState<{ id: string; title: string } | null>(null);
  
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
    toast({
      title: "Validation Submitted",
      description: "Your canvas has been submitted for review. You'll be notified once it's approved.",
    });
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              {canvasTabs.map((tab) => {
                const Icon = tab.icon;
                const progress = calculateCanvasProgress(tab.id);
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex flex-col items-center gap-1 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(progress)}%
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {canvasTabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="space-y-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold text-foreground">
                      {tab.title}
                    </h3>
                    <Button
                      onClick={() => setValidationBlock({ id: tab.id, title: tab.title })}
                      className="gradient-accent text-white hover-accent-glow"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Validate
                    </Button>
                  </div>
                  <Progress
                    value={calculateCanvasProgress(tab.id)}
                    className="h-2"
                  />
                </div>

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
              </TabsContent>
            ))}
          </Tabs>
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
      />

      {/* Team Chat Panel */}
      <TeamChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

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
