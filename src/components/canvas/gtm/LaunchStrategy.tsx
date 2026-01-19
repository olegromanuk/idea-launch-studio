import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  Trash2, 
  Rocket,
  Calendar,
  CheckCircle2,
  Circle,
  Sparkles,
  Flag,
  Target,
  Users,
  Megaphone,
  Zap,
  ChevronDown,
  ChevronUp,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface LaunchPhase {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "planned" | "in_progress" | "completed";
  tasks: {
    id: string;
    title: string;
    completed: boolean;
    assignee?: string;
    dueDate?: string;
  }[];
  goals: string[];
  channels: string[];
}

interface LaunchStrategyProps {
  phases: LaunchPhase[];
  onChange: (phases: LaunchPhase[]) => void;
  onAIGenerate?: () => void;
  isGenerating?: boolean;
}

const DEFAULT_PHASES = [
  { name: "Pre-Launch", icon: Target, color: "from-amber-500 to-orange-500" },
  { name: "Soft Launch", icon: Users, color: "from-blue-500 to-cyan-500" },
  { name: "Public Launch", icon: Rocket, color: "from-violet-500 to-purple-500" },
  { name: "Post-Launch", icon: Megaphone, color: "from-emerald-500 to-teal-500" },
];

export const LaunchStrategy = ({
  phases = [],
  onChange,
  onAIGenerate,
  isGenerating = false,
}: LaunchStrategyProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Ensure phases is always an array
  const safePhases = Array.isArray(phases) ? phases : [];

  const addPhase = () => {
    const newPhase: LaunchPhase = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      status: "planned",
      tasks: [],
      goals: [],
      channels: [],
    };
    onChange([...safePhases, newPhase]);
    setExpandedId(newPhase.id);
  };

  const updatePhase = (id: string, updates: Partial<LaunchPhase>) => {
    onChange(safePhases.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deletePhase = (id: string) => {
    onChange(safePhases.filter(p => p.id !== id));
  };

  const addTask = (phaseId: string) => {
    const phase = safePhases.find(p => p.id === phaseId);
    if (phase) {
      updatePhase(phaseId, {
        tasks: [...phase.tasks, {
          id: crypto.randomUUID(),
          title: "",
          completed: false,
        }],
      });
    }
  };

  const updateTask = (phaseId: string, taskId: string, updates: Partial<LaunchPhase["tasks"][0]>) => {
    const phase = safePhases.find(p => p.id === phaseId);
    if (phase) {
      updatePhase(phaseId, {
        tasks: phase.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t),
      });
    }
  };

  const deleteTask = (phaseId: string, taskId: string) => {
    const phase = safePhases.find(p => p.id === phaseId);
    if (phase) {
      updatePhase(phaseId, {
        tasks: phase.tasks.filter(t => t.id !== taskId),
      });
    }
  };

  const addGoal = (phaseId: string, goal: string) => {
    const phase = safePhases.find(p => p.id === phaseId);
    if (phase && goal.trim()) {
      updatePhase(phaseId, {
        goals: [...phase.goals, goal.trim()],
      });
    }
  };

  const removeGoal = (phaseId: string, index: number) => {
    const phase = safePhases.find(p => p.id === phaseId);
    if (phase) {
      updatePhase(phaseId, {
        goals: phase.goals.filter((_, i) => i !== index),
      });
    }
  };

  const addChannel = (phaseId: string, channel: string) => {
    const phase = safePhases.find(p => p.id === phaseId);
    if (phase && channel.trim()) {
      updatePhase(phaseId, {
        channels: [...phase.channels, channel.trim()],
      });
    }
  };

  const removeChannel = (phaseId: string, index: number) => {
    const phase = safePhases.find(p => p.id === phaseId);
    if (phase) {
      updatePhase(phaseId, {
        channels: phase.channels.filter((_, i) => i !== index),
      });
    }
  };

  const getPhaseProgress = (phase: LaunchPhase) => {
    const tasks = phase.tasks || [];
    if (tasks.length === 0) return 0;
    return (tasks.filter(t => t.completed).length / tasks.length) * 100;
  };

  const getStatusColor = (status: LaunchPhase["status"]) => {
    switch (status) {
      case "completed": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "in_progress": return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      default: return "bg-white/10 text-muted-foreground border-white/10";
    }
  };

  const overallProgress = safePhases.length > 0
    ? safePhases.reduce((sum, p) => sum + getPhaseProgress(p), 0) / safePhases.length
    : 0;

  const completedTasks = safePhases.reduce((sum, p) => sum + (p.tasks || []).filter(t => t.completed).length, 0);
  const totalTasks = safePhases.reduce((sum, p) => sum + (p.tasks || []).length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">
          {safePhases.length} PHASE{safePhases.length !== 1 ? 'S' : ''} DEFINED
        </div>
        <div className="flex items-center gap-2">
          {onAIGenerate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAIGenerate}
              disabled={isGenerating}
              className="gap-2 border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
            >
              <Sparkles className={cn("w-4 h-4", isGenerating && "animate-spin")} />
              Generate Plan
            </Button>
          )}
          <Button onClick={addPhase} size="sm" className="gap-2 bg-cyan-600 hover:bg-cyan-500">
            <Plus className="w-4 h-4" />
            Add Phase
          </Button>
        </div>
      </div>

      {/* Overall Progress */}
      {safePhases.length > 0 && (
        <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-transparent p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-white flex items-center gap-2">
              <Rocket className="w-5 h-5 text-cyan-400" />
              <span className="font-mono">LAUNCH_PROGRESS</span>
            </h4>
            <span className="text-xl font-bold text-cyan-400 font-mono">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2 mb-3" />
          <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground uppercase">
            <span>{safePhases.filter(p => p.status === "completed").length} of {safePhases.length} phases completed</span>
            <span className="text-cyan-400">{completedTasks} / {totalTasks} tasks done</span>
          </div>
        </div>
      )}

      {/* Quick Add Default Phases */}
      {safePhases.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-black/40 p-4">
          <h4 className="font-mono text-white mb-3 text-sm">QUICK START: Add Common Phases</h4>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_PHASES.map((phase) => (
              <Button
                key={phase.name}
                variant="outline"
                size="sm"
                onClick={() => {
                  const newPhase: LaunchPhase = {
                    id: crypto.randomUUID(),
                    name: phase.name,
                    description: "",
                    startDate: "",
                    endDate: "",
                    status: "planned",
                    tasks: [],
                    goals: [],
                    channels: [],
                  };
                  onChange([...safePhases, newPhase]);
                }}
                className="gap-2 border-white/10 hover:bg-white/5"
              >
                <phase.icon className="w-4 h-4" />
                {phase.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Phases List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {safePhases.map((phase, index) => {
            const phaseInfo = DEFAULT_PHASES.find(p => phase.name.toLowerCase().includes(p.name.toLowerCase().split(" ")[0])) || DEFAULT_PHASES[0];
            const PhaseIcon = phaseInfo.icon;
            const progress = getPhaseProgress(phase);

            return (
              <motion.div 
                key={phase.id} 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={cn(
                  "rounded-xl border backdrop-blur-sm overflow-hidden",
                  "bg-gradient-to-br from-white/[0.05] to-transparent",
                  expandedId === phase.id ? "border-cyan-500/50" : "border-white/10"
                )}
              >
                {/* Phase Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setExpandedId(expandedId === phase.id ? null : phase.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold font-mono text-cyan-400">
                        {index + 1}
                      </div>
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        "bg-gradient-to-br",
                        phaseInfo.color
                      )}>
                        <PhaseIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Input
                          value={phase.name}
                          onChange={(e) => updatePhase(phase.id, { name: e.target.value })}
                          placeholder="Phase Name"
                          className="font-medium border-none p-0 h-auto text-white bg-transparent focus-visible:ring-0 text-lg"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Badge variant="outline" className={cn("text-[10px] font-mono uppercase", getStatusColor(phase.status))}>
                          {phase.status === "completed" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {phase.status === "in_progress" && <Zap className="w-3 h-3 mr-1" />}
                          {phase.status === "planned" && <Clock className="w-3 h-3 mr-1" />}
                          {phase.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <Progress value={progress} className="flex-1 h-1.5" />
                        <span className="text-[10px] font-mono text-muted-foreground w-12">
                          {(phase.tasks || []).filter(t => t.completed).length}/{(phase.tasks || []).length}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePhase(phase.id);
                        }}
                        className="h-8 w-8 text-destructive/60 hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      {expandedId === phase.id ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedId === phase.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 space-y-6 border-t border-white/10">
                        {/* Description */}
                        <div>
                          <label className="text-[10px] font-mono text-cyan-500 uppercase mb-2 block">Description</label>
                          <Textarea
                            value={phase.description}
                            onChange={(e) => updatePhase(phase.id, { description: e.target.value })}
                            placeholder="Describe this launch phase..."
                            className="min-h-[80px] bg-black/40 border-white/10"
                          />
                        </div>

                        {/* Dates & Status */}
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1 block flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Start Date
                            </label>
                            <Input
                              type="date"
                              value={phase.startDate}
                              onChange={(e) => updatePhase(phase.id, { startDate: e.target.value })}
                              className="bg-black/40 border-white/10"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1 block flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> End Date
                            </label>
                            <Input
                              type="date"
                              value={phase.endDate}
                              onChange={(e) => updatePhase(phase.id, { endDate: e.target.value })}
                              className="bg-black/40 border-white/10"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1 block">Status</label>
                            <Select
                              value={phase.status}
                              onValueChange={(v) => updatePhase(phase.id, { status: v as LaunchPhase["status"] })}
                            >
                              <SelectTrigger className="bg-black/40 border-white/10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="planned">Planned</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Tasks */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-cyan-500" />
                              <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">Tasks</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addTask(phase.id)}
                              className="gap-1 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                            >
                              <Plus className="w-3 h-3" />
                              Add Task
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {(phase.tasks || []).map((task) => (
                              <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                                <Checkbox
                                  checked={task.completed}
                                  onCheckedChange={(checked) => updateTask(phase.id, task.id, { completed: !!checked })}
                                />
                                <Input
                                  value={task.title}
                                  onChange={(e) => updateTask(phase.id, task.id, { title: e.target.value })}
                                  placeholder="Task description..."
                                  className={cn(
                                    "flex-1 border-none bg-transparent focus-visible:ring-0",
                                    task.completed && "line-through text-muted-foreground"
                                  )}
                                />
                                <Input
                                  type="date"
                                  value={task.dueDate || ""}
                                  onChange={(e) => updateTask(phase.id, task.id, { dueDate: e.target.value })}
                                  className="w-36 bg-black/40 border-white/10"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteTask(phase.id, task.id)}
                                  className="flex-shrink-0 h-8 w-8"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                            {(phase.tasks || []).length === 0 && (
                              <p className="text-sm text-muted-foreground text-center py-4 font-mono">
                                No tasks yet. Add tasks to track progress.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Goals & Channels */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Flag className="w-4 h-4 text-cyan-500" />
                              <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">Goals</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {(phase.goals || []).map((goal, i) => (
                                <Badge
                                  key={i}
                                  variant="secondary"
                                  className="gap-1 cursor-pointer hover:bg-destructive/20 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                                  onClick={() => removeGoal(phase.id, i)}
                                >
                                  {goal}
                                  <Trash2 className="w-3 h-3" />
                                </Badge>
                              ))}
                            </div>
                            <Input
                              placeholder="Add a goal and press Enter..."
                              className="bg-black/40 border-white/10"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  addGoal(phase.id, e.currentTarget.value);
                                  e.currentTarget.value = "";
                                }
                              }}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Megaphone className="w-4 h-4 text-cyan-500" />
                              <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">Channels</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {(phase.channels || []).map((channel, i) => (
                                <Badge
                                  key={i}
                                  variant="secondary"
                                  className="gap-1 cursor-pointer hover:bg-destructive/20 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                                  onClick={() => removeChannel(phase.id, i)}
                                >
                                  {channel}
                                  <Trash2 className="w-3 h-3" />
                                </Badge>
                              ))}
                            </div>
                            <Input
                              placeholder="Add a channel and press Enter..."
                              className="bg-black/40 border-white/10"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  addChannel(phase.id, e.currentTarget.value);
                                  e.currentTarget.value = "";
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {safePhases.length === 0 && (
        <div className="text-center py-16 rounded-xl bg-black/40 border border-dashed border-white/10">
          <Rocket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Launch Phases</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Plan your product launch with phases, tasks, and milestones
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button onClick={addPhase} className="gap-2 bg-cyan-600 hover:bg-cyan-500">
              <Plus className="w-4 h-4" />
              Create Phase
            </Button>
            {onAIGenerate && (
              <Button 
                variant="outline" 
                onClick={onAIGenerate}
                disabled={isGenerating}
                className="gap-2 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
              >
                <Sparkles className="w-4 h-4" />
                AI Generate
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
