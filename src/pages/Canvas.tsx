import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StepCard } from "@/components/canvas/StepCard";
import { ArrowLeft, Download, Home } from "lucide-react";
import {
  Lightbulb,
  Target,
  Boxes,
  Palette,
  Cpu,
  Rocket,
} from "lucide-react";

export interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
  expanded: boolean;
}

const Canvas = () => {
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState<any>(null);
  const [steps, setSteps] = useState<Step[]>([
    {
      id: 1,
      title: "Idea Validation",
      description: "Validate your product concept and market fit",
      icon: Lightbulb,
      completed: false,
      expanded: false,
    },
    {
      id: 2,
      title: "Target Audience & Value Proposition",
      description: "Define who you're building for and why they'll care",
      icon: Target,
      completed: false,
      expanded: false,
    },
    {
      id: 3,
      title: "Product Architecture",
      description: "Map out the core features and user flows",
      icon: Boxes,
      completed: false,
      expanded: false,
    },
    {
      id: 4,
      title: "UI / UX Design Elements",
      description: "Design the look, feel, and user experience",
      icon: Palette,
      completed: false,
      expanded: false,
    },
    {
      id: 5,
      title: "Tech Stack / MVP Logic",
      description: "Choose the right technologies for your MVP",
      icon: Cpu,
      completed: false,
      expanded: false,
    },
    {
      id: 6,
      title: "Launch Plan & Marketing",
      description: "Create your go-to-market strategy",
      icon: Rocket,
      completed: false,
      expanded: false,
    },
  ]);

  useEffect(() => {
    const data = localStorage.getItem("productIdea");
    if (!data) {
      navigate("/");
      return;
    }
    setProjectData(JSON.parse(data));
  }, [navigate]);

  const toggleStep = (stepId: number) => {
    setSteps(
      steps.map((step) =>
        step.id === stepId ? { ...step, expanded: !step.expanded } : step
      )
    );
  };

  const markStepComplete = (stepId: number) => {
    setSteps(
      steps.map((step) =>
        step.id === stepId ? { ...step, completed: true } : step
      )
    );
  };

  const completedSteps = steps.filter((s) => s.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  if (!projectData) return null;

  return (
    <div className="min-h-screen gradient-subtle">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="hover-scale"
              >
                <Home className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="font-semibold text-foreground">Your Product Journey</h2>
                <p className="text-sm text-muted-foreground">
                  {completedSteps} of {steps.length} steps completed
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="hover-lift"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button
                size="sm"
                className="gradient-accent text-white hover-accent-glow"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      {/* Canvas Area */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {steps.map((step, index) => (
            <StepCard
              key={step.id}
              step={step}
              index={index}
              projectData={projectData}
              onToggle={() => toggleStep(step.id)}
              onComplete={() => markStepComplete(step.id)}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Canvas;
