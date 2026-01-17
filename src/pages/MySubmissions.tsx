import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Clock,
  CheckCircle2,
  AlertCircle,
  Code,
  Rocket,
  Eye,
  Github,
  Cloud,
  Calendar,
  Plus,
  FileCode,
  ArrowRight,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/layout/AppHeader";
import { motion } from "framer-motion";

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

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: any; progress: number }> = {
  submitted: { label: "Submitted", color: "text-blue-400", bgColor: "bg-blue-500/10 border-blue-500/30", icon: Clock, progress: 10 },
  review: { label: "Under Review", color: "text-purple-400", bgColor: "bg-purple-500/10 border-purple-500/30", icon: Eye, progress: 20 },
  development: { label: "In Development", color: "text-amber-400", bgColor: "bg-amber-500/10 border-amber-500/30", icon: Code, progress: 50 },
  testing: { label: "Testing", color: "text-cyan-400", bgColor: "bg-cyan-500/10 border-cyan-500/30", icon: CheckCircle2, progress: 70 },
  deployment: { label: "Deploying", color: "text-orange-400", bgColor: "bg-orange-500/10 border-orange-500/30", icon: Rocket, progress: 90 },
  completed: { label: "Completed", color: "text-emerald-400", bgColor: "bg-emerald-500/10 border-emerald-500/30", icon: CheckCircle2, progress: 100 },
  on_hold: { label: "On Hold", color: "text-slate-400", bgColor: "bg-slate-500/10 border-slate-500/30", icon: AlertCircle, progress: 0 },
  cancelled: { label: "Cancelled", color: "text-red-400", bgColor: "bg-red-500/10 border-red-500/30", icon: AlertCircle, progress: 0 },
};

const MySubmissions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<DevSubmission[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Stats calculations
  const totalSubmissions = submissions.length;
  const inProgress = submissions.filter(s => ['development', 'testing', 'deployment'].includes(s.status)).length;
  const pending = submissions.filter(s => ['submitted', 'review'].includes(s.status)).length;
  const completed = submissions.filter(s => s.status === 'completed').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00E0FF]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans antialiased flex flex-col">
      {/* Grid Background */}
      <div 
        className="fixed inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, #1A1D24 1px, transparent 1px), linear-gradient(to bottom, #1A1D24 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black 60%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 60%, transparent 100%)'
        }}
      />

      {/* Shared Header */}
      <AppHeader statusText="Submissions_Active" />

      {/* Main Content */}
      <main className="flex-grow relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#00E0FF]/10 text-[#00E0FF] border border-[#00E0FF]/20">
                  SYSTEM.SUBMISSIONS
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
                DEVELOPMENT <span className="text-[#00E0FF]" style={{ textShadow: '0 0 10px rgba(0, 224, 255, 0.5)' }}>REQUESTS</span>
              </h1>
              <p className="text-slate-400 max-w-xl text-sm font-mono">
                // Track your submitted projects and monitor development progress.
              </p>
            </div>
            
            <button 
              onClick={() => navigate("/canvas")}
              className="group flex items-center gap-2 bg-[#00E0FF] hover:bg-cyan-400 text-black px-5 py-2.5 rounded text-sm font-bold transition-all"
              style={{ boxShadow: '0 0 15px -3px rgba(0,224,255,0.3)' }}
            >
              <Plus className="w-4 h-4 font-bold" />
              NEW SUBMISSION
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-[#0F1115] border border-[#1f2937] p-4 rounded flex flex-col gap-1 hover:border-[#00E0FF]/50 transition-colors group">
              <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">Total</span>
              <span className="text-2xl font-bold text-white group-hover:text-[#00E0FF] transition-colors">
                {String(totalSubmissions).padStart(2, '0')}
              </span>
            </div>
            <div className="bg-[#0F1115] border border-[#1f2937] p-4 rounded flex flex-col gap-1 hover:border-amber-500/50 transition-colors group">
              <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">In Progress</span>
              <span className="text-2xl font-bold text-white group-hover:text-amber-400 transition-colors">
                {String(inProgress).padStart(2, '0')}
              </span>
            </div>
            <div className="bg-[#0F1115] border border-[#1f2937] p-4 rounded flex flex-col gap-1 hover:border-purple-500/50 transition-colors group">
              <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">Pending</span>
              <span className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors">
                {String(pending).padStart(2, '0')}
              </span>
            </div>
            <div className="bg-[#0F1115] border border-[#1f2937] p-4 rounded flex flex-col gap-1 hover:border-emerald-500/50 transition-colors group">
              <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">Completed</span>
              <span className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                {String(completed).padStart(2, '0')}
              </span>
            </div>
          </div>

          {submissions.length === 0 ? (
            /* Empty State */
            <div className="bg-[#0F1115] border border-[#1f2937] rounded-lg p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-lg bg-[#1f2937] flex items-center justify-center">
                <FileCode className="w-10 h-10 text-slate-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">No Submissions Yet</h2>
              <p className="text-slate-400 mb-8 text-sm font-mono">
                Submit your first development request to get started
              </p>
              <button 
                onClick={() => navigate("/canvas")}
                className="inline-flex items-center gap-2 bg-[#00E0FF] hover:bg-cyan-400 text-black px-6 py-3 rounded text-sm font-bold transition-all"
                style={{ boxShadow: '0 0 15px -3px rgba(0,224,255,0.3)' }}
              >
                Go to Canvas
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Submissions List */
            <div className="space-y-4">
              {submissions.map((submission, index) => {
                const statusConfig = STATUS_CONFIG[submission.status] || STATUS_CONFIG.submitted;
                const StatusIcon = statusConfig.icon;

                return (
                  <motion.div
                    key={submission.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => navigate(`/submission/${submission.id}`)}
                    className="bg-[#0F1115] border border-[#1f2937] rounded-lg p-6 relative overflow-hidden group hover:border-[#00E0FF]/60 transition-all duration-300 cursor-pointer"
                  >
                    {/* Hover accent line */}
                    <div 
                      className="absolute top-0 left-0 w-[2px] h-0 group-hover:h-full transition-all duration-500 ease-in-out" 
                      style={{ background: '#00E0FF', boxShadow: '0 0 5px #00E0FF, 0 0 20px #00E0FF' }} 
                    />

                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        {/* Status Icon */}
                        <div className={cn(
                          "w-12 h-12 rounded-lg flex items-center justify-center border",
                          statusConfig.bgColor
                        )}>
                          <StatusIcon className={cn("w-6 h-6", statusConfig.color)} />
                        </div>
                        
                        <div className="flex-1">
                          {/* Project Name */}
                          <h3 className="font-bold text-lg text-white uppercase tracking-tight group-hover:text-[#00E0FF] transition-colors">
                            {submission.project_name}
                          </h3>
                          
                          {/* Description */}
                          <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                            {submission.project_description?.slice(0, 100) || "No description provided"}
                          </p>
                          
                          {/* Meta Info */}
                          <div className="flex items-center gap-4 mt-3 flex-wrap">
                            <span className={cn(
                              "px-2 py-1 text-[10px] font-mono uppercase tracking-wider rounded border",
                              statusConfig.bgColor,
                              statusConfig.color
                            )}>
                              {statusConfig.label}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1.5 font-mono">
                              <Cloud className="w-3.5 h-3.5" />
                              {submission.hosting_platform}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1.5 font-mono">
                              <Github className="w-3.5 h-3.5" />
                              {submission.github_username}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1.5 font-mono">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(submission.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="text-right hidden sm:block">
                        <span className="text-xs text-slate-500 font-mono uppercase">Progress</span>
                        <p className="font-bold text-2xl text-white">{statusConfig.progress}%</p>
                        <div className="w-32 h-1.5 bg-[#1f2937] rounded-full mt-2 overflow-hidden">
                          <motion.div 
                            className="h-full rounded-full"
                            style={{ background: 'linear-gradient(90deg, #00E0FF, #00E0FF)' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${statusConfig.progress}%` }}
                            transition={{ duration: 0.8, delay: index * 0.05 }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Status Timeline */}
                    <div className="mt-6 pt-4 border-t border-[#1f2937]">
                      <div className="flex justify-between">
                        {Object.entries(STATUS_CONFIG)
                          .filter(([key]) => !["on_hold", "cancelled"].includes(key))
                          .map(([key, config]) => {
                            const isActive = submission.status === key;
                            const isPast = statusConfig.progress > config.progress;
                            const Icon = config.icon;
                            
                            return (
                              <div key={key} className="flex flex-col items-center flex-1">
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all border",
                                  isActive && "border-[#00E0FF] bg-[#00E0FF]/20 text-[#00E0FF] ring-2 ring-[#00E0FF]/30",
                                  isPast && "border-emerald-500/50 bg-emerald-500/20 text-emerald-400",
                                  !isActive && !isPast && "border-[#1f2937] bg-[#0F1115] text-slate-500"
                                )}>
                                  {isPast ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                                </div>
                                <p className={cn(
                                  "text-[10px] mt-2 text-center font-mono uppercase tracking-tight",
                                  isActive ? "text-[#00E0FF] font-medium" : "text-slate-500"
                                )}>
                                  {config.label}
                                </p>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Status Notes */}
                    {submission.status_notes && (
                      <div className="mt-4 p-3 rounded bg-[#1f2937]/50 border border-[#1f2937]">
                        <p className="text-xs text-slate-400 font-mono">
                          <span className="text-[#00E0FF] uppercase">Latest Update:</span> {submission.status_notes}
                        </p>
                      </div>
                    )}

                    {/* Estimated Completion */}
                    {submission.estimated_completion && (
                      <p className="text-xs text-slate-500 mt-3 font-mono">
                        <span className="text-slate-400">Estimated completion:</span> {formatDate(submission.estimated_completion)}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#1f2937] py-6 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[10px] uppercase text-slate-600 tracking-[0.2em] font-mono">Development_Tracker v1.0</div>
          <p className="text-[11px] text-slate-400">© 2024 Logomir OS. Secure Environment.</p>
        </div>
      </footer>
    </div>
  );
};

export default MySubmissions;
