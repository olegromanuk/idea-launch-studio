import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CanvasCell } from "@/components/canvas/CanvasCell";
import { BusinessLogicSection } from "@/components/canvas/BusinessLogicSection";
import { ScopePlanningSection } from "@/components/canvas/scope/ScopePlanningSection";
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
import { MarketingBlockCard } from "@/components/canvas/gtm/MarketingBlockCard";
import { MarketingEditorDrawer } from "@/components/canvas/gtm/MarketingEditorDrawer";
import { TargetAudienceBuilder, AudienceSegment } from "@/components/canvas/gtm/TargetAudienceBuilder";
import { MarketingCreatives, Creative } from "@/components/canvas/gtm/MarketingCreatives";
import { CampaignPlanner, Campaign } from "@/components/canvas/gtm/CampaignPlanner";
import { ContentCalendar, ContentPost } from "@/components/canvas/gtm/ContentCalendar";
import { AdsManager, AdSet } from "@/components/canvas/gtm/AdsManager";
import { LaunchStrategy, LaunchPhase } from "@/components/canvas/gtm/LaunchStrategy";
import { ArrowLeft, Download, Home, Briefcase, Code, Megaphone, CheckCircle2, Lock, Info, FileText, File, Sparkles, ClipboardList, FolderOpen, LogIn, Users, Layers, ListTodo, Clock, AlertTriangle, Cpu, Map, Rocket, Target, Image, Calendar, DollarSign, Settings } from "lucide-react";
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
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  
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

  // GTM data with structured formats
  const [gtmData, setGtmData] = useState({
    audienceSegments: [] as AudienceSegment[],
    creatives: [] as Creative[],
    campaigns: [] as Campaign[],
    contentPosts: [] as ContentPost[],
    adSets: [] as AdSet[],
    launchPhases: [] as LaunchPhase[],
  });

  const [openGtmDrawer, setOpenGtmDrawer] = useState<string | null>(null);

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
      title: "Market Product Fit",
      icon: Megaphone,
      sections: [
        { key: "audienceSegments", title: "Target Audience", subtitle: "Define audience segments & personas" },
        { key: "creatives", title: "Marketing Creatives", subtitle: "Design ads, copy, images & videos" },
        { key: "campaigns", title: "Campaign Planner", subtitle: "Plan campaigns with KPIs & budgets" },
        { key: "contentPosts", title: "Content Calendar", subtitle: "Schedule posts across platforms" },
        { key: "adSets", title: "Ads Manager", subtitle: "Configure ad targeting & budgets" },
        { key: "launchPhases", title: "Launch Strategy", subtitle: "Plan launch phases & milestones" },
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

    // Load saved GTM data
    const savedGtm = localStorage.getItem("gtmData");
    if (savedGtm) {
      setGtmData(JSON.parse(savedGtm));
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

    // Fetch submission status for development progress
    const fetchSubmissionStatus = async () => {
      if (!user || !storedProjectId) return;
      
      const { data: submission } = await supabase
        .from("dev_submissions")
        .select("status")
        .eq("project_id", storedProjectId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (submission) {
        setSubmissionStatus(submission.status);
      }
    };

    if (user) {
      fetchSubmissionStatus();
    }
  }, [navigate, user]);

  // Save scope data locally
  useEffect(() => {
    localStorage.setItem("scopeData", JSON.stringify(scopeData));
  }, [scopeData]);

  // Save GTM data locally
  useEffect(() => {
    localStorage.setItem("gtmData", JSON.stringify(gtmData));
  }, [gtmData]);

  // Save canvas data locally and to database
  useEffect(() => {
    localStorage.setItem("multiCanvas", JSON.stringify(canvasData));

    // Save to database if we have a project ID and user
    if (projectId && user) {
      const saveToDb = async () => {
        await supabase
          .from("projects")
          .update({ 
            canvas_data: { ...canvasData, scopeData, gtmData } as any,
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
  }, [canvasData, scopeData, gtmData, projectId, user]);

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
        // Handle GTM sections
        const gtmSections = ['audienceSegments', 'creatives', 'campaigns', 'contentPosts', 'adSets', 'launchPhases'];
        
        if (gtmSections.includes(section)) {
          const suggestions = data.suggestions;
          
          if (section === 'audienceSegments' && suggestions.segments) {
            const newSegments = suggestions.segments.map((s: any) => ({
              id: crypto.randomUUID(),
              name: s.name,
              description: s.description,
              demographics: {
                ageRange: s.ageRange || '25-34',
                gender: s.gender || 'All',
                location: s.location || '',
                income: s.income || '',
                occupation: s.occupation || '',
              },
              psychographics: {
                interests: s.interests || [],
                painPoints: s.painPoints || [],
                goals: s.goals || [],
                behaviors: s.behaviors || [],
              },
              isPrimary: s.isPrimary || false,
            }));
            // Set first as primary if none exists
            if (gtmData.audienceSegments.length === 0 && newSegments.length > 0) {
              newSegments[0].isPrimary = true;
            }
            setGtmData(prev => ({ ...prev, audienceSegments: [...prev.audienceSegments, ...newSegments] }));
          } else if (section === 'creatives' && suggestions.creatives) {
            const newCreatives = suggestions.creatives.map((c: any) => ({
              id: crypto.randomUUID(),
              title: c.title,
              type: c.type,
              platform: c.platform,
              headline: c.headline,
              body: c.body,
              cta: c.cta,
              visualDescription: c.visualDescription || '',
              status: 'draft' as const,
            }));
            setGtmData(prev => ({ ...prev, creatives: [...prev.creatives, ...newCreatives] }));
          } else if (section === 'campaigns' && suggestions.campaigns) {
            const newCampaigns = suggestions.campaigns.map((c: any) => ({
              id: crypto.randomUUID(),
              name: c.name,
              objective: c.objective,
              channel: c.channel,
              budget: c.budget || 0,
              startDate: c.startDate || '',
              endDate: c.endDate || '',
              status: 'draft' as const,
              kpis: c.kpis || [],
              tactics: c.tactics || [],
            }));
            setGtmData(prev => ({ ...prev, campaigns: [...prev.campaigns, ...newCampaigns] }));
          } else if (section === 'contentPosts' && suggestions.posts) {
            const newPosts = suggestions.posts.map((p: any) => ({
              id: crypto.randomUUID(),
              title: p.title,
              platform: p.platform,
              content: p.content,
              hashtags: p.hashtags || [],
              scheduledFor: p.scheduledFor || '',
              status: 'draft' as const,
              contentType: p.contentType || 'image',
            }));
            setGtmData(prev => ({ ...prev, contentPosts: [...prev.contentPosts, ...newPosts] }));
          } else if (section === 'adSets' && suggestions.adSets) {
            const newAdSets = suggestions.adSets.map((a: any) => ({
              id: crypto.randomUUID(),
              name: a.name,
              platform: a.platform,
              objective: a.objective,
              dailyBudget: a.dailyBudget || 0,
              bidStrategy: a.bidStrategy,
              status: 'draft' as const,
              targeting: {
                ageRange: { min: 18, max: 65 },
                genders: ['all'],
                locations: [],
                interests: [],
              },
              placements: a.placements || [],
            }));
            setGtmData(prev => ({ ...prev, adSets: [...prev.adSets, ...newAdSets] }));
          } else if (section === 'launchPhases' && suggestions.phases) {
            const newPhases = suggestions.phases.map((p: any) => ({
              id: crypto.randomUUID(),
              name: p.name,
              duration: p.duration,
              status: 'upcoming' as const,
              goals: p.goals || [],
              tasks: (p.tasks || []).map((t: any) => ({
                id: crypto.randomUUID(),
                title: t.title,
                completed: t.completed || false,
              })),
            }));
            setGtmData(prev => ({ ...prev, launchPhases: [...prev.launchPhases, ...newPhases] }));
          }
          
          toast({
            title: "Suggestions generated!",
            description: "AI suggestions have been added to the section.",
          });
          return;
        }
        
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
    
    // Special handling for Development tab - based on submission status
    if (tabId === "development") {
      if (!submissionStatus) return 0;
      
      const statusProgressMap: Record<string, number> = {
        submitted: 15,
        review: 30,
        development: 50,
        testing: 70,
        deployment: 85,
        completed: 100,
        on_hold: 50,
        cancelled: 0,
      };
      
      return statusProgressMap[submissionStatus] || 0;
    }
    
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

    // Special handling for GTM tab which uses gtmData
    if (tabId === "gtm") {
      const gtmFields = [
        { key: "audienceSegments", data: gtmData.audienceSegments },
        { key: "creatives", data: gtmData.creatives },
        { key: "campaigns", data: gtmData.campaigns },
        { key: "contentPosts", data: gtmData.contentPosts },
        { key: "adSets", data: gtmData.adSets },
        { key: "launchPhases", data: gtmData.launchPhases },
      ];
      
      const filledSections = gtmFields.filter(field => {
        return Array.isArray(field.data) && field.data.length > 0;
      });
      
      return (filledSections.length / gtmFields.length) * 100;
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
    <div className="min-h-screen bg-[#050505] text-gray-100 relative">
      {/* Tech grid background */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundSize: '40px 40px',
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)',
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <span className="text-[#00f0ff] text-2xl">◈</span>
              <span className="font-bold text-lg tracking-widest text-white">LOGOMIR</span>
            </div>
            <div className="hidden md:flex items-center space-x-8 text-xs font-mono tracking-widest uppercase">
              <button 
                onClick={() => user ? navigate("/projects") : navigate("/onboarding")}
                className="text-slate-500 hover:text-[#00f0ff] transition-colors"
              >
                Dashboard
              </button>
              <span className="text-[#00f0ff] font-bold shadow-[0_1px_0_0_#00f0ff]">Projects</span>
              <button
                onClick={() => setIsRoadmapOpen(true)}
                className="text-slate-500 hover:text-[#00f0ff] transition-colors"
              >
                Roadmap
              </button>
            </div>
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 text-slate-500 hover:text-[#00f0ff] transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#0A0A0A] border-white/10">
                  <DropdownMenuItem 
                    onClick={handleExportPDF}
                    className="cursor-pointer text-slate-300 hover:text-white hover:bg-white/5"
                  >
                    <File className="w-4 h-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleExportText}
                    className="cursor-pointer text-slate-300 hover:text-white hover:bg-white/5"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export as Text
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <button className="p-2 text-slate-500 hover:text-[#00f0ff] transition-colors">
                <Settings className="w-4 h-4" />
              </button>
              <AuthButton />
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-slate-900">
          <div 
            className="h-full bg-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.4)] transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </header>

      {/* Canvas Tabs */}
      <main className="relative z-10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TooltipProvider>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Redesigned Tabs - Clean Blueprint Style */}
              <TabsList className="flex w-full mb-8 bg-transparent border-0 p-0 h-auto gap-2">
                {canvasTabs.map((tab, index) => {
                  const Icon = tab.icon;
                  const progress = calculateCanvasProgress(tab.id);
                  const isLocked = isBlockLocked(tab.id);
                  const isUnlocking = unlockedBlock === tab.id;
                  const isActive = activeTab === tab.id;
                  const getPreviousBlockName = (tabId: string) => {
                    if (tabId === "scope") return "Business Logic";
                    if (tabId === "development") return "Scope & Planning";
                    if (tabId === "gtm") return "Development";
                    return "";
                  };
                  const previousBlockName = getPreviousBlockName(tab.id);
                  
                  return (
                    <React.Fragment key={tab.id}>
                      <TabsTrigger
                        value={tab.id}
                        className={cn(
                          "relative flex-1 flex items-center justify-center gap-3 py-4 px-4 transition-all font-mono text-xs uppercase tracking-wider",
                          "bg-[#0A0E14] border border-[#1E293B] rounded-none shadow-none",
                          "hover:border-[#00f0ff]/30 hover:bg-[#0A0E14]/80",
                          "data-[state=active]:bg-[#0A0E14] data-[state=active]:border-[#00f0ff] data-[state=active]:text-[#00f0ff] data-[state=active]:shadow-[0_0_20px_-5px_rgba(0,240,255,0.3)]",
                          "text-slate-500",
                          isLocked && "opacity-50 cursor-not-allowed",
                          isUnlocking && "animate-[pulse_0.5s_ease-in-out_3] scale-105"
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
                        {/* Corner accents for active tab */}
                        {isActive && (
                          <>
                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00f0ff]" />
                            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#00f0ff]" />
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#00f0ff]" />
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00f0ff]" />
                          </>
                        )}
                        
                        {/* Tab content */}
                        <div className="flex items-center gap-2">
                          <Icon className={cn(
                            "w-4 h-4 transition-colors",
                            isActive && "text-[#00f0ff]",
                            isUnlocking && "animate-scale-in"
                          )} />
                          <span className="hidden sm:inline font-medium">{tab.title}</span>
                        </div>
                        
                        {/* Progress indicator */}
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                isActive ? "bg-[#00f0ff]" : "bg-slate-600"
                              )}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className={cn(
                            "text-[10px] font-mono",
                            isActive ? "text-[#00f0ff]" : "text-slate-600"
                          )}>
                            {Math.round(progress)}%
                          </span>
                        </div>

                        {/* Lock indicator */}
                        {isLocked && !isUnlocking && (
                          <Tooltip delayDuration={100}>
                            <TooltipTrigger asChild>
                              <span 
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1 cursor-help"
                              >
                                <Lock className="w-3 h-3 text-slate-600" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent 
                              side="bottom" 
                              className="max-w-xs bg-[#0A0A0A] text-slate-300 border-white/10 shadow-lg z-50 p-3"
                              sideOffset={5}
                            >
                              <p className="text-sm font-semibold mb-2 flex items-center gap-2 text-white">
                                <Lock className="w-4 h-4" />
                                Block Locked
                              </p>
                              <p className="text-xs leading-relaxed">
                                Complete and validate <strong className="text-[#00f0ff] font-semibold">{previousBlockName}</strong> to unlock.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        
                        {isUnlocking && <span className="text-xs animate-fade-in">🔓</span>}
                      </TabsTrigger>
                      
                      {/* Animated connector line between tabs */}
                      {index < canvasTabs.length - 1 && (
                        <div className="flex items-center px-1">
                          <div className="relative w-8 h-4 flex items-center justify-center">
                            {/* Base line */}
                            <div className="absolute w-full h-0.5 bg-slate-800 rounded-full" />
                            
                            {/* Animated progress line */}
                            <motion.div 
                              className="absolute left-0 h-0.5 bg-[#00f0ff] rounded-full shadow-[0_0_8px_rgba(0,240,255,0.5)]"
                              initial={{ width: 0 }}
                              animate={{ 
                                width: progress >= 100 ? "100%" : "0%",
                                opacity: progress >= 100 ? 1 : 0
                              }}
                              transition={{ 
                                duration: 0.6, 
                                ease: "easeOut",
                                delay: index * 0.1
                              }}
                            />
                            
                            {/* Pulse dot when complete */}
                            {progress >= 100 && (
                              <motion.div 
                                className="absolute right-0 w-1.5 h-1.5 bg-[#00f0ff] rounded-full shadow-[0_0_6px_rgba(0,240,255,0.8)]"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
                              >
                                <motion.div 
                                  className="absolute inset-0 bg-[#00f0ff] rounded-full"
                                  animate={{ 
                                    scale: [1, 1.5, 1],
                                    opacity: [0.8, 0, 0.8]
                                  }}
                                  transition={{ 
                                    duration: 2, 
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                  }}
                                />
                              </motion.div>
                            )}
                            
                            {/* Arrow indicator */}
                            <motion.div
                              className={cn(
                                "absolute -right-0.5 w-0 h-0 border-t-[3px] border-b-[3px] border-l-[4px] border-transparent",
                                progress >= 100 ? "border-l-[#00f0ff]" : "border-l-slate-700"
                              )}
                              animate={{
                                x: progress >= 100 ? [0, 2, 0] : 0
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: progress >= 100 ? Infinity : 0,
                                ease: "easeInOut"
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </TabsList>

              <AnimatePresence mode="wait">
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
                <TabsContent key={tab.id} value={tab.id} className="space-y-8" asChild forceMount>
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ 
                      opacity: activeTab === tab.id ? 1 : 0, 
                      y: activeTab === tab.id ? 0 : 20,
                      scale: activeTab === tab.id ? 1 : 0.98
                    }}
                    exit={{ opacity: 0, y: -20, scale: 0.98 }}
                    transition={{ 
                      duration: 0.4, 
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    style={{ display: activeTab === tab.id ? 'block' : 'none' }}
                  >
                  {/* Tab Header - Blueprint Style */}
                  {tab.id !== "business" && (
                    <div className="relative overflow-hidden bg-[#0A0A0A] border border-white/[0.08] p-6 mb-6">
                      {/* Corner accents */}
                      <div className="absolute -top-px -left-px w-2 h-2 border-t-2 border-l-2 border-[#00f0ff] opacity-70" />
                      <div className="absolute -bottom-px -right-px w-2 h-2 border-b-2 border-r-2 border-[#00f0ff] opacity-70" />
                      
                      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-sm bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center">
                            <tab.icon className="w-6 h-6 text-[#00f0ff]" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white mb-1 tracking-tight">
                              {tab.title}
                            </h3>
                            <p className="text-sm text-slate-500 font-mono uppercase tracking-wider">
                              Complete all {tab.sections.length} sections to proceed
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {/* Progress indicator */}
                          <div className="flex items-center gap-3">
                            <div className="w-32 h-1 bg-slate-900 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.4)] transition-all duration-500"
                                style={{ width: `${calculateCanvasProgress(tab.id)}%` }}
                              />
                            </div>
                            <span className="text-sm font-mono text-[#00f0ff]">
                              {Math.round(calculateCanvasProgress(tab.id))}%
                            </span>
                          </div>
                          
                          {!isLocked && tab.id !== "development" && (
                            <button
                              onClick={() => setValidationBlock({ id: tab.id, title: tab.title })}
                              className="px-4 py-2 bg-[#00f0ff] text-black font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                            >
                              <CheckCircle2 className="w-4 h-4 inline mr-2" />
                              Validate
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

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
                    <>
                      <ScopePlanningSection
                        scopeData={scopeData}
                        loadingSection={loadingSection}
                        onAIGenerate={(section) => generateSuggestions(section)}
                        onOpenDrawer={(section) => setOpenScopeDrawer(section)}
                        projectData={projectData}
                      />

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
                    </>
                  ) : tab.id === "development" ? (
                    <div className="space-y-6">
                      {/* Blueprint-style Development Header */}
                      <div className="bg-[#0A0E14] border border-[#1E293B] p-6 relative overflow-hidden">
                        {/* Corner accents */}
                        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#00f0ff]" />
                        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#00f0ff]" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#00f0ff]" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#00f0ff]" />
                        
                        {/* Background grid effect */}
                        <div className="absolute inset-0 opacity-5" style={{ 
                          backgroundImage: "linear-gradient(to right, #1f2937 1px, transparent 1px), linear-gradient(to bottom, #1f2937 1px, transparent 1px)",
                          backgroundSize: "40px 40px"
                        }} />
                        
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center shadow-[0_0_20px_-5px_rgba(0,240,255,0.3)]">
                              <Rocket className="w-7 h-7 text-[#00f0ff]" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono text-[#00f0ff] uppercase">Module: 04_Development</span>
                              </div>
                              <h3 className="text-xl font-bold text-white uppercase tracking-wide">Development Pipeline</h3>
                              <p className="text-sm text-slate-400 font-mono">
                                Submit projects for development and track progress
                              </p>
                            </div>
                          </div>
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
                  ) : tab.id === "gtm" ? (
                    <div className="space-y-4">
                      {/* Target Audience */}
                      <MarketingBlockCard
                        title="Target Audience"
                        subtitle="Define audience segments & personas"
                        icon={Users}
                        gradient="from-pink-500 to-rose-500"
                        itemCount={gtmData.audienceSegments.length}
                        completedCount={gtmData.audienceSegments.filter(s => s.isPrimary).length}
                        onAIGenerate={() => generateSuggestions("audienceSegments")}
                        isGenerating={loadingSection === "audienceSegments"}
                        onViewAll={() => setOpenGtmDrawer("audienceSegments")}
                      >
                        {gtmData.audienceSegments.slice(0, 3).map((segment, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border/50">
                            <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center">
                              <Users className="w-4 h-4 text-pink-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{segment.name || "Unnamed Segment"}</p>
                              <p className="text-xs text-muted-foreground">{segment.demographics.ageRange} • {segment.demographics.location || "Global"}</p>
                            </div>
                            {segment.isPrimary && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Primary</span>
                            )}
                          </div>
                        ))}
                      </MarketingBlockCard>

                      {/* Marketing Creatives */}
                      <MarketingBlockCard
                        title="Marketing Creatives"
                        subtitle="Design ads, copy, images & videos"
                        icon={Image}
                        gradient="from-violet-500 to-purple-500"
                        itemCount={gtmData.creatives.length}
                        completedCount={gtmData.creatives.filter(c => c.status === "approved").length}
                        onAIGenerate={() => generateSuggestions("creatives")}
                        isGenerating={loadingSection === "creatives"}
                        onViewAll={() => setOpenGtmDrawer("creatives")}
                      >
                        {gtmData.creatives.slice(0, 3).map((creative, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border/50">
                            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                              <Image className="w-4 h-4 text-violet-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{creative.title || "Untitled"}</p>
                              <p className="text-xs text-muted-foreground capitalize">{creative.type} • {creative.platform}</p>
                            </div>
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded",
                              creative.status === "approved" ? "bg-success/10 text-success" : 
                              creative.status === "review" ? "bg-amber-500/10 text-amber-500" : "bg-muted text-muted-foreground"
                            )}>{creative.status}</span>
                          </div>
                        ))}
                      </MarketingBlockCard>

                      {/* Campaign Planner */}
                      <MarketingBlockCard
                        title="Campaign Planner"
                        subtitle="Plan campaigns with KPIs & budgets"
                        icon={Target}
                        gradient="from-blue-500 to-cyan-500"
                        itemCount={gtmData.campaigns.length}
                        completedCount={gtmData.campaigns.filter(c => c.status === "active" || c.status === "completed").length}
                        onAIGenerate={() => generateSuggestions("campaigns")}
                        isGenerating={loadingSection === "campaigns"}
                        onViewAll={() => setOpenGtmDrawer("campaigns")}
                      >
                        {gtmData.campaigns.slice(0, 3).map((campaign, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border/50">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                              <Target className="w-4 h-4 text-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{campaign.name || "Unnamed Campaign"}</p>
                              <p className="text-xs text-muted-foreground">{campaign.channel} • ${campaign.budget || 0}</p>
                            </div>
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded capitalize",
                              campaign.status === "active" ? "bg-success/10 text-success" : 
                              campaign.status === "completed" ? "bg-blue-500/10 text-blue-500" : "bg-muted text-muted-foreground"
                            )}>{campaign.status}</span>
                          </div>
                        ))}
                      </MarketingBlockCard>

                      {/* Content Calendar */}
                      <MarketingBlockCard
                        title="Content Calendar"
                        subtitle="Schedule posts across platforms"
                        icon={Calendar}
                        gradient="from-emerald-500 to-teal-500"
                        itemCount={gtmData.contentPosts.length}
                        completedCount={gtmData.contentPosts.filter(p => p.status === "published").length}
                        onAIGenerate={() => generateSuggestions("contentPosts")}
                        isGenerating={loadingSection === "contentPosts"}
                        onViewAll={() => setOpenGtmDrawer("contentPosts")}
                      >
                        {gtmData.contentPosts.slice(0, 3).map((post, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border/50">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                              <Calendar className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{post.title || "Untitled Post"}</p>
                              <p className="text-xs text-muted-foreground capitalize">{post.platform} • {post.postType}</p>
                            </div>
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded capitalize",
                              post.status === "published" ? "bg-success/10 text-success" : 
                              post.status === "scheduled" ? "bg-blue-500/10 text-blue-500" : "bg-muted text-muted-foreground"
                            )}>{post.status}</span>
                          </div>
                        ))}
                      </MarketingBlockCard>

                      {/* Ads Manager */}
                      <MarketingBlockCard
                        title="Ads Manager"
                        subtitle="Configure ad targeting & budgets"
                        icon={DollarSign}
                        gradient="from-amber-500 to-orange-500"
                        itemCount={gtmData.adSets.length}
                        completedCount={gtmData.adSets.filter(a => a.status === "active").length}
                        onAIGenerate={() => generateSuggestions("adSets")}
                        isGenerating={loadingSection === "adSets"}
                        onViewAll={() => setOpenGtmDrawer("adSets")}
                      >
                        {gtmData.adSets.slice(0, 3).map((adSet, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border/50">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                              <DollarSign className="w-4 h-4 text-amber-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{adSet.name || "Unnamed Ad Set"}</p>
                              <p className="text-xs text-muted-foreground">{adSet.platform} • ${adSet.budget?.amount || 0}/{adSet.budget?.type || 'daily'}</p>
                            </div>
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded capitalize",
                              adSet.status === "active" ? "bg-success/10 text-success" : 
                              adSet.status === "paused" ? "bg-amber-500/10 text-amber-500" : "bg-muted text-muted-foreground"
                            )}>{adSet.status}</span>
                          </div>
                        ))}
                      </MarketingBlockCard>

                      {/* Launch Strategy */}
                      <MarketingBlockCard
                        title="Launch Strategy"
                        subtitle="Plan launch phases & milestones"
                        icon={Rocket}
                        gradient="from-red-500 to-rose-600"
                        itemCount={gtmData.launchPhases.length}
                        completedCount={gtmData.launchPhases.filter(p => p.status === "completed").length}
                        onAIGenerate={() => generateSuggestions("launchPhases")}
                        isGenerating={loadingSection === "launchPhases"}
                        onViewAll={() => setOpenGtmDrawer("launchPhases")}
                      >
                        {gtmData.launchPhases.slice(0, 3).map((phase, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border/50">
                            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-sm font-bold text-red-500">
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{phase.name || "Unnamed Phase"}</p>
                              <p className="text-xs text-muted-foreground">{phase.tasks.length} tasks • {phase.goals.length} goals</p>
                            </div>
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded capitalize",
                              phase.status === "completed" ? "bg-success/10 text-success" : 
                              phase.status === "in_progress" ? "bg-blue-500/10 text-blue-500" : "bg-muted text-muted-foreground"
                            )}>{phase.status.replace("_", " ")}</span>
                          </div>
                        ))}
                      </MarketingBlockCard>

                      {/* GTM Editor Drawers */}
                      <MarketingEditorDrawer
                        isOpen={openGtmDrawer === "audienceSegments"}
                        onClose={() => setOpenGtmDrawer(null)}
                        title="Target Audience"
                        subtitle="Define audience segments & personas"
                        icon={Users}
                        gradient="from-pink-500 to-rose-500"
                        onAIGenerate={() => generateSuggestions("audienceSegments")}
                        isGenerating={loadingSection === "audienceSegments"}
                      >
                        <TargetAudienceBuilder
                          segments={gtmData.audienceSegments}
                          onChange={(segments) => setGtmData({ ...gtmData, audienceSegments: segments })}
                          onAIGenerate={() => generateSuggestions("audienceSegments")}
                          isGenerating={loadingSection === "audienceSegments"}
                        />
                      </MarketingEditorDrawer>

                      <MarketingEditorDrawer
                        isOpen={openGtmDrawer === "creatives"}
                        onClose={() => setOpenGtmDrawer(null)}
                        title="Marketing Creatives"
                        subtitle="Design ads, copy, images & videos"
                        icon={Image}
                        gradient="from-violet-500 to-purple-500"
                        onAIGenerate={() => generateSuggestions("creatives")}
                        isGenerating={loadingSection === "creatives"}
                      >
                        <MarketingCreatives
                          creatives={gtmData.creatives}
                          onChange={(creatives) => setGtmData({ ...gtmData, creatives })}
                          onAIGenerate={() => generateSuggestions("creatives")}
                          isGenerating={loadingSection === "creatives"}
                        />
                      </MarketingEditorDrawer>

                      <MarketingEditorDrawer
                        isOpen={openGtmDrawer === "campaigns"}
                        onClose={() => setOpenGtmDrawer(null)}
                        title="Campaign Planner"
                        subtitle="Plan campaigns with KPIs & budgets"
                        icon={Target}
                        gradient="from-blue-500 to-cyan-500"
                        onAIGenerate={() => generateSuggestions("campaigns")}
                        isGenerating={loadingSection === "campaigns"}
                      >
                        <CampaignPlanner
                          campaigns={gtmData.campaigns}
                          onChange={(campaigns) => setGtmData({ ...gtmData, campaigns })}
                          onAIGenerate={() => generateSuggestions("campaigns")}
                          isGenerating={loadingSection === "campaigns"}
                        />
                      </MarketingEditorDrawer>

                      <MarketingEditorDrawer
                        isOpen={openGtmDrawer === "contentPosts"}
                        onClose={() => setOpenGtmDrawer(null)}
                        title="Content Calendar"
                        subtitle="Schedule posts across platforms"
                        icon={Calendar}
                        gradient="from-emerald-500 to-teal-500"
                        onAIGenerate={() => generateSuggestions("contentPosts")}
                        isGenerating={loadingSection === "contentPosts"}
                      >
                        <ContentCalendar
                          posts={gtmData.contentPosts}
                          onChange={(posts) => setGtmData({ ...gtmData, contentPosts: posts })}
                          onAIGenerate={() => generateSuggestions("contentPosts")}
                          isGenerating={loadingSection === "contentPosts"}
                        />
                      </MarketingEditorDrawer>

                      <MarketingEditorDrawer
                        isOpen={openGtmDrawer === "adSets"}
                        onClose={() => setOpenGtmDrawer(null)}
                        title="Ads Manager"
                        subtitle="Configure ad targeting & budgets"
                        icon={DollarSign}
                        gradient="from-amber-500 to-orange-500"
                        onAIGenerate={() => generateSuggestions("adSets")}
                        isGenerating={loadingSection === "adSets"}
                      >
                        <AdsManager
                          adSets={gtmData.adSets}
                          onChange={(adSets) => setGtmData({ ...gtmData, adSets })}
                          onAIGenerate={() => generateSuggestions("adSets")}
                          isGenerating={loadingSection === "adSets"}
                        />
                      </MarketingEditorDrawer>

                      <MarketingEditorDrawer
                        isOpen={openGtmDrawer === "launchPhases"}
                        onClose={() => setOpenGtmDrawer(null)}
                        title="Launch Strategy"
                        subtitle="Plan launch phases & milestones"
                        icon={Rocket}
                        gradient="from-red-500 to-rose-600"
                        onAIGenerate={() => generateSuggestions("launchPhases")}
                        isGenerating={loadingSection === "launchPhases"}
                      >
                        <LaunchStrategy
                          phases={gtmData.launchPhases}
                          onChange={(phases) => setGtmData({ ...gtmData, launchPhases: phases })}
                          onAIGenerate={() => generateSuggestions("launchPhases")}
                          isGenerating={loadingSection === "launchPhases"}
                        />
                      </MarketingEditorDrawer>
                    </div>
                  ) : tab.id === "business" ? (
                    <BusinessLogicSection
                      sections={tab.sections}
                      canvasData={canvasData}
                      onCanvasChange={handleCanvasChange}
                      onAIGenerate={(key) => generateSuggestions(key)}
                      onExpand={(key) => handleExpandSection(key)}
                      loadingSection={loadingSection}
                      projectData={projectData}
                      onValidate={() => setValidationBlock({ id: "business", title: "Business Logic" })}
                    />
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
                  </motion.div>
                </TabsContent>
                );
              })}
              </AnimatePresence>
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
        scopeData={{
          timeline: scopeData.timeline,
          milestones: scopeData.milestones
        }}
      />
    </div>
  );
};

export default Canvas;
