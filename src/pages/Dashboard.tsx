import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Briefcase, Code, Megaphone, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CanvasBlock {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  sections: string[];
}

const canvasBlocks: CanvasBlock[] = [
  {
    id: "business",
    title: "Business Logic",
    description: "Define your business model, value proposition, and market strategy",
    icon: Briefcase,
    sections: ["problem", "targetAudience", "uniqueValueProposition", "revenueModel", "marketTrends", "successMetrics"],
  },
  {
    id: "development",
    title: "Development",
    description: "Plan your technical architecture, features, and implementation",
    icon: Code,
    sections: ["coreFeatures", "userFlow", "techStack", "dataRequirements", "integrations", "securityConsiderations"],
  },
  {
    id: "gtm",
    title: "Go-to-Market",
    description: "Create your launch strategy, positioning, and growth plan",
    icon: Megaphone,
    sections: ["positioning", "acquisitionChannels", "pricingModel", "launchPlan", "contentStrategy", "growthLoops"],
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projectData, setProjectData] = useState<any>(null);
  const [canvasData, setCanvasData] = useState({
    // Business Logic
    problem: "",
    targetAudience: "",
    uniqueValueProposition: "",
    revenueModel: "",
    marketTrends: "",
    successMetrics: "",
    
    // Development
    coreFeatures: "",
    userFlow: "",
    techStack: "",
    dataRequirements: "",
    integrations: "",
    securityConsiderations: "",
    
    // Go-to-Market
    positioning: "",
    acquisitionChannels: "",
    pricingModel: "",
    launchPlan: "",
    contentStrategy: "",
    growthLoops: "",
  });

  useEffect(() => {
    const data = localStorage.getItem("productIdea");
    if (!data) {
      navigate("/");
      return;
    }
    setProjectData(JSON.parse(data));
    
    // Load saved canvas data if exists
    const savedCanvas = localStorage.getItem("multiCanvas");
    if (savedCanvas) {
      setCanvasData(JSON.parse(savedCanvas));
    }
  }, [navigate]);

  const calculateBlockProgress = (sections: string[]): number => {
    const filledSections = sections.filter(section => {
      const value = canvasData[section as keyof typeof canvasData];
      return value && value.trim().length > 0;
    });
    return Math.round((filledSections.length / sections.length) * 100);
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

        {/* Canvas Blocks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {canvasBlocks.map((block) => {
            const progress = calculateBlockProgress(block.sections);
            const Icon = block.icon;
            const filledSections = block.sections.filter(s => 
              canvasData[s as keyof typeof canvasData]?.trim()
            ).length;
            
            return (
              <Card
                key={block.id}
                className="p-6 cursor-pointer hover-lift hover:border-primary/50 transition-all"
                onClick={() => navigate("/canvas")}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="p-4 rounded-xl gradient-primary">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-3xl font-bold text-primary">{progress}%</span>
                      <span className="text-xs text-muted-foreground">complete</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-xl mb-2">{block.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {block.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Progress value={progress} className="h-2.5" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {filledSections} of {block.sections.length} sections
                      </span>
                      <ChevronRight className="w-5 h-5 text-primary" />
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
