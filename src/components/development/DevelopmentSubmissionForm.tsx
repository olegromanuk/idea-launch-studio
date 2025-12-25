import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Loader2
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
        // Check for existing submission for this project
        const query = supabase
          .from("dev_submissions")
          .select("id, project_name, status, created_at, submitted_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        
        // If we have a project ID, filter by it; otherwise get most recent
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
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Checking submission status...</p>
      </div>
    );
  }

  // Show existing submission status
  if (existingSubmission) {
    const statusInfo = STATUS_CONFIG[existingSubmission.status] || STATUS_CONFIG.submitted;
    const StatusIcon = statusInfo.icon;

    return (
      <div className="space-y-6">
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <div className="flex items-start gap-4">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", statusInfo.color)}>
              <StatusIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Development Request {statusInfo.label}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your project "<span className="font-medium text-foreground">{existingSubmission.project_name}</span>" 
                was submitted on {formatDate(existingSubmission.submitted_at)}
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => navigate("/my-submissions")}
                  className="gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View My Submissions
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setExistingSubmission(null)}
                  className="gap-2"
                >
                  <Rocket className="w-4 h-4" />
                  Submit New Request
                </Button>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-muted/50">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Submission Timeline
          </h4>
          <div className="flex items-center gap-2">
            {Object.entries(STATUS_CONFIG).slice(0, 6).map(([key, config], index) => {
              const isActive = key === existingSubmission.status;
              const isPast = Object.keys(STATUS_CONFIG).indexOf(existingSubmission.status) > index;
              
              return (
                <div key={key} className="flex items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                    isActive && `${config.color} text-white ring-2 ring-offset-2 ring-offset-background`,
                    isPast && "bg-green-500 text-white",
                    !isActive && !isPast && "bg-muted text-muted-foreground"
                  )}>
                    {isPast ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                  </div>
                  {index < 5 && (
                    <div className={cn(
                      "w-8 h-0.5",
                      isPast ? "bg-green-500" : "bg-muted"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Submitted</span>
            <span>Review</span>
            <span>Development</span>
            <span>Testing</span>
            <span>Deploy</span>
            <span>Done</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          
          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => setCurrentStep(step.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                  isActive && "bg-primary text-primary-foreground",
                  isCompleted && "bg-success/20 text-success",
                  !isActive && !isCompleted && "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
                <span className="hidden sm:inline font-medium">{step.title}</span>
              </button>
              {index < steps.length - 1 && (
                <ChevronRight className="w-5 h-5 mx-2 text-muted-foreground" />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1: Scope Selection */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h3 className="text-lg font-semibold mb-2">Project Information</h3>
            <div className="grid gap-4">
              <div>
                <Label>Project Name</Label>
                <Input
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  placeholder="Your project name"
                />
              </div>
              <div>
                <Label>Project Description</Label>
                <Textarea
                  value={formData.projectDescription}
                  onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                  placeholder="Brief description of what you want to build..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Select Features to Develop</h3>
            <p className="text-sm text-muted-foreground mb-4">Choose which features should be included in this development cycle</p>
            
            {scopeData.features.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">
                <Layers className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No features defined yet. Add features in Scope & Planning first.</p>
              </Card>
            ) : (
              <div className="grid gap-2">
                {scopeData.features.map((feature) => (
                  <div
                    key={feature.id}
                    onClick={() => toggleFeature(feature.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      selectedFeatures.includes(feature.id)
                        ? "bg-primary/10 border-primary"
                        : "bg-card border-border hover:border-primary/50"
                    )}
                  >
                    <Checkbox checked={selectedFeatures.includes(feature.id)} />
                    <div className="flex-1">
                      <p className="font-medium">{feature.name}</p>
                      {feature.description && (
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {feature.category.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Select User Stories</h3>
            <p className="text-sm text-muted-foreground mb-4">Choose user stories to implement</p>
            
            {scopeData.userStories.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">
                <User className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No user stories defined yet. Add stories in Scope & Planning first.</p>
              </Card>
            ) : (
              <div className="grid gap-2 max-h-64 overflow-y-auto">
                {scopeData.userStories.map((story) => (
                  <div
                    key={story.id}
                    onClick={() => toggleStory(story.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      selectedStories.includes(story.id)
                        ? "bg-primary/10 border-primary"
                        : "bg-card border-border hover:border-primary/50"
                    )}
                  >
                    <Checkbox checked={selectedStories.includes(story.id)} />
                    <p className="text-sm flex-1">
                      As a <span className="font-medium text-violet-500">{story.persona}</span>, 
                      I want to <span className="font-medium">{story.action}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setCurrentStep(2)}>
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Hosting & GitHub */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h3 className="text-lg font-semibold mb-2">Hosting Platform</h3>
            <p className="text-sm text-muted-foreground mb-4">Where should we deploy your application?</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {HOSTING_PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => setFormData({ ...formData, hostingPlatform: platform.id })}
                  className={cn(
                    "p-4 rounded-xl border text-center transition-all hover:shadow-md",
                    formData.hostingPlatform === platform.id
                      ? "bg-primary/10 border-primary ring-2 ring-primary"
                      : "bg-card border-border hover:border-primary/50"
                  )}
                >
                  <span className="text-2xl block mb-2">{platform.icon}</span>
                  <p className="font-medium text-sm">{platform.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{platform.description}</p>
                </button>
              ))}
            </div>

            <div className="mt-4">
              <Label>Additional hosting notes (optional)</Label>
              <Textarea
                value={formData.hostingNotes}
                onChange={(e) => setFormData({ ...formData, hostingNotes: e.target.value })}
                placeholder="Any specific hosting requirements or preferences..."
                rows={2}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Github className="w-5 h-5" />
              GitHub Repository
            </h3>
            
            <RadioGroup
              value={formData.githubOption}
              onValueChange={(value) => setFormData({ ...formData, githubOption: value as "existing" | "new_repo" })}
              className="mb-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new_repo" id="new_repo" />
                <Label htmlFor="new_repo">Create a new repository for me</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="existing" id="existing" />
                <Label htmlFor="existing">I have an existing repository</Label>
              </div>
            </RadioGroup>

            {formData.githubOption === "existing" && (
              <div className="mb-4">
                <Label>Repository URL</Label>
                <Input
                  value={formData.githubRepoUrl}
                  onChange={(e) => setFormData({ ...formData, githubRepoUrl: e.target.value })}
                  placeholder="https://github.com/username/repo"
                />
              </div>
            )}

            <div>
              <Label>GitHub Username *</Label>
              <Input
                value={formData.githubUsername}
                onChange={(e) => setFormData({ ...formData, githubUsername: e.target.value })}
                placeholder="Your GitHub username to share the repo with"
              />
              <p className="text-xs text-muted-foreground mt-1">
                We'll add you as a collaborator to the repository
              </p>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
            <Button onClick={() => setCurrentStep(3)}>
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Development Options */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h3 className="text-lg font-semibold mb-4">Development Configuration</h3>
            
            <div className="grid gap-4">
              {/* CI/CD */}
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Settings className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">CI/CD Pipeline</p>
                      <p className="text-sm text-muted-foreground">Automated build, test, and deployment</p>
                    </div>
                  </div>
                  <Checkbox
                    checked={formData.enableCicd}
                    onCheckedChange={(checked) => setFormData({ ...formData, enableCicd: !!checked })}
                  />
                </div>
                {formData.enableCicd && (
                  <div className="mt-4 ml-13">
                    <Select
                      value={formData.cicdPlatform}
                      onValueChange={(value) => setFormData({ ...formData, cicdPlatform: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select CI/CD platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {CICD_PLATFORMS.map((platform) => (
                          <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </Card>

              {/* Testing */}
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">Automated Testing</p>
                      <p className="text-sm text-muted-foreground">Unit tests, integration tests, E2E tests</p>
                    </div>
                  </div>
                  <Checkbox
                    checked={formData.enableTesting}
                    onCheckedChange={(checked) => setFormData({ ...formData, enableTesting: !!checked })}
                  />
                </div>
              </Card>

              {/* Monitoring */}
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium">Monitoring & Analytics</p>
                      <p className="text-sm text-muted-foreground">Error tracking, performance monitoring</p>
                    </div>
                  </div>
                  <Checkbox
                    checked={formData.enableMonitoring}
                    onCheckedChange={(checked) => setFormData({ ...formData, enableMonitoring: !!checked })}
                  />
                </div>
              </Card>

              {/* SSL */}
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium">SSL/TLS Certificate</p>
                      <p className="text-sm text-muted-foreground">Secure HTTPS connection</p>
                    </div>
                  </div>
                  <Checkbox
                    checked={formData.enableSsl}
                    onCheckedChange={(checked) => setFormData({ ...formData, enableSsl: !!checked })}
                  />
                </div>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Custom Domain (optional)</Label>
              <Input
                value={formData.customDomain}
                onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                placeholder="example.com"
              />
            </div>
            <div>
              <Label>Environment Type</Label>
              <Select
                value={formData.environmentType}
                onValueChange={(value) => setFormData({ ...formData, environmentType: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - No rush</SelectItem>
                <SelectItem value="normal">Normal - Standard timeline</SelectItem>
                <SelectItem value="high">High - Prioritize this</SelectItem>
                <SelectItem value="urgent">Urgent - ASAP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Additional Requirements (optional)</Label>
            <Textarea
              value={formData.additionalRequirements}
              onChange={(e) => setFormData({ ...formData, additionalRequirements: e.target.value })}
              placeholder="Any other requirements, preferences, or notes for the development team..."
              rows={3}
            />
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep(2)}>Back</Button>
            <Button onClick={() => setCurrentStep(4)}>
              Review Submission <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Review & Submit */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold">Review Your Submission</h3>
            <p className="text-muted-foreground">Please review your development request before submitting</p>
          </div>

          <div className="grid gap-4">
            {/* Project Summary */}
            <Card className="p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Code className="w-4 h-4" />
                Project
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p className="text-muted-foreground">Name:</p>
                <p className="font-medium">{formData.projectName}</p>
                <p className="text-muted-foreground">Features:</p>
                <p className="font-medium">{selectedFeatures.length} selected</p>
                <p className="text-muted-foreground">User Stories:</p>
                <p className="font-medium">{selectedStories.length} selected</p>
              </div>
            </Card>

            {/* Hosting Summary */}
            <Card className="p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Cloud className="w-4 h-4" />
                Hosting & Repository
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p className="text-muted-foreground">Platform:</p>
                <p className="font-medium">
                  {HOSTING_PLATFORMS.find(p => p.id === formData.hostingPlatform)?.name || "-"}
                </p>
                <p className="text-muted-foreground">GitHub:</p>
                <p className="font-medium">
                  {formData.githubOption === "new_repo" ? "New repository" : formData.githubRepoUrl}
                </p>
                <p className="text-muted-foreground">Username:</p>
                <p className="font-medium">{formData.githubUsername}</p>
              </div>
            </Card>

            {/* Options Summary */}
            <Card className="p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Development Options
              </h4>
              <div className="flex flex-wrap gap-2">
                {formData.enableCicd && (
                  <Badge variant="secondary">CI/CD: {formData.cicdPlatform}</Badge>
                )}
                {formData.enableTesting && <Badge variant="secondary">Automated Testing</Badge>}
                {formData.enableMonitoring && <Badge variant="secondary">Monitoring</Badge>}
                {formData.enableSsl && <Badge variant="secondary">SSL/TLS</Badge>}
                <Badge variant="outline">{formData.environmentType}</Badge>
                <Badge variant="outline">Priority: {formData.priority}</Badge>
              </div>
            </Card>
          </div>

          {!user && (
            <Card className="p-4 bg-amber-500/10 border-amber-500/30">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <p className="text-sm">You need to sign in to submit a development request.</p>
              </div>
            </Card>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep(3)}>Back</Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !user}
              className="bg-gradient-to-r from-primary to-accent"
            >
              {isSubmitting ? "Submitting..." : "Submit Development Request"}
              <Rocket className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
