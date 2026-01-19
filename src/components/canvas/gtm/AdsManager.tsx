import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  ShoppingCart,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
      case "active": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "paused": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default: return "bg-white/10 text-muted-foreground border-white/10";
    }
  };

  const totalBudget = adSets.reduce((sum, a) => sum + (parseFloat(a.budget.amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">
          {adSets.length} AD SET{adSets.length !== 1 ? 'S' : ''} CONFIGURED
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
              <Sparkles className={cn("w-4 h-4", isGenerating && "animate-spin")} />
              Generate Strategy
            </Button>
          )}
          <Button onClick={addAdSet} size="sm" className="gap-2 bg-cyan-600 hover:bg-cyan-500">
            <Plus className="w-4 h-4" />
            Add Ad Set
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      {adSets.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-white/10 bg-black/40 p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Megaphone className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase">Ad Sets</span>
            </div>
            <p className="text-2xl font-bold text-white">{adSets.length}</p>
          </div>
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
            <div className="flex items-center gap-2 text-cyan-400/60 mb-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase">Total Budget</span>
            </div>
            <p className="text-2xl font-bold text-cyan-400">
              ${totalBudget.toLocaleString()}/day
            </p>
          </div>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <div className="flex items-center gap-2 text-emerald-400/60 mb-2">
              <Activity className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase">Active</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">
              {adSets.filter(a => a.status === "active").length}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/40 p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Target className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase">Platforms</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {new Set(adSets.map(a => a.platform)).size}
            </p>
          </div>
        </div>
      )}

      {/* Ad Sets List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {adSets.map((adSet) => {
            const ObjectiveIcon = AD_OBJECTIVES.find(o => o.value === adSet.objective)?.icon || Target;
            
            return (
              <motion.div 
                key={adSet.id} 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={cn(
                  "rounded-xl border backdrop-blur-sm overflow-hidden",
                  "bg-gradient-to-br from-white/[0.05] to-transparent",
                  expandedId === adSet.id ? "border-cyan-500/50" : "border-white/10"
                )}
              >
                {/* Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
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
                          className="font-medium border-none p-0 h-auto text-white bg-transparent focus-visible:ring-0 text-lg"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Badge variant="outline" className={cn("text-[10px] font-mono uppercase", getStatusColor(adSet.status))}>
                          {adSet.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground uppercase">
                        <span>{AD_PLATFORMS.find(p => p.value === adSet.platform)?.label}</span>
                        <span className="flex items-center gap-1">
                          <ObjectiveIcon className="w-3 h-3" />
                          {AD_OBJECTIVES.find(o => o.value === adSet.objective)?.label}
                        </span>
                        {adSet.budget.amount && (
                          <span className="flex items-center gap-1 text-cyan-400">
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
                        className="h-8 w-8 text-destructive/60 hover:text-destructive"
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
                <AnimatePresence>
                  {expandedId === adSet.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 space-y-6 border-t border-white/10">
                        {/* Basic Settings */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1 block">Platform</label>
                            <Select
                              value={adSet.platform}
                              onValueChange={(v) => updateAdSet(adSet.id, { platform: v })}
                            >
                              <SelectTrigger className="bg-black/40 border-white/10">
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
                            <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1 block">Objective</label>
                            <Select
                              value={adSet.objective}
                              onValueChange={(v) => updateAdSet(adSet.id, { objective: v })}
                            >
                              <SelectTrigger className="bg-black/40 border-white/10">
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
                            <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1 block">Status</label>
                            <Select
                              value={adSet.status}
                              onValueChange={(v) => updateAdSet(adSet.id, { status: v as AdSet["status"] })}
                            >
                              <SelectTrigger className="bg-black/40 border-white/10">
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
                            <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1 block">Bid Strategy</label>
                            <Select
                              value={adSet.bidStrategy}
                              onValueChange={(v) => updateAdSet(adSet.id, { bidStrategy: v })}
                            >
                              <SelectTrigger className="bg-black/40 border-white/10">
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
                          <div className="flex items-center gap-2 mb-3">
                            <DollarSign className="w-4 h-4 text-cyan-500" />
                            <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">Budget</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1 block">Budget Type</label>
                              <Select
                                value={adSet.budget.type}
                                onValueChange={(v) => updateAdSet(adSet.id, {
                                  budget: { ...adSet.budget, type: v as "daily" | "lifetime" }
                                })}
                              >
                                <SelectTrigger className="bg-black/40 border-white/10">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="daily">Daily Budget</SelectItem>
                                  <SelectItem value="lifetime">Lifetime Budget</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1 block">Amount ($)</label>
                              <Input
                                type="number"
                                value={adSet.budget.amount}
                                onChange={(e) => updateAdSet(adSet.id, {
                                  budget: { ...adSet.budget, amount: e.target.value }
                                })}
                                placeholder="100"
                                className="bg-black/40 border-white/10"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Targeting */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Target className="w-4 h-4 text-cyan-500" />
                            <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">Targeting</span>
                          </div>
                          
                          {/* Age Range */}
                          <div className="mb-4">
                            <label className="text-[10px] font-mono text-muted-foreground uppercase mb-2 block">
                              Age Range: {adSet.targeting.ageMin} - {adSet.targeting.ageMax}
                            </label>
                            <div className="flex items-center gap-4">
                              <Input
                                type="number"
                                value={adSet.targeting.ageMin}
                                onChange={(e) => updateAdSet(adSet.id, {
                                  targeting: { ...adSet.targeting, ageMin: parseInt(e.target.value) || 18 }
                                })}
                                className="w-20 bg-black/40 border-white/10"
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
                                className="w-20 bg-black/40 border-white/10"
                                min={13}
                                max={65}
                              />
                            </div>
                          </div>

                          {/* Locations & Interests */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(["locations", "interests", "behaviors"] as const).map((field) => (
                              <div key={field}>
                                <label className="text-[10px] font-mono text-muted-foreground uppercase mb-2 block capitalize">
                                  {field}
                                </label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {(adSet.targeting[field] as string[]).map((item, i) => (
                                    <Badge
                                      key={i}
                                      variant="secondary"
                                      className="gap-1 cursor-pointer hover:bg-destructive/20 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                                      onClick={() => removeArrayItem(adSet.id, field, i)}
                                    >
                                      {item}
                                      <Trash2 className="w-3 h-3" />
                                    </Badge>
                                  ))}
                                </div>
                                <Input
                                  placeholder={`Add ${field}...`}
                                  className="bg-black/40 border-white/10"
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
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {adSets.length === 0 && (
        <div className="text-center py-16 rounded-xl bg-black/40 border border-dashed border-white/10">
          <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Ad Sets Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Configure your advertising campaigns across platforms
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button onClick={addAdSet} className="gap-2 bg-cyan-600 hover:bg-cyan-500">
              <Plus className="w-4 h-4" />
              Create Ad Set
            </Button>
            {onAIGenerate && (
              <Button 
                variant="outline" 
                onClick={onAIGenerate}
                disabled={isGenerating}
                className="gap-2 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
              >
                <Sparkles className="w-4 h-4" />
                AI Generate
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
