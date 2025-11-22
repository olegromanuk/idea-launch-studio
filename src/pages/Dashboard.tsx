import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Download } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
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

  useEffect(() => {
    // Auto-save canvas data
    localStorage.setItem("leanCanvas", JSON.stringify(canvasData));
  }, [canvasData]);

  const handleInputChange = (field: string, value: string) => {
    setCanvasData(prev => ({ ...prev, [field]: value }));
  };

  if (!projectData) return null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/canvas")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Canvas
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Lean Canvas</h1>
              <p className="text-sm text-muted-foreground">{projectData.idea}</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Lean Canvas Grid */}
        <Card className="p-1 border-2">
          <div className="grid grid-cols-5 gap-[1px] bg-border">
            {/* Row 1 */}
            <CanvasCell
              title="PROBLEM"
              subtitle="List your top 1-3 problems"
              value={canvasData.problem}
              onChange={(value) => handleInputChange("problem", value)}
              className="row-span-2"
            />
            <CanvasCell
              title="SOLUTION"
              subtitle="Outline a possible solution for each problem"
              value={canvasData.solution}
              onChange={(value) => handleInputChange("solution", value)}
            />
            <CanvasCell
              title="UNIQUE VALUE PROPOSITION"
              subtitle="Single, clear, compelling message that states why you are different and worth paying attention"
              value={canvasData.uniqueValueProposition}
              onChange={(value) => handleInputChange("uniqueValueProposition", value)}
              className="row-span-2"
            />
            <CanvasCell
              title="UNFAIR ADVANTAGE"
              subtitle="Something that cannot easily be bought or copied"
              value={canvasData.unfairAdvantage}
              onChange={(value) => handleInputChange("unfairAdvantage", value)}
            />
            <CanvasCell
              title="CUSTOMER SEGMENTS"
              subtitle="List your target customers and users"
              value={canvasData.customerSegments}
              onChange={(value) => handleInputChange("customerSegments", value)}
              className="row-span-2"
            />

            {/* Row 2 - Subsections */}
            <CanvasCell
              title="EXISTING ALTERNATIVES"
              subtitle="List how these problems are solved today"
              value={canvasData.existingAlternatives}
              onChange={(value) => handleInputChange("existingAlternatives", value)}
              isSubsection
            />
            <CanvasCell
              title="KEY METRICS"
              subtitle="List the key numbers that tell you how your business is doing"
              value={canvasData.keyMetrics}
              onChange={(value) => handleInputChange("keyMetrics", value)}
              isSubsection
            />
            <CanvasCell
              title="HIGH-LEVEL CONCEPT"
              subtitle="List your X for Y analogy e.g. YouTube = Flickr for videos"
              value={canvasData.highLevelConcept}
              onChange={(value) => handleInputChange("highLevelConcept", value)}
              isSubsection
            />
            <CanvasCell
              title="CHANNELS"
              subtitle="List your path to customers (inbound or outbound)"
              value={canvasData.channels}
              onChange={(value) => handleInputChange("channels", value)}
              isSubsection
            />
            <CanvasCell
              title="EARLY ADOPTERS"
              subtitle="List the characteristics of your ideal customers"
              value={canvasData.earlyAdopters}
              onChange={(value) => handleInputChange("earlyAdopters", value)}
              isSubsection
            />

            {/* Row 3 - Bottom sections */}
            <CanvasCell
              title="COST STRUCTURE"
              subtitle="List your fixed and variable costs"
              value={canvasData.costStructure}
              onChange={(value) => handleInputChange("costStructure", value)}
              className="col-span-2"
            />
            <CanvasCell
              title="REVENUE STREAMS"
              subtitle="List your sources of revenue"
              value={canvasData.revenueStreams}
              onChange={(value) => handleInputChange("revenueStreams", value)}
              className="col-span-3"
            />
          </div>
        </Card>

        <div className="text-right text-xs text-muted-foreground">
          Generated by SparkilAI • All changes saved automatically
        </div>
      </div>
    </div>
  );
};

interface CanvasCellProps {
  title: string;
  subtitle: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  isSubsection?: boolean;
}

const CanvasCell = ({ title, subtitle, value, onChange, className = "", isSubsection = false }: CanvasCellProps) => {
  return (
    <div className={`bg-background p-4 flex flex-col ${className}`}>
      <div className="mb-3">
        <h3 className={`font-bold ${isSubsection ? "text-xs" : "text-sm"} uppercase tracking-wide mb-1`}>
          {title}
        </h3>
        <p className="text-[10px] text-muted-foreground italic leading-tight">
          {subtitle}
        </p>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type here..."
        className="flex-1 min-h-[120px] resize-none border-0 bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
};

export default Dashboard;
