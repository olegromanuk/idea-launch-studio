import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
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
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

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
      case "active": return "bg-success/10 text-success border-success/30";
      case "paused": return "bg-amber-500/10 text-amber-500 border-amber-500/30";
      case "completed": return "bg-blue-500/10 text-blue-500 border-blue-500/30";
      default: return "bg-muted";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Plan and track your marketing campaigns across channels
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
              Generate Plan
            </Button>
          )}
          <Button onClick={addCampaign} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Campaign
          </Button>
        </div>
      </div>

      {/* Campaign Stats */}
      {campaigns.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs">Total Campaigns</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{campaigns.length}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-xs">Active</span>
            </div>
            <p className="text-2xl font-bold text-success">
              {campaigns.filter(c => c.status === "active").length}
            </p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs">Total Budget</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${campaigns.reduce((sum, c) => sum + (parseFloat(c.budget) || 0), 0).toLocaleString()}
            </p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <BarChart3 className="w-4 h-4" />
              <span className="text-xs">Channels</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {new Set(campaigns.map(c => c.channel)).size}
            </p>
          </Card>
        </div>
      )}

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="overflow-hidden">
            {/* Campaign Header */}
            <div
              className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
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
                      className="font-medium border-none p-0 h-auto text-foreground bg-transparent focus-visible:ring-0 text-lg"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Badge variant="outline" className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {campaign.objective}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {campaign.channel}
                    </span>
                    {campaign.budget && (
                      <span className="flex items-center gap-1">
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
                    className="text-destructive hover:text-destructive"
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
            {expandedId === campaign.id && (
              <div className="p-4 pt-0 space-y-6 border-t border-border">
                {/* Basic Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Objective</label>
                    <Select
                      value={campaign.objective}
                      onValueChange={(v) => updateCampaign(campaign.id, { objective: v })}
                    >
                      <SelectTrigger>
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
                    <label className="text-xs text-muted-foreground mb-1 block">Channel</label>
                    <Select
                      value={campaign.channel}
                      onValueChange={(v) => updateCampaign(campaign.id, { channel: v })}
                    >
                      <SelectTrigger>
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
                    <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                    <Select
                      value={campaign.status}
                      onValueChange={(v) => updateCampaign(campaign.id, { status: v as Campaign["status"] })}
                    >
                      <SelectTrigger>
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
                    <label className="text-xs text-muted-foreground mb-1 block">Budget ($)</label>
                    <Input
                      type="number"
                      value={campaign.budget}
                      onChange={(e) => updateCampaign(campaign.id, { budget: e.target.value })}
                      placeholder="10000"
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Start Date
                    </label>
                    <Input
                      type="date"
                      value={campaign.startDate}
                      onChange={(e) => updateCampaign(campaign.id, { startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> End Date
                    </label>
                    <Input
                      type="date"
                      value={campaign.endDate}
                      onChange={(e) => updateCampaign(campaign.id, { endDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* KPIs */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      Key Performance Indicators
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addKPI(campaign.id)}
                      className="gap-1"
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
                          className="flex-1"
                        />
                        <Input
                          value={kpi.target}
                          onChange={(e) => updateKPI(campaign.id, index, { target: e.target.value })}
                          placeholder="Target"
                          className="w-24"
                        />
                        <Input
                          value={kpi.current}
                          onChange={(e) => updateKPI(campaign.id, index, { current: e.target.value })}
                          placeholder="Current"
                          className="w-24"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeKPI(campaign.id, index)}
                          className="flex-shrink-0"
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
                  <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Tactics
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {campaign.tactics.map((tactic, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="gap-1 cursor-pointer hover:bg-destructive/10"
                        onClick={() => removeTactic(campaign.id, i)}
                      >
                        {tactic}
                        <Trash2 className="w-3 h-3" />
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Add a tactic and press Enter..."
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
                  <label className="text-sm font-medium text-foreground mb-2 block">Notes</label>
                  <Textarea
                    value={campaign.notes}
                    onChange={(e) => updateCampaign(campaign.id, { notes: e.target.value })}
                    placeholder="Campaign notes, learnings, or ideas..."
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {campaigns.length === 0 && (
        <div className="text-center py-12 rounded-lg bg-muted/30 border border-dashed border-border">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Campaigns Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first marketing campaign to start planning
          </p>
          <Button onClick={addCampaign} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Campaign
          </Button>
        </div>
      )}
    </div>
  );
};
