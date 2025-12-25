import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Code,
  Rocket,
  Github,
  Cloud,
  Settings,
  Calendar,
  User,
  FileText,
  Layers,
  Target,
  Lightbulb,
  List,
  Loader2,
  ExternalLink,
  ChevronRight,
  Milestone,
  BookOpen,
  Wrench,
  Timer,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface DevSubmission {
  id: string;
  user_id: string;
  project_id: string | null;
  project_name: string;
  project_description: string | null;
  selected_scope: any;
  hosting_platform: string;
  github_option: string;
  github_repo_url: string | null;
  github_username: string;
  enable_cicd: boolean;
  cicd_platform: string | null;
  enable_testing: boolean;
  enable_monitoring: boolean;
  enable_ssl: boolean;
  custom_domain: string | null;
  environment_type: string;
  priority: string;
  status: string;
  status_notes: string | null;
  assigned_to: string | null;
  estimated_completion: string | null;
  additional_requirements: string | null;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
}

interface ProjectData {
  id: string;
  name: string;
  product_idea: string | null;
  target_audience: string | null;
  key_problem: string | null;
  persona: string | null;
  canvas_data: any;
}

interface StatusHistoryEntry {
  id: string;
  submission_id: string;
  old_status: string | null;
  new_status: string;
  notes: string | null;
  changed_by: string | null;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: "submitted", label: "Submitted" },
  { value: "review", label: "Under Review" },
  { value: "development", label: "In Development" },
  { value: "testing", label: "Testing" },
  { value: "deployment", label: "Deploying" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On Hold" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  submitted: { label: "Submitted", color: "bg-blue-500/10 text-blue-500 border-blue-500/30", icon: FileText },
  review: { label: "Under Review", color: "bg-purple-500/10 text-purple-500 border-purple-500/30", icon: BookOpen },
  development: { label: "In Development", color: "bg-amber-500/10 text-amber-500 border-amber-500/30", icon: Code },
  testing: { label: "Testing", color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30", icon: Wrench },
  deployment: { label: "Deploying", color: "bg-orange-500/10 text-orange-500 border-orange-500/30", icon: Rocket },
  completed: { label: "Completed", color: "bg-green-500/10 text-green-500 border-green-500/30", icon: CheckCircle2 },
  on_hold: { label: "On Hold", color: "bg-muted text-muted-foreground border-border", icon: Clock },
  cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-500 border-red-500/30", icon: AlertCircle },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-muted text-muted-foreground" },
  normal: { label: "Normal", color: "bg-blue-500/10 text-blue-500" },
  high: { label: "High", color: "bg-amber-500/10 text-amber-500" },
  urgent: { label: "Urgent", color: "bg-red-500/10 text-red-500" },
};

const SubmissionDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [submission, setSubmission] = useState<DevSubmission | null>(null);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Edit form state
  const [editStatus, setEditStatus] = useState("");
  const [editStatusNotes, setEditStatusNotes] = useState("");
  const [editAssignedTo, setEditAssignedTo] = useState("");
  const [editEstimatedCompletion, setEditEstimatedCompletion] = useState("");

  useEffect(() => {
    checkAdminAndFetch();
  }, [user, id]);

  const checkAdminAndFetch = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      const { data: isAdminData } = await supabase.rpc("is_admin_by_domain");
      setIsAdmin(!!isAdminData);

      if (isAdminData && id) {
        await fetchSubmission();
      } else if (!isAdminData) {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  const fetchSubmission = async () => {
    try {
      const { data, error } = await supabase
        .from("dev_submissions")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSubmission(data);
        setEditStatus(data.status);
        setEditStatusNotes(data.status_notes || "");
        setEditAssignedTo(data.assigned_to || "");
        setEditEstimatedCompletion(data.estimated_completion || "");

        // Fetch associated project if exists
        if (data.project_id) {
          const { data: projectData } = await supabase
            .from("projects")
            .select("*")
            .eq("id", data.project_id)
            .maybeSingle();
          
          if (projectData) {
            setProject(projectData);
          }
        }

        // Fetch status history
        const { data: historyData } = await supabase
          .from("dev_submission_status_history")
          .select("*")
          .eq("submission_id", id)
          .order("created_at", { ascending: false });
        
        if (historyData) {
          setStatusHistory(historyData);
        }
      }
    } catch (error: any) {
      console.error("Error fetching submission:", error);
      toast({
        title: "Error",
        description: "Failed to load submission details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubmission = async () => {
    if (!submission) return;

    setUpdating(true);
    try {
      const updates: any = {
        status: editStatus,
        status_notes: editStatusNotes || null,
        assigned_to: editAssignedTo || null,
        estimated_completion: editEstimatedCompletion || null,
      };

      if (editStatus === "development" && submission.status !== "development") {
        updates.started_at = new Date().toISOString();
      }
      if (editStatus === "completed" && submission.status !== "completed") {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("dev_submissions")
        .update(updates)
        .eq("id", submission.id);

      if (error) throw error;

      toast({
        title: "Updated successfully",
        description: "Submission has been updated.",
      });

      // Clear the notes field after successful update
      setEditStatusNotes("");

      await fetchSubmission();
    } catch (error: any) {
      console.error("Update error:", error);
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You don't have permission to view this page.
          </p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </Card>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Submission Not Found</h2>
          <p className="text-muted-foreground mb-6">
            This submission doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/admin-panel")}>Back to Admin Panel</Button>
        </Card>
      </div>
    );
  }

  const StatusIcon = STATUS_CONFIG[submission.status]?.icon || FileText;
  const scope = submission.selected_scope || {};
  const canvasData = project?.canvas_data || {};

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
                onClick={() => navigate("/admin-panel")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">{submission.project_name}</h1>
                <p className="text-sm text-muted-foreground">
                  Submitted {formatShortDate(submission.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={cn("border", STATUS_CONFIG[submission.status]?.color)}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {STATUS_CONFIG[submission.status]?.label}
              </Badge>
              <Badge className={PRIORITY_CONFIG[submission.priority]?.color}>
                {PRIORITY_CONFIG[submission.priority]?.label} Priority
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Overview */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Project Overview</h2>
              </div>
              
              <div className="space-y-4">
                {submission.project_description && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Description</Label>
                    <p className="mt-1">{submission.project_description}</p>
                  </div>
                )}
                
                {project?.product_idea && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Product Idea</Label>
                    <p className="mt-1">{project.product_idea}</p>
                  </div>
                )}

                {project?.target_audience && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Target Audience</Label>
                    <p className="mt-1">{project.target_audience}</p>
                  </div>
                )}

                {project?.key_problem && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Key Problem</Label>
                    <p className="mt-1">{project.key_problem}</p>
                  </div>
                )}

                {project?.persona && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Persona</Label>
                    <p className="mt-1">{project.persona}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Canvas Data - if available */}
            {canvasData && Object.keys(canvasData).length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Canvas Details</h2>
                </div>
                
                <Accordion type="multiple" className="w-full">
                  {canvasData.problem && (
                    <AccordionItem value="problem">
                      <AccordionTrigger className="text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-red-500" />
                          Problem Statement
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {canvasData.problem}
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {canvasData.uniqueValueProposition && (
                    <AccordionItem value="uvp">
                      <AccordionTrigger className="text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-yellow-500" />
                          Unique Value Proposition
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {canvasData.uniqueValueProposition}
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {canvasData.coreFeatures && (
                    <AccordionItem value="coreFeatures">
                      <AccordionTrigger className="text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-blue-500" />
                          Core Features
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {canvasData.coreFeatures}
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {canvasData.techStack && (
                    <AccordionItem value="techStack">
                      <AccordionTrigger className="text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Code className="w-4 h-4 text-green-500" />
                          Tech Stack
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {canvasData.techStack}
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {canvasData.userFlow && (
                    <AccordionItem value="userFlow">
                      <AccordionTrigger className="text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <ChevronRight className="w-4 h-4 text-purple-500" />
                          User Flow
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {canvasData.userFlow}
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {canvasData.dataRequirements && (
                    <AccordionItem value="dataReq">
                      <AccordionTrigger className="text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-cyan-500" />
                          Data Requirements
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {canvasData.dataRequirements}
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {canvasData.pricingModel && (
                    <AccordionItem value="pricing">
                      <AccordionTrigger className="text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-emerald-500" />
                          Pricing Model
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {canvasData.pricingModel}
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {canvasData.launchPlan && (
                    <AccordionItem value="launch">
                      <AccordionTrigger className="text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Rocket className="w-4 h-4 text-orange-500" />
                          Launch Plan
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {canvasData.launchPlan}
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </Card>
            )}

            {/* Features */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">
                  Selected Features 
                  <Badge variant="secondary" className="ml-2">
                    {scope.features?.length || 0}
                  </Badge>
                </h2>
              </div>
              
              {scope.features?.length > 0 ? (
                <Accordion type="multiple" className="w-full">
                  {scope.features.map((feature: any, idx: number) => (
                    <AccordionItem key={idx} value={`feature-${idx}`}>
                      <AccordionTrigger className="text-sm font-medium hover:no-underline">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {idx + 1}
                          </div>
                          <span>{feature.title || feature.name || `Feature ${idx + 1}`}</span>
                          {feature.priority && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {feature.priority}
                            </Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-8 space-y-3">
                          {feature.description && (
                            <div>
                              <Label className="text-muted-foreground text-xs">Description</Label>
                              <p className="text-sm mt-1">{feature.description}</p>
                            </div>
                          )}
                          {feature.acceptanceCriteria && (
                            <div>
                              <Label className="text-muted-foreground text-xs">Acceptance Criteria</Label>
                              <p className="text-sm mt-1 whitespace-pre-wrap">{feature.acceptanceCriteria}</p>
                            </div>
                          )}
                          {feature.effort && (
                            <div>
                              <Label className="text-muted-foreground text-xs">Effort</Label>
                              <p className="text-sm mt-1">{feature.effort}</p>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-muted-foreground text-sm">No features selected</p>
              )}
            </Card>

            {/* User Stories */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">
                  User Stories
                  <Badge variant="secondary" className="ml-2">
                    {scope.userStories?.length || 0}
                  </Badge>
                </h2>
              </div>
              
              {scope.userStories?.length > 0 ? (
                <Accordion type="multiple" className="w-full">
                  {scope.userStories.map((story: any, idx: number) => {
                    // Build the user story text from persona/action/benefit format
                    const storyText = story.persona && story.action 
                      ? `As a ${story.persona}, I want to ${story.action}${story.benefit ? `, so that ${story.benefit}` : ''}`
                      : story.story || story.title || story.description || `Story ${idx + 1}`;
                    
                    return (
                      <AccordionItem key={story.id || idx} value={`story-${idx}`}>
                        <AccordionTrigger className="text-sm font-medium hover:no-underline text-left">
                          <div className="flex items-start gap-2 w-full">
                            <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-xs font-bold text-blue-500 shrink-0 mt-0.5">
                              {idx + 1}
                            </div>
                            <span className="flex-1 text-left">{storyText}</span>
                            {story.priority && (
                              <Badge variant="outline" className="text-xs shrink-0 ml-2">
                                {story.priority}
                              </Badge>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pl-8 space-y-3">
                            {story.persona && (
                              <div>
                                <Label className="text-muted-foreground text-xs">Persona</Label>
                                <p className="text-sm mt-1">{story.persona}</p>
                              </div>
                            )}
                            {story.action && (
                              <div>
                                <Label className="text-muted-foreground text-xs">Action</Label>
                                <p className="text-sm mt-1">{story.action}</p>
                              </div>
                            )}
                            {story.benefit && (
                              <div>
                                <Label className="text-muted-foreground text-xs">Benefit</Label>
                                <p className="text-sm mt-1">{story.benefit}</p>
                              </div>
                            )}
                            {story.acceptanceCriteria && Array.isArray(story.acceptanceCriteria) && story.acceptanceCriteria.length > 0 && (
                              <div>
                                <Label className="text-muted-foreground text-xs">Acceptance Criteria</Label>
                                <ul className="mt-1 space-y-1">
                                  {story.acceptanceCriteria.map((criteria: any, cIdx: number) => (
                                    <li key={cIdx} className="text-sm flex items-start gap-2">
                                      <CheckCircle2 className="w-3 h-3 text-muted-foreground mt-1 shrink-0" />
                                      <span>{typeof criteria === 'string' ? criteria : criteria.text || criteria.description}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {story.acceptanceCriteria && typeof story.acceptanceCriteria === 'string' && (
                              <div>
                                <Label className="text-muted-foreground text-xs">Acceptance Criteria</Label>
                                <p className="text-sm mt-1 whitespace-pre-wrap">{story.acceptanceCriteria}</p>
                              </div>
                            )}
                            <div className="flex flex-wrap gap-2 pt-2">
                              {story.status && (
                                <Badge variant="outline" className="text-xs">
                                  Status: {story.status}
                                </Badge>
                              )}
                              {story.storyPoints > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  Points: {story.storyPoints}
                                </Badge>
                              )}
                              {story.labels && story.labels.length > 0 && story.labels.map((label: string, lIdx: number) => (
                                <Badge key={lIdx} variant="secondary" className="text-xs">
                                  {label}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              ) : (
                <p className="text-muted-foreground text-sm">No user stories defined</p>
              )}
            </Card>

            {/* Milestones */}
            {scope.milestones?.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Milestone className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">
                    Milestones
                    <Badge variant="secondary" className="ml-2">
                      {scope.milestones.length}
                    </Badge>
                  </h2>
                </div>
                
                <Accordion type="multiple" className="w-full">
                  {scope.milestones.map((milestone: any, idx: number) => (
                    <AccordionItem key={idx} value={`milestone-${idx}`}>
                      <AccordionTrigger className="text-sm font-medium hover:no-underline">
                        <div className="flex items-center gap-2 w-full">
                          <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center text-xs font-bold text-green-500">
                            {idx + 1}
                          </div>
                          <span>{milestone.title || milestone.name || milestone}</span>
                          {milestone.duration && (
                            <Badge variant="outline" className="ml-auto mr-2 text-xs">
                              <Timer className="w-3 h-3 mr-1" />
                              {milestone.duration}
                            </Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-8 space-y-3">
                          {milestone.description && (
                            <div>
                              <Label className="text-muted-foreground text-xs">Description</Label>
                              <p className="text-sm mt-1">{milestone.description}</p>
                            </div>
                          )}
                          {milestone.deliverables && (
                            <div>
                              <Label className="text-muted-foreground text-xs">Deliverables</Label>
                              <p className="text-sm mt-1 whitespace-pre-wrap">{milestone.deliverables}</p>
                            </div>
                          )}
                          {milestone.tasks && Array.isArray(milestone.tasks) && (
                            <div>
                              <Label className="text-muted-foreground text-xs">Tasks</Label>
                              <ul className="mt-1 space-y-1">
                                {milestone.tasks.map((task: any, tIdx: number) => (
                                  <li key={tIdx} className="text-sm flex items-center gap-2">
                                    <CheckCircle2 className="w-3 h-3 text-muted-foreground" />
                                    {task.title || task.name || task}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>
            )}

            {/* Technical Solution */}
            {scope.technicalSolution && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Code className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Technical Solution</h2>
                </div>
                
                <div className="space-y-4">
                  {scope.technicalSolution.architecture && (
                    <div>
                      <Label className="text-muted-foreground text-xs">Architecture</Label>
                      <p className="text-sm mt-1 whitespace-pre-wrap">{scope.technicalSolution.architecture}</p>
                    </div>
                  )}
                  {scope.technicalSolution.techStack && (
                    <div>
                      <Label className="text-muted-foreground text-xs">Tech Stack</Label>
                      <p className="text-sm mt-1 whitespace-pre-wrap">{scope.technicalSolution.techStack}</p>
                    </div>
                  )}
                  {scope.technicalSolution.integrations && (
                    <div>
                      <Label className="text-muted-foreground text-xs">Integrations</Label>
                      <p className="text-sm mt-1 whitespace-pre-wrap">{scope.technicalSolution.integrations}</p>
                    </div>
                  )}
                  {scope.technicalSolution.dataModel && (
                    <div>
                      <Label className="text-muted-foreground text-xs">Data Model</Label>
                      <p className="text-sm mt-1 whitespace-pre-wrap">{scope.technicalSolution.dataModel}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Risks & Constraints */}
            {(scope.risks?.length > 0 || scope.constraints?.length > 0) && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldAlert className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Risks & Constraints</h2>
                </div>
                
                {scope.risks?.length > 0 && (
                  <div className="mb-4">
                    <Label className="text-muted-foreground text-xs mb-2 block">Identified Risks</Label>
                    <Accordion type="multiple" className="w-full">
                      {scope.risks.map((risk: any, idx: number) => (
                        <AccordionItem key={idx} value={`risk-${idx}`}>
                          <AccordionTrigger className="text-sm font-medium hover:no-underline">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                              <span>{risk.title || risk.name || `Risk ${idx + 1}`}</span>
                              {risk.severity && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {risk.severity}
                                </Badge>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="pl-6 space-y-2">
                              {(risk.description || typeof risk === 'string') && (
                                <p className="text-sm text-muted-foreground">
                                  {risk.description || risk}
                                </p>
                              )}
                              {risk.mitigation && (
                                <div>
                                  <Label className="text-muted-foreground text-xs">Mitigation</Label>
                                  <p className="text-sm mt-1">{risk.mitigation}</p>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                )}

                {scope.constraints?.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground text-xs mb-2 block">Constraints</Label>
                    <ul className="space-y-2">
                      {scope.constraints.map((constraint: any, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <span>{constraint.title || constraint.description || constraint}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            )}

            {/* Additional Requirements */}
            {submission.additional_requirements && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <List className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Additional Requirements</h2>
                </div>
                <p className="text-sm whitespace-pre-wrap">{submission.additional_requirements}</p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Timeline</h2>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Submitted:</span>
                  <span>{formatShortDate(submission.created_at)}</span>
                </div>
                {submission.started_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Started:</span>
                    <span>{formatShortDate(submission.started_at)}</span>
                  </div>
                )}
                {submission.estimated_completion && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Completion:</span>
                    <span>{formatShortDate(submission.estimated_completion)}</span>
                  </div>
                )}
                {submission.completed_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed:</span>
                    <span>{formatShortDate(submission.completed_at)}</span>
                  </div>
                )}
                {submission.assigned_to && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Assigned To:</span>
                      <span>{submission.assigned_to}</span>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Infrastructure */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Cloud className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Infrastructure</h2>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hosting:</span>
                  <Badge variant="outline">{submission.hosting_platform}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Environment:</span>
                  <span className="capitalize">{submission.environment_type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">GitHub:</span>
                  <div className="flex items-center gap-1">
                    <Github className="w-3 h-3" />
                    <span>{submission.github_username}</span>
                  </div>
                </div>
                {submission.github_repo_url && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Repository:</span>
                    <a 
                      href={submission.github_repo_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View
                    </a>
                  </div>
                )}
                {submission.custom_domain && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Domain:</span>
                    <span>{submission.custom_domain}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex flex-wrap gap-2">
                  {submission.enable_cicd && (
                    <Badge variant="secondary" className="text-xs">
                      CI/CD: {submission.cicd_platform}
                    </Badge>
                  )}
                  {submission.enable_testing && (
                    <Badge variant="secondary" className="text-xs">Testing</Badge>
                  )}
                  {submission.enable_monitoring && (
                    <Badge variant="secondary" className="text-xs">Monitoring</Badge>
                  )}
                  {submission.enable_ssl && (
                    <Badge variant="secondary" className="text-xs">SSL</Badge>
                  )}
                </div>
              </div>
            </Card>

            {/* Update Status */}
            <Card className="p-6 border-primary/30 bg-primary/5">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Update Status</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>Status</Label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Status Notes</Label>
                  <Textarea
                    value={editStatusNotes}
                    onChange={(e) => setEditStatusNotes(e.target.value)}
                    placeholder="Add notes about the current status..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Assigned To</Label>
                  <Input
                    value={editAssignedTo}
                    onChange={(e) => setEditAssignedTo(e.target.value)}
                    placeholder="Developer name"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Estimated Completion</Label>
                  <Input
                    type="date"
                    value={editEstimatedCompletion}
                    onChange={(e) => setEditEstimatedCompletion(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <Button 
                  onClick={handleUpdateSubmission} 
                  disabled={updating}
                  className="w-full"
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Submission"
                  )}
                </Button>
              </div>
            </Card>

            {/* Status Notes & History */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Latest Notes</h2>
                </div>
                <Badge className={cn("border", STATUS_CONFIG[submission.status]?.color)}>
                  {STATUS_CONFIG[submission.status]?.label}
                </Badge>
              </div>
              
              {/* Last Update Time */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <Clock className="w-3 h-3" />
                <span>Last updated: {formatDate(submission.updated_at)}</span>
              </div>

              <div className="space-y-3">
                {submission.assigned_to && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Assigned to:</span>
                    <span className="font-medium">{submission.assigned_to}</span>
                  </div>
                )}
                {submission.estimated_completion && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Est. Completion:</span>
                    <span className="font-medium">{formatShortDate(submission.estimated_completion)}</span>
                  </div>
                )}
                {submission.status_notes && (
                  <>
                    {(submission.assigned_to || submission.estimated_completion) && <Separator />}
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {submission.status_notes}
                    </p>
                  </>
                )}
              </div>

              {/* Previous History */}
              {statusHistory.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="history" className="border-none">
                      <AccordionTrigger className="text-sm font-medium py-2 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          View Status History ({statusHistory.length} changes)
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pt-2">
                          {statusHistory.map((entry) => (
                            <div 
                              key={entry.id} 
                              className="p-3 rounded-lg bg-muted/50 border border-border/50"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {entry.old_status && (
                                    <>
                                      <Badge variant="outline" className="text-xs">
                                        {STATUS_CONFIG[entry.old_status]?.label || entry.old_status}
                                      </Badge>
                                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                    </>
                                  )}
                                  <Badge className={cn("text-xs", STATUS_CONFIG[entry.new_status]?.color)}>
                                    {STATUS_CONFIG[entry.new_status]?.label || entry.new_status}
                                  </Badge>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {formatShortDate(entry.created_at)}
                                </span>
                              </div>
                              {entry.notes && (
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                  {entry.notes}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubmissionDetail;