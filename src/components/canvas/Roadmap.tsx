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
  Zap
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
}

interface RoadmapProps {
  projectData: {
    idea?: string;
    persona?: string;
  };
  businessAnalysisComplete: boolean;
  onPhaseClick?: (phaseId: string) => void;
}

export const Roadmap = ({ projectData, businessAnalysisComplete, onPhaseClick }: RoadmapProps) => {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);

  const phases: RoadmapPhase[] = [
    {
      id: "validation",
      title: "Idea Validation",
      description: "Validate your business hypothesis and understand your market",
      duration: "1-2 weeks",
      icon: Lightbulb,
      milestones: [
        "Complete Business Logic canvas",
        "Define target audience",
        "Identify unique value proposition",
        "Validate market opportunity"
      ],
      status: businessAnalysisComplete ? "completed" : "in-progress"
    },
    {
      id: "mvp",
      title: "MVP Development",
      description: "Build the minimum viable product with core features",
      duration: "4-8 weeks",
      icon: Code,
      milestones: [
        "Define core features list",
        "Design user flow",
        "Set up tech stack",
        "Build MVP prototype",
        "Internal testing"
      ],
      status: businessAnalysisComplete ? "in-progress" : "upcoming"
    },
    {
      id: "launch",
      title: "Beta Launch",
      description: "Launch to early adopters and gather feedback",
      duration: "2-4 weeks",
      icon: Rocket,
      milestones: [
        "Create landing page",
        "Set up analytics",
        "Onboard beta users",
        "Collect user feedback",
        "Iterate on product"
      ],
      status: "upcoming"
    },
    {
      id: "growth",
      title: "Growth & Scale",
      description: "Scale your product and expand market reach",
      duration: "Ongoing",
      icon: TrendingUp,
      milestones: [
        "Implement growth loops",
        "Optimize acquisition channels",
        "Build content strategy",
        "Scale infrastructure",
        "Expand team"
      ],
      status: "upcoming"
    }
  ];

  const getStatusColor = (status: RoadmapPhase["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "in-progress":
        return "bg-primary/20 text-primary border-primary/30";
      case "upcoming":
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusIcon = (status: RoadmapPhase["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Your Product Roadmap
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {projectData?.idea || "Your product"} journey to success
          </p>
        </div>
        <div className="text-right">
          <span className="text-sm font-medium text-foreground">
            {completedCount}/{phases.length} phases
          </span>
          <Progress value={progress} className="w-32 h-2 mt-1" />
        </div>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border hidden md:block" />

        <div className="space-y-4">
          {phases.map((phase, index) => {
            const Icon = phase.icon;
            const isExpanded = expandedPhase === phase.id;

            return (
              <Card
                key={phase.id}
                className={cn(
                  "relative transition-all duration-300 cursor-pointer hover:shadow-md",
                  phase.status === "in-progress" && "ring-2 ring-primary/50",
                  phase.status === "completed" && "opacity-80",
                  isExpanded && "ring-2 ring-primary"
                )}
                onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      {/* Timeline dot */}
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2",
                        phase.status === "completed" && "bg-green-500/20 border-green-500",
                        phase.status === "in-progress" && "bg-primary/20 border-primary",
                        phase.status === "upcoming" && "bg-muted border-border"
                      )}>
                        <Icon className={cn(
                          "w-5 h-5",
                          phase.status === "completed" && "text-green-400",
                          phase.status === "in-progress" && "text-primary",
                          phase.status === "upcoming" && "text-muted-foreground"
                        )} />
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {phase.title}
                          <Badge variant="outline" className={cn("text-xs", getStatusColor(phase.status))}>
                            {getStatusIcon(phase.status)}
                            <span className="ml-1 capitalize">{phase.status.replace("-", " ")}</span>
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
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
                    <div className="ml-16 space-y-3">
                      <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        Key Milestones
                      </h4>
                      <ul className="space-y-2">
                        {phase.milestones.map((milestone, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                          >
                            {phase.status === "completed" ? (
                              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-border shrink-0" />
                            )}
                            {milestone}
                          </li>
                        ))}
                      </ul>
                      {phase.status === "in-progress" && onPhaseClick && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPhaseClick(phase.id);
                          }}
                          className="mt-3"
                        >
                          Continue Working
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <Card className="p-4 text-center">
          <Users className="w-6 h-6 mx-auto text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">{completedCount}</p>
          <p className="text-xs text-muted-foreground">Phases Completed</p>
        </Card>
        <Card className="p-4 text-center">
          <Clock className="w-6 h-6 mx-auto text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">
            {phases.find(p => p.status === "in-progress")?.duration || "-"}
          </p>
          <p className="text-xs text-muted-foreground">Current Phase</p>
        </Card>
        <Card className="p-4 text-center">
          <Target className="w-6 h-6 mx-auto text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">
            {phases.reduce((acc, p) => acc + p.milestones.length, 0)}
          </p>
          <p className="text-xs text-muted-foreground">Total Milestones</p>
        </Card>
      </div>
    </div>
  );
};
