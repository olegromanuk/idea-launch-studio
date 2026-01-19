import { ReactNode } from "react";
import { 
  Sparkles, 
  Loader2, 
  Users, 
  AlertTriangle, 
  Layers, 
  Cpu, 
  Clock, 
  ListTodo,
  CheckCircle,
  Circle,
  ChevronRight,
  Plus,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ScopePlanningSectionProps {
  scopeData: {
    userStories: any[];
    features: any[];
    milestones: any[];
    timeline: any[];
    risks: any[];
    technicalSolution: string;
  };
  loadingSection: string | null;
  onAIGenerate: (section: string) => void;
  onOpenDrawer: (section: string) => void;
  onInitializeBuild?: () => void;
  projectData?: any;
}

export const ScopePlanningSection = ({
  scopeData,
  loadingSection,
  onAIGenerate,
  onOpenDrawer,
  onInitializeBuild,
  projectData,
}: ScopePlanningSectionProps) => {
  // Calculate overall completion
  const totalItems = 
    scopeData.userStories.length + 
    scopeData.features.length + 
    scopeData.milestones.length + 
    scopeData.timeline.length + 
    scopeData.risks.length + 
    (scopeData.technicalSolution ? 1 : 0);
  
  const completedItems = 
    scopeData.userStories.filter(s => s.completed).length +
    scopeData.features.filter(f => f.category === "mvp").length +
    scopeData.milestones.filter(m => m.tasks?.every((t: any) => t.status === "done")).length +
    scopeData.timeline.length +
    scopeData.risks.filter(r => r.mitigation).length +
    (scopeData.technicalSolution ? 1 : 0);
  
  const completionPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Calculate total timeline - handle both weeks and duration properties
  const totalWeeks = scopeData.timeline.reduce((acc, phase) => {
    // Check for weeks first (used by TimelineEstimates component), then fall back to duration
    const weeks = typeof phase.weeks === 'number' && !isNaN(phase.weeks) 
      ? phase.weeks 
      : (typeof phase.duration === 'number' && !isNaN(phase.duration) 
        ? phase.duration 
        : parseInt(phase.duration) || 0);
    return acc + weeks;
  }, 0);
  const totalDays = totalWeeks * 7;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xs font-mono text-[#00f0ff] uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
              Module: 02_Scope_Planning
            </span>
            <span className="bg-[#00f0ff]/10 text-[#00f0ff] text-[10px] px-2 py-0.5 border border-[#00f0ff]/30 font-bold font-mono">
              {completionPercent}% COMPLETE
            </span>
          </div>
          <h1 className="text-3xl font-bold uppercase tracking-tight mb-2 text-white font-mono">Scope & Planning</h1>
          <p className="text-slate-500 text-sm max-w-xl">
            Define the core functionalities and roadmap for your {projectData?.idea || "project"}. Orchestrating the transition from idea to automated execution.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => onAIGenerate("userStories")}
            disabled={loadingSection !== null}
            className="flex items-center gap-2 px-4 py-2 border border-white/10 bg-[#0A0A0A] hover:border-[#00f0ff]/50 hover:text-[#00f0ff] transition-colors text-xs font-mono uppercase tracking-wider text-slate-400"
          >
            {loadingSection ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Optimize Plan
          </button>
          <button 
            onClick={onInitializeBuild}
            className="flex items-center gap-2 px-4 py-2 bg-[#00f0ff] text-black hover:opacity-90 transition-colors text-xs font-bold font-mono uppercase tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.3)]"
            title="Proceed to Development phase to submit your project for building"
          >
            <ChevronRight className="w-4 h-4" />
            Proceed to Development
          </button>
        </div>
      </div>

      {/* Main Grid - 12 columns */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - User Stories & Risks (4 cols) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* User Stories */}
          <div className="relative bg-[#0A0A0A] border border-white/[0.08] flex flex-col overflow-hidden">
            {/* Blueprint corner accents */}
            <div className="absolute -top-px -left-px w-2 h-2 border-t-2 border-l-2 border-[#00f0ff] opacity-70" />
            <div className="absolute -bottom-px -right-px w-2 h-2 border-b-2 border-r-2 border-[#00f0ff] opacity-70" />
            
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
              <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Users className="w-4 h-4" /> User_Stories
                <span className="text-[#00f0ff]">({scopeData.userStories.length})</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenDrawer("userStories")}
                  className="p-1.5 text-slate-500 hover:text-[#00f0ff] transition-colors"
                  title="Add new"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onAIGenerate("userStories")}
                  disabled={loadingSection === "userStories"}
                  className="p-1.5 text-slate-500 hover:text-[#00f0ff] transition-colors"
                  title="Generate with AI"
                >
                  {loadingSection === "userStories" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="p-4 space-y-3 max-h-[350px] overflow-y-auto">
              {scopeData.userStories.length > 0 ? (
                scopeData.userStories.slice(0, 5).map((story, i) => (
                  <div 
                    key={i}
                    className="group flex items-start gap-3 p-3 bg-[#0F0F0F] border border-white/5 hover:border-[#00f0ff]/30 transition-colors cursor-pointer"
                    onClick={() => onOpenDrawer("userStories")}
                  >
                    {story.completed ? (
                      <CheckCircle className="w-4 h-4 text-[#00f0ff] mt-0.5 flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-grow min-w-0">
                      <h4 className="text-xs font-bold text-white truncate font-mono">{story.title || story.action}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        As a {story.persona}, I want to {story.action}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState 
                  icon={Users}
                  label="No user stories yet"
                  onGenerate={() => onAIGenerate("userStories")}
                  onAdd={() => onOpenDrawer("userStories")}
                  isGenerating={loadingSection === "userStories"}
                />
              )}
            </div>
            {/* View & Edit All Button */}
            <div className="p-3 border-t border-white/5 bg-black/10">
              <button 
                onClick={() => onOpenDrawer("userStories")}
                className="w-full flex items-center justify-center gap-2 py-2 text-[11px] font-mono uppercase tracking-wider text-[#00f0ff] hover:bg-[#00f0ff]/10 transition-colors border border-white/10 hover:border-[#00f0ff]/30"
              >
                <ExternalLink className="w-3 h-3" />
                View & Edit All Items
                {scopeData.userStories.length > 5 && (
                  <span className="text-slate-500">(+{scopeData.userStories.length - 5} more)</span>
                )}
              </button>
            </div>
          </div>

          {/* Risks & Constraints */}
          <div className="relative bg-[#0A0A0A] border border-white/[0.08] flex flex-col overflow-hidden">
            {/* Blueprint corner accents */}
            <div className="absolute -top-px -left-px w-2 h-2 border-t-2 border-l-2 border-[#00f0ff] opacity-70" />
            <div className="absolute -bottom-px -right-px w-2 h-2 border-b-2 border-r-2 border-[#00f0ff] opacity-70" />
            
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
              <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Risks_Constraints
                <span className="text-[#00f0ff]">({scopeData.risks.length})</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenDrawer("risksConstraints")}
                  className="p-1.5 text-slate-500 hover:text-[#00f0ff] transition-colors"
                  title="Add new"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onAIGenerate("risksConstraints")}
                  disabled={loadingSection === "risksConstraints"}
                  className="p-1.5 text-slate-500 hover:text-[#00f0ff] transition-colors"
                  title="Generate with AI"
                >
                  {loadingSection === "risksConstraints" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {scopeData.risks.length > 0 ? (
                scopeData.risks.slice(0, 5).map((risk, i) => {
                  const impactColors = {
                    high: { bg: "bg-red-500/5", border: "border-red-500/20", text: "text-red-400", label: "text-red-500/50" },
                    medium: { bg: "bg-orange-500/5", border: "border-orange-500/20", text: "text-orange-400", label: "text-orange-500/50" },
                    low: { bg: "bg-slate-500/5", border: "border-slate-500/20", text: "text-slate-400", label: "text-slate-500/50" },
                  };
                  const colors = impactColors[risk.impact as keyof typeof impactColors] || impactColors.low;
                  
                  return (
                    <div 
                      key={i}
                      onClick={() => onOpenDrawer("risksConstraints")}
                      className={cn(
                        "flex items-center justify-between p-2 cursor-pointer hover:brightness-110 transition-all font-mono",
                        colors.bg, colors.border, "border"
                      )}
                    >
                      <span className={cn("text-[11px] font-medium truncate", colors.text)}>{risk.title}</span>
                      <span className={cn("text-[10px] font-mono uppercase flex-shrink-0 ml-2", colors.label)}>
                        {risk.impact}
                      </span>
                    </div>
                  );
                })
              ) : (
                <EmptyState 
                  icon={AlertTriangle}
                  label="No risks identified"
                  onGenerate={() => onAIGenerate("risksConstraints")}
                  onAdd={() => onOpenDrawer("risksConstraints")}
                  isGenerating={loadingSection === "risksConstraints"}
                  small
                />
              )}
            </div>
            {/* View & Edit All Button */}
            <div className="p-3 border-t border-white/5 bg-black/10 mt-auto">
              <button 
                onClick={() => onOpenDrawer("risksConstraints")}
                className="w-full flex items-center justify-center gap-2 py-2 text-[11px] font-mono uppercase tracking-wider text-[#00f0ff] hover:bg-[#00f0ff]/10 transition-colors border border-white/10 hover:border-[#00f0ff]/30"
              >
                <ExternalLink className="w-3 h-3" />
                View & Edit All
              </button>
            </div>
          </div>
        </div>

        {/* Middle Column - Features & Technical (5 cols) */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          {/* Feature Scope Matrix */}
          <div className="relative bg-[#0A0A0A] border border-white/[0.08] flex flex-col overflow-hidden">
            {/* Blueprint corner accents */}
            <div className="absolute -top-px -left-px w-2 h-2 border-t-2 border-l-2 border-[#00f0ff] opacity-70" />
            <div className="absolute -bottom-px -right-px w-2 h-2 border-b-2 border-r-2 border-[#00f0ff] opacity-70" />
            
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
              <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Layers className="w-4 h-4" /> Feature_Scope
                <span className="text-[#00f0ff]">({scopeData.features.length})</span>
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-[#00f0ff] font-mono">MVP v1.0</span>
                <button
                  onClick={() => onOpenDrawer("featureScope")}
                  className="p-1.5 text-slate-500 hover:text-[#00f0ff] transition-colors"
                  title="Add new"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onAIGenerate("featureScope")}
                  disabled={loadingSection === "featureScope"}
                  className="p-1.5 text-slate-500 hover:text-[#00f0ff] transition-colors"
                  title="Generate with AI"
                >
                  {loadingSection === "featureScope" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {scopeData.features.length > 0 ? (
                scopeData.features.slice(0, 4).map((feature, i) => (
                  <div 
                    key={i}
                    onClick={() => onOpenDrawer("featureScope")}
                    className="p-3 border border-white/5 bg-[#0F0F0F] flex items-center justify-between cursor-pointer hover:border-[#00f0ff]/30 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white truncate font-mono">{feature.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{feature.description}</div>
                    </div>
                    <span className={cn(
                      "px-2 py-0.5 text-[10px] font-bold font-mono flex-shrink-0 ml-2",
                      feature.category === "mvp" 
                        ? "bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30" 
                        : "bg-slate-800 text-slate-500 border border-white/10"
                    )}>
                      {feature.category?.toUpperCase() || "MVP"}
                    </span>
                  </div>
                ))
              ) : (
                <EmptyState 
                  icon={Layers}
                  label="No features defined"
                  onGenerate={() => onAIGenerate("featureScope")}
                  onAdd={() => onOpenDrawer("featureScope")}
                  isGenerating={loadingSection === "featureScope"}
                />
              )}
            </div>
            {/* View & Edit All Button */}
            <div className="p-3 border-t border-white/5 bg-black/10 mt-auto">
              <button 
                onClick={() => onOpenDrawer("featureScope")}
                className="w-full flex items-center justify-center gap-2 py-2 text-[11px] font-mono uppercase tracking-wider text-[#00f0ff] hover:bg-[#00f0ff]/10 transition-colors border border-white/10 hover:border-[#00f0ff]/30"
              >
                <ExternalLink className="w-3 h-3" />
                View & Edit All Features
                {scopeData.features.length > 4 && (
                  <span className="text-slate-500">(+{scopeData.features.length - 4} more)</span>
                )}
              </button>
            </div>
          </div>

          {/* Technical Solution Blueprint */}
          <div className="relative bg-[#0A0A0A] border border-white/[0.08] flex flex-col min-h-[300px] overflow-hidden">
            {/* Blueprint corner accents */}
            <div className="absolute -top-px -left-px w-2 h-2 border-t-2 border-l-2 border-[#00f0ff] opacity-70" />
            <div className="absolute -bottom-px -right-px w-2 h-2 border-b-2 border-r-2 border-[#00f0ff] opacity-70" />
            
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
              <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Cpu className="w-4 h-4" /> Technical_Solution
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenDrawer("technicalSolution")}
                  className="p-1.5 text-slate-500 hover:text-[#00f0ff] transition-colors"
                  title="Edit"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onAIGenerate("technicalSolution")}
                  disabled={loadingSection === "technicalSolution"}
                  className="p-1.5 text-slate-500 hover:text-[#00f0ff] transition-colors"
                  title="Generate with AI"
                >
                  {loadingSection === "technicalSolution" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="p-6 flex-grow flex flex-col items-center justify-center text-center">
              {scopeData.technicalSolution ? (
                <div 
                  className="w-full text-left cursor-pointer"
                  onClick={() => onOpenDrawer("technicalSolution")}
                >
                  <div className="p-4 bg-[#0F0F0F] border border-white/5">
                    <p className="text-sm text-slate-300 line-clamp-6 whitespace-pre-wrap font-mono">
                      {scopeData.technicalSolution}
                    </p>
                  </div>
                  <button className="mt-4 text-[10px] font-mono uppercase tracking-wider text-[#00f0ff] hover:underline flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    Click to edit full blueprint
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-[#0F0F0F] border border-dashed border-white/10 flex items-center justify-center mb-4">
                    <Cpu className="w-8 h-8 text-slate-700" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2 font-mono">Technical_Solution_Blueprint</h3>
                  <p className="text-xs text-slate-500 mb-4">No architecture items generated yet. Let AI define your stack.</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onOpenDrawer("technicalSolution")}
                      className="px-4 py-2 border border-white/10 text-slate-400 text-xs font-mono uppercase tracking-wider flex items-center gap-2 hover:border-[#00f0ff]/50 hover:text-white transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Add Manually
                    </button>
                    <button 
                      onClick={() => onAIGenerate("technicalSolution")}
                      disabled={loadingSection === "technicalSolution"}
                      className="px-4 py-2 bg-[#00f0ff] text-black text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 hover:opacity-90 shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-50"
                    >
                      {loadingSection === "technicalSolution" ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      Generate with AI
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Milestones & Timeline (3 cols) */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          {/* Core Phases / Milestones */}
          <div className="relative bg-[#0A0A0A] border border-white/[0.08] flex flex-col overflow-hidden">
            {/* Blueprint corner accents */}
            <div className="absolute -top-px -left-px w-2 h-2 border-t-2 border-l-2 border-[#00f0ff] opacity-70" />
            <div className="absolute -bottom-px -right-px w-2 h-2 border-b-2 border-r-2 border-[#00f0ff] opacity-70" />
            
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
              <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <ListTodo className="w-4 h-4" /> Core_Phases
                <span className="text-[#00f0ff]">({scopeData.milestones.length})</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenDrawer("taskBreakdown")}
                  className="p-1.5 text-slate-500 hover:text-[#00f0ff] transition-colors"
                  title="Add new"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onAIGenerate("taskBreakdown")}
                  disabled={loadingSection === "taskBreakdown"}
                  className="p-1.5 text-slate-500 hover:text-[#00f0ff] transition-colors"
                  title="Generate with AI"
                >
                  {loadingSection === "taskBreakdown" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {scopeData.milestones.length > 0 ? (
                scopeData.milestones.slice(0, 4).map((milestone, i) => {
                  const isActive = i === 0;
                  const taskCount = milestone.tasks?.length || 0;
                  
                  return (
                    <div 
                      key={i}
                      onClick={() => onOpenDrawer("taskBreakdown")}
                      className={cn(
                        "relative pl-6 py-1 cursor-pointer",
                        isActive ? "border-l border-[#00f0ff]/30" : "border-l border-white/10"
                      )}
                    >
                      <div className={cn(
                        "absolute -left-[5px] top-1 w-[9px] h-[9px]",
                        isActive ? "bg-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.5)]" : "bg-slate-600"
                      )} />
                      <div className="flex justify-between items-center">
                        <span className={cn(
                          "text-xs font-bold truncate font-mono",
                          isActive ? "text-white" : "text-slate-400"
                        )}>
                          {milestone.name}
                        </span>
                        <span className={cn(
                          "text-[10px] font-mono flex-shrink-0 ml-2",
                          isActive ? "text-[#00f0ff]" : "text-slate-500"
                        )}>
                          {taskCount} Tasks
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState 
                  icon={ListTodo}
                  label="No milestones defined"
                  onGenerate={() => onAIGenerate("taskBreakdown")}
                  onAdd={() => onOpenDrawer("taskBreakdown")}
                  isGenerating={loadingSection === "taskBreakdown"}
                  small
                />
              )}
            </div>
            {/* View & Edit All Button */}
            <div className="p-3 border-t border-white/5 bg-black/10 mt-auto">
              <button 
                onClick={() => onOpenDrawer("taskBreakdown")}
                className="w-full flex items-center justify-center gap-2 py-2 text-[11px] font-mono uppercase tracking-wider text-[#00f0ff] hover:bg-[#00f0ff]/10 transition-colors border border-white/10 hover:border-[#00f0ff]/30"
              >
                <ExternalLink className="w-3 h-3" />
                View & Edit All
              </button>
            </div>
          </div>

          {/* Timeline Estimates */}
          <div className="relative bg-[#0A0A0A] border border-white/[0.08] flex flex-col overflow-hidden">
            {/* Blueprint corner accents */}
            <div className="absolute -top-px -left-px w-2 h-2 border-t-2 border-l-2 border-[#00f0ff] opacity-70" />
            <div className="absolute -bottom-px -right-px w-2 h-2 border-b-2 border-r-2 border-[#00f0ff] opacity-70" />
            
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
              <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Timeline_Estimates
                <span className="text-[#00f0ff]">({scopeData.timeline.length})</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenDrawer("timeline")}
                  className="p-1.5 text-slate-500 hover:text-[#00f0ff] transition-colors"
                  title="Add new"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onAIGenerate("timeline")}
                  disabled={loadingSection === "timeline"}
                  className="p-1.5 text-slate-500 hover:text-[#00f0ff] transition-colors"
                  title="Generate with AI"
                >
                  {loadingSection === "timeline" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {scopeData.timeline.length > 0 ? (
                <>
                  {scopeData.timeline.slice(0, 4).map((phase, i) => {
                    // Handle both weeks and duration properties
                    const weeks = typeof phase.weeks === 'number' && !isNaN(phase.weeks) 
                      ? phase.weeks 
                      : (typeof phase.duration === 'number' && !isNaN(phase.duration) 
                        ? phase.duration 
                        : parseInt(phase.duration) || 0);
                    const maxWeeks = Math.max(...scopeData.timeline.map(p => {
                      const w = typeof p.weeks === 'number' && !isNaN(p.weeks) 
                        ? p.weeks 
                        : (typeof p.duration === 'number' && !isNaN(p.duration) 
                          ? p.duration 
                          : parseInt(p.duration) || 0);
                      return w;
                    }), 1);
                    const widthPercent = (weeks / maxWeeks) * 100;
                    const displayDuration = weeks > 0 ? `${weeks} ${weeks === 1 ? 'week' : 'weeks'}` : phase.duration;
                    
                    return (
                      <div 
                        key={i}
                        onClick={() => onOpenDrawer("timeline")}
                        className="cursor-pointer"
                      >
                        <div className="flex justify-between text-[11px] mb-1.5 uppercase tracking-wider">
                          <span className="text-slate-400 truncate font-mono">{phase.name}</span>
                          <span className="font-mono text-[#00f0ff] flex-shrink-0 ml-2">{displayDuration}</span>
                        </div>
                        <div className="h-1 bg-[#0F0F0F] overflow-hidden">
                          <div 
                            className="h-full bg-[#00f0ff] transition-all duration-500"
                            style={{ width: `${widthPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <div className="mt-4 p-3 bg-[#00f0ff]/5 border border-[#00f0ff]/20 text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Total Estimated Cycle</span>
                    <div className="text-xl font-bold text-[#00f0ff] font-mono">{totalWeeks} WEEKS</div>
                    <div className="text-xs text-slate-500 font-mono">≈ {totalDays} days</div>
                  </div>
                </>
              ) : (
                <EmptyState 
                  icon={Clock}
                  label="No timeline defined"
                  onGenerate={() => onAIGenerate("timeline")}
                  onAdd={() => onOpenDrawer("timeline")}
                  isGenerating={loadingSection === "timeline"}
                  small
                />
              )}
            </div>
            {/* View & Edit All Button */}
            <div className="p-3 border-t border-white/5 bg-black/10 mt-auto">
              <button 
                onClick={() => onOpenDrawer("timeline")}
                className="w-full flex items-center justify-center gap-2 py-2 text-[11px] font-mono uppercase tracking-wider text-[#00f0ff] hover:bg-[#00f0ff]/10 transition-colors border border-white/10 hover:border-[#00f0ff]/30"
              >
                <ExternalLink className="w-3 h-3" />
                View & Edit All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Empty state component
const EmptyState = ({ 
  icon: Icon, 
  label, 
  onGenerate, 
  onAdd,
  isGenerating, 
  small = false 
}: { 
  icon: any; 
  label: string; 
  onGenerate: () => void; 
  onAdd?: () => void;
  isGenerating: boolean;
  small?: boolean;
}) => (
  <div className={cn(
    "flex flex-col items-center justify-center text-center border border-dashed border-[#1E293B] bg-black/20 rounded",
    small ? "py-4" : "py-8"
  )}>
    <Icon className={cn("text-gray-600 mb-2", small ? "w-6 h-6" : "w-8 h-8")} />
    <p className={cn("text-[#94A3B8] mb-3", small ? "text-[10px]" : "text-xs")}>{label}</p>
    <div className="flex gap-2">
      {onAdd && (
        <button
          onClick={onAdd}
          className="px-3 py-1.5 border border-[#1E293B] text-[#94A3B8] text-[10px] font-medium uppercase rounded-sm flex items-center gap-1.5 hover:border-[#0EA5E9]/50 hover:text-white transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add
        </button>
      )}
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className="px-3 py-1.5 bg-[#0EA5E9] text-white text-[10px] font-bold uppercase rounded-sm flex items-center gap-1.5 hover:brightness-110 disabled:opacity-50"
      >
        {isGenerating ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Sparkles className="w-3 h-3" />
        )}
        Generate
      </button>
    </div>
  </div>
);
