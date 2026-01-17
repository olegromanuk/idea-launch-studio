import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  User, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2,
  Target,
  Tag,
  Clock,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AcceptanceCriteria {
  id: string;
  text: string;
  completed: boolean;
}

export interface UserStory {
  id: string;
  persona: string;
  action: string;
  benefit: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  description?: string;
  acceptanceCriteria?: AcceptanceCriteria[];
  status?: "backlog" | "ready" | "in-progress" | "review" | "done";
  storyPoints?: number;
  labels?: string[];
}

interface UserStoryDetailDrawerProps {
  story: UserStory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (story: UserStory) => void;
}

const PRIORITY_CONFIG = {
  high: { label: "HIGH", color: "bg-red-500/20 text-red-400 border-red-500/40" },
  medium: { label: "MEDIUM", color: "bg-amber-500/20 text-amber-400 border-amber-500/40" },
  low: { label: "LOW", color: "bg-green-500/20 text-green-400 border-green-500/40" },
};

const STATUS_CONFIG = {
  backlog: { label: "BACKLOG", color: "bg-gray-500/20 text-gray-400 border-gray-500/40" },
  ready: { label: "READY", color: "bg-blue-500/20 text-blue-400 border-blue-500/40" },
  "in-progress": { label: "IN PROGRESS", color: "bg-amber-500/20 text-amber-400 border-amber-500/40" },
  review: { label: "REVIEW", color: "bg-purple-500/20 text-purple-400 border-purple-500/40" },
  done: { label: "DONE", color: "bg-green-500/20 text-green-400 border-green-500/40" },
};

export const UserStoryDetailDrawer = ({
  story,
  open,
  onOpenChange,
  onSave,
}: UserStoryDetailDrawerProps) => {
  const [editedStory, setEditedStory] = useState<UserStory | null>(null);
  const [newCriteriaText, setNewCriteriaText] = useState("");
  const [newLabel, setNewLabel] = useState("");

  // Sync when story changes
  useState(() => {
    if (story) {
      setEditedStory({
        ...story,
        acceptanceCriteria: story.acceptanceCriteria || [],
        status: story.status || "backlog",
        storyPoints: story.storyPoints || 0,
        labels: story.labels || [],
        description: story.description || "",
      });
    }
  });

  // Update editedStory when story prop changes
  if (story && (!editedStory || editedStory.id !== story.id)) {
    setEditedStory({
      ...story,
      acceptanceCriteria: story.acceptanceCriteria || [],
      status: story.status || "backlog",
      storyPoints: story.storyPoints || 0,
      labels: story.labels || [],
      description: story.description || "",
    });
  }

  if (!editedStory) return null;

  const handleSave = () => {
    onSave(editedStory);
    onOpenChange(false);
  };

  const addAcceptanceCriteria = () => {
    if (!newCriteriaText.trim()) return;
    const newCriteria: AcceptanceCriteria = {
      id: crypto.randomUUID(),
      text: newCriteriaText.trim(),
      completed: false,
    };
    setEditedStory({
      ...editedStory,
      acceptanceCriteria: [...(editedStory.acceptanceCriteria || []), newCriteria],
    });
    setNewCriteriaText("");
  };

  const toggleCriteria = (id: string) => {
    setEditedStory({
      ...editedStory,
      acceptanceCriteria: editedStory.acceptanceCriteria?.map((c) =>
        c.id === id ? { ...c, completed: !c.completed } : c
      ),
    });
  };

  const removeCriteria = (id: string) => {
    setEditedStory({
      ...editedStory,
      acceptanceCriteria: editedStory.acceptanceCriteria?.filter((c) => c.id !== id),
    });
  };

  const addLabel = () => {
    if (!newLabel.trim()) return;
    if (editedStory.labels?.includes(newLabel.trim())) return;
    setEditedStory({
      ...editedStory,
      labels: [...(editedStory.labels || []), newLabel.trim()],
    });
    setNewLabel("");
  };

  const removeLabel = (label: string) => {
    setEditedStory({
      ...editedStory,
      labels: editedStory.labels?.filter((l) => l !== label),
    });
  };

  const completedCriteria = editedStory.acceptanceCriteria?.filter((c) => c.completed).length || 0;
  const totalCriteria = editedStory.acceptanceCriteria?.length || 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-[hsl(222,47%,8%)] border-l border-cyan-500/30">
        {/* Blueprint corner accents */}
        <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-cyan-500/50" />
        <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-cyan-500/50" />
        <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-cyan-500/50" />
        <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-cyan-500/50" />

        <SheetHeader className="mb-6 pt-4">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <User className="w-6 h-6 text-white" />
              <div className="absolute inset-0 rounded-xl border border-violet-400/30" />
            </div>
            <div>
              <SheetTitle className="text-left text-white font-mono tracking-wide text-lg">
                USER STORY DETAILS
              </SheetTitle>
              <p className="text-sm text-cyan-400/70 font-mono">Edit story properties and acceptance criteria</p>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* User Story Format Card */}
          <div className="relative p-4 rounded-xl bg-[hsl(222,47%,6%)] border border-cyan-500/20">
            <div className="absolute top-2 left-2 w-3 h-3 border-l border-t border-cyan-500/40" />
            <div className="absolute top-2 right-2 w-3 h-3 border-r border-t border-cyan-500/40" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-l border-b border-cyan-500/40" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-r border-b border-cyan-500/40" />
            
            <p className="text-sm font-mono text-gray-300">
              As a <span className="text-violet-400 font-semibold">{editedStory.persona}</span>, 
              I want to <span className="text-white font-semibold">{editedStory.action}</span>, 
              so that <span className="text-purple-400 font-semibold">{editedStory.benefit}</span>
            </p>
          </div>

          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono text-cyan-400/70 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              Basic Information
            </h3>
            
            <div className="grid gap-4">
              <div>
                <label className="text-xs font-mono text-gray-400 mb-2 block uppercase tracking-wider">Persona</label>
                <Input
                  value={editedStory.persona}
                  onChange={(e) => setEditedStory({ ...editedStory, persona: e.target.value })}
                  placeholder="Who is the user?"
                  className="bg-[hsl(222,47%,6%)] border-cyan-500/20 text-white font-mono placeholder:text-gray-600 focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-gray-400 mb-2 block uppercase tracking-wider">Action</label>
                <Input
                  value={editedStory.action}
                  onChange={(e) => setEditedStory({ ...editedStory, action: e.target.value })}
                  placeholder="What do they want to do?"
                  className="bg-[hsl(222,47%,6%)] border-cyan-500/20 text-white font-mono placeholder:text-gray-600 focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-gray-400 mb-2 block uppercase tracking-wider">Benefit</label>
                <Input
                  value={editedStory.benefit}
                  onChange={(e) => setEditedStory({ ...editedStory, benefit: e.target.value })}
                  placeholder="What's the benefit?"
                  className="bg-[hsl(222,47%,6%)] border-cyan-500/20 text-white font-mono placeholder:text-gray-600 focus:border-cyan-500/50"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-mono text-gray-400 mb-2 block uppercase tracking-wider">Description</label>
            <Textarea
              value={editedStory.description}
              onChange={(e) => setEditedStory({ ...editedStory, description: e.target.value })}
              placeholder="Add additional context or details..."
              rows={3}
              className="bg-[hsl(222,47%,6%)] border-cyan-500/20 text-white font-mono placeholder:text-gray-600 focus:border-cyan-500/50 resize-none"
            />
          </div>

          {/* Status & Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-gray-400 mb-2 flex items-center gap-2 uppercase tracking-wider">
                <Target className="w-3 h-3 text-cyan-400" />
                Status
              </label>
              <Select
                value={editedStory.status}
                onValueChange={(value) => setEditedStory({ ...editedStory, status: value as UserStory["status"] })}
              >
                <SelectTrigger className="bg-[hsl(222,47%,6%)] border-cyan-500/20 text-white font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(222,47%,6%)] border-cyan-500/30">
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key} className="font-mono text-white hover:bg-cyan-500/10">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn("text-xs font-mono border", config.color)}>
                          {config.label}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-mono text-gray-400 mb-2 flex items-center gap-2 uppercase tracking-wider">
                <AlertCircle className="w-3 h-3 text-cyan-400" />
                Priority
              </label>
              <Select
                value={editedStory.priority}
                onValueChange={(value) => setEditedStory({ ...editedStory, priority: value as UserStory["priority"] })}
              >
                <SelectTrigger className="bg-[hsl(222,47%,6%)] border-cyan-500/20 text-white font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(222,47%,6%)] border-cyan-500/30">
                  {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key} className="font-mono text-white hover:bg-cyan-500/10">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn("text-xs font-mono border", config.color)}>
                          {config.label}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Story Points */}
          <div>
            <label className="text-xs font-mono text-gray-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
              <Clock className="w-3 h-3 text-cyan-400" />
              Story Points
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 5, 8, 13].map((points) => (
                <Button
                  key={points}
                  variant="outline"
                  size="sm"
                  onClick={() => setEditedStory({ ...editedStory, storyPoints: points })}
                  className={cn(
                    "w-10 h-10 font-mono font-bold transition-all duration-200",
                    editedStory.storyPoints === points 
                      ? "bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-lg shadow-cyan-500/20" 
                      : "bg-[hsl(222,47%,6%)] border-cyan-500/20 text-gray-400 hover:border-cyan-500/40 hover:text-white"
                  )}
                >
                  {points}
                </Button>
              ))}
            </div>
          </div>

          {/* Labels */}
          <div>
            <label className="text-xs font-mono text-gray-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
              <Tag className="w-3 h-3 text-cyan-400" />
              Labels
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {editedStory.labels?.map((label) => (
                <Badge
                  key={label}
                  variant="outline"
                  className="cursor-pointer font-mono text-xs bg-violet-500/10 border-violet-500/30 text-violet-400 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400 transition-all"
                  onClick={() => removeLabel(label)}
                >
                  {label} ×
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Add a label..."
                className="bg-[hsl(222,47%,6%)] border-cyan-500/20 text-white font-mono placeholder:text-gray-600 focus:border-cyan-500/50"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLabel())}
              />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={addLabel}
                className="bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Acceptance Criteria */}
          <div>
            <label className="text-xs font-mono text-gray-400 mb-3 flex items-center justify-between uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                Acceptance Criteria
              </span>
              <span className="text-cyan-400 normal-case">
                {completedCriteria}/{totalCriteria} completed
              </span>
            </label>
            
            <div className="space-y-2 mb-3">
              {editedStory.acceptanceCriteria?.map((criteria) => (
                <div
                  key={criteria.id}
                  className={cn(
                    "relative flex items-start gap-3 p-3 rounded-lg border transition-all duration-200",
                    criteria.completed 
                      ? "bg-green-500/5 border-green-500/30" 
                      : "bg-[hsl(222,47%,6%)] border-cyan-500/20"
                  )}
                >
                  <Checkbox
                    checked={criteria.completed}
                    onCheckedChange={() => toggleCriteria(criteria.id)}
                    className="mt-0.5 border-cyan-500/40 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                  />
                  <p className={cn(
                    "flex-1 text-sm font-mono",
                    criteria.completed ? "line-through text-gray-500" : "text-gray-300"
                  )}>
                    {criteria.text}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => removeCriteria(criteria.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newCriteriaText}
                onChange={(e) => setNewCriteriaText(e.target.value)}
                placeholder="Add acceptance criteria..."
                className="bg-[hsl(222,47%,6%)] border-cyan-500/20 text-white font-mono placeholder:text-gray-600 focus:border-cyan-500/50"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAcceptanceCriteria())}
              />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={addAcceptanceCriteria}
                className="bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-cyan-500/20">
            <Button 
              variant="outline" 
              className="flex-1 font-mono bg-transparent border-gray-600 text-gray-400 hover:bg-white/5 hover:text-white hover:border-gray-500" 
              onClick={() => onOpenChange(false)}
            >
              CANCEL
            </Button>
            <Button 
              className="flex-1 font-mono bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/20" 
              onClick={handleSave}
            >
              SAVE CHANGES
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
