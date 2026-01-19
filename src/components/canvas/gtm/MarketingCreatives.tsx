import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Video,
  FileText,
  Megaphone,
  Sparkles,
  Copy,
  Eye,
  Edit3,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Upload,
  Palette,
  Type,
  Wand2,
  Monitor,
  Smartphone,
  Search,
  Sliders,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface Creative {
  id: string;
  type: "image" | "video" | "copy" | "ad";
  title: string;
  description: string;
  platform: string;
  dimensions?: string;
  headline?: string;
  body?: string;
  cta?: string;
  status: "draft" | "review" | "approved";
  tags: string[];
  visualTone?: string;
  saturation?: number;
  contrast?: number;
}

interface MarketingCreativesProps {
  creatives: Creative[];
  onChange: (creatives: Creative[]) => void;
  onAIGenerate?: () => void;
  isGenerating?: boolean;
}

const PLATFORMS = [
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "facebook", label: "Facebook", icon: Facebook },
  { value: "twitter", label: "Twitter/X", icon: Twitter },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "google", label: "Google Ads", icon: Megaphone },
  { value: "other", label: "Other", icon: FileText },
];

const DIMENSIONS = {
  instagram: ["1080x1080 (Square)", "1080x1350 (Portrait)", "1080x608 (Landscape)", "1080x1920 (Story)"],
  facebook: ["1200x628 (Link)", "1200x1200 (Square)", "1080x1920 (Story)"],
  twitter: ["1200x675 (Summary)", "800x800 (Square)"],
  linkedin: ["1200x627 (Link)", "1200x1200 (Square)"],
  google: ["300x250 (Medium Rectangle)", "728x90 (Leaderboard)", "160x600 (Skyscraper)"],
  other: ["Custom"],
};

const VISUAL_TONES = ["Professional", "Playful", "Bold", "Minimal", "Luxurious", "Tech-forward"];

export const MarketingCreatives = ({
  creatives,
  onChange,
  onAIGenerate,
  isGenerating = false,
}: MarketingCreativesProps) => {
  const [activeTab, setActiveTab] = useState<Creative["type"]>("ad");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [searchQuery, setSearchQuery] = useState("");

  const addCreative = (type: Creative["type"]) => {
    const newCreative: Creative = {
      id: crypto.randomUUID(),
      type,
      title: "",
      description: "",
      platform: "instagram",
      headline: "",
      body: "",
      cta: "Learn More",
      status: "draft",
      tags: [],
      visualTone: "Professional",
      saturation: 0,
      contrast: 0,
    };
    onChange([...creatives, newCreative]);
    setEditingId(newCreative.id);
  };

  const updateCreative = (id: string, updates: Partial<Creative>) => {
    onChange(creatives.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCreative = (id: string) => {
    onChange(creatives.filter(c => c.id !== id));
  };

  const duplicateCreative = (creative: Creative) => {
    const newCreative = {
      ...creative,
      id: crypto.randomUUID(),
      title: `${creative.title} (Copy)`,
      status: "draft" as const,
    };
    onChange([...creatives, newCreative]);
  };

  const addTag = (creativeId: string, tag: string) => {
    const creative = creatives.find(c => c.id === creativeId);
    if (creative && tag.trim()) {
      const formattedTag = tag.startsWith("#") ? tag.trim() : `#${tag.trim()}`;
      updateCreative(creativeId, {
        tags: [...creative.tags, formattedTag],
      });
    }
  };

  const removeTag = (creativeId: string, index: number) => {
    const creative = creatives.find(c => c.id === creativeId);
    if (creative) {
      updateCreative(creativeId, {
        tags: creative.tags.filter((_, i) => i !== index),
      });
    }
  };

  const filteredCreatives = creatives.filter(c => 
    c.type === activeTab && 
    (searchQuery === "" || c.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getTypeIcon = (type: Creative["type"]) => {
    switch (type) {
      case "image": return ImageIcon;
      case "video": return Video;
      case "copy": return FileText;
      case "ad": return Megaphone;
    }
  };

  const getPlatformIcon = (platform: string) => {
    return PLATFORMS.find(p => p.value === platform)?.icon || FileText;
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-48 bg-black/40 border-white/10 font-mono text-sm"
            />
          </div>
          
          {/* View Mode */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-black/40 border border-white/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("desktop")}
              className={cn(
                "h-7 px-2",
                viewMode === "desktop" && "bg-cyan-500/20 text-cyan-400"
              )}
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("mobile")}
              className={cn(
                "h-7 px-2",
                viewMode === "mobile" && "bg-cyan-500/20 text-cyan-400"
              )}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-white/10 bg-black/40 hover:bg-white/5"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">UPLOAD</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onAIGenerate}
            disabled={isGenerating}
            className="gap-2 border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
          >
            <Wand2 className={cn("w-4 h-4", isGenerating && "animate-spin")} />
            <span className="hidden sm:inline">GENERATE</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-white/10 bg-black/40 hover:bg-white/5"
          >
            <Sliders className="w-4 h-4" />
            <span className="hidden sm:inline">FORMAT</span>
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar - Library */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            <div className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest mb-2">LIBRARY</div>
            
            {/* Format Tabs */}
            <div className="space-y-1">
              {[
                { value: "ad", label: "Ads", icon: Megaphone, count: creatives.filter(c => c.type === "ad").length },
                { value: "copy", label: "Copy", icon: Type, count: creatives.filter(c => c.type === "copy").length },
                { value: "image", label: "Images", icon: ImageIcon, count: creatives.filter(c => c.type === "image").length },
                { value: "video", label: "Videos", icon: Video, count: creatives.filter(c => c.type === "video").length },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value as Creative["type"])}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-mono transition-all",
                    activeTab === tab.value 
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" 
                      : "text-muted-foreground hover:bg-white/5 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-white/10">
                    {tab.count}
                  </Badge>
                </button>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4 mt-4">
              <div className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest mb-2">ASSETS</div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center justify-between py-1">
                  <span>Images</span>
                  <span className="font-mono">{creatives.filter(c => c.type === "image").length}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span>Video Clips</span>
                  <span className="font-mono">{creatives.filter(c => c.type === "video").length}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span>Copy Variations</span>
                  <span className="font-mono">{creatives.filter(c => c.type === "copy").length}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-cyan-400">Generated</span>
                  <span className="font-mono text-cyan-400">{creatives.filter(c => c.status === "approved").length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-6">
          <div className="space-y-4">
            {/* Creative Cards */}
            <AnimatePresence mode="popLayout">
              {filteredCreatives.map((creative) => {
                const Icon = getTypeIcon(creative.type);
                const PlatformIcon = getPlatformIcon(creative.platform);
                const isEditing = editingId === creative.id;

                return (
                  <motion.div
                    key={creative.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={cn(
                      "rounded-xl border backdrop-blur-sm overflow-hidden",
                      "bg-gradient-to-br from-white/[0.05] to-transparent",
                      isEditing ? "border-cyan-500/50" : "border-white/10"
                    )}
                  >
                    {/* Creative Preview */}
                    <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                      <Icon className="w-16 h-16 text-white/10" />
                      
                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-mono uppercase",
                            creative.status === "approved" && "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                            creative.status === "review" && "bg-amber-500/20 text-amber-400 border-amber-500/30",
                            creative.status === "draft" && "bg-white/10 text-muted-foreground border-white/10"
                          )}
                        >
                          {creative.status}
                        </Badge>
                      </div>

                      {/* Platform Badge */}
                      <div className="absolute bottom-3 left-3">
                        <Badge variant="secondary" className="gap-1 bg-black/60 border border-white/10">
                          <PlatformIcon className="w-3 h-3" />
                          {PLATFORMS.find(p => p.value === creative.platform)?.label}
                        </Badge>
                      </div>

                      {/* Adjustments Display */}
                      {(creative.saturation !== 0 || creative.contrast !== 0) && (
                        <div className="absolute top-3 left-3 flex flex-col gap-1">
                          {creative.saturation !== 0 && (
                            <Badge variant="outline" className="text-[10px] bg-black/60 border-white/10">
                              SAT {creative.saturation > 0 ? '+' : ''}{creative.saturation}%
                            </Badge>
                          )}
                          {creative.contrast !== 0 && (
                            <Badge variant="outline" className="text-[10px] bg-black/60 border-white/10">
                              CON {creative.contrast > 0 ? '+' : ''}{creative.contrast}%
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Creative Content */}
                    <div className="p-4 space-y-4">
                      {isEditing ? (
                        <>
                          <Input
                            value={creative.title}
                            onChange={(e) => updateCreative(creative.id, { title: e.target.value })}
                            placeholder="Creative Title"
                            className="font-medium bg-black/40 border-white/10"
                          />
                          
                          <div className="grid grid-cols-2 gap-2">
                            <Select
                              value={creative.platform}
                              onValueChange={(v) => updateCreative(creative.id, { platform: v })}
                            >
                              <SelectTrigger className="bg-black/40 border-white/10">
                                <SelectValue placeholder="Platform" />
                              </SelectTrigger>
                              <SelectContent>
                                {PLATFORMS.map((p) => (
                                  <SelectItem key={p.value} value={p.value}>
                                    <div className="flex items-center gap-2">
                                      <p.icon className="w-4 h-4" />
                                      {p.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select
                              value={creative.status}
                              onValueChange={(v) => updateCreative(creative.id, { status: v as Creative["status"] })}
                            >
                              <SelectTrigger className="bg-black/40 border-white/10">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="review">In Review</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {(creative.type === "ad" || creative.type === "copy") && (
                            <>
                              <Input
                                value={creative.headline || ""}
                                onChange={(e) => updateCreative(creative.id, { headline: e.target.value })}
                                placeholder="Headline"
                                className="bg-black/40 border-white/10"
                              />
                              <Textarea
                                value={creative.body || ""}
                                onChange={(e) => updateCreative(creative.id, { body: e.target.value })}
                                placeholder="Body copy..."
                                className="min-h-[100px] bg-black/40 border-white/10"
                              />
                              <Input
                                value={creative.cta || ""}
                                onChange={(e) => updateCreative(creative.id, { cta: e.target.value })}
                                placeholder="Call to Action"
                                className="bg-black/40 border-white/10"
                              />
                            </>
                          )}

                          {/* Tags */}
                          <div>
                            <label className="text-[10px] font-mono text-cyan-500 uppercase mb-2 block">Tags</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {creative.tags.map((tag, i) => (
                                <Badge
                                  key={i}
                                  variant="secondary"
                                  className="gap-1 cursor-pointer hover:bg-destructive/20 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                                  onClick={() => removeTag(creative.id, i)}
                                >
                                  {tag}
                                  <Trash2 className="w-3 h-3" />
                                </Badge>
                              ))}
                            </div>
                            <Input
                              placeholder="Add tag and press Enter..."
                              className="bg-black/40 border-white/10"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  addTag(creative.id, e.currentTarget.value);
                                  e.currentTarget.value = "";
                                }
                              }}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <h4 className="font-medium text-white">
                            {creative.title || "Untitled Creative"}
                          </h4>
                          {creative.headline && (
                            <p className="text-sm font-medium text-white/80">{creative.headline}</p>
                          )}
                          {creative.body && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{creative.body}</p>
                          )}
                          {creative.cta && (
                            <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">{creative.cta}</Badge>
                          )}
                          {creative.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {creative.tags.slice(0, 4).map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                                  {tag}
                                </Badge>
                              ))}
                              {creative.tags.length > 4 && (
                                <Badge variant="secondary" className="text-[10px] bg-white/10">
                                  +{creative.tags.length - 4}
                                </Badge>
                              )}
                            </div>
                          )}
                        </>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingId(isEditing ? null : creative.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-cyan-400"
                          >
                            {isEditing ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => duplicateCreative(creative)}
                            className="h-8 w-8 text-muted-foreground hover:text-cyan-400"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteCreative(creative.id)}
                          className="h-8 w-8 text-destructive/60 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredCreatives.length === 0 && (
              <div className="text-center py-16 rounded-xl bg-black/40 border border-dashed border-white/10">
                {(() => {
                  const Icon = getTypeIcon(activeTab);
                  return <Icon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />;
                })()}
                <h3 className="text-lg font-medium text-white mb-2">No {activeTab}s yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first {activeTab} to get started
                </p>
                <Button onClick={() => addCreative(activeTab)} className="gap-2 bg-cyan-600 hover:bg-cyan-500">
                  <Plus className="w-4 h-4" />
                  Create {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Settings Panel */}
        <div className="lg:col-span-4">
          <div className="space-y-4 sticky top-4">
            {/* Visual Tone */}
            <div className="rounded-xl border border-white/10 bg-black/40 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4 text-cyan-500" />
                <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">VISUAL TONE</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Ensures generated visuals adhere to your brand style guide.
              </p>
              <div className="flex flex-wrap gap-2">
                {VISUAL_TONES.map((tone) => (
                  <Badge
                    key={tone}
                    variant="outline"
                    className="cursor-pointer hover:bg-cyan-500/20 border-white/10 text-muted-foreground hover:text-cyan-400"
                  >
                    {tone}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Primary Text Preview */}
            <div className="rounded-xl border border-white/10 bg-black/40 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Type className="w-4 h-4 text-cyan-500" />
                <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">PRIMARY TEXT</span>
              </div>
              <p className="text-sm text-muted-foreground italic">
                "Ready to find product-market fit in record time? Our AI-driven platform analyzes thousands of data points to validate your idea before you build. 🚀"
              </p>
            </div>

            {/* Brand Alignment */}
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-cyan-500" />
                <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">BRAND ALIGNMENT</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Ensures generated visuals adhere to your brand style guide strictly.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <Button
                onClick={() => addCreative(activeTab)}
                className="w-full gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
              >
                <Wand2 className="w-4 h-4" />
                GENERATE VARIANT
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2 border-white/10 hover:bg-white/5"
              >
                <Download className="w-4 h-4" />
                EXPORT TO CAMPAIGN
              </Button>
            </div>

            {/* Unsaved Changes Indicator */}
            <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-amber-400">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Unsaved changes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
