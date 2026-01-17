import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  backlog: { label: "Backlog", color: "bg-slate-800 text-slate-400" },
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
      <div className="relative bg-[#0A0A0A] border border-white/[0.08] overflow-hidden">
        {/* Blueprint corner accents */}
        <div className="absolute -top-px -left-px w-2 h-2 border-t-2 border-l-2 border-[#00f0ff] opacity-70" />
        <div className="absolute -bottom-px -right-px w-2 h-2 border-b-2 border-r-2 border-[#00f0ff] opacity-70" />
        
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
            <h2 className="font-mono text-xs text-[#00f0ff] uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
              User_Stories
            </h2>
            <User className="w-5 h-5 text-slate-700" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 bg-[#0F0F0F] border-l-2 border-[#00f0ff]">
              <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Total Stories</span>
              <span className="text-2xl font-bold text-white tracking-tight font-mono">{stories.length}</span>
            </div>
            <div className="p-3 bg-[#0F0F0F] border-l-2 border-slate-800 hover:border-[#00f0ff] transition-colors">
              <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Completed</span>
              <span className="text-2xl font-bold text-white tracking-tight font-mono">{completedCount}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(!isAdding)}
              className="flex-1 font-mono text-xs uppercase tracking-wider border-white/10 hover:border-[#00f0ff]/30 hover:text-[#00f0ff] bg-transparent"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Story
            </Button>
            <Button
              size="sm"
              onClick={onAIGenerate}
              disabled={isGenerating}
              className="flex-1 font-mono text-xs uppercase tracking-wider bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30 hover:border-[#00f0ff]/50 shadow-[0_0_10px_rgba(0,240,255,0.1)] hover:shadow-[0_0_20px_rgba(0,240,255,0.2)]"
            >
              <Sparkles className={cn("w-4 h-4 mr-1.5", isGenerating && "animate-spin")} />
              {isGenerating ? "Generating..." : "AI Generate"}
            </Button>
          </div>

          {/* Add new story form */}
          {isAdding && (
            <div className="mb-6 p-4 bg-[#0F0F0F] border border-white/10 animate-in fade-in-0 slide-in-from-top-2">
              <p className="text-xs font-mono text-slate-400 mb-3 uppercase tracking-wider">
                As a <span className="text-[#00f0ff]">[persona]</span>, I want to <span className="text-[#00f0ff]">[action]</span>, so that <span className="text-[#00f0ff]">[benefit]</span>
              </p>
              <div className="grid gap-3">
                <Input
                  placeholder="Who is the user? (e.g., busy professional)"
                  value={newStory.persona}
                  onChange={(e) => setNewStory({ ...newStory, persona: e.target.value })}
                  className="bg-[#0A0A0A] border-white/10 focus:border-[#00f0ff]/50 font-mono text-sm"
                />
                <Input
                  placeholder="What do they want to do?"
                  value={newStory.action}
                  onChange={(e) => setNewStory({ ...newStory, action: e.target.value })}
                  className="bg-[#0A0A0A] border-white/10 focus:border-[#00f0ff]/50 font-mono text-sm"
                />
                <Input
                  placeholder="What's the benefit?"
                  value={newStory.benefit}
                  onChange={(e) => setNewStory({ ...newStory, benefit: e.target.value })}
                  className="bg-[#0A0A0A] border-white/10 focus:border-[#00f0ff]/50 font-mono text-sm"
                />
                <div className="flex gap-2">
                  {(["high", "medium", "low"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setNewStory({ ...newStory, priority: p })}
                      className={cn(
                        "flex-1 py-2 text-xs font-mono uppercase tracking-wider border transition-all",
                        newStory.priority === p 
                          ? "border-[#00f0ff]/50 bg-[#00f0ff]/10 text-[#00f0ff]"
                          : "border-white/10 text-slate-500 hover:border-white/20"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsAdding(false)}
                    className="font-mono text-xs uppercase text-slate-500"
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={addStory}
                    className="font-mono text-xs uppercase bg-[#00f0ff] text-black hover:bg-[#00f0ff]/90"
                  >
                    Add Story
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Stories list */}
          <div className="space-y-2">
            {stories.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-white/10 bg-[#0F0F0F]">
                <User className="w-10 h-10 mx-auto mb-3 text-slate-700" />
                <p className="text-sm text-slate-500 font-mono">NO_STORIES</p>
                <p className="text-xs text-slate-600 mt-1 font-mono">Add manually or generate with AI</p>
              </div>
            ) : (
              stories.map((story, index) => (
                <div
                  key={story.id}
                  onClick={() => handleStoryClick(story)}
                  className={cn(
                    "group relative p-4 border transition-all duration-300 cursor-pointer",
                    story.completed 
                      ? "bg-green-500/5 border-green-500/20" 
                      : "bg-[#0F0F0F] border-white/5 hover:border-[#00f0ff]/30"
                  )}
                >
                  {/* Hover glow effect */}
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00f0ff]/30 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                  
                  <div className="flex items-start gap-3">
                    <button
                      onClick={(e) => toggleComplete(story.id, e)}
                      className="mt-0.5 flex-shrink-0"
                    >
                      {story.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600 hover:text-[#00f0ff]" />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-mono text-slate-600">#{String(index + 1).padStart(2, '0')}</span>
                        <span className={cn(
                          "px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border",
                          story.priority === "high" ? "border-red-500/30 text-red-500 bg-red-500/10" :
                          story.priority === "medium" ? "border-amber-500/30 text-amber-500 bg-amber-500/10" :
                          "border-green-500/30 text-green-500 bg-green-500/10"
                        )}>
                          {story.priority}
                        </span>
                        {story.status && story.status !== "backlog" && (
                          <span className={cn("px-2 py-0.5 text-[10px] font-mono uppercase", STATUS_CONFIG[story.status]?.color)}>
                            {STATUS_CONFIG[story.status]?.label}
                          </span>
                        )}
                      </div>
                      <p className={cn(
                        "text-sm leading-relaxed",
                        story.completed && "line-through text-slate-500"
                      )}>
                        <span className="text-slate-400">As a </span>
                        <span className="font-medium text-[#00f0ff]">{story.persona}</span>
                        <span className="text-slate-400">, I want to </span>
                        <span className="font-medium text-white">{story.action}</span>
                        <span className="text-slate-400">, so that </span>
                        <span className="font-medium text-purple-400">{story.benefit}</span>
                      </p>
                      
                      {story.acceptanceCriteria && story.acceptanceCriteria.length > 0 && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                          <CheckCircle2 className="w-3 h-3" />
                          <span className="font-mono">
                            {story.acceptanceCriteria.filter(c => c.completed).length}/{story.acceptanceCriteria.length} criteria
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-[#00f0ff]"
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
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => removeStory(story.id, e)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

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
