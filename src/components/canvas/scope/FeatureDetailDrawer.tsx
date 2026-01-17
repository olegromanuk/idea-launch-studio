import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Layers, 
  Star,
  Clock,
  Plus, 
  Trash2,
  User,
  Link2,
  Unlink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserStory } from "./UserStoriesList";

export interface Feature {
  id: string;
  name: string;
  description: string;
  category: "mvp" | "future" | "nice-to-have";
  effort: "small" | "medium" | "large";
  linkedStoryIds?: string[];
}

interface FeatureDetailDrawerProps {
  feature: Feature | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (feature: Feature) => void;
  availableStories: UserStory[];
}

const CATEGORY_CONFIG = {
  mvp: { 
    label: "MVP", 
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    icon: Star,
  },
  future: { 
    label: "FUTURE", 
    color: "bg-blue-500/20 text-blue-400 border-blue-500/40",
    icon: Clock,
  },
  "nice-to-have": { 
    label: "NICE TO HAVE", 
    color: "bg-purple-500/20 text-purple-400 border-purple-500/40",
    icon: Layers,
  },
};

const EFFORT_CONFIG = {
  small: { label: "Small (S)", points: "1-3 pts", color: "bg-green-500" },
  medium: { label: "Medium (M)", points: "5-8 pts", color: "bg-amber-500" },
  large: { label: "Large (L)", points: "13+ pts", color: "bg-red-500" },
};

export const FeatureDetailDrawer = ({
  feature,
  open,
  onOpenChange,
  onSave,
  availableStories,
}: FeatureDetailDrawerProps) => {
  const [editedFeature, setEditedFeature] = useState<Feature | null>(null);

  // Update editedFeature when feature prop changes
  if (feature && (!editedFeature || editedFeature.id !== feature.id)) {
    setEditedFeature({
      ...feature,
      linkedStoryIds: feature.linkedStoryIds || [],
    });
  }

  if (!editedFeature) return null;

  const handleSave = () => {
    onSave(editedFeature);
    onOpenChange(false);
  };

  const toggleStoryLink = (storyId: string) => {
    const currentLinks = editedFeature.linkedStoryIds || [];
    if (currentLinks.includes(storyId)) {
      setEditedFeature({
        ...editedFeature,
        linkedStoryIds: currentLinks.filter(id => id !== storyId),
      });
    } else {
      setEditedFeature({
        ...editedFeature,
        linkedStoryIds: [...currentLinks, storyId],
      });
    }
  };

  const linkedStories = availableStories.filter(s => 
    editedFeature.linkedStoryIds?.includes(s.id)
  );
  const unlinkedStories = availableStories.filter(s => 
    !editedFeature.linkedStoryIds?.includes(s.id)
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-[hsl(222,47%,8%)] border-l border-cyan-500/30">
        {/* Blueprint corner accents */}
        <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-cyan-500/50" />
        <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-cyan-500/50" />
        <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-cyan-500/50" />
        <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-cyan-500/50" />

        <SheetHeader className="mb-6 pt-4">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Layers className="w-6 h-6 text-white" />
              <div className="absolute inset-0 rounded-xl border border-emerald-400/30" />
            </div>
            <div>
              <SheetTitle className="text-left text-white font-mono tracking-wide text-lg">
                FEATURE DETAILS
              </SheetTitle>
              <p className="text-sm text-cyan-400/70 font-mono">Edit feature and link user stories</p>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Feature Name */}
          <div>
            <label className="text-xs font-mono text-gray-400 mb-2 block uppercase tracking-wider">Feature Name</label>
            <Input
              value={editedFeature.name}
              onChange={(e) => setEditedFeature({ ...editedFeature, name: e.target.value })}
              placeholder="Feature name"
              className="bg-[hsl(222,47%,6%)] border-cyan-500/20 text-white font-mono placeholder:text-gray-600 focus:border-cyan-500/50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-mono text-gray-400 mb-2 block uppercase tracking-wider">Description</label>
            <Textarea
              value={editedFeature.description}
              onChange={(e) => setEditedFeature({ ...editedFeature, description: e.target.value })}
              placeholder="Describe the feature..."
              rows={3}
              className="bg-[hsl(222,47%,6%)] border-cyan-500/20 text-white font-mono placeholder:text-gray-600 focus:border-cyan-500/50 resize-none"
            />
          </div>

          {/* Category & Effort */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-gray-400 mb-2 block uppercase tracking-wider">Category</label>
              <Select
                value={editedFeature.category}
                onValueChange={(value) => setEditedFeature({ ...editedFeature, category: value as Feature["category"] })}
              >
                <SelectTrigger className="bg-[hsl(222,47%,6%)] border-cyan-500/20 text-white font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(222,47%,6%)] border-cyan-500/30">
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key} className="font-mono text-white hover:bg-cyan-500/10">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn("text-xs font-mono border", config.color)}>
                          {config.label}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-mono text-gray-400 mb-2 block uppercase tracking-wider">Effort</label>
              <Select
                value={editedFeature.effort}
                onValueChange={(value) => setEditedFeature({ ...editedFeature, effort: value as Feature["effort"] })}
              >
                <SelectTrigger className="bg-[hsl(222,47%,6%)] border-cyan-500/20 text-white font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(222,47%,6%)] border-cyan-500/30">
                  {Object.entries(EFFORT_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key} className="font-mono text-white hover:bg-cyan-500/10">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-3 h-3 rounded-full", config.color)} />
                        <span>{config.label}</span>
                        <span className="text-xs text-gray-500">({config.points})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Linked User Stories */}
          <div>
            <label className="text-xs font-mono text-gray-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
              <Link2 className="w-3 h-3 text-cyan-400" />
              Linked User Stories
              <Badge variant="outline" className="ml-auto font-mono text-xs bg-cyan-500/10 border-cyan-500/30 text-cyan-400">
                {linkedStories.length} linked
              </Badge>
            </label>

            {linkedStories.length > 0 && (
              <div className="space-y-2 mb-4">
                {linkedStories.map((story) => (
                  <div
                    key={story.id}
                    className="relative flex items-start gap-3 p-3 rounded-lg bg-violet-500/5 border border-violet-500/20"
                  >
                    <div className="absolute top-2 left-2 w-2 h-2 border-l border-t border-violet-500/40" />
                    <div className="absolute top-2 right-2 w-2 h-2 border-r border-t border-violet-500/40" />
                    
                    <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono text-gray-300">
                        As a <span className="text-violet-400">{story.persona}</span>, 
                        I want to <span className="text-white">{story.action}</span>
                      </p>
                      <p className="text-xs text-gray-500 font-mono mt-1">
                        {story.benefit}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-500 hover:text-red-400 hover:bg-red-500/10 shrink-0"
                      onClick={() => toggleStoryLink(story.id)}
                    >
                      <Unlink className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Available stories to link */}
            {unlinkedStories.length > 0 && (
              <div>
                <p className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-wider">Available stories to link:</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {unlinkedStories.map((story) => (
                    <div
                      key={story.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-[hsl(222,47%,6%)] border border-cyan-500/20 hover:border-cyan-500/40 cursor-pointer transition-all duration-200"
                      onClick={() => toggleStoryLink(story.id)}
                    >
                      <Checkbox
                        checked={false}
                        className="mt-1 border-cyan-500/40"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-mono text-gray-300">
                          As a <span className="text-violet-400">{story.persona}</span>, 
                          I want to <span className="text-white">{story.action}</span>
                        </p>
                      </div>
                      <Plus className="w-4 h-4 text-cyan-400 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {availableStories.length === 0 && (
              <div className="relative text-center py-8 border border-dashed border-cyan-500/20 rounded-lg bg-[hsl(222,47%,6%)]">
                <div className="absolute top-2 left-2 w-3 h-3 border-l border-t border-cyan-500/30" />
                <div className="absolute top-2 right-2 w-3 h-3 border-r border-t border-cyan-500/30" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-l border-b border-cyan-500/30" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-r border-b border-cyan-500/30" />
                
                <User className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p className="text-sm font-mono text-gray-500">No user stories available</p>
                <p className="text-xs font-mono text-gray-600 mt-1">Create user stories first to link them here</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-cyan-500/20">
            <Button 
              variant="outline" 
              className="flex-1 font-mono bg-transparent border-gray-600 text-gray-400 hover:bg-white/5 hover:text-white hover:border-gray-500" 
              onClick={() => onOpenChange(false)}
            >
              CANCEL
            </Button>
            <Button 
              className="flex-1 font-mono bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/20" 
              onClick={handleSave}
            >
              SAVE CHANGES
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
