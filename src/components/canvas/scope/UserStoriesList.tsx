import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  User,
  CheckCircle2,
  Circle,
  ChevronRight,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserStoryDetailDrawer, UserStory, AcceptanceCriteria } from "./UserStoryDetailDrawer";

// Re-export UserStory for use in other components
export type { UserStory, AcceptanceCriteria };

interface UserStoriesListProps {
  stories: UserStory[];
  onChange: (stories: UserStory[]) => void;
  onAIGenerate: () => void;
  isGenerating: boolean;
  projectContext?: {
    idea?: string;
    audience?: string;
    problem?: string;
  };
}

const PRIORITY_CONFIG = {
  high: { label: "High", color: "bg-red-500/10 text-red-500 border-red-500/30" },
  medium: { label: "Medium", color: "bg-amber-500/10 text-amber-500 border-amber-500/30" },
  low: { label: "Low", color: "bg-green-500/10 text-green-500 border-green-500/30" },
};

const STATUS_CONFIG = {
  backlog: { label: "Backlog", color: "bg-muted text-muted-foreground" },
  ready: { label: "Ready", color: "bg-blue-500/10 text-blue-500" },
  "in-progress": { label: "In Progress", color: "bg-amber-500/10 text-amber-500" },
  review: { label: "Review", color: "bg-purple-500/10 text-purple-500" },
  done: { label: "Done", color: "bg-green-500/10 text-green-500" },
};

export const UserStoriesList = ({ 
  stories, 
  onChange, 
  onAIGenerate, 
  isGenerating,
  projectContext 
}: UserStoriesListProps) => {
  const [selectedStory, setSelectedStory] = useState<UserStory | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newStory, setNewStory] = useState<Partial<UserStory>>({
    persona: "",
    action: "",
    benefit: "",
    priority: "medium",
  });

  const addStory = () => {
    if (!newStory.persona || !newStory.action || !newStory.benefit) return;
    
    const story: UserStory = {
      id: crypto.randomUUID(),
      persona: newStory.persona,
      action: newStory.action,
      benefit: newStory.benefit,
      priority: newStory.priority || "medium",
      completed: false,
      status: "backlog",
      acceptanceCriteria: [],
      labels: [],
      storyPoints: 0,
    };
    
    onChange([...stories, story]);
    setNewStory({ persona: "", action: "", benefit: "", priority: "medium" });
    setIsAdding(false);
  };

  const removeStory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(stories.filter(s => s.id !== id));
  };

  const toggleComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(stories.map(s => 
      s.id === id ? { ...s, completed: !s.completed, status: s.completed ? "backlog" : "done" } : s
    ));
  };

  const handleStoryClick = (story: UserStory) => {
    setSelectedStory(story);
    setIsDrawerOpen(true);
  };

  const handleSaveStory = (updatedStory: UserStory) => {
    onChange(stories.map(s => s.id === updatedStory.id ? updatedStory : s));
    setSelectedStory(null);
  };

  const completedCount = stories.filter(s => s.completed).length;

  return (
    <>
      <Card className="relative overflow-hidden">
        {/* Header accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
        
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">User Stories</h3>
                <p className="text-sm text-muted-foreground">
                  {stories.length} stories • {completedCount} completed
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAdding(!isAdding)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
              <Button
                size="sm"
                onClick={onAIGenerate}
                disabled={isGenerating}
                className="bg-gradient-to-r from-violet-500 to-purple-500 text-white"
              >
                <Sparkles className={cn("w-4 h-4 mr-1", isGenerating && "animate-spin")} />
                {isGenerating ? "Adding..." : "AI Generate"}
              </Button>
            </div>
          </div>

          {/* Add new story form */}
          {isAdding && (
            <div className="mb-6 p-4 rounded-xl bg-muted/50 border border-border animate-fade-in">
              <p className="text-sm font-medium text-foreground mb-3">
                As a <span className="text-violet-500">[persona]</span>, I want to <span className="text-violet-500">[action]</span>, so that <span className="text-violet-500">[benefit]</span>
              </p>
              <div className="grid gap-3">
                <Input
                  placeholder="Who is the user? (e.g., busy professional)"
                  value={newStory.persona}
                  onChange={(e) => setNewStory({ ...newStory, persona: e.target.value })}
                />
                <Input
                  placeholder="What do they want to do? (e.g., quickly schedule meetings)"
                  value={newStory.action}
                  onChange={(e) => setNewStory({ ...newStory, action: e.target.value })}
                />
                <Input
                  placeholder="What's the benefit? (e.g., I can save time)"
                  value={newStory.benefit}
                  onChange={(e) => setNewStory({ ...newStory, benefit: e.target.value })}
                />
                <div className="flex gap-2">
                  {(["high", "medium", "low"] as const).map((p) => (
                    <Button
                      key={p}
                      variant="outline"
                      size="sm"
                      onClick={() => setNewStory({ ...newStory, priority: p })}
                      className={cn(
                        "flex-1",
                        newStory.priority === p && PRIORITY_CONFIG[p].color
                      )}
                    >
                      {PRIORITY_CONFIG[p].label}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={addStory}>
                    Add Story
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Stories list */}
          <div className="space-y-3">
            {stories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No user stories yet</p>
                <p className="text-xs mt-1">Add manually or generate with AI</p>
              </div>
            ) : (
              stories.map((story, index) => (
                <div
                  key={story.id}
                  onClick={() => handleStoryClick(story)}
                  className={cn(
                    "group relative rounded-xl border transition-all duration-200 cursor-pointer",
                    story.completed 
                      ? "bg-success/5 border-success/30" 
                      : "bg-card hover:shadow-md hover:border-primary/30"
                  )}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={(e) => toggleComplete(story.id, e)}
                        className="mt-1 flex-shrink-0"
                      >
                        {story.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
                          <Badge variant="outline" className={cn("text-xs", PRIORITY_CONFIG[story.priority].color)}>
                            {PRIORITY_CONFIG[story.priority].label}
                          </Badge>
                          {story.status && story.status !== "backlog" && (
                            <Badge variant="secondary" className={cn("text-xs", STATUS_CONFIG[story.status]?.color)}>
                              {STATUS_CONFIG[story.status]?.label}
                            </Badge>
                          )}
                          {story.storyPoints && story.storyPoints > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {story.storyPoints} pts
                            </Badge>
                          )}
                        </div>
                        <p className={cn(
                          "text-sm",
                          story.completed && "line-through text-muted-foreground"
                        )}>
                          As a <span className="font-medium text-violet-500">{story.persona}</span>, 
                          I want to <span className="font-medium text-foreground">{story.action}</span>, 
                          so that <span className="font-medium text-purple-500">{story.benefit}</span>
                        </p>
                        
                        {/* Acceptance criteria progress */}
                        {story.acceptanceCriteria && story.acceptanceCriteria.length > 0 && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>
                              {story.acceptanceCriteria.filter(c => c.completed).length}/{story.acceptanceCriteria.length} criteria
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStoryClick(story);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => removeStory(story.id, e)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>

      {/* Detail Drawer */}
      <UserStoryDetailDrawer
        story={selectedStory}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSave={handleSaveStory}
      />
    </>
  );
};
