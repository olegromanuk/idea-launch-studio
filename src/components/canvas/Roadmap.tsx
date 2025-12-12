import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Lightbulb, 
  Code, 
  Rocket, 
  TrendingUp, 
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  Target,
  Users,
  Zap,
  ClipboardList,
  Megaphone
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RoadmapPhase {
  id: string;
  title: string;
  description: string;
  duration: string;
  icon: React.ComponentType<{ className?: string }>;
  milestones: string[];
  status: "completed" | "in-progress" | "upcoming";
  tabId: string;
}

interface RoadmapProps {
  projectData: {
    idea?: string;
    persona?: string;
  };
  validatedBlocks: Set<string>;
  onPhaseClick?: (tabId: string) => void;
}

export const Roadmap = ({ projectData, validatedBlocks, onPhaseClick }: RoadmapProps) => {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);

  const getPhaseStatus = (tabId: string): "completed" | "in-progress" | "upcoming" => {
    if (validatedBlocks.has(tabId)) return "completed";
    
    // Determine if this is the current in-progress phase
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
      description: "Validate your business hypothesis and understand your market",
      duration: "1-2 weeks",
      icon: Lightbulb,
      milestones: [
        "Define the problem you're solving",
        "Identify target audience",
        "Create unique value proposition",
        "Establish revenue model",
        "Validate market opportunity"
      ],
      status: getPhaseStatus("business")
    },
    {
      id: "scope",
      tabId: "scope",
      title: "Scope & Planning",
      description: "Define user stories, features, and technical architecture",
      duration: "1-2 weeks",
      icon: ClipboardList,
      milestones: [
        "Write user stories",
        "Define feature scope (MVP vs future)",
        "Break down tasks & milestones",
        "Design technical solution",
        "Identify risks & constraints",
        "Create timeline estimates"
      ],
      status: getPhaseStatus("scope")
    },
    {
      id: "mvp",
      tabId: "development",
      title: "MVP Development",
      description: "Build the minimum viable product with core features",
      duration: "4-8 weeks",
      icon: Code,
      milestones: [
        "Implement core features",
        "Design user flow",
        "Set up tech stack",
        "Build MVP prototype",
        "Security implementation",
        "Internal testing"
      ],
      status: getPhaseStatus("development")
    },
    {
      id: "gtm",
      tabId: "gtm",
      title: "Go-to-Market",
      description: "Launch strategy, marketing, and growth planning",
      duration: "2-4 weeks",
      icon: Megaphone,
      milestones: [
        "Define positioning & messaging",
        "Set up acquisition channels",
        "Finalize pricing model",
        "Create launch plan",
        "Build content strategy",
        "Design growth loops"
      ],
      status: getPhaseStatus("gtm")
    },
    {
      id: "launch",
      tabId: "launch",
      title: "Launch & Scale",
      description: "Go live and scale your product",
      duration: "Ongoing",
      icon: Rocket,
      milestones: [
        "Beta launch to early adopters",
        "Collect user feedback",
        "Iterate on product",
        "Scale infrastructure",
        "Expand market reach"
      ],
      status: "upcoming"
    }
  ];

  const getStatusColor = (status: RoadmapPhase["status"]) => {
    switch (status) {
      case "completed":
        return "bg-success/20 text-success border-success/30";
      case "in-progress":
        return "bg-primary/20 text-primary border-primary/30";
      case "upcoming":
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusIcon = (status: RoadmapPhase["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "in-progress":
        return <Clock className="w-4 h-4 text-primary animate-pulse" />;
      case "upcoming":
        return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const completedCount = phases.filter(p => p.status === "completed").length;
  const progress = (completedCount / phases.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-6">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
              <Target className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-1">
                Product Roadmap
              </h3>
              <p className="text-sm text-muted-foreground">
                {projectData?.idea?.slice(0, 50) || "Your product"} journey to success
              </p>
            </div>
          </div>
          
          {/* Progress circle */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16">
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
                  stroke="url(#roadmapGradient)"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 1.76} 176`}
                  className="transition-all duration-500"
                />
                <defs>
                  <linearGradient id="roadmapGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-foreground">
                  {completedCount}/{phases.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-muted hidden md:block" />

        <div className="space-y-4">
          {phases.map((phase, index) => {
            const Icon = phase.icon;
            const isExpanded = expandedPhase === phase.id;
            const canNavigate = phase.status !== "upcoming" && phase.tabId !== "launch";

            return (
              <div
                key={phase.id}
                className={cn(
                  "relative transition-all duration-300",
                  phase.status === "in-progress" && "z-10"
                )}
              >
                <Card
                  className={cn(
                    "relative overflow-hidden cursor-pointer transition-all duration-300",
                    "hover:shadow-lg hover:-translate-y-0.5",
                    phase.status === "in-progress" && "ring-2 ring-primary/50 shadow-lg shadow-primary/10",
                    phase.status === "completed" && "opacity-90",
                    isExpanded && "ring-2 ring-primary"
                  )}
                  onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                >
                  {/* Top accent bar */}
                  <div className={cn(
                    "absolute top-0 left-0 right-0 h-1",
                    phase.status === "completed" && "bg-gradient-to-r from-success to-emerald-400",
                    phase.status === "in-progress" && "bg-gradient-to-r from-primary to-accent",
                    phase.status === "upcoming" && "bg-muted"
                  )} />
                  
                  <CardHeader className="pb-2 pt-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        {/* Phase number & icon */}
                        <div className={cn(
                          "w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border-2 transition-all",
                          phase.status === "completed" && "bg-success/20 border-success shadow-lg shadow-success/20",
                          phase.status === "in-progress" && "bg-primary/20 border-primary shadow-lg shadow-primary/20",
                          phase.status === "upcoming" && "bg-muted border-border"
                        )}>
                          <Icon className={cn(
                            "w-6 h-6",
                            phase.status === "completed" && "text-success",
                            phase.status === "in-progress" && "text-primary",
                            phase.status === "upcoming" && "text-muted-foreground"
                          )} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <CardTitle className="text-lg">{phase.title}</CardTitle>
                            <Badge variant="outline" className={cn("text-xs", getStatusColor(phase.status))}>
                              {getStatusIcon(phase.status)}
                              <span className="ml-1 capitalize">{phase.status.replace("-", " ")}</span>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {phase.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="shrink-0">
                          <Clock className="w-3 h-3 mr-1" />
                          {phase.duration}
                        </Badge>
                        <ChevronRight className={cn(
                          "w-5 h-5 text-muted-foreground transition-transform",
                          isExpanded && "rotate-90"
                        )} />
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="pt-2 animate-fade-in">
                      <div className="ml-[4.5rem] space-y-4">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <Zap className="w-4 h-4 text-primary" />
                          Key Milestones
                        </h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {phase.milestones.map((milestone, idx) => (
                            <li
                              key={idx}
                              className="flex items-center gap-2 text-sm text-muted-foreground"
                            >
                              {phase.status === "completed" ? (
                                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-border shrink-0" />
                              )}
                              {milestone}
                            </li>
                          ))}
                        </ul>
                        
                        {canNavigate && onPhaseClick && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPhaseClick(phase.tabId);
                            }}
                            className={cn(
                              "mt-3",
                              phase.status === "in-progress" 
                                ? "bg-gradient-to-r from-primary to-accent text-primary-foreground"
                                : ""
                            )}
                            variant={phase.status === "completed" ? "outline" : "default"}
                          >
                            {phase.status === "completed" ? "Review" : "Continue Working"}
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="relative overflow-hidden p-4 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent" />
          <div className="relative">
            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <p className="text-2xl font-bold text-foreground">{completedCount}</p>
            <p className="text-xs text-muted-foreground">Phases Done</p>
          </div>
        </Card>
        <Card className="relative overflow-hidden p-4 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <div className="relative">
            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {phases.find(p => p.status === "in-progress")?.duration || "-"}
            </p>
            <p className="text-xs text-muted-foreground">Current Phase</p>
          </div>
        </Card>
        <Card className="relative overflow-hidden p-4 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent" />
          <div className="relative">
            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-accent/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-accent" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {phases.reduce((acc, p) => acc + p.milestones.length, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Milestones</p>
          </div>
        </Card>
      </div>
    </div>
  );
};
