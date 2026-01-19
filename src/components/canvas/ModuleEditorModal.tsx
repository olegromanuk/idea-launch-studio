import { useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  X, 
  FileText, 
  Palette, 
  GitBranch, 
  Sparkles, 
  Bold, 
  Italic, 
  List,
  AlertTriangle,
  Users,
  Gem,
  DollarSign,
  TrendingUp,
  BarChart3,
  Plus,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

// Section icon options
const ICON_OPTIONS = [
  { id: "warning", icon: AlertTriangle, label: "Warning" },
  { id: "users", icon: Users, label: "Users" },
  { id: "gem", icon: Gem, label: "Gem" },
  { id: "dollar", icon: DollarSign, label: "Dollar" },
  { id: "trending", icon: TrendingUp, label: "Trending" },
  { id: "chart", icon: BarChart3, label: "Chart" },
];

// Section config for display
const SECTION_CONFIG: Record<string, { 
  icon: LucideIcon;
  sectionNumber: string;
  displayKey: string;
}> = {
  problem: { icon: AlertTriangle, sectionNumber: "01", displayKey: "PROBLEM_STATEMENT" },
  targetAudience: { icon: Users, sectionNumber: "02", displayKey: "TARGET_AUDIENCE" },
  uniqueValueProposition: { icon: Gem, sectionNumber: "03", displayKey: "VALUE_PROPOSITION" },
  revenueModel: { icon: DollarSign, sectionNumber: "04", displayKey: "REVENUE_MODEL" },
  marketTrends: { icon: TrendingUp, sectionNumber: "05", displayKey: "MARKET_VALIDATION" },
  successMetrics: { icon: BarChart3, sectionNumber: "06", displayKey: "SUCCESS_KPIS" },
};

interface ModuleStyle {
  bgOpacity: number;
  glowIntensity: number;
  selectedIcon: string;
}

interface ModuleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionKey: string;
  title: string;
  subtitle: string;
  value: string;
  onChange: (value: string) => void;
  onAIGenerate: () => void;
  isGenerating: boolean;
  aiSuggestion?: string;
  onAcceptSuggestion?: () => void;
  onDiscardSuggestion?: () => void;
  moduleStyle?: ModuleStyle;
  onStyleChange?: (style: ModuleStyle) => void;
}

type TabType = "content" | "style" | "logic";

export const ModuleEditorModal = ({
  isOpen,
  onClose,
  sectionKey,
  title,
  subtitle,
  value,
  onChange,
  onAIGenerate,
  isGenerating,
  aiSuggestion,
  onAcceptSuggestion,
  onDiscardSuggestion,
  moduleStyle,
  onStyleChange,
}: ModuleEditorModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("content");
  const [localTitle, setLocalTitle] = useState(title);
  const [localDescription, setLocalDescription] = useState(subtitle);
  const [localStyle, setLocalStyle] = useState<ModuleStyle>(moduleStyle || {
    bgOpacity: 85,
    glowIntensity: 40,
    selectedIcon: "warning",
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (prefix: string, suffix: string = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let newText: string;
    let newCursorPos: number;

    if (selectedText) {
      // Wrap selected text
      newText = value.substring(0, start) + prefix + selectedText + suffix + value.substring(end);
      newCursorPos = end + prefix.length + suffix.length;
    } else {
      // Insert at cursor with placeholder
      newText = value.substring(0, start) + prefix + suffix + value.substring(end);
      newCursorPos = start + prefix.length;
    }

    onChange(newText);
    
    // Restore focus and cursor position after state update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertBold = () => insertMarkdown("**");
  const insertItalic = () => insertMarkdown("*");
  const insertList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeCursor = value.substring(0, start);
    const afterCursor = value.substring(start);
    
    // Check if we're at the start of a line
    const lastNewline = beforeCursor.lastIndexOf('\n');
    const isStartOfLine = lastNewline === beforeCursor.length - 1 || start === 0;
    
    const prefix = isStartOfLine ? "- " : "\n- ";
    const newText = beforeCursor + prefix + afterCursor;
    const newCursorPos = start + prefix.length;

    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const config = SECTION_CONFIG[sectionKey] || {
    icon: AlertTriangle,
    sectionNumber: "01",
    displayKey: sectionKey.toUpperCase(),
  };

  const handleStyleChange = (updates: Partial<ModuleStyle>) => {
    const newStyle = { ...localStyle, ...updates };
    setLocalStyle(newStyle);
    onStyleChange?.(newStyle);
  };

  const handleSave = () => {
    onClose();
  };

  const handleDiscard = () => {
    onClose();
  };

  // Parse content into structured points for preview
  const parseContentToPoints = (content: string) => {
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        let cleaned = line.replace(/^[-*+]\s+/, '');
        cleaned = cleaned.replace(/^\d+\.\s+/, '');
        cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '$1');
        cleaned = cleaned.replace(/\*(.+?)\*/g, '$1');
        return cleaned.trim();
      })
      .filter(line => line.length > 0);
  };

  const points = parseContentToPoints(value);
  const SelectedIcon = ICON_OPTIONS.find(i => i.id === localStyle.selectedIcon)?.icon || AlertTriangle;

  const tabs = [
    { id: "content" as TabType, icon: FileText, label: "Content" },
    { id: "style" as TabType, icon: Palette, label: "Style" },
    { id: "logic" as TabType, icon: GitBranch, label: "Logic" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] max-h-[850px] p-0 bg-[#0A0A0A] border border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.2)] overflow-hidden flex flex-col">
        {/* Corner accents */}
        <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-[#00f0ff]/50" />
        <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-[#00f0ff]/50" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0D0D0D]">
          <div className="flex items-center gap-4">
            <FileText className="w-5 h-5 text-[#00f0ff]" />
            <div>
              <h2 className="text-white font-mono text-xs uppercase tracking-widest">Module_Editor</h2>
              <p className="text-slate-500 text-[10px] font-mono tracking-tighter uppercase">
                ID: MOD_{config.sectionNumber}_{config.displayKey}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main content area */}
        <div className="flex-grow flex overflow-hidden bg-[size:20px_20px] bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)]">
          {/* Sidebar navigation */}
          <aside className="w-20 md:w-48 border-r border-white/10 flex flex-col bg-[#080808]">
            <nav className="flex flex-col p-2 space-y-2">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 transition-all group",
                      isActive 
                        ? "bg-[#00f0ff]/10 text-[#00f0ff] border-l-2 border-[#00f0ff]"
                        : "text-slate-500 hover:bg-white/5 hover:text-white border-l-2 border-transparent"
                    )}
                  >
                    <TabIcon className="w-4 h-4" />
                    <span className={cn(
                      "hidden md:block text-[10px] font-mono uppercase tracking-widest",
                      isActive && "font-bold"
                    )}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Editor section */}
          <section className="flex-grow overflow-y-auto p-8 scrollbar-hide border-r border-white/5">
            <ScrollArea className="h-full">
              <div className="max-w-2xl mx-auto space-y-8">
                {activeTab === "content" && (
                  <>
                    {/* Module Title */}
                    <div>
                      <label className="block text-[10px] font-mono text-[#00f0ff] uppercase tracking-widest mb-2">
                        Module Title
                      </label>
                      <Input
                        value={localTitle}
                        onChange={(e) => setLocalTitle(e.target.value)}
                        className="w-full bg-[#0F0F0F] border-white/10 text-white p-3 text-sm focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all rounded-none"
                      />
                    </div>

                    {/* Main Description */}
                    <div>
                      <label className="block text-[10px] font-mono text-[#00f0ff] uppercase tracking-widest mb-2">
                        Main Description
                      </label>
                      <Textarea
                        value={localDescription}
                        onChange={(e) => setLocalDescription(e.target.value)}
                        rows={3}
                        className="w-full bg-[#0F0F0F] border-white/10 text-white p-3 text-sm focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all rounded-none resize-none"
                      />
                    </div>

                    {/* Sub-Points (Rich Text) */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-[10px] font-mono text-[#00f0ff] uppercase tracking-widest">
                          Sub-Points (Rich Text)
                        </label>
                        <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={insertBold}
                            className="p-1 text-slate-500 hover:text-white hover:bg-white/10 transition-colors rounded"
                            title="Bold (wrap selection with **)"
                          >
                            <Bold className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            type="button"
                            onClick={insertItalic}
                            className="p-1 text-slate-500 hover:text-white hover:bg-white/10 transition-colors rounded"
                            title="Italic (wrap selection with *)"
                          >
                            <Italic className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            type="button"
                            onClick={insertList}
                            className="p-1 text-slate-500 hover:text-white hover:bg-white/10 transition-colors rounded"
                            title="Insert bullet point"
                          >
                            <List className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <Textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={`Enter your ${title.toLowerCase()} content here...

Use markdown formatting:
- **Bold text** for emphasis
- *Italic text* for subtle emphasis
- Bullet points with dashes (-)
- Numbered lists (1. 2. 3.)`}
                        className="w-full bg-[#0F0F0F] border-white/10 text-white p-4 min-h-[160px] text-sm focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all rounded-none resize-none"
                      />
                    </div>

                    {/* AI Suggestion */}
                    {aiSuggestion && (
                      <div className="p-4 bg-[#00f0ff]/5 border border-[#00f0ff]/30 space-y-3">
                        <div className="flex items-center gap-2 text-[#00f0ff]">
                          <Sparkles className="w-4 h-4" />
                          <span className="text-[10px] font-mono uppercase tracking-widest">AI Suggestion</span>
                        </div>
                        <div className="text-sm text-slate-300">
                          <ReactMarkdown>{aiSuggestion}</ReactMarkdown>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={onAcceptSuggestion}
                            className="bg-[#00f0ff] text-black hover:brightness-110 font-mono text-xs uppercase"
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={onDiscardSuggestion}
                            className="border-white/20 text-slate-400 hover:text-white font-mono text-xs uppercase"
                          >
                            Discard
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activeTab === "style" && (
                  <>
                    {/* Style Overrides */}
                    <div className="space-y-6">
                      <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest">Style Overrides</h3>
                      
                      <div className="grid grid-cols-2 gap-6">
                        {/* BG Opacity */}
                        <div>
                          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-3">
                            BG Opacity
                          </label>
                          <div className="flex items-center gap-4">
                            <Slider
                              value={[localStyle.bgOpacity]}
                              onValueChange={([val]) => handleStyleChange({ bgOpacity: val })}
                              max={100}
                              min={0}
                              step={5}
                              className="flex-grow accent-[#00f0ff]"
                            />
                            <span className="text-xs font-mono text-white w-10 text-right">
                              {localStyle.bgOpacity}%
                            </span>
                          </div>
                        </div>

                        {/* Glow Intensity */}
                        <div>
                          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-3">
                            Glow Intensity
                          </label>
                          <div className="flex items-center gap-4">
                            <Slider
                              value={[localStyle.glowIntensity]}
                              onValueChange={([val]) => handleStyleChange({ glowIntensity: val })}
                              max={100}
                              min={0}
                              step={5}
                              className="flex-grow accent-[#00f0ff]"
                            />
                            <span className="text-xs font-mono text-white w-10 text-right">
                              {localStyle.glowIntensity}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Icon Selection */}
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-3">
                          Icon Selection
                        </label>
                        <div className="grid grid-cols-6 gap-2">
                          {ICON_OPTIONS.map((option) => {
                            const IconComp = option.icon;
                            const isSelected = localStyle.selectedIcon === option.id;
                            return (
                              <button
                                key={option.id}
                                onClick={() => handleStyleChange({ selectedIcon: option.id })}
                                className={cn(
                                  "aspect-square flex items-center justify-center border transition-all",
                                  isSelected
                                    ? "border-[#00f0ff] bg-[#00f0ff]/10 text-[#00f0ff]"
                                    : "border-white/5 hover:border-white/20 text-slate-500"
                                )}
                              >
                                <IconComp className="w-4 h-4" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "logic" && (
                  <>
                    {/* Logic/Connections */}
                    <div className="space-y-6">
                      <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest">Module Connections</h3>
                      
                      <div className="p-6 border border-dashed border-white/10 bg-[#0F0F0F] text-center">
                        <GitBranch className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4">
                          Connect to other modules
                        </p>
                        <p className="text-sm text-slate-600 mb-4">
                          Define relationships between this module and other business logic sections.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#00f0ff]/30 text-[#00f0ff] hover:bg-[#00f0ff]/10 font-mono text-xs uppercase"
                        >
                          <Plus className="w-3 h-3 mr-2" />
                          Add Connection
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                          Validation Rules
                        </h4>
                        <div className="p-4 bg-[#0F0F0F] border border-white/5">
                          <p className="text-sm text-slate-500">
                            No validation rules configured. Add rules to ensure data consistency.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </section>

          {/* Live Preview sidebar */}
          <aside className="w-80 bg-[#0D0D0D] p-6 flex flex-col gap-6 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Live_Preview</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[8px] font-mono text-green-500">SYNCED</span>
              </span>
            </div>

            {/* Preview Card */}
            <div 
              className="relative bg-[#050505] p-5 border border-white/5 overflow-hidden group"
              style={{
                opacity: localStyle.bgOpacity / 100,
                boxShadow: `0 0 ${localStyle.glowIntensity / 3}px rgba(0, 240, 255, ${localStyle.glowIntensity / 200})`,
              }}
            >
              {/* Corner accents */}
              <div className="absolute -top-px -left-px w-2 h-2 border-t-2 border-l-2 border-[#00f0ff] opacity-70" />
              <div className="absolute -bottom-px -right-px w-2 h-2 border-b-2 border-r-2 border-[#00f0ff] opacity-70" />

              <div className="absolute top-2 right-2">
                <SelectedIcon className="w-4 h-4 text-slate-700" />
              </div>

              <h3 className="font-mono text-[10px] text-[#00f0ff] uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-1 h-1 bg-[#00f0ff] rounded-full shadow-[0_0_5px_#00f0ff]" />
                {localTitle || title}
              </h3>

              <p className="text-[10px] text-slate-400 leading-relaxed mb-4">
                {localDescription || subtitle}
              </p>

              {/* Sub-points preview */}
              <div className="space-y-2">
                {points.slice(0, 3).map((point, i) => {
                  const parts = point.split(':');
                  const hasTitle = parts.length > 1;
                  return (
                    <div key={i} className="p-2 bg-white/5 border border-white/5">
                      {hasTitle ? (
                        <>
                          <h4 className="text-[9px] font-bold text-white uppercase tracking-tight">
                            {parts[0]}
                          </h4>
                          <p className="text-[9px] text-slate-500 line-clamp-2">
                            {parts.slice(1).join(':').trim()}
                          </p>
                        </>
                      ) : (
                        <p className="text-[9px] text-slate-400 line-clamp-2">{point}</p>
                      )}
                    </div>
                  );
                })}
                {points.length === 0 && (
                  <div className="p-2 bg-white/5 border border-dashed border-white/10 text-center">
                    <p className="text-[9px] text-slate-600">Add content to see preview</p>
                  </div>
                )}
              </div>
            </div>

            {/* Responsive Stack placeholder */}
            <div className="flex-grow flex items-center justify-center border border-dashed border-white/5">
              <div className="text-center">
                <BarChart3 className="w-8 h-8 text-slate-800 mx-auto mb-2" />
                <span className="text-[10px] font-mono text-slate-700">Responsive Stack</span>
              </div>
            </div>
          </aside>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#0D0D0D] flex justify-between items-center">
          <button 
            onClick={onAIGenerate}
            disabled={isGenerating}
            className={cn(
              "flex items-center gap-2 px-4 py-2 bg-[#00f0ff]/5 border border-[#00f0ff]/30 text-[#00f0ff]",
              "hover:bg-[#00f0ff]/20 transition-all text-xs font-mono uppercase tracking-widest group",
              isGenerating && "opacity-50 cursor-not-allowed"
            )}
          >
            <Sparkles className={cn("w-4 h-4 group-hover:rotate-180 transition-transform", isGenerating && "animate-spin")} />
            {isGenerating ? "Generating..." : "AI Auto-Refine"}
          </button>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleDiscard}
              className="text-slate-500 hover:text-white text-xs font-mono uppercase tracking-widest transition-colors"
            >
              Discard
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2 bg-[#00f0ff] text-black font-bold text-xs font-mono uppercase tracking-widest hover:brightness-110 transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
