import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Eye, Target, Users, Zap, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VisionBuilderProps {
  onVisionComplete: (vision: { title: string; audience: string; problem: string }) => void;
  onCancel: () => void;
}

const VISION_STEPS = [
  {
    id: 'challenge',
    title: 'Business Challenge',
    description: 'What critical business challenge is your organization facing?',
    placeholder: 'e.g., Manual compliance processes across 15+ regulatory frameworks are costing us $2M annually in labor and errors...',
    icon: Target,
  },
  {
    id: 'stakeholders',
    title: 'Key Stakeholders',
    description: 'Who are the primary stakeholders and decision-makers?',
    placeholder: 'e.g., Chief Compliance Officer, Risk Management team, IT Security, C-suite executives who need visibility into compliance status...',
    icon: Users,
  },
  {
    id: 'outcome',
    title: 'Desired Outcome',
    description: 'What does success look like? What metrics matter?',
    placeholder: 'e.g., 80% reduction in manual compliance tasks, real-time risk visibility, automated audit trails, SOC2/GDPR/HIPAA coverage...',
    icon: Zap,
  },
  {
    id: 'constraints',
    title: 'Constraints & Requirements',
    description: 'What are the technical, regulatory, or organizational constraints?',
    placeholder: 'e.g., Must integrate with existing SAP/Salesforce stack, on-premise deployment option required, FedRAMP certification needed...',
    icon: Eye,
  },
];

export const VisionBuilder = ({ onVisionComplete, onCancel }: VisionBuilderProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const currentStepData = VISION_STEPS[currentStep];
  const StepIcon = currentStepData.icon;
  const isLastStep = currentStep === VISION_STEPS.length - 1;
  const canProceed = answers[currentStepData.id]?.trim().length > 10;

  const handleNext = async () => {
    if (isLastStep) {
      await generateVision();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      onCancel();
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  const generateVision = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-product-ideas', {
        body: {
          interests: ['Enterprise Solution'],
          persona: 'enterprise',
          visionContext: {
            challenge: answers.challenge,
            stakeholders: answers.stakeholders,
            outcome: answers.outcome,
            constraints: answers.constraints,
          }
        }
      });

      if (error) throw error;

      if (data?.ideas && data.ideas.length > 0) {
        const idea = data.ideas[0];
        onVisionComplete({
          title: idea.title,
          audience: idea.audience,
          problem: idea.problem,
        });
        toast.success("Product vision generated!");
      } else {
        throw new Error("No vision generated");
      }
    } catch (error) {
      console.error('Error generating vision:', error);
      toast.error("Failed to generate vision. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {currentStep === 0 ? 'Back' : 'Previous'}
        </Button>
        <div className="flex items-center gap-2">
          {VISION_STEPS.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep
                  ? 'bg-primary'
                  : index < currentStep
                    ? 'bg-primary/50'
                    : 'bg-muted'
              }`}
            />
          ))}
        </div>
        <div className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {VISION_STEPS.length}
        </div>
      </div>

      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
          <StepIcon className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{currentStepData.title}</h3>
        <p className="text-sm text-muted-foreground">{currentStepData.description}</p>
      </div>

      <Textarea
        placeholder={currentStepData.placeholder}
        value={answers[currentStepData.id] || ''}
        onChange={(e) => setAnswers(prev => ({ ...prev, [currentStepData.id]: e.target.value }))}
        className="min-h-[150px] resize-none"
      />

      <div className="flex items-center gap-4">
        <Button
          onClick={handleNext}
          disabled={!canProceed || isGenerating}
          className="flex-1 gradient-primary text-white"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Vision...
            </>
          ) : isLastStep ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Generate Product Vision
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {currentStep > 0 && (
        <Card className="p-4 bg-muted/50">
          <p className="text-xs text-muted-foreground mb-2">Your answers so far:</p>
          <div className="space-y-2">
            {VISION_STEPS.slice(0, currentStep).map((step) => (
              <div key={step.id} className="text-sm">
                <span className="font-medium text-foreground">{step.title}:</span>{' '}
                <span className="text-muted-foreground line-clamp-1">{answers[step.id]}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
