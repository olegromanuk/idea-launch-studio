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
  // New detailed fields
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
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <SheetTitle className="text-left">User Story Details</SheetTitle>
              <p className="text-sm text-muted-foreground">Edit story properties and acceptance criteria</p>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* User Story Format */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/5 to-purple-500/5 border border-violet-500/20">
            <p className="text-sm font-medium mb-3">
              As a <span className="text-violet-500">{editedStory.persona}</span>, 
              I want to <span className="text-foreground">{editedStory.action}</span>, 
              so that <span className="text-purple-500">{editedStory.benefit}</span>
            </p>
          </div>

          {/* Basic Info */}
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Persona</label>
              <Input
                value={editedStory.persona}
                onChange={(e) => setEditedStory({ ...editedStory, persona: e.target.value })}
                placeholder="Who is the user?"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Action</label>
              <Input
                value={editedStory.action}
                onChange={(e) => setEditedStory({ ...editedStory, action: e.target.value })}
                placeholder="What do they want to do?"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Benefit</label>
              <Input
                value={editedStory.benefit}
                onChange={(e) => setEditedStory({ ...editedStory, benefit: e.target.value })}
                placeholder="What's the benefit?"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <Textarea
              value={editedStory.description}
              onChange={(e) => setEditedStory({ ...editedStory, description: e.target.value })}
              placeholder="Add additional context or details..."
              rows={3}
            />
          </div>

          {/* Status & Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Target className="w-4 h-4" />
                Status
              </label>
              <Select
                value={editedStory.status}
                onValueChange={(value) => setEditedStory({ ...editedStory, status: value as UserStory["status"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div className={cn("px-2 py-0.5 rounded text-xs", config.color)}>
                          {config.label}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Priority
              </label>
              <Select
                value={editedStory.priority}
                onValueChange={(value) => setEditedStory({ ...editedStory, priority: value as UserStory["priority"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div className={cn("px-2 py-0.5 rounded text-xs border", config.color)}>
                          {config.label}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Story Points */}
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Clock className="w-4 h-4" />
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
                    "w-10 h-10",
                    editedStory.storyPoints === points && "bg-primary text-primary-foreground"
                  )}
                >
                  {points}
                </Button>
              ))}
            </div>
          </div>

          {/* Labels */}
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Labels
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {editedStory.labels?.map((label) => (
                <Badge
                  key={label}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive/10"
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
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLabel())}
              />
              <Button variant="outline" size="icon" onClick={addLabel}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Acceptance Criteria */}
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Acceptance Criteria
              </span>
              <span className="text-xs text-muted-foreground">
                {completedCriteria}/{totalCriteria} completed
              </span>
            </label>
            
            <div className="space-y-2 mb-3">
              {editedStory.acceptanceCriteria?.map((criteria) => (
                <div
                  key={criteria.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                    criteria.completed ? "bg-success/5 border-success/30" : "bg-card"
                  )}
                >
                  <Checkbox
                    checked={criteria.completed}
                    onCheckedChange={() => toggleCriteria(criteria.id)}
                    className="mt-0.5"
                  />
                  <p className={cn(
                    "flex-1 text-sm",
                    criteria.completed && "line-through text-muted-foreground"
                  )}>
                    {criteria.text}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
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
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAcceptanceCriteria())}
              />
              <Button variant="outline" size="icon" onClick={addAcceptanceCriteria}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
