import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Code, Megaphone, Trophy, Sparkles, CheckCircle2 } from "lucide-react";

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockId: string;
  blockTitle: string;
}

const blockIcons = {
  business: Briefcase,
  development: Code,
  gtm: Megaphone,
};

const blockColors = {
  business: "hsl(195 100% 45%)",
  development: "hsl(15 90% 60%)",
  gtm: "hsl(142 76% 36%)",
};

export const CelebrationModal = ({ isOpen, onClose, blockId, blockTitle }: CelebrationModalProps) => {
  const [confettiPieces, setConfettiPieces] = useState<number[]>([]);
  const Icon = blockIcons[blockId as keyof typeof blockIcons] || Trophy;
  const blockColor = blockColors[blockId as keyof typeof blockColors] || "hsl(195 100% 45%)";

  useEffect(() => {
    if (isOpen) {
      // Generate confetti pieces
      setConfettiPieces(Array.from({ length: 50 }, (_, i) => i));
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md overflow-hidden border-2" style={{ borderColor: blockColor }}>
        <div className="relative py-8">
          {/* Confetti Animation */}
          {confettiPieces.map((i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-fade-out"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                backgroundColor: `hsl(${Math.random() * 360} 70% 60%)`,
                animation: `confetti-fall ${2 + Math.random() * 2}s ease-out forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}

          {/* Main Content */}
          <div className="relative z-10 flex flex-col items-center gap-6 animate-scale-in">
            {/* Icon Badge */}
            <div 
              className="relative p-6 rounded-full animate-pulse"
              style={{ 
                backgroundColor: `${blockColor}20`,
                boxShadow: `0 0 40px ${blockColor}40`,
              }}
            >
              <div 
                className="p-4 rounded-full"
                style={{ backgroundColor: blockColor }}
              >
                <Icon className="w-12 h-12 text-white" />
              </div>
              <Sparkles 
                className="absolute -top-2 -right-2 w-8 h-8 text-accent animate-bounce" 
                style={{ animationDelay: "0.2s" }}
              />
            </div>

            {/* Title */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Trophy className="w-6 h-6 text-accent" />
                <h2 className="text-2xl font-bold text-foreground">
                  Milestone Unlocked!
                </h2>
                <Trophy className="w-6 h-6 text-accent" />
              </div>
              <p className="text-lg text-muted-foreground">
                You've completed the{" "}
                <span className="font-semibold" style={{ color: blockColor }}>
                  {blockTitle}
                </span>{" "}
                canvas!
              </p>
            </div>

            {/* Achievement Badge */}
            <Badge 
              className="px-6 py-2 text-sm font-semibold"
              style={{ 
                backgroundColor: blockColor,
                color: "white",
              }}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              100% Complete
            </Badge>

            {/* Message */}
            <p className="text-center text-sm text-muted-foreground max-w-sm">
              Great progress! Your product strategy is taking shape. Keep going to complete all three strategic pillars.
            </p>

            {/* Action Button */}
            <Button
              onClick={onClose}
              className="mt-4 w-full"
              style={{ 
                backgroundColor: blockColor,
                color: "white",
              }}
            >
              Continue Building
            </Button>
          </div>
        </div>
      </DialogContent>

      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(500px) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </Dialog>
  );
};
