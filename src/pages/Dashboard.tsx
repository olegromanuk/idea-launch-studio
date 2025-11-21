import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Download,
  Share2,
  Sparkles,
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState<any>(null);
  const [progress] = useState(50); // Mock progress for now

  useEffect(() => {
    const data = localStorage.getItem("productIdea");
    if (!data) {
      navigate("/");
      return;
    }
    setProjectData(JSON.parse(data));
  }, [navigate]);

  if (!projectData) return null;

  const steps = [
    { name: "Idea Validation", completed: true },
    { name: "Target Audience & Value Proposition", completed: true },
    { name: "Product Architecture", completed: true },
    { name: "UI / UX Design Elements", completed: false },
    { name: "Tech Stack / MVP Logic", completed: false },
    { name: "Launch Plan & Marketing", completed: false },
  ];

  return (
    <div className="min-h-screen gradient-subtle p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Project Dashboard
            </h1>
            <p className="text-muted-foreground">Track your progress and manage your product journey</p>
          </div>
          <Button
            onClick={() => navigate("/canvas")}
            className="gradient-primary text-white hover-glow"
          >
            Continue Building
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

        {/* Progress Overview */}
        <Card className="p-6 glass hover-lift">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Overall Progress</h2>
              <span className="text-2xl font-bold text-primary">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-muted-foreground">
              3 of 6 steps completed • Keep going!
            </p>
          </div>
        </Card>

        {/* Project Summary */}
        <Card className="p-6 glass">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Your Product Idea
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Concept</h3>
              <p className="text-foreground">{projectData.idea}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Target Audience</h3>
              <p className="text-foreground">{projectData.audience}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Problem Solved</h3>
              <p className="text-foreground">{projectData.problem}</p>
            </div>
          </div>
        </Card>

        {/* Steps Checklist */}
        <Card className="p-6 glass">
          <h2 className="text-xl font-semibold mb-4">Steps Checklist</h2>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                {step.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
                <span
                  className={step.completed ? "text-foreground" : "text-muted-foreground"}
                >
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Export Options */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-6 glass hover-lift cursor-pointer group">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Export as PDF</h3>
                <p className="text-sm text-muted-foreground">
                  Download a comprehensive project summary
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 glass hover-lift cursor-pointer group">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                <Share2 className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Share Preview</h3>
                <p className="text-sm text-muted-foreground">
                  Generate a shareable landing page preview
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
