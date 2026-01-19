import { ReactNode, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles,
  Users,
  Palette,
  GitBranch,
  Calendar,
  Megaphone,
  Rocket,
  RefreshCw,
  ArrowRight,
  Plus,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AudienceSegment } from "./TargetAudienceBuilder";
import { Creative } from "./MarketingCreatives";
import { Campaign } from "./CampaignPlanner";
import { ContentPost } from "./ContentCalendar";
import { AdSet } from "./AdsManager";
import { LaunchPhase } from "./LaunchStrategy";

interface ModuleCardProps {
  moduleNumber: string;
  title: string;
  icon: LucideIcon;
  isPriority?: boolean;
  pattern?: "radar" | "diagonal" | "dots" | "calendar" | "grid";
  colSpan?: number;
  isEmpty: boolean;
  itemCount?: number;
  onAIGenerate: () => void;
  onManualAdd: () => void;
  isGenerating?: boolean;
  visualContent?: ReactNode;
  actionLabel?: string;
  actionIcon?: LucideIcon;
}

const ModuleCard = ({
  moduleNumber,
  title,
  icon: Icon,
  isPriority = false,
  pattern = "radar",
  colSpan = 1,
  isEmpty,
  itemCount = 0,
  onAIGenerate,
  onManualAdd,
  isGenerating = false,
  visualContent,
  actionLabel = "Auto-Structure",
  actionIcon: ActionIcon = Sparkles,
}: ModuleCardProps) => {
  const patternClass = {
    radar: "bg-[radial-gradient(circle_at_center,transparent_0,transparent_29px,rgba(0,224,255,0.03)_30px)]",
    diagonal: "bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.01),rgba(255,255,255,0.01)_10px,transparent_10px,transparent_20px)]",
    dots: "bg-[radial-gradient(rgba(0,224,255,0.1)_1px,transparent_1px)] bg-[length:10px_10px]",
    calendar: "bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:20px_20px]",
    grid: "bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:40px_40px]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative group flex flex-col min-h-[320px] overflow-hidden",
        "bg-[#080808]/60 backdrop-blur-md border border-white/5 transition-all duration-300",
        "hover:border-[#00E0FF]/30 hover:shadow-[0_0_15px_rgba(0,224,255,0.15),0_0_5px_rgba(0,224,255,0.1)] hover:bg-[#080808]/80",
        colSpan === 2 && "md:col-span-2"
      )}
    >
      {/* Pattern overlay */}
      <div className={cn("absolute inset-0 opacity-30 pointer-events-none", patternClass[pattern])} />
      
      {/* Corner accents */}
      <div className="absolute -top-[1px] -left-[1px] w-3 h-3 border-t-2 border-l-2 border-[#00E0FF] opacity-80 group-hover:w-full group-hover:h-full group-hover:opacity-100 group-hover:border-[#00E0FF]/20 transition-all duration-300" />
      <div className="absolute -bottom-[1px] -right-[1px] w-3 h-3 border-b-2 border-r-2 border-[#00E0FF] opacity-80 transition-all duration-300" />

      {/* Header */}
      <div className="relative z-10 p-6 flex justify-between items-start border-b border-white/5 bg-black/20">
        <div className={cn(
          "font-mono text-[10px] uppercase tracking-[0.15em] flex items-center gap-2",
          isEmpty ? "text-slate-400 group-hover:text-[#00E0FF]" : "text-[#00E0FF]",
          "transition-colors"
        )}>
          {isEmpty ? (
            <span className="w-1.5 h-1.5 bg-slate-700 group-hover:bg-[#00E0FF] rounded-sm transition-colors" />
          ) : (
            <Icon className={cn("w-4 h-4", isGenerating && "animate-spin")} />
          )}
          {moduleNumber}_{title.replace(/\s+/g, '_')}
        </div>
        {isPriority && (
          <div className="px-2 py-0.5 rounded bg-[#00E0FF]/10 border border-[#00E0FF]/20 text-[9px] text-[#00E0FF] font-mono">
            HIGH PRIORITY
          </div>
        )}
        {!isPriority && !isEmpty && (
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
            <div className="w-2 h-2 rounded-full bg-green-500/20 border border-green-500/50" />
          </div>
        )}
        {isEmpty && (
          <Icon className="text-slate-700 group-hover:text-[#00E0FF] transition-colors text-lg" />
        )}
      </div>

      {/* Content */}
      <div className="flex-grow p-6 flex flex-col md:flex-row gap-6 relative z-10">
        {/* Visual/Data Content */}
        <div className="flex-1 flex flex-col justify-center items-center">
          {isEmpty ? (
            visualContent || (
              <div className="w-full h-32 border border-dashed border-white/10 rounded-sm relative flex items-center justify-center bg-black/20 group-hover:border-[#00E0FF]/30 transition-colors">
                <div className="relative w-16 h-16 opacity-40 group-hover:opacity-80 transition-opacity">
                  <div className="absolute inset-0 border-2 border-slate-600 rounded-full flex items-center justify-center">
                    <Icon className="text-slate-600 w-6 h-6" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 text-[8px] font-mono text-slate-600">
                  FIG_01: DATA_UNDEFINED
                </div>
              </div>
            )
          ) : (
            visualContent
          )}
          {isEmpty && (
            <div className="mt-4 text-center">
              <p className="text-slate-400 text-xs font-mono">
                {itemCount > 0 ? `${itemCount} items configured` : "Configure this module."}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="w-full md:w-48 flex flex-col justify-end space-y-3">
          <Button
            onClick={onAIGenerate}
            disabled={isGenerating}
            className={cn(
              "w-full py-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider",
              "bg-[#00E0FF] text-black hover:bg-white transition-all duration-300",
              "shadow-[0_0_10px_rgba(0,224,255,0.5),inset_0_0_5px_rgba(255,255,255,0.2)]",
              "hover:shadow-[0_0_25px_rgba(0,224,255,0.4),0_0_10px_rgba(0,224,255,0.2)] hover:scale-[1.02]",
              "relative overflow-hidden"
            )}
          >
            <ActionIcon className={cn("w-4 h-4", isGenerating && "animate-spin")} />
            {isGenerating ? "Analyzing..." : isEmpty ? "Analyze & Generate" : "Regenerate"}
          </Button>
          <Button
            variant="ghost"
            onClick={onManualAdd}
            className="w-full py-2 text-slate-400 hover:text-white text-[10px] uppercase tracking-widest font-mono border border-transparent hover:border-white/10 transition-all text-center"
          >
            {isEmpty ? "+ Manual Entry" : "View & Edit"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

interface MarketFitSectionProps {
  projectName?: string;
  gtmData: {
    audienceSegments: AudienceSegment[];
    creatives: Creative[];
    campaigns: Campaign[];
    contentPosts: ContentPost[];
    adSets: AdSet[];
    launchPhases: LaunchPhase[];
  };
  loadingSection: string | null;
  onGenerateSuggestions: (section: string) => void;
  onOpenDrawer: (drawer: string) => void;
}

export const MarketFitSection = ({
  projectName = "OmniStream",
  gtmData,
  loadingSection,
  onGenerateSuggestions,
  onOpenDrawer,
}: MarketFitSectionProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate overall completion
  const modules = [
    { key: "audienceSegments", data: gtmData.audienceSegments, hasData: gtmData.audienceSegments.length > 0 },
    { key: "creatives", data: gtmData.creatives, hasData: gtmData.creatives.length > 0 },
    { key: "campaigns", data: gtmData.campaigns, hasData: gtmData.campaigns.length > 0 },
    { key: "contentPosts", data: gtmData.contentPosts, hasData: gtmData.contentPosts.length > 0 },
    { key: "adSets", data: gtmData.adSets, hasData: gtmData.adSets.length > 0 },
    { key: "launchPhases", data: gtmData.launchPhases, hasData: gtmData.launchPhases.length > 0 },
  ];

  const completedModules = modules.filter(m => m.hasData).length;
  const completionPercentage = Math.round((completedModules / modules.length) * 100);
  const pendingModules = modules.length - completedModules;

  const handleRefreshAnalysis = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8">
      {/* Main Content */}
      <div className="flex-grow space-y-8">
        {/* Header */}
        <div className="relative pl-6 py-2 border-l border-white/10">
          <div className="absolute -left-[1px] top-0 h-10 w-[2px] bg-[#00E0FF] shadow-[0_0_10px_rgba(0,224,255,0.5)]" />
          <div className="flex flex-wrap items-center gap-4 mb-2 text-[10px] font-mono uppercase tracking-widest text-slate-500">
            <span className="text-[#00E0FF]">Project: {projectName}</span>
            <span className="text-slate-700">//</span>
            <span>Phase 03: Launch</span>
            <span className="text-slate-700">//</span>
            <span className="text-white">Module_05: Market Fit</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
            Market <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E0FF] to-blue-600">Fit Planner</span>
          </h1>
          <p className="text-slate-400 max-w-2xl text-base font-light font-mono">
            Deploy automated agents to structure your go-to-market strategy.
          </p>
        </div>

        {/* Progress Status */}
        <div className="p-1 bg-[#080808]/60 backdrop-blur-md border border-white/5">
          <div className="p-5 bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(0,224,255,0.02)_1px,rgba(0,224,255,0.02)_2px)] relative overflow-hidden">
            <div className="flex justify-between items-end mb-3 font-mono">
              <div>
                <span className="text-[10px] text-[#00E0FF] mb-1 block tracking-widest">SYSTEM STATUS</span>
                <span className="text-2xl font-bold text-white flex items-center gap-2">
                  {completionPercentage}% <span className="text-[10px] font-normal text-slate-500 opacity-50">COMPLETION</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">Pending Actions</span>
                <span className="text-xs text-[#00E0FF] animate-pulse">
                  {pendingModules > 0 ? `${pendingModules} Modules Require Input` : "All Modules Complete"}
                </span>
              </div>
            </div>
            <div className="w-full bg-white/5 h-1 mt-2 overflow-hidden relative">
              <motion.div 
                className="absolute inset-0 bg-[#00E0FF]/40"
                initial={{ width: "0%" }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              {/* Section markers */}
              {[16.6, 33.2, 49.8, 66.4, 83].map((pos, i) => (
                <div key={i} className="absolute top-0 h-full w-[1px] bg-black/50" style={{ left: `${pos}%` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
          {/* 01 - Target Audience (spans 2 columns) */}
          <ModuleCard
            moduleNumber="01"
            title="Target_Audience"
            icon={Users}
            isPriority={gtmData.audienceSegments.length === 0}
            pattern="radar"
            colSpan={2}
            isEmpty={gtmData.audienceSegments.length === 0}
            itemCount={gtmData.audienceSegments.length}
            onAIGenerate={() => onGenerateSuggestions("audienceSegments")}
            onManualAdd={() => onOpenDrawer("audienceSegments")}
            isGenerating={loadingSection === "audienceSegments"}
            actionLabel="Analyze & Generate"
            actionIcon={Sparkles}
            visualContent={
              gtmData.audienceSegments.length > 0 ? (
                <div className="w-full grid grid-cols-2 gap-3">
                  {gtmData.audienceSegments.slice(0, 4).map((segment, i) => (
                    <div key={i} className="p-3 border border-white/10 bg-black/40 rounded-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full border-2 border-[#00E0FF]/50 flex items-center justify-center">
                          <Users className="w-4 h-4 text-[#00E0FF]" />
                        </div>
                        {segment.isPrimary && (
                          <span className="text-[8px] font-mono text-[#00E0FF] uppercase">Primary</span>
                        )}
                      </div>
                      <p className="text-xs text-white font-medium truncate">{segment.name || "Unnamed"}</p>
                      <p className="text-[10px] text-slate-500">{segment.demographics.ageRange}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full h-32 border border-dashed border-white/10 rounded-sm relative flex items-center justify-center bg-black/20 group-hover:border-[#00E0FF]/30 transition-colors">
                  <div className="relative w-16 h-16 opacity-40 group-hover:opacity-80 transition-opacity">
                    <div className="absolute inset-0 border-2 border-slate-600 rounded-full flex items-center justify-center">
                      <Users className="text-slate-600 w-6 h-6" />
                    </div>
                    <div className="absolute -top-2 -right-4 w-6 h-6 border border-slate-700 bg-black rounded-full text-[8px] flex items-center justify-center text-slate-500">Age</div>
                    <div className="absolute -bottom-2 -left-4 w-12 h-4 border border-slate-700 bg-black text-[6px] flex items-center justify-center text-slate-500 uppercase">Interests</div>
                  </div>
                  <div className="absolute bottom-2 right-2 text-[8px] font-mono text-slate-600">FIG_01: PERSONA_UNDEFINED</div>
                </div>
              )
            }
          />

          {/* 03 - Campaign (single column) */}
          <ModuleCard
            moduleNumber="03"
            title="Campaign"
            icon={GitBranch}
            pattern="diagonal"
            colSpan={1}
            isEmpty={gtmData.campaigns.length === 0}
            itemCount={gtmData.campaigns.length}
            onAIGenerate={() => onGenerateSuggestions("campaigns")}
            onManualAdd={() => onOpenDrawer("campaigns")}
            isGenerating={loadingSection === "campaigns"}
            actionLabel="Auto-Structure"
            visualContent={
              gtmData.campaigns.length > 0 ? (
                <div className="w-full space-y-2">
                  {gtmData.campaigns.slice(0, 3).map((campaign, i) => (
                    <div key={i} className="p-2 border border-white/10 bg-black/40 rounded-sm flex items-center gap-2">
                      <div className="w-6 h-6 border border-slate-600 rounded flex items-center justify-center text-[8px] font-mono text-slate-400">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white truncate">{campaign.name || "Unnamed"}</p>
                        <p className="text-[10px] text-slate-500">{campaign.channel}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center opacity-30 group-hover:opacity-60 transition-opacity">
                  <div className="w-8 h-8 border border-slate-500 rounded flex items-center justify-center mb-2">
                    <span className="text-[8px] font-mono">Start</span>
                  </div>
                  <div className="h-4 w-[1px] bg-slate-500" />
                  <div className="w-16 h-8 border border-dashed border-slate-500 flex items-center justify-center">
                    <span className="text-[8px] font-mono">Action?</span>
                  </div>
                  <div className="flex w-24 justify-between -mt-[1px]">
                    <div className="h-4 w-[1px] bg-slate-500" />
                    <div className="h-4 w-[1px] bg-slate-500" />
                  </div>
                </div>
              )
            }
          />

          {/* 02 - Creatives Engine (spans 2 columns) */}
          <ModuleCard
            moduleNumber="02"
            title="Creatives_Engine"
            icon={Palette}
            pattern="dots"
            colSpan={2}
            isEmpty={gtmData.creatives.length === 0}
            itemCount={gtmData.creatives.length}
            onAIGenerate={() => onGenerateSuggestions("creatives")}
            onManualAdd={() => onOpenDrawer("creatives")}
            isGenerating={loadingSection === "creatives"}
            actionLabel="Render Assets"
            visualContent={
              gtmData.creatives.length > 0 ? (
                <div className="flex-1 grid grid-cols-2 gap-2">
                  {gtmData.creatives.slice(0, 4).map((creative, i) => (
                    <div key={i} className="border border-white/10 bg-black/40 h-20 rounded-sm flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-slate-800 to-transparent" />
                      <Palette className="w-5 h-5 text-slate-600 mb-1" />
                      <span className="text-[8px] text-slate-400 font-mono relative z-10">{creative.type}</span>
                      <span className="text-[6px] text-[#00E0FF]/60 font-mono relative z-10">{creative.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 grid grid-cols-2 gap-2 opacity-40 group-hover:opacity-80 transition-opacity">
                  <div className="border border-slate-700 bg-black/40 h-24 rounded-sm flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-800 to-transparent" />
                    <Palette className="text-slate-600" />
                  </div>
                  <div className="border border-slate-700 bg-black/40 h-24 rounded-sm flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-transparent" />
                    <span className="font-mono text-slate-600 text-[10px]">Aa</span>
                  </div>
                  <div className="col-span-2 border border-slate-700 bg-black/40 h-12 rounded-sm flex items-center justify-center">
                    <div className="w-3/4 h-2 bg-slate-800 rounded" />
                  </div>
                </div>
              )
            }
          />

          {/* 04 - Calendar (single column) */}
          <ModuleCard
            moduleNumber="04"
            title="Calendar"
            icon={Calendar}
            pattern="calendar"
            colSpan={1}
            isEmpty={gtmData.contentPosts.length === 0}
            itemCount={gtmData.contentPosts.length}
            onAIGenerate={() => onGenerateSuggestions("contentPosts")}
            onManualAdd={() => onOpenDrawer("contentPosts")}
            isGenerating={loadingSection === "contentPosts"}
            actionLabel="Plan Schedule"
            visualContent={
              gtmData.contentPosts.length > 0 ? (
                <div className="w-full space-y-1">
                  {gtmData.contentPosts.slice(0, 4).map((post, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 border border-white/10 bg-black/40 rounded-sm">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        post.status === "published" ? "bg-green-500" : post.status === "scheduled" ? "bg-[#00E0FF]" : "bg-slate-600"
                      )} />
                      <span className="text-[10px] text-white truncate flex-1">{post.title || "Untitled"}</span>
                      <span className="text-[8px] text-slate-500 font-mono">{post.platform}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-grow grid grid-cols-7 grid-rows-4 gap-1 opacity-30 group-hover:opacity-70 transition-opacity mb-4">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "rounded-xs",
                        [2, 6, 12, 18].includes(i) ? "bg-[#00E0FF]/20" : "bg-slate-800/50"
                      )} 
                    />
                  ))}
                </div>
              )
            }
          />

          {/* 05 - Ads (single column) */}
          <ModuleCard
            moduleNumber="05"
            title="Ads"
            icon={Megaphone}
            pattern="grid"
            colSpan={1}
            isEmpty={gtmData.adSets.length === 0}
            itemCount={gtmData.adSets.length}
            onAIGenerate={() => onGenerateSuggestions("adSets")}
            onManualAdd={() => onOpenDrawer("adSets")}
            isGenerating={loadingSection === "adSets"}
            actionLabel="Setup Budget"
            visualContent={
              gtmData.adSets.length > 0 ? (
                <div className="w-full space-y-2">
                  {gtmData.adSets.slice(0, 3).map((adSet, i) => (
                    <div key={i} className="p-2 border border-white/10 bg-black/40 rounded-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-white truncate">{adSet.name || "Unnamed"}</span>
                        <span className={cn(
                          "text-[8px] px-1 rounded",
                          adSet.status === "active" ? "bg-green-500/20 text-green-400" : "bg-slate-700 text-slate-400"
                        )}>{adSet.status}</span>
                      </div>
                      <div className="text-[8px] text-slate-500 font-mono">
                        ${adSet.budget?.amount || 0}/{adSet.budget?.type || 'day'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-end justify-between h-20 gap-2 opacity-30 group-hover:opacity-70 transition-opacity px-4">
                  <div className="w-1/5 h-[30%] bg-slate-600 rounded-t-sm" />
                  <div className="w-1/5 h-[50%] bg-slate-600 rounded-t-sm" />
                  <div className="w-1/5 h-[80%] bg-[#00E0FF]/60 rounded-t-sm shadow-[0_0_10px_rgba(0,224,255,0.3)]" />
                  <div className="w-1/5 h-[60%] bg-slate-600 rounded-t-sm" />
                </div>
              )
            }
          />

          {/* 06 - Launch Control (spans 2 columns) */}
          <ModuleCard
            moduleNumber="06"
            title="Launch_Control"
            icon={Rocket}
            pattern="radar"
            colSpan={2}
            isEmpty={gtmData.launchPhases.length === 0}
            itemCount={gtmData.launchPhases.length}
            onAIGenerate={() => onGenerateSuggestions("launchPhases")}
            onManualAdd={() => onOpenDrawer("launchPhases")}
            isGenerating={loadingSection === "launchPhases"}
            actionLabel="Initialize Roadmap"
            visualContent={
              gtmData.launchPhases.length > 0 ? (
                <div className="w-full flex items-center justify-center py-4">
                  <div className="w-full max-w-md relative">
                    <div className="h-1 bg-white/10 w-full" />
                    {gtmData.launchPhases.map((phase, i) => {
                      const position = ((i + 1) / (gtmData.launchPhases.length + 1)) * 100;
                      return (
                        <div 
                          key={i}
                          className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
                          style={{ left: `${position}%` }}
                        >
                          <div className={cn(
                            "w-4 h-4 rounded-full border-2",
                            phase.status === "completed" ? "bg-[#00E0FF] border-white shadow-[0_0_10px_rgba(0,224,255,0.5)]" :
                            phase.status === "in_progress" ? "bg-slate-800 border-[#00E0FF]" :
                            "bg-slate-800 border-slate-600"
                          )} />
                          <span className="absolute -bottom-6 text-[8px] font-mono text-slate-400 whitespace-nowrap">
                            {phase.name?.slice(0, 10) || `Phase ${i + 1}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center justify-center">
                  <div className="w-full h-1 bg-white/10 relative my-6">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-800 border border-slate-600 rounded-full" />
                    <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-800 border border-slate-600 rounded-full" />
                    <div className="absolute left-2/3 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-800 border border-slate-600 rounded-full" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#00E0FF] border border-white rounded-full shadow-[0_0_10px_rgba(0,224,255,0.5)]" />
                    <span className="absolute top-4 left-0 text-[8px] font-mono text-slate-500 uppercase">Beta</span>
                    <span className="absolute top-4 right-0 text-[8px] font-mono text-[#00E0FF] uppercase font-bold">Launch</span>
                  </div>
                </div>
              )
            }
          />
        </div>
      </div>

      {/* AI Insights Sidebar */}
      <div className="w-full xl:w-80 flex-shrink-0 space-y-6">
        <div className="h-full border-t-2 border-t-[#00E0FF] p-0 flex flex-col bg-[#080808]/60 backdrop-blur-md border border-white/5">
          <div className="p-4 border-b border-white/10 bg-white/5">
            <h3 className="text-xs font-bold font-mono text-white uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="text-[#00E0FF] w-4 h-4" />
              AI_Insights
            </h3>
          </div>
          
          <div className="p-4 flex-grow space-y-6 overflow-y-auto max-h-[800px]">
            {/* Insight 1 */}
            <div className="relative pl-4 border-l border-white/10 hover:border-[#00E0FF] transition-colors group">
              <div className="absolute -left-[3px] top-0 w-[5px] h-[5px] bg-slate-500 group-hover:bg-[#00E0FF] rounded-full transition-colors" />
              <span className="text-[9px] text-slate-500 font-mono uppercase mb-1 block">Context: Audience</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Market signals suggest a <span className="text-[#00E0FF]">22% shift</span> towards privacy-focused solutions in your sector. Consider emphasizing data security in your ICP.
              </p>
              <button 
                onClick={() => onOpenDrawer("audienceSegments")}
                className="mt-2 text-[10px] text-[#00E0FF] underline decoration-[#00E0FF]/30 hover:decoration-[#00E0FF]"
              >
                Apply to Module 01
              </button>
            </div>

            {/* Insight 2 */}
            <div className="relative pl-4 border-l border-white/10 hover:border-[#00E0FF] transition-colors group">
              <div className="absolute -left-[3px] top-0 w-[5px] h-[5px] bg-slate-500 group-hover:bg-[#00E0FF] rounded-full transition-colors" />
              <span className="text-[9px] text-slate-500 font-mono uppercase mb-1 block">Context: Creatives</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Dark mode aesthetics are trending for developer tools. Recommendation: Use high-contrast blueprint styles for ad creatives.
              </p>
            </div>

            {/* Terminal Log */}
            <div className="mt-8 p-3 bg-black rounded border border-white/5 font-mono text-[9px] text-slate-500 space-y-1">
              <div className="flex gap-2">
                <span className="text-[#00E0FF]">&gt;</span>
                <span>Analyzing competitors... [Done]</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[#00E0FF]">&gt;</span>
                <span>Scanning keywords... [Done]</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[#00E0FF] animate-pulse">_</span>
                <span>Awaiting user input for Module 01...</span>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-white/10 bg-white/5">
            <Button
              variant="ghost"
              onClick={handleRefreshAnalysis}
              disabled={isRefreshing}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-mono uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
              Refresh Analysis
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
