import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProject, Project } from '@/hooks/useProject';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sparkles,
  Plus,
  FolderOpen,
  Clock,
  MoreVertical,
  Trash2,
  LogOut,
  Loader2,
  User,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Projects = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { projects, loading, createProject, deleteProject } = useProject();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    setCreating(true);
    const project = await createProject({ name: newProjectName });
    setCreating(false);

    if (project) {
      setIsCreateDialogOpen(false);
      setNewProjectName('');
      navigate(`/onboarding/${project.id}`);
    }
  };

  const handleProjectClick = (project: Project) => {
    // If project has canvas data, go to canvas, otherwise go to onboarding
    const hasCanvasData = Object.values(project.canvas_data || {}).some(
      (v) => v && v.trim().length > 0
    );
    
    if (hasCanvasData || project.product_idea) {
      navigate(`/canvas/${project.id}`);
    } else {
      navigate(`/onboarding/${project.id}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const calculateProgress = (project: Project) => {
    const canvasData = project.canvas_data || {};
    const filled = Object.values(canvasData).filter(
      (v) => v && v.trim().length > 0
    ).length;
    return Math.round((filled / 18) * 100); // 18 total canvas sections
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            {user
              ? `Welcome back${profile?.display_name ? `, ${profile.display_name}` : ''}! Restoring your projects...`
              : 'Loading...'}
          </p>
        </div>
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
                <h1 className="font-bold text-foreground">My Projects</h1>
                <p className="text-sm text-muted-foreground">
                  {projects.length} project{projects.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {profile?.display_name || user?.email}
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Create Project Button */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mb-8 gradient-primary text-white hover-glow">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Project name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                />
                <Button
                  onClick={handleCreateProject}
                  disabled={!newProjectName.trim() || creating}
                  className="w-full gradient-primary text-white"
                >
                  {creating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Create Project'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <div className="text-center py-16">
              <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
              <p className="text-muted-foreground mb-6">
                Create your first project to start building
              </p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="gradient-primary text-white hover-glow"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => {
                const progress = calculateProgress(project);
                return (
                  <Card
                    key={project.id}
                    className="p-6 glass hover-lift cursor-pointer group relative"
                    onClick={() => handleProjectClick(project)}
                  >
                    <div className="absolute top-4 right-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteProject(project.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mb-4">
                      <h3 className="font-semibold text-lg mb-1 pr-8">
                        {project.name}
                      </h3>
                      {project.product_idea && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {project.product_idea}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>
                          {project.last_accessed_at
                            ? formatDistanceToNow(
                                new Date(project.last_accessed_at),
                                { addSuffix: true }
                              )
                            : 'Never accessed'}
                        </span>
                      </div>
                      <span className="text-primary font-medium">
                        {progress}%
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-primary transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Projects;
