import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  GripVertical,
  ChevronDown,
  ChevronUp,
  Zap,
  Brain
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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

  const primarySegment = segments.find(s => s.isPrimary);
  const secondarySegments = segments.filter(s => !s.isPrimary);

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">
            {segments.length} SEGMENT{segments.length !== 1 ? 'S' : ''} DEFINED
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onAIGenerate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAIGenerate}
              disabled={isGenerating}
              className="gap-2 border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
            >
              <Brain className={cn("w-4 h-4", isGenerating && "animate-spin")} />
              AI Analyze
            </Button>
          )}
          <Button onClick={addSegment} size="sm" className="gap-2 bg-cyan-600 hover:bg-cyan-500">
            <Plus className="w-4 h-4" />
            Add Segment
          </Button>
        </div>
      </div>

      {/* Segments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {segments.map((segment) => (
            <motion.div
              key={segment.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "rounded-xl border backdrop-blur-sm overflow-hidden",
                "bg-gradient-to-br from-white/[0.05] to-transparent",
                segment.isPrimary && "ring-1 ring-cyan-500/50",
                expandedId === segment.id ? "border-cyan-500/50" : "border-white/10"
              )}
            >
              {/* Segment Header */}
              <div
                className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
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
                        className="font-medium border-none p-0 h-auto text-white bg-transparent focus-visible:ring-0"
                        onClick={(e) => e.stopPropagation()}
                      />
                      {segment.isPrimary && (
                        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-[10px] font-mono">
                          PRIMARY
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {segment.demographics.ageRange} • {segment.demographics.location || "Location not set"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSegment(segment.id);
                      }}
                      className="h-8 w-8 text-destructive/60 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    {expandedId === segment.id ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {expandedId === segment.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 space-y-6 border-t border-white/10">
                      {/* Description */}
                      <div>
                        <label className="text-[10px] font-mono text-cyan-500 uppercase mb-2 block">Description</label>
                        <Textarea
                          value={segment.description}
                          onChange={(e) => updateSegment(segment.id, { description: e.target.value })}
                          placeholder="Describe this audience segment..."
                          className="min-h-[80px] bg-black/40 border-white/10"
                        />
                      </div>

                      {/* Demographics Grid */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Target className="w-4 h-4 text-cyan-500" />
                          <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">Demographics</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1 block">Age Range</label>
                            <Select
                              value={segment.demographics.ageRange}
                              onValueChange={(v) => updateSegment(segment.id, {
                                demographics: { ...segment.demographics, ageRange: v }
                              })}
                            >
                              <SelectTrigger className="bg-black/40 border-white/10">
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
                            <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1 block">Gender</label>
                            <Select
                              value={segment.demographics.gender}
                              onValueChange={(v) => updateSegment(segment.id, {
                                demographics: { ...segment.demographics, gender: v }
                              })}
                            >
                              <SelectTrigger className="bg-black/40 border-white/10">
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
                            <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1 block flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> Location
                            </label>
                            <Input
                              value={segment.demographics.location}
                              onChange={(e) => updateSegment(segment.id, {
                                demographics: { ...segment.demographics, location: e.target.value }
                              })}
                              placeholder="e.g., US, Europe"
                              className="bg-black/40 border-white/10"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1 block flex items-center gap-1">
                              <DollarSign className="w-3 h-3" /> Income
                            </label>
                            <Input
                              value={segment.demographics.income}
                              onChange={(e) => updateSegment(segment.id, {
                                demographics: { ...segment.demographics, income: e.target.value }
                              })}
                              placeholder="e.g., $50k-100k"
                              className="bg-black/40 border-white/10"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1 block flex items-center gap-1">
                              <Briefcase className="w-3 h-3" /> Occupation
                            </label>
                            <Input
                              value={segment.demographics.occupation}
                              onChange={(e) => updateSegment(segment.id, {
                                demographics: { ...segment.demographics, occupation: e.target.value }
                              })}
                              placeholder="e.g., Software Engineers, Marketers"
                              className="bg-black/40 border-white/10"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Psychographics */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Heart className="w-4 h-4 text-cyan-500" />
                          <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">Psychographics</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(["interests", "painPoints", "goals", "behaviors"] as const).map((field) => (
                            <div key={field}>
                              <label className="text-[10px] font-mono text-muted-foreground uppercase mb-2 block">
                                {field.replace(/([A-Z])/g, ' $1').trim()}
                              </label>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {segment.psychographics[field].map((tag, i) => (
                                  <Badge
                                    key={i}
                                    variant="secondary"
                                    className="gap-1 cursor-pointer hover:bg-destructive/20 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                                    onClick={() => removeTag(segment.id, field, i)}
                                  >
                                    {tag}
                                    <Trash2 className="w-3 h-3" />
                                  </Badge>
                                ))}
                              </div>
                              <Input
                                placeholder={`Add ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}...`}
                                className="bg-black/40 border-white/10"
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
                          className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Set as Primary Segment
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {segments.length === 0 && (
        <div className="text-center py-16 rounded-xl bg-black/40 border border-dashed border-white/10">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Audience Segments</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create audience segments to define who you're targeting
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button onClick={addSegment} className="gap-2 bg-cyan-600 hover:bg-cyan-500">
              <Plus className="w-4 h-4" />
              Create First Segment
            </Button>
            {onAIGenerate && (
              <Button 
                variant="outline" 
                onClick={onAIGenerate}
                disabled={isGenerating}
                className="gap-2 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
              >
                <Brain className="w-4 h-4" />
                AI Generate
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
