import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Code,
  Rocket,
  Eye,
  ChevronRight,
  Github,
  Cloud,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface DevSubmission {
  id: string;
  project_name: string;
  project_description: string | null;
  status: string;
  status_notes: string | null;
  hosting_platform: string;
  github_option: string;
  github_username: string;
  priority: string;
  created_at: string;
  estimated_completion: string | null;
  assigned_to: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; progress: number }> = {
  submitted: { label: "Submitted", color: "bg-blue-500/10 text-blue-500 border-blue-500/30", icon: Clock, progress: 10 },
  review: { label: "Under Review", color: "bg-purple-500/10 text-purple-500 border-purple-500/30", icon: Eye, progress: 20 },
  development: { label: "In Development", color: "bg-amber-500/10 text-amber-500 border-amber-500/30", icon: Code, progress: 50 },
  testing: { label: "Testing", color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30", icon: CheckCircle2, progress: 70 },
  deployment: { label: "Deploying", color: "bg-orange-500/10 text-orange-500 border-orange-500/30", icon: Rocket, progress: 90 },
  completed: { label: "Completed", color: "bg-green-500/10 text-green-500 border-green-500/30", icon: CheckCircle2, progress: 100 },
  on_hold: { label: "On Hold", color: "bg-muted text-muted-foreground", icon: AlertCircle, progress: 0 },
  cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-500 border-red-500/30", icon: AlertCircle, progress: 0 },
};

const MySubmissions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<DevSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<DevSubmission | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    fetchSubmissions();
  }, [user, navigate]);

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
    } finally {
      setLoading(false);
    }
  };

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
                onClick={() => navigate("/canvas")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">My Development Requests</h1>
                <p className="text-sm text-muted-foreground">
                  Track your submitted projects
                </p>
              </div>
            </div>
            <Button onClick={() => navigate("/canvas")}>
              New Submission
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {submissions.length === 0 ? (
          <Card className="p-12 text-center">
            <Code className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <h2 className="text-xl font-semibold mb-2">No submissions yet</h2>
            <p className="text-muted-foreground mb-6">
              Submit your first development request to get started
            </p>
            <Button onClick={() => navigate("/canvas")}>
              Go to Canvas
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {submissions.map((submission) => {
              const statusConfig = STATUS_CONFIG[submission.status] || STATUS_CONFIG.submitted;
              const StatusIcon = statusConfig.icon;

              return (
                <Card
                  key={submission.id}
                  className="p-6 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        statusConfig.color
                      )}>
                        <StatusIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{submission.project_name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {submission.project_description?.slice(0, 100) || "No description"}
                        </p>
                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                          <Badge variant="outline" className={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Cloud className="w-3 h-3" />
                            {submission.hosting_platform}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Github className="w-3 h-3" />
                            {submission.github_username}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(submission.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="mb-2">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <p className="font-bold text-lg">{statusConfig.progress}%</p>
                      </div>
                      <Progress value={statusConfig.progress} className="w-32 h-2" />
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex justify-between">
                      {Object.entries(STATUS_CONFIG)
                        .filter(([key]) => !["on_hold", "cancelled"].includes(key))
                        .map(([key, config], index) => {
                          const isActive = submission.status === key;
                          const isPast = statusConfig.progress > config.progress;
                          const Icon = config.icon;
                          
                          return (
                            <div key={key} className="flex flex-col items-center flex-1">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                                isActive && "ring-2 ring-primary ring-offset-2 bg-primary text-primary-foreground",
                                isPast && "bg-success text-success-foreground",
                                !isActive && !isPast && "bg-muted text-muted-foreground"
                              )}>
                                {isPast ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                              </div>
                              <p className={cn(
                                "text-xs mt-2 text-center",
                                isActive ? "text-primary font-medium" : "text-muted-foreground"
                              )}>
                                {config.label}
                              </p>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {submission.status_notes && (
                    <div className="mt-4 p-3 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">
                        <strong>Latest update:</strong> {submission.status_notes}
                      </p>
                    </div>
                  )}

                  {submission.estimated_completion && (
                    <p className="text-sm text-muted-foreground mt-3">
                      Estimated completion: {formatDate(submission.estimated_completion)}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MySubmissions;
