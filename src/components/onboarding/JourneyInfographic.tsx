import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Lightbulb, 
  Code, 
  Rocket, 
  DollarSign, 
  ArrowRight,
  Play,
  SkipForward,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
  CheckCircle2,
  Star
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
    title: "Ideation",
    subtitle: "Your Vision",
    description: "Transform your concept into a validated business opportunity",
    stats: "100+ ideas refined",
    gradient: "from-amber-400 via-orange-500 to-red-500",
    shadowColor: "shadow-orange-500/30",
    features: ["Problem validation", "Market fit analysis", "Opportunity scoring"],
  },
  {
    id: "validation",
    icon: Target,
    title: "Strategy",
    subtitle: "Business Canvas",
    description: "Build your complete business model with AI guidance",
    stats: "9 strategic blocks",
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    shadowColor: "shadow-purple-500/30",
    features: ["Value proposition", "Revenue streams", "Cost structure"],
  },
  {
    id: "development",
    icon: Code,
    title: "Build",
    subtitle: "MVP Development",
    description: "AI-powered development to bring your product to life",
    stats: "10x faster",
    gradient: "from-cyan-400 via-blue-500 to-indigo-600",
    shadowColor: "shadow-blue-500/30",
    features: ["No-code tools", "AI assistance", "Rapid prototyping"],
  },
  {
    id: "launch",
    icon: Rocket,
    title: "Launch",
    subtitle: "Go to Market",
    description: "Deploy across platforms and reach your target audience",
    stats: "Multi-platform",
    gradient: "from-emerald-400 via-green-500 to-teal-600",
    shadowColor: "shadow-green-500/30",
    features: ["Web & mobile", "Marketing tools", "Analytics"],
  },
  {
    id: "revenue",
    icon: TrendingUp,
    title: "Scale",
    subtitle: "Generate Revenue",
    description: "Monetize your product and achieve sustainable growth",
    stats: "$1M+ potential",
    gradient: "from-yellow-400 via-amber-500 to-orange-500",
    shadowColor: "shadow-amber-500/30",
    features: ["Pricing strategy", "Growth hacking", "User retention"],
  },
];

const PLATFORM_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  web: { icon: "🌐", label: "Web App", color: "from-blue-500 to-cyan-500" },
  mobile: { icon: "📱", label: "Mobile", color: "from-purple-500 to-pink-500" },
  desktop: { icon: "🖥️", label: "Desktop", color: "from-emerald-500 to-teal-500" },
};

// Floating particles component
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className="absolute w-2 h-2 rounded-full bg-primary/20"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `float ${5 + Math.random() * 5}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 5}s`,
        }}
      />
    ))}
  </div>
);

// Animated connection line
const ConnectionLine = ({ isActive, delay }: { isActive: boolean; delay: number }) => (
  <div className="hidden md:flex items-center justify-center flex-1 mx-1">
    <div className="relative w-full h-1">
      <div className="absolute inset-0 bg-muted rounded-full" />
      <div 
        className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700 ease-out ${
          isActive ? "w-full" : "w-0"
        }`}
        style={{ transitionDelay: `${delay}ms` }}
      />
      <div 
        className={`absolute top-1/2 -translate-y-1/2 transition-all duration-500 ${
          isActive ? "right-0 opacity-100" : "right-full opacity-0"
        }`}
        style={{ transitionDelay: `${delay + 200}ms` }}
      >
        <Zap className="w-4 h-4 text-accent" />
      </div>
    </div>
  </div>
);

export const JourneyInfographic = ({ 
  onContinue, 
  onSkip, 
  platforms, 
  productIdea 
}: JourneyInfographicProps) => {
  const [activeStep, setActiveStep] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const startAnimation = () => {
    setIsAnimating(true);
    setActiveStep(0);
  };

  useEffect(() => {
    if (isAnimating && activeStep < JOURNEY_STEPS.length - 1) {
      const timer = setTimeout(() => {
        setActiveStep(prev => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (activeStep === JOURNEY_STEPS.length - 1) {
      setTimeout(() => {
        setShowAll(true);
        setIsAnimating(false);
      }, 800);
    }
  }, [activeStep, isAnimating]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />
      
      <FloatingParticles />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-6xl">
          {/* Header Section */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">AI-Powered Product Journey</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                From Idea to
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse">
                Revenue Machine
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
              Watch how we transform your vision into a profitable product
            </p>
            
            {/* Product idea preview */}
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 max-w-lg">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-primary-foreground" />
              </div>
              <p className="text-sm text-left text-muted-foreground line-clamp-2">
                "{productIdea.slice(0, 80)}{productIdea.length > 80 ? '...' : ''}"
              </p>
            </div>
            
            {/* Target platforms */}
            {platforms.length > 0 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <span className="text-sm text-muted-foreground">Deploying to:</span>
                <div className="flex gap-2">
                  {platforms.map(p => {
                    const config = PLATFORM_CONFIG[p];
                    return (
                      <div 
                        key={p} 
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r ${config?.color || 'from-muted to-muted'} text-white text-sm font-medium`}
                      >
                        <span>{config?.icon}</span>
                        <span>{config?.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Main Journey Timeline */}
          <div className="relative mb-12">
            {/* Steps Container */}
            <div className="flex flex-col md:flex-row items-stretch md:items-start gap-4 md:gap-0">
              {JOURNEY_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = activeStep >= index || showAll;
                const isCurrent = activeStep === index && isAnimating;
                const isHovered = hoveredStep === index;
                
                return (
                  <div key={step.id} className="flex flex-col md:flex-row items-center flex-1">
                    {/* Step Card */}
                    <div
                      className={`relative group flex-1 w-full transition-all duration-500 ${
                        isActive ? "opacity-100" : "opacity-40"
                      }`}
                      onMouseEnter={() => setHoveredStep(index)}
                      onMouseLeave={() => setHoveredStep(null)}
                    >
                      <div
                        className={`relative p-6 rounded-2xl border transition-all duration-500 cursor-pointer ${
                          isActive 
                            ? `bg-card/80 backdrop-blur-sm border-border/50 ${step.shadowColor} shadow-xl` 
                            : "bg-muted/30 border-border/20"
                        } ${isCurrent ? "scale-105 ring-2 ring-primary ring-offset-2 ring-offset-background" : ""} ${
                          isHovered && isActive ? "scale-[1.02] -translate-y-1" : ""
                        }`}
                      >
                        {/* Step number badge */}
                        <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                          isActive 
                            ? `bg-gradient-to-br ${step.gradient} text-white shadow-lg` 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {index + 1}
                        </div>
                        
                        {/* Icon */}
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-500 ${
                          isActive 
                            ? `bg-gradient-to-br ${step.gradient} shadow-lg` 
                            : "bg-muted"
                        }`}>
                          <Icon className={`w-7 h-7 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                          {isCurrent && (
                            <div className={`absolute inset-0 rounded-xl animate-ping bg-gradient-to-br ${step.gradient} opacity-50`} />
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-bold text-lg transition-colors duration-500 ${
                              isActive ? "text-foreground" : "text-muted-foreground"
                            }`}>
                              {step.title}
                            </h3>
                            {isActive && showAll && (
                              <CheckCircle2 className="w-4 h-4 text-success animate-scale-in" />
                            )}
                          </div>
                          <p className={`text-xs font-medium uppercase tracking-wider transition-colors duration-500 ${
                            isActive ? "text-primary" : "text-muted-foreground/50"
                          }`}>
                            {step.subtitle}
                          </p>
                          <p className={`text-sm transition-colors duration-500 ${
                            isActive ? "text-muted-foreground" : "text-muted-foreground/50"
                          }`}>
                            {step.description}
                          </p>
                        </div>
                        
                        {/* Stats badge */}
                        <div className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-500 ${
                          isActive 
                            ? `bg-gradient-to-r ${step.gradient} text-white` 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          <Star className="w-3 h-3" />
                          {step.stats}
                        </div>
                        
                        {/* Hover features panel */}
                        <div className={`mt-4 space-y-2 overflow-hidden transition-all duration-300 ${
                          isHovered && isActive ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                        }`}>
                          {step.features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle2 className="w-3.5 h-3.5 text-success flex-shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Connection Line */}
                    {index < JOURNEY_STEPS.length - 1 && (
                      <>
                        <ConnectionLine isActive={activeStep > index || showAll} delay={index * 200} />
                        {/* Mobile arrow */}
                        <div className={`md:hidden my-2 transition-all duration-500 ${
                          activeStep > index || showAll ? "text-primary" : "text-muted"
                        }`}>
                          <ArrowRight className="w-6 h-6 rotate-90" />
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Success State / CTA */}
          {showAll && (
            <div className="animate-fade-in">
              <div className="relative p-8 rounded-3xl overflow-hidden">
                {/* Background effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20" />
                <div className="absolute inset-0 bg-card/60 backdrop-blur-xl" />
                <div className="absolute inset-0 border border-primary/30 rounded-3xl" />
                
                <div className="relative z-10 text-center">
                  {/* Celebration icons */}
                  <div className="flex items-center justify-center gap-4 mb-6">
                    {platforms.map((p, i) => (
                      <div 
                        key={p}
                        className="w-12 h-12 rounded-xl bg-card flex items-center justify-center text-2xl shadow-lg animate-bounce"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        {PLATFORM_CONFIG[p]?.icon}
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-6 h-6 text-primary animate-pulse" />
                    </div>
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <DollarSign className="w-8 h-8 text-white animate-pulse" />
                    </div>
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                    Your Success Path is Clear
                  </h2>
                  <p className="text-muted-foreground mb-2 max-w-lg mx-auto">
                    Join thousands of founders who've turned ideas into revenue
                  </p>
                  
                  {/* Social proof */}
                  <div className="flex items-center justify-center gap-6 mb-8">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground">10,000+ Products Built</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-success" />
                      <span className="text-sm text-muted-foreground">85% Success Rate</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            {!isAnimating && !showAll && (
              <Button
                onClick={startAnimation}
                size="lg"
                className="group relative overflow-hidden bg-gradient-to-r from-primary to-accent text-primary-foreground px-8 py-6 text-lg font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Watch Your Journey
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            )}
            
            {showAll && (
              <Button
                onClick={onContinue}
                size="lg"
                className="group relative overflow-hidden bg-gradient-to-r from-primary to-accent text-primary-foreground px-10 py-6 text-lg font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 animate-pulse"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Let's Start Building
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="lg"
              onClick={onSkip}
              className="text-muted-foreground hover:text-foreground px-6 py-6"
            >
              <SkipForward className="w-5 h-5 mr-2" />
              Skip Preview
            </Button>
          </div>
        </div>
      </div>
      
      {/* CSS for floating animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};
