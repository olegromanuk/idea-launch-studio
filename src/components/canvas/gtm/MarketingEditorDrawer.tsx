import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Sparkles, LucideIcon, Terminal, Zap, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface MarketingEditorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  gradient: string;
  children: ReactNode;
  onAIGenerate?: () => void;
  isGenerating?: boolean;
  stats?: {
    label: string;
    value: string | number;
    status?: "success" | "warning" | "info";
  }[];
}

export const MarketingEditorDrawer = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  gradient,
  children,
  onAIGenerate,
  isGenerating = false,
  stats = [],
}: MarketingEditorDrawerProps) => {
  const [showTerminal, setShowTerminal] = useState(false);

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[95vh] bg-[#050505] border-t border-cyan-500/30">
        {/* Blueprint Grid Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0, 224, 255, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 224, 255, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-20 h-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 to-transparent" />
          <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-cyan-500 to-transparent" />
        </div>
        <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-full h-[2px] bg-gradient-to-l from-cyan-500 to-transparent" />
          <div className="absolute top-0 right-0 w-[2px] h-full bg-gradient-to-b from-cyan-500 to-transparent" />
        </div>

        <DrawerHeader className="border-b border-cyan-500/20 relative z-10">
          <div className="max-w-7xl mx-auto w-full px-4 py-2">
            {/* Top Status Bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">AI_READY</span>
                </div>
                <div className="w-px h-4 bg-cyan-500/30" />
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  PROJECT: ACTIVE /// MARKETING_ENGINE
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTerminal(!showTerminal)}
                  className="h-7 px-2 text-[10px] font-mono text-cyan-500 hover:text-cyan-400 hover:bg-cyan-500/10"
                >
                  <Terminal className="w-3 h-3 mr-1" />
                  CONSOLE
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-7 w-7 text-muted-foreground hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Main Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center relative",
                    "bg-gradient-to-br shadow-lg",
                    gradient
                  )}
                >
                  <Icon className="w-7 h-7 text-white" />
                  <div className="absolute inset-0 rounded-xl ring-1 ring-white/20" />
                  {/* Glow effect */}
                  <div className={cn(
                    "absolute -inset-1 rounded-xl opacity-30 blur-md -z-10",
                    "bg-gradient-to-br",
                    gradient
                  )} />
                </motion.div>
                <div>
                  <DrawerTitle className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    {title}
                    <span className="text-[10px] font-mono text-cyan-500/60 uppercase">v2.0</span>
                  </DrawerTitle>
                  <DrawerDescription className="text-sm text-muted-foreground font-mono">
                    {subtitle}
                  </DrawerDescription>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Stats Pills */}
                {stats.length > 0 && (
                  <div className="hidden md:flex items-center gap-2">
                    {stats.map((stat, index) => (
                      <div
                        key={index}
                        className={cn(
                          "px-3 py-1.5 rounded-lg border backdrop-blur-sm",
                          "bg-black/40",
                          stat.status === "success" && "border-emerald-500/30",
                          stat.status === "warning" && "border-amber-500/30",
                          stat.status === "info" && "border-cyan-500/30",
                          !stat.status && "border-white/10"
                        )}
                      >
                        <div className="text-[10px] font-mono text-muted-foreground uppercase">{stat.label}</div>
                        <div className={cn(
                          "text-sm font-bold",
                          stat.status === "success" && "text-emerald-400",
                          stat.status === "warning" && "text-amber-400",
                          stat.status === "info" && "text-cyan-400",
                          !stat.status && "text-white"
                        )}>
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {onAIGenerate && (
                  <Button
                    onClick={onAIGenerate}
                    disabled={isGenerating}
                    className={cn(
                      "gap-2 relative overflow-hidden",
                      "bg-gradient-to-r from-cyan-600 to-blue-600",
                      "hover:from-cyan-500 hover:to-blue-500",
                      "border border-cyan-400/30",
                      "shadow-lg shadow-cyan-500/20"
                    )}
                  >
                    <Sparkles className={cn("w-4 h-4", isGenerating && "animate-spin")} />
                    <span className="font-mono text-sm">
                      {isGenerating ? "GENERATING..." : "AI GENERATE"}
                    </span>
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DrawerHeader>

        {/* Terminal Console (Collapsible) */}
        <AnimatePresence>
          {showTerminal && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-cyan-500/20 overflow-hidden"
            >
              <div className="max-w-7xl mx-auto w-full px-4 py-3">
                <div className="bg-black/60 rounded-lg p-3 font-mono text-xs border border-cyan-500/20">
                  <div className="flex items-center gap-2 text-cyan-500 mb-2">
                    <Terminal className="w-3 h-3" />
                    <span>MARKETING_ENGINE.console</span>
                  </div>
                  <div className="space-y-1 text-muted-foreground">
                    <div><span className="text-emerald-400">✓</span> Module loaded successfully</div>
                    <div><span className="text-cyan-400">→</span> AI engine ready for content generation</div>
                    <div><span className="text-amber-400">!</span> Remember to save your changes</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <ScrollArea className="flex-1 h-full relative">
          <div className="max-w-7xl mx-auto w-full px-4 py-6">
            {/* Glass Container for Content */}
            <div className="relative">
              <div className={cn(
                "rounded-2xl border border-white/10 backdrop-blur-sm",
                "bg-gradient-to-br from-white/[0.03] to-transparent",
                "p-6"
              )}>
                {children}
              </div>
              
              {/* Bottom corner accents */}
              <div className="absolute bottom-0 left-0 w-16 h-16 pointer-events-none">
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-cyan-500/50 to-transparent" />
                <div className="absolute bottom-0 left-0 w-[1px] h-full bg-gradient-to-t from-cyan-500/50 to-transparent" />
              </div>
              <div className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none">
                <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-l from-cyan-500/50 to-transparent" />
                <div className="absolute bottom-0 right-0 w-[1px] h-full bg-gradient-to-t from-cyan-500/50 to-transparent" />
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer Status Bar */}
        <div className="border-t border-cyan-500/20 px-4 py-2 relative z-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>AUTOSAVE: ON</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-cyan-500" />
                <span>LAST_SYNC: NOW</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="h-8 font-mono text-xs border-white/10 hover:bg-white/5"
              >
                CLOSE
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
