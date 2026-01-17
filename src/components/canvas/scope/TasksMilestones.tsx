import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sparkles, 
  Plus, 
  Trash2,
  ListTodo,
  Flag,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp
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
    <div className="relative bg-[#0A0A0A] border border-white/[0.08] overflow-hidden">
      {/* Blueprint corner accents */}
      <div className="absolute -top-px -left-px w-2 h-2 border-t-2 border-l-2 border-[#00f0ff] opacity-70" />
      <div className="absolute -bottom-px -right-px w-2 h-2 border-b-2 border-r-2 border-[#00f0ff] opacity-70" />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
          <h2 className="font-mono text-xs text-[#00f0ff] uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
            Tasks_Milestones
          </h2>
          <ListTodo className="w-5 h-5 text-slate-700" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 bg-[#0F0F0F] border-l-2 border-[#00f0ff]">
            <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Milestones</span>
            <span className="text-2xl font-bold text-white tracking-tight font-mono">{milestones.length}</span>
          </div>
          <div className="p-3 bg-[#0F0F0F] border-l-2 border-slate-800">
            <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Tasks</span>
            <span className="text-2xl font-bold text-white tracking-tight font-mono">{totalTasks}</span>
          </div>
          <div className="p-3 bg-[#0F0F0F] border-l-2 border-green-500">
            <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Done</span>
            <span className="text-2xl font-bold text-green-400 tracking-tight font-mono">{doneTasks}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingMilestone(!isAddingMilestone)}
            className="flex-1 font-mono text-xs uppercase tracking-wider border-white/10 hover:border-[#00f0ff]/30 hover:text-[#00f0ff] bg-transparent"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Milestone
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

        {/* Add milestone form */}
        {isAddingMilestone && (
          <div className="mb-6 p-4 bg-[#0F0F0F] border border-white/10 animate-in fade-in-0 slide-in-from-top-2">
            <div className="flex gap-2">
              <Input
                placeholder="Milestone name (e.g., Phase 1: MVP)"
                value={newMilestoneName}
                onChange={(e) => setNewMilestoneName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addMilestone()}
                className="flex-1 bg-[#0A0A0A] border-white/10 focus:border-[#00f0ff]/50 font-mono text-sm"
              />
              <Button 
                size="sm" 
                onClick={addMilestone}
                className="font-mono text-xs uppercase bg-[#00f0ff] text-black hover:bg-[#00f0ff]/90"
              >
                Add
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsAddingMilestone(false)}
                className="font-mono text-xs uppercase text-slate-500"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Milestones list */}
        <div className="space-y-4">
          {milestones.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-white/10 bg-[#0F0F0F]">
              <Flag className="w-10 h-10 mx-auto mb-3 text-slate-700" />
              <p className="text-sm text-slate-500 font-mono">NO_MILESTONES</p>
              <p className="text-xs text-slate-600 mt-1 font-mono">Add milestones to organize tasks</p>
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
                  className="bg-[#0F0F0F] border border-white/5 overflow-hidden"
                >
                  {/* Milestone header */}
                  <div 
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/[0.02] transition-colors border-b border-white/5"
                    onClick={() => toggleMilestone(milestone.id)}
                  >
                    <Flag className="w-5 h-5 text-[#00f0ff]" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-mono text-sm text-white uppercase tracking-wider">{milestone.name}</h4>
                        <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400">
                          {completedTasks}/{milestone.tasks.length}
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="w-32 h-1 bg-slate-900 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="h-full bg-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.5)] transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-600 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMilestone(milestone.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    {milestone.collapsed ? (
                      <ChevronDown className="w-5 h-5 text-slate-600" />
                    ) : (
                      <ChevronUp className="w-5 h-5 text-slate-600" />
                    )}
                  </div>
                  
                  {/* Tasks */}
                  {!milestone.collapsed && (
                    <div className="p-4 pt-2 space-y-2">
                      {milestone.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="group flex items-center gap-3 p-3 bg-[#0A0A0A] border border-transparent hover:border-white/10 transition-all"
                        >
                          <button
                            onClick={() => updateTaskStatus(
                              milestone.id, 
                              task.id, 
                              task.status === "done" ? "todo" : "done"
                            )}
                          >
                            {task.status === "done" ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-600 hover:text-[#00f0ff]" />
                            )}
                          </button>
                          
                          <span className={cn(
                            "flex-1 text-sm font-mono",
                            task.status === "done" && "line-through text-slate-500"
                          )}>
                            {task.title}
                          </span>
                          
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <select
                              value={task.priority}
                              onChange={(e) => updateTaskPriority(milestone.id, task.id, e.target.value as Task["priority"])}
                              className="text-xs font-mono bg-transparent border border-white/10 rounded px-2 py-1 text-slate-400"
                            >
                              <option value="high">High</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>
                            <select
                              value={task.status}
                              onChange={(e) => updateTaskStatus(milestone.id, task.id, e.target.value as Task["status"])}
                              className="text-xs font-mono bg-transparent border border-white/10 rounded px-2 py-1 text-slate-400"
                            >
                              <option value="todo">To Do</option>
                              <option value="in-progress">In Progress</option>
                              <option value="done">Done</option>
                            </select>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-red-500"
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
                            className="flex-1 bg-[#0A0A0A] border-white/10 focus:border-[#00f0ff]/50 font-mono text-sm"
                            autoFocus
                          />
                          <Button 
                            size="sm" 
                            onClick={() => addTask(milestone.id)}
                            className="font-mono text-xs uppercase bg-[#00f0ff] text-black hover:bg-[#00f0ff]/90"
                          >
                            Add
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setAddingTaskTo(null)}
                            className="font-mono text-xs uppercase text-slate-500"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <button
                          className="w-full mt-2 p-2 text-xs font-mono uppercase tracking-wider text-slate-500 hover:text-[#00f0ff] border border-dashed border-white/10 hover:border-[#00f0ff]/30 transition-all"
                          onClick={() => setAddingTaskTo(milestone.id)}
                        >
                          <Plus className="w-4 h-4 inline mr-1" />
                          Add task
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
