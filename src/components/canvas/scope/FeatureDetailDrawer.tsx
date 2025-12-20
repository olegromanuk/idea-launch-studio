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
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    icon: Star,
  },
  future: { 
    label: "Future", 
    color: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    icon: Clock,
  },
  "nice-to-have": { 
    label: "Nice to Have", 
    color: "bg-purple-500/10 text-purple-500 border-purple-500/30",
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
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <SheetTitle className="text-left">Feature Details</SheetTitle>
              <p className="text-sm text-muted-foreground">Edit feature and link user stories</p>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Feature Name */}
          <div>
            <label className="text-sm font-medium mb-2 block">Feature Name</label>
            <Input
              value={editedFeature.name}
              onChange={(e) => setEditedFeature({ ...editedFeature, name: e.target.value })}
              placeholder="Feature name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <Textarea
              value={editedFeature.description}
              onChange={(e) => setEditedFeature({ ...editedFeature, description: e.target.value })}
              placeholder="Describe the feature..."
              rows={3}
            />
          </div>

          {/* Category & Effort */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select
                value={editedFeature.category}
                onValueChange={(value) => setEditedFeature({ ...editedFeature, category: value as Feature["category"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn("text-xs", config.color)}>
                          {config.label}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Effort</label>
              <Select
                value={editedFeature.effort}
                onValueChange={(value) => setEditedFeature({ ...editedFeature, effort: value as Feature["effort"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EFFORT_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-4 h-4 rounded-full", config.color)} />
                        <span>{config.label}</span>
                        <span className="text-xs text-muted-foreground">({config.points})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Linked User Stories */}
          <div>
            <label className="text-sm font-medium mb-3 block flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Linked User Stories
              <Badge variant="secondary" className="ml-auto">
                {linkedStories.length} linked
              </Badge>
            </label>

            {linkedStories.length > 0 && (
              <div className="space-y-2 mb-4">
                {linkedStories.map((story) => (
                  <div
                    key={story.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20"
                  >
                    <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-violet-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        As a <span className="font-medium text-violet-500">{story.persona}</span>, 
                        I want to <span className="font-medium">{story.action}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {story.benefit}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive shrink-0"
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
                <p className="text-xs text-muted-foreground mb-2">Available stories to link:</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {unlinkedStories.map((story) => (
                    <div
                      key={story.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border hover:border-primary/30 cursor-pointer transition-colors"
                      onClick={() => toggleStoryLink(story.id)}
                    >
                      <Checkbox
                        checked={false}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          As a <span className="font-medium text-violet-500">{story.persona}</span>, 
                          I want to <span className="font-medium">{story.action}</span>
                        </p>
                      </div>
                      <Plus className="w-4 h-4 text-muted-foreground shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {availableStories.length === 0 && (
              <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg">
                <User className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No user stories available</p>
                <p className="text-xs mt-1">Create user stories first to link them here</p>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
