import { useState, useEffect, useCallback } from "react";

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
import { Roadmap } from "@/components/canvas/Roadmap";
import { UserStoriesList } from "@/components/canvas/scope/UserStoriesList";
import { FeatureScope } from "@/components/canvas/scope/FeatureScope";
import { TasksMilestones } from "@/components/canvas/scope/TasksMilestones";
import { TimelineEstimates } from "@/components/canvas/scope/TimelineEstimates";
import { RisksConstraints } from "@/components/canvas/scope/RisksConstraints";
import { TechnicalSolution } from "@/components/canvas/scope/TechnicalSolution";
import { ScopeBlockCard } from "@/components/canvas/scope/ScopeBlockCard";
import { ScopeEditorDrawer } from "@/components/canvas/scope/ScopeEditorDrawer";
import { ArrowLeft, Download, Home, Briefcase, Code, Megaphone, CheckCircle2, Lock, Info, FileText, File, Sparkles, ClipboardList, FolderOpen, LogIn, Users, Layers, ListTodo, Clock, AlertTriangle, Cpu, Map, Rocket } from "lucide-react";
import { DevelopmentSubmissionForm } from "@/components/development/DevelopmentSubmissionForm";
import { HorizontalRoadmap } from "@/components/canvas/HorizontalRoadmap";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { exportToText, exportToPDF } from "@/lib/exportUtils";
import { AuthButton } from "@/components/auth/AuthButton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();
  const [projectId, setProjectId] = useState<string | null>(null);
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
  const [openScopeDrawer, setOpenScopeDrawer] = useState<string | null>(null);
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  
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

  // Scope data with structured formats
  const [scopeData, setScopeData] = useState({
    userStories: [] as any[],
    features: [] as any[],
    milestones: [] as any[],
    timeline: [] as any[],
    risks: [] as any[],
    technicalSolution: "",
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
      id: "scope",
      title: "Scope & Planning",
      icon: ClipboardList,
      sections: [
        { key: "userStories", title: "User Stories", subtitle: "High-level user journey and acceptance criteria" },
        { key: "featureScope", title: "Scope of Features", subtitle: "Define MVP features vs nice-to-haves" },
        { key: "taskBreakdown", title: "Tasks & Milestones", subtitle: "Break down work into actionable tasks" },
        { key: "technicalSolution", title: "Technical Solution", subtitle: "Architecture and technology decisions" },
        { key: "risksConstraints", title: "Risks & Constraints", subtitle: "Identify blockers and mitigation plans" },
        { key: "timeline", title: "Timeline & Estimates", subtitle: "Project phases and delivery schedule" },
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
    const storedProjectId = localStorage.getItem("currentProjectId");
    const data = localStorage.getItem("productIdea");
    
    if (!data) {
      navigate("/onboarding");
      return;
    }
    
    setProjectId(storedProjectId);
    setProjectData(JSON.parse(data));
    
    // Load saved canvas data if exists
    const savedCanvas = localStorage.getItem("multiCanvas");
    if (savedCanvas) {
      setCanvasData(JSON.parse(savedCanvas));
    }

    // Load saved scope data
    const savedScope = localStorage.getItem("scopeData");
    if (savedScope) {
      setScopeData(JSON.parse(savedScope));
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

  // Save scope data locally and to DB
  useEffect(() => {
    localStorage.setItem("scopeData", JSON.stringify(scopeData));
  }, [scopeData]);

  // Save canvas data locally and to database
  useEffect(() => {
    localStorage.setItem("multiCanvas", JSON.stringify(canvasData));

    // Save to database if we have a project ID and user
    if (projectId && user) {
      const saveToDb = async () => {
        await supabase
          .from("projects")
          .update({ 
            canvas_data: { ...canvasData, scopeData },
            updated_at: new Date().toISOString()
          })
          .eq("id", projectId);
      };
      // Debounce the save
      const timeout = setTimeout(saveToDb, 1000);
      return () => clearTimeout(timeout);
    }

    // Check for newly completed blocks
    canvasTabs.forEach((tab) => {
      const progress = calculateCanvasProgress(tab.id);
      if (progress === 100 && !completedBlocks.has(tab.id)) {
        setCelebrationBlock({ id: tab.id, title: tab.title });
        const newCompleted = new Set(completedBlocks);
        newCompleted.add(tab.id);
        setCompletedBlocks(newCompleted);
        localStorage.setItem("completedBlocks", JSON.stringify([...newCompleted]));
      }
    });
  }, [canvasData, scopeData, projectId, user]);

  const handleExportPDF = () => {
    exportToPDF(canvasData, canvasTabs, projectData?.idea || "Product Canvas");
    toast({
      title: "PDF Exported",
      description: "Your canvas has been exported as a PDF file.",
    });
  };

  const handleExportText = () => {
    exportToText(canvasData, canvasTabs, projectData?.idea || "Product Canvas");
    toast({
      title: "Text File Exported",
      description: "Your canvas has been exported as a text file.",
    });
  };

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
        // Handle structured scope data
        const scopeSections = ['userStories', 'featureScope', 'taskBreakdown', 'technicalSolution', 'risksConstraints', 'timeline'];
        
        if (scopeSections.includes(section)) {
          const suggestions = data.suggestions;
          
          if (section === 'userStories' && suggestions.stories) {
            const newStories = suggestions.stories.map((s: any) => ({
              id: crypto.randomUUID(),
              persona: s.persona,
              action: s.action,
              benefit: s.benefit,
              priority: s.priority,
              completed: false,
              status: "backlog" as const,
              acceptanceCriteria: [],
              labels: [],
              storyPoints: 0,
            }));
            // APPEND to existing stories instead of replacing
            setScopeData(prev => ({ ...prev, userStories: [...prev.userStories, ...newStories] }));
          } else if (section === 'featureScope' && suggestions.features) {
            // Map effort values from AI (low/medium/high) to component (small/medium/large)
            const effortMap: Record<string, string> = { low: 'small', medium: 'medium', high: 'large' };
            const newFeatures = suggestions.features.map((f: any) => ({
              id: crypto.randomUUID(),
              name: f.name,
              description: f.description,
              category: f.category,
              effort: effortMap[f.effort] || 'medium',
            }));
            // APPEND to existing features instead of replacing
            setScopeData(prev => ({ ...prev, features: [...prev.features, ...newFeatures] }));
          } else if (section === 'taskBreakdown' && suggestions.milestones) {
            const newMilestones = suggestions.milestones.map((m: any) => ({
              id: crypto.randomUUID(),
              name: m.name,
              collapsed: false,
              tasks: m.tasks.map((t: any) => ({
                id: crypto.randomUUID(),
                title: t.name,
                status: t.status || 'todo',
                priority: 'medium' as const,
              })),
            }));
            // APPEND to existing milestones instead of replacing
            setScopeData(prev => ({ ...prev, milestones: [...prev.milestones, ...newMilestones] }));
          } else if (section === 'timeline' && suggestions.phases) {
            const colorMap: Record<string, string> = {
              violet: 'from-violet-500 to-purple-500',
              blue: 'from-blue-500 to-cyan-500',
              green: 'from-emerald-500 to-teal-500',
              amber: 'from-amber-500 to-orange-500',
              rose: 'from-rose-500 to-pink-500',
              indigo: 'from-indigo-500 to-blue-500',
            };
            const defaultColors = [
              'from-violet-500 to-purple-500',
              'from-blue-500 to-cyan-500',
              'from-emerald-500 to-teal-500',
              'from-amber-500 to-orange-500',
            ];
            const newTimeline = suggestions.phases.map((p: any, index: number) => ({
              id: crypto.randomUUID(),
              name: p.name,
              weeks: typeof p.duration === 'number' ? p.duration : parseInt(p.duration) || 2,
              color: colorMap[p.color] || defaultColors[index % defaultColors.length],
            }));
            // APPEND to existing timeline instead of replacing
            setScopeData(prev => ({ ...prev, timeline: [...prev.timeline, ...newTimeline] }));
          } else if (section === 'risksConstraints' && suggestions.items) {
            const newRisks = suggestions.items.map((r: any) => ({
              id: crypto.randomUUID(),
              type: r.type,
              title: r.title,
              description: r.description,
              impact: r.impact,
              likelihood: r.likelihood,
              mitigation: r.mitigation,
            }));
            // APPEND to existing risks instead of replacing
            setScopeData(prev => ({ ...prev, risks: [...prev.risks, ...newRisks] }));
          } else if (section === 'technicalSolution' && suggestions.solution) {
            setScopeData(prev => ({ ...prev, technicalSolution: suggestions.solution }));
          }
        } else {
          handleCanvasChange(section, data.suggestions);
        }
        
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
    
    // Special handling for Scope tab which uses scopeData instead of canvasData
    if (tabId === "scope") {
      const scopeFields = [
        { key: "userStories", data: scopeData.userStories },
        { key: "featureScope", data: scopeData.features },
        { key: "taskBreakdown", data: scopeData.milestones },
        { key: "technicalSolution", data: scopeData.technicalSolution },
        { key: "risksConstraints", data: scopeData.risks },
        { key: "timeline", data: scopeData.timeline },
      ];
      
      const filledSections = scopeFields.filter(field => {
        if (typeof field.data === 'string') {
          return field.data.trim().length > 0;
        }
        return Array.isArray(field.data) && field.data.length > 0;
      });
      
      return (filledSections.length / scopeFields.length) * 100;
    }
    
    const filledSections = tab.sections.filter(section => {
      const value = canvasData[section.key as keyof typeof canvasData];
      return value && value.trim().length > 0;
    });
    
    return (filledSections.length / tab.sections.length) * 100;
  };

  const calculateOverallProgress = () => {
    // Calculate progress for each tab type
    let totalSections = 0;
    let filledSections = 0;
    
    canvasTabs.forEach(tab => {
      if (tab.id === "scope") {
        // Scope tab uses scopeData
        const scopeFields = [
          scopeData.userStories,
          scopeData.features,
          scopeData.milestones,
          scopeData.technicalSolution,
          scopeData.risks,
          scopeData.timeline,
        ];
        totalSections += scopeFields.length;
        filledSections += scopeFields.filter(field => {
          if (typeof field === 'string') return field.trim().length > 0;
          return Array.isArray(field) && field.length > 0;
        }).length;
      } else {
        // Other tabs use canvasData
        tab.sections.forEach(section => {
          totalSections++;
          const value = canvasData[section.key as keyof typeof canvasData];
          if (value && value.trim().length > 0) {
            filledSections++;
          }
        });
      }
    });
    
    return totalSections > 0 ? (filledSections / totalSections) * 100 : 0;
  };

  const handleValidateBlock = (blockId: string) => {
    const newValidated = new Set(validatedBlocks);
    newValidated.add(blockId);
    setValidatedBlocks(newValidated);
    localStorage.setItem("validatedBlocks", JSON.stringify([...newValidated]));
    
    // Check if this unlocks the next block
    let nextBlock: string | null = null;
    if (blockId === "business") {
      nextBlock = "scope";
    } else if (blockId === "scope") {
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
    if (blockId === "scope") return !validatedBlocks.has("business");
    if (blockId === "development") return !validatedBlocks.has("scope");
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
                onClick={() => user ? navigate("/projects") : navigate("/onboarding")}
                className="hover-scale"
                title={user ? "My Projects" : "New Project"}
              >
                <FolderOpen className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="font-semibold text-foreground">
                  {projectData?.idea || "Your Product Journey"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {Math.round(overallProgress)}% complete across all canvases
                  {!user && <span className="ml-2 text-amber-500">(Not saved)</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <AuthButton />
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
                variant="outline"
                size="sm"
                onClick={() => setIsRoadmapOpen(true)}
                className="hover-lift"
              >
                <Map className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Roadmap</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/board")}
                className="hover-lift"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Board</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    className="gradient-accent text-white hover-accent-glow"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={handleExportPDF}
                    className="cursor-pointer"
                  >
                    <File className="w-4 h-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleExportText}
                    className="cursor-pointer"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export as Text
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
              <TabsList className="grid w-full grid-cols-4 mb-8">
                {canvasTabs.map((tab) => {
                  const Icon = tab.icon;
                  const progress = calculateCanvasProgress(tab.id);
                  const isLocked = isBlockLocked(tab.id);
                  const isUnlocking = unlockedBlock === tab.id;
                  const getPreviousBlockName = (tabId: string) => {
                    if (tabId === "scope") return "Business Logic";
                    if (tabId === "development") return "Scope & Planning";
                    if (tabId === "gtm") return "Development";
                    return "";
                  };
                  const previousBlockName = getPreviousBlockName(tab.id);
                  
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
                const getPreviousBlockNameForContent = (tabId: string) => {
                  if (tabId === "scope") return "Business Logic";
                  if (tabId === "development") return "Scope & Planning";
                  if (tabId === "gtm") return "Development";
                  return "";
                };
                const previousBlockName = getPreviousBlockNameForContent(tab.id);
                
                return (
                <TabsContent key={tab.id} value={tab.id} className="space-y-8">
                  {/* Tab Header with premium styling */}
                  <div className="relative overflow-hidden rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-6">
                    {/* Background decoration */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    
                    <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-14 h-14 rounded-xl flex items-center justify-center",
                          "bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30"
                        )}>
                          <tab.icon className="w-7 h-7 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-foreground mb-1">
                            {tab.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Complete all {tab.sections.length} sections to proceed
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {/* Progress circle */}
                        <div className="relative w-16 h-16">
                          <svg className="w-16 h-16 -rotate-90">
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                              className="text-muted"
                            />
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke="url(#progressGradient)"
                              strokeWidth="4"
                              fill="none"
                              strokeLinecap="round"
                              strokeDasharray={`${calculateCanvasProgress(tab.id) * 1.76} 176`}
                              className="transition-all duration-500"
                            />
                            <defs>
                              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="hsl(var(--primary))" />
                                <stop offset="100%" stopColor="hsl(var(--accent))" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-bold text-foreground">
                              {Math.round(calculateCanvasProgress(tab.id))}%
                            </span>
                          </div>
                        </div>
                        
                        {!isLocked && (
                          <Button
                            onClick={() => setValidationBlock({ id: tab.id, title: tab.title })}
                            className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Validate
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {isLocked ? (
                    <div className="relative overflow-hidden rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-8 text-center space-y-6">
                      {/* Background effects */}
                      <div className="absolute inset-0 bg-gradient-to-br from-muted/50 via-transparent to-muted/50" />
                      
                      <div className="relative">
                        <div className="flex justify-center mb-6">
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center border border-border/50 shadow-lg">
                            <Lock className="w-10 h-10 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="space-y-2 mb-6">
                          <h4 className="text-2xl font-bold text-foreground">
                            This Section is Locked
                          </h4>
                          <p className="text-muted-foreground max-w-md mx-auto">
                            Complete and validate <span className="font-semibold text-foreground">{previousBlockName}</span> to unlock
                          </p>
                        </div>
                        
                        {/* Unlock Requirements - Premium Card */}
                        <div className="max-w-lg mx-auto rounded-xl bg-card border border-border/50 p-6 text-left shadow-lg">
                          <h5 className="font-bold text-foreground text-sm mb-4 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            How to unlock
                          </h5>
                          <div className="space-y-3">
                            {[
                              `Complete all sections in ${previousBlockName}`,
                              `Click "Validate" to submit for review`,
                              `${tab.title} will unlock automatically`
                            ].map((step, i) => (
                              <div key={i} className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary-foreground">
                                  {i + 1}
                                </div>
                                <span className="text-sm text-muted-foreground pt-0.5">{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => {
                            if (tab.id === "scope") {
                              setActiveTab("business");
                            } else if (tab.id === "development") {
                              setActiveTab("scope");
                            } else if (tab.id === "gtm") {
                              setActiveTab("development");
                            }
                          }}
                          className="mt-6"
                        >
                          Go to {previousBlockName}
                        </Button>
                      </div>
                    </div>
                  ) : tab.id === "scope" ? (
                    <div className="space-y-4">
                      {/* User Stories Block */}
                      <ScopeBlockCard
                        title="User Stories"
                        subtitle="High-level user journey and acceptance criteria"
                        icon={Users}
                        gradient="from-blue-500 to-cyan-500"
                        itemCount={scopeData.userStories.length}
                        completedCount={scopeData.userStories.filter(s => s.completed).length}
                        onAIGenerate={() => generateSuggestions("userStories")}
                        isGenerating={loadingSection === "userStories"}
                        onViewAll={() => setOpenScopeDrawer("userStories")}
                      >
                        {scopeData.userStories.slice(0, 5).map((story, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border/50">
                            <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Users className="w-3 h-3 text-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">
                                As a <span className="text-primary">{story.persona}</span>
                              </p>
                              <p className="text-sm text-muted-foreground truncate">I want to {story.action}</p>
                            </div>
                          </div>
                        ))}
                      </ScopeBlockCard>

                      {/* Feature Scope Block */}
                      <ScopeBlockCard
                        title="Scope of Features"
                        subtitle="Define MVP features vs nice-to-haves"
                        icon={Layers}
                        gradient="from-emerald-500 to-teal-500"
                        itemCount={scopeData.features.length}
                        completedCount={scopeData.features.filter(f => f.category === "mvp").length}
                        onAIGenerate={() => generateSuggestions("featureScope")}
                        isGenerating={loadingSection === "featureScope"}
                        onViewAll={() => setOpenScopeDrawer("featureScope")}
                      >
                        {scopeData.features.slice(0, 5).map((feature, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border/50">
                            <div className={`w-2 h-2 rounded-full ${feature.category === "mvp" ? "bg-emerald-500" : feature.category === "future" ? "bg-blue-500" : "bg-purple-500"}`} />
                            <span className="text-sm font-medium text-foreground flex-1">{feature.name}</span>
                            <span className="text-xs text-muted-foreground capitalize">{feature.category}</span>
                          </div>
                        ))}
                      </ScopeBlockCard>

                      {/* Tasks & Milestones Block */}
                      <ScopeBlockCard
                        title="Tasks & Milestones"
                        subtitle="Break down work into actionable tasks"
                        icon={ListTodo}
                        gradient="from-violet-500 to-purple-500"
                        itemCount={scopeData.milestones.length}
                        completedCount={scopeData.milestones.filter(m => m.tasks?.every((t: any) => t.status === "done")).length}
                        onAIGenerate={() => generateSuggestions("taskBreakdown")}
                        isGenerating={loadingSection === "taskBreakdown"}
                        onViewAll={() => setOpenScopeDrawer("taskBreakdown")}
                      >
                        {scopeData.milestones.slice(0, 5).map((milestone, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/50">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-violet-500/10 flex items-center justify-center">
                                <ListTodo className="w-3 h-3 text-violet-500" />
                              </div>
                              <span className="text-sm font-medium text-foreground">{milestone.name}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{milestone.tasks?.length || 0} tasks</span>
                          </div>
                        ))}
                      </ScopeBlockCard>

                      {/* Technical Solution Block */}
                      <ScopeBlockCard
                        title="Technical Solution"
                        subtitle="Architecture and technology decisions"
                        icon={Cpu}
                        gradient="from-slate-500 to-zinc-600"
                        itemCount={scopeData.technicalSolution ? 1 : 0}
                        completedCount={scopeData.technicalSolution ? 1 : 0}
                        onAIGenerate={() => generateSuggestions("technicalSolution")}
                        isGenerating={loadingSection === "technicalSolution"}
                        onViewAll={() => setOpenScopeDrawer("technicalSolution")}
                      >
                        {scopeData.technicalSolution && (
                          <div className="p-3 rounded-lg bg-background border border-border/50">
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {scopeData.technicalSolution}
                            </p>
                          </div>
                        )}
                      </ScopeBlockCard>

                      {/* Risks & Constraints Block */}
                      <ScopeBlockCard
                        title="Risks & Constraints"
                        subtitle="Identify blockers and mitigation plans"
                        icon={AlertTriangle}
                        gradient="from-amber-500 to-orange-500"
                        itemCount={scopeData.risks.length}
                        completedCount={scopeData.risks.filter(r => r.mitigation).length}
                        onAIGenerate={() => generateSuggestions("risksConstraints")}
                        isGenerating={loadingSection === "risksConstraints"}
                        onViewAll={() => setOpenScopeDrawer("risksConstraints")}
                      >
                        {scopeData.risks.slice(0, 5).map((risk, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border/50">
                            <span className={`w-2 h-2 rounded-full ${risk.impact === "high" ? "bg-red-500" : risk.impact === "medium" ? "bg-amber-500" : "bg-green-500"}`} />
                            <span className="text-sm text-foreground flex-1 truncate">{risk.title}</span>
                            <span className="text-xs text-muted-foreground capitalize">{risk.type}</span>
                          </div>
                        ))}
                      </ScopeBlockCard>

                      {/* Timeline & Estimates Block */}
                      <ScopeBlockCard
                        title="Timeline & Estimates"
                        subtitle="Project phases and delivery schedule"
                        icon={Clock}
                        gradient="from-rose-500 to-pink-500"
                        itemCount={scopeData.timeline.length}
                        completedCount={scopeData.timeline.length}
                        onAIGenerate={() => generateSuggestions("timeline")}
                        isGenerating={loadingSection === "timeline"}
                        onViewAll={() => setOpenScopeDrawer("timeline")}
                      >
                        {scopeData.timeline.slice(0, 5).map((phase, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/50">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-rose-500/10 flex items-center justify-center">
                                <Clock className="w-3 h-3 text-rose-500" />
                              </div>
                              <span className="text-sm font-medium text-foreground">{phase.name}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{phase.duration}</span>
                          </div>
                        ))}
                      </ScopeBlockCard>

                      {/* Scope Editor Drawers */}
                      <ScopeEditorDrawer
                        isOpen={openScopeDrawer === "userStories"}
                        onClose={() => setOpenScopeDrawer(null)}
                        title="User Stories"
                        subtitle="Define user journeys and acceptance criteria"
                        icon={Users}
                        gradient="from-blue-500 to-cyan-500"
                        onAIGenerate={() => generateSuggestions("userStories")}
                        isGenerating={loadingSection === "userStories"}
                      >
                        <UserStoriesList
                          stories={scopeData.userStories}
                          onChange={(stories) => setScopeData({ ...scopeData, userStories: stories })}
                          onAIGenerate={() => generateSuggestions("userStories")}
                          isGenerating={loadingSection === "userStories"}
                          projectContext={projectData}
                        />
                      </ScopeEditorDrawer>

                      <ScopeEditorDrawer
                        isOpen={openScopeDrawer === "featureScope"}
                        onClose={() => setOpenScopeDrawer(null)}
                        title="Scope of Features"
                        subtitle="Define MVP features vs nice-to-haves"
                        icon={Layers}
                        gradient="from-emerald-500 to-teal-500"
                        onAIGenerate={() => generateSuggestions("featureScope")}
                        isGenerating={loadingSection === "featureScope"}
                      >
                        <FeatureScope
                          features={scopeData.features}
                          onChange={(features) => setScopeData({ ...scopeData, features })}
                          onAIGenerate={() => generateSuggestions("featureScope")}
                          isGenerating={loadingSection === "featureScope"}
                          availableStories={scopeData.userStories}
                        />
                      </ScopeEditorDrawer>

                      <ScopeEditorDrawer
                        isOpen={openScopeDrawer === "taskBreakdown"}
                        onClose={() => setOpenScopeDrawer(null)}
                        title="Tasks & Milestones"
                        subtitle="Break down work into actionable tasks"
                        icon={ListTodo}
                        gradient="from-violet-500 to-purple-500"
                        onAIGenerate={() => generateSuggestions("taskBreakdown")}
                        isGenerating={loadingSection === "taskBreakdown"}
                      >
                        <TasksMilestones
                          milestones={scopeData.milestones}
                          onChange={(milestones) => setScopeData({ ...scopeData, milestones })}
                          onAIGenerate={() => generateSuggestions("taskBreakdown")}
                          isGenerating={loadingSection === "taskBreakdown"}
                        />
                      </ScopeEditorDrawer>

                      <ScopeEditorDrawer
                        isOpen={openScopeDrawer === "technicalSolution"}
                        onClose={() => setOpenScopeDrawer(null)}
                        title="Technical Solution"
                        subtitle="Architecture and technology decisions"
                        icon={Cpu}
                        gradient="from-slate-500 to-zinc-600"
                        onAIGenerate={() => generateSuggestions("technicalSolution")}
                        isGenerating={loadingSection === "technicalSolution"}
                      >
                        <TechnicalSolution
                          value={scopeData.technicalSolution}
                          onChange={(value) => setScopeData({ ...scopeData, technicalSolution: value })}
                          onAIGenerate={() => generateSuggestions("technicalSolution")}
                          isGenerating={loadingSection === "technicalSolution"}
                        />
                      </ScopeEditorDrawer>

                      <ScopeEditorDrawer
                        isOpen={openScopeDrawer === "risksConstraints"}
                        onClose={() => setOpenScopeDrawer(null)}
                        title="Risks & Constraints"
                        subtitle="Identify blockers and mitigation plans"
                        icon={AlertTriangle}
                        gradient="from-amber-500 to-orange-500"
                        onAIGenerate={() => generateSuggestions("risksConstraints")}
                        isGenerating={loadingSection === "risksConstraints"}
                      >
                        <RisksConstraints
                          items={scopeData.risks}
                          onChange={(risks) => setScopeData({ ...scopeData, risks })}
                          onAIGenerate={() => generateSuggestions("risksConstraints")}
                          isGenerating={loadingSection === "risksConstraints"}
                        />
                      </ScopeEditorDrawer>

                      <ScopeEditorDrawer
                        isOpen={openScopeDrawer === "timeline"}
                        onClose={() => setOpenScopeDrawer(null)}
                        title="Timeline & Estimates"
                        subtitle="Project phases and delivery schedule"
                        icon={Clock}
                        gradient="from-rose-500 to-pink-500"
                        onAIGenerate={() => generateSuggestions("timeline")}
                        isGenerating={loadingSection === "timeline"}
                      >
                        <TimelineEstimates
                          phases={scopeData.timeline}
                          onChange={(timeline) => setScopeData({ ...scopeData, timeline })}
                          onAIGenerate={() => generateSuggestions("timeline")}
                          isGenerating={loadingSection === "timeline"}
                        />
                      </ScopeEditorDrawer>
                    </div>
                  ) : tab.id === "development" ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                          <Rocket className="w-7 h-7 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground">Submit for Development</h3>
                          <p className="text-sm text-muted-foreground">
                            Configure your project settings and submit for development
                          </p>
                        </div>
                      </div>
                      <DevelopmentSubmissionForm
                        projectId={projectId}
                        projectData={projectData || {}}
                        scopeData={scopeData}
                        canvasData={canvasData}
                        onSubmitSuccess={() => {
                          toast({
                            title: "Submission successful!",
                            description: "Your project has been submitted for development. You can track progress in My Submissions.",
                          });
                          navigate("/my-submissions");
                        }}
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {tab.sections.map((section, index) => (
                        <CanvasCell
                          key={section.key}
                          title={section.title}
                          subtitle={section.subtitle}
                          value={canvasData[section.key as keyof typeof canvasData]}
                          onChange={(value) => handleCanvasChange(section.key, value)}
                          onAIGenerate={() => generateSuggestions(section.key)}
                          onExpand={() => handleExpandSection(section.key)}
                          isGenerating={loadingSection === section.key}
                          index={index}
                        />
                      ))}
                    </div>
                  )}

                  {/* Show Roadmap after any block is validated */}
                  {tab.id === "business" && validatedBlocks.has("business") && (
                    <div className="mt-8">
                      <Roadmap
                        projectData={projectData}
                        validatedBlocks={validatedBlocks}
                        onPhaseClick={(tabId) => {
                          setActiveTab(tabId);
                        }}
                      />
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
        onRequestSupport={() => {}}
        onChatWithAI={() => {}}
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

      {/* Horizontal Roadmap */}
      <HorizontalRoadmap
        open={isRoadmapOpen}
        onOpenChange={setIsRoadmapOpen}
        projectData={projectData}
        validatedBlocks={validatedBlocks}
        onPhaseClick={(tabId) => setActiveTab(tabId)}
      />
    </div>
  );
};

export default Canvas;
