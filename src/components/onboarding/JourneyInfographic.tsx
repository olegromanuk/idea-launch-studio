import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Lightbulb, 
  Code, 
  Rocket, 
  DollarSign, 
  ArrowRight,
  Play,
  SkipForward,
  Sparkles
} from "lucide-react";

interface JourneyInfographicProps {
  onContinue: () => void;
  onSkip: () => void;
  platforms: string[];
  productIdea: string;
}

const JOURNEY_STEPS = [
  {
    id: "idea",
    icon: Lightbulb,
    title: "Your Idea",
    description: "A brilliant concept ready to be shaped",
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-500/10",
  },
  {
    id: "validation",
    icon: Sparkles,
    title: "Validation & Planning",
    description: "Business canvas, market research, strategy",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10",
  },
  {
    id: "development",
    icon: Code,
    title: "Development",
    description: "Building your MVP with AI assistance",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "launch",
    icon: Rocket,
    title: "Launch",
    description: "Deploy to your target platforms",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10",
  },
  {
    id: "revenue",
    icon: DollarSign,
    title: "Revenue",
    description: "Monetize and grow your product",
    color: "from-yellow-500 to-amber-500",
    bgColor: "bg-yellow-500/10",
  },
];

const PLATFORM_ICONS: Record<string, string> = {
  web: "🌐",
  mobile: "📱",
  desktop: "🖥️",
};

export const JourneyInfographic = ({ 
  onContinue, 
  onSkip, 
  platforms, 
  productIdea 
}: JourneyInfographicProps) => {
  const [activeStep, setActiveStep] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const startAnimation = () => {
    setIsAnimating(true);
    setActiveStep(0);
  };

  useEffect(() => {
    if (isAnimating && activeStep < JOURNEY_STEPS.length - 1) {
      const timer = setTimeout(() => {
        setActiveStep(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    } else if (activeStep === JOURNEY_STEPS.length - 1) {
      setTimeout(() => {
        setShowAll(true);
        setIsAnimating(false);
      }, 500);
    }
  }, [activeStep, isAnimating]);

  return (
    <div className="min-h-screen gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-4xl animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Your Journey from Idea to Product
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Watch how we'll transform "{productIdea.slice(0, 50)}..." into a revenue-generating product
          </p>
          {platforms.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="text-sm text-muted-foreground">Target:</span>
              {platforms.map(p => (
                <span key={p} className="text-lg">{PLATFORM_ICONS[p] || p}</span>
              ))}
            </div>
          )}
        </div>

        <Card className="p-8 glass">
          {/* Journey Flow */}
          <div className="relative">
            {/* Connection Lines */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-muted via-primary/30 to-muted -translate-y-1/2 hidden md:block" />
            
            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-2 relative z-10">
              {JOURNEY_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = activeStep >= index || showAll;
                const isCurrent = activeStep === index && isAnimating;
                
                return (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center transition-all duration-500 ${
                      isActive ? "opacity-100 scale-100" : "opacity-30 scale-95"
                    } ${isCurrent ? "animate-pulse" : ""}`}
                  >
                    {/* Icon Circle */}
                    <div
                      className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-3 transition-all duration-500 ${
                        isActive
                          ? `bg-gradient-to-br ${step.color} shadow-lg shadow-primary/20`
                          : "bg-muted"
                      }`}
                    >
                      <Icon className={`w-8 h-8 md:w-10 md:h-10 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                      
                      {/* Pulse ring when active */}
                      {isCurrent && (
                        <div className="absolute inset-0 rounded-full animate-ping bg-primary/30" />
                      )}
                    </div>
                    
                    {/* Arrow between steps (mobile) */}
                    {index < JOURNEY_STEPS.length - 1 && (
                      <ArrowRight className={`w-5 h-5 my-2 md:hidden transition-all duration-500 ${
                        activeStep > index || showAll ? "text-primary" : "text-muted"
                      }`} />
                    )}
                    
                    {/* Text */}
                    <h3 className={`font-semibold text-sm md:text-base text-center transition-colors duration-500 ${
                      isActive ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-xs text-center mt-1 max-w-[120px] transition-colors duration-500 ${
                      isActive ? "text-muted-foreground" : "text-muted-foreground/50"
                    }`}>
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Final Message */}
          {showAll && (
            <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 animate-fade-in">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 mb-2">
                  {platforms.map(p => (
                    <span key={p} className="text-2xl animate-bounce" style={{ animationDelay: `${platforms.indexOf(p) * 0.1}s` }}>
                      {PLATFORM_ICONS[p] || p}
                    </span>
                  ))}
                  <ArrowRight className="w-5 h-5 text-primary mx-2" />
                  <DollarSign className="w-8 h-8 text-green-500 animate-pulse" />
                </div>
                <h3 className="font-bold text-lg text-foreground">Ready to Start Your Journey?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Let's begin with the business canvas to validate your idea
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            {!isAnimating && !showAll && (
              <Button
                onClick={startAnimation}
                className="gradient-primary text-white px-8 hover-glow"
              >
                <Play className="w-4 h-4 mr-2" />
                Watch the Journey
              </Button>
            )}
            
            {showAll && (
              <Button
                onClick={onContinue}
                className="gradient-primary text-white px-8 hover-glow"
              >
                Continue to Canvas
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              onClick={onSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Skip to Canvas
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
