import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Rocket, Target, Users, Lightbulb, ArrowLeft, Building2, Layers, Monitor, Upload, X, Loader2, ArrowRight } from "lucide-react";
import { IdeaSelector } from "@/components/onboarding/IdeaSelector";
import { PersonaSelector, PersonaType } from "@/components/onboarding/PersonaSelector";
import { JourneyInfographic } from "@/components/onboarding/JourneyInfographic";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthPromptModal } from "@/components/auth/AuthPromptModal";
import { cn } from "@/lib/utils";

type IdeaStage = "new" | "existing" | "wireframes";
type Platform = "web" | "mobile" | "desktop";

const STAGE_OPTIONS = [
  { value: "new", label: "New Idea", description: "Starting from scratch" },
  { value: "existing", label: "Existing Project", description: "Already have some work done" },
  { value: "wireframes", label: "Have Wireframes/Designs", description: "Have visual mockups ready" },
];

const PLATFORM_OPTIONS = [
  { value: "web", label: "Web", icon: "🌐" },
  { value: "mobile", label: "Mobile", icon: "📱" },
  { value: "desktop", label: "Desktop", icon: "🖥️" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPersona, setSelectedPersona] = useState<PersonaType | null>(null);
  const [showIdeaSelector, setShowIdeaSelector] = useState(false);
  const [showJourneyInfographic, setShowJourneyInfographic] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [pendingProjectData, setPendingProjectData] = useState<any>(null);
  const [formData, setFormData] = useState({
    business: "",
    idea: "",
    audience: "",
    problem: "",
    stage: "" as IdeaStage | "",
    platforms: [] as Platform[],
    wireframeFiles: [] as File[],
  });

  const personaConfig = {
    enterprise: {
      businessLabel: "What is your business?",
      businessPlaceholder: "e.g., We are a Fortune 500 financial services company with 10,000+ employees...",
      ideaLabel: "What's your product vision?",
      ideaPlaceholder: "e.g., An enterprise-grade AI platform for automated compliance monitoring...",
      audienceLabel: "Who are your target users?",
      audiencePlaceholder: "e.g., Compliance officers, risk managers, and CTOs at enterprise organizations...",
      problemLabel: "What business challenge does it address?",
      problemPlaceholder: "e.g., Manual compliance processes are error-prone and time-consuming..."
    },
    agency: {
      businessLabel: "",
      businessPlaceholder: "",
      ideaLabel: "What's your product concept?",
      ideaPlaceholder: "e.g., A white-label client portal that agencies can customize with their branding...",
      audienceLabel: "Who will use this?",
      audiencePlaceholder: "e.g., Creative agencies, consulting firms, and freelancers...",
      problemLabel: "What pain point does it solve?",
      problemPlaceholder: "e.g., Scattered communication across email, Slack, and other tools..."
    },
    solo: {
      businessLabel: "",
      businessPlaceholder: "",
      ideaLabel: "What's your product idea?",
      ideaPlaceholder: "e.g., A mobile app that helps freelancers track time and generate invoices...",
      audienceLabel: "Who is it for?",
      audiencePlaceholder: "e.g., Solo freelancers and small creative agencies...",
      problemLabel: "What problem does it solve?",
      problemPlaceholder: "e.g., They waste time on manual invoicing and forget to track billable hours..."
    }
  };

  const config = selectedPersona ? personaConfig[selectedPersona] : personaConfig.solo;

  const handlePersonaSelect = (persona: PersonaType) => {
    setSelectedPersona(persona);
    localStorage.setItem("userPersona", persona);
  };

  const saveProjectToDatabase = async (userId: string) => {
    const projectDataToSave = pendingProjectData || {
      ...formData,
      persona: selectedPersona,
      wireframeFiles: formData.wireframeFiles.map(f => f.name),
    };

    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        user_id: userId,
        name: projectDataToSave.idea?.substring(0, 50) || "Untitled Project",
        product_idea: projectDataToSave.idea,
        persona: projectDataToSave.persona || selectedPersona,
        target_audience: projectDataToSave.audience,
        key_problem: projectDataToSave.problem,
        canvas_data: {},
        progress: {},
      })
      .select()
      .single();

    if (error) throw error;

    localStorage.setItem("currentProjectId", project.id);
    return project;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const projectDataForStorage = {
      ...formData,
      persona: selectedPersona,
      wireframeFiles: formData.wireframeFiles.map(f => f.name),
    };

    localStorage.setItem("productIdea", JSON.stringify(projectDataForStorage));

    if (!user) {
      setPendingProjectData(projectDataForStorage);
      setShowAuthPrompt(true);
      return;
    }

    setIsCreating(true);
    
    try {
      await saveProjectToDatabase(user.id);
      setShowJourneyInfographic(true);
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleAuthSuccess = async () => {
    setShowAuthPrompt(false);
    
    setTimeout(async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser && pendingProjectData) {
        setIsCreating(true);
        try {
          await saveProjectToDatabase(currentUser.id);
          toast({
            title: "Project saved!",
            description: "Your project has been saved to your account.",
          });
        } catch (error) {
          console.error("Error saving project:", error);
        } finally {
          setIsCreating(false);
        }
      }
      
      setShowJourneyInfographic(true);
    }, 500);
  };

  const handleSkipAuth = () => {
    setShowAuthPrompt(false);
    localStorage.removeItem("currentProjectId");
    setShowJourneyInfographic(true);
  };

  const handleJourneyContinue = () => {
    navigate("/canvas");
  };

  const handleJourneySkip = () => {
    navigate("/canvas");
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

  const handlePlatformToggle = (platform: Platform) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      wireframeFiles: [...prev.wireframeFiles, ...files]
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      wireframeFiles: prev.wireframeFiles.filter((_, i) => i !== index)
    }));
  };

  const isFormValid = formData.idea && formData.audience && formData.problem && 
    formData.stage && formData.platforms.length > 0 &&
    (selectedPersona !== 'enterprise' || formData.business);

  if (showJourneyInfographic) {
    return (
      <JourneyInfographic
        onContinue={handleJourneyContinue}
        onSkip={handleJourneySkip}
        platforms={formData.platforms}
        productIdea={formData.idea}
      />
    );
  }

  // Show full-screen persona selector if no persona selected
  if (!selectedPersona) {
    return (
      <>
        <AuthPromptModal
          open={showAuthPrompt}
          onOpenChange={setShowAuthPrompt}
          onSuccess={handleAuthSuccess}
          title="Save Your Project Vision"
          description="Create an account to save your project and continue later. Don't lose your work!"
        />
        <PersonaSelector onPersonaSelect={handlePersonaSelect} />
      </>
    );
  }

  // Show idea selector
  if (showIdeaSelector) {
    return (
      <div className="min-h-screen bg-[#0B1017] text-gray-100 flex flex-col relative">
        {/* Grid background */}
        <div 
          className="fixed inset-0 pointer-events-none z-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(to right, #1f2937 1px, transparent 1px), linear-gradient(to bottom, #1f2937 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
        <div className="relative z-10 flex-grow flex items-center justify-center p-6">
          <div className="w-full max-w-4xl">
            <IdeaSelector
              onIdeaSelect={handleIdeaSelect}
              onCancel={() => setShowIdeaSelector(false)}
              persona={selectedPersona}
            />
          </div>
        </div>
      </div>
    );
  }

  // Main form with blueprint styling
  return (
    <>
      <AuthPromptModal
        open={showAuthPrompt}
        onOpenChange={setShowAuthPrompt}
        onSuccess={handleAuthSuccess}
        title="Save Your Project Vision"
        description="Create an account to save your project and continue later. Don't lose your work!"
      />
      
      <div className="min-h-screen bg-[#0B1017] text-gray-100 flex flex-col relative">
        {/* Grid background */}
        <div 
          className="fixed inset-0 pointer-events-none z-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(to right, #1f2937 1px, transparent 1px), linear-gradient(to bottom, #1f2937 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        {/* Header */}
        <header className="relative z-10 border-b border-[#1E293B] bg-[#121821]/50 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <a className="flex items-center gap-2 group" href="/">
                <span className="text-[#0EA5E9] text-2xl">◈</span>
                <span className="font-bold tracking-widest uppercase text-xs font-mono">Logomir OS</span>
              </a>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-widest">Step 02 / 04</span>
              <div className="flex gap-1">
                <div className="w-8 h-1 bg-[#0EA5E9] rounded-full" />
                <div className="w-8 h-1 bg-[#0EA5E9] rounded-full" />
                <div className="w-8 h-1 bg-[#1E293B] rounded-full" />
                <div className="w-8 h-1 bg-[#1E293B] rounded-full" />
              </div>
              <AuthButton />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="relative z-10 flex-grow flex flex-col items-center justify-center p-6 lg:p-8">
          <div className="max-w-3xl w-full">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter mb-4">
                Define Your Vision
              </h1>
              <p className="text-[#94A3B8] text-sm max-w-2xl mx-auto font-mono uppercase tracking-wide">
                Provide the core details of your product architecture
              </p>
            </div>

            {/* Form card */}
            <div className="relative bg-[#121821] border border-[#1E293B] p-6 md:p-8">
              {/* Corner accents */}
              <div className="absolute -top-px -left-px w-2 h-2 border-t-2 border-l-2 border-[#0EA5E9] opacity-70" />
              <div className="absolute -bottom-px -right-px w-2 h-2 border-b-2 border-r-2 border-[#0EA5E9] opacity-70" />

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Back button */}
                <button
                  type="button"
                  onClick={() => setSelectedPersona(null)}
                  className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#94A3B8] hover:text-[#0EA5E9] transition-colors mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Change Path
                </button>
                
                {/* Enterprise business field */}
                {selectedPersona === 'enterprise' && (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#0EA5E9]">
                      <Building2 className="w-4 h-4" />
                      {config.businessLabel}
                    </label>
                    <Textarea
                      placeholder={config.businessPlaceholder}
                      value={formData.business}
                      onChange={(e) => setFormData({ ...formData, business: e.target.value })}
                      className="min-h-[80px] resize-none bg-[#0B1017] border-[#1E293B] focus:border-[#0EA5E9]/50 text-gray-100 placeholder:text-[#94A3B8]/50 font-mono text-sm"
                    />
                  </div>
                )}

                {/* Idea field */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#0EA5E9]">
                    <Rocket className="w-4 h-4" />
                    {config.ideaLabel}
                  </label>
                  <Textarea
                    placeholder={config.ideaPlaceholder}
                    value={formData.idea}
                    onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
                    className="min-h-[100px] resize-none bg-[#0B1017] border-[#1E293B] focus:border-[#0EA5E9]/50 text-gray-100 placeholder:text-[#94A3B8]/50 font-mono text-sm"
                  />
                </div>

                {/* Stage of Idea */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#0EA5E9]">
                    <Layers className="w-4 h-4" />
                    Stage of your idea
                  </label>
                  <RadioGroup
                    value={formData.stage}
                    onValueChange={(value) => setFormData({ ...formData, stage: value as IdeaStage })}
                    className="grid grid-cols-1 md:grid-cols-3 gap-3"
                  >
                    {STAGE_OPTIONS.map((option) => (
                      <div key={option.value} className="relative">
                        <RadioGroupItem
                          value={option.value}
                          id={option.value}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={option.value}
                          className={cn(
                            "flex flex-col items-center justify-center p-4 border bg-[#0B1017] cursor-pointer transition-all",
                            "border-[#1E293B] hover:border-[#0EA5E9]/30",
                            "peer-data-[state=checked]:border-[#0EA5E9] peer-data-[state=checked]:bg-[#0EA5E9]/5"
                          )}
                        >
                          <span className="font-mono text-sm uppercase text-white">{option.label}</span>
                          <span className="text-[10px] text-[#94A3B8] mt-1 font-mono">{option.description}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  {/* File Upload for Wireframes */}
                  {formData.stage === 'wireframes' && (
                    <div className="mt-4 p-4 border-2 border-dashed border-[#0EA5E9]/30 bg-[#0EA5E9]/5">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        multiple
                        accept="image/*,.pdf,.fig,.sketch"
                        className="hidden"
                      />
                      <div className="flex flex-col items-center gap-3">
                        <Upload className="w-8 h-8 text-[#0EA5E9]/60" />
                        <p className="text-xs text-[#94A3B8] text-center font-mono uppercase">
                          Upload wireframes or designs
                        </p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 text-xs font-mono uppercase tracking-wider border border-[#0EA5E9]/30 text-[#0EA5E9] hover:bg-[#0EA5E9]/10 transition-all"
                        >
                          Choose Files
                        </button>
                      </div>
                      
                      {formData.wireframeFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {formData.wireframeFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-[#0B1017] border border-[#1E293B]">
                              <span className="text-xs truncate max-w-[200px] font-mono text-[#94A3B8]">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="text-[#94A3B8] hover:text-red-500 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Target Platforms */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#0EA5E9]">
                    <Monitor className="w-4 h-4" />
                    Target platforms
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {PLATFORM_OPTIONS.map((platform) => (
                      <label 
                        key={platform.value} 
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 border cursor-pointer transition-all",
                          formData.platforms.includes(platform.value as Platform)
                            ? "border-[#0EA5E9] bg-[#0EA5E9]/10 text-[#0EA5E9]"
                            : "border-[#1E293B] text-[#94A3B8] hover:border-[#0EA5E9]/30"
                        )}
                        onClick={() => handlePlatformToggle(platform.value as Platform)}
                      >
                        <span>{platform.icon}</span>
                        <span className="text-xs font-mono uppercase">{platform.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Audience field */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#0EA5E9]">
                    <Users className="w-4 h-4" />
                    {config.audienceLabel}
                  </label>
                  <Textarea
                    placeholder={config.audiencePlaceholder}
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                    className="min-h-[80px] resize-none bg-[#0B1017] border-[#1E293B] focus:border-[#0EA5E9]/50 text-gray-100 placeholder:text-[#94A3B8]/50 font-mono text-sm"
                  />
                </div>

                {/* Problem field */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#0EA5E9]">
                    <Target className="w-4 h-4" />
                    {config.problemLabel}
                  </label>
                  <Textarea
                    placeholder={config.problemPlaceholder}
                    value={formData.problem}
                    onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                    className="min-h-[80px] resize-none bg-[#0B1017] border-[#1E293B] focus:border-[#0EA5E9]/50 text-gray-100 placeholder:text-[#94A3B8]/50 font-mono text-sm"
                  />
                </div>

                {/* Helper buttons */}
                <div className="flex items-center gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowIdeaSelector(true)}
                    className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#94A3B8] hover:text-[#0EA5E9] transition-colors"
                  >
                    <Lightbulb className="w-4 h-4" />
                    {selectedPersona === 'solo' ? "Help me with idea" : "Help with product vision"}
                  </button>
                </div>

                {/* Submit button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={!isFormValid || isCreating}
                    className={cn(
                      "w-full py-4 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all",
                      isFormValid && !isCreating
                        ? "bg-[#0EA5E9] text-white hover:brightness-110 active:scale-[0.98] shadow-[0_0_30px_-5px_rgba(14,165,233,0.4)]"
                        : "bg-[#1E293B] text-[#94A3B8] cursor-not-allowed"
                    )}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating Project...
                      </>
                    ) : (
                      <>
                        Start Building
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-[#1E293B] py-6 bg-[#121821]/50">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-[10px] uppercase text-gray-600 tracking-[0.2em]">Deployment Protocol v2.4.0</div>
            <p className="text-[11px] text-[#94A3B8]">© 2024 Logomir OS. Secure Environment.</p>
            <div className="flex gap-6">
              <a className="text-[#94A3B8] hover:text-[#0EA5E9] transition-colors text-[10px] uppercase font-mono" href="#">Help Center</a>
              <a className="text-[#94A3B8] hover:text-[#0EA5E9] transition-colors text-[10px] uppercase font-mono" href="#">Privacy Policy</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Onboarding;
