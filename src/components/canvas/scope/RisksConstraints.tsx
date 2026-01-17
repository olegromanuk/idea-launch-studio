import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sparkles, 
  Plus, 
  Trash2,
  AlertTriangle,
  ShieldAlert,
  Info,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Risk {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  likelihood: "high" | "medium" | "low";
  mitigation: string;
  type: "risk" | "constraint";
}

interface RisksConstraintsProps {
  items: Risk[];
  onChange: (items: Risk[]) => void;
  onAIGenerate: () => void;
  isGenerating: boolean;
}

const IMPACT_CONFIG = {
  high: { label: "High", color: "border-red-500/30 text-red-500 bg-red-500/10" },
  medium: { label: "Medium", color: "border-amber-500/30 text-amber-500 bg-amber-500/10" },
  low: { label: "Low", color: "border-green-500/30 text-green-500 bg-green-500/10" },
};

const LIKELIHOOD_CONFIG = {
  high: { label: "Likely", color: "text-red-500" },
  medium: { label: "Possible", color: "text-amber-500" },
  low: { label: "Unlikely", color: "text-green-500" },
};

export const RisksConstraints = ({ 
  items, 
  onChange, 
  onAIGenerate, 
  isGenerating 
}: RisksConstraintsProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<Risk>>({
    title: "",
    description: "",
    impact: "medium",
    likelihood: "medium",
    mitigation: "",
    type: "risk",
  });

  const addItem = () => {
    if (!newItem.title) return;
    
    const item: Risk = {
      id: crypto.randomUUID(),
      title: newItem.title,
      description: newItem.description || "",
      impact: newItem.impact || "medium",
      likelihood: newItem.likelihood || "medium",
      mitigation: newItem.mitigation || "",
      type: newItem.type || "risk",
    };
    
    onChange([...items, item]);
    setNewItem({ title: "", description: "", impact: "medium", likelihood: "medium", mitigation: "", type: "risk" });
    setIsAdding(false);
  };

  const removeItem = (id: string) => {
    onChange(items.filter(i => i.id !== id));
  };

  const risks = items.filter(i => i.type === "risk");
  const constraints = items.filter(i => i.type === "constraint");

  const getRiskScore = (item: Risk) => {
    const impactScore = { high: 3, medium: 2, low: 1 }[item.impact];
    const likelihoodScore = { high: 3, medium: 2, low: 1 }[item.likelihood];
    return impactScore * likelihoodScore;
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
            Risks_Constraints
          </h2>
          <ShieldAlert className="w-5 h-5 text-slate-700" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 bg-[#0F0F0F] border-l-2 border-red-500">
            <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Risks</span>
            <span className="text-2xl font-bold text-white tracking-tight font-mono">{risks.length}</span>
          </div>
          <div className="p-3 bg-[#0F0F0F] border-l-2 border-blue-500">
            <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Constraints</span>
            <span className="text-2xl font-bold text-white tracking-tight font-mono">{constraints.length}</span>
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
            Add
          </Button>
          <Button
            size="sm"
            onClick={onAIGenerate}
            disabled={isGenerating}
            className="flex-1 font-mono text-xs uppercase tracking-wider bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30 hover:border-[#00f0ff]/50 shadow-[0_0_10px_rgba(0,240,255,0.1)] hover:shadow-[0_0_20px_rgba(0,240,255,0.2)]"
          >
            <Sparkles className={cn("w-4 h-4 mr-1.5", isGenerating && "animate-spin")} />
            {isGenerating ? "Identifying..." : "AI Identify"}
          </Button>
        </div>

        {/* Add form */}
        {isAdding && (
          <div className="mb-6 p-4 bg-[#0F0F0F] border border-white/10 animate-in fade-in-0 slide-in-from-top-2">
            <div className="grid gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setNewItem({ ...newItem, type: "risk" })}
                  className={cn(
                    "flex-1 py-2 flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider border transition-all",
                    newItem.type === "risk" 
                      ? "border-red-500/50 bg-red-500/10 text-red-400"
                      : "border-white/10 text-slate-500 hover:border-white/20"
                  )}
                >
                  <AlertTriangle className="w-4 h-4" />
                  Risk
                </button>
                <button
                  onClick={() => setNewItem({ ...newItem, type: "constraint" })}
                  className={cn(
                    "flex-1 py-2 flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider border transition-all",
                    newItem.type === "constraint" 
                      ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
                      : "border-white/10 text-slate-500 hover:border-white/20"
                  )}
                >
                  <Info className="w-4 h-4" />
                  Constraint
                </button>
              </div>
              <Input
                placeholder="Title (e.g., Technical complexity)"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                className="bg-[#0A0A0A] border-white/10 focus:border-[#00f0ff]/50 font-mono text-sm"
              />
              <Textarea
                placeholder="Description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="min-h-[60px] bg-[#0A0A0A] border-white/10 focus:border-[#00f0ff]/50 font-mono text-sm"
              />
              {newItem.type === "risk" && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1 block">Impact</span>
                      <div className="flex gap-1">
                        {(["low", "medium", "high"] as const).map((v) => (
                          <button
                            key={v}
                            onClick={() => setNewItem({ ...newItem, impact: v })}
                            className={cn(
                              "flex-1 py-1.5 text-xs font-mono uppercase border transition-all",
                              newItem.impact === v 
                                ? IMPACT_CONFIG[v].color
                                : "border-white/10 text-slate-500"
                            )}
                          >
                            {v.charAt(0).toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1 block">Likelihood</span>
                      <div className="flex gap-1">
                        {(["low", "medium", "high"] as const).map((v) => (
                          <button
                            key={v}
                            onClick={() => setNewItem({ ...newItem, likelihood: v })}
                            className={cn(
                              "flex-1 py-1.5 text-xs font-mono uppercase border transition-all",
                              newItem.likelihood === v 
                                ? "border-[#00f0ff]/50 bg-[#00f0ff]/10 text-[#00f0ff]"
                                : "border-white/10 text-slate-500"
                            )}
                          >
                            {v.charAt(0).toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Input
                    placeholder="Mitigation strategy"
                    value={newItem.mitigation}
                    onChange={(e) => setNewItem({ ...newItem, mitigation: e.target.value })}
                    className="bg-[#0A0A0A] border-white/10 focus:border-[#00f0ff]/50 font-mono text-sm"
                  />
                </>
              )}
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
                  onClick={addItem}
                  className="font-mono text-xs uppercase bg-[#00f0ff] text-black hover:bg-[#00f0ff]/90"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Items list */}
        <div className="space-y-6">
          {/* Risks */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h4 className="font-mono text-xs text-slate-400 uppercase tracking-wider">Risks ({risks.length})</h4>
            </div>
            {risks.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-600 border border-dashed border-white/10 font-mono">
                No risks identified
              </div>
            ) : (
              <div className="space-y-2">
                {risks.sort((a, b) => getRiskScore(b) - getRiskScore(a)).map((item) => (
                  <div
                    key={item.id}
                    className="group bg-[#0F0F0F] border border-white/5 overflow-hidden"
                  >
                    <div 
                      className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/[0.02]"
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    >
                      <div className={cn(
                        "w-8 h-8 flex items-center justify-center text-xs font-bold font-mono",
                        getRiskScore(item) >= 6 ? "bg-red-500/20 text-red-500" :
                        getRiskScore(item) >= 3 ? "bg-amber-500/20 text-amber-500" :
                        "bg-green-500/20 text-green-500"
                      )}>
                        {getRiskScore(item)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm text-white truncate">{item.title}</p>
                        <div className="flex gap-2 mt-1">
                          <span className={cn(
                            "px-2 py-0.5 text-[10px] font-mono uppercase border",
                            IMPACT_CONFIG[item.impact].color
                          )}>
                            {item.impact}
                          </span>
                          <span className={cn("text-[10px] font-mono", LIKELIHOOD_CONFIG[item.likelihood].color)}>
                            {LIKELIHOOD_CONFIG[item.likelihood].label}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-500"
                        onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      {expandedId === item.id ? <ChevronUp className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
                    </div>
                    
                    {expandedId === item.id && (
                      <div className="px-3 pb-3 text-sm text-slate-400 animate-in fade-in-0 slide-in-from-top-2">
                        {item.description && <p className="mb-2 font-mono text-xs">{item.description}</p>}
                        {item.mitigation && (
                          <div className="p-2 bg-green-500/5 border border-green-500/20">
                            <span className="text-[10px] font-mono text-green-500 uppercase tracking-wider">Mitigation:</span>
                            <p className="text-white font-mono text-xs mt-1">{item.mitigation}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Constraints */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-blue-500" />
              <h4 className="font-mono text-xs text-slate-400 uppercase tracking-wider">Constraints ({constraints.length})</h4>
            </div>
            {constraints.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-600 border border-dashed border-white/10 font-mono">
                No constraints defined
              </div>
            ) : (
              <div className="space-y-2">
                {constraints.map((item) => (
                  <div
                    key={item.id}
                    className="group flex items-start gap-3 p-3 bg-[#0F0F0F] border border-white/5"
                  >
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm text-white">{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-slate-500 font-mono mt-1">{item.description}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-500"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
