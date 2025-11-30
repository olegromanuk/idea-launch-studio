import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Sparkles, Rocket, Target, Users, Lightbulb, ArrowLeft, Building2, LogIn } from "lucide-react";
import { IdeaSelector } from "@/components/onboarding/IdeaSelector";
import { PersonaSelector, PersonaType } from "@/components/onboarding/PersonaSelector";
import { useAuth } from "@/hooks/useAuth";
import { useProject } from "@/hooks/useProject";

const Onboarding = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { user } = useAuth();
  const { project, saveProjectNow } = useProject(projectId);
  
  const [selectedPersona, setSelectedPersona] = useState<PersonaType | null>(null);
  const [showIdeaSelector, setShowIdeaSelector] = useState(false);
  const [formData, setFormData] = useState({
    business: "",
    idea: "",
    audience: "",
    problem: "",
  });

  // Load project data if editing existing project
  useEffect(() => {
    if (project) {
      setSelectedPersona((project.persona as PersonaType) || null);
      setFormData({
        business: "",
        idea: project.product_idea || "",
        audience: project.target_audience || "",
        problem: project.key_problem || "",
      });
    }
  }, [project]);

  // Load from localStorage for guest mode
  useEffect(() => {
    if (!projectId && !user) {
      const savedPersona = localStorage.getItem("userPersona") as PersonaType;
      if (savedPersona) {
        setSelectedPersona(savedPersona);
      }
      const savedIdea = localStorage.getItem("productIdea");
      if (savedIdea) {
        const parsed = JSON.parse(savedIdea);
        setFormData({
          business: parsed.business || "",
          idea: parsed.idea || "",
          audience: parsed.audience || "",
          problem: parsed.problem || "",
        });
      }
    }
  }, [projectId, user]);

  const personaConfig = {
    enterprise: {
      businessLabel: "What is your business?",
      businessPlaceholder: "e.g., We are a Fortune 500 financial services company with 10,000+ employees, specializing in wealth management and investment banking...",
      ideaLabel: "What's your product vision?",
      ideaPlaceholder: "e.g., An enterprise-grade AI platform for automated compliance monitoring and risk assessment across multiple regulatory frameworks...",
      audienceLabel: "Who are your target users?",
      audiencePlaceholder: "e.g., Compliance officers, risk managers, and CTOs at enterprise organizations with complex regulatory requirements...",
      problemLabel: "What business challenge does it address?",
      problemPlaceholder: "e.g., Manual compliance processes are error-prone, time-consuming, and don't scale with growing regulatory complexity..."
    },
    agency: {
      businessLabel: "",
      businessPlaceholder: "",
      ideaLabel: "What's your product concept?",
      ideaPlaceholder: "e.g., A white-label client portal that agencies can customize with their branding to deliver projects and collect feedback...",
      audienceLabel: "Who will use this?",
      audiencePlaceholder: "e.g., Creative agencies, consulting firms, and freelancers who need a professional way to collaborate with clients...",
      problemLabel: "What pain point does it solve?",
      problemPlaceholder: "e.g., Scattered communication across email, Slack, and other tools makes client collaboration chaotic and unprofessional..."
    },
    solo: {
      businessLabel: "",
      businessPlaceholder: "",
      ideaLabel: "What's your product idea?",
      ideaPlaceholder: "e.g., A mobile app that helps freelancers track their time and generate invoices automatically...",
      audienceLabel: "Who is it for?",
      audiencePlaceholder: "e.g., Solo freelancers and small creative agencies who struggle with invoicing...",
      problemLabel: "What problem does it solve?",
      problemPlaceholder: "e.g., They waste time on manual invoicing and often forget to track billable hours..."
    }
  };

  const config = selectedPersona ? personaConfig[selectedPersona] : personaConfig.solo;

  const handlePersonaSelect = (persona: PersonaType) => {
    setSelectedPersona(persona);
    if (!projectId) {
      localStorage.setItem("userPersona", persona);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (projectId && user) {
      // Save to database for authenticated users (immediate save, not debounced)
      const success = await saveProjectNow({
        persona: selectedPersona,
        product_idea: formData.idea,
        target_audience: formData.audience,
        key_problem: formData.problem,
      }, projectId);
      
      if (success) {
        navigate(`/canvas/${projectId}`);
      }
    } else {
      // Guest mode - save to localStorage
      localStorage.setItem("productIdea", JSON.stringify({
        ...formData,
        persona: selectedPersona
      }));
      navigate("/canvas");
    }
  };

  const handleIdeaSelect = (idea: any) => {
    setFormData({
      ...formData,
      idea: idea.title,
      audience: idea.audience,
      problem: idea.problem,
    });
    setShowIdeaSelector(false);
  };

  const isFormValid = formData.idea && formData.audience && formData.problem && (selectedPersona !== 'enterprise' || formData.business);

  return (
    <div className="min-h-screen gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-3xl animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4 animate-pulse-glow">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome to Your AI Product Studio
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your idea into a working product with our guided AI-powered canvas
          </p>
        </div>

        <Card className="p-8 glass hover-lift">
          {!selectedPersona ? (
            <PersonaSelector onPersonaSelect={handlePersonaSelect} />
          ) : showIdeaSelector ? (
            <IdeaSelector
              onIdeaSelect={handleIdeaSelect}
              onCancel={() => setShowIdeaSelector(false)}
              persona={selectedPersona}
            />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPersona(null)}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Change persona
              </Button>
              {selectedPersona === 'enterprise' && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Building2 className="w-4 h-4 text-primary" />
                    {config.businessLabel}
                  </label>
                  <Textarea
                    placeholder={config.businessPlaceholder}
                    value={formData.business}
                    onChange={(e) =>
                      setFormData({ ...formData, business: e.target.value })
                    }
                    className="min-h-[80px] resize-none"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Rocket className="w-4 h-4 text-primary" />
                  {config.ideaLabel}
                </label>
                <Textarea
                  placeholder={config.ideaPlaceholder}
                  value={formData.idea}
                  onChange={(e) =>
                    setFormData({ ...formData, idea: e.target.value })
                  }
                  className="min-h-[100px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Users className="w-4 h-4 text-primary" />
                  {config.audienceLabel}
                </label>
                <Textarea
                  placeholder={config.audiencePlaceholder}
                  value={formData.audience}
                  onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                  className="min-h-[80px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Target className="w-4 h-4 text-primary" />
                  {config.problemLabel}
                </label>
                <Textarea
                  placeholder={config.problemPlaceholder}
                  value={formData.problem}
                  onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                  className="min-h-[80px] resize-none"
                />
              </div>

              <div className="flex items-center gap-4 mb-4">
                {selectedPersona === 'solo' ? (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowIdeaSelector(true)}
                      className="text-primary hover:text-primary/80"
                    >
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Help me with idea
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowIdeaSelector(true)}
                      className="border-primary text-primary hover:bg-primary/10"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Take a quiz
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowIdeaSelector(true)}
                    className="border-primary text-primary hover:bg-primary/10"
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Help with product vision
                  </Button>
                )}
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={!isFormValid}
                  className="w-full h-12 gradient-primary text-white font-semibold hover-glow"
                >
                  Start Building
                  <Sparkles className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </form>
          )}
        </Card>

        <div className="mt-8 text-center space-y-2">
          {!user ? (
            <>
              <p className="text-sm text-muted-foreground">
                Want to save your progress?
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('/auth')}
                className="text-primary"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign in to save
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              onClick={() => navigate('/projects')}
              className="text-muted-foreground"
            >
              ← Back to projects
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
