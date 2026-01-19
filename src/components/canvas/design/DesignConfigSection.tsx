import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Monitor,
  Smartphone,
  Laptop,
  Palette,
  Type,
  Sparkles,
  Plus,
  Trash2,
  Upload,
  RefreshCw,
  Lightbulb,
  Terminal,
  Loader2,
  Check,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface DesignConfig {
  platforms: {
    web: boolean;
    mobile: boolean;
    desktop: boolean;
  };
  colorPalette: string[];
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  uiDensity: number; // 0-100
  designPhilosophy: string;
  moodboardUrls: string[];
}

interface DesignConfigSectionProps {
  config: DesignConfig;
  onChange: (config: DesignConfig) => void;
  onAIGenerate?: () => void;
  isGenerating?: boolean;
  projectName?: string;
}

const FONT_PAIRINGS = [
  { heading: "Inter", body: "JetBrains Mono", headingType: "Sans-Serif", bodyType: "Monospace" },
  { heading: "Space Grotesk", body: "IBM Plex Mono", headingType: "Sans-Serif", bodyType: "Monospace" },
  { heading: "Poppins", body: "Source Code Pro", headingType: "Sans-Serif", bodyType: "Monospace" },
  { heading: "Outfit", body: "Fira Code", headingType: "Sans-Serif", bodyType: "Monospace" },
  { heading: "Clash Display", body: "DM Mono", headingType: "Display", bodyType: "Monospace" },
  { heading: "Syne", body: "Roboto Mono", headingType: "Display", bodyType: "Monospace" },
];

const DEFAULT_COLORS = ["#0EA5E9", "#10B981", "#6366F1", "#0F172A"];

export const DesignConfigSection = ({
  config,
  onChange,
  onAIGenerate,
  isGenerating = false,
  projectName = "Untitled Project",
}: DesignConfigSectionProps) => {
  const [consoleLines, setConsoleLines] = useState<string[]>([
    "> Initializing style context...",
    "> Awaiting configuration input...",
  ]);
  const [currentFontIndex, setCurrentFontIndex] = useState(0);

  const updatePlatform = (platform: keyof DesignConfig["platforms"], value: boolean) => {
    onChange({
      ...config,
      platforms: { ...config.platforms, [platform]: value },
    });
  };

  const addColor = () => {
    if (config.colorPalette.length < 8) {
      onChange({
        ...config,
        colorPalette: [...config.colorPalette, "#6B7280"],
      });
    }
  };

  const updateColor = (index: number, color: string) => {
    const newPalette = [...config.colorPalette];
    newPalette[index] = color;
    onChange({ ...config, colorPalette: newPalette });
  };

  const removeColor = (index: number) => {
    if (config.colorPalette.length > 1) {
      const newPalette = config.colorPalette.filter((_, i) => i !== index);
      onChange({ ...config, colorPalette: newPalette });
    }
  };

  const shuffleFonts = () => {
    const nextIndex = (currentFontIndex + 1) % FONT_PAIRINGS.length;
    setCurrentFontIndex(nextIndex);
    const pairing = FONT_PAIRINGS[nextIndex];
    onChange({
      ...config,
      typography: {
        headingFont: pairing.heading,
        bodyFont: pairing.body,
      },
    });
  };

  const getDensityLabel = () => {
    if (config.uiDensity < 33) return "COMPACT";
    if (config.uiDensity < 66) return "STANDARD";
    return "AIRY";
  };

  const handleAIGenerate = () => {
    setConsoleLines(prev => [
      ...prev,
      `> Reading user preference: "${config.designPhilosophy.slice(0, 30) || 'Default'}..."`,
      "> Analyzing platform targets...",
    ]);
    
    if (onAIGenerate) {
      onAIGenerate();
    }

    // Simulate console updates
    setTimeout(() => {
      setConsoleLines(prev => [
        ...prev,
        `> Detected contrast requirement: AA Large compliant`,
      ]);
    }, 500);

    setTimeout(() => {
      setConsoleLines(prev => [
        ...prev,
        `> Tokens mapped: ${config.colorPalette.length} colors, 5 font sizes, 3 shadow depths.`,
      ]);
    }, 1000);

    setTimeout(() => {
      setConsoleLines(prev => [
        ...prev,
        "> Estimated token cost: ~450 tkns",
        "> Awaiting final confirmation...",
      ]);
    }, 1500);
  };

  const progress = Math.round(
    ((config.platforms.web || config.platforms.mobile || config.platforms.desktop ? 25 : 0) +
      (config.colorPalette.length > 0 ? 25 : 0) +
      (config.typography.headingFont ? 25 : 0) +
      (config.designPhilosophy.length > 10 ? 25 : 0))
  );

  const currentFont = FONT_PAIRINGS[currentFontIndex];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0A0E14] border border-[#1E293B] p-6 relative overflow-hidden">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#00f0ff]" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#00f0ff]" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#00f0ff]" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#00f0ff]" />

        {/* Background grid effect */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(to right, #1f2937 1px, transparent 1px), linear-gradient(to bottom, #1f2937 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-mono text-[#00f0ff] uppercase">
                Module: 05_Design_Architecture
              </span>
              <Badge className="bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 text-[10px] font-mono">
                {progress}% INITIATED
              </Badge>
            </div>
            <h1 className="text-2xl font-bold uppercase tracking-tight text-white mb-2">
              Design Configuration Console
            </h1>
            <p className="text-slate-400 text-sm max-w-xl font-mono">
              Specify the visual language, platform targets, and experience density. The AI will
              synthesize these inputs into a comprehensive design system.
            </p>
          </div>
          <Button
            variant="outline"
            className="border-[#1E293B] bg-[#0A0E14] hover:border-[#00f0ff]/50 text-xs font-mono uppercase"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Load Preset
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Platform Target */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-[#0A0E14] border border-[#1E293B] h-full">
            <div className="p-4 border-b border-[#1E293B] bg-black/20">
              <h3 className="text-xs font-mono uppercase text-slate-400 flex items-center gap-2">
                <Monitor className="w-4 h-4" /> Platform Target
              </h3>
            </div>
            <div className="p-5 space-y-6">
              {/* Web App */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-slate-400" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Web App</h4>
                    <p className="text-[10px] text-slate-500">React / Tailwind</p>
                  </div>
                </div>
                <Switch
                  checked={config.platforms.web}
                  onCheckedChange={(checked) => updatePlatform("web", checked)}
                  className="data-[state=checked]:bg-[#00f0ff]"
                />
              </div>

              {/* Native Mobile */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-slate-400" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Native Mobile</h4>
                    <p className="text-[10px] text-slate-500">iOS & Android</p>
                  </div>
                </div>
                <Switch
                  checked={config.platforms.mobile}
                  onCheckedChange={(checked) => updatePlatform("mobile", checked)}
                  className="data-[state=checked]:bg-[#00f0ff]"
                />
              </div>

              {/* Desktop App */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Laptop className="w-5 h-5 text-slate-400" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Desktop App</h4>
                    <p className="text-[10px] text-slate-500">Electron / Native</p>
                  </div>
                </div>
                <Switch
                  checked={config.platforms.desktop}
                  onCheckedChange={(checked) => updatePlatform("desktop", checked)}
                  className="data-[state=checked]:bg-[#00f0ff]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Aesthetic Controls */}
        <div className="col-span-12 lg:col-span-5">
          <div className="bg-[#0A0E14] border border-[#1E293B] h-full">
            <div className="p-4 border-b border-[#1E293B] bg-black/20 flex justify-between items-center">
              <h3 className="text-xs font-mono uppercase text-slate-400 flex items-center gap-2">
                <Palette className="w-4 h-4" /> Aesthetic Controls
              </h3>
              <Badge className="text-[10px] text-[#00f0ff] bg-[#00f0ff]/10 border border-[#00f0ff]/20">
                CUSTOM MODE
              </Badge>
            </div>
            <div className="p-6 space-y-8">
              {/* Color Palette */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-slate-400">
                  Core Color Palette
                </label>
                <div className="flex gap-4 flex-wrap">
                  {config.colorPalette.map((color, index) => (
                    <div key={index} className="space-y-1 group relative">
                      <div
                        className="w-12 h-12 rounded border border-white/10 shadow-lg cursor-pointer transition-transform hover:scale-105"
                        style={{
                          backgroundColor: color,
                          boxShadow:
                            index === 0 ? `0 0 10px ${color}50, 0 0 20px ${color}30` : undefined,
                        }}
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "color";
                          input.value = color;
                          input.onchange = (e) =>
                            updateColor(index, (e.target as HTMLInputElement).value);
                          input.click();
                        }}
                      />
                      <Input
                        value={color}
                        onChange={(e) => updateColor(index, e.target.value)}
                        className="w-14 bg-black/20 border-[#1E293B] text-[10px] text-center text-slate-300 font-mono focus:border-[#00f0ff] px-1 h-6"
                      />
                      {config.colorPalette.length > 1 && (
                        <button
                          onClick={() => removeColor(index)}
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  {config.colorPalette.length < 8 && (
                    <button
                      onClick={addColor}
                      className="w-12 h-12 rounded border border-dashed border-slate-600 hover:border-[#00f0ff] hover:text-[#00f0ff] text-slate-600 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Typography Pairing */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase text-slate-400">
                    Typography Pairing
                  </label>
                  <button
                    onClick={shuffleFonts}
                    className="text-[10px] text-[#00f0ff] hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Shuffle Pair
                  </button>
                </div>
                <div className="p-3 bg-black/30 border border-[#1E293B] rounded flex gap-4 items-center">
                  <div className="h-10 w-10 bg-slate-800 rounded flex items-center justify-center text-xl font-serif text-white">
                    Aa
                  </div>
                  <div className="flex-grow">
                    <div className="text-sm font-medium text-slate-200">
                      {config.typography.headingFont}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {currentFont.headingType} (Body)
                    </div>
                  </div>
                  <span className="text-slate-600 text-xs">+</span>
                  <div className="flex-grow text-right">
                    <div className="text-sm font-mono font-medium text-slate-200">
                      {config.typography.bodyFont}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {currentFont.bodyType} (Code/Data)
                    </div>
                  </div>
                </div>
              </div>

              {/* UI Density */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-xs font-bold uppercase text-slate-400">UI Density</label>
                  <span className="text-[10px] font-mono text-[#00f0ff]">{getDensityLabel()}</span>
                </div>
                <div className="space-y-2">
                  <Slider
                    value={[config.uiDensity]}
                    onValueChange={(value) => onChange({ ...config, uiDensity: value[0] })}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono uppercase">
                    <span>Compact</span>
                    <span>Standard</span>
                    <span>Airy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inspiration & Brief */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-[#0A0E14] border border-[#1E293B] h-full flex flex-col">
            <div className="p-4 border-b border-[#1E293B] bg-black/20">
              <h3 className="text-xs font-mono uppercase text-slate-400 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" /> Inspiration & Brief
              </h3>
            </div>
            <div className="p-5 flex-grow flex flex-col gap-5">
              {/* Design Philosophy */}
              <div className="space-y-2 flex-grow">
                <label className="text-xs font-bold uppercase text-slate-400">
                  Design Philosophy
                </label>
                <Textarea
                  value={config.designPhilosophy}
                  onChange={(e) => onChange({ ...config, designPhilosophy: e.target.value })}
                  placeholder="Describe the look and feel (e.g. 'Cyberpunk minimalist with high contrast, glowing accents, and technical data visualization...')"
                  className="w-full bg-black/20 border-[#1E293B] text-xs text-slate-300 focus:border-[#00f0ff] placeholder-slate-600 h-32 resize-none leading-relaxed"
                />
              </div>

              {/* Reference Moodboards */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400">
                  Reference Moodboards
                </label>
                <div className="border border-dashed border-slate-700 bg-black/10 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-[#00f0ff]/50 hover:bg-[#00f0ff]/5 transition-all cursor-pointer group">
                  <Upload className="w-6 h-6 text-slate-600 group-hover:text-[#00f0ff] mb-2" />
                  <span className="text-xs text-slate-400 group-hover:text-slate-300">
                    Drop images or click to upload
                  </span>
                  <span className="text-[10px] text-slate-600 mt-1">PNG, JPG up to 10MB</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Console & Generate Button */}
        <div className="col-span-12 mt-2">
          <div className="bg-black/40 border border-[#1E293B] rounded-sm overflow-hidden flex flex-col md:flex-row">
            {/* Console */}
            <div className="flex-grow p-4 font-mono text-xs relative min-h-[160px]">
              <div className="absolute top-0 left-0 w-full h-6 bg-[#1a1f29] border-b border-[#1E293B] flex items-center px-2 gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
                <span className="ml-2 text-[10px] text-slate-500">ai_design_reasoning.log</span>
              </div>
              <div className="mt-6 space-y-1.5 h-full overflow-y-auto max-h-[120px]">
                {consoleLines.map((line, index) => (
                  <div
                    key={index}
                    className={cn(
                      line.includes("compliant") ? "text-emerald-400" : "",
                      line.includes("Awaiting") ? "text-[#00f0ff]" : "",
                      line.includes("Initializing") || line.includes("Reading")
                        ? "text-slate-400"
                        : "text-slate-500"
                    )}
                  >
                    {line}
                    {index === consoleLines.length - 1 && line.includes("Awaiting") && (
                      <span className="w-1.5 h-3 bg-[#00f0ff] animate-pulse inline-block ml-1" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="border-t md:border-t-0 md:border-l border-[#1E293B] bg-[#0A0E14] p-6 flex flex-col items-center justify-center md:w-80 shrink-0 gap-3">
              <Button
                onClick={handleAIGenerate}
                disabled={isGenerating}
                className={cn(
                  "w-full py-6 font-bold uppercase tracking-wider text-sm transition-all rounded-sm flex items-center justify-center gap-2",
                  "bg-[#00f0ff] hover:bg-[#38bdf8] text-black",
                  "shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)]"
                )}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Generate Design System
                  </>
                )}
              </Button>
              <p className="text-[10px] text-center text-slate-500">
                Estimated token cost: ~450 tkns
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
