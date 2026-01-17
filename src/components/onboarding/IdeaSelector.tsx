import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Check, RefreshCw, ArrowRight, ArrowLeft, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";

interface ProductIdea {
  title: string;
  description: string;
  audience: string;
  problem: string;
}

type PersonaType = "enterprise" | "agency" | "solo";

interface IdeaSelectorProps {
  onIdeaSelect: (idea: ProductIdea) => void;
  onCancel: () => void;
  persona?: PersonaType;
}

const INTEREST_OPTIONS_BY_PERSONA = {
  enterprise: [
    "AI & Automation",
    "Compliance & Governance",
    "Supply Chain & Logistics",
    "Data Analytics & BI",
    "Cybersecurity",
    "HR & Workforce Management",
    "Customer Experience",
    "Digital Transformation",
    "Financial Operations",
    "Enterprise Integration",
    "Process Automation",
    "Risk Management",
  ],
  agency: [
    "Client Management",
    "Project Delivery",
    "Creative Workflows",
    "Marketing Automation",
    "Content & Media",
    "Analytics & Reporting",
    "White-Label Solutions",
    "Team Collaboration",
    "Proposal & Invoicing",
    "Resource Planning",
    "Brand Management",
    "Client Communication",
  ],
  solo: [
    "AI & Machine Learning",
    "Productivity Tools",
    "E-commerce",
    "Healthcare",
    "Education",
    "Finance",
    "Social Impact",
    "Content Creation",
    "Gaming",
    "Sustainability",
    "Remote Work",
    "Developer Tools",
  ],
};

export const IdeaSelector = ({ onIdeaSelect, onCancel, persona = "solo" }: IdeaSelectorProps) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [ideas, setIdeas] = useState<ProductIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<number | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({
    businessDescription: "",
    passions: "",
    dailyLife: "",
    problemSolving: "",
    values: "",
    experience: "",
    timeCommitment: "",
    budget: "",
  });
  const { toast } = useToast();

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const generateIdeas = async (refinement?: any) => {
    if (selectedInterests.length === 0) {
      toast({
        title: "Select interests",
        description: "Please select at least one area of interest",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-product-ideas",
        {
          body: { interests: selectedInterests, refinement, persona },
        }
      );

      if (error) throw error;

      if (data?.ideas) {
        setIdeas(data.ideas);
        setShowQuiz(false);
      }
    } catch (error: any) {
      console.error("Error generating ideas:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate ideas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefineIdeas = () => {
    setShowQuiz(true);
    setQuizStep(0);
    setIdeas([]);
  };

  const handleQuizNext = () => {
    const questions = QUIZ_QUESTIONS_BY_PERSONA[persona];
    if (quizStep < questions.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      generateIdeas(quizAnswers);
    }
  };

  const regenerateIdeas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-product-ideas",
        {
          body: { interests: selectedInterests, refinement: quizAnswers, regenerate: true, persona },
        }
      );

      if (error) throw error;

      if (data?.ideas) {
        setIdeas(data.ideas);
        toast({
          title: "Ideas regenerated!",
          description: "Here are fresh suggestions based on your profile",
        });
      }
    } catch (error: any) {
      console.error("Error regenerating ideas:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to regenerate ideas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuizBack = () => {
    if (quizStep > 0) {
      setQuizStep(quizStep - 1);
    } else {
      setShowQuiz(false);
      setIdeas([]);
    }
  };

  const handleIdeaClick = (index: number) => {
    setSelectedIdea(index);
  };

  const confirmSelection = () => {
    if (selectedIdea !== null) {
      onIdeaSelect(ideas[selectedIdea]);
    }
  };

  const QUIZ_QUESTIONS_BY_PERSONA = {
    enterprise: [
      {
        title: "What is your business?",
        description: "Give us a brief overview of your organization",
        placeholder: "e.g., We are a Fortune 500 retail company with 500+ stores globally, specializing in consumer electronics...",
        field: "businessDescription" as const,
        type: "textarea" as const,
      },
      {
        title: "What industry does your organization operate in?",
        description: "Help us understand your business context",
        placeholder: "e.g., Financial services, Healthcare, Manufacturing, Technology...",
        field: "passions" as const,
        type: "textarea" as const,
      },
      {
        title: "What are your organization's key strategic priorities?",
        description: "Share the main goals driving your product initiatives",
        placeholder: "e.g., Digital transformation, customer experience improvement, operational efficiency, market expansion...",
        field: "dailyLife" as const,
        type: "textarea" as const,
      },
      {
        title: "What's your organization's approach to innovation?",
        description: "How does your company typically adopt new solutions?",
        options: [
          { value: "analytical", label: "Data-driven - Extensive analysis and proof of concept required" },
          { value: "creative", label: "Innovation labs - Dedicated teams for experimentation" },
          { value: "practical", label: "Incremental - Gradual improvements to existing systems" },
          { value: "collaborative", label: "Partnership-focused - Work with vendors and consultants" },
        ],
        field: "problemSolving" as const,
        type: "radio" as const,
      },
      {
        title: "What matters most for your enterprise solution?",
        description: "Select your primary evaluation criteria",
        options: [
          { value: "impact", label: "ROI and measurable business impact" },
          { value: "innovation", label: "Competitive advantage and market differentiation" },
          { value: "freedom", label: "Scalability and enterprise-grade reliability" },
          { value: "growth", label: "Compliance and security requirements" },
        ],
        field: "values" as const,
        type: "radio" as const,
      },
      {
        title: "What's your team's technical capability?",
        description: "This helps us suggest appropriately complex solutions",
        options: [
          { value: "beginner", label: "Limited - Will need external implementation support" },
          { value: "intermediate", label: "Moderate - Can customize with guidance" },
          { value: "advanced", label: "Strong - Full in-house development capability" },
          { value: "expert", label: "Expert - Dedicated product and engineering teams" },
        ],
        field: "experience" as const,
        type: "radio" as const,
      },
      {
        title: "What's your expected timeline for initial deployment?",
        description: "When do you need the solution operational?",
        options: [
          { value: "5-10", label: "3-6 months - Quick pilot needed" },
          { value: "10-20", label: "6-12 months - Standard enterprise timeline" },
          { value: "20-40", label: "12-18 months - Complex integration required" },
          { value: "40+", label: "18+ months - Multi-phase transformation" },
        ],
        field: "timeCommitment" as const,
        type: "radio" as const,
      },
      {
        title: "What's your budget range for this initiative?",
        description: "Including development, licensing, and implementation",
        options: [
          { value: "0-1000", label: "$50K-100K - Pilot/proof of concept" },
          { value: "1000-5000", label: "$100K-500K - Departmental solution" },
          { value: "5000-20000", label: "$500K-2M - Enterprise-wide deployment" },
          { value: "20000+", label: "$2M+ - Strategic transformation program" },
        ],
        field: "budget" as const,
        type: "radio" as const,
      },
    ],
    agency: [
      {
        title: "What type of services does your agency primarily offer?",
        description: "Tell us about your agency's focus areas",
        placeholder: "e.g., Digital marketing, web development, branding, UX/UI design, consulting...",
        field: "passions" as const,
        type: "textarea" as const,
      },
      {
        title: "Describe your typical client engagement",
        description: "Help us understand your workflow and client relationships",
        placeholder: "e.g., We work with mid-size e-commerce brands on 3-6 month retainers, handling their full digital presence...",
        field: "dailyLife" as const,
        type: "textarea" as const,
      },
      {
        title: "How does your agency approach new projects?",
        description: "What's your typical project methodology?",
        options: [
          { value: "analytical", label: "Research-first - Deep discovery and strategy phases" },
          { value: "creative", label: "Design-led - Visual concepts drive the process" },
          { value: "practical", label: "Agile sprints - Rapid iteration with client feedback" },
          { value: "collaborative", label: "Co-creation - Close partnership with client teams" },
        ],
        field: "problemSolving" as const,
        type: "radio" as const,
      },
      {
        title: "What does your agency value most?",
        description: "Select what drives your business decisions",
        options: [
          { value: "impact", label: "Client results and measurable outcomes" },
          { value: "innovation", label: "Creative excellence and award-winning work" },
          { value: "freedom", label: "Recurring revenue and scalable services" },
          { value: "growth", label: "Team growth and capability building" },
        ],
        field: "values" as const,
        type: "radio" as const,
      },
      {
        title: "What's your agency's current size?",
        description: "This helps us suggest ideas matching your capacity",
        options: [
          { value: "beginner", label: "Boutique - 2-5 people" },
          { value: "intermediate", label: "Small - 6-15 people" },
          { value: "advanced", label: "Mid-size - 16-50 people" },
          { value: "expert", label: "Large - 50+ people" },
        ],
        field: "experience" as const,
        type: "radio" as const,
      },
      {
        title: "How much time can your team dedicate to a new product/tool?",
        description: "Be realistic about bandwidth alongside client work",
        options: [
          { value: "5-10", label: "5-10 hours/week - Side initiative" },
          { value: "10-20", label: "10-20 hours/week - Dedicated resource" },
          { value: "20-40", label: "20-40 hours/week - Small team focus" },
          { value: "40+", label: "40+ hours/week - Major strategic investment" },
        ],
        field: "timeCommitment" as const,
        type: "radio" as const,
      },
      {
        title: "What's your investment capacity for internal tools/products?",
        description: "For development, design, and launch",
        options: [
          { value: "0-1000", label: "$0-5K - Bootstrap with existing team" },
          { value: "1000-5000", label: "$5K-25K - Modest dedicated budget" },
          { value: "5000-20000", label: "$25K-100K - Serious internal investment" },
          { value: "20000+", label: "$100K+ - Major product initiative" },
        ],
        field: "budget" as const,
        type: "radio" as const,
      },
    ],
    solo: [
      {
        title: "What are you most passionate about?",
        description: "Tell us about topics that genuinely excite you and you could talk about for hours",
        placeholder: "e.g., I'm fascinated by AI and how it can make healthcare more accessible. I also love sustainable living and finding ways to reduce waste...",
        field: "passions" as const,
        type: "textarea" as const,
      },
      {
        title: "Describe your typical day or work style",
        description: "Help us understand your lifestyle and how you prefer to work",
        placeholder: "e.g., I work remotely as a designer, usually start late morning, take breaks for exercise. I prefer focused work blocks over meetings...",
        field: "dailyLife" as const,
        type: "textarea" as const,
      },
      {
        title: "How do you approach problem-solving?",
        description: "What's your thinking style when facing challenges?",
        options: [
          { value: "analytical", label: "Analytical - I love data and systematic approaches" },
          { value: "creative", label: "Creative - I prefer brainstorming and innovative solutions" },
          { value: "practical", label: "Practical - I focus on what works quickly" },
          { value: "collaborative", label: "Collaborative - I work best with others" },
        ],
        field: "problemSolving" as const,
        type: "radio" as const,
      },
      {
        title: "What values matter most in your work?",
        description: "Select what drives your decisions",
        options: [
          { value: "impact", label: "Making a positive impact on people's lives" },
          { value: "innovation", label: "Creating something new and innovative" },
          { value: "freedom", label: "Independence and flexibility" },
          { value: "growth", label: "Learning and personal growth" },
        ],
        field: "values" as const,
        type: "radio" as const,
      },
      {
        title: "What's your experience level with building products?",
        description: "This helps us suggest ideas matching your skills",
        options: [
          { value: "beginner", label: "Beginner - Just starting out" },
          { value: "intermediate", label: "Intermediate - Built a few things" },
          { value: "advanced", label: "Advanced - Multiple successful launches" },
          { value: "expert", label: "Expert - Serial entrepreneur" },
        ],
        field: "experience" as const,
        type: "radio" as const,
      },
      {
        title: "How much time can you dedicate weekly?",
        description: "Be realistic about your availability",
        options: [
          { value: "5-10", label: "5-10 hours - Side project" },
          { value: "10-20", label: "10-20 hours - Serious side hustle" },
          { value: "20-40", label: "20-40 hours - Part-time focus" },
          { value: "40+", label: "40+ hours - Full-time commitment" },
        ],
        field: "timeCommitment" as const,
        type: "radio" as const,
      },
      {
        title: "What's your initial budget range?",
        description: "For tools, development, marketing, etc.",
        options: [
          { value: "0-1000", label: "$0-1,000 - Bootstrap mode" },
          { value: "1000-5000", label: "$1,000-5,000 - Modest investment" },
          { value: "5000-20000", label: "$5,000-20,000 - Serious investment" },
          { value: "20000+", label: "$20,000+ - Well-funded" },
        ],
        field: "budget" as const,
        type: "radio" as const,
      },
    ],
  };

  const QUIZ_QUESTIONS = QUIZ_QUESTIONS_BY_PERSONA[persona];

  const currentQuestion = QUIZ_QUESTIONS[quizStep];
  const isQuizStepValid = currentQuestion?.type === "radio" 
    ? !!quizAnswers[currentQuestion.field]
    : quizAnswers[currentQuestion?.field]?.trim().length > 0;

  // Blueprint styled components
  const BlueprintHeader = ({ step, title, subtitle }: { step: string; title: string; subtitle: string }) => (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-3 mb-3">
        <span className="text-xs font-mono text-[#0EA5E9] uppercase tracking-widest">{step}</span>
        <span className="bg-[#0EA5E9]/10 text-[#0EA5E9] text-[10px] px-2 py-0.5 border border-[#0EA5E9]/30 rounded font-bold uppercase tracking-tighter">
          AI Analysis Active
        </span>
      </div>
      <h1 className="text-3xl font-bold uppercase tracking-tight mb-3 text-white">{title}</h1>
      <p className="text-[#94A3B8] text-sm max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
    </div>
  );

  const BlueprintButton = ({ 
    children, 
    onClick, 
    disabled, 
    variant = "default",
    className = ""
  }: { 
    children: React.ReactNode; 
    onClick?: () => void; 
    disabled?: boolean;
    variant?: "default" | "primary" | "outline";
    className?: string;
  }) => {
    const baseStyles = "px-6 py-3 text-xs font-bold uppercase tracking-widest rounded-sm transition-all flex items-center justify-center gap-2";
    const variants = {
      default: "border border-[#1E293B] bg-[#0A0F16] hover:bg-[#111827] text-white",
      primary: "bg-[#0EA5E9] text-white hover:brightness-110 shadow-[0_0_30px_rgba(14,165,233,0.3)]",
      outline: "border border-[#1E293B] bg-transparent hover:border-[#0EA5E9]/50 text-[#94A3B8] hover:text-white"
    };

    return (
      <button 
        onClick={onClick} 
        disabled={disabled}
        className={`${baseStyles} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="relative">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-15"
        style={{
          backgroundImage: 'linear-gradient(to right, #1f2937 1px, transparent 1px), linear-gradient(to bottom, #1f2937 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {showQuiz ? (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <BlueprintHeader 
                step={`Question ${quizStep + 1} / ${QUIZ_QUESTIONS.length}`}
                title="Let's Get to Know You"
                subtitle="Our orchestration engine needs more context to generate personalized opportunities."
              />

              {/* Progress Bar */}
              <div className="w-full bg-[#1E293B] rounded-full h-1 mb-8">
                <motion.div 
                  className="bg-[#0EA5E9] h-1 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((quizStep + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Question Card */}
              <div className="border border-[#1E293B] bg-[#0A0F16]/80 p-6 rounded-sm">
                <h4 className="text-lg font-bold uppercase tracking-tight text-white mb-2">
                  {currentQuestion.title}
                </h4>
                <p className="text-xs text-[#94A3B8] mb-6">
                  {currentQuestion.description}
                </p>
                
                {currentQuestion.type === "textarea" ? (
                  <Textarea
                    value={quizAnswers[currentQuestion.field]}
                    onChange={(e) =>
                      setQuizAnswers({
                        ...quizAnswers,
                        [currentQuestion.field]: e.target.value,
                      })
                    }
                    placeholder={currentQuestion.placeholder}
                    className="min-h-[120px] resize-none bg-[#000] border-[#1E293B] text-white placeholder:text-[#475569] focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20"
                  />
                ) : (
                  <RadioGroup
                    value={quizAnswers[currentQuestion.field]}
                    onValueChange={(value) =>
                      setQuizAnswers({
                        ...quizAnswers,
                        [currentQuestion.field]: value,
                      })
                    }
                    className="space-y-2"
                  >
                    {currentQuestion.options?.map((option) => (
                      <div 
                        key={option.value} 
                        className={`flex items-center space-x-3 p-4 rounded-sm border transition-all cursor-pointer ${
                          quizAnswers[currentQuestion.field] === option.value
                            ? 'border-[#0EA5E9] bg-[#0EA5E9]/5'
                            : 'border-[#1E293B] bg-[#0A0F16] hover:border-[#0EA5E9]/50'
                        }`}
                      >
                        <RadioGroupItem 
                          value={option.value} 
                          id={option.value} 
                          className="border-[#1E293B] text-[#0EA5E9]"
                        />
                        <Label 
                          htmlFor={option.value} 
                          className="flex-1 cursor-pointer text-sm text-gray-300"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </div>

              {/* Navigation */}
              <div className="flex gap-4 pt-4">
                <BlueprintButton variant="outline" onClick={handleQuizBack} className="flex-1">
                  <ArrowLeft className="w-4 h-4" />
                  {quizStep === 0 ? "Cancel" : "Back"}
                </BlueprintButton>
                <BlueprintButton
                  variant="primary"
                  onClick={handleQuizNext}
                  disabled={!isQuizStepValid || loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : quizStep === QUIZ_QUESTIONS.length - 1 ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Ideas
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </BlueprintButton>
              </div>
            </motion.div>
          ) : ideas.length === 0 ? (
            <motion.div
              key="interests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <BlueprintHeader 
                step="Step 01 / Interest Selection"
                title={
                  persona === 'enterprise' 
                    ? "Select Focus Areas" 
                    : persona === 'agency' 
                      ? "Select Your Expertise" 
                      : "Select Your Interests"
                }
                subtitle={
                  persona === 'enterprise'
                    ? "Our orchestration engine will analyze your focus areas and synthesize enterprise solutions."
                    : persona === 'agency'
                      ? "Select your expertise areas, and we'll suggest agency products tailored to your services."
                      : "Select areas that excite you, and our AI will synthesize personalized product opportunities."
                }
              />

              {/* Interest Tags Grid */}
              <div className="flex flex-wrap gap-2 justify-center">
                {INTEREST_OPTIONS_BY_PERSONA[persona].map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <motion.button
                      key={interest}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 text-xs font-medium uppercase tracking-wider rounded-sm border transition-all ${
                        isSelected 
                          ? 'border-[#0EA5E9] bg-[#0EA5E9]/10 text-[#0EA5E9]' 
                          : 'border-[#1E293B] bg-[#0A0F16] text-[#94A3B8] hover:border-[#0EA5E9]/50 hover:text-white'
                      }`}
                    >
                      {interest}
                      {isSelected && <Check className="w-3 h-3 ml-2 inline" />}
                    </motion.button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 max-w-xl mx-auto">
                <BlueprintButton variant="outline" onClick={onCancel} className="flex-1">
                  Cancel
                </BlueprintButton>
                <BlueprintButton
                  variant="primary"
                  onClick={() => generateIdeas()}
                  disabled={loading || selectedInterests.length === 0}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Ideas
                    </>
                  )}
                </BlueprintButton>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="ideas"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <BlueprintHeader 
                step="Step 03 / Idea Selection"
                title="AI Generated Business Ideas"
                subtitle="Our orchestration engine has analyzed your profile and synthesized these opportunities. Choose the architectural foundation for your venture."
              />

              {/* Ideas Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ideas.map((idea, index) => {
                  const isSelected = selectedIdea === index;
                  return (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => handleIdeaClick(index)}
                      className={`relative border p-6 flex flex-col gap-4 transition-all cursor-pointer rounded-sm ${
                        isSelected 
                          ? 'border-[#0EA5E9] bg-[#0EA5E9]/5 ring-1 ring-[#0EA5E9]/40' 
                          : 'border-[#1E293B] bg-[#0A0F16]/80 hover:border-[#0EA5E9]/50'
                      }`}
                    >
                      {/* Selected Indicator */}
                      {isSelected && (
                        <div className="absolute top-4 right-4 text-[#0EA5E9]">
                          <Check className="w-5 h-5" />
                        </div>
                      )}

                      <h3 className="text-lg font-bold uppercase tracking-tight pr-8 leading-tight text-white">
                        {idea.title}
                      </h3>
                      
                      <p className="text-xs text-[#94A3B8] leading-relaxed">
                        {idea.description}
                      </p>

                      <div className="space-y-3 pt-2">
                        <div>
                          <span className="text-[10px] font-mono text-[#0EA5E9] uppercase block mb-1">For:</span>
                          <p className="text-[11px] font-medium text-gray-300">{idea.audience}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-[#0EA5E9] uppercase block mb-1">Solves:</span>
                          <p className="text-[11px] font-medium text-gray-300">{idea.problem}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Loading More Placeholder */}
                {loading && (
                  <div className="border border-dashed border-[#1E293B] p-6 flex flex-col items-center justify-center text-center gap-4 bg-transparent">
                    <Brain className="w-6 h-6 text-[#94A3B8] animate-pulse" />
                    <p className="text-xs text-[#94A3B8] font-mono uppercase">Analyzing more options...</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col items-center gap-6 border-t border-[#1E293B] pt-8">
                <div className="flex flex-col md:flex-row gap-4 w-full justify-center max-w-2xl">
                  <BlueprintButton variant="outline" onClick={() => setIdeas([])} className="flex-1">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </BlueprintButton>
                  <BlueprintButton 
                    variant="outline" 
                    onClick={regenerateIdeas}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Regenerate
                  </BlueprintButton>
                  <BlueprintButton
                    variant="primary"
                    onClick={confirmSelection}
                    disabled={selectedIdea === null}
                    className="flex-1"
                  >
                    Use This Idea
                    <ArrowRight className="w-4 h-4" />
                  </BlueprintButton>
                </div>
                
                <button
                  onClick={handleRefineIdeas}
                  className="text-xs text-[#94A3B8] hover:text-[#0EA5E9] transition-colors font-medium border-b border-transparent hover:border-[#0EA5E9] pb-0.5"
                >
                  None of these fit me - Take the quiz again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
