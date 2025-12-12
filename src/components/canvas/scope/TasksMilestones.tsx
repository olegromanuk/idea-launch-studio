import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Plus, 
  Trash2,
  ListTodo,
  Flag,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  GripVertical
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  milestone?: string;
  status: "todo" | "in-progress" | "done";
  priority: "high" | "medium" | "low";
}

interface Milestone {
  id: string;
  name: string;
  tasks: Task[];
  collapsed: boolean;
}

interface TasksMilestonesProps {
  milestones: Milestone[];
  onChange: (milestones: Milestone[]) => void;
  onAIGenerate: () => void;
  isGenerating: boolean;
}

const PRIORITY_CONFIG = {
  high: { color: "text-red-500", bg: "bg-red-500" },
  medium: { color: "text-amber-500", bg: "bg-amber-500" },
  low: { color: "text-green-500", bg: "bg-green-500" },
};

const STATUS_CONFIG = {
  todo: { label: "To Do", color: "bg-muted text-muted-foreground" },
  "in-progress": { label: "In Progress", color: "bg-blue-500/10 text-blue-500" },
  done: { label: "Done", color: "bg-success/10 text-success" },
};

export const TasksMilestones = ({ 
  milestones, 
  onChange, 
  onAIGenerate, 
  isGenerating 
}: TasksMilestonesProps) => {
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [addingTaskTo, setAddingTaskTo] = useState<string | null>(null);
  const [newMilestoneName, setNewMilestoneName] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const addMilestone = () => {
    if (!newMilestoneName.trim()) return;
    
    const milestone: Milestone = {
      id: crypto.randomUUID(),
      name: newMilestoneName,
      tasks: [],
      collapsed: false,
    };
    
    onChange([...milestones, milestone]);
    setNewMilestoneName("");
    setIsAddingMilestone(false);
  };

  const removeMilestone = (id: string) => {
    onChange(milestones.filter(m => m.id !== id));
  };

  const toggleMilestone = (id: string) => {
    onChange(milestones.map(m => 
      m.id === id ? { ...m, collapsed: !m.collapsed } : m
    ));
  };

  const addTask = (milestoneId: string) => {
    if (!newTaskTitle.trim()) return;
    
    const task: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle,
      status: "todo",
      priority: "medium",
    };
    
    onChange(milestones.map(m => 
      m.id === milestoneId ? { ...m, tasks: [...m.tasks, task] } : m
    ));
    setNewTaskTitle("");
    setAddingTaskTo(null);
  };

  const removeTask = (milestoneId: string, taskId: string) => {
    onChange(milestones.map(m => 
      m.id === milestoneId ? { ...m, tasks: m.tasks.filter(t => t.id !== taskId) } : m
    ));
  };

  const updateTaskStatus = (milestoneId: string, taskId: string, status: Task["status"]) => {
    onChange(milestones.map(m => 
      m.id === milestoneId 
        ? { ...m, tasks: m.tasks.map(t => t.id === taskId ? { ...t, status } : t) } 
        : m
    ));
  };

  const updateTaskPriority = (milestoneId: string, taskId: string, priority: Task["priority"]) => {
    onChange(milestones.map(m => 
      m.id === milestoneId 
        ? { ...m, tasks: m.tasks.map(t => t.id === taskId ? { ...t, priority } : t) } 
        : m
    ));
  };

  const totalTasks = milestones.reduce((acc, m) => acc + m.tasks.length, 0);
  const doneTasks = milestones.reduce((acc, m) => acc + m.tasks.filter(t => t.status === "done").length, 0);

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ListTodo className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">Tasks & Milestones</h3>
              <p className="text-sm text-muted-foreground">
                {milestones.length} milestones • {doneTasks}/{totalTasks} tasks done
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingMilestone(!isAddingMilestone)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Milestone
            </Button>
            <Button
              size="sm"
              onClick={onAIGenerate}
              disabled={isGenerating}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
            >
              <Sparkles className={cn("w-4 h-4 mr-1", isGenerating && "animate-spin")} />
              {isGenerating ? "Generating..." : "AI Generate"}
            </Button>
          </div>
        </div>

        {/* Add milestone form */}
        {isAddingMilestone && (
          <div className="mb-6 p-4 rounded-xl bg-muted/50 border border-border animate-fade-in">
            <div className="flex gap-2">
              <Input
                placeholder="Milestone name (e.g., Phase 1: MVP)"
                value={newMilestoneName}
                onChange={(e) => setNewMilestoneName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addMilestone()}
                className="flex-1"
              />
              <Button size="sm" onClick={addMilestone}>Add</Button>
              <Button variant="ghost" size="sm" onClick={() => setIsAddingMilestone(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Milestones list */}
        <div className="space-y-4">
          {milestones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-xl">
              <Flag className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No milestones yet</p>
              <p className="text-xs mt-1">Add milestones to organize your tasks</p>
            </div>
          ) : (
            milestones.map((milestone, mIndex) => {
              const completedTasks = milestone.tasks.filter(t => t.status === "done").length;
              const progress = milestone.tasks.length > 0 
                ? Math.round((completedTasks / milestone.tasks.length) * 100) 
                : 0;
              
              return (
                <div
                  key={milestone.id}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  {/* Milestone header */}
                  <div 
                    className="flex items-center gap-3 p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleMilestone(milestone.id)}
                  >
                    <Flag className="w-5 h-5 text-blue-500" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{milestone.name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {completedTasks}/{milestone.tasks.length}
                        </Badge>
                      </div>
                      {/* Mini progress bar */}
                      <div className="w-32 h-1.5 bg-muted rounded-full mt-2">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMilestone(milestone.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                    {milestone.collapsed ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  
                  {/* Tasks */}
                  {!milestone.collapsed && (
                    <div className="p-4 pt-2 space-y-2">
                      {milestone.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="group flex items-center gap-3 p-3 rounded-lg bg-background border border-transparent hover:border-border transition-all"
                        >
                          <button
                            onClick={() => updateTaskStatus(
                              milestone.id, 
                              task.id, 
                              task.status === "done" ? "todo" : "done"
                            )}
                          >
                            {task.status === "done" ? (
                              <CheckCircle2 className="w-5 h-5 text-success" />
                            ) : (
                              <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
                            )}
                          </button>
                          
                          <span className={cn(
                            "flex-1 text-sm",
                            task.status === "done" && "line-through text-muted-foreground"
                          )}>
                            {task.title}
                          </span>
                          
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <select
                              value={task.priority}
                              onChange={(e) => updateTaskPriority(milestone.id, task.id, e.target.value as Task["priority"])}
                              className="text-xs bg-transparent border border-border rounded px-2 py-1"
                            >
                              <option value="high">High</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>
                            <select
                              value={task.status}
                              onChange={(e) => updateTaskStatus(milestone.id, task.id, e.target.value as Task["status"])}
                              className="text-xs bg-transparent border border-border rounded px-2 py-1"
                            >
                              <option value="todo">To Do</option>
                              <option value="in-progress">In Progress</option>
                              <option value="done">Done</option>
                            </select>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-destructive"
                              onClick={() => removeTask(milestone.id, task.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                          
                          <div className={cn("w-2 h-2 rounded-full", PRIORITY_CONFIG[task.priority].bg)} />
                        </div>
                      ))}
                      
                      {/* Add task */}
                      {addingTaskTo === milestone.id ? (
                        <div className="flex gap-2 mt-2">
                          <Input
                            placeholder="Task title"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addTask(milestone.id)}
                            className="flex-1"
                            autoFocus
                          />
                          <Button size="sm" onClick={() => addTask(milestone.id)}>Add</Button>
                          <Button variant="ghost" size="sm" onClick={() => setAddingTaskTo(null)}>Cancel</Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full mt-2 text-muted-foreground hover:text-foreground"
                          onClick={() => setAddingTaskTo(milestone.id)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add task
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
};
