import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  high: { label: "High Impact", color: "bg-red-500/10 text-red-500 border-red-500/30" },
  medium: { label: "Medium Impact", color: "bg-amber-500/10 text-amber-500 border-amber-500/30" },
  low: { label: "Low Impact", color: "bg-green-500/10 text-green-500 border-green-500/30" },
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
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-500" />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">Risks & Constraints</h3>
              <p className="text-sm text-muted-foreground">
                {risks.length} risks • {constraints.length} constraints
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
              Add
            </Button>
            <Button
              size="sm"
              onClick={onAIGenerate}
              disabled={isGenerating}
              className="bg-gradient-to-r from-rose-500 to-red-500 text-white"
            >
              <Sparkles className={cn("w-4 h-4 mr-1", isGenerating && "animate-spin")} />
              {isGenerating ? "Generating..." : "AI Identify"}
            </Button>
          </div>
        </div>

        {/* Add form */}
        {isAdding && (
          <div className="mb-6 p-4 rounded-xl bg-muted/50 border border-border animate-fade-in">
            <div className="grid gap-3">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNewItem({ ...newItem, type: "risk" })}
                  className={cn("flex-1", newItem.type === "risk" && "bg-red-500/10 border-red-500/30")}
                >
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Risk
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNewItem({ ...newItem, type: "constraint" })}
                  className={cn("flex-1", newItem.type === "constraint" && "bg-blue-500/10 border-blue-500/30")}
                >
                  <Info className="w-4 h-4 mr-1" />
                  Constraint
                </Button>
              </div>
              <Input
                placeholder="Title (e.g., Technical complexity)"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="min-h-[60px]"
              />
              {newItem.type === "risk" && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-xs text-muted-foreground mb-1 block">Impact</span>
                      <div className="flex gap-1">
                        {(["low", "medium", "high"] as const).map((v) => (
                          <Button
                            key={v}
                            variant="outline"
                            size="sm"
                            onClick={() => setNewItem({ ...newItem, impact: v })}
                            className={cn("flex-1 text-xs", newItem.impact === v && IMPACT_CONFIG[v].color)}
                          >
                            {v.charAt(0).toUpperCase()}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground mb-1 block">Likelihood</span>
                      <div className="flex gap-1">
                        {(["low", "medium", "high"] as const).map((v) => (
                          <Button
                            key={v}
                            variant="outline"
                            size="sm"
                            onClick={() => setNewItem({ ...newItem, likelihood: v })}
                            className={cn("flex-1 text-xs", newItem.likelihood === v && "ring-2 ring-primary")}
                          >
                            {v.charAt(0).toUpperCase()}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Input
                    placeholder="Mitigation strategy"
                    value={newItem.mitigation}
                    onChange={(e) => setNewItem({ ...newItem, mitigation: e.target.value })}
                  />
                </>
              )}
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button size="sm" onClick={addItem}>Add</Button>
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
              <h4 className="font-semibold text-sm text-foreground">Risks ({risks.length})</h4>
            </div>
            {risks.length === 0 ? (
              <div className="text-center py-4 text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                No risks identified
              </div>
            ) : (
              <div className="space-y-2">
                {risks.sort((a, b) => getRiskScore(b) - getRiskScore(a)).map((item) => (
                  <div
                    key={item.id}
                    className="group rounded-xl border border-border bg-card overflow-hidden"
                  >
                    <div 
                      className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50"
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                        getRiskScore(item) >= 6 ? "bg-red-500/20 text-red-500" :
                        getRiskScore(item) >= 3 ? "bg-amber-500/20 text-amber-500" :
                        "bg-green-500/20 text-green-500"
                      )}>
                        {getRiskScore(item)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{item.title}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className={cn("text-xs", IMPACT_CONFIG[item.impact].color)}>
                            {item.impact}
                          </Badge>
                          <span className={cn("text-xs", LIKELIHOOD_CONFIG[item.likelihood].color)}>
                            {LIKELIHOOD_CONFIG[item.likelihood].label}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                        onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                      {expandedId === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                    
                    {expandedId === item.id && (
                      <div className="px-3 pb-3 text-sm text-muted-foreground animate-fade-in">
                        {item.description && <p className="mb-2">{item.description}</p>}
                        {item.mitigation && (
                          <div className="p-2 rounded-lg bg-success/10 border border-success/20">
                            <span className="text-xs font-medium text-success">Mitigation:</span>
                            <p className="text-foreground mt-1">{item.mitigation}</p>
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
              <h4 className="font-semibold text-sm text-foreground">Constraints ({constraints.length})</h4>
            </div>
            {constraints.length === 0 ? (
              <div className="text-center py-4 text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                No constraints defined
              </div>
            ) : (
              <div className="space-y-2">
                {constraints.map((item) => (
                  <div
                    key={item.id}
                    className="group flex items-start gap-3 p-3 rounded-xl border border-border bg-card"
                  >
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
