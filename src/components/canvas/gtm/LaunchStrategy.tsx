import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
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
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";

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
      case "completed": return "bg-success/10 text-success border-success/30";
      case "in_progress": return "bg-blue-500/10 text-blue-500 border-blue-500/30";
      default: return "bg-muted";
    }
  };

  const overallProgress = safePhases.length > 0
    ? safePhases.reduce((sum, p) => sum + getPhaseProgress(p), 0) / safePhases.length
    : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Plan your product launch strategy with phases, tasks, and goals
        </p>
        <div className="flex items-center gap-2">
          {onAIGenerate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAIGenerate}
              disabled={isGenerating}
              className="gap-2"
            >
              <Sparkles className={cn("w-4 h-4", isGenerating && "animate-spin")} />
              Generate Plan
            </Button>
          )}
          <Button onClick={addPhase} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Phase
          </Button>
        </div>
      </div>

      {/* Overall Progress */}
      {safePhases.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <Rocket className="w-4 h-4 text-primary" />
              Launch Progress
            </h4>
            <span className="text-sm font-bold text-foreground">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>{safePhases.filter(p => p.status === "completed").length} of {safePhases.length} phases completed</span>
            <span>{safePhases.reduce((sum, p) => sum + (p.tasks || []).filter(t => t.completed).length, 0)} tasks done</span>
          </div>
        </Card>
      )}

      {/* Quick Add Default Phases */}
      {safePhases.length === 0 && (
        <Card className="p-4">
          <h4 className="font-medium text-foreground mb-3">Quick Start: Add Common Phases</h4>
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
                className="gap-2"
              >
                <phase.icon className="w-4 h-4" />
                {phase.name}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Phases List */}
      <div className="space-y-4">
        {safePhases.map((phase, index) => {
          const phaseInfo = DEFAULT_PHASES.find(p => phase.name.toLowerCase().includes(p.name.toLowerCase().split(" ")[0])) || DEFAULT_PHASES[0];
          const PhaseIcon = phaseInfo.icon;
          const progress = getPhaseProgress(phase);

          return (
            <Card key={phase.id} className="overflow-hidden">
              {/* Phase Header */}
              <div
                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedId(expandedId === phase.id ? null : phase.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
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
                        className="font-medium border-none p-0 h-auto text-foreground bg-transparent focus-visible:ring-0 text-lg"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Badge variant="outline" className={getStatusColor(phase.status)}>
                        {phase.status === "completed" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {phase.status === "in_progress" && <Zap className="w-3 h-3 mr-1" />}
                        {phase.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <Progress value={progress} className="flex-1 h-1.5" />
                      <span className="text-xs text-muted-foreground w-12">
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
                      className="text-destructive hover:text-destructive"
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
              {expandedId === phase.id && (
                <div className="p-4 pt-0 space-y-6 border-t border-border">
                  {/* Description */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
                    <Textarea
                      value={phase.description}
                      onChange={(e) => updatePhase(phase.id, { description: e.target.value })}
                      placeholder="Describe this launch phase..."
                      className="min-h-[80px]"
                    />
                  </div>

                  {/* Dates & Status */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Start Date
                      </label>
                      <Input
                        type="date"
                        value={phase.startDate}
                        onChange={(e) => updatePhase(phase.id, { startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> End Date
                      </label>
                      <Input
                        type="date"
                        value={phase.endDate}
                        onChange={(e) => updatePhase(phase.id, { endDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                      <Select
                        value={phase.status}
                        onValueChange={(v) => updatePhase(phase.id, { status: v as LaunchPhase["status"] })}
                      >
                        <SelectTrigger>
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
                      <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        Tasks
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addTask(phase.id)}
                        className="gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add Task
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {(phase.tasks || []).map((task) => (
                        <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
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
                            className="w-36"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTask(phase.id, task.id)}
                            className="flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      {(phase.tasks || []).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No tasks yet. Add tasks to track progress.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Goals & Channels */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                        <Flag className="w-4 h-4 text-primary" />
                        Goals
                      </h4>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {(phase.goals || []).map((goal, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="gap-1 cursor-pointer hover:bg-destructive/10"
                            onClick={() => removeGoal(phase.id, i)}
                          >
                            {goal}
                            <Trash2 className="w-3 h-3" />
                          </Badge>
                        ))}
                      </div>
                      <Input
                        placeholder="Add goal and press Enter..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            addGoal(phase.id, e.currentTarget.value);
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                        <Megaphone className="w-4 h-4 text-primary" />
                        Channels
                      </h4>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {(phase.channels || []).map((channel, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="gap-1 cursor-pointer hover:bg-destructive/10"
                            onClick={() => removeChannel(phase.id, i)}
                          >
                            {channel}
                            <Trash2 className="w-3 h-3" />
                          </Badge>
                        ))}
                      </div>
                      <Input
                        placeholder="Add channel and press Enter..."
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
              )}
            </Card>
          );
        })}
      </div>

      {phases.length === 0 && (
        <div className="text-center py-12 rounded-lg bg-muted/30 border border-dashed border-border">
          <Rocket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Launch Phases</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Plan your product launch with phases and milestones
          </p>
          <Button onClick={addPhase} className="gap-2">
            <Plus className="w-4 h-4" />
            Create First Phase
          </Button>
        </div>
      )}
    </div>
  );
};
