import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockId: string;
  blockTitle: string;
  progress: number;
  onValidate: () => void;
}

export const ValidationModal = ({
  isOpen,
  onClose,
  blockId,
  blockTitle,
  progress,
  onValidate,
}: ValidationModalProps) => {
  const isComplete = progress === 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Validate {blockTitle}</DialogTitle>
          <DialogDescription>
            Review your progress before validation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Block Completion</span>
              <span className="font-semibold text-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Status Information */}
          <div className="glass p-4 rounded-lg space-y-3">
            {isComplete ? (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Ready for Validation</p>
                  <p className="text-sm text-muted-foreground">
                    All sections are complete. Your {blockTitle.toLowerCase()} canvas is ready for review.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Incomplete Sections</p>
                  <p className="text-sm text-muted-foreground">
                    Please complete all sections before validation. You can still validate, but some sections need attention.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Validation Process Info */}
          <div className="glass p-4 rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="font-medium text-foreground">Validation Process</p>
                <p className="text-sm text-muted-foreground">
                  After validation, your project will be submitted for review. Once approved, you'll be able to proceed to the next phase of your product journey.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Continue Editing
            </Button>
            <Button
              onClick={() => {
                onValidate();
                onClose();
              }}
              className="flex-1 gradient-accent text-white hover-accent-glow"
            >
              Submit for Validation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
