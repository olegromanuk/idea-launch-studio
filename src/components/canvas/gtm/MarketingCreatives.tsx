import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
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
  Linkedin
} from "lucide-react";
import { cn } from "@/lib/utils";

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

export const MarketingCreatives = ({
  creatives,
  onChange,
  onAIGenerate,
  isGenerating = false,
}: MarketingCreativesProps) => {
  const [activeTab, setActiveTab] = useState<Creative["type"]>("ad");
  const [editingId, setEditingId] = useState<string | null>(null);

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

  const filteredCreatives = creatives.filter(c => c.type === activeTab);

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Create and manage your marketing creatives, ads, and copy
        </p>
        {onAIGenerate && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAIGenerate}
            disabled={isGenerating}
            className="gap-2"
          >
            <Sparkles className={cn("w-4 h-4", isGenerating && "animate-spin")} />
            Generate Ideas
          </Button>
        )}
      </div>

      {/* Tabs for Creative Types */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Creative["type"])}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="ad" className="gap-2">
              <Megaphone className="w-4 h-4" />
              Ads
            </TabsTrigger>
            <TabsTrigger value="copy" className="gap-2">
              <FileText className="w-4 h-4" />
              Copy
            </TabsTrigger>
            <TabsTrigger value="image" className="gap-2">
              <ImageIcon className="w-4 h-4" />
              Images
            </TabsTrigger>
            <TabsTrigger value="video" className="gap-2">
              <Video className="w-4 h-4" />
              Videos
            </TabsTrigger>
          </TabsList>
          <Button onClick={() => addCreative(activeTab)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </Button>
        </div>

        <TabsContent value={activeTab} className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCreatives.map((creative) => {
              const Icon = getTypeIcon(creative.type);
              const PlatformIcon = getPlatformIcon(creative.platform);
              const isEditing = editingId === creative.id;

              return (
                <Card key={creative.id} className="overflow-hidden">
                  {/* Creative Preview/Header */}
                  <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                    <Icon className="w-16 h-16 text-muted-foreground/30" />
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          creative.status === "approved" && "bg-success/10 text-success border-success/30",
                          creative.status === "review" && "bg-amber-500/10 text-amber-500 border-amber-500/30",
                          creative.status === "draft" && "bg-muted"
                        )}
                      >
                        {creative.status}
                      </Badge>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <Badge variant="secondary" className="gap-1">
                        <PlatformIcon className="w-3 h-3" />
                        {PLATFORMS.find(p => p.value === creative.platform)?.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Creative Content */}
                  <div className="p-4 space-y-4">
                    {isEditing ? (
                      <>
                        <Input
                          value={creative.title}
                          onChange={(e) => updateCreative(creative.id, { title: e.target.value })}
                          placeholder="Creative Title"
                          className="font-medium"
                        />
                        
                        <div className="grid grid-cols-2 gap-2">
                          <Select
                            value={creative.platform}
                            onValueChange={(v) => updateCreative(creative.id, { platform: v })}
                          >
                            <SelectTrigger>
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
                            <SelectTrigger>
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
                            />
                            <Textarea
                              value={creative.body || ""}
                              onChange={(e) => updateCreative(creative.id, { body: e.target.value })}
                              placeholder="Body copy..."
                              className="min-h-[100px]"
                            />
                            <Input
                              value={creative.cta || ""}
                              onChange={(e) => updateCreative(creative.id, { cta: e.target.value })}
                              placeholder="Call to Action"
                            />
                          </>
                        )}

                        <Textarea
                          value={creative.description}
                          onChange={(e) => updateCreative(creative.id, { description: e.target.value })}
                          placeholder="Notes or description..."
                          className="min-h-[60px]"
                        />
                      </>
                    ) : (
                      <>
                        <h4 className="font-medium text-foreground">
                          {creative.title || "Untitled Creative"}
                        </h4>
                        {creative.headline && (
                          <p className="text-sm font-medium text-foreground">{creative.headline}</p>
                        )}
                        {creative.body && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{creative.body}</p>
                        )}
                        {creative.cta && (
                          <Badge variant="outline">{creative.cta}</Badge>
                        )}
                      </>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingId(isEditing ? null : creative.id)}
                        >
                          {isEditing ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => duplicateCreative(creative)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteCreative(creative.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {filteredCreatives.length === 0 && (
            <div className="text-center py-12 rounded-lg bg-muted/30 border border-dashed border-border">
              {(() => {
                const Icon = getTypeIcon(activeTab);
                return <Icon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />;
              })()}
              <h3 className="text-lg font-medium text-foreground mb-2">No {activeTab}s yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first {activeTab} to get started
              </p>
              <Button onClick={() => addCreative(activeTab)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
