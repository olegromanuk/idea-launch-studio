import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { 
  Lightbulb, 
  Code, 
  Rocket, 
  ClipboardList,
  Megaphone,
  CheckCircle2,
  Circle,
  Clock,
  Target,
  Calendar,
  Play,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  color: string;
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
  const [currentDate] = useState(new Date());
  
  const getPhaseStatus = (tabId: string): "completed" | "in-progress" | "upcoming" => {
    if (validatedBlocks.has(tabId)) return "completed";
    
    if (tabId === "business" && !validatedBlocks.has("business")) return "in-progress";
    if (tabId === "scope" && validatedBlocks.has("business") && !validatedBlocks.has("scope")) return "in-progress";
    if (tabId === "development" && validatedBlocks.has("scope") && !validatedBlocks.has("development")) return "in-progress";
    if (tabId === "gtm" && validatedBlocks.has("development") && !validatedBlocks.has("gtm")) return "in-progress";
    
    return "upcoming";
  };

  const phases: RoadmapPhase[] = [
    {
      id: "validation",
      tabId: "business",
      title: "Business Validation",
      shortTitle: "Validation",
      description: "Validate business hypothesis",
      duration: "1-2 weeks",
      icon: Lightbulb,
      status: getPhaseStatus("business"),
      startWeek: 1,
      endWeek: 2,
      color: "from-amber-500 to-orange-500"
    },
    {
      id: "scope",
      tabId: "scope",
      title: "Scope & Planning",
      shortTitle: "Planning",
      description: "Define features & architecture",
      duration: "1-2 weeks",
      icon: ClipboardList,
      status: getPhaseStatus("scope"),
      startWeek: 3,
      endWeek: 4,
      color: "from-violet-500 to-purple-500"
    },
    {
      id: "mvp",
      tabId: "development",
      title: "MVP Development",
      shortTitle: "Development",
      description: "Build core features",
      duration: "4-8 weeks",
      icon: Code,
      status: getPhaseStatus("development"),
      startWeek: 5,
      endWeek: 12,
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: "gtm",
      tabId: "gtm",
      title: "Go-to-Market",
      shortTitle: "GTM",
      description: "Launch & marketing",
      duration: "2-4 weeks",
      icon: Megaphone,
      status: getPhaseStatus("gtm"),
      startWeek: 13,
      endWeek: 16,
      color: "from-green-500 to-emerald-500"
    },
    {
      id: "launch",
      tabId: "launch",
      title: "Launch & Scale",
      shortTitle: "Scale",
      description: "Go live and grow",
      duration: "Ongoing",
      icon: Rocket,
      status: "upcoming",
      startWeek: 17,
      endWeek: 20,
      color: "from-rose-500 to-pink-500"
    }
  ];

  const totalWeeks = 20;
  const completedCount = phases.filter(p => p.status === "completed").length;
  const currentPhase = phases.find(p => p.status === "in-progress");

  // Format project start date (assuming it started when first block was started)
  const projectStartDate = new Date();
  projectStartDate.setDate(projectStartDate.getDate() - (completedCount * 14)); // Rough estimate

  const formatDate = (weekOffset: number) => {
    const date = new Date(projectStartDate);
    date.setDate(date.getDate() + (weekOffset - 1) * 7);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="top" className="h-auto max-h-[85vh] overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <SheetTitle className="text-xl text-left">Project Roadmap</SheetTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {projectData?.idea?.slice(0, 60) || "Your product"}{projectData?.idea && projectData.idea.length > 60 ? "..." : ""} 
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold text-foreground">{completedCount}/{phases.length}</p>
              </div>
              <div className="w-16 h-16 relative">
                <svg className="w-16 h-16 -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="url(#horizontalRoadmapGradient)"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(completedCount / phases.length) * 176} 176`}
                  />
                  <defs>
                    <linearGradient id="horizontalRoadmapGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(var(--accent))" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Project Info Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Start Date</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {projectStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-accent/10 to-transparent border border-accent/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-accent" />
              <span className="text-xs font-medium text-muted-foreground">Est. Duration</span>
            </div>
            <p className="text-lg font-semibold text-foreground">~{totalWeeks} weeks</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Play className="w-4 h-4 text-green-500" />
              <span className="text-xs font-medium text-muted-foreground">Current Phase</span>
            </div>
            <p className="text-lg font-semibold text-foreground">{currentPhase?.shortTitle || "Not started"}</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-violet-500" />
              <span className="text-xs font-medium text-muted-foreground">Target Launch</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {formatDate(totalWeeks)}
            </p>
          </div>
        </div>

        {/* Horizontal Timeline */}
        <div className="relative pb-4">
          {/* Week markers */}
          <div className="flex justify-between mb-2 px-2">
            {[1, 5, 9, 13, 17, 20].map((week) => (
              <div key={week} className="text-xs text-muted-foreground">
                Week {week}
              </div>
            ))}
          </div>

          {/* Timeline track */}
          <div className="relative h-32 bg-muted/30 rounded-xl overflow-hidden border border-border/50">
            {/* Grid lines */}
            <div className="absolute inset-0 flex">
              {Array.from({ length: totalWeeks }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex-1 border-r border-border/20",
                    i % 4 === 3 && "border-border/40"
                  )} 
                />
              ))}
            </div>

            {/* Phase bars */}
            <div className="absolute inset-0 p-2 flex items-center">
              {phases.map((phase) => {
                const Icon = phase.icon;
                const width = ((phase.endWeek - phase.startWeek + 1) / totalWeeks) * 100;
                const left = ((phase.startWeek - 1) / totalWeeks) * 100;
                
                return (
                  <div
                    key={phase.id}
                    className={cn(
                      "absolute h-20 rounded-lg transition-all duration-300 cursor-pointer group",
                      phase.status === "completed" && "opacity-80",
                      phase.status === "upcoming" && "opacity-50"
                    )}
                    style={{ left: `${left}%`, width: `${width}%` }}
                    onClick={() => {
                      if (phase.tabId !== "launch" && onPhaseClick) {
                        onPhaseClick(phase.tabId);
                        onOpenChange(false);
                      }
                    }}
                  >
                    <div className={cn(
                      "absolute inset-0 rounded-lg bg-gradient-to-r shadow-lg transition-transform group-hover:scale-[1.02]",
                      phase.color,
                      phase.status === "in-progress" && "ring-2 ring-white/50 ring-offset-2 ring-offset-background"
                    )} />
                    
                    <div className="relative h-full flex items-center gap-2 px-3 text-white">
                      <div className={cn(
                        "w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0",
                        phase.status === "completed" && "bg-white/30"
                      )}>
                        {phase.status === "completed" ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : phase.status === "in-progress" ? (
                          <Clock className="w-4 h-4 animate-pulse" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate">{phase.shortTitle}</p>
                        <p className="text-xs text-white/80 truncate hidden sm:block">{phase.duration}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Current time indicator */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
              style={{ left: `${Math.min((Date.now() - projectStartDate.getTime()) / (totalWeeks * 7 * 24 * 60 * 60 * 1000) * 100, 100)}%` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-red-500 border-2 border-white" />
            </div>
          </div>

          {/* Date markers */}
          <div className="flex justify-between mt-2 px-2">
            {[1, 5, 9, 13, 17, 20].map((week) => (
              <div key={week} className="text-xs text-muted-foreground">
                {formatDate(week)}
              </div>
            ))}
          </div>
        </div>

        {/* Phase Legend */}
        <div className="mt-6 grid grid-cols-5 gap-3">
          {phases.map((phase) => {
            const Icon = phase.icon;
            const canNavigate = phase.tabId !== "launch";
            
            return (
              <div
                key={phase.id}
                className={cn(
                  "p-3 rounded-xl border transition-all",
                  phase.status === "completed" && "bg-success/5 border-success/30",
                  phase.status === "in-progress" && "bg-primary/5 border-primary/30 ring-2 ring-primary/20",
                  phase.status === "upcoming" && "bg-muted/50 border-border/50",
                  canNavigate && "cursor-pointer hover:shadow-md"
                )}
                onClick={() => {
                  if (canNavigate && onPhaseClick) {
                    onPhaseClick(phase.tabId);
                    onOpenChange(false);
                  }
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    phase.status === "completed" && "bg-success/20",
                    phase.status === "in-progress" && "bg-primary/20",
                    phase.status === "upcoming" && "bg-muted"
                  )}>
                    <Icon className={cn(
                      "w-4 h-4",
                      phase.status === "completed" && "text-success",
                      phase.status === "in-progress" && "text-primary",
                      phase.status === "upcoming" && "text-muted-foreground"
                    )} />
                  </div>
                  {phase.status === "completed" && <CheckCircle2 className="w-4 h-4 text-success" />}
                  {phase.status === "in-progress" && <Clock className="w-4 h-4 text-primary animate-pulse" />}
                </div>
                <p className="font-medium text-sm text-foreground">{phase.shortTitle}</p>
                <p className="text-xs text-muted-foreground mt-1">{phase.duration}</p>
                {canNavigate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 h-7 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onPhaseClick) {
                        onPhaseClick(phase.tabId);
                        onOpenChange(false);
                      }
                    }}
                  >
                    {phase.status === "completed" ? "Review" : phase.status === "in-progress" ? "Continue" : "Preview"}
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};
