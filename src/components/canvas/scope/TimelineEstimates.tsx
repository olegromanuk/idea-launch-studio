import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { 
  Sparkles, 
  Plus, 
  Trash2,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelinePhase {
  id: string;
  name: string;
  weeks: number;
  color: string;
}

interface TimelineEstimatesProps {
  phases: TimelinePhase[];
  onChange: (phases: TimelinePhase[]) => void;
  onAIGenerate: () => void;
  isGenerating: boolean;
}

const COLORS = [
  "from-violet-500 to-purple-500",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-indigo-500 to-blue-500",
];

export const TimelineEstimates = ({ 
  phases, 
  onChange, 
  onAIGenerate, 
  isGenerating 
}: TimelineEstimatesProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newPhase, setNewPhase] = useState({ name: "", weeks: 2 });

  const totalWeeks = phases.reduce((acc, p) => acc + p.weeks, 0);
  const totalMonths = Math.ceil(totalWeeks / 4);

  const addPhase = () => {
    if (!newPhase.name.trim()) return;
    
    const phase: TimelinePhase = {
      id: crypto.randomUUID(),
      name: newPhase.name,
      weeks: newPhase.weeks,
      color: COLORS[phases.length % COLORS.length],
    };
    
    onChange([...phases, phase]);
    setNewPhase({ name: "", weeks: 2 });
    setIsAdding(false);
  };

  const removePhase = (id: string) => {
    onChange(phases.filter(p => p.id !== id));
  };

  const updatePhaseWeeks = (id: string, weeks: number) => {
    onChange(phases.map(p => p.id === id ? { ...p, weeks } : p));
  };

  const updatePhaseName = (id: string, name: string) => {
    onChange(phases.map(p => p.id === id ? { ...p, name } : p));
  };

  // Calculate cumulative start positions for visualization
  const getPhaseStart = (index: number) => {
    return phases.slice(0, index).reduce((acc, p) => acc + p.weeks, 0);
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">Timeline & Estimates</h3>
              <p className="text-sm text-muted-foreground">
                {phases.length} phases • {totalWeeks} weeks ({totalMonths} months)
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
              Add Phase
            </Button>
            <Button
              size="sm"
              onClick={onAIGenerate}
              disabled={isGenerating}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
            >
              <Sparkles className={cn("w-4 h-4 mr-1", isGenerating && "animate-spin")} />
              {isGenerating ? "Generating..." : "AI Generate"}
            </Button>
          </div>
        </div>

        {/* Add phase form */}
        {isAdding && (
          <div className="mb-6 p-4 rounded-xl bg-muted/50 border border-border animate-fade-in">
            <div className="grid gap-4">
              <Input
                placeholder="Phase name (e.g., MVP Development)"
                value={newPhase.name}
                onChange={(e) => setNewPhase({ ...newPhase, name: e.target.value })}
              />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="font-medium">{newPhase.weeks} weeks</span>
                </div>
                <Slider
                  value={[newPhase.weeks]}
                  onValueChange={([v]) => setNewPhase({ ...newPhase, weeks: v })}
                  min={1}
                  max={12}
                  step={1}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button size="sm" onClick={addPhase}>Add Phase</Button>
              </div>
            </div>
          </div>
        )}

        {/* Visual Timeline */}
        {phases.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Timeline Overview</span>
            </div>
            
            {/* Timeline bar */}
            <div className="relative h-12 rounded-xl bg-muted overflow-hidden">
              {phases.map((phase, index) => {
                const startPercent = (getPhaseStart(index) / totalWeeks) * 100;
                const widthPercent = (phase.weeks / totalWeeks) * 100;
                
                return (
                  <div
                    key={phase.id}
                    className={cn(
                      "absolute top-0 bottom-0 flex items-center justify-center text-white text-xs font-medium bg-gradient-to-r transition-all duration-300",
                      phase.color
                    )}
                    style={{
                      left: `${startPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                    title={`${phase.name}: ${phase.weeks} weeks`}
                  >
                    {widthPercent > 15 && (
                      <span className="truncate px-2">{phase.name}</span>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Week markers */}
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Week 0</span>
              <span>Week {Math.ceil(totalWeeks / 2)}</span>
              <span>Week {totalWeeks}</span>
            </div>
          </div>
        )}

        {/* Phase list with adjustable sliders */}
        <div className="space-y-4">
          {phases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-xl">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No timeline phases yet</p>
              <p className="text-xs mt-1">Add phases to build your project timeline</p>
            </div>
          ) : (
            phases.map((phase, index) => (
              <div
                key={phase.id}
                className="group p-4 rounded-xl bg-card border border-border hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Color indicator */}
                  <div className={cn(
                    "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm flex-shrink-0",
                    phase.color
                  )}>
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Input
                        value={phase.name}
                        onChange={(e) => updatePhaseName(phase.id, e.target.value)}
                        className="font-medium border-0 bg-transparent p-0 h-auto text-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                        onClick={() => removePhase(phase.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Slider
                          value={[phase.weeks]}
                          onValueChange={([v]) => updatePhaseWeeks(phase.id, v)}
                          min={1}
                          max={16}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <div className="flex items-center gap-1 min-w-[80px]">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => updatePhaseWeeks(phase.id, Math.max(1, phase.weeks - 1))}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-medium w-16 text-center">
                          {phase.weeks} {phase.weeks === 1 ? "week" : "weeks"}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => updatePhaseWeeks(phase.id, Math.min(16, phase.weeks + 1))}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        {phases.length > 0 && (
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Total Project Duration</p>
                <p className="text-sm text-muted-foreground">Based on current estimates</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{totalWeeks} weeks</p>
                <p className="text-sm text-muted-foreground">≈ {totalMonths} months</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
