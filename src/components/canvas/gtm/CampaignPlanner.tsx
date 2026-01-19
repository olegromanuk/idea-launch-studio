import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  Trash2, 
  Target,
  Calendar,
  DollarSign,
  TrendingUp,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Zap,
  BarChart3,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface Campaign {
  id: string;
  name: string;
  objective: string;
  channel: string;
  budget: string;
  startDate: string;
  endDate: string;
  status: "planning" | "active" | "paused" | "completed";
  kpis: { metric: string; target: string; current: string }[];
  tactics: string[];
  notes: string;
}

interface CampaignPlannerProps {
  campaigns: Campaign[];
  onChange: (campaigns: Campaign[]) => void;
  onAIGenerate?: () => void;
  isGenerating?: boolean;
}

const CHANNELS = [
  "Paid Social",
  "Organic Social",
  "Email Marketing",
  "Content Marketing",
  "SEO",
  "PPC/SEM",
  "Influencer Marketing",
  "Affiliate Marketing",
  "PR/Media",
  "Events",
  "Referral",
  "Other",
];

const OBJECTIVES = [
  "Brand Awareness",
  "Lead Generation",
  "User Acquisition",
  "Product Launch",
  "Engagement",
  "Retention",
  "Revenue Growth",
  "Market Expansion",
];

export const CampaignPlanner = ({
  campaigns,
  onChange,
  onAIGenerate,
  isGenerating = false,
}: CampaignPlannerProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addCampaign = () => {
    const newCampaign: Campaign = {
      id: crypto.randomUUID(),
      name: "",
      objective: "Lead Generation",
      channel: "Paid Social",
      budget: "",
      startDate: "",
      endDate: "",
      status: "planning",
      kpis: [{ metric: "", target: "", current: "" }],
      tactics: [],
      notes: "",
    };
    onChange([...campaigns, newCampaign]);
    setExpandedId(newCampaign.id);
  };

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    onChange(campaigns.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCampaign = (id: string) => {
    onChange(campaigns.filter(c => c.id !== id));
  };

  const addKPI = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (campaign) {
      updateCampaign(campaignId, {
        kpis: [...campaign.kpis, { metric: "", target: "", current: "" }],
      });
    }
  };

  const updateKPI = (campaignId: string, index: number, updates: Partial<Campaign["kpis"][0]>) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (campaign) {
      const newKpis = [...campaign.kpis];
      newKpis[index] = { ...newKpis[index], ...updates };
      updateCampaign(campaignId, { kpis: newKpis });
    }
  };

  const removeKPI = (campaignId: string, index: number) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (campaign && campaign.kpis.length > 1) {
      updateCampaign(campaignId, {
        kpis: campaign.kpis.filter((_, i) => i !== index),
      });
    }
  };

  const addTactic = (campaignId: string, tactic: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (campaign && tactic.trim()) {
      updateCampaign(campaignId, {
        tactics: [...campaign.tactics, tactic.trim()],
      });
    }
  };

  const removeTactic = (campaignId: string, index: number) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (campaign) {
      updateCampaign(campaignId, {
        tactics: campaign.tactics.filter((_, i) => i !== index),
      });
    }
  };

  const getStatusColor = (status: Campaign["status"]) => {
    switch (status) {
      case "active": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "paused": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "completed": return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      default: return "bg-white/10 text-muted-foreground border-white/10";
    }
  };

  // Stats
  const totalBudget = campaigns.reduce((sum, c) => sum + (parseFloat(c.budget) || 0), 0);
  const activeCampaigns = campaigns.filter(c => c.status === "active").length;
  const uniqueChannels = new Set(campaigns.map(c => c.channel)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">
          {campaigns.length} CAMPAIGN{campaigns.length !== 1 ? 'S' : ''} CONFIGURED
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
              Generate Plan
            </Button>
          )}
          <Button onClick={addCampaign} size="sm" className="gap-2 bg-cyan-600 hover:bg-cyan-500">
            <Plus className="w-4 h-4" />
            Add Campaign
          </Button>
        </div>
      </div>

      {/* Campaign Stats */}
      {campaigns.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-white/10 bg-black/40 p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Target className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase">Total Campaigns</span>
            </div>
            <p className="text-2xl font-bold text-white">{campaigns.length}</p>
          </div>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <div className="flex items-center gap-2 text-emerald-400/60 mb-2">
              <Zap className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase">Active</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{activeCampaigns}</p>
          </div>
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
            <div className="flex items-center gap-2 text-cyan-400/60 mb-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase">Total Budget</span>
            </div>
            <p className="text-2xl font-bold text-cyan-400">${totalBudget.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/40 p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <BarChart3 className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase">Channels</span>
            </div>
            <p className="text-2xl font-bold text-white">{uniqueChannels}</p>
          </div>
        </div>
      )}

      {/* Campaigns List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {campaigns.map((campaign) => (
            <motion.div 
              key={campaign.id} 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "rounded-xl border backdrop-blur-sm overflow-hidden",
                "bg-gradient-to-br from-white/[0.05] to-transparent",
                expandedId === campaign.id ? "border-cyan-500/50" : "border-white/10"
              )}
            >
              {/* Campaign Header */}
              <div
                className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpandedId(expandedId === campaign.id ? null : campaign.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Input
                        value={campaign.name}
                        onChange={(e) => updateCampaign(campaign.id, { name: e.target.value })}
                        placeholder="Campaign Name"
                        className="font-medium border-none p-0 h-auto text-white bg-transparent focus-visible:ring-0 text-lg"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Badge variant="outline" className={cn("text-[10px] font-mono uppercase", getStatusColor(campaign.status))}>
                        {campaign.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1 text-[10px] font-mono uppercase">
                        <Target className="w-3 h-3" />
                        {campaign.objective}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-mono uppercase">
                        <TrendingUp className="w-3 h-3" />
                        {campaign.channel}
                      </span>
                      {campaign.budget && (
                        <span className="flex items-center gap-1 text-[10px] font-mono uppercase text-cyan-400">
                          <DollarSign className="w-3 h-3" />
                          ${parseFloat(campaign.budget).toLocaleString()}
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
                        deleteCampaign(campaign.id);
                      }}
                      className="h-8 w-8 text-destructive/60 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    {expandedId === campaign.id ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {expandedId === campaign.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 space-y-6 border-t border-white/10">
                      {/* Basic Info */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1 block">Objective</label>
                          <Select
                            value={campaign.objective}
                            onValueChange={(v) => updateCampaign(campaign.id, { objective: v })}
                          >
                            <SelectTrigger className="bg-black/40 border-white/10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {OBJECTIVES.map((obj) => (
                                <SelectItem key={obj} value={obj}>{obj}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1 block">Channel</label>
                          <Select
                            value={campaign.channel}
                            onValueChange={(v) => updateCampaign(campaign.id, { channel: v })}
                          >
                            <SelectTrigger className="bg-black/40 border-white/10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CHANNELS.map((ch) => (
                                <SelectItem key={ch} value={ch}>{ch}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1 block">Status</label>
                          <Select
                            value={campaign.status}
                            onValueChange={(v) => updateCampaign(campaign.id, { status: v as Campaign["status"] })}
                          >
                            <SelectTrigger className="bg-black/40 border-white/10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="planning">Planning</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="paused">Paused</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1 block">Budget ($)</label>
                          <Input
                            type="number"
                            value={campaign.budget}
                            onChange={(e) => updateCampaign(campaign.id, { budget: e.target.value })}
                            placeholder="10000"
                            className="bg-black/40 border-white/10"
                          />
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1 block flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Start Date
                          </label>
                          <Input
                            type="date"
                            value={campaign.startDate}
                            onChange={(e) => updateCampaign(campaign.id, { startDate: e.target.value })}
                            className="bg-black/40 border-white/10"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-muted-foreground uppercase mb-1 block flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> End Date
                          </label>
                          <Input
                            type="date"
                            value={campaign.endDate}
                            onChange={(e) => updateCampaign(campaign.id, { endDate: e.target.value })}
                            className="bg-black/40 border-white/10"
                          />
                        </div>
                      </div>

                      {/* KPIs */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-cyan-500" />
                            <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">KPIs</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addKPI(campaign.id)}
                            className="gap-1 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                          >
                            <Plus className="w-3 h-3" />
                            Add KPI
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {campaign.kpis.map((kpi, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input
                                value={kpi.metric}
                                onChange={(e) => updateKPI(campaign.id, index, { metric: e.target.value })}
                                placeholder="Metric (e.g., CTR)"
                                className="flex-1 bg-black/40 border-white/10"
                              />
                              <Input
                                value={kpi.target}
                                onChange={(e) => updateKPI(campaign.id, index, { target: e.target.value })}
                                placeholder="Target"
                                className="w-24 bg-black/40 border-white/10"
                              />
                              <Input
                                value={kpi.current}
                                onChange={(e) => updateKPI(campaign.id, index, { current: e.target.value })}
                                placeholder="Current"
                                className="w-24 bg-black/40 border-white/10"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeKPI(campaign.id, index)}
                                className="flex-shrink-0 h-8 w-8"
                                disabled={campaign.kpis.length === 1}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tactics */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Zap className="w-4 h-4 text-cyan-500" />
                          <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">Tactics</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {campaign.tactics.map((tactic, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="gap-1 cursor-pointer hover:bg-destructive/20 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                              onClick={() => removeTactic(campaign.id, i)}
                            >
                              {tactic}
                              <Trash2 className="w-3 h-3" />
                            </Badge>
                          ))}
                        </div>
                        <Input
                          placeholder="Add a tactic and press Enter..."
                          className="bg-black/40 border-white/10"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              addTactic(campaign.id, e.currentTarget.value);
                              e.currentTarget.value = "";
                            }
                          }}
                        />
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="text-[10px] font-mono text-cyan-500 uppercase mb-2 block">Notes</label>
                        <Textarea
                          value={campaign.notes}
                          onChange={(e) => updateCampaign(campaign.id, { notes: e.target.value })}
                          placeholder="Add campaign notes..."
                          className="min-h-[80px] bg-black/40 border-white/10"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {campaigns.length === 0 && (
        <div className="text-center py-16 rounded-xl bg-black/40 border border-dashed border-white/10">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Campaigns Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first marketing campaign to track performance
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button onClick={addCampaign} className="gap-2 bg-cyan-600 hover:bg-cyan-500">
              <Plus className="w-4 h-4" />
              Create Campaign
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
