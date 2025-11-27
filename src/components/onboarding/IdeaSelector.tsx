import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Check, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

const INTEREST_OPTIONS = [
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
];

export const IdeaSelector = ({ onIdeaSelect, onCancel, persona = "solo" }: IdeaSelectorProps) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [ideas, setIdeas] = useState<ProductIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<number | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({
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
    if (quizStep < 6) {
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

  return (
    <div className="space-y-6">
      {showQuiz ? (
        <>
          <div className="text-center mb-4">
            <h3 className="text-xl font-semibold mb-2">
              Let's get to know you better
            </h3>
            <p className="text-sm text-muted-foreground">
              Question {quizStep + 1} of {QUIZ_QUESTIONS.length}
            </p>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((quizStep + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-1">
                {currentQuestion.title}
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                {currentQuestion.description}
              </p>
            </div>
            
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
                className="min-h-[120px] resize-none"
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
              >
                {currentQuestion.options?.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleQuizBack}>
              {quizStep === 0 ? "Cancel" : "Back"}
            </Button>
            <Button
              onClick={handleQuizNext}
              disabled={!isQuizStepValid || loading}
              className="flex-1 gradient-primary"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : quizStep === QUIZ_QUESTIONS.length - 1 ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Personalized Ideas
                </>
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </>
      ) : ideas.length === 0 ? (
        <>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">What interests you?</h3>
            <p className="text-sm text-muted-foreground">
              Select areas that excite you, and we'll suggest product ideas
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => (
              <Badge
                key={interest}
                variant={
                  selectedInterests.includes(interest) ? "default" : "outline"
                }
                className="cursor-pointer hover-scale"
                onClick={() => toggleInterest(interest)}
              >
                {interest}
                {selectedInterests.includes(interest) && (
                  <Check className="w-3 h-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => generateIdeas()}
              disabled={loading || selectedInterests.length === 0}
              className="flex-1 gradient-primary"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Ideas...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Ideas
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">
              Here are your personalized ideas
            </h3>
            <p className="text-sm text-muted-foreground">
              Select one to get started
            </p>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {ideas.map((idea, index) => (
              <Card
                key={index}
                className={`p-4 cursor-pointer transition-all hover-lift ${
                  selectedIdea === index
                    ? "border-primary shadow-lg"
                    : "border-border"
                }`}
                onClick={() => handleIdeaClick(index)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedIdea === index
                        ? "border-primary bg-primary"
                        : "border-muted"
                    }`}
                  >
                    {selectedIdea === index && (
                      <Check className="w-3 h-3 text-primary-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{idea.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {idea.description}
                    </p>
                    <div className="space-y-1 text-xs">
                      <p>
                        <span className="font-medium">For:</span> {idea.audience}
                      </p>
                      <p>
                        <span className="font-medium">Solves:</span>{" "}
                        {idea.problem}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <Button
                onClick={confirmSelection}
                disabled={selectedIdea === null}
                className="flex-1 gradient-primary"
              >
                Use This Idea
              </Button>
              <Button 
                variant="outline" 
                onClick={regenerateIdeas}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Regenerate
              </Button>
              <Button variant="outline" onClick={() => setIdeas([])}>
                Back
              </Button>
            </div>
            <Button
              variant="ghost"
              onClick={handleRefineIdeas}
              className="text-muted-foreground hover:text-foreground"
            >
              None of these fit me - Take the quiz again
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
