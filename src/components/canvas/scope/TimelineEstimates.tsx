import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  duration?: number;
}

interface TimelineEstimatesProps {
  phases: TimelinePhase[];
  onChange: (phases: TimelinePhase[]) => void;
  onAIGenerate: () => void;
  isGenerating: boolean;
}

const COLORS = [
  "from-[#00f0ff] to-cyan-600",
  "from-violet-500 to-purple-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-indigo-500 to-blue-500",
];

export const TimelineEstimates = ({ 
  phases: rawPhases, 
  onChange, 
  onAIGenerate, 
  isGenerating 
}: TimelineEstimatesProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newPhase, setNewPhase] = useState({ name: "", weeks: 2 });

  // Normalize phases to ensure weeks is always a valid number
  const phases = rawPhases.map(p => ({
    ...p,
    weeks: typeof p.weeks === 'number' && !isNaN(p.weeks) ? p.weeks : 
           (typeof (p as any).duration === 'number' && !isNaN((p as any).duration) ? (p as any).duration : 2)
  }));

  const totalWeeks = phases.reduce((acc, p) => acc + (p.weeks || 0), 0);
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

  const getPhaseStart = (index: number) => {
    return phases.slice(0, index).reduce((acc, p) => acc + p.weeks, 0);
  };

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
            Timeline_Estimates
          </h2>
          <Calendar className="w-5 h-5 text-slate-700" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 bg-[#0F0F0F] border-l-2 border-[#00f0ff]">
            <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Phases</span>
            <span className="text-2xl font-bold text-white tracking-tight font-mono">{phases.length}</span>
          </div>
          <div className="p-3 bg-[#0F0F0F] border-l-2 border-slate-800">
            <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Weeks</span>
            <span className="text-2xl font-bold text-white tracking-tight font-mono">{totalWeeks}</span>
          </div>
          <div className="p-3 bg-[#0F0F0F] border-l-2 border-slate-800">
            <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Months</span>
            <span className="text-2xl font-bold text-white tracking-tight font-mono">~{totalMonths}</span>
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
            Add Phase
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

        {/* Add phase form */}
        {isAdding && (
          <div className="mb-6 p-4 bg-[#0F0F0F] border border-white/10 animate-in fade-in-0 slide-in-from-top-2">
            <div className="grid gap-4">
              <Input
                placeholder="Phase name (e.g., MVP Development)"
                value={newPhase.name}
                onChange={(e) => setNewPhase({ ...newPhase, name: e.target.value })}
                className="bg-[#0A0A0A] border-white/10 focus:border-[#00f0ff]/50 font-mono text-sm"
              />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Duration</span>
                  <span className="font-mono text-sm text-white">{newPhase.weeks} weeks</span>
                </div>
                <Slider
                  value={[newPhase.weeks]}
                  onValueChange={([v]) => setNewPhase({ ...newPhase, weeks: v })}
                  min={1}
                  max={12}
                  step={1}
                  className="w-full"
                />
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
                  onClick={addPhase}
                  className="font-mono text-xs uppercase bg-[#00f0ff] text-black hover:bg-[#00f0ff]/90"
                >
                  Add Phase
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Visual Timeline */}
        {phases.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Timeline Overview</span>
            </div>
            
            {/* Timeline bar */}
            <div className="relative h-10 bg-[#0F0F0F] overflow-hidden border border-white/5">
              {phases.map((phase, index) => {
                const startPercent = (getPhaseStart(index) / totalWeeks) * 100;
                const widthPercent = (phase.weeks / totalWeeks) * 100;
                
                return (
                  <div
                    key={phase.id}
                    className={cn(
                      "absolute top-0 bottom-0 flex items-center justify-center text-white text-[10px] font-mono uppercase tracking-wider bg-gradient-to-r transition-all duration-300",
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
            <div className="flex justify-between mt-2 text-[10px] font-mono text-slate-600">
              <span>Week 0</span>
              <span>Week {Math.ceil(totalWeeks / 2)}</span>
              <span>Week {totalWeeks}</span>
            </div>
          </div>
        )}

        {/* Phase list */}
        <div className="space-y-3">
          {phases.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-white/10 bg-[#0F0F0F]">
              <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-700" />
              <p className="text-sm text-slate-500 font-mono">NO_PHASES</p>
              <p className="text-xs text-slate-600 mt-1 font-mono">Add phases to build timeline</p>
            </div>
          ) : (
            phases.map((phase, index) => (
              <div
                key={phase.id}
                className="group p-4 bg-[#0F0F0F] border border-white/5 hover:border-white/10 transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Phase number */}
                  <div className={cn(
                    "w-10 h-10 flex items-center justify-center text-white font-bold text-sm font-mono flex-shrink-0 bg-gradient-to-br",
                    phase.color
                  )}>
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Input
                        value={phase.name}
                        onChange={(e) => updatePhaseName(phase.id, e.target.value)}
                        className="font-mono text-sm border-0 bg-transparent p-0 h-auto text-white focus-visible:ring-0 focus-visible:ring-offset-0 uppercase tracking-wider"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-red-500"
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
                      <div className="flex items-center gap-1 min-w-[100px]">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-slate-600 hover:text-[#00f0ff]"
                          onClick={() => updatePhaseWeeks(phase.id, Math.max(1, phase.weeks - 1))}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-xs font-mono w-16 text-center text-white">
                          {phase.weeks} {phase.weeks === 1 ? "wk" : "wks"}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-slate-600 hover:text-[#00f0ff]"
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
          <div className="mt-6 p-4 bg-[#0F0F0F] border border-[#00f0ff]/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-slate-500 uppercase tracking-wider">Total Duration</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white font-mono">{totalWeeks} <span className="text-sm text-slate-500">weeks</span></p>
                <p className="text-xs text-[#00f0ff] font-mono">≈ {totalMonths} months</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
