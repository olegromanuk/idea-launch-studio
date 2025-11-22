import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Lightbulb, Target, Boxes, Palette, Cpu, Rocket, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CanvasStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: string[];
}

const canvasSteps: CanvasStep[] = [
  {
    id: 1,
    title: "Idea Validation",
    description: "Validate your product concept and market fit",
    icon: Lightbulb,
    fields: ["problem", "existingAlternatives", "solution", "keyMetrics"],
  },
  {
    id: 2,
    title: "Target Audience & Value Proposition",
    description: "Define who you're building for and why they'll care",
    icon: Target,
    fields: ["customerSegments", "earlyAdopters", "uniqueValueProposition", "highLevelConcept"],
  },
  {
    id: 3,
    title: "Product Architecture",
    description: "Map out the core features and user flows",
    icon: Boxes,
    fields: ["solution", "keyMetrics"],
  },
  {
    id: 4,
    title: "UI / UX Design Elements",
    description: "Design the look, feel, and user experience",
    icon: Palette,
    fields: ["channels", "uniqueValueProposition"],
  },
  {
    id: 5,
    title: "Tech Stack / MVP Logic",
    description: "Choose the right technologies for your MVP",
    icon: Cpu,
    fields: ["costStructure", "revenueStreams"],
  },
  {
    id: 6,
    title: "Launch Plan & Marketing",
    description: "Create your go-to-market strategy",
    icon: Rocket,
    fields: ["channels", "unfairAdvantage"],
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projectData, setProjectData] = useState<any>(null);
  const [canvasData, setCanvasData] = useState({
    problem: "",
    existingAlternatives: "",
    solution: "",
    keyMetrics: "",
    uniqueValueProposition: "",
    highLevelConcept: "",
    unfairAdvantage: "",
    channels: "",
    customerSegments: "",
    earlyAdopters: "",
    costStructure: "",
    revenueStreams: "",
  });

  useEffect(() => {
    const data = localStorage.getItem("productIdea");
    if (!data) {
      navigate("/");
      return;
    }
    setProjectData(JSON.parse(data));
    
    // Load saved canvas data if exists
    const savedCanvas = localStorage.getItem("leanCanvas");
    if (savedCanvas) {
      setCanvasData(JSON.parse(savedCanvas));
    }
  }, [navigate]);

  const calculateStepProgress = (fields: string[]): number => {
    const filledFields = fields.filter(field => {
      const value = canvasData[field as keyof typeof canvasData];
      return value && value.trim().length > 0;
    });
    return Math.round((filledFields.length / fields.length) * 100);
  };

  const calculateOverallProgress = (): number => {
    const allFields = Object.values(canvasData);
    const filledFields = allFields.filter(value => value && value.trim().length > 0);
    return Math.round((filledFields.length / allFields.length) * 100);
  };

  if (!projectData) return null;

  const overallProgress = calculateOverallProgress();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Home
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Product Development Dashboard</h1>
              <p className="text-sm text-muted-foreground">{projectData.idea}</p>
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <Card className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Overall Progress</h2>
                <p className="text-sm text-muted-foreground">
                  Complete all sections to validate your product
                </p>
              </div>
              <div className="text-3xl font-bold text-primary">
                {overallProgress}%
              </div>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>
        </Card>

        {/* Canvas Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {canvasSteps.map((step) => {
            const progress = calculateStepProgress(step.fields);
            const Icon = step.icon;
            
            return (
              <Card
                key={step.id}
                className="p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50"
                onClick={() => navigate("/canvas")}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-2xl font-bold text-primary">{progress}%</span>
                      <span className="text-xs text-muted-foreground">complete</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {step.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {step.fields.filter(f => canvasData[f as keyof typeof canvasData]?.trim()).length} of {step.fields.length} fields
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center gap-4">
          <Button onClick={() => navigate("/canvas")} size="lg">
            Continue Working on Canvas
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
