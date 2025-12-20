import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { 
  Lightbulb, 
  Code, 
  Rocket, 
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Target,
  CheckCircle2,
  Play,
  Pause,
  Users,
  DollarSign,
  Zap,
  BarChart3,
  Layers,
  Globe,
  Smartphone,
  Monitor
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
    subtitle: "Define Your Vision",
    description: "Transform your raw concept into a validated, market-ready business opportunity through AI-powered analysis",
    gradient: "from-amber-500 via-orange-500 to-red-500",
    bgGradient: "from-amber-500/10 via-orange-500/5 to-transparent",
    stats: [
      { label: "Ideas Refined", value: "100+", icon: Sparkles },
      { label: "Success Rate", value: "85%", icon: Target },
      { label: "Time Saved", value: "40hrs", icon: Zap },
    ],
    features: [
      "AI-powered problem validation",
      "Market fit analysis & scoring",
      "Competitor landscape mapping",
      "Opportunity identification",
    ],
    visual: "ideation",
  },
  {
    id: "validation",
    icon: Target,
    title: "Strategy",
    subtitle: "Build Your Canvas",
    description: "Create a comprehensive business model with our AI-guided canvas covering all strategic pillars",
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    bgGradient: "from-violet-500/10 via-purple-500/5 to-transparent",
    stats: [
      { label: "Strategic Blocks", value: "9", icon: Layers },
      { label: "Revenue Streams", value: "3+", icon: BarChart3 },
      { label: "User Segments", value: "5+", icon: Users },
    ],
    features: [
      "Value proposition design",
      "Revenue model planning",
      "Cost structure optimization",
      "Channel strategy mapping",
    ],
    visual: "strategy",
  },
  {
    id: "development",
    icon: Code,
    title: "Build",
    subtitle: "MVP Development",
    description: "Bring your product to life with AI-powered development tools and no-code solutions",
    gradient: "from-cyan-400 via-blue-500 to-indigo-600",
    bgGradient: "from-cyan-400/10 via-blue-500/5 to-transparent",
    stats: [
      { label: "Dev Speed", value: "10x", icon: Zap },
      { label: "Code Quality", value: "A+", icon: CheckCircle2 },
      { label: "Time to MVP", value: "2wks", icon: Target },
    ],
    features: [
      "No-code/low-code tools",
      "AI coding assistance",
      "Rapid prototyping",
      "Automated testing",
    ],
    visual: "build",
  },
  {
    id: "launch",
    icon: Rocket,
    title: "Launch",
    subtitle: "Go to Market",
    description: "Deploy across multiple platforms and reach your target audience with strategic marketing",
    gradient: "from-emerald-400 via-green-500 to-teal-600",
    bgGradient: "from-emerald-400/10 via-green-500/5 to-transparent",
    stats: [
      { label: "Platforms", value: "3+", icon: Globe },
      { label: "Reach", value: "1M+", icon: Users },
      { label: "Conversion", value: "5%+", icon: TrendingUp },
    ],
    features: [
      "Multi-platform deployment",
      "Marketing automation",
      "Analytics integration",
      "User onboarding flows",
    ],
    visual: "launch",
  },
  {
    id: "revenue",
    icon: TrendingUp,
    title: "Scale",
    subtitle: "Generate Revenue",
    description: "Monetize your product effectively and achieve sustainable, scalable growth",
    gradient: "from-yellow-400 via-amber-500 to-orange-500",
    bgGradient: "from-yellow-400/10 via-amber-500/5 to-transparent",
    stats: [
      { label: "Revenue Potential", value: "$1M+", icon: DollarSign },
      { label: "Growth Rate", value: "20%", icon: TrendingUp },
      { label: "Retention", value: "90%", icon: Users },
    ],
    features: [
      "Pricing optimization",
      "Growth hacking strategies",
      "User retention systems",
      "Revenue analytics",
    ],
    visual: "scale",
  },
];

const PLATFORM_CONFIG: Record<string, { icon: typeof Globe; label: string }> = {
  web: { icon: Globe, label: "Web App" },
  mobile: { icon: Smartphone, label: "Mobile" },
  desktop: { icon: Monitor, label: "Desktop" },
};

// Visual illustrations for each step
const StepVisual = ({ type, gradient }: { type: string; gradient: string }) => {
  const baseClasses = "relative w-full h-full flex items-center justify-center";
  
  const renderVisual = () => {
    switch (type) {
      case "ideation":
        return (
          <div className="relative">
            <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${gradient} opacity-20 blur-3xl absolute -inset-8`} />
            <div className="relative grid grid-cols-3 gap-3">
              {[...Array(9)].map((_, i) => (
                <div 
                  key={i}
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} opacity-${20 + i * 8} flex items-center justify-center`}
                  style={{ 
                    animationDelay: `${i * 100}ms`,
                    animation: 'pulse 2s ease-in-out infinite'
                  }}
                >
                  <Lightbulb className="w-5 h-5 text-white/80" />
                </div>
              ))}
            </div>
          </div>
        );
      case "strategy":
        return (
          <div className="relative">
            <div className={`w-40 h-40 rounded-3xl bg-gradient-to-br ${gradient} opacity-10 blur-2xl absolute -inset-4`} />
            <div className="relative grid grid-cols-3 gap-2">
              {["Value", "Users", "Revenue", "Channels", "Key", "Cost", "Partners", "Activities", "Resources"].map((label, i) => (
                <div 
                  key={i}
                  className={`w-16 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-[10px] font-medium opacity-${60 + i * 5}`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        );
      case "build":
        return (
          <div className="relative">
            <div className={`w-36 h-36 bg-gradient-to-br ${gradient} opacity-10 blur-3xl absolute -inset-6`} />
            <div className="relative space-y-2">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i}
                  className={`h-3 rounded-full bg-gradient-to-r ${gradient}`}
                  style={{ 
                    width: `${100 - i * 15}%`,
                    opacity: 0.4 + i * 0.12
                  }}
                />
              ))}
              <div className={`mt-4 w-full h-20 rounded-xl bg-gradient-to-br ${gradient} opacity-30 flex items-center justify-center`}>
                <Code className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        );
      case "launch":
        return (
          <div className="relative">
            <div className={`w-32 h-32 bg-gradient-to-br ${gradient} opacity-15 blur-3xl absolute -inset-4`} />
            <div className="relative flex items-center gap-4">
              <Rocket className={`w-16 h-16 text-transparent bg-gradient-to-br ${gradient} bg-clip-text`} style={{ filter: 'drop-shadow(0 0 20px hsl(var(--primary) / 0.3))' }} />
              <div className="space-y-2">
                {[Globe, Smartphone, Monitor].map((Icon, i) => (
                  <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r ${gradient} opacity-${60 + i * 15}`}>
                    <Icon className="w-4 h-4 text-white" />
                    <span className="text-xs text-white font-medium">Deploy</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case "scale":
        return (
          <div className="relative">
            <div className={`w-36 h-36 bg-gradient-to-br ${gradient} opacity-15 blur-3xl absolute -inset-6`} />
            <div className="relative flex flex-col items-center">
              <div className="flex items-end gap-2 mb-4">
                {[40, 55, 45, 70, 60, 85, 75, 95].map((h, i) => (
                  <div 
                    key={i}
                    className={`w-4 rounded-t-sm bg-gradient-to-t ${gradient}`}
                    style={{ height: `${h}px`, opacity: 0.5 + i * 0.06 }}
                  />
                ))}
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${gradient}`}>
                <DollarSign className="w-5 h-5 text-white" />
                <span className="text-white font-bold">Revenue</span>
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return <div className={baseClasses}>{renderVisual()}</div>;
};

export const JourneyInfographic = ({ 
  onContinue, 
  onSkip, 
  platforms, 
  productIdea 
}: JourneyInfographicProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning]);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % JOURNEY_STEPS.length);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + JOURNEY_STEPS.length) % JOURNEY_STEPS.length);
  }, [currentSlide, goToSlide]);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, nextSlide]);

  const currentStep = JOURNEY_STEPS[currentSlide];
  const Icon = currentStep.icon;

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Background gradient based on current slide */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${currentStep.bgGradient} transition-all duration-700`}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 md:p-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Product Journey</span>
            </div>
            
            <Button variant="ghost" onClick={onSkip} className="text-muted-foreground">
              Skip intro
            </Button>
          </div>
        </header>

        {/* Main Slide Area */}
        <main className="flex-1 flex items-center px-6 md:px-8 pb-8">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Content */}
              <div 
                key={currentSlide}
                className="space-y-8 animate-fade-in"
              >
                {/* Step indicator */}
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${currentStep.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold uppercase tracking-wider bg-gradient-to-r ${currentStep.gradient} bg-clip-text text-transparent`}>
                      Step {currentSlide + 1} of {JOURNEY_STEPS.length}
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                      {currentStep.title}
                    </h1>
                  </div>
                </div>

                {/* Subtitle & Description */}
                <div className="space-y-4">
                  <h2 className={`text-2xl font-semibold bg-gradient-to-r ${currentStep.gradient} bg-clip-text text-transparent`}>
                    {currentStep.subtitle}
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                    {currentStep.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {currentStep.stats.map((stat, i) => {
                    const StatIcon = stat.icon;
                    return (
                      <div 
                        key={i}
                        className="p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover-lift"
                      >
                        <StatIcon className={`w-5 h-5 mb-2 bg-gradient-to-r ${currentStep.gradient} bg-clip-text text-transparent`} style={{ color: 'hsl(var(--primary))' }} />
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 gap-3">
                  {currentStep.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className={`w-4 h-4 flex-shrink-0`} style={{ color: 'hsl(var(--success))' }} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Visual */}
              <div 
                key={`visual-${currentSlide}`}
                className="hidden lg:flex items-center justify-center animate-scale-in"
              >
                <div className="w-full max-w-md aspect-square flex items-center justify-center">
                  <StepVisual type={currentStep.visual} gradient={currentStep.gradient} />
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer: Navigation & Controls */}
        <footer className="p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Pagination Dots */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {JOURNEY_STEPS.map((step, i) => (
                <button
                  key={step.id}
                  onClick={() => goToSlide(i)}
                  className={`transition-all duration-300 rounded-full ${
                    i === currentSlide 
                      ? `w-8 h-2 bg-gradient-to-r ${step.gradient}` 
                      : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              {/* Left: Prev/Next & Auto-play */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevSlide}
                  disabled={isTransitioning}
                  className="rounded-full"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className="rounded-full"
                >
                  {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextSlide}
                  disabled={isTransitioning}
                  className="rounded-full"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Center: Product idea preview */}
              <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-border/50 max-w-md">
                <Lightbulb className="w-4 h-4 text-primary flex-shrink-0" />
                <p className="text-sm text-muted-foreground truncate">
                  {productIdea.slice(0, 50)}{productIdea.length > 50 ? '...' : ''}
                </p>
              </div>

              {/* Right: Target platforms & CTA */}
              <div className="flex items-center gap-4">
                {platforms.length > 0 && (
                  <div className="hidden sm:flex items-center gap-2">
                    {platforms.map(p => {
                      const config = PLATFORM_CONFIG[p];
                      const PlatformIcon = config?.icon || Globe;
                      return (
                        <div 
                          key={p}
                          className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"
                          title={config?.label}
                        >
                          <PlatformIcon className="w-4 h-4 text-muted-foreground" />
                        </div>
                      );
                    })}
                  </div>
                )}
                
                <Button onClick={onContinue} size="lg" className="gap-2">
                  Start Building
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
