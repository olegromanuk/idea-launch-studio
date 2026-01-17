import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CheckCircle2, Clock, AlertCircle, Shield, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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
      <DialogContent className="sm:max-w-lg p-0 bg-[#0A0A0A] border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="relative p-6 border-b border-white/10 bg-gradient-to-b from-[#0EA5E9]/5 to-transparent">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#0EA5E9]" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#0EA5E9]" />
          
          {/* Glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[#0EA5E9]/50 to-transparent" />
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.2)]">
              <Shield className="w-6 h-6 text-[#0EA5E9]" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#0EA5E9] uppercase tracking-widest block mb-1">
                Validation Protocol
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Validate {blockTitle}
              </h2>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Progress Section */}
          <div className="bg-[#121821] border border-[#1E293B] p-4 relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#0EA5E9]/50" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#0EA5E9]/50" />
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-[#94A3B8] uppercase tracking-wider">Block Completion</span>
              <span className={cn(
                "text-lg font-bold font-mono",
                isComplete ? "text-[#0EA5E9]" : "text-amber-400"
              )}>
                {Math.round(progress)}%
              </span>
            </div>
            
            {/* Custom progress bar */}
            <div className="h-2 bg-[#1E293B] rounded-full overflow-hidden relative">
              <div 
                className={cn(
                  "h-full transition-all duration-500 relative",
                  isComplete 
                    ? "bg-gradient-to-r from-[#0EA5E9] to-[#0EA5E9]/70 shadow-[0_0_15px_rgba(14,165,233,0.5)]" 
                    : "bg-gradient-to-r from-amber-500 to-amber-400"
                )}
                style={{ width: `${progress}%` }}
              >
                {/* Animated shine */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>
            </div>
            
            {/* Progress markers */}
            <div className="flex justify-between mt-2 text-[10px] font-mono text-[#94A3B8]/50">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Status Information */}
          <div className={cn(
            "p-4 border relative transition-all",
            isComplete 
              ? "bg-[#0EA5E9]/5 border-[#0EA5E9]/30" 
              : "bg-amber-500/5 border-amber-500/30"
          )}>
            <div className="flex items-start gap-4">
              <div className={cn(
                "w-10 h-10 rounded flex items-center justify-center flex-shrink-0",
                isComplete ? "bg-[#0EA5E9]/20" : "bg-amber-500/20"
              )}>
                {isComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-[#0EA5E9]" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                )}
              </div>
              <div>
                <h3 className={cn(
                  "font-bold mb-1",
                  isComplete ? "text-[#0EA5E9]" : "text-amber-400"
                )}>
                  {isComplete ? "Ready for Validation" : "Incomplete Sections"}
                </h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  {isComplete 
                    ? `All sections are complete. Your ${blockTitle.toLowerCase()} canvas is ready for review.`
                    : "Please complete all sections before validation. You can still validate, but some sections need attention."
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Validation Process Info */}
          <div className="bg-[#121821] border border-[#1E293B] p-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1 flex items-center gap-2">
                  Validation Process
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  After validation, your project will be submitted for review. Once approved, you'll unlock the next phase of your product journey.
                </p>
              </div>
            </div>
          </div>

          {/* What happens next */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { step: "01", label: "Submit", desc: "Lock in progress" },
              { step: "02", label: "Review", desc: "AI validation" },
              { step: "03", label: "Unlock", desc: "Next phase" },
            ].map((item, i) => (
              <div key={i} className="bg-[#121821] border border-[#1E293B] p-3 text-center relative group hover:border-[#0EA5E9]/30 transition-colors">
                <span className="text-[10px] font-mono text-[#0EA5E9] block mb-1">{item.step}</span>
                <span className="text-xs font-bold text-white block">{item.label}</span>
                <span className="text-[10px] text-[#94A3B8]">{item.desc}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-[#1E293B] bg-[#121821] hover:border-[#0EA5E9]/50 transition-colors text-sm font-medium uppercase tracking-wider text-[#94A3B8] hover:text-white"
            >
              Continue Editing
            </button>
            <button
              onClick={() => {
                onValidate();
                onClose();
              }}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#0EA5E9] to-[#0EA5E9]/80 text-white hover:brightness-110 transition-all text-sm font-bold uppercase tracking-wider shadow-[0_0_25px_rgba(14,165,233,0.4)] flex items-center justify-center gap-2"
            >
              Validate Now
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/5 bg-[#050505] flex items-center justify-between text-[10px] font-mono text-[#94A3B8]/50 uppercase">
          <span>ID: VAL_{blockId.toUpperCase()}</span>
          <span className="flex items-center gap-2">
            <span className={cn(
              "w-1.5 h-1.5 rounded-full",
              isComplete ? "bg-[#0EA5E9] animate-pulse" : "bg-amber-500"
            )} />
            {isComplete ? "READY" : "PENDING"}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
