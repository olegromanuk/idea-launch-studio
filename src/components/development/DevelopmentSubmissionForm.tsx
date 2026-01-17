import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Code, 
  Github,
  Cloud,
  Server,
  Settings,
  Rocket,
  CheckCircle2,
  Shield,
  Activity,
  Globe,
  Layers,
  ChevronRight,
  AlertCircle,
  User,
  ExternalLink,
  Clock,
  Loader2,
  Users,
  Cpu,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface ScopeData {
  userStories: any[];
  features: any[];
  milestones: any[];
  timeline: any[];
  risks: any[];
  technicalSolution: string;
}

interface DevelopmentSubmissionFormProps {
  projectId: string | null;
  projectData: {
    idea?: string;
    persona?: string;
  };
  scopeData: ScopeData;
  canvasData: Record<string, string>;
  onSubmitSuccess: () => void;
}

interface ExistingSubmission {
  id: string;
  project_name: string;
  status: string;
  created_at: string;
  submitted_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  submitted: { label: "Submitted", color: "bg-blue-500", icon: Clock },
  review: { label: "In Review", color: "bg-yellow-500", icon: Clock },
  development: { label: "In Development", color: "bg-purple-500", icon: Code },
  testing: { label: "Testing", color: "bg-orange-500", icon: Shield },
  deployment: { label: "Deploying", color: "bg-cyan-500", icon: Rocket },
  completed: { label: "Completed", color: "bg-green-500", icon: CheckCircle2 },
  on_hold: { label: "On Hold", color: "bg-gray-500", icon: AlertCircle },
  cancelled: { label: "Cancelled", color: "bg-red-500", icon: AlertCircle },
};

const HOSTING_PLATFORMS = [
  { id: "vercel", name: "Vercel", icon: "▲", description: "Fast edge deployment" },
  { id: "netlify", name: "Netlify", icon: "◆", description: "JAMstack focused" },
  { id: "aws", name: "AWS", icon: "☁", description: "Amazon Web Services" },
  { id: "azure", name: "Azure", icon: "◇", description: "Microsoft Cloud" },
  { id: "gcp", name: "GCP", icon: "◈", description: "Google Cloud Platform" },
  { id: "digitalocean", name: "DigitalOcean", icon: "●", description: "Simple cloud" },
  { id: "docker", name: "Docker", icon: "🐳", description: "Containerized" },
  { id: "kubernetes", name: "Kubernetes", icon: "⎈", description: "Container orchestration" },
  { id: "custom_server", name: "Custom Server", icon: "🖥", description: "Self-managed" },
  { id: "other", name: "Other", icon: "…", description: "Custom solution" },
];

const CICD_PLATFORMS = [
  "GitHub Actions",
  "GitLab CI",
  "Jenkins",
  "CircleCI",
  "TravisCI",
  "Azure DevOps",
  "Other",
];

export const DevelopmentSubmissionForm = ({
  projectId,
  projectData,
  scopeData,
  canvasData,
  onSubmitSuccess,
}: DevelopmentSubmissionFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingSubmission, setExistingSubmission] = useState<ExistingSubmission | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form state
  const [formData, setFormData] = useState({
    projectName: projectData?.idea || "",
    projectDescription: "",
    hostingPlatform: "" as string,
    hostingNotes: "",
    githubOption: "new_repo" as "existing" | "new_repo",
    githubRepoUrl: "",
    githubUsername: "",
    enableCicd: false,
    cicdPlatform: "",
    enableTesting: false,
    enableMonitoring: false,
    enableSsl: true,
    customDomain: "",
    environmentType: "production" as "development" | "staging" | "production",
    priority: "normal" as "low" | "normal" | "high" | "urgent",
    additionalRequirements: "",
  });

  // Check for existing submission on mount
  useEffect(() => {
    const checkExistingSubmission = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const query = supabase
          .from("dev_submissions")
          .select("id, project_name, status, created_at, submitted_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        
        if (projectId) {
          query.eq("project_id", projectId);
        }

        const { data, error } = await query.limit(1).maybeSingle();

        if (error) {
          console.error("Error checking existing submission:", error);
        } else if (data) {
          setExistingSubmission(data);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingSubmission();
  }, [user, projectId]);

  // Selected scope items
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
    scopeData.features.filter(f => f.category === "mvp").map(f => f.id)
  );
  const [selectedStories, setSelectedStories] = useState<string[]>(
    scopeData.userStories.map(s => s.id)
  );

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit a development request.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.hostingPlatform) {
      toast({
        title: "Missing information",
        description: "Please select a hosting platform.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.githubUsername) {
      toast({
        title: "Missing information",
        description: "Please provide your GitHub username.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedScope = {
        features: scopeData.features.filter(f => selectedFeatures.includes(f.id)),
        userStories: scopeData.userStories.filter(s => selectedStories.includes(s.id)),
        milestones: scopeData.milestones,
        timeline: scopeData.timeline,
        risks: scopeData.risks,
        technicalSolution: scopeData.technicalSolution,
        businessLogic: canvasData,
      };

      const { error } = await supabase.from("dev_submissions").insert({
        user_id: user.id,
        project_id: projectId,
        project_name: formData.projectName,
        project_description: formData.projectDescription,
        selected_scope: selectedScope as any,
        hosting_platform: formData.hostingPlatform as any,
        hosting_notes: formData.hostingNotes,
        github_option: formData.githubOption,
        github_repo_url: formData.githubRepoUrl || null,
        github_username: formData.githubUsername,
        enable_cicd: formData.enableCicd,
        cicd_platform: formData.cicdPlatform || null,
        enable_testing: formData.enableTesting,
        enable_monitoring: formData.enableMonitoring,
        enable_ssl: formData.enableSsl,
        custom_domain: formData.customDomain || null,
        environment_type: formData.environmentType,
        priority: formData.priority,
        additional_requirements: formData.additionalRequirements || null,
      });

      if (error) throw error;

      toast({
        title: "Development request submitted!",
        description: "Our team will review your submission and begin work soon.",
      });
      
      onSubmitSuccess();
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        title: "Submission failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFeature = (id: string) => {
    setSelectedFeatures(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const toggleStory = (id: string) => {
    setSelectedStories(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const steps = [
    { id: 1, title: "Scope Selection", icon: Layers },
    { id: 2, title: "Hosting & GitHub", icon: Cloud },
    { id: 3, title: "Development Options", icon: Settings },
    { id: 4, title: "Review & Submit", icon: Rocket },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#0EA5E9]" />
        <p className="text-[#94A3B8] font-mono text-sm uppercase">Checking submission status...</p>
      </div>
    );
  }

  // Show existing submission status
  if (existingSubmission) {
    const statusInfo = STATUS_CONFIG[existingSubmission.status] || STATUS_CONFIG.submitted;
    const StatusIcon = statusInfo.icon;

    return (
      <div className="space-y-6">
        {/* Existing Submission Card */}
        <div className="bg-[#121821] border border-[#1E293B] p-6 relative">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#0EA5E9]" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#0EA5E9]" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#0EA5E9]" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#0EA5E9]" />
          
          <div className="flex items-start gap-4">
            <div className={cn("w-12 h-12 rounded flex items-center justify-center", statusInfo.color)}>
              <StatusIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1 uppercase tracking-wide">
                Development Request {statusInfo.label}
              </h3>
              <p className="text-sm text-[#94A3B8] mb-4 font-mono">
                Project "<span className="text-[#0EA5E9]">{existingSubmission.project_name}</span>" 
                was submitted on {formatDate(existingSubmission.submitted_at)}
              </p>
              
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => navigate("/my-submissions")}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0EA5E9] text-white hover:bg-[#0EA5E9]/90 transition-colors text-xs font-bold uppercase shadow-[0_0_15px_-3px_rgba(14,165,233,0.3)]"
                >
                  <ExternalLink className="w-4 h-4" />
                  View My Submissions
                </button>
                <button 
                  onClick={() => setExistingSubmission(null)}
                  className="flex items-center gap-2 px-4 py-2 border border-[#1E293B] bg-[#121821] hover:border-[#0EA5E9]/50 transition-colors text-xs font-medium uppercase text-[#94A3B8]"
                >
                  <Rocket className="w-4 h-4" />
                  Submit New Request
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Timeline */}
        <div className="bg-[#121821] border border-[#1E293B] p-5">
          <h4 className="text-xs font-mono uppercase text-[#94A3B8] mb-4 flex items-center gap-2 border-b border-[#1E293B] pb-3">
            <Clock className="w-4 h-4" />
            Submission Timeline
          </h4>
          <div className="flex items-center justify-between w-full">
            {Object.entries(STATUS_CONFIG).slice(0, 6).map(([key, config], index) => {
              const isActive = key === existingSubmission.status;
              const isPast = Object.keys(STATUS_CONFIG).indexOf(existingSubmission.status) > index;
              
              return (
                <div key={key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-8 h-8 rounded flex items-center justify-center text-xs font-mono transition-all",
                      isActive && `${config.color} text-white ring-2 ring-offset-2 ring-offset-[#121821]`,
                      isPast && "bg-green-500 text-white",
                      !isActive && !isPast && "bg-[#1E293B] text-[#94A3B8]"
                    )}>
                      {isPast ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                    </div>
                    <span className="text-[10px] text-[#94A3B8] mt-2 text-center font-mono uppercase">
                      {["Submitted", "Review", "Dev", "Test", "Deploy", "Done"][index]}
                    </span>
                  </div>
                  {index < 5 && (
                    <div className={cn(
                      "flex-1 h-0.5 mx-1",
                      isPast ? "bg-green-500" : "bg-[#1E293B]"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xs font-mono text-[#0EA5E9] uppercase">Module: 03_Development</span>
            <span className="bg-[#0EA5E9]/10 text-[#0EA5E9] text-[10px] px-2 py-0.5 border border-[#0EA5E9]/30 rounded font-bold">
              STEP {currentStep}/4
            </span>
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-tight mb-1 text-white">Development Submission</h1>
          <p className="text-[#94A3B8] text-sm max-w-xl">
            Configure and submit your project for development. Our team will review and build your {projectData?.idea || "project"}.
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-[#121821] border border-[#1E293B] p-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 transition-all text-xs font-mono uppercase",
                    isActive && "bg-[#0EA5E9] text-white shadow-[0_0_15px_-3px_rgba(14,165,233,0.4)]",
                    isCompleted && "bg-green-500/20 text-green-400 border border-green-500/30",
                    !isActive && !isCompleted && "bg-[#1E293B]/50 text-[#94A3B8] hover:bg-[#1E293B] hover:text-white"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">{step.title}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "flex-1 h-0.5 mx-2",
                    isCompleted ? "bg-green-500/50" : "bg-[#1E293B]"
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1: Scope Selection */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-fade-in">
          {/* Project Information */}
          <div className="bg-[#121821] border border-[#1E293B] p-5 relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#0EA5E9]" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#0EA5E9]" />
            
            <h3 className="text-xs font-mono uppercase text-[#94A3B8] mb-4 border-b border-[#1E293B] pb-2 flex items-center gap-2">
              <Code className="w-4 h-4" /> Project Information
            </h3>
            <div className="grid gap-4">
              <div>
                <Label className="text-[#94A3B8] text-xs font-mono uppercase">Project Name</Label>
                <Input
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  placeholder="Your project name"
                  className="bg-black/30 border-[#1E293B] focus:border-[#0EA5E9] text-white placeholder:text-[#94A3B8]/50"
                />
              </div>
              <div>
                <Label className="text-[#94A3B8] text-xs font-mono uppercase">Project Description</Label>
                <Textarea
                  value={formData.projectDescription}
                  onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                  placeholder="Brief description of what you want to build..."
                  rows={3}
                  className="bg-black/30 border-[#1E293B] focus:border-[#0EA5E9] text-white placeholder:text-[#94A3B8]/50"
                />
              </div>
            </div>
          </div>

          {/* Features Selection */}
          <div className="bg-[#121821] border border-[#1E293B] p-5">
            <h3 className="text-xs font-mono uppercase text-[#94A3B8] mb-4 border-b border-[#1E293B] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4" /> Features to Develop
              </span>
              <span className="text-[10px] text-[#0EA5E9]">{selectedFeatures.length} selected</span>
            </h3>
            
            {scopeData.features.length === 0 ? (
              <div className="p-8 text-center">
                <Layers className="w-10 h-10 mx-auto mb-3 text-gray-600" />
                <p className="text-[#94A3B8] text-sm">No features defined yet. Add features in Scope & Planning first.</p>
              </div>
            ) : (
              <div className="grid gap-2 max-h-[300px] overflow-y-auto">
                {scopeData.features.map((feature) => (
                  <div
                    key={feature.id}
                    onClick={() => toggleFeature(feature.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 border cursor-pointer transition-all rounded",
                      selectedFeatures.includes(feature.id)
                        ? "bg-[#0EA5E9]/10 border-[#0EA5E9]/50"
                        : "bg-black/20 border-[#1E293B] hover:border-[#0EA5E9]/30"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded border flex items-center justify-center flex-shrink-0",
                      selectedFeatures.includes(feature.id) 
                        ? "bg-[#0EA5E9] border-[#0EA5E9]" 
                        : "border-[#1E293B]"
                    )}>
                      {selectedFeatures.includes(feature.id) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm truncate">{feature.name}</p>
                      {feature.description && (
                        <p className="text-[10px] text-[#94A3B8] truncate">{feature.description}</p>
                      )}
                    </div>
                    <span className={cn(
                      "text-[10px] font-mono uppercase px-2 py-0.5 rounded flex-shrink-0",
                      feature.category === "mvp" 
                        ? "bg-[#0EA5E9]/10 text-[#0EA5E9]" 
                        : "bg-gray-800 text-gray-500"
                    )}>
                      {feature.category?.toUpperCase() || "MVP"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Stories Selection */}
          <div className="bg-[#121821] border border-[#1E293B] p-5">
            <h3 className="text-xs font-mono uppercase text-[#94A3B8] mb-4 border-b border-[#1E293B] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" /> User Stories
              </span>
              <span className="text-[10px] text-[#0EA5E9]">{selectedStories.length} selected</span>
            </h3>
            
            {scopeData.userStories.length === 0 ? (
              <div className="p-8 text-center">
                <User className="w-10 h-10 mx-auto mb-3 text-gray-600" />
                <p className="text-[#94A3B8] text-sm">No user stories defined yet. Add stories in Scope & Planning first.</p>
              </div>
            ) : (
              <div className="grid gap-2 max-h-[250px] overflow-y-auto">
                {scopeData.userStories.map((story) => (
                  <div
                    key={story.id}
                    onClick={() => toggleStory(story.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 border cursor-pointer transition-all rounded",
                      selectedStories.includes(story.id)
                        ? "bg-[#0EA5E9]/10 border-[#0EA5E9]/50"
                        : "bg-black/20 border-[#1E293B] hover:border-[#0EA5E9]/30"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded border flex items-center justify-center flex-shrink-0",
                      selectedStories.includes(story.id) 
                        ? "bg-[#0EA5E9] border-[#0EA5E9]" 
                        : "border-[#1E293B]"
                    )}>
                      {selectedStories.includes(story.id) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <p className="text-sm flex-1 text-white">
                      As a <span className="text-[#0EA5E9]">{story.persona}</span>, 
                      I want to <span className="font-medium">{story.action}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button 
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#0EA5E9] text-white hover:bg-[#0EA5E9]/90 transition-colors text-xs font-bold uppercase shadow-[0_0_15px_-3px_rgba(14,165,233,0.3)]"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Hosting & GitHub */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-fade-in">
          {/* Hosting Platform */}
          <div className="bg-[#121821] border border-[#1E293B] p-5 relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#0EA5E9]" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#0EA5E9]" />
            
            <h3 className="text-xs font-mono uppercase text-[#94A3B8] mb-4 border-b border-[#1E293B] pb-2 flex items-center gap-2">
              <Cloud className="w-4 h-4" /> Hosting Platform
            </h3>
            <p className="text-sm text-[#94A3B8] mb-4">Where should we deploy your application?</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {HOSTING_PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => setFormData({ ...formData, hostingPlatform: platform.id })}
                  className={cn(
                    "p-4 border text-center transition-all",
                    formData.hostingPlatform === platform.id
                      ? "bg-[#0EA5E9]/10 border-[#0EA5E9] ring-1 ring-[#0EA5E9]"
                      : "bg-black/20 border-[#1E293B] hover:border-[#0EA5E9]/50"
                  )}
                >
                  <span className="text-2xl block mb-2">{platform.icon}</span>
                  <p className="font-medium text-sm text-white">{platform.name}</p>
                  <p className="text-[10px] text-[#94A3B8] mt-1">{platform.description}</p>
                </button>
              ))}
            </div>

            <div className="mt-4">
              <Label className="text-[#94A3B8] text-xs font-mono uppercase">Additional hosting notes (optional)</Label>
              <Textarea
                value={formData.hostingNotes}
                onChange={(e) => setFormData({ ...formData, hostingNotes: e.target.value })}
                placeholder="Any specific hosting requirements or preferences..."
                rows={2}
                className="bg-black/30 border-[#1E293B] focus:border-[#0EA5E9] text-white placeholder:text-[#94A3B8]/50"
              />
            </div>
          </div>

          {/* GitHub Repository */}
          <div className="bg-[#121821] border border-[#1E293B] p-5">
            <h3 className="text-xs font-mono uppercase text-[#94A3B8] mb-4 border-b border-[#1E293B] pb-2 flex items-center gap-2">
              <Github className="w-4 h-4" /> GitHub Repository
            </h3>
            
            <RadioGroup
              value={formData.githubOption}
              onValueChange={(value) => setFormData({ ...formData, githubOption: value as "existing" | "new_repo" })}
              className="mb-4 space-y-2"
            >
              <div className={cn(
                "flex items-center space-x-3 p-3 border rounded cursor-pointer transition-all",
                formData.githubOption === "new_repo" 
                  ? "bg-[#0EA5E9]/10 border-[#0EA5E9]/50" 
                  : "bg-black/20 border-[#1E293B] hover:border-[#0EA5E9]/30"
              )}>
                <RadioGroupItem value="new_repo" id="new_repo" className="border-[#0EA5E9]" />
                <Label htmlFor="new_repo" className="text-white cursor-pointer">Create a new repository for me</Label>
              </div>
              <div className={cn(
                "flex items-center space-x-3 p-3 border rounded cursor-pointer transition-all",
                formData.githubOption === "existing" 
                  ? "bg-[#0EA5E9]/10 border-[#0EA5E9]/50" 
                  : "bg-black/20 border-[#1E293B] hover:border-[#0EA5E9]/30"
              )}>
                <RadioGroupItem value="existing" id="existing" className="border-[#0EA5E9]" />
                <Label htmlFor="existing" className="text-white cursor-pointer">I have an existing repository</Label>
              </div>
            </RadioGroup>

            {formData.githubOption === "existing" && (
              <div className="mb-4">
                <Label className="text-[#94A3B8] text-xs font-mono uppercase">Repository URL</Label>
                <Input
                  value={formData.githubRepoUrl}
                  onChange={(e) => setFormData({ ...formData, githubRepoUrl: e.target.value })}
                  placeholder="https://github.com/username/repo"
                  className="bg-black/30 border-[#1E293B] focus:border-[#0EA5E9] text-white placeholder:text-[#94A3B8]/50"
                />
              </div>
            )}

            <div>
              <Label className="text-[#94A3B8] text-xs font-mono uppercase">GitHub Username *</Label>
              <Input
                value={formData.githubUsername}
                onChange={(e) => setFormData({ ...formData, githubUsername: e.target.value })}
                placeholder="Your GitHub username to share the repo with"
                className="bg-black/30 border-[#1E293B] focus:border-[#0EA5E9] text-white placeholder:text-[#94A3B8]/50"
              />
              <p className="text-[10px] text-[#94A3B8] mt-1 font-mono">
                We'll add you as a collaborator to the repository
              </p>
            </div>
          </div>

          <div className="flex justify-between">
            <button 
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-2 px-4 py-2 border border-[#1E293B] bg-[#121821] hover:border-[#0EA5E9]/50 transition-colors text-xs font-medium uppercase text-[#94A3B8]"
            >
              Back
            </button>
            <button 
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#0EA5E9] text-white hover:bg-[#0EA5E9]/90 transition-colors text-xs font-bold uppercase shadow-[0_0_15px_-3px_rgba(14,165,233,0.3)]"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Development Options */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-[#121821] border border-[#1E293B] p-5 relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#0EA5E9]" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#0EA5E9]" />
            
            <h3 className="text-xs font-mono uppercase text-[#94A3B8] mb-4 border-b border-[#1E293B] pb-2 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Development Configuration
            </h3>
            
            <div className="grid gap-3">
              {/* CI/CD */}
              <div className={cn(
                "p-4 border rounded transition-all",
                formData.enableCicd ? "bg-blue-500/10 border-blue-500/30" : "bg-black/20 border-[#1E293B]"
              )}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded bg-blue-500/20 flex items-center justify-center">
                      <Settings className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">CI/CD Pipeline</p>
                      <p className="text-xs text-[#94A3B8]">Automated build, test, and deployment</p>
                    </div>
                  </div>
                  <Checkbox
                    checked={formData.enableCicd}
                    onCheckedChange={(checked) => setFormData({ ...formData, enableCicd: !!checked })}
                    className="border-[#0EA5E9] data-[state=checked]:bg-[#0EA5E9]"
                  />
                </div>
                {formData.enableCicd && (
                  <div className="mt-4 ml-13">
                    <Select
                      value={formData.cicdPlatform}
                      onValueChange={(value) => setFormData({ ...formData, cicdPlatform: value })}
                    >
                      <SelectTrigger className="bg-black/30 border-[#1E293B] text-white">
                        <SelectValue placeholder="Select CI/CD platform" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#121821] border-[#1E293B]">
                        {CICD_PLATFORMS.map((platform) => (
                          <SelectItem key={platform} value={platform} className="text-white">{platform}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Testing */}
              <div className={cn(
                "p-4 border rounded transition-all",
                formData.enableTesting ? "bg-green-500/10 border-green-500/30" : "bg-black/20 border-[#1E293B]"
              )}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded bg-green-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Automated Testing</p>
                      <p className="text-xs text-[#94A3B8]">Unit tests, integration tests, E2E tests</p>
                    </div>
                  </div>
                  <Checkbox
                    checked={formData.enableTesting}
                    onCheckedChange={(checked) => setFormData({ ...formData, enableTesting: !!checked })}
                    className="border-[#0EA5E9] data-[state=checked]:bg-[#0EA5E9]"
                  />
                </div>
              </div>

              {/* Monitoring */}
              <div className={cn(
                "p-4 border rounded transition-all",
                formData.enableMonitoring ? "bg-purple-500/10 border-purple-500/30" : "bg-black/20 border-[#1E293B]"
              )}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded bg-purple-500/20 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Monitoring & Analytics</p>
                      <p className="text-xs text-[#94A3B8]">Error tracking, performance monitoring</p>
                    </div>
                  </div>
                  <Checkbox
                    checked={formData.enableMonitoring}
                    onCheckedChange={(checked) => setFormData({ ...formData, enableMonitoring: !!checked })}
                    className="border-[#0EA5E9] data-[state=checked]:bg-[#0EA5E9]"
                  />
                </div>
              </div>

              {/* SSL */}
              <div className={cn(
                "p-4 border rounded transition-all",
                formData.enableSsl ? "bg-amber-500/10 border-amber-500/30" : "bg-black/20 border-[#1E293B]"
              )}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded bg-amber-500/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">SSL/TLS Certificate</p>
                      <p className="text-xs text-[#94A3B8]">Secure HTTPS connection</p>
                    </div>
                  </div>
                  <Checkbox
                    checked={formData.enableSsl}
                    onCheckedChange={(checked) => setFormData({ ...formData, enableSsl: !!checked })}
                    className="border-[#0EA5E9] data-[state=checked]:bg-[#0EA5E9]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="bg-[#121821] border border-[#1E293B] p-5">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-[#94A3B8] text-xs font-mono uppercase">Custom Domain (optional)</Label>
                <Input
                  value={formData.customDomain}
                  onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                  placeholder="example.com"
                  className="bg-black/30 border-[#1E293B] focus:border-[#0EA5E9] text-white placeholder:text-[#94A3B8]/50"
                />
              </div>
              <div>
                <Label className="text-[#94A3B8] text-xs font-mono uppercase">Environment Type</Label>
                <Select
                  value={formData.environmentType}
                  onValueChange={(value) => setFormData({ ...formData, environmentType: value as any })}
                >
                  <SelectTrigger className="bg-black/30 border-[#1E293B] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121821] border-[#1E293B]">
                    <SelectItem value="development" className="text-white">Development</SelectItem>
                    <SelectItem value="staging" className="text-white">Staging</SelectItem>
                    <SelectItem value="production" className="text-white">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mb-4">
              <Label className="text-[#94A3B8] text-xs font-mono uppercase">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
              >
                <SelectTrigger className="bg-black/30 border-[#1E293B] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#121821] border-[#1E293B]">
                  <SelectItem value="low" className="text-white">Low - No rush</SelectItem>
                  <SelectItem value="normal" className="text-white">Normal - Standard timeline</SelectItem>
                  <SelectItem value="high" className="text-white">High - Prioritize this</SelectItem>
                  <SelectItem value="urgent" className="text-white">Urgent - ASAP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[#94A3B8] text-xs font-mono uppercase">Additional Requirements (optional)</Label>
              <Textarea
                value={formData.additionalRequirements}
                onChange={(e) => setFormData({ ...formData, additionalRequirements: e.target.value })}
                placeholder="Any other requirements, preferences, or notes for the development team..."
                rows={3}
                className="bg-black/30 border-[#1E293B] focus:border-[#0EA5E9] text-white placeholder:text-[#94A3B8]/50"
              />
            </div>
          </div>

          <div className="flex justify-between">
            <button 
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 px-4 py-2 border border-[#1E293B] bg-[#121821] hover:border-[#0EA5E9]/50 transition-colors text-xs font-medium uppercase text-[#94A3B8]"
            >
              Back
            </button>
            <button 
              onClick={() => setCurrentStep(4)}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#0EA5E9] text-white hover:bg-[#0EA5E9]/90 transition-colors text-xs font-bold uppercase shadow-[0_0_15px_-3px_rgba(14,165,233,0.3)]"
            >
              Review Submission <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review & Submit */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="bg-[#121821] border border-[#1E293B] p-8 text-center relative">
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#0EA5E9]" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#0EA5E9]" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#0EA5E9]" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#0EA5E9]" />
            
            <div className="w-16 h-16 mx-auto rounded bg-gradient-to-br from-[#0EA5E9] to-[#0EA5E9]/50 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(14,165,233,0.3)]">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white uppercase tracking-wide">Review Your Submission</h3>
            <p className="text-[#94A3B8] text-sm font-mono">Please review your development request before submitting</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Project Summary */}
            <div className="bg-[#121821] border border-[#1E293B] p-5">
              <h4 className="text-xs font-mono uppercase text-[#94A3B8] mb-4 border-b border-[#1E293B] pb-2 flex items-center gap-2">
                <Code className="w-4 h-4" /> Project
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Name:</span>
                  <span className="text-white font-medium">{formData.projectName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Features:</span>
                  <span className="text-[#0EA5E9] font-medium">{selectedFeatures.length} selected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">User Stories:</span>
                  <span className="text-[#0EA5E9] font-medium">{selectedStories.length} selected</span>
                </div>
              </div>
            </div>

            {/* Hosting Summary */}
            <div className="bg-[#121821] border border-[#1E293B] p-5">
              <h4 className="text-xs font-mono uppercase text-[#94A3B8] mb-4 border-b border-[#1E293B] pb-2 flex items-center gap-2">
                <Cloud className="w-4 h-4" /> Hosting & Repository
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Platform:</span>
                  <span className="text-white font-medium">
                    {HOSTING_PLATFORMS.find(p => p.id === formData.hostingPlatform)?.name || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">GitHub:</span>
                  <span className="text-white font-medium truncate ml-2">
                    {formData.githubOption === "new_repo" ? "New repository" : formData.githubRepoUrl || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Username:</span>
                  <span className="text-[#0EA5E9] font-medium">{formData.githubUsername}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Options Summary */}
          <div className="bg-[#121821] border border-[#1E293B] p-5">
            <h4 className="text-xs font-mono uppercase text-[#94A3B8] mb-4 border-b border-[#1E293B] pb-2 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Development Options
            </h4>
            <div className="flex flex-wrap gap-2">
              {formData.enableCicd && (
                <span className="px-3 py-1 text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded">
                  CI/CD: {formData.cicdPlatform}
                </span>
              )}
              {formData.enableTesting && (
                <span className="px-3 py-1 text-xs font-mono bg-green-500/10 text-green-400 border border-green-500/30 rounded">
                  Automated Testing
                </span>
              )}
              {formData.enableMonitoring && (
                <span className="px-3 py-1 text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded">
                  Monitoring
                </span>
              )}
              {formData.enableSsl && (
                <span className="px-3 py-1 text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded">
                  SSL/TLS
                </span>
              )}
              <span className="px-3 py-1 text-xs font-mono bg-[#1E293B] text-[#94A3B8] rounded uppercase">
                {formData.environmentType}
              </span>
              <span className="px-3 py-1 text-xs font-mono bg-[#1E293B] text-[#94A3B8] rounded uppercase">
                Priority: {formData.priority}
              </span>
            </div>
          </div>

          {!user && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 flex items-center gap-3 rounded">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <p className="text-sm text-amber-300">You need to sign in to submit a development request.</p>
            </div>
          )}

          <div className="flex justify-between">
            <button 
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-2 px-4 py-2 border border-[#1E293B] bg-[#121821] hover:border-[#0EA5E9]/50 transition-colors text-xs font-medium uppercase text-[#94A3B8]"
            >
              Back
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !user}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#0EA5E9] to-[#0EA5E9]/70 text-white hover:brightness-110 transition-all text-sm font-bold uppercase shadow-[0_0_30px_rgba(14,165,233,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Development Request
                  <Rocket className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
