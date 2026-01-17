import { Building2, Palette, User, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";

export type PersonaType = "enterprise" | "agency" | "solo";

export interface Persona {
  id: PersonaType;
  title: string;
  icon: typeof Building2;
  description: string;
  materialIcon: string;
}

const personas: Persona[] = [
  {
    id: "enterprise",
    title: "Enterprise Client",
    icon: Building2,
    materialIcon: "apartment",
    description: "Designed for large-scale organizations requiring high security, team collaboration tools, and complex AI orchestration across departments.",
  },
  {
    id: "agency",
    title: "Small Agency",
    icon: Palette,
    materialIcon: "hub",
    description: "Optimized for studios and agencies building multiple client products. Features project switching, white-labeling, and client handoff modules.",
  },
  {
    id: "solo",
    title: "Solo Founder",
    icon: User,
    materialIcon: "rocket",
    description: "Maximum automation for individuals. One-click deployments, rapid prototyping engines, and automated marketing funnels for rapid growth.",
  }
];

interface PersonaSelectorProps {
  onPersonaSelect: (persona: PersonaType) => void;
}

export const PersonaSelector = ({ onPersonaSelect }: PersonaSelectorProps) => {
  const [selectedPersona, setSelectedPersona] = useState<PersonaType | null>(null);

  const handleSelect = (personaId: PersonaType) => {
    setSelectedPersona(personaId);
  };

  const handleContinue = () => {
    if (selectedPersona) {
      onPersonaSelect(selectedPersona);
    }
  };

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

      {/* Shared Header */}
      <AppHeader 
        currentStep="Step_01_Persona"
        showStepIndicator
      />

      {/* Main content */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center p-6 lg:p-8">
        <div className="max-w-5xl w-full">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-4">
              Choose Your Path
            </h1>
            <p className="text-[#94A3B8] text-sm md:text-base max-w-2xl mx-auto font-mono uppercase tracking-wide">
              Select the architectural framework that aligns with your operational scale.
            </p>
          </div>

          {/* Persona cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {personas.map((persona) => {
              const Icon = persona.icon;
              const isSelected = selectedPersona === persona.id;
              
              return (
                <label 
                  key={persona.id} 
                  className="cursor-pointer group"
                  onClick={() => handleSelect(persona.id)}
                >
                  <div className={cn(
                    "h-full p-8 bg-[#0F1115] border flex flex-col items-center text-center transition-all duration-300",
                    isSelected 
                      ? "border-[#00E0FF] bg-[#00E0FF]/[0.05] ring-1 ring-[#00E0FF]/50" 
                      : "border-[#1f2937] hover:border-[#00E0FF]/50 hover:bg-[#00E0FF]/[0.02]",
                    "hover:-translate-y-0.5"
                  )}>
                    {/* Icon container */}
                    <div className={cn(
                      "w-16 h-16 mb-6 flex items-center justify-center rounded-sm bg-[#0F1115] border transition-colors",
                      isSelected 
                        ? "border-[#00E0FF]/50" 
                        : "border-[#1f2937] group-hover:border-[#00E0FF]/30"
                    )}>
                      <Icon className="w-8 h-8 text-[#00E0FF]" />
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl font-bold text-[#00E0FF] uppercase tracking-tight mb-3">
                      {persona.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-xs leading-relaxed text-[#94A3B8]">
                      {persona.description}
                    </p>
                    
                    {/* Hover label */}
                    <div className="mt-auto pt-6">
                      <span className={cn(
                        "text-[10px] font-mono text-[#00E0FF] uppercase transition-opacity",
                        isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      )}>
                        {isSelected ? "Selected" : "Select Configuration"}
                      </span>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Continue button */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleContinue}
              disabled={!selectedPersona}
              className={cn(
                "w-full max-w-md py-4 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all rounded",
                selectedPersona
                  ? "bg-[#00E0FF] text-black hover:brightness-110 active:scale-[0.98] shadow-[0_0_30px_-5px_rgba(0,224,255,0.4)]"
                  : "bg-[#1f2937] text-slate-400 cursor-not-allowed"
              )}
            >
              Continue To Architecture
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-[0.2em]">
              Selection determines available OS modules
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#1f2937] py-6 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[10px] uppercase text-slate-600 tracking-[0.2em] font-mono">Deployment Protocol v2.4.0</div>
          <p className="text-[11px] text-slate-400">© 2024 Logomir OS. Secure Environment.</p>
          <div className="flex gap-6">
            <a className="text-slate-400 hover:text-[#00E0FF] transition-colors text-[10px] uppercase font-mono" href="#">Help Center</a>
            <a className="text-slate-400 hover:text-[#00E0FF] transition-colors text-[10px] uppercase font-mono" href="#">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
