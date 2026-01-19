import { useState } from "react";
import { Sparkles, Maximize2, ChevronRight, AlertTriangle, TrendingUp, Users, Gem, DollarSign, BarChart3, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface BusinessLogicSectionProps {
  sections: {
    key: string;
    title: string;
    subtitle: string;
  }[];
  canvasData: Record<string, string>;
  onCanvasChange: (key: string, value: string) => void;
  onAIGenerate: (key: string) => void;
  onExpand: (key: string) => void;
  loadingSection: string | null;
  projectData?: any;
  onValidate?: () => void;
}

const SECTION_CONFIG: Record<string, { 
  icon: React.ComponentType<{ className?: string }>;
  sectionNumber: string;
  displayKey: string;
}> = {
  problem: { icon: AlertTriangle, sectionNumber: "01", displayKey: "Problem_Statement" },
  targetAudience: { icon: Users, sectionNumber: "02", displayKey: "Target_Audience" },
  uniqueValueProposition: { icon: Gem, sectionNumber: "03", displayKey: "Value_Proposition" },
  revenueModel: { icon: DollarSign, sectionNumber: "04", displayKey: "Revenue_Model" },
  marketTrends: { icon: TrendingUp, sectionNumber: "05", displayKey: "Market_Validation" },
  successMetrics: { icon: BarChart3, sectionNumber: "06", displayKey: "Success_KPIs" },
};

// Helper component to render markdown content with blueprint styling
const MarkdownText = ({ content, className }: { content: string; className?: string }) => (
  <ReactMarkdown
    components={{
      p: ({ children }) => <p className={cn("text-sm text-slate-400 leading-relaxed mb-2 last:mb-0", className)}>{children}</p>,
      strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
      em: ({ children }) => <em className="italic text-slate-300">{children}</em>,
      ul: ({ children }) => <ul className="list-none space-y-1 mb-2">{children}</ul>,
      ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2 text-slate-400">{children}</ol>,
      li: ({ children }) => (
        <li className="text-sm text-slate-400 flex items-start gap-2">
          <span className="text-[#00f0ff] mt-1.5 flex-shrink-0">•</span>
          <span>{children}</span>
        </li>
      ),
      h1: ({ children }) => <h1 className="text-lg font-bold text-white mb-2">{children}</h1>,
      h2: ({ children }) => <h2 className="text-base font-semibold text-white mb-2">{children}</h2>,
      h3: ({ children }) => <h3 className="text-sm font-semibold text-white mb-1">{children}</h3>,
      code: ({ children }) => <code className="px-1 py-0.5 bg-[#00f0ff]/10 text-[#00f0ff] text-xs font-mono rounded">{children}</code>,
      blockquote: ({ children }) => (
        <blockquote className="border-l-2 border-[#00f0ff]/50 pl-3 italic text-slate-500 my-2">{children}</blockquote>
      ),
    }}
  >
    {content}
  </ReactMarkdown>
);

// Helper to parse markdown into clean text lines (stripping markdown symbols)
const parseToLines = (content: string): string[] => {
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      // Remove markdown list prefixes
      let cleaned = line.replace(/^[-*+]\s+/, '');
      // Remove numbered list prefixes
      cleaned = cleaned.replace(/^\d+\.\s+/, '');
      // Remove bold/italic markers
      cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '$1');
      cleaned = cleaned.replace(/\*(.+?)\*/g, '$1');
      cleaned = cleaned.replace(/__(.+?)__/g, '$1');
      cleaned = cleaned.replace(/_(.+?)_/g, '$1');
      // Remove headers
      cleaned = cleaned.replace(/^#+\s+/, '');
      return cleaned.trim();
    })
    .filter(line => line.length > 0);
};

export const BusinessLogicSection = ({
  sections,
  canvasData,
  onCanvasChange,
  onAIGenerate,
  onExpand,
  loadingSection,
  projectData,
  onValidate,
}: BusinessLogicSectionProps) => {
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Calculate completion percentage
  const filledSections = sections.filter(s => canvasData[s.key]?.trim()).length;
  const completionPercent = Math.round((filledSections / sections.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header with project info and validate button */}
      <div className="relative overflow-hidden bg-[#0A0A0A] border border-white/[0.08] p-6 mb-6">
        {/* Corner accents */}
        <div className="absolute -top-px -left-px w-2 h-2 border-t-2 border-l-2 border-[#00f0ff] opacity-70" />
        <div className="absolute -bottom-px -right-px w-2 h-2 border-b-2 border-r-2 border-[#00f0ff] opacity-70" />
        
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-sm bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-[#00f0ff]" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xs font-mono text-[#00f0ff] uppercase">Module: 01_Business_Logic</span>
                <span className="bg-[#00f0ff]/10 text-[#00f0ff] text-[10px] px-2 py-0.5 border border-[#00f0ff]/30 rounded font-bold">
                  {completionPercent}% COMPLETE
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1 tracking-tight">
                Business Analysis
              </h3>
              <p className="text-sm text-slate-500 font-mono uppercase tracking-wider">
                Complete all {sections.length} sections to proceed
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Progress indicator */}
            <div className="flex items-center gap-3">
              <div className="w-32 h-1 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.4)] transition-all duration-500"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <span className="text-sm font-mono text-[#00f0ff]">
                {completionPercent}%
              </span>
            </div>
            
            {/* Validate Button */}
            {onValidate && (
              <button
                onClick={onValidate}
                className="px-4 py-2 bg-[#00f0ff] text-black font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)]"
              >
                <CheckCircle2 className="w-4 h-4 inline mr-2" />
                Validate
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {sections.map((section, index) => {
          const config = SECTION_CONFIG[section.key] || { 
            icon: AlertTriangle, 
            sectionNumber: String(index + 1).padStart(2, '0'),
            displayKey: section.key 
          };
          const Icon = config.icon;
          const hasContent = canvasData[section.key]?.trim();
          const isEditing = editingSection === section.key;
          const isLoading = loadingSection === section.key;

          // Determine grid span based on section
          const getGridSpan = () => {
            if (section.key === "problem") return "md:col-span-12";
            if (section.key === "targetAudience") return "md:col-span-12";
            if (section.key === "uniqueValueProposition") return "md:col-span-6";
            if (section.key === "revenueModel") return "md:col-span-6";
            if (section.key === "marketTrends") return "md:col-span-6";
            if (section.key === "successMetrics") return "md:col-span-6";
            return "md:col-span-6";
          };

          return (
            <div
              key={section.key}
              className={cn(
                "relative bg-[#0A0A0A] p-6 md:p-8 transition-all duration-300 group",
                "border border-white/[0.08]",
                getGridSpan()
              )}
            >
              {/* Corner accents */}
              <div className="absolute -top-px -left-px w-2 h-2 border-t-2 border-l-2 border-[#00f0ff] opacity-70" />
              <div className="absolute -bottom-px -right-px w-2 h-2 border-b-2 border-r-2 border-[#00f0ff] opacity-70" />

              {/* Header */}
              <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
                <h2 className="font-mono text-xs text-[#00f0ff] uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full shadow-[0_0_10px_rgba(0,240,255,0.4)]" />
                  {config.sectionNumber}_{config.displayKey}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onAIGenerate(section.key)}
                    disabled={isLoading}
                    className="p-1.5 text-slate-600 hover:text-[#00f0ff] transition-colors disabled:opacity-50"
                    title="Generate with AI"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#00f0ff]" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => onExpand(section.key)}
                    className="p-1.5 text-slate-600 hover:text-[#00f0ff] transition-colors"
                    title="Expand"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <Icon className="w-5 h-5 text-slate-700" />
                </div>
              </div>

              {/* Content */}
              {isEditing || !hasContent ? (
                <div className="space-y-4">
                  <textarea
                    value={canvasData[section.key] || ""}
                    onChange={(e) => onCanvasChange(section.key, e.target.value)}
                    onBlur={() => setEditingSection(null)}
                    autoFocus={isEditing}
                    placeholder={`Describe your ${section.title.toLowerCase()}...`}
                    className="w-full min-h-[150px] bg-[#0F0F0F] border border-white/5 focus:border-[#00f0ff]/30 text-sm text-gray-200 p-4 rounded-sm placeholder:text-gray-600 resize-none focus:outline-none focus:ring-0 transition-colors"
                  />
                  <p className="text-[10px] text-slate-600 font-mono uppercase tracking-wider">
                    {section.subtitle}
                  </p>
                </div>
              ) : (
                <div
                  onClick={() => setEditingSection(section.key)}
                  className="cursor-pointer group/content"
                >
                  {/* Display content as styled cards based on section type */}
                  {section.key === "problem" ? (
                    <ProblemDisplay content={canvasData[section.key]} />
                  ) : section.key === "successMetrics" ? (
                    <MetricsDisplay content={canvasData[section.key]} />
                  ) : section.key === "revenueModel" ? (
                    <RevenueDisplay content={canvasData[section.key]} />
                  ) : section.key === "targetAudience" ? (
                    <AudienceDisplay content={canvasData[section.key]} />
                  ) : section.key === "uniqueValueProposition" ? (
                    <ValuePropDisplay content={canvasData[section.key]} />
                  ) : section.key === "marketTrends" ? (
                    <MarketDisplay content={canvasData[section.key]} />
                  ) : (
                    <div className="p-4 bg-[#0F0F0F] border border-white/5 hover:border-[#00f0ff]/30 transition-colors">
                      <MarkdownText content={canvasData[section.key]} />
                    </div>
                  )}
                  <p className="mt-4 text-[10px] text-slate-600 group-hover/content:text-slate-500 transition-colors font-mono uppercase tracking-wider flex items-center gap-1">
                    Click to edit <ChevronRight className="w-3 h-3" />
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Status */}
      <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-600 font-mono gap-4">
        <div className="flex gap-4">
          <span>ID: BUSINESS_ANA_01</span>
          <span className="flex items-center gap-2">
            STATUS: 
            <span className={cn(
              "w-1.5 h-1.5 rounded-full",
              completionPercent === 100 ? "bg-green-500 animate-pulse" : "bg-amber-500"
            )} />
            {completionPercent === 100 ? "READY TO VALIDATE" : `${completionPercent}% COMPLETE`}
          </span>
        </div>
        <div className="flex gap-6">
          <span className="hover:text-[#00f0ff] transition cursor-pointer flex items-center gap-1">
            EXPORT_PDF
          </span>
          <span className="hover:text-[#00f0ff] transition cursor-pointer flex items-center gap-1">
            SHARE_LINK
          </span>
        </div>
      </div>
    </div>
  );
};

// Sub-components for styled content display
const ProblemDisplay = ({ content }: { content: string }) => {
  const points = parseToLines(content);
  const displayPoints = points.slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {displayPoints.map((point, i) => (
        <div
          key={i}
          className="group/card p-5 border border-white/5 hover:border-[#00f0ff]/30 bg-[#0F0F0F] transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00f0ff]/30 to-transparent transform scale-x-0 group-hover/card:scale-x-100 transition-transform duration-500" />
          <div className="mb-3 text-[#00f0ff]/80 group-hover/card:text-[#00f0ff] transition-colors">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-white font-semibold mb-2 font-mono text-sm uppercase">Point {i + 1}</h3>
          <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">{point}</p>
        </div>
      ))}
      {points.length === 0 && (
        <div className="col-span-3 p-5 border border-dashed border-white/10 bg-[#0F0F0F] text-center">
          <p className="text-sm text-slate-600">No problems defined yet. Click to add.</p>
        </div>
      )}
    </div>
  );
};

const MetricsDisplay = ({ content }: { content: string }) => {
  const lines = parseToLines(content);

  return (
    <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
      {lines.slice(0, 4).map((line, i) => (
        <div key={i} className={cn(
          "p-3 bg-[#0F0F0F] transition-colors duration-300",
          i === 0 ? "border-l-2 border-[#00f0ff]" : "border-l-2 border-slate-800 hover:border-[#00f0ff]/50"
        )}>
          <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">KPI #{i + 1}</span>
          <span className="text-lg font-bold text-white tracking-tight line-clamp-1">{line}</span>
        </div>
      ))}
    </div>
  );
};

const RevenueDisplay = ({ content }: { content: string }) => {
  const streams = parseToLines(content);

  return (
    <div className="space-y-2">
      {streams.slice(0, 5).map((stream, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center justify-between p-3 bg-[#0F0F0F] group/item transition-colors",
            i === 0 
              ? "border-l-2 border-[#00f0ff] shadow-[inset_0_0_10px_rgba(0,240,255,0.05)]" 
              : "border-l-2 border-white/10 hover:border-[#00f0ff]/50"
          )}
        >
          <span className={cn(
            "text-sm font-semibold pl-2 transition-colors",
            i === 0 ? "text-white" : "text-slate-300 group-hover/item:text-white"
          )}>
            {stream}
          </span>
          <span className="text-[10px] font-mono text-slate-500 uppercase">
            {i === 0 ? "PRIMARY" : "STREAM"}
          </span>
        </div>
      ))}
    </div>
  );
};

const AudienceDisplay = ({ content }: { content: string }) => {
  const segments = parseToLines(content);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {segments.slice(0, 6).map((segment, i) => (
        <div
          key={i}
          className="p-4 bg-[#0F0F0F] border border-white/5 hover:border-[#00f0ff]/50 text-center transition-all group/seg cursor-default"
        >
          <Users className="w-6 h-6 mx-auto text-slate-600 group-hover/seg:text-[#00f0ff] mb-3 transition-colors" />
          <h4 className="text-[10px] font-bold text-slate-300 group-hover/seg:text-white uppercase tracking-wider font-mono line-clamp-2">
            {segment}
          </h4>
        </div>
      ))}
    </div>
  );
};

const ValuePropDisplay = ({ content }: { content: string }) => {
  const points = parseToLines(content);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-white/10">
      <div className="p-6 border-b md:border-b-0 md:border-r border-white/10 bg-[#0F0F0F] relative group/vp">
        <div className="absolute inset-0 bg-[#00f0ff]/5 opacity-0 group-hover/vp:opacity-100 transition-opacity" />
        <h3 className="text-white font-bold mb-4 flex items-center gap-2 relative z-10">
          <Gem className="w-4 h-4 text-[#00f0ff]" />
          Core Value
        </h3>
        <ul className="space-y-3 text-sm text-slate-400 relative z-10">
          {points.slice(0, 3).map((point, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-[#00f0ff] mt-0.5 flex-shrink-0">•</span>
              <span>{point}</span>
            </li>
          ))}
          {points.length === 0 && (
            <li className="text-slate-600 italic">Add core value points</li>
          )}
        </ul>
      </div>
      <div className="p-6 bg-[#0F0F0F] relative group/vp">
        <div className="absolute inset-0 bg-[#00f0ff]/5 opacity-0 group-hover/vp:opacity-100 transition-opacity" />
        <h3 className="text-white font-bold mb-4 flex items-center gap-2 relative z-10">
          <TrendingUp className="w-4 h-4 text-[#00f0ff]" />
          Differentiators
        </h3>
        <ul className="space-y-3 text-sm text-slate-400 relative z-10">
          {points.slice(3, 6).map((point, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-[#00f0ff] mt-0.5 flex-shrink-0">•</span>
              <span>{point}</span>
            </li>
          ))}
          {points.length <= 3 && (
            <li className="text-slate-600 italic">Add more points to show differentiators</li>
          )}
        </ul>
      </div>
    </div>
  );
};

const MarketDisplay = ({ content }: { content: string }) => {
  const lines = parseToLines(content);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        {lines.slice(0, 3).map((line, i) => (
          <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-slate-400 text-sm line-clamp-1 flex-1">{line}</span>
            <ChevronRight className="w-4 h-4 text-[#00f0ff] flex-shrink-0 ml-2" />
          </div>
        ))}
      </div>
      <div className="bg-[#0F0F0F] p-5 border border-white/5 relative">
        <div className="absolute top-0 right-0 p-1">
          <TrendingUp className="w-8 h-8 text-slate-800 opacity-50" />
        </div>
        <h4 className="text-xs font-bold mb-3 uppercase tracking-wide font-mono text-[#00f0ff]">Market Insights</h4>
        <ul className="space-y-3">
          {lines.slice(3, 6).map((line, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
              <ChevronRight className="w-4 h-4 text-[#00f0ff] flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">{line}</span>
            </li>
          ))}
        </ul>
        {lines.length > 0 && (
          <div className="mt-6 pt-4 border-t border-white/5">
            <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase mb-2">
              <span>Confidence Score</span>
              <span className="text-[#00f0ff]">{Math.min(lines.length * 15, 100)}/100</span>
            </div>
            <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden relative">
              <div 
                className="bg-[#00f0ff] h-full shadow-[0_0_10px_rgba(0,240,255,0.4)] relative transition-all duration-500"
                style={{ width: `${Math.min(lines.length * 15, 100)}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-3 bg-white shadow-[0_0_10px_rgba(0,240,255,0.4)]" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
