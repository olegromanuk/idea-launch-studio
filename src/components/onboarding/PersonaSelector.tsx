import { Building2, Palette, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type PersonaType = "enterprise" | "agency" | "solo";

export interface Persona {
  id: PersonaType;
  title: string;
  icon: typeof Building2;
  description: string;
  color: string;
}

const personas: Persona[] = [
  {
    id: "enterprise",
    title: "Enterprise Client",
    icon: Building2,
    description: "Product managers, innovation teams, and CTOs building complex, scalable AI-based systems with focus on governance and compliance.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "agency",
    title: "Small Agency",
    icon: Palette,
    description: "Boutique studios, consultants, and freelancers turning internal expertise into packaged products with streamlined tools.",
    color: "from-purple-500 to-pink-500"
  },
  {
    id: "solo",
    title: "Solo Founder",
    icon: User,
    description: "Indie creators launching their first product with step-by-step AI-supported guidance and simplified workflows.",
    color: "from-orange-500 to-red-500"
  }
];

interface PersonaSelectorProps {
  onPersonaSelect: (persona: PersonaType) => void;
}

export const PersonaSelector = ({ onPersonaSelect }: PersonaSelectorProps) => {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your Path</h2>
        <p className="text-muted-foreground">
          Select the option that best describes your background and goals
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {personas.map((persona) => {
          const Icon = persona.icon;
          return (
            <Card
              key={persona.id}
              className="p-6 cursor-pointer hover-lift glass hover:shadow-glow transition-all group"
              onClick={() => onPersonaSelect(persona.id)}
            >
              <div className="space-y-4">
                <div className={cn(
                  "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4",
                  persona.color
                )}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {persona.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {persona.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
