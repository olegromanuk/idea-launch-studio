import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Clock, 
  MoreVertical, 
  Trash2, 
  Edit2,
  LogOut,
  Loader2,
  Search,
  Shield,
  FileText,
  Grid3X3,
  ArrowRight,
  Bell,
  Folder,
  Rocket,
  Database,
  Brain,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Project {
  id: string;
  name: string;
  product_idea: string | null;
  persona: string | null;
  created_at: string;
  canvas_data?: any;
  updated_at: string;
  progress: any;
}

const Projects = () => {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; project: Project | null }>({
    open: false,
    project: null,
  });
  const [renameDialog, setRenameDialog] = useState<{ open: boolean; project: Project | null; name: string }>({
    open: false,
    project: null,
    name: "",
  });

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase.rpc('is_admin_by_domain');
        if (!error && data) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };
    
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    localStorage.removeItem("productIdea");
    localStorage.removeItem("multiCanvas");
    localStorage.removeItem("scopeData");
    localStorage.removeItem("completedBlocks");
    localStorage.removeItem("validatedBlocks");
    localStorage.removeItem("currentProjectId");
    navigate("/onboarding");
  };

  const handleOpenProject = async (project: Project) => {
    await supabase
      .from("projects")
      .update({ last_accessed_at: new Date().toISOString() })
      .eq("id", project.id);

    localStorage.setItem("currentProjectId", project.id);
    localStorage.setItem("productIdea", JSON.stringify({
      idea: project.product_idea,
      persona: project.persona,
      ...((project.progress as any)?.formData || {}),
    }));
    
    if ((project as any).canvas_data) {
      localStorage.setItem("multiCanvas", JSON.stringify((project as any).canvas_data));
    }

    navigate("/canvas");
  };

  const handleDeleteProject = async () => {
    if (!deleteDialog.project) return;

    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", deleteDialog.project.id);

      if (error) throw error;

      setProjects(projects.filter(p => p.id !== deleteDialog.project?.id));
      toast({
        title: "Project deleted",
        description: "Your project has been permanently deleted.",
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    } finally {
      setDeleteDialog({ open: false, project: null });
    }
  };

  const handleRenameProject = async () => {
    if (!renameDialog.project || !renameDialog.name.trim()) return;

    try {
      const { error } = await supabase
        .from("projects")
        .update({ name: renameDialog.name.trim() })
        .eq("id", renameDialog.project.id);

      if (error) throw error;

      setProjects(projects.map(p => 
        p.id === renameDialog.project?.id 
          ? { ...p, name: renameDialog.name.trim() }
          : p
      ));
      toast({
        title: "Project renamed",
        description: "Your project has been renamed.",
      });
    } catch (error) {
      console.error("Error renaming project:", error);
      toast({
        title: "Error",
        description: "Failed to rename project",
        variant: "destructive",
      });
    } finally {
      setRenameDialog({ open: false, project: null, name: "" });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const calculateProgress = (project: Project) => {
    const canvasData = project.canvas_data as Record<string, any> | null;
    if (!canvasData) return 0;
    
    const progressFields = [
      'problem', 'targetAudience', 'uniqueValueProposition', 'coreFeatures',
      'userFlow', 'techStack', 'dataRequirements', 'integrations',
      'securityConsiderations', 'pricingModel', 'revenueModel', 'successMetrics',
      'acquisitionChannels', 'growthLoops', 'contentStrategy', 'positioning',
      'marketTrends', 'launchPlan'
    ];
    
    const filledFields = progressFields.filter(field => {
      const value = canvasData[field];
      return typeof value === 'string' && value.trim().length > 0;
    });
    
    return Math.round((filledFields.length / progressFields.length) * 100);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getPhaseFromProgress = (progress: number) => {
    if (progress >= 90) return { phase: "Launch Prep", status: "Deploying", statusColor: "bg-purple-500/10 text-purple-400 border-purple-500/20" };
    if (progress >= 60) return { phase: "Development", status: "On Track", statusColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
    if (progress >= 30) return { phase: "Business Analysis", status: "Planning", statusColor: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
    if (progress > 0) return { phase: "Ideation", status: "In Progress", statusColor: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
    return { phase: "Ideation", status: "Not Started", statusColor: "bg-slate-500/10 text-slate-400 border-slate-500/20" };
  };

  const getProjectIcon = (index: number) => {
    const icons = [Database, Brain, Rocket, Folder];
    const Icon = icons[index % icons.length];
    const colors = ["text-[#00E0FF]", "text-indigo-400", "text-pink-500", "text-emerald-400"];
    return { Icon, color: colors[index % colors.length] };
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.product_idea?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats calculations
  const totalActive = projects.length;
  const inDevelopment = projects.filter(p => {
    const progress = calculateProgress(p);
    return progress >= 30 && progress < 90;
  }).length;
  const conceptPhase = projects.filter(p => calculateProgress(p) < 30).length;
  const completed = projects.filter(p => calculateProgress(p) >= 90).length;

  if (authLoading || loading) {
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

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050505]/90 backdrop-blur-md border-b border-[#1f2937]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <Grid3X3 className="w-6 h-6 text-[#00E0FF] animate-pulse" />
              <span className="font-bold text-xl tracking-wider text-white font-mono">
                LOGOMIR<span className="text-[#00E0FF]">.OS</span>
              </span>
            </Link>
            
            <nav className="hidden md:flex space-x-8">
              <span className="text-[#00E0FF] font-medium text-sm border-b-2 border-[#00E0FF] pb-0.5 cursor-pointer">Projects</span>
              {isAdmin && (
                <button 
                  onClick={() => navigate('/admin-panel')}
                  className="text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-1"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </button>
              )}
              <button 
                onClick={() => navigate('/my-submissions')}
                className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
              >
                Submissions
              </button>
            </nav>
            
            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#00E0FF] rounded-full animate-pulse" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-8 w-8 rounded bg-[#0F1115] border border-slate-700 flex items-center justify-center text-xs font-mono text-white hover:border-[#00E0FF]/50 transition-colors">
                    {user?.email?.slice(0, 2).toUpperCase()}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#0F1115] border-[#1f2937]">
                  <DropdownMenuItem className="text-slate-300 text-xs font-mono">
                    {user?.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-400 hover:text-red-300">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#00E0FF]/10 text-[#00E0FF] border border-[#00E0FF]/20">
                  SYSTEM.DASHBOARD_V2
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
                ACTIVE <span className="text-[#00E0FF]" style={{ textShadow: '0 0 10px rgba(0, 224, 255, 0.5)' }}>INITIATIVES</span>
              </h1>
              <p className="text-slate-400 max-w-xl text-sm font-mono">
                // Monitor architectural progress across all defined entities.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-[#0F1115] border-[#1f2937] text-white placeholder:text-slate-600 font-mono text-sm focus:border-[#00E0FF] w-64"
                />
              </div>
              <button 
                onClick={handleCreateProject}
                className="group flex items-center gap-2 bg-[#00E0FF] hover:bg-cyan-400 text-black px-5 py-2.5 rounded text-sm font-bold transition-all"
                style={{ boxShadow: '0 0 15px -3px rgba(0,224,255,0.3)' }}
              >
                <Plus className="w-4 h-4 font-bold" />
                INITIALIZE NEW PROJECT
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-[#0F1115] border border-[#1f2937] p-4 rounded flex flex-col gap-1 hover:border-[#00E0FF]/50 transition-colors group">
              <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">Total Active</span>
              <span className="text-2xl font-bold text-white group-hover:text-[#00E0FF] transition-colors">
                {String(totalActive).padStart(2, '0')}
              </span>
            </div>
            <div className="bg-[#0F1115] border border-[#1f2937] p-4 rounded flex flex-col gap-1 hover:border-[#00E0FF]/50 transition-colors group">
              <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">In Development</span>
              <span className="text-2xl font-bold text-white group-hover:text-[#00E0FF] transition-colors">
                {String(inDevelopment).padStart(2, '0')}
              </span>
            </div>
            <div className="bg-[#0F1115] border border-[#1f2937] p-4 rounded flex flex-col gap-1 hover:border-[#00E0FF]/50 transition-colors group">
              <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">Concept Phase</span>
              <span className="text-2xl font-bold text-white group-hover:text-[#00E0FF] transition-colors">
                {String(conceptPhase).padStart(2, '0')}
              </span>
            </div>
            <div className="bg-[#0F1115] border border-[#1f2937] p-4 rounded flex flex-col gap-1 hover:border-[#00E0FF]/50 transition-colors group">
              <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">Completed</span>
              <span className="text-2xl font-bold text-white group-hover:text-[#00E0FF] transition-colors">
                {String(completed).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => {
              const progress = calculateProgress(project);
              const { phase, status, statusColor } = getPhaseFromProgress(progress);
              const { Icon, color } = getProjectIcon(index);
              const projectId = `${project.name.slice(0, 2).toUpperCase()}-${new Date(project.created_at).getFullYear()}-${String(index + 1).padStart(3, '0')}`;
              
              return (
                <div 
                  key={project.id}
                  onClick={() => handleOpenProject(project)}
                  className="bg-[#0F1115] border border-[#1f2937] rounded-lg p-6 relative overflow-hidden group hover:border-[#00E0FF]/60 transition-all duration-300 flex flex-col h-full shadow-lg shadow-black/50 cursor-pointer"
                >
                  {/* Hover accent line */}
                  <div className="absolute top-0 left-0 w-[2px] h-0 group-hover:h-full bg-[#00E0FF] transition-all duration-500 ease-in-out" style={{ boxShadow: '0 0 5px #00E0FF, 0 0 20px #00E0FF' }} />
                  
                  {/* Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className={`h-10 w-10 bg-[#161b22] rounded flex items-center justify-center ${color} border border-slate-700/50`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${statusColor} border`}>
                        {status}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <button className="p-1 text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#0F1115] border-[#1f2937]">
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              setRenameDialog({ open: true, project, name: project.name });
                            }}
                            className="text-slate-300"
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteDialog({ open: true, project });
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  {/* Title & ID */}
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#00E0FF] transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-slate-500 mb-6 font-mono text-xs">ID: {projectId}</p>
                  
                  {/* Progress */}
                  <div className="mt-auto space-y-4">
                    <div className="flex justify-between text-xs font-mono uppercase text-slate-400">
                      <span>Phase: {phase}</span>
                      <span className="text-[#00E0FF]">{progress}%</span>
                    </div>
                    <div className="w-full bg-[#1A1D24] rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-[#00E0FF] h-1.5 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${progress}%`,
                          boxShadow: '0 0 10px rgba(0,224,255,0.7)'
                        }}
                      />
                    </div>
                    
                    {/* Footer */}
                    <div className="pt-4 border-t border-[#1f2937] flex justify-between items-center">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                        <Clock className="w-3 h-3" />
                        {formatDate(project.updated_at)}
                      </div>
                      <span className="text-xs text-[#00E0FF] hover:text-white transition-colors flex items-center gap-1">
                        VIEW DETAILS <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* New Project Card */}
            <button 
              onClick={handleCreateProject}
              className="bg-transparent border-2 border-dashed border-[#1f2937] rounded-lg p-6 flex flex-col items-center justify-center gap-3 text-slate-600 hover:border-[#00E0FF] hover:text-[#00E0FF] hover:bg-[#0F1115]/50 transition-all group h-full min-h-[250px]"
            >
              <div className="w-12 h-12 rounded-full bg-[#0F1115] flex items-center justify-center group-hover:bg-[#00E0FF]/10 transition-colors border border-[#1f2937] group-hover:border-[#00E0FF]/30">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold font-mono uppercase tracking-wider">Initialize Module</span>
            </button>

            {/* Empty State */}
            {filteredProjects.length === 0 && searchQuery && (
              <div className="col-span-full bg-[#0F1115] border border-[#1f2937] rounded-lg p-12 text-center">
                <AlertTriangle className="w-12 h-12 mx-auto text-amber-500/50 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Projects Found</h3>
                <p className="text-slate-500 font-mono text-sm">
                  // No entities match query: "{searchQuery}"
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1f2937] py-6 mt-12 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-xs text-slate-500 font-mono">
          <div>LOGOMIR OS [Version 2.4.1]</div>
          <div className="flex gap-4">
            <a className="hover:text-[#00E0FF] transition-colors" href="#">System Status</a>
            <a className="hover:text-[#00E0FF] transition-colors" href="#">Docs</a>
          </div>
        </div>
      </footer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, project: null })}>
        <DialogContent className="bg-[#0F1115] border-[#1f2937]">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Project</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete "{deleteDialog.project?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialog({ open: false, project: null })}
              className="border-[#1f2937] text-slate-300 hover:bg-[#1f2937]"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteProject}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={renameDialog.open} onOpenChange={(open) => setRenameDialog({ open, project: null, name: "" })}>
        <DialogContent className="bg-[#0F1115] border-[#1f2937]">
          <DialogHeader>
            <DialogTitle className="text-white">Rename Project</DialogTitle>
            <DialogDescription className="text-slate-400">
              Enter a new name for your project.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={renameDialog.name}
            onChange={(e) => setRenameDialog({ ...renameDialog, name: e.target.value })}
            placeholder="Project name"
            className="bg-[#050505] border-[#1f2937] text-white placeholder:text-slate-600 font-mono"
          />
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setRenameDialog({ open: false, project: null, name: "" })}
              className="border-[#1f2937] text-slate-300 hover:bg-[#1f2937]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRenameProject} 
              disabled={!renameDialog.name.trim()}
              className="bg-[#00E0FF] text-black hover:bg-cyan-400"
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Projects;
