import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

// Re-export Feature type
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
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    icon: Star,
    description: "Must have for launch"
  },
  future: { 
    label: "Future", 
    color: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    icon: Clock,
    description: "Post-launch features"
  },
  "nice-to-have": { 
    label: "Nice to Have", 
    color: "bg-purple-500/10 text-purple-500 border-purple-500/30",
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

  const updateCategory = (id: string, category: Feature["category"], e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(features.map(f => f.id === id ? { ...f, category } : f));
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
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
        
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">Feature Scope</h3>
                <p className="text-sm text-muted-foreground">
                  {groupedFeatures.mvp.length} MVP • {groupedFeatures.future.length} Future
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
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
              >
                <Sparkles className={cn("w-4 h-4 mr-1", isGenerating && "animate-spin")} />
                {isGenerating ? "Adding..." : "AI Generate"}
              </Button>
            </div>
          </div>

          {/* Add form */}
          {isAdding && (
            <div className="mb-6 p-4 rounded-xl bg-muted/50 border border-border animate-fade-in">
              <div className="grid gap-3">
                <Input
                  placeholder="Feature name"
                  value={newFeature.name}
                  onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
                />
                <Input
                  placeholder="Brief description (optional)"
                  value={newFeature.description}
                  onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                />
                <div className="flex gap-2">
                  {(Object.keys(CATEGORY_CONFIG) as Feature["category"][]).map((cat) => (
                    <Button
                      key={cat}
                      variant="outline"
                      size="sm"
                      onClick={() => setNewFeature({ ...newFeature, category: cat })}
                      className={cn(
                        "flex-1",
                        newFeature.category === cat && CATEGORY_CONFIG[cat].color
                      )}
                    >
                      {CATEGORY_CONFIG[cat].label}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <span className="text-sm text-muted-foreground self-center mr-2">Effort:</span>
                  {(Object.keys(EFFORT_CONFIG) as Feature["effort"][]).map((e) => (
                    <Button
                      key={e}
                      variant="outline"
                      size="sm"
                      onClick={() => setNewFeature({ ...newFeature, effort: e })}
                      className={cn(
                        "w-10",
                        newFeature.effort === e && "ring-2 ring-primary"
                      )}
                    >
                      {EFFORT_CONFIG[e].label}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={addFeature}>
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
                    <Icon className={cn("w-4 h-4", category === "mvp" ? "text-emerald-500" : category === "future" ? "text-blue-500" : "text-purple-500")} />
                    <h4 className="font-semibold text-sm text-foreground">{config.label}</h4>
                    <span className="text-xs text-muted-foreground">({categoryFeatures.length})</span>
                  </div>
                  
                  {categoryFeatures.length === 0 ? (
                    <div className="text-center py-4 text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                      No {config.label.toLowerCase()} features yet
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      {categoryFeatures.map((feature) => {
                        const linkedCount = feature.linkedStoryIds?.length || 0;
                        
                        return (
                          <div
                            key={feature.id}
                            onClick={() => handleFeatureClick(feature)}
                            className="group flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
                          >
                            <div className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0",
                              EFFORT_CONFIG[feature.effort].color
                            )}>
                              {EFFORT_CONFIG[feature.effort].label}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-foreground truncate">
                                {feature.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {feature.description && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    {feature.description}
                                  </p>
                                )}
                                {linkedCount > 0 && (
                                  <Badge variant="secondary" className="text-xs shrink-0">
                                    <Link2 className="w-3 h-3 mr-1" />
                                    {linkedCount} {linkedCount === 1 ? 'story' : 'stories'}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
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
                                className="h-7 w-7 p-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => removeFeature(feature.id, e)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
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
      </Card>

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
