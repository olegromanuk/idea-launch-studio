import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowLeft,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  Code,
  Rocket,
  Eye,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  User,
  Github,
  Cloud,
  Settings,
  XCircle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface DevSubmission {
  id: string;
  user_id: string;
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

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  submitted: { label: "Submitted", color: "bg-blue-500/10 text-blue-500" },
  review: { label: "Review", color: "bg-purple-500/10 text-purple-500" },
  development: { label: "Development", color: "bg-amber-500/10 text-amber-500" },
  testing: { label: "Testing", color: "bg-cyan-500/10 text-cyan-500" },
  deployment: { label: "Deploying", color: "bg-orange-500/10 text-orange-500" },
  completed: { label: "Completed", color: "bg-green-500/10 text-green-500" },
  on_hold: { label: "On Hold", color: "bg-muted text-muted-foreground" },
  cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-500" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-muted text-muted-foreground" },
  normal: { label: "Normal", color: "bg-blue-500/10 text-blue-500" },
  high: { label: "High", color: "bg-amber-500/10 text-amber-500" },
  urgent: { label: "Urgent", color: "bg-red-500/10 text-red-500" },
};

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<DevSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSubmission, setSelectedSubmission] = useState<DevSubmission | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  // Edit form state
  const [editStatus, setEditStatus] = useState("");
  const [editStatusNotes, setEditStatusNotes] = useState("");
  const [editAssignedTo, setEditAssignedTo] = useState("");
  const [editEstimatedCompletion, setEditEstimatedCompletion] = useState("");

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      // Check if user's email domain is in admin_domains
      const { data, error } = await supabase.rpc("is_admin_by_domain" as any);
      
      if (error) {
        console.error("Admin check error:", error);
        setIsAdmin(false);
      } else {
        setIsAdmin(!!data);
        if (data) {
          fetchSubmissions();
        }
      }
    } catch (error) {
      console.error("Admin check failed:", error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from("dev_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error: any) {
      console.error("Error fetching submissions:", error);
      toast({
        title: "Error",
        description: "Failed to load submissions.",
        variant: "destructive",
      });
    }
  };

  const handleOpenDetail = (submission: DevSubmission) => {
    navigate(`/admin-panel/submission/${submission.id}`);
  };

  const handleRejectSubmission = async (submission: DevSubmission, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (submission.status === "cancelled") return;
    
    setRejectingId(submission.id);
    try {
      const { error } = await supabase
        .from("dev_submissions")
        .update({
          status: "cancelled",
          status_notes: "Submission rejected/closed by admin",
        })
        .eq("id", submission.id);

      if (error) throw error;

      toast({
        title: "Submission rejected",
        description: `"${submission.project_name}" has been cancelled.`,
      });

      fetchSubmissions();
    } catch (error: any) {
      console.error("Reject error:", error);
      toast({
        title: "Failed to reject",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRejectingId(null);
    }
  };

  const handleUpdateSubmission = async () => {
    if (!selectedSubmission) return;

    setUpdating(true);
    try {
      const updates: any = {
        status: editStatus,
        status_notes: editStatusNotes || null,
        assigned_to: editAssignedTo || null,
        estimated_completion: editEstimatedCompletion || null,
      };

      // Set timestamps based on status
      if (editStatus === "development" && selectedSubmission.status !== "development") {
        updates.started_at = new Date().toISOString();
      }
      if (editStatus === "completed" && selectedSubmission.status !== "completed") {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("dev_submissions")
        .update(updates)
        .eq("id", selectedSubmission.id);

      if (error) throw error;

      toast({
        title: "Updated successfully",
        description: "Submission has been updated.",
      });

      fetchSubmissions();
      setIsDetailOpen(false);
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

  const filteredSubmissions = submissions.filter((s) => {
    const matchesSearch = s.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.github_username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
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
            You don't have permission to access the admin panel.
          </p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </Card>
      </div>
    );
  }

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
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Admin Panel</h1>
                  <p className="text-sm text-muted-foreground">
                    Manage development submissions
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">
                {submissions.length} total submissions
              </Badge>
              <Button
                variant="outline"
                size="icon"
                onClick={fetchSubmissions}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by project name or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Pending Review", status: "submitted", color: "blue" },
            { label: "In Development", status: "development", color: "amber" },
            { label: "Testing", status: "testing", color: "cyan" },
            { label: "Completed", status: "completed", color: "green" },
          ].map((stat) => (
            <Card key={stat.status} className="p-4">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-3xl font-bold mt-1">
                {submissions.filter((s) => s.status === stat.status).length}
              </p>
            </Card>
          ))}
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission) => (
                <TableRow key={submission.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <p className="font-medium">{submission.project_name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {submission.project_description || "No description"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Github className="w-4 h-4" />
                      {submission.github_username}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{submission.hosting_platform}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={PRIORITY_CONFIG[submission.priority]?.color}>
                      {PRIORITY_CONFIG[submission.priority]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_CONFIG[submission.status]?.color}>
                      {STATUS_CONFIG[submission.status]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {submission.assigned_to || "-"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(submission.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDetail(submission)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {submission.status !== "cancelled" && submission.status !== "completed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          onClick={(e) => handleRejectSubmission(submission, e)}
                          disabled={rejectingId === submission.id}
                        >
                          {rejectingId === submission.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </main>

      {/* Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedSubmission && (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle className="text-xl">{selectedSubmission.project_name}</SheetTitle>
                <p className="text-sm text-muted-foreground">
                  Submitted on {formatDate(selectedSubmission.created_at)}
                </p>
              </SheetHeader>

              <div className="space-y-6">
                {/* Project Details */}
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Project Details</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Description:</span>
                      <span>{selectedSubmission.project_description || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hosting:</span>
                      <span>{selectedSubmission.hosting_platform}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GitHub:</span>
                      <span>{selectedSubmission.github_option === "new_repo" ? "New Repo" : selectedSubmission.github_repo_url}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Username:</span>
                      <span>{selectedSubmission.github_username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Environment:</span>
                      <span>{selectedSubmission.environment_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Custom Domain:</span>
                      <span>{selectedSubmission.custom_domain || "N/A"}</span>
                    </div>
                  </div>
                </Card>

                {/* Options */}
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Development Options</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSubmission.enable_cicd && (
                      <Badge variant="secondary">CI/CD: {selectedSubmission.cicd_platform}</Badge>
                    )}
                    {selectedSubmission.enable_testing && <Badge variant="secondary">Testing</Badge>}
                    {selectedSubmission.enable_monitoring && <Badge variant="secondary">Monitoring</Badge>}
                    {selectedSubmission.enable_ssl && <Badge variant="secondary">SSL</Badge>}
                  </div>
                </Card>

                {/* Scope - Features */}
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Selected Features</h4>
                  {selectedSubmission.selected_scope?.features?.length > 0 ? (
                    <div className="space-y-3">
                      {selectedSubmission.selected_scope.features.map((feature: any, idx: number) => (
                        <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                          <p className="font-medium text-sm">{feature.title || feature.name || `Feature ${idx + 1}`}</p>
                          {feature.description && (
                            <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                          )}
                          {feature.priority && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              {feature.priority}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No features selected</p>
                  )}
                </Card>

                {/* Scope - User Stories */}
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">User Stories</h4>
                  {selectedSubmission.selected_scope?.userStories?.length > 0 ? (
                    <div className="space-y-3">
                      {selectedSubmission.selected_scope.userStories.map((story: any, idx: number) => (
                        <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm">{story.story || story.title || story.description || `Story ${idx + 1}`}</p>
                          {story.acceptanceCriteria && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-muted-foreground">Acceptance Criteria:</p>
                              <p className="text-xs text-muted-foreground">{story.acceptanceCriteria}</p>
                            </div>
                          )}
                          {story.priority && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              {story.priority}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No user stories defined</p>
                  )}
                </Card>

                {/* Scope - Technical Solution */}
                {selectedSubmission.selected_scope?.technicalSolution && (
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3">Technical Solution</h4>
                    <div className="text-sm space-y-2">
                      {selectedSubmission.selected_scope.technicalSolution.architecture && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Architecture:</p>
                          <p>{selectedSubmission.selected_scope.technicalSolution.architecture}</p>
                        </div>
                      )}
                      {selectedSubmission.selected_scope.technicalSolution.techStack && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Tech Stack:</p>
                          <p>{selectedSubmission.selected_scope.technicalSolution.techStack}</p>
                        </div>
                      )}
                      {selectedSubmission.selected_scope.technicalSolution.integrations && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Integrations:</p>
                          <p>{selectedSubmission.selected_scope.technicalSolution.integrations}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Scope - Timeline & Milestones */}
                {selectedSubmission.selected_scope?.milestones?.length > 0 && (
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3">Milestones</h4>
                    <div className="space-y-2">
                      {selectedSubmission.selected_scope.milestones.map((milestone: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                          <span>{milestone.title || milestone.name || milestone}</span>
                          {milestone.duration && (
                            <Badge variant="outline" className="ml-auto text-xs">
                              {milestone.duration}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Scope - Risks & Constraints */}
                {(selectedSubmission.selected_scope?.risks?.length > 0 || selectedSubmission.selected_scope?.constraints?.length > 0) && (
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3">Risks & Constraints</h4>
                    {selectedSubmission.selected_scope.risks?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Risks:</p>
                        <ul className="text-sm space-y-1">
                          {selectedSubmission.selected_scope.risks.map((risk: any, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                              <span>{risk.title || risk.description || risk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selectedSubmission.selected_scope.constraints?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Constraints:</p>
                        <ul className="text-sm space-y-1">
                          {selectedSubmission.selected_scope.constraints.map((constraint: any, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
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
                {selectedSubmission.additional_requirements && (
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">Additional Requirements</h4>
                    <p className="text-sm">{selectedSubmission.additional_requirements}</p>
                  </Card>
                )}

                {/* Update Form */}
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Update Status
                  </h4>
                  <div className="grid gap-4">
                    <div>
                      <Label>Status</Label>
                      <Select value={editStatus} onValueChange={setEditStatus}>
                        <SelectTrigger>
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
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>Assigned To</Label>
                      <Input
                        value={editAssignedTo}
                        onChange={(e) => setEditAssignedTo(e.target.value)}
                        placeholder="Developer name"
                      />
                    </div>
                    <div>
                      <Label>Estimated Completion</Label>
                      <Input
                        type="date"
                        value={editEstimatedCompletion}
                        onChange={(e) => setEditEstimatedCompletion(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleUpdateSubmission} disabled={updating}>
                      {updating ? "Updating..." : "Update Submission"}
                    </Button>
                  </div>
                </Card>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminPanel;
