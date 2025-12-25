import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Trash2, 
  Users, 
  Target, 
  MapPin, 
  Briefcase,
  DollarSign,
  Heart,
  Sparkles,
  GripVertical
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AudienceSegment {
  id: string;
  name: string;
  description: string;
  demographics: {
    ageRange: string;
    gender: string;
    location: string;
    income: string;
    occupation: string;
  };
  psychographics: {
    interests: string[];
    painPoints: string[];
    goals: string[];
    behaviors: string[];
  };
  isPrimary: boolean;
}

interface TargetAudienceBuilderProps {
  segments: AudienceSegment[];
  onChange: (segments: AudienceSegment[]) => void;
  onAIGenerate?: () => void;
  isGenerating?: boolean;
}

export const TargetAudienceBuilder = ({
  segments,
  onChange,
  onAIGenerate,
  isGenerating = false,
}: TargetAudienceBuilderProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addSegment = () => {
    const newSegment: AudienceSegment = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      demographics: {
        ageRange: "25-34",
        gender: "All",
        location: "",
        income: "",
        occupation: "",
      },
      psychographics: {
        interests: [],
        painPoints: [],
        goals: [],
        behaviors: [],
      },
      isPrimary: segments.length === 0,
    };
    onChange([...segments, newSegment]);
    setExpandedId(newSegment.id);
  };

  const updateSegment = (id: string, updates: Partial<AudienceSegment>) => {
    onChange(segments.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteSegment = (id: string) => {
    onChange(segments.filter(s => s.id !== id));
  };

  const addTag = (segmentId: string, field: keyof AudienceSegment["psychographics"], value: string) => {
    const segment = segments.find(s => s.id === segmentId);
    if (segment && value.trim()) {
      updateSegment(segmentId, {
        psychographics: {
          ...segment.psychographics,
          [field]: [...segment.psychographics[field], value.trim()],
        },
      });
    }
  };

  const removeTag = (segmentId: string, field: keyof AudienceSegment["psychographics"], index: number) => {
    const segment = segments.find(s => s.id === segmentId);
    if (segment) {
      updateSegment(segmentId, {
        psychographics: {
          ...segment.psychographics,
          [field]: segment.psychographics[field].filter((_, i) => i !== index),
        },
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Define your target audience segments to create focused marketing strategies
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
              Generate Segments
            </Button>
          )}
          <Button onClick={addSegment} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Segment
          </Button>
        </div>
      </div>

      {/* Segments List */}
      <div className="space-y-4">
        {segments.map((segment) => (
          <Card
            key={segment.id}
            className={cn(
              "overflow-hidden transition-all",
              segment.isPrimary && "ring-2 ring-primary/50"
            )}
          >
            {/* Segment Header */}
            <div
              className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setExpandedId(expandedId === segment.id ? null : segment.id)}
            >
              <div className="flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Input
                      value={segment.name}
                      onChange={(e) => updateSegment(segment.id, { name: e.target.value })}
                      placeholder="Segment Name"
                      className="font-medium border-none p-0 h-auto text-foreground bg-transparent focus-visible:ring-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {segment.isPrimary && (
                      <Badge className="bg-primary/10 text-primary border-primary/30">
                        Primary
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {segment.demographics.ageRange} • {segment.demographics.location || "Location not set"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSegment(segment.id);
                  }}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedId === segment.id && (
              <div className="p-4 pt-0 space-y-6 border-t border-border">
                {/* Description */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
                  <Textarea
                    value={segment.description}
                    onChange={(e) => updateSegment(segment.id, { description: e.target.value })}
                    placeholder="Describe this audience segment..."
                    className="min-h-[80px]"
                  />
                </div>

                {/* Demographics Grid */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Demographics
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Age Range</label>
                      <Select
                        value={segment.demographics.ageRange}
                        onValueChange={(v) => updateSegment(segment.id, {
                          demographics: { ...segment.demographics, ageRange: v }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="18-24">18-24</SelectItem>
                          <SelectItem value="25-34">25-34</SelectItem>
                          <SelectItem value="35-44">35-44</SelectItem>
                          <SelectItem value="45-54">45-54</SelectItem>
                          <SelectItem value="55-64">55-64</SelectItem>
                          <SelectItem value="65+">65+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Gender</label>
                      <Select
                        value={segment.demographics.gender}
                        onValueChange={(v) => updateSegment(segment.id, {
                          demographics: { ...segment.demographics, gender: v }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All</SelectItem>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Location
                      </label>
                      <Input
                        value={segment.demographics.location}
                        onChange={(e) => updateSegment(segment.id, {
                          demographics: { ...segment.demographics, location: e.target.value }
                        })}
                        placeholder="e.g., US, Europe"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> Income
                      </label>
                      <Input
                        value={segment.demographics.income}
                        onChange={(e) => updateSegment(segment.id, {
                          demographics: { ...segment.demographics, income: e.target.value }
                        })}
                        placeholder="e.g., $50k-100k"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1">
                        <Briefcase className="w-3 h-3" /> Occupation
                      </label>
                      <Input
                        value={segment.demographics.occupation}
                        onChange={(e) => updateSegment(segment.id, {
                          demographics: { ...segment.demographics, occupation: e.target.value }
                        })}
                        placeholder="e.g., Software Engineers, Marketers"
                      />
                    </div>
                  </div>
                </div>

                {/* Psychographics */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-primary" />
                    Psychographics
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(["interests", "painPoints", "goals", "behaviors"] as const).map((field) => (
                      <div key={field}>
                        <label className="text-xs text-muted-foreground mb-2 block capitalize">
                          {field.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {segment.psychographics[field].map((tag, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="gap-1 cursor-pointer hover:bg-destructive/10"
                              onClick={() => removeTag(segment.id, field, i)}
                            >
                              {tag}
                              <Trash2 className="w-3 h-3" />
                            </Badge>
                          ))}
                        </div>
                        <Input
                          placeholder={`Add ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}...`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              addTag(segment.id, field, e.currentTarget.value);
                              e.currentTarget.value = "";
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Set as Primary */}
                {!segment.isPrimary && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      onChange(segments.map(s => ({
                        ...s,
                        isPrimary: s.id === segment.id
                      })));
                    }}
                  >
                    Set as Primary Segment
                  </Button>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {segments.length === 0 && (
        <div className="text-center py-12 rounded-lg bg-muted/30 border border-dashed border-border">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Audience Segments</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create audience segments to define who you're targeting
          </p>
          <Button onClick={addSegment} className="gap-2">
            <Plus className="w-4 h-4" />
            Create First Segment
          </Button>
        </div>
      )}
    </div>
  );
};
