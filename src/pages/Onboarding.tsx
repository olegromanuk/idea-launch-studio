import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { Rocket, Target, Users, Lightbulb, ArrowLeft, Building2, Upload, X, Loader2, Globe, Smartphone, Monitor } from "lucide-react";
import { IdeaSelector } from "@/components/onboarding/IdeaSelector";
import { PersonaSelector, PersonaType } from "@/components/onboarding/PersonaSelector";
import { JourneyInfographic } from "@/components/onboarding/JourneyInfographic";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthPromptModal } from "@/components/auth/AuthPromptModal";
import { AppHeader } from "@/components/layout/AppHeader";
import { cn } from "@/lib/utils";

type IdeaStage = "new" | "existing" | "wireframes";
type Platform = "web" | "mobile" | "desktop";

const STAGE_OPTIONS = [
  { value: "new", label: "Just an Idea", description: "Initial concept, no research or documentation started.", icon: Lightbulb },
  { value: "existing", label: "Detailed Specs", description: "Market research done, features mapped out.", icon: Target },
  { value: "wireframes", label: "Prototype/MVP", description: "Early code exists, looking to scale with AI.", icon: Monitor },
];

const PLATFORM_OPTIONS = [
  { value: "web", label: "Web", icon: Globe },
  { value: "mobile", label: "Mobile", icon: Smartphone },
  { value: "desktop", label: "Desktop", icon: Monitor },
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
      <div className="min-h-screen bg-[#050505] text-gray-100 flex flex-col relative">
        {/* Grid background */}
        <div 
          className="fixed inset-0 pointer-events-none z-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(to right, #1f2937 1px, transparent 1px), linear-gradient(to bottom, #1f2937 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
        <AppHeader 
          currentStep="Step_02_Ideas"
          showStepIndicator
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
      
      <div className="min-h-screen bg-[#050505] text-gray-100 flex flex-col relative">
        {/* Grid background */}
        <div 
          className="fixed inset-0 pointer-events-none z-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(to right, #1f2937 1px, transparent 1px), linear-gradient(to bottom, #1f2937 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        {/* Shared Header */}
        <AppHeader 
          currentStep="Step_02_Concept"
          showStepIndicator
        />

        {/* Main content */}
        <main className="relative z-10 flex-grow p-4 sm:p-6 lg:p-12 max-w-4xl mx-auto w-full">
          {/* Title Section */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-mono text-[#0EA5E9] uppercase tracking-widest">Step 02 / Concept Definition</span>
              <span className="bg-[#0EA5E9]/10 text-[#0EA5E9] text-[10px] px-2 py-0.5 border border-[#0EA5E9]/30 rounded font-bold uppercase tracking-tighter">
                {formData.idea && formData.audience && formData.problem && formData.stage && formData.platforms.length > 0 ? "100%" : "In Progress"}
              </span>
            </div>
            <h1 className="text-4xl font-bold uppercase tracking-tight mb-3">Product Concept Form</h1>
            <p className="text-[#94A3B8] text-sm max-w-2xl leading-relaxed">
              Define the architectural foundation of your project. Provide specific details to help our AI orchestrate your development roadmap.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Stage of Idea Section */}
            <section>
              <h2 className="text-xs font-mono uppercase text-[#0EA5E9] mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-[#0EA5E9] rounded-full" />
                Stage of your idea
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {STAGE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isActive = formData.stage === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, stage: option.value as IdeaStage })}
                      className={cn(
                        "group p-5 border bg-[#121821] transition-all text-left flex flex-col gap-3 rounded-sm",
                        isActive 
                          ? "border-[#0EA5E9] bg-[#0EA5E9]/5 ring-1 ring-[#0EA5E9]/20" 
                          : "border-[#1E293B] hover:border-[#0EA5E9]/50"
                      )}
                    >
                      <Icon className={cn(
                        "w-5 h-5 transition-transform group-hover:scale-110",
                        isActive ? "text-[#0EA5E9]" : "text-gray-400 group-hover:text-[#0EA5E9]"
                      )} />
                      <div>
                        <div className={cn(
                          "text-sm font-bold uppercase tracking-tight",
                          isActive ? "text-white" : "text-gray-300"
                        )}>
                          {option.label}
                        </div>
                        <p className="text-[11px] text-[#94A3B8] mt-1 leading-snug">{option.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* File Upload for Wireframes */}
              {formData.stage === 'wireframes' && (
                <div className="mt-4 p-4 border-2 border-dashed border-[#0EA5E9]/30 bg-[#0EA5E9]/5 rounded-sm">
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
                      className="px-4 py-2 text-xs font-mono uppercase tracking-wider border border-[#0EA5E9]/30 text-[#0EA5E9] hover:bg-[#0EA5E9]/10 transition-all rounded-sm"
                    >
                      Choose Files
                    </button>
                  </div>
                  
                  {formData.wireframeFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {formData.wireframeFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-[#0B1017] border border-[#1E293B] rounded-sm">
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
            </section>

            {/* Target Platforms Section */}
            <section>
              <h2 className="text-xs font-mono uppercase text-[#0EA5E9] mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-[#0EA5E9] rounded-full" />
                Target Platforms
              </h2>
              <div className="flex flex-wrap gap-4">
                {PLATFORM_OPTIONS.map((platform) => {
                  const Icon = platform.icon;
                  const isActive = formData.platforms.includes(platform.value as Platform);
                  return (
                    <label key={platform.value} className="cursor-pointer">
                      <input type="checkbox" className="hidden" checked={isActive} onChange={() => handlePlatformToggle(platform.value as Platform)} />
                      <div className={cn(
                        "flex items-center gap-3 px-6 py-3 border transition-all rounded-sm",
                        isActive 
                          ? "border-[#0EA5E9] bg-[#0EA5E9]/10" 
                          : "border-[#1E293B] bg-[#121821] opacity-60 hover:opacity-100"
                      )}>
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">{platform.label}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>

            {/* Enterprise business field */}
            {selectedPersona === 'enterprise' && (
              <section>
                <h2 className="text-xs font-mono uppercase text-[#0EA5E9] mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#0EA5E9] rounded-full" />
                  {config.businessLabel}
                </h2>
                <textarea
                  placeholder={config.businessPlaceholder}
                  value={formData.business}
                  onChange={(e) => setFormData({ ...formData, business: e.target.value })}
                  className="w-full h-32 bg-[#121821] border border-[#1E293B] focus:border-[#0EA5E9] focus:ring-0 focus:outline-none text-sm text-gray-200 p-4 rounded-sm placeholder:text-gray-600 resize-none"
                />
              </section>
            )}

            {/* Two Column Section: Audience & Problem */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section>
                <h2 className="text-xs font-mono uppercase text-[#0EA5E9] mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#0EA5E9] rounded-full" />
                  {config.audienceLabel}
                </h2>
                <textarea
                  placeholder={config.audiencePlaceholder}
                  value={formData.audience}
                  onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                  className="w-full h-32 bg-[#121821] border border-[#1E293B] focus:border-[#0EA5E9] focus:ring-0 focus:outline-none text-sm text-gray-200 p-4 rounded-sm placeholder:text-gray-600 resize-none"
                />
              </section>
              <section>
                <h2 className="text-xs font-mono uppercase text-[#0EA5E9] mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#0EA5E9] rounded-full" />
                  {config.problemLabel}
                </h2>
                <textarea
                  placeholder={config.problemPlaceholder}
                  value={formData.problem}
                  onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                  className="w-full h-32 bg-[#121821] border border-[#1E293B] focus:border-[#0EA5E9] focus:ring-0 focus:outline-none text-sm text-gray-200 p-4 rounded-sm placeholder:text-gray-600 resize-none"
                />
              </section>
            </div>

            {/* Product Idea Section */}
            <section>
              <h2 className="text-xs font-mono uppercase text-[#0EA5E9] mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-[#0EA5E9] rounded-full" />
                {config.ideaLabel}
              </h2>
              <textarea
                placeholder={config.ideaPlaceholder}
                value={formData.idea}
                onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
                className="w-full h-32 bg-[#121821] border border-[#1E293B] focus:border-[#0EA5E9] focus:ring-0 focus:outline-none text-sm text-gray-200 p-4 rounded-sm placeholder:text-gray-600 resize-none"
              />
            </section>

            {/* Footer Actions */}
            <div className="pt-8 border-t border-[#1E293B] flex flex-col md:flex-row items-center justify-between gap-6">
              {/* AI Help Button */}
              <button
                type="button"
                onClick={() => setShowIdeaSelector(true)}
                className="flex items-center gap-3 px-5 py-3 border border-[#0EA5E9]/30 bg-[#0EA5E9]/5 hover:bg-[#0EA5E9]/10 transition-all rounded-sm group"
              >
                <Lightbulb className="w-5 h-5 text-[#0EA5E9] group-hover:scale-110 transition-transform" />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold uppercase tracking-tight text-gray-200">Help with product vision</span>
                  <span className="text-[10px] text-[#94A3B8] uppercase">AI will suggest ideas & features</span>
                </div>
              </button>

              {/* Action Buttons */}
              <div className="flex gap-4 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setSelectedPersona(null)}
                  className="flex-1 md:flex-none px-8 py-3 border border-[#1E293B] bg-[#121821] hover:border-[#0EA5E9]/50 transition-colors text-xs font-bold uppercase tracking-widest rounded-sm"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid || isCreating}
                  className={cn(
                    "flex-1 md:flex-none px-10 py-3 text-xs font-bold uppercase tracking-widest rounded-sm flex items-center justify-center gap-2 transition-all",
                    isFormValid && !isCreating
                      ? "bg-[#0EA5E9] text-white hover:brightness-110 shadow-[0_0_20px_rgba(14,165,233,0.3)]"
                      : "bg-[#1E293B] text-[#94A3B8] cursor-not-allowed"
                  )}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Start Building
                      <Rocket className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-[#1E293B] py-8 mt-auto bg-[#121821]">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <div className="text-[10px] uppercase text-gray-600 tracking-[0.2em] font-mono">Module_02: Product_Concept_Form</div>
            <p className="text-[11px] text-[#94A3B8]">© 2024 Logomir OS. Architectural Platform for Solo Founders.</p>
            <div className="flex gap-6">
              <a className="text-[#94A3B8] hover:text-[#0EA5E9] transition-colors text-[10px] uppercase font-mono" href="#">Help_Center</a>
              <a className="text-[#94A3B8] hover:text-[#0EA5E9] transition-colors text-[10px] uppercase font-mono" href="#">Privacy_Policy</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Onboarding;
