import { useState, useRef, useEffect } from "react";
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
  Trash2,
  LucideIcon,
  GripVertical
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

// Section-specific content configurations
interface ContentField {
  key: string;
  label: string;
  type: "text" | "textarea" | "list";
  placeholder: string;
}

interface SectionContentConfig {
  icon: LucideIcon;
  sectionNumber: string;
  displayKey: string;
  fields: ContentField[];
  listItemLabel?: string;
  maxItems?: number;
}

const SECTION_CONFIG: Record<string, SectionContentConfig> = {
  problem: { 
    icon: AlertTriangle, 
    sectionNumber: "01", 
    displayKey: "PROBLEM_STATEMENT",
    fields: [
      { key: "headline", label: "Problem Headline", type: "text", placeholder: "Main problem statement..." },
      { key: "description", label: "Problem Description", type: "textarea", placeholder: "Describe the core problem..." },
    ],
    listItemLabel: "Pain Point",
    maxItems: 5,
  },
  targetAudience: { 
    icon: Users, 
    sectionNumber: "02", 
    displayKey: "TARGET_AUDIENCE",
    fields: [
      { key: "primarySegment", label: "Primary Segment", type: "text", placeholder: "Main target audience..." },
      { key: "demographics", label: "Demographics", type: "textarea", placeholder: "Age, location, profession..." },
      { key: "psychographics", label: "Psychographics", type: "textarea", placeholder: "Values, interests, behaviors..." },
    ],
    listItemLabel: "Audience Segment",
    maxItems: 6,
  },
  uniqueValueProposition: { 
    icon: Gem, 
    sectionNumber: "03", 
    displayKey: "VALUE_PROPOSITION",
    fields: [
      { key: "coreValue", label: "Core Value", type: "text", placeholder: "What unique value do you provide?" },
      { key: "howItWorks", label: "How It Works", type: "textarea", placeholder: "Explain the mechanism..." },
    ],
    listItemLabel: "Differentiator",
    maxItems: 4,
  },
  revenueModel: { 
    icon: DollarSign, 
    sectionNumber: "04", 
    displayKey: "REVENUE_MODEL",
    fields: [
      { key: "primaryModel", label: "Primary Revenue Model", type: "text", placeholder: "Subscription, one-time, freemium..." },
      { key: "pricingStrategy", label: "Pricing Strategy", type: "textarea", placeholder: "How will you price your offering?" },
    ],
    listItemLabel: "Revenue Stream",
    maxItems: 5,
  },
  marketTrends: { 
    icon: TrendingUp, 
    sectionNumber: "05", 
    displayKey: "MARKET_VALIDATION",
    fields: [
      { key: "marketSize", label: "Market Size", type: "text", placeholder: "TAM, SAM, SOM..." },
      { key: "growthRate", label: "Growth Rate", type: "text", placeholder: "Annual growth rate..." },
      { key: "validation", label: "Validation Evidence", type: "textarea", placeholder: "Research, surveys, competitor analysis..." },
    ],
    listItemLabel: "Market Trend",
    maxItems: 4,
  },
  successMetrics: { 
    icon: BarChart3, 
    sectionNumber: "06", 
    displayKey: "SUCCESS_KPIS",
    fields: [
      { key: "northStar", label: "North Star Metric", type: "text", placeholder: "Primary success metric..." },
      { key: "timeframe", label: "Timeframe", type: "text", placeholder: "30 days, 90 days, 1 year..." },
    ],
    listItemLabel: "KPI",
    maxItems: 6,
  },
};

interface ModuleStyle {
  bgOpacity: number;
  glowIntensity: number;
  selectedIcon: string;
  accentColor?: string;
}

interface StructuredContent {
  fields: Record<string, string>;
  items: string[];
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

// Parse existing content into structured format - smarter parsing
const parseContent = (content: string, sectionKey: string): StructuredContent => {
  const config = SECTION_CONFIG[sectionKey];
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const fields: Record<string, string> = {};
  const items: string[] = [];
  const nonListLines: string[] = [];
  
  lines.forEach(line => {
    // Check for labeled field format: "Label:" or "**Label:**" or "Label :"
    let matched = false;
    
    for (const field of (config?.fields || [])) {
      const labelPatterns = [
        new RegExp(`^\\*\\*${field.label}:\\*\\*\\s*(.*)`, 'i'),
        new RegExp(`^\\*\\*${field.label}\\*\\*:\\s*(.*)`, 'i'),
        new RegExp(`^${field.label}:\\s*(.*)`, 'i'),
        new RegExp(`^${field.label}\\s*:\\s*(.*)`, 'i'),
      ];
      
      for (const pattern of labelPatterns) {
        const match = line.match(pattern);
        if (match) {
          fields[field.key] = match[1].trim();
          matched = true;
          break;
        }
      }
      if (matched) break;
    }
    
    if (!matched) {
      // Check if it's a list item
      const listMatch = line.match(/^[-*+•]\s+(.+)/) || line.match(/^\d+\.\s+(.+)/);
      if (listMatch) {
        let cleaned = listMatch[1];
        cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
        if (cleaned.trim()) items.push(cleaned.trim());
      } else {
        // Regular text line
        nonListLines.push(line);
      }
    }
  });
  
  // If no fields were matched, try to intelligently assign first non-list lines to fields
  if (Object.keys(fields).length === 0 && nonListLines.length > 0 && config?.fields.length) {
    // First substantial line goes to the first field
    const firstField = config.fields[0];
    if (firstField && nonListLines[0]) {
      let value = nonListLines[0];
      value = value.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
      fields[firstField.key] = value;
    }
    
    // If there are more non-list lines and more fields, assign them
    if (nonListLines.length > 1 && config.fields.length > 1) {
      const secondField = config.fields[1];
      if (secondField) {
        const remainingLines = nonListLines.slice(1);
        fields[secondField.key] = remainingLines.map(l => 
          l.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1')
        ).join(' ');
      }
    }
  }
  
  return { fields, items };
};

// Convert structured content back to string
const stringifyContent = (structured: StructuredContent, sectionKey: string): string => {
  const config = SECTION_CONFIG[sectionKey];
  const lines: string[] = [];
  
  // Add fields with markdown formatting
  config?.fields.forEach(field => {
    if (structured.fields[field.key]) {
      lines.push(`**${field.label}:** ${structured.fields[field.key]}`);
    }
  });
  
  // Add items as bullet list
  if (structured.items.length > 0) {
    if (lines.length > 0) lines.push(''); // Empty line before list
    lines.push(`**${config?.listItemLabel || 'Item'}s:**`);
    structured.items.forEach(item => {
      lines.push(`- ${item}`);
    });
  }
  
  return lines.join('\n');
};

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
    bgOpacity: 100,
    glowIntensity: 40,
    selectedIcon: "warning",
    accentColor: "#00f0ff",
  });
  
  const [structuredContent, setStructuredContent] = useState<StructuredContent>(() => 
    parseContent(value, sectionKey)
  );
  const [newItem, setNewItem] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync value changes to structured content
  useEffect(() => {
    setStructuredContent(parseContent(value, sectionKey));
  }, [value, sectionKey]);

  // Update parent when structured content changes
  const updateContent = (newStructured: StructuredContent) => {
    setStructuredContent(newStructured);
    onChange(stringifyContent(newStructured, sectionKey));
  };

  const handleFieldChange = (key: string, fieldValue: string) => {
    updateContent({
      ...structuredContent,
      fields: { ...structuredContent.fields, [key]: fieldValue }
    });
  };

  const handleAddItem = () => {
    if (!newItem.trim()) return;
    const config = SECTION_CONFIG[sectionKey];
    if (config?.maxItems && structuredContent.items.length >= config.maxItems) return;
    
    updateContent({
      ...structuredContent,
      items: [...structuredContent.items, newItem.trim()]
    });
    setNewItem("");
  };

  const handleRemoveItem = (index: number) => {
    updateContent({
      ...structuredContent,
      items: structuredContent.items.filter((_, i) => i !== index)
    });
  };

  const handleUpdateItem = (index: number, newValue: string) => {
    const newItems = [...structuredContent.items];
    newItems[index] = newValue;
    updateContent({ ...structuredContent, items: newItems });
  };

  const insertMarkdown = (prefix: string, suffix: string = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let newText: string;
    let newCursorPos: number;

    if (selectedText) {
      newText = value.substring(0, start) + prefix + selectedText + suffix + value.substring(end);
      newCursorPos = end + prefix.length + suffix.length;
    } else {
      newText = value.substring(0, start) + prefix + suffix + value.substring(end);
      newCursorPos = start + prefix.length;
    }

    onChange(newText);
    
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
    fields: [],
    listItemLabel: "Item",
    maxItems: 10,
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

  const SelectedIcon = ICON_OPTIONS.find(i => i.id === localStyle.selectedIcon)?.icon || AlertTriangle;

  const tabs = [
    { id: "content" as TabType, icon: FileText, label: "Content" },
    { id: "style" as TabType, icon: Palette, label: "Style" },
    { id: "logic" as TabType, icon: GitBranch, label: "Logic" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] max-h-[850px] p-0 bg-[#0A0A0A] border border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.2)] overflow-hidden flex flex-col [&>button]:hidden">
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
                    {/* Section-specific fields */}
                    {config.fields.map((field) => (
                      <div key={field.key}>
                        <label className="block text-[10px] font-mono text-[#00f0ff] uppercase tracking-widest mb-2">
                          {field.label}
                        </label>
                        {field.type === "text" ? (
                          <Input
                            value={structuredContent.fields[field.key] || ""}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full bg-[#0F0F0F] border-white/10 text-white p-3 text-sm focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all rounded-none"
                          />
                        ) : (
                          <Textarea
                            value={structuredContent.fields[field.key] || ""}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            rows={3}
                            className="w-full bg-[#0F0F0F] border-white/10 text-white p-3 text-sm focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all rounded-none resize-none"
                          />
                        )}
                      </div>
                    ))}

                    {/* List Items Section */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="block text-[10px] font-mono text-[#00f0ff] uppercase tracking-widest">
                          {sectionKey === 'uniqueValueProposition' ? 'Differentiator' : config.listItemLabel}s ({structuredContent.items.length}/{config.maxItems || 10})
                        </label>
                      </div>
                      
                      {/* Existing items */}
                      <div className="space-y-2 mb-4">
                        {structuredContent.items.map((item, index) => (
                          <div 
                            key={index}
                            className="flex items-center gap-2 p-3 bg-[#0F0F0F] border border-white/5 group hover:border-[#00f0ff]/30 transition-all"
                          >
                            <GripVertical className="w-4 h-4 text-slate-700 cursor-grab" />
                            <span className="text-[10px] font-mono text-[#00f0ff] w-6">#{index + 1}</span>
                            <Input
                              value={item}
                              onChange={(e) => handleUpdateItem(index, e.target.value)}
                              className="flex-1 bg-transparent border-0 text-white text-sm p-0 h-auto focus:ring-0"
                            />
                            <button
                              onClick={() => handleRemoveItem(index)}
                              className="p-1 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add new item */}
                      {(!config.maxItems || structuredContent.items.length < config.maxItems) && (
                        <div className="flex gap-2">
                          <Input
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                            placeholder={`Add new ${config.listItemLabel?.toLowerCase()}...`}
                            className="flex-1 bg-[#0F0F0F] border-white/10 text-white p-3 text-sm focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all rounded-none"
                          />
                          <Button
                            onClick={handleAddItem}
                            className="bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] hover:bg-[#00f0ff]/20 rounded-none"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Raw Markdown Editor (collapsible) */}
                    <div className="pt-4 border-t border-white/5">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                          Raw Markdown (Advanced)
                        </label>
                        <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={insertBold}
                            className="p-1 text-slate-500 hover:text-white hover:bg-white/10 transition-colors rounded"
                            title="Bold"
                          >
                            <Bold className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            type="button"
                            onClick={insertItalic}
                            className="p-1 text-slate-500 hover:text-white hover:bg-white/10 transition-colors rounded"
                            title="Italic"
                          >
                            <Italic className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            type="button"
                            onClick={insertList}
                            className="p-1 text-slate-500 hover:text-white hover:bg-white/10 transition-colors rounded"
                            title="List"
                          >
                            <List className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <Textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={`Enter raw markdown content...`}
                        className="w-full bg-[#0F0F0F] border-white/10 text-white p-4 min-h-[120px] text-sm focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all rounded-none resize-none font-mono text-xs"
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
                            Background Opacity
                          </label>
                          <div className="flex items-center gap-4">
                            <Slider
                              value={[localStyle.bgOpacity]}
                              onValueChange={([val]) => handleStyleChange({ bgOpacity: val })}
                              max={100}
                              min={10}
                              step={5}
                              className="flex-grow accent-[#00f0ff]"
                            />
                            <span className="text-xs font-mono text-white w-10 text-right">
                              {localStyle.bgOpacity}%
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-600 mt-1">
                            Controls card background darkness
                          </p>
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
                          <p className="text-[9px] text-slate-600 mt-1">
                            Controls border glow effect
                          </p>
                        </div>
                      </div>

                      {/* Icon Selection */}
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-3">
                          Section Icon
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

            {/* Preview Card - Fixed opacity bug */}
            <div 
              className="relative p-5 border border-white/5 overflow-hidden group"
              style={{
                backgroundColor: `rgba(5, 5, 5, ${localStyle.bgOpacity / 100})`,
                boxShadow: localStyle.glowIntensity > 0 
                  ? `0 0 ${localStyle.glowIntensity / 2}px rgba(0, 240, 255, ${localStyle.glowIntensity / 150}), inset 0 0 ${localStyle.glowIntensity / 4}px rgba(0, 240, 255, ${localStyle.glowIntensity / 300})`
                  : 'none',
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
                {config.displayKey.replace(/_/g, ' ')}
              </h3>

              {/* Fields preview */}
              <div className="space-y-2 mb-3">
                {config.fields.slice(0, 2).map((field) => {
                  const fieldValue = structuredContent.fields[field.key];
                  if (!fieldValue) return null;
                  return (
                    <div key={field.key} className="p-2 bg-white/5 border border-white/5">
                      <h4 className="text-[8px] font-mono text-slate-500 uppercase tracking-tight mb-1">
                        {field.label}
                      </h4>
                      <p className="text-[9px] text-slate-300 line-clamp-2">{fieldValue}</p>
                    </div>
                  );
                })}
              </div>

              {/* Items preview */}
              <div className="space-y-1.5">
                {structuredContent.items.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-white/5 border border-white/5">
                    <span className="text-[#00f0ff] text-[9px]">•</span>
                    <p className="text-[9px] text-slate-400 line-clamp-1">{item}</p>
                  </div>
                ))}
                {structuredContent.items.length === 0 && Object.keys(structuredContent.fields).length === 0 && (
                  <div className="p-2 bg-white/5 border border-dashed border-white/10 text-center">
                    <p className="text-[9px] text-slate-600">Add content to see preview</p>
                  </div>
                )}
                {structuredContent.items.length > 3 && (
                  <p className="text-[8px] text-slate-600 text-center">
                    +{structuredContent.items.length - 3} more
                  </p>
                )}
              </div>
            </div>

            {/* Style info */}
            <div className="p-4 bg-[#0F0F0F] border border-white/5 space-y-2">
              <h4 className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Style Applied</h4>
              <div className="flex justify-between text-[9px]">
                <span className="text-slate-600">Background</span>
                <span className="text-white">{localStyle.bgOpacity}%</span>
              </div>
              <div className="flex justify-between text-[9px]">
                <span className="text-slate-600">Glow</span>
                <span className="text-white">{localStyle.glowIntensity}%</span>
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
