import { useState } from "react";
import {
  Laptop,
  Server,
  Database,
  Cloud,
  Shield,
  Workflow,
  Loader2,
  Sparkles,
  RefreshCw,
  Globe,
  Cpu,
  HardDrive,
  Lock,
  Zap,
  MessageSquare,
  CreditCard,
  Mail,
  FileText,
  Users,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ArchitectureNode {
  id: string;
  label: string;
  type: "client" | "server" | "database" | "external" | "cache" | "queue";
  icon?: string;
  description?: string;
  group?: string;
}

interface ArchitectureConnection {
  from: string;
  to: string;
  label: string;
  protocol?: string;
}

interface ArchitectureGroup {
  id: string;
  label: string;
  color: string;
}

interface ArchitectureData {
  nodes: ArchitectureNode[];
  connections: ArchitectureConnection[];
  pattern?: string;
  groups?: ArchitectureGroup[];
}

interface ArchitectureDiagramProps {
  canvasData: Record<string, string>;
  scopeData: {
    features: any[];
    technicalSolution: string;
    userStories: any[];
  };
  selectedFeatures: string[];
}

const NODE_ICONS: Record<string, React.ElementType> = {
  laptop: Laptop,
  server: Server,
  database: Database,
  cloud: Cloud,
  shield: Shield,
  globe: Globe,
  cpu: Cpu,
  harddrive: HardDrive,
  lock: Lock,
  zap: Zap,
  message: MessageSquare,
  payment: CreditCard,
  mail: Mail,
  file: FileText,
  users: Users,
  chart: BarChart3,
};

const NODE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  client: { bg: "bg-blue-500/10", border: "border-blue-500", text: "text-blue-400" },
  server: { bg: "bg-purple-500/10", border: "border-purple-500", text: "text-purple-400" },
  database: { bg: "bg-orange-500/10", border: "border-orange-500", text: "text-orange-400" },
  external: { bg: "bg-green-500/10", border: "border-green-500", text: "text-green-400" },
  cache: { bg: "bg-cyan-500/10", border: "border-cyan-500", text: "text-cyan-400" },
  queue: { bg: "bg-pink-500/10", border: "border-pink-500", text: "text-pink-400" },
};

const GROUP_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  write: { bg: "bg-amber-500/5", border: "border-amber-500/30", text: "text-amber-400" },
  read: { bg: "bg-emerald-500/5", border: "border-emerald-500/30", text: "text-emerald-400" },
  core: { bg: "bg-violet-500/5", border: "border-violet-500/30", text: "text-violet-400" },
  events: { bg: "bg-pink-500/5", border: "border-pink-500/30", text: "text-pink-400" },
  adapters: { bg: "bg-cyan-500/5", border: "border-cyan-500/30", text: "text-cyan-400" },
  external: { bg: "bg-green-500/5", border: "border-green-500/30", text: "text-green-400" },
};

const ARCHITECTURE_PATTERNS = [
  { id: "monolith", name: "Monolithic", description: "Single deployment unit" },
  { id: "microservices", name: "Microservices", description: "Distributed services" },
  { id: "serverless", name: "Serverless", description: "Event-driven functions" },
  { id: "event-driven", name: "Event-Driven", description: "Async message passing" },
  { id: "hexagonal", name: "Hexagonal", description: "Ports & adapters pattern" },
  { id: "cqrs", name: "CQRS", description: "Command/Query separation" },
];

export const ArchitectureDiagram = ({
  canvasData,
  scopeData,
  selectedFeatures,
}: ArchitectureDiagramProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState("monolith");
  const [architecture, setArchitecture] = useState<ArchitectureData>(() => 
    generateDefaultArchitecture(scopeData, canvasData, selectedFeatures)
  );

  const handleGenerateWithAI = async () => {
    setIsGenerating(true);
    try {
      const context = {
        productIdea: canvasData.problem || canvasData.uniqueValue || "",
        targetAudience: canvasData.targetAudience || "",
        features: scopeData.features.filter(f => selectedFeatures.includes(f.id)),
        technicalSolution: scopeData.technicalSolution,
        pattern: selectedPattern,
      };

      const { data, error } = await supabase.functions.invoke("generate-architecture", {
        body: { context, pattern: selectedPattern },
      });

      if (error) throw error;

      if (data?.architecture) {
        setArchitecture(data.architecture);
        toast({
          title: "Architecture generated",
          description: "System architecture has been generated based on your project context.",
        });
      }
    } catch (error: any) {
      console.error("Error generating architecture:", error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate architecture. Using default.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePatternChange = (patternId: string) => {
    setSelectedPattern(patternId);
    setArchitecture(generateDefaultArchitecture(scopeData, canvasData, selectedFeatures, patternId));
  };

  const getNodeIcon = (node: ArchitectureNode) => {
    if (node.icon && NODE_ICONS[node.icon]) {
      return NODE_ICONS[node.icon];
    }
    // Default icons based on type
    const defaultIcons: Record<string, React.ElementType> = {
      client: Laptop,
      server: Server,
      database: Database,
      external: Cloud,
      cache: Zap,
      queue: Workflow,
    };
    return defaultIcons[node.type] || Server;
  };

  return (
    <div className="bg-[#121821] border border-[#1E293B] p-6 relative overflow-hidden">
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#00f0ff]/50" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00f0ff]/50" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#00f0ff]/50" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#00f0ff]/50" />

      <div className="absolute top-0 right-0 p-4 opacity-20">
        <Workflow className="w-16 h-16 text-gray-800" />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6 relative z-10">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#00f0ff] mb-1">System Architecture</h3>
          <h2 className="text-xl font-bold text-white">Data Flow & Dependencies</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Pattern selector */}
          <div className="flex gap-1 bg-black/30 p-1 rounded">
            {ARCHITECTURE_PATTERNS.map((pattern) => (
              <button
                key={pattern.id}
                onClick={() => handlePatternChange(pattern.id)}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-mono uppercase transition-all",
                  selectedPattern === pattern.id
                    ? "bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/50"
                    : "text-gray-500 hover:text-gray-300"
                )}
                title={pattern.description}
              >
                {pattern.name}
              </button>
            ))}
          </div>
          
          {/* AI Generate button */}
          <button
            onClick={handleGenerateWithAI}
            disabled={isGenerating}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#00f0ff]/10 border border-[#00f0ff]/50 text-[#00f0ff] hover:bg-[#00f0ff]/20 transition-colors text-xs font-mono uppercase disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Sparkles className="w-3 h-3" />
            )}
            {isGenerating ? "Generating..." : "AI Generate"}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs mb-4">
        {Object.entries(NODE_COLORS).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-1">
            <span className={cn("w-2 h-2 rounded-full", colors.border.replace("border-", "bg-"))} />
            <span className="text-gray-400 capitalize">{type}</span>
          </div>
        ))}
      </div>

      {/* Architecture Diagram */}
      <div className="relative min-h-[200px] border border-dashed border-gray-700 rounded bg-[#0A0E14] p-6 overflow-x-auto">
        {isGenerating ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#00f0ff] mx-auto mb-3" />
              <p className="text-sm text-gray-400 font-mono">Analyzing project requirements...</p>
            </div>
          </div>
        ) : architecture.groups && architecture.groups.length > 0 ? (
          // Grouped layout for complex patterns
          <div className="flex flex-col gap-6">
            {/* Client row - always ungrouped at top */}
            <div className="flex justify-center">
              {architecture.nodes.filter(n => !n.group).map((node) => {
                const Icon = getNodeIcon(node);
                const colors = NODE_COLORS[node.type] || NODE_COLORS.server;
                return (
                  <div key={node.id} className="flex flex-col items-center gap-2 relative z-10 group">
                    <div
                      className={cn(
                        "w-16 h-16 rounded-lg border flex items-center justify-center group-hover:scale-105 transition-all",
                        colors.bg,
                        colors.border
                      )}
                      title={node.description}
                    >
                      <Icon className={cn("w-6 h-6", colors.text)} />
                    </div>
                    <span className={cn("text-xs font-mono", colors.text)}>{node.label}</span>
                  </div>
                );
              })}
            </div>
            
            {/* Connection arrows from client */}
            <div className="flex justify-center gap-16">
              {architecture.groups.map((group) => {
                const groupNodes = architecture.nodes.filter(n => n.group === group.id);
                if (groupNodes.length === 0) return null;
                const groupColors = GROUP_COLORS[group.id] || GROUP_COLORS.core;
                
                return (
                  <div key={group.id} className="flex flex-col items-center">
                    <div className="w-0.5 h-6 bg-gray-600" />
                    <div className="w-2 h-2 border-b-2 border-r-2 border-gray-600 transform rotate-45 -mt-1" />
                  </div>
                );
              })}
            </div>

            {/* Grouped nodes */}
            <div className="flex justify-center gap-6 flex-wrap">
              {architecture.groups.map((group) => {
                const groupNodes = architecture.nodes.filter(n => n.group === group.id);
                if (groupNodes.length === 0) return null;
                const groupColors = GROUP_COLORS[group.id] || GROUP_COLORS.core;
                
                return (
                  <div
                    key={group.id}
                    className={cn(
                      "relative p-4 pt-8 rounded-lg border-2 border-dashed min-w-[140px]",
                      groupColors.bg,
                      groupColors.border
                    )}
                  >
                    {/* Group label */}
                    <div className={cn(
                      "absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded bg-[#0A0E14]",
                      groupColors.text
                    )}>
                      {group.label}
                    </div>
                    
                    {/* Group nodes */}
                    <div className="flex flex-col items-center gap-4">
                      {groupNodes.map((node, idx) => {
                        const Icon = getNodeIcon(node);
                        const colors = NODE_COLORS[node.type] || NODE_COLORS.server;
                        const internalConnection = architecture.connections.find(
                          c => c.from === node.id && groupNodes.some(gn => gn.id === c.to)
                        );
                        
                        return (
                          <div key={node.id} className="flex flex-col items-center gap-2">
                            <div className="flex flex-col items-center gap-2 relative z-10 group/node">
                              <div
                                className={cn(
                                  "w-14 h-14 rounded-lg border flex items-center justify-center group-hover/node:scale-105 transition-all",
                                  colors.bg,
                                  colors.border
                                )}
                                title={node.description}
                              >
                                <Icon className={cn("w-5 h-5", colors.text)} />
                              </div>
                              <span className={cn("text-[10px] font-mono text-center", colors.text)}>{node.label}</span>
                            </div>
                            
                            {/* Internal connection arrow */}
                            {internalConnection && idx < groupNodes.length - 1 && (
                              <div className="flex flex-col items-center">
                                <div className="w-0.5 h-4 bg-gray-600" />
                                <div className="text-[8px] text-gray-500 font-mono my-1">{internalConnection.label}</div>
                                <div className="w-2 h-2 border-b-2 border-r-2 border-gray-600 transform rotate-45 -mt-1" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* External services row */}
            {architecture.nodes.filter(n => n.type === "external").length > 0 && (
              <div className="flex justify-center gap-4 mt-2 pt-4 border-t border-dashed border-gray-700">
                <span className="text-[10px] text-gray-500 font-mono uppercase mr-4">External Services:</span>
                {architecture.nodes.filter(n => n.type === "external").map((node) => {
                  const Icon = getNodeIcon(node);
                  const colors = NODE_COLORS[node.type];
                  return (
                    <div key={node.id} className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-8 h-8 rounded border flex items-center justify-center",
                          colors.bg,
                          colors.border
                        )}
                        title={node.description}
                      >
                        <Icon className={cn("w-4 h-4", colors.text)} />
                      </div>
                      <span className={cn("text-[10px] font-mono", colors.text)}>{node.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          // Simple linear layout for ungrouped patterns
          <div className="flex items-center justify-around flex-wrap gap-4 min-h-[160px]">
            {architecture.nodes.map((node, index) => {
              const Icon = getNodeIcon(node);
              const colors = NODE_COLORS[node.type] || NODE_COLORS.server;
              const connection = architecture.connections.find((c) => c.from === node.id);

              return (
                <div key={node.id} className="flex items-center">
                  {/* Node */}
                  <div className="flex flex-col items-center gap-2 relative z-10 group">
                    <div
                      className={cn(
                        "w-16 h-16 rounded-lg border flex items-center justify-center group-hover:scale-105 transition-all",
                        colors.bg,
                        colors.border
                      )}
                      title={node.description}
                    >
                      <Icon className={cn("w-6 h-6", colors.text)} />
                    </div>
                    <span className={cn("text-xs font-mono", colors.text)}>{node.label}</span>
                  </div>

                  {/* Connection */}
                  {connection && index < architecture.nodes.length - 1 && (
                    <div className="h-0.5 w-16 md:w-24 bg-gray-700 relative mx-4 flex-shrink-0">
                      <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 px-2 bg-[#0A0E14] text-[10px] text-gray-500 font-mono whitespace-nowrap">
                        {connection.label}
                      </div>
                      <div className="absolute right-0 -top-1 w-2 h-2 border-t-2 border-r-2 border-gray-700 transform rotate-45" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pattern Description */}
      {architecture.pattern && (
        <div className="mt-4 p-3 bg-black/30 border border-[#1E293B] rounded">
          <p className="text-xs text-gray-400 font-mono">
            <span className="text-[#00f0ff]">Pattern:</span> {architecture.pattern}
          </p>
        </div>
      )}
    </div>
  );
};

// Helper function to generate default architecture based on scope data
function generateDefaultArchitecture(
  scopeData: { features: any[]; technicalSolution: string; userStories: any[] },
  canvasData: Record<string, string>,
  selectedFeatures: string[],
  pattern: string = "monolith"
): ArchitectureData {
  const features = scopeData.features.filter((f) => selectedFeatures.includes(f.id));
  const techSolution = scopeData.technicalSolution?.toLowerCase() || "";
  const productDescription = (canvasData.problem || canvasData.uniqueValue || "").toLowerCase();

  // Detect what integrations might be needed
  const needsAuth = features.some((f) => 
    f.name?.toLowerCase().includes("auth") || 
    f.name?.toLowerCase().includes("login") ||
    f.name?.toLowerCase().includes("user")
  ) || productDescription.includes("user");

  const needsPayment = features.some((f) => 
    f.name?.toLowerCase().includes("payment") || 
    f.name?.toLowerCase().includes("subscription") ||
    f.name?.toLowerCase().includes("billing")
  ) || productDescription.includes("payment");

  const needsAI = features.some((f) => 
    f.name?.toLowerCase().includes("ai") || 
    f.name?.toLowerCase().includes("ml") ||
    f.name?.toLowerCase().includes("chat")
  ) || techSolution.includes("ai") || productDescription.includes("ai");

  const needsEmail = features.some((f) => 
    f.name?.toLowerCase().includes("email") || 
    f.name?.toLowerCase().includes("notification")
  );

  const needsFileStorage = features.some((f) => 
    f.name?.toLowerCase().includes("upload") || 
    f.name?.toLowerCase().includes("file") ||
    f.name?.toLowerCase().includes("image")
  );

  // Build nodes based on pattern and detected needs
  const nodes: ArchitectureNode[] = [
    {
      id: "client",
      label: "Web App",
      type: "client",
      icon: "laptop",
      description: "React/TypeScript frontend",
    },
  ];

  const connections: ArchitectureConnection[] = [];

  if (pattern === "serverless") {
    nodes.push({
      id: "api",
      label: "Edge Functions",
      type: "server",
      icon: "zap",
      description: "Serverless API endpoints",
    });
    connections.push({ from: "client", to: "api", label: "HTTPS/REST" });
  } else if (pattern === "microservices") {
    nodes.push({
      id: "gateway",
      label: "API Gateway",
      type: "server",
      icon: "server",
      description: "Request routing & load balancing",
    });
    connections.push({ from: "client", to: "gateway", label: "HTTPS" });
    
    // Add service mesh representation
    if (needsAuth) {
      nodes.push({
        id: "auth-service",
        label: "Auth Service",
        type: "server",
        icon: "lock",
        description: "Authentication microservice",
      });
      connections.push({ from: "gateway", to: "auth-service", label: "gRPC" });
    }
  } else if (pattern === "event-driven") {
    // Event-Driven Architecture with groups
    const groups: ArchitectureGroup[] = [
      { id: "producers", label: "Producers", color: "amber" },
      { id: "events", label: "Event Layer", color: "pink" },
      { id: "consumers", label: "Consumers", color: "emerald" },
    ];
    
    nodes.push({
      id: "api",
      label: "API Layer",
      type: "server",
      icon: "server",
      description: "Command ingestion",
      group: "producers",
    });
    connections.push({ from: "client", to: "api", label: "HTTPS" });
    
    nodes.push({
      id: "eventbus",
      label: "Event Bus",
      type: "queue",
      icon: "zap",
      description: "Message broker (Kafka/RabbitMQ)",
      group: "events",
    });
    connections.push({ from: "api", to: "eventbus", label: "Publish" });
    
    nodes.push({
      id: "handlers",
      label: "Event Handlers",
      type: "server",
      icon: "cpu",
      description: "Async event processors",
      group: "consumers",
    });
    connections.push({ from: "eventbus", to: "handlers", label: "Subscribe" });
    
    // Add database to consumers group
    nodes.push({
      id: "db",
      label: "State Store",
      type: "database",
      icon: "database",
      description: "PostgreSQL database",
      group: "consumers",
    });
    connections.push({ from: "handlers", to: "db", label: "Persist" });
    
    return {
      nodes,
      connections,
      groups,
      pattern: "Event-Driven architecture with async message passing via event bus",
    };
    
  } else if (pattern === "hexagonal") {
    // Hexagonal (Ports & Adapters) Architecture with groups
    const groups: ArchitectureGroup[] = [
      { id: "adapters", label: "Input Adapters", color: "cyan" },
      { id: "core", label: "Domain Core", color: "violet" },
      { id: "external", label: "Output Adapters", color: "green" },
    ];
    
    nodes.push({
      id: "rest-adapter",
      label: "REST API",
      type: "server",
      icon: "server",
      description: "HTTP adapter",
      group: "adapters",
    });
    connections.push({ from: "client", to: "rest-adapter", label: "HTTP" });
    
    nodes.push({
      id: "graphql-adapter",
      label: "GraphQL",
      type: "server",
      icon: "globe",
      description: "GraphQL adapter",
      group: "adapters",
    });
    
    nodes.push({
      id: "domain",
      label: "Business Logic",
      type: "server",
      icon: "cpu",
      description: "Domain entities & use cases",
      group: "core",
    });
    connections.push({ from: "rest-adapter", to: "domain", label: "Ports" });
    
    nodes.push({
      id: "db-adapter",
      label: "DB Repository",
      type: "database",
      icon: "database",
      description: "Data persistence adapter",
      group: "external",
    });
    connections.push({ from: "domain", to: "db-adapter", label: "Ports" });
    
    nodes.push({
      id: "api-adapter",
      label: "External APIs",
      type: "external",
      icon: "cloud",
      description: "Third-party integrations",
      group: "external",
    });
    
    return {
      nodes,
      connections,
      groups,
      pattern: "Hexagonal (Ports & Adapters) architecture separating domain from infrastructure",
    };
    
  } else if (pattern === "cqrs") {
    // CQRS (Command Query Responsibility Segregation) with groups
    const groups: ArchitectureGroup[] = [
      { id: "write", label: "Write Side", color: "amber" },
      { id: "events", label: "Event Sync", color: "pink" },
      { id: "read", label: "Read Side", color: "emerald" },
    ];
    
    nodes.push({
      id: "commands",
      label: "Command API",
      type: "server",
      icon: "server",
      description: "Write operations",
      group: "write",
    });
    connections.push({ from: "client", to: "commands", label: "Commands" });
    
    nodes.push({
      id: "write-db",
      label: "Write Store",
      type: "database",
      icon: "database",
      description: "Event sourcing / Write DB",
      group: "write",
    });
    connections.push({ from: "commands", to: "write-db", label: "Persist" });
    
    nodes.push({
      id: "sync",
      label: "Projector",
      type: "queue",
      icon: "zap",
      description: "Event projection",
      group: "events",
    });
    connections.push({ from: "write-db", to: "sync", label: "Events" });
    
    nodes.push({
      id: "read-db",
      label: "Read Store",
      type: "database",
      icon: "database",
      description: "Optimized read models",
      group: "read",
    });
    connections.push({ from: "sync", to: "read-db", label: "Project" });
    
    nodes.push({
      id: "queries",
      label: "Query API",
      type: "server",
      icon: "chart",
      description: "Read operations",
      group: "read",
    });
    connections.push({ from: "read-db", to: "queries", label: "Read" });
    connections.push({ from: "client", to: "queries", label: "Queries" });
    
    return {
      nodes,
      connections,
      groups,
      pattern: "CQRS architecture with separate read/write models and event projection",
    };
    
  } else {
    // Monolith (default)
    nodes.push({
      id: "api",
      label: "API Server",
      type: "server",
      icon: "server",
      description: "Backend API server",
    });
    connections.push({ from: "client", to: "api", label: "HTTPS/JSON" });
  }

  // Add database for patterns that don't already have one
  if (!["cqrs"].includes(pattern)) {
    nodes.push({
      id: "db",
      label: "Primary DB",
      type: "database",
      icon: "database",
      description: "PostgreSQL database",
    });
    
    // Find the appropriate node to connect to DB
    const dbSourceNode = pattern === "event-driven" 
      ? "consumers" 
      : pattern === "hexagonal" 
        ? "adapters-out" 
        : nodes.find(n => n.type === "server" && n.id !== "client")?.id || "api";
    
    connections.push({ from: dbSourceNode, to: "db", label: "PostgreSQL" });
  }

  // Add external services based on detected needs
  if (needsAuth && !["microservices"].includes(pattern)) {
    nodes.push({
      id: "auth",
      label: "Auth Provider",
      type: "external",
      icon: "lock",
      description: "Authentication service",
    });
    const authSourceNode = pattern === "hexagonal" ? "adapters-out" : "api";
    if (nodes.find(n => n.id === authSourceNode)) {
      connections.push({ from: authSourceNode, to: "auth", label: "OAuth" });
    }
  }

  if (needsPayment) {
    nodes.push({
      id: "payment",
      label: "Payments",
      type: "external",
      icon: "payment",
      description: "Payment processing",
    });
  }

  if (needsAI) {
    nodes.push({
      id: "ai",
      label: "AI Service",
      type: "external",
      icon: "cpu",
      description: "AI/ML processing",
    });
  }

  if (needsFileStorage) {
    nodes.push({
      id: "storage",
      label: "File Storage",
      type: "cache",
      icon: "harddrive",
      description: "Object storage",
    });
  }

  const patternDescriptions: Record<string, string> = {
    monolith: "Monolithic architecture with single API server and PostgreSQL database",
    microservices: "Microservices architecture with API gateway and distributed services",
    serverless: "Serverless architecture with edge functions for API endpoints",
    "event-driven": "Event-Driven architecture with async message passing via event bus",
    hexagonal: "Hexagonal (Ports & Adapters) architecture separating domain from infrastructure",
    cqrs: "CQRS architecture with separate read/write models and event projection",
  };

  return {
    nodes,
    connections,
    pattern: patternDescriptions[pattern],
  };
}
