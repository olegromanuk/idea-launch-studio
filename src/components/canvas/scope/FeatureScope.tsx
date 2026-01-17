import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sparkles, 
  Plus, 
  Trash2,
  Layers,
  Star,
  Clock,
  ChevronRight,
  Link2,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FeatureDetailDrawer, Feature } from "./FeatureDetailDrawer";
import { UserStory } from "./UserStoriesList";

export type { Feature };

interface FeatureScopeProps {
  features: Feature[];
  onChange: (features: Feature[]) => void;
  onAIGenerate: () => void;
  isGenerating: boolean;
  availableStories?: UserStory[];
}

const CATEGORY_CONFIG = {
  mvp: { 
    label: "MVP", 
    color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
    icon: Star,
    description: "Must have for launch"
  },
  future: { 
    label: "Future", 
    color: "border-blue-500/30 text-blue-400 bg-blue-500/10",
    icon: Clock,
    description: "Post-launch features"
  },
  "nice-to-have": { 
    label: "Nice to Have", 
    color: "border-purple-500/30 text-purple-400 bg-purple-500/10",
    icon: Layers,
    description: "If time permits"
  },
};

const EFFORT_CONFIG = {
  small: { label: "S", color: "bg-green-500" },
  medium: { label: "M", color: "bg-amber-500" },
  large: { label: "L", color: "bg-red-500" },
};

export const FeatureScope = ({ 
  features, 
  onChange, 
  onAIGenerate, 
  isGenerating,
  availableStories = []
}: FeatureScopeProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [newFeature, setNewFeature] = useState<Partial<Feature>>({
    name: "",
    description: "",
    category: "mvp",
    effort: "medium",
  });

  const addFeature = () => {
    if (!newFeature.name) return;
    
    const feature: Feature = {
      id: crypto.randomUUID(),
      name: newFeature.name,
      description: newFeature.description || "",
      category: newFeature.category || "mvp",
      effort: newFeature.effort || "medium",
      linkedStoryIds: [],
    };
    
    onChange([...features, feature]);
    setNewFeature({ name: "", description: "", category: "mvp", effort: "medium" });
    setIsAdding(false);
  };

  const removeFeature = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(features.filter(f => f.id !== id));
  };

  const handleFeatureClick = (feature: Feature) => {
    setSelectedFeature(feature);
    setIsDrawerOpen(true);
  };

  const handleSaveFeature = (updatedFeature: Feature) => {
    onChange(features.map(f => f.id === updatedFeature.id ? updatedFeature : f));
    setSelectedFeature(null);
  };

  const groupedFeatures = {
    mvp: features.filter(f => f.category === "mvp"),
    future: features.filter(f => f.category === "future"),
    "nice-to-have": features.filter(f => f.category === "nice-to-have"),
  };

  return (
    <>
      <div className="relative bg-[#0A0A0A] border border-white/[0.08] overflow-hidden">
        {/* Blueprint corner accents */}
        <div className="absolute -top-px -left-px w-2 h-2 border-t-2 border-l-2 border-[#00f0ff] opacity-70" />
        <div className="absolute -bottom-px -right-px w-2 h-2 border-b-2 border-r-2 border-[#00f0ff] opacity-70" />
        
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
            <h2 className="font-mono text-xs text-[#00f0ff] uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
              Feature_Scope
            </h2>
            <Layers className="w-5 h-5 text-slate-700" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-3 bg-[#0F0F0F] border-l-2 border-emerald-500">
              <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">MVP</span>
              <span className="text-2xl font-bold text-white tracking-tight font-mono">{groupedFeatures.mvp.length}</span>
            </div>
            <div className="p-3 bg-[#0F0F0F] border-l-2 border-blue-500">
              <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Future</span>
              <span className="text-2xl font-bold text-white tracking-tight font-mono">{groupedFeatures.future.length}</span>
            </div>
            <div className="p-3 bg-[#0F0F0F] border-l-2 border-purple-500">
              <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Nice-to-Have</span>
              <span className="text-2xl font-bold text-white tracking-tight font-mono">{groupedFeatures["nice-to-have"].length}</span>
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
              Add Feature
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

          {/* Add form */}
          {isAdding && (
            <div className="mb-6 p-4 bg-[#0F0F0F] border border-white/10 animate-in fade-in-0 slide-in-from-top-2">
              <div className="grid gap-3">
                <Input
                  placeholder="Feature name"
                  value={newFeature.name}
                  onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
                  className="bg-[#0A0A0A] border-white/10 focus:border-[#00f0ff]/50 font-mono text-sm"
                />
                <Input
                  placeholder="Brief description (optional)"
                  value={newFeature.description}
                  onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                  className="bg-[#0A0A0A] border-white/10 focus:border-[#00f0ff]/50 font-mono text-sm"
                />
                <div className="flex gap-2">
                  {(Object.keys(CATEGORY_CONFIG) as Feature["category"][]).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setNewFeature({ ...newFeature, category: cat })}
                      className={cn(
                        "flex-1 py-2 text-xs font-mono uppercase tracking-wider border transition-all",
                        newFeature.category === cat 
                          ? CATEGORY_CONFIG[cat].color
                          : "border-white/10 text-slate-500 hover:border-white/20"
                      )}
                    >
                      {CATEGORY_CONFIG[cat].label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-slate-500 font-mono uppercase">Effort:</span>
                  {(Object.keys(EFFORT_CONFIG) as Feature["effort"][]).map((e) => (
                    <button
                      key={e}
                      onClick={() => setNewFeature({ ...newFeature, effort: e })}
                      className={cn(
                        "w-10 h-10 flex items-center justify-center text-xs font-mono uppercase border transition-all",
                        newFeature.effort === e 
                          ? "border-[#00f0ff]/50 bg-[#00f0ff]/10 text-[#00f0ff]"
                          : "border-white/10 text-slate-500 hover:border-white/20"
                      )}
                    >
                      {EFFORT_CONFIG[e].label}
                    </button>
                  ))}
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
                    onClick={addFeature}
                    className="font-mono text-xs uppercase bg-[#00f0ff] text-black hover:bg-[#00f0ff]/90"
                  >
                    Add Feature
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Feature categories */}
          <div className="space-y-6">
            {(Object.keys(CATEGORY_CONFIG) as Feature["category"][]).map((category) => {
              const config = CATEGORY_CONFIG[category];
              const Icon = config.icon;
              const categoryFeatures = groupedFeatures[category];
              
              return (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={cn(
                      "w-4 h-4",
                      category === "mvp" ? "text-emerald-500" : 
                      category === "future" ? "text-blue-500" : "text-purple-500"
                    )} />
                    <h4 className="font-mono text-xs text-slate-400 uppercase tracking-wider">{config.label}</h4>
                    <span className="text-xs text-slate-600 font-mono">({categoryFeatures.length})</span>
                  </div>
                  
                  {categoryFeatures.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-600 border border-dashed border-white/10 font-mono">
                      No {config.label.toLowerCase()} features
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      {categoryFeatures.map((feature) => {
                        const linkedCount = feature.linkedStoryIds?.length || 0;
                        
                        return (
                          <div
                            key={feature.id}
                            onClick={() => handleFeatureClick(feature)}
                            className="group flex items-center gap-3 p-3 bg-[#0F0F0F] border border-white/5 hover:border-[#00f0ff]/30 transition-all cursor-pointer relative overflow-hidden"
                          >
                            {/* Hover glow effect */}
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00f0ff]/30 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                            
                            <div className={cn(
                              "w-7 h-7 rounded flex items-center justify-center text-xs font-bold text-white shrink-0 font-mono",
                              EFFORT_CONFIG[feature.effort].color
                            )}>
                              {EFFORT_CONFIG[feature.effort].label}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-white truncate">
                                {feature.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {feature.description && (
                                  <p className="text-xs text-slate-500 truncate">
                                    {feature.description}
                                  </p>
                                )}
                                {linkedCount > 0 && (
                                  <span className="flex items-center gap-1 text-xs text-[#00f0ff] shrink-0">
                                    <Link2 className="w-3 h-3" />
                                    {linkedCount}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-[#00f0ff]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFeatureClick(feature);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => removeFeature(feature.id, e)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                              <ChevronRight className="w-4 h-4 text-slate-600" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feature Detail Drawer */}
      <FeatureDetailDrawer
        feature={selectedFeature}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSave={handleSaveFeature}
        availableStories={availableStories}
      />
    </>
  );
};
