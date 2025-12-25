import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  Plus, 
  Trash2, 
  Megaphone,
  DollarSign,
  Target,
  Users,
  TrendingUp,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Eye,
  MousePointer,
  ShoppingCart
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdSet {
  id: string;
  name: string;
  platform: string;
  objective: string;
  budget: {
    type: "daily" | "lifetime";
    amount: string;
  };
  targeting: {
    locations: string[];
    ageMin: number;
    ageMax: number;
    genders: string[];
    interests: string[];
    behaviors: string[];
    customAudiences: string[];
  };
  placements: string[];
  bidStrategy: string;
  status: "draft" | "active" | "paused";
  metrics: {
    impressions: string;
    clicks: string;
    ctr: string;
    conversions: string;
    spend: string;
  };
}

interface AdsManagerProps {
  adSets: AdSet[];
  onChange: (adSets: AdSet[]) => void;
  onAIGenerate?: () => void;
  isGenerating?: boolean;
}

const AD_PLATFORMS = [
  { value: "meta", label: "Meta (Facebook/Instagram)" },
  { value: "google", label: "Google Ads" },
  { value: "tiktok", label: "TikTok Ads" },
  { value: "linkedin", label: "LinkedIn Ads" },
  { value: "twitter", label: "Twitter/X Ads" },
  { value: "pinterest", label: "Pinterest Ads" },
];

const AD_OBJECTIVES = [
  { value: "awareness", label: "Brand Awareness", icon: Eye },
  { value: "traffic", label: "Website Traffic", icon: MousePointer },
  { value: "engagement", label: "Engagement", icon: Users },
  { value: "leads", label: "Lead Generation", icon: Target },
  { value: "conversions", label: "Conversions", icon: ShoppingCart },
  { value: "app_installs", label: "App Installs", icon: TrendingUp },
];

const BID_STRATEGIES = [
  "Lowest Cost",
  "Cost Cap",
  "Bid Cap",
  "Target ROAS",
  "Maximize Conversions",
  "Maximize Clicks",
];

export const AdsManager = ({
  adSets,
  onChange,
  onAIGenerate,
  isGenerating = false,
}: AdsManagerProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addAdSet = () => {
    const newAdSet: AdSet = {
      id: crypto.randomUUID(),
      name: "",
      platform: "meta",
      objective: "conversions",
      budget: {
        type: "daily",
        amount: "",
      },
      targeting: {
        locations: [],
        ageMin: 18,
        ageMax: 65,
        genders: ["All"],
        interests: [],
        behaviors: [],
        customAudiences: [],
      },
      placements: ["automatic"],
      bidStrategy: "Lowest Cost",
      status: "draft",
      metrics: {
        impressions: "0",
        clicks: "0",
        ctr: "0%",
        conversions: "0",
        spend: "$0",
      },
    };
    onChange([...adSets, newAdSet]);
    setExpandedId(newAdSet.id);
  };

  const updateAdSet = (id: string, updates: Partial<AdSet>) => {
    onChange(adSets.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAdSet = (id: string) => {
    onChange(adSets.filter(a => a.id !== id));
  };

  const addArrayItem = (adSetId: string, field: keyof AdSet["targeting"], value: string) => {
    const adSet = adSets.find(a => a.id === adSetId);
    if (adSet && value.trim()) {
      updateAdSet(adSetId, {
        targeting: {
          ...adSet.targeting,
          [field]: [...(adSet.targeting[field] as string[]), value.trim()],
        },
      });
    }
  };

  const removeArrayItem = (adSetId: string, field: keyof AdSet["targeting"], index: number) => {
    const adSet = adSets.find(a => a.id === adSetId);
    if (adSet) {
      updateAdSet(adSetId, {
        targeting: {
          ...adSet.targeting,
          [field]: (adSet.targeting[field] as string[]).filter((_, i) => i !== index),
        },
      });
    }
  };

  const getStatusColor = (status: AdSet["status"]) => {
    switch (status) {
      case "active": return "bg-success/10 text-success border-success/30";
      case "paused": return "bg-amber-500/10 text-amber-500 border-amber-500/30";
      default: return "bg-muted";
    }
  };

  const totalBudget = adSets.reduce((sum, a) => sum + (parseFloat(a.budget.amount) || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Configure your ad campaigns and targeting across platforms
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
              Generate Strategy
            </Button>
          )}
          <Button onClick={addAdSet} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Ad Set
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      {adSets.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Megaphone className="w-4 h-4" />
              <span className="text-xs">Ad Sets</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{adSets.length}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs">Total Budget</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${totalBudget.toLocaleString()}/day
            </p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Active</span>
            </div>
            <p className="text-2xl font-bold text-success">
              {adSets.filter(a => a.status === "active").length}
            </p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs">Platforms</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {new Set(adSets.map(a => a.platform)).size}
            </p>
          </Card>
        </div>
      )}

      {/* Ad Sets List */}
      <div className="space-y-4">
        {adSets.map((adSet) => {
          const ObjectiveIcon = AD_OBJECTIVES.find(o => o.value === adSet.objective)?.icon || Target;
          
          return (
            <Card key={adSet.id} className="overflow-hidden">
              {/* Header */}
              <div
                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedId(expandedId === adSet.id ? null : adSet.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Megaphone className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Input
                        value={adSet.name}
                        onChange={(e) => updateAdSet(adSet.id, { name: e.target.value })}
                        placeholder="Ad Set Name"
                        className="font-medium border-none p-0 h-auto text-foreground bg-transparent focus-visible:ring-0 text-lg"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Badge variant="outline" className={getStatusColor(adSet.status)}>
                        {adSet.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{AD_PLATFORMS.find(p => p.value === adSet.platform)?.label}</span>
                      <span className="flex items-center gap-1">
                        <ObjectiveIcon className="w-3 h-3" />
                        {AD_OBJECTIVES.find(o => o.value === adSet.objective)?.label}
                      </span>
                      {adSet.budget.amount && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          ${adSet.budget.amount}/{adSet.budget.type === "daily" ? "day" : "total"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAdSet(adSet.id);
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    {expandedId === adSet.id ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === adSet.id && (
                <div className="p-4 pt-0 space-y-6 border-t border-border">
                  {/* Basic Settings */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Platform</label>
                      <Select
                        value={adSet.platform}
                        onValueChange={(v) => updateAdSet(adSet.id, { platform: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AD_PLATFORMS.map((p) => (
                            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Objective</label>
                      <Select
                        value={adSet.objective}
                        onValueChange={(v) => updateAdSet(adSet.id, { objective: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AD_OBJECTIVES.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              <div className="flex items-center gap-2">
                                <o.icon className="w-4 h-4" />
                                {o.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                      <Select
                        value={adSet.status}
                        onValueChange={(v) => updateAdSet(adSet.id, { status: v as AdSet["status"] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Bid Strategy</label>
                      <Select
                        value={adSet.bidStrategy}
                        onValueChange={(v) => updateAdSet(adSet.id, { bidStrategy: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BID_STRATEGIES.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Budget */}
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-primary" />
                      Budget
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Budget Type</label>
                        <Select
                          value={adSet.budget.type}
                          onValueChange={(v) => updateAdSet(adSet.id, {
                            budget: { ...adSet.budget, type: v as "daily" | "lifetime" }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily Budget</SelectItem>
                            <SelectItem value="lifetime">Lifetime Budget</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Amount ($)</label>
                        <Input
                          type="number"
                          value={adSet.budget.amount}
                          onChange={(e) => updateAdSet(adSet.id, {
                            budget: { ...adSet.budget, amount: e.target.value }
                          })}
                          placeholder="100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Targeting */}
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Targeting
                    </h4>
                    
                    {/* Age Range */}
                    <div className="mb-4">
                      <label className="text-xs text-muted-foreground mb-2 block">
                        Age Range: {adSet.targeting.ageMin} - {adSet.targeting.ageMax}
                      </label>
                      <div className="flex items-center gap-4">
                        <Input
                          type="number"
                          value={adSet.targeting.ageMin}
                          onChange={(e) => updateAdSet(adSet.id, {
                            targeting: { ...adSet.targeting, ageMin: parseInt(e.target.value) || 18 }
                          })}
                          className="w-20"
                          min={13}
                          max={65}
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                          type="number"
                          value={adSet.targeting.ageMax}
                          onChange={(e) => updateAdSet(adSet.id, {
                            targeting: { ...adSet.targeting, ageMax: parseInt(e.target.value) || 65 }
                          })}
                          className="w-20"
                          min={13}
                          max={65}
                        />
                      </div>
                    </div>

                    {/* Gender */}
                    <div className="mb-4">
                      <label className="text-xs text-muted-foreground mb-1 block">Gender</label>
                      <Select
                        value={adSet.targeting.genders[0]}
                        onValueChange={(v) => updateAdSet(adSet.id, {
                          targeting: { ...adSet.targeting, genders: [v] }
                        })}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All</SelectItem>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Locations, Interests, Behaviors */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {(["locations", "interests", "behaviors"] as const).map((field) => (
                        <div key={field}>
                          <label className="text-xs text-muted-foreground mb-2 block capitalize">
                            {field}
                          </label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {adSet.targeting[field].map((item, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="gap-1 cursor-pointer hover:bg-destructive/10"
                                onClick={() => removeArrayItem(adSet.id, field, i)}
                              >
                                {item}
                                <Trash2 className="w-3 h-3" />
                              </Badge>
                            ))}
                          </div>
                          <Input
                            placeholder={`Add ${field.slice(0, -1)}...`}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                addArrayItem(adSet.id, field, e.currentTarget.value);
                                e.currentTarget.value = "";
                              }
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Performance Metrics (placeholder) */}
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      Performance (Estimated)
                    </h4>
                    <div className="grid grid-cols-5 gap-4">
                      {Object.entries(adSet.metrics).map(([key, value]) => (
                        <div key={key} className="text-center p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground capitalize mb-1">
                            {key.replace(/([A-Z])/g, " $1")}
                          </p>
                          <p className="text-lg font-bold text-foreground">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {adSets.length === 0 && (
        <div className="text-center py-12 rounded-lg bg-muted/30 border border-dashed border-border">
          <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Ad Sets Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first ad set to start advertising
          </p>
          <Button onClick={addAdSet} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Ad Set
          </Button>
        </div>
      )}
    </div>
  );
};
