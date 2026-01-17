import { useState } from "react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { 
  Lightbulb, 
  Code, 
  Rocket, 
  ClipboardList,
  Megaphone,
  CheckCircle2,
  Clock,
  ChevronUp,
  BarChart3,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface RoadmapPhase {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  duration: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "completed" | "in-progress" | "upcoming";
  tabId: string;
  startWeek: number;
  endWeek: number;
  progress: number;
}

interface HorizontalRoadmapProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectData: {
    idea?: string;
    persona?: string;
  };
  validatedBlocks: Set<string>;
  onPhaseClick?: (tabId: string) => void;
}

export const HorizontalRoadmap = ({ 
  open, 
  onOpenChange, 
  projectData, 
  validatedBlocks,
  onPhaseClick 
}: HorizontalRoadmapProps) => {
  
  const getPhaseStatus = (tabId: string): "completed" | "in-progress" | "upcoming" => {
    if (validatedBlocks.has(tabId)) return "completed";
    
    if (tabId === "business" && !validatedBlocks.has("business")) return "in-progress";
    if (tabId === "scope" && validatedBlocks.has("business") && !validatedBlocks.has("scope")) return "in-progress";
    if (tabId === "development" && validatedBlocks.has("scope") && !validatedBlocks.has("development")) return "in-progress";
    if (tabId === "gtm" && validatedBlocks.has("development") && !validatedBlocks.has("gtm")) return "in-progress";
    
    return "upcoming";
  };

  const getPhaseProgress = (tabId: string): number => {
    const status = getPhaseStatus(tabId);
    if (status === "completed") return 100;
    if (status === "upcoming") return 0;
    // Simulate in-progress percentage
    return 45;
  };

  const phases: RoadmapPhase[] = [
    {
      id: "ideation",
      tabId: "business",
      title: "Business Validation",
      shortTitle: "Ideation",
      description: "Validate business hypothesis",
      duration: "Week 1-2",
      icon: Lightbulb,
      status: getPhaseStatus("business"),
      startWeek: 1,
      endWeek: 2,
      progress: getPhaseProgress("business")
    },
    {
      id: "analysis",
      tabId: "business",
      title: "Market Analysis",
      shortTitle: "Analysis",
      description: "Analyze market & competitors",
      duration: "Week 2-3",
      icon: BarChart3,
      status: getPhaseStatus("business"),
      startWeek: 2,
      endWeek: 3,
      progress: getPhaseProgress("business")
    },
    {
      id: "scope",
      tabId: "scope",
      title: "Scope & Planning",
      shortTitle: "Scope",
      description: "Define features & architecture",
      duration: "Week 3-4",
      icon: ClipboardList,
      status: getPhaseStatus("scope"),
      startWeek: 3,
      endWeek: 4,
      progress: getPhaseProgress("scope")
    },
    {
      id: "development",
      tabId: "development",
      title: "MVP Development",
      shortTitle: "Development",
      description: "Build core features",
      duration: "Week 4-7",
      icon: Code,
      status: getPhaseStatus("development"),
      startWeek: 4,
      endWeek: 7,
      progress: getPhaseProgress("development")
    },
    {
      id: "gtm",
      tabId: "gtm",
      title: "Market Product Fit",
      shortTitle: "Market Fit",
      description: "Launch & marketing",
      duration: "Week 7-8",
      icon: Megaphone,
      status: getPhaseStatus("gtm"),
      startWeek: 7,
      endWeek: 8,
      progress: getPhaseProgress("gtm")
    }
  ];

  const totalWeeks = 8;
  const weeks = Array.from({ length: totalWeeks }, (_, i) => i + 1);

  const handlePhaseClick = (phase: RoadmapPhase) => {
    if (onPhaseClick && phase.tabId !== "launch") {
      onPhaseClick(phase.tabId);
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="top" 
        className="h-auto max-h-[400px] p-0 border-0 bg-transparent"
      >
        <div className="relative bg-[#0B0F15]/95 backdrop-blur-xl border-b border-[#0EA5E9]/30 shadow-2xl overflow-hidden">
          {/* Grid Background */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: 'linear-gradient(to right, #1f2937 1px, transparent 1px), linear-gradient(to bottom, #1f2937 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />
          
          <div className="max-w-[1600px] mx-auto px-8 py-4 relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-[#0EA5E9]" />
                <div>
                  <h2 className="text-xs font-mono text-[#0EA5E9] uppercase tracking-[0.2em]">Project Schedule</h2>
                  <p className="text-lg font-bold uppercase tracking-tight text-white">Timeline Roadmap</p>
                </div>
              </div>
              
              <div className="flex items-center gap-8">
                {/* Legend */}
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#0EA5E9]" />
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Done</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border border-[#0EA5E9]" style={{ boxShadow: '0 0 15px rgba(14, 165, 233, 0.3)' }} />
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 border border-[#1F2937]"
                      style={{
                        backgroundImage: 'linear-gradient(45deg, transparent 48%, rgba(31, 41, 55, 0.5) 50%, transparent 52%), linear-gradient(-45deg, transparent 48%, rgba(31, 41, 55, 0.5) 50%, transparent 52%)',
                        backgroundSize: '4px 4px'
                      }}
                    />
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Planned</span>
                  </div>
                </div>
                
                <div className="h-8 w-px bg-[#1F2937]" />
                
                <button 
                  onClick={() => onOpenChange(false)}
                  className="w-8 h-8 flex items-center justify-center border border-[#1F2937] hover:bg-white/5 transition-colors"
                >
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative w-full overflow-x-auto pb-4">
              {/* Week Headers */}
              <div className="flex w-full mb-2 border-b border-[#1F2937]/50">
                {weeks.map((week) => (
                  <div 
                    key={week}
                    className="flex-1 text-[10px] font-mono text-slate-500 py-1 border-l border-[#1F2937]/30 pl-2"
                  >
                    WEEK {week}
                  </div>
                ))}
              </div>

              {/* Timeline Grid Background */}
              <div 
                className="absolute inset-0 top-6 bottom-4 pointer-events-none z-0"
                style={{
                  backgroundImage: 'linear-gradient(to right, rgba(31, 41, 55, 0.5) 1px, transparent 1px)',
                  backgroundSize: `${100 / totalWeeks}% 100%`
                }}
              />

              {/* Phase Bars */}
              <div className="space-y-3 relative z-10">
                {phases.map((phase, index) => {
                  const Icon = phase.icon;
                  const startPercent = ((phase.startWeek - 1) / totalWeeks) * 100;
                  const widthPercent = ((phase.endWeek - phase.startWeek + 1) / totalWeeks) * 100;
                  const isCompleted = phase.status === "completed";
                  const isInProgress = phase.status === "in-progress";
                  const isUpcoming = phase.status === "upcoming";

                  return (
                    <div key={phase.id} className="flex items-center gap-4">
                      {/* Phase Label */}
                      <div className="w-32 shrink-0 text-right">
                        <span className={cn(
                          "text-[10px] font-mono font-bold uppercase tracking-wider",
                          isCompleted || isInProgress ? "text-[#0EA5E9]" : "text-slate-500"
                        )}>
                          {phase.shortTitle}
                        </span>
                      </div>

                      {/* Timeline Bar */}
                      <div className="flex-1 h-8 relative">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => handlePhaseClick(phase)}
                          className={cn(
                            "absolute h-full flex items-center cursor-pointer transition-all",
                            isCompleted && "bg-[#0EA5E9]/20",
                            isInProgress && "bg-[#0EA5E9]/10",
                            isUpcoming && ""
                          )}
                          style={{ 
                            left: `${startPercent}%`, 
                            width: `${widthPercent}%` 
                          }}
                        >
                          {isCompleted && (
                            <div 
                              className="h-full bg-[#0EA5E9] border border-[#0EA5E9]/50 flex items-center px-3 gap-2 w-full"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                              <span className="text-[9px] font-bold text-white uppercase font-mono">100% Complete</span>
                            </div>
                          )}

                          {isInProgress && (
                            <div 
                              className="h-full border-2 border-[#0EA5E9] flex items-center relative overflow-hidden w-full"
                              style={{
                                animation: 'pulse-border 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                                boxShadow: '0 0 15px rgba(14, 165, 233, 0.3)'
                              }}
                            >
                              <motion.div 
                                className="absolute inset-y-0 left-0 bg-[#0EA5E9]/40"
                                initial={{ width: 0 }}
                                animate={{ width: `${phase.progress}%` }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                              />
                              <div className="z-10 px-3 flex items-center gap-2">
                                <RefreshCw className="w-3.5 h-3.5 text-[#0EA5E9] animate-spin" style={{ animationDuration: '3s' }} />
                                <span className="text-[9px] font-bold text-[#0EA5E9] uppercase font-mono">In Progress {phase.progress}%</span>
                              </div>
                            </div>
                          )}

                          {isUpcoming && (
                            <div 
                              className="h-full border border-[#374151] flex items-center px-3 w-full"
                              style={{
                                backgroundImage: 'linear-gradient(45deg, transparent 48%, rgba(31, 41, 55, 0.5) 50%, transparent 52%), linear-gradient(-45deg, transparent 48%, rgba(31, 41, 55, 0.5) 50%, transparent 52%)',
                                backgroundSize: '10px 10px'
                              }}
                            >
                              <span className="text-[9px] font-mono text-slate-500 uppercase">Pending</span>
                            </div>
                          )}
                        </motion.div>

                        {/* Milestone Pins */}
                        {phase.id === "scope" && phase.status === "in-progress" && (
                          <div 
                            className="absolute z-50 group"
                            style={{ left: `${startPercent + widthPercent}%`, top: '-10px' }}
                          >
                            <div className="h-20 w-px border-l-2 border-dotted border-[#0EA5E9]/60 absolute left-1/2 -translate-x-1/2 -top-16 pointer-events-none" />
                            <div 
                              className="w-4 h-4 bg-[#0B0F15] border-2 border-[#0EA5E9] rotate-45 flex items-center justify-center cursor-help relative z-10"
                              style={{ boxShadow: '0 0 15px rgba(14, 165, 233, 0.3)' }}
                            >
                              <div className="w-1.5 h-1.5 bg-[#0EA5E9] rounded-full" />
                            </div>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-32 p-2 bg-[#0B0F15] border border-[#0EA5E9]/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-200 z-50">
                              <div className="text-[10px] font-bold text-[#0EA5E9] uppercase font-mono mb-1">Beta Testing</div>
                              <div className="text-[9px] font-mono text-slate-400">WEEK 4 • START</div>
                              <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0B0F15] border-r border-b border-[#0EA5E9]/50 rotate-45" />
                            </div>
                          </div>
                        )}

                        {phase.id === "development" && (
                          <div 
                            className="absolute z-50 group"
                            style={{ left: `${startPercent + widthPercent - 5}%`, top: '-10px' }}
                          >
                            <div className="h-20 w-px border-l-2 border-dotted border-[#0EA5E9]/60 absolute left-1/2 -translate-x-1/2 -top-16 pointer-events-none" />
                            <div 
                              className="w-5 h-5 bg-[#0B0F15] border-2 border-[#0EA5E9] rotate-45 flex items-center justify-center cursor-help relative z-10"
                              style={{ filter: 'drop-shadow(0 0 8px #0EA5E9)' }}
                            >
                              <Rocket className="w-3 h-3 text-[#0EA5E9] -rotate-45" />
                            </div>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-36 p-2 bg-[#0B0F15] border border-[#0EA5E9]/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-200 z-50">
                              <div className="text-[10px] font-bold text-[#0EA5E9] uppercase font-mono mb-1">MVP Release</div>
                              <div className="text-[9px] font-mono text-slate-400">WEEK 7 • COMPLETION</div>
                              <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0B0F15] border-r border-b border-[#0EA5E9]/50 rotate-45" />
                            </div>
                          </div>
                        )}

                        {phase.id === "gtm" && (
                          <div 
                            className="absolute z-50 group"
                            style={{ left: `${startPercent + widthPercent / 2}%`, top: '-10px' }}
                          >
                            <div className="h-20 w-px border-l-2 border-dotted border-[#0EA5E9]/60 absolute left-1/2 -translate-x-1/2 -top-16 pointer-events-none" />
                            <div 
                              className="w-4 h-4 bg-[#0B0F15] border border-[#0EA5E9] rounded-full flex items-center justify-center cursor-help relative z-10"
                              style={{ boxShadow: '0 0 15px rgba(14, 165, 233, 0.3)' }}
                            >
                              <div className="w-1.5 h-1.5 bg-[#0EA5E9]" />
                            </div>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-40 p-2 bg-[#0B0F15] border border-[#0EA5E9]/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-200 z-50">
                              <div className="text-[10px] font-bold text-[#0EA5E9] uppercase font-mono mb-1">Product Launch</div>
                              <div className="text-[9px] font-mono text-slate-400">WEEK 8 • PUBLIC</div>
                              <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0B0F15] border-r border-b border-[#0EA5E9]/50 rotate-45" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
