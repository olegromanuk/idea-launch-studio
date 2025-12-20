import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Sparkles, 
  Plus, 
  Folder, 
  Clock, 
  MoreVertical, 
  Trash2, 
  Edit2,
  LogOut,
  Loader2,
  Search
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
import { Progress } from "@/components/ui/progress";

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
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; project: Project | null }>({
    open: false,
    project: null,
  });
  const [renameDialog, setRenameDialog] = useState<{ open: boolean; project: Project | null; name: string }>({
    open: false,
    project: null,
    name: "",
  });

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
    // Clear any existing localStorage data to start fresh
    localStorage.removeItem("productIdea");
    localStorage.removeItem("multiCanvas");
    localStorage.removeItem("scopeData");
    localStorage.removeItem("completedBlocks");
    localStorage.removeItem("validatedBlocks");
    localStorage.removeItem("currentProjectId");
    navigate("/onboarding");
  };

  const handleOpenProject = async (project: Project) => {
    // Update last accessed
    await supabase
      .from("projects")
      .update({ last_accessed_at: new Date().toISOString() })
      .eq("id", project.id);

    // Store project ID and load data into localStorage for compatibility
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
    const progress = project.progress as Record<string, number> | null;
    if (!progress) return 0;
    const values = Object.values(progress).filter(v => typeof v === "number");
    if (values.length === 0) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
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

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.product_idea?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-subtle">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground">AI Product Studio</h1>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Your Projects</h2>
            <p className="text-muted-foreground">
              {projects.length} project{projects.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={handleCreateProject} className="gradient-primary text-white hover-glow shrink-0">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <Card className="p-12 text-center glass">
            <Folder className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery ? "No projects found" : "No projects yet"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery 
                ? "Try a different search term" 
                : "Create your first product project to get started"}
            </p>
            {!searchQuery && (
              <Button onClick={handleCreateProject} className="gradient-primary text-white hover-glow">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <Card 
                key={project.id} 
                className="p-5 glass hover-lift cursor-pointer group transition-all"
                onClick={() => handleOpenProject(project)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {project.product_idea || "No description"}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        setRenameDialog({ open: true, project, name: project.name });
                      }}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteDialog({ open: true, project });
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{calculateProgress(project)}%</span>
                  </div>
                  <Progress value={calculateProgress(project)} className="h-1.5" />
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  Updated {formatDate(project.updated_at)}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, project: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteDialog.project?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, project: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={renameDialog.open} onOpenChange={(open) => setRenameDialog({ open, project: null, name: "" })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
            <DialogDescription>
              Enter a new name for your project.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={renameDialog.name}
            onChange={(e) => setRenameDialog({ ...renameDialog, name: e.target.value })}
            placeholder="Project name"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialog({ open: false, project: null, name: "" })}>
              Cancel
            </Button>
            <Button onClick={handleRenameProject} disabled={!renameDialog.name.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Projects;
