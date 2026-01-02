import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DIAGRAM_PROMPTS: Record<string, string> = {
  // Process & Flow Diagrams
  flowchart: `Create a flowchart diagram with clear process steps, decision points, and outcomes. 
    Use colors: blue (#3b82f6) for process steps, amber (#f59e0b) for decision points, green (#10b981) for success outcomes, red (#ef4444) for error/failure outcomes.
    Position elements left-to-right or top-to-bottom in a logical flow.`,
  
  processmap: `Create a detailed process map showing sequential steps, inputs, outputs, and responsible parties.
    Use colors: blue (#3b82f6) for main process steps, cyan (#06b6d4) for inputs, green (#10b981) for outputs, violet (#8b5cf6) for responsible parties/roles.
    Position elements left-to-right showing process flow with clear start and end points.`,

  // Business Strategy Diagrams
  businessmodel: `Create a Business Model Canvas with 9 key components.
    Use colors: blue (#3b82f6) for Key Partners, cyan (#06b6d4) for Key Activities, violet (#8b5cf6) for Key Resources, green (#10b981) for Value Propositions, amber (#f59e0b) for Customer Relationships, pink (#ec4899) for Channels, slate (#64748b) for Customer Segments, red (#ef4444) for Cost Structure, lime (#84cc16) for Revenue Streams.
    Position in classic Business Model Canvas layout: Partners-Activities-Resources on left, Value Prop center, Relationships-Channels-Segments on right, Costs and Revenue at bottom.`,

  leancanvas: `Create a Lean Canvas with 9 key sections for startup planning.
    Use colors: red (#ef4444) for Problem, green (#10b981) for Solution, violet (#8b5cf6) for Unique Value Proposition, cyan (#06b6d4) for Unfair Advantage, blue (#3b82f6) for Customer Segments, amber (#f59e0b) for Key Metrics, pink (#ec4899) for Channels, slate (#64748b) for Cost Structure, lime (#84cc16) for Revenue Streams.
    Position in Lean Canvas grid layout with Problem/Solution on left, UVP center, and business metrics on right.`,

  valueproposition: `Create a Value Proposition Canvas with customer profile and value map.
    Use colors: blue (#3b82f6) for Customer Jobs, red (#ef4444) for Customer Pains, green (#10b981) for Customer Gains, violet (#8b5cf6) for Products/Services, amber (#f59e0b) for Pain Relievers, lime (#84cc16) for Gain Creators.
    Position with Customer Profile on right (Jobs, Pains, Gains) and Value Map on left (Products, Pain Relievers, Gain Creators).`,

  swot: `Create a SWOT analysis with four quadrants showing internal and external factors.
    Use colors: green (#10b981) for Strengths, red (#ef4444) for Weaknesses, blue (#3b82f6) for Opportunities, amber (#f59e0b) for Threats.
    Position elements in a 2x2 grid: Strengths top-left, Weaknesses top-right, Opportunities bottom-left, Threats bottom-right.`,

  competitive: `Create a competitive analysis comparing key competitors across dimensions.
    Use colors: blue (#3b82f6) for your company, red (#ef4444) for competitor 1, amber (#f59e0b) for competitor 2, green (#10b981) for competitor 3, violet (#8b5cf6) for comparison dimensions.
    Position with comparison dimensions on left column and competitors in columns to the right.`,

  // Organizational Diagrams
  orgchart: `Create an organizational chart with hierarchical positions.
    Use colors: violet (#8b5cf6) for top leadership, blue (#3b82f6) for management, green (#10b981) for teams/departments, cyan (#06b6d4) for individual roles.
    Position elements in a top-down hierarchy.`,

  stakeholder: `Create a stakeholder map showing influence and interest levels.
    Use colors: red (#ef4444) for high-power high-interest (manage closely), amber (#f59e0b) for high-power low-interest (keep satisfied), blue (#3b82f6) for low-power high-interest (keep informed), slate (#64748b) for low-power low-interest (monitor).
    Position in a 2x2 influence/interest matrix with stakeholder names.`,

  // Technical Architecture Diagrams
  architecture: `Create a system architecture diagram with components and connections.
    Use colors: blue (#3b82f6) for frontend/UI components, green (#10b981) for backend services, violet (#8b5cf6) for databases, amber (#f59e0b) for external APIs, cyan (#06b6d4) for infrastructure.
    Position elements showing logical system layers: UI at top, services in middle, data at bottom.`,

  dataflow: `Create a data flow diagram showing how data moves through a system.
    Use colors: blue (#3b82f6) for processes, green (#10b981) for data stores, amber (#f59e0b) for external entities, cyan (#06b6d4) for data flows.
    Position elements showing data transformation from sources through processes to outputs.`,

  network: `Create a network topology diagram showing connected systems.
    Use colors: blue (#3b82f6) for servers, green (#10b981) for clients, violet (#8b5cf6) for network devices, amber (#f59e0b) for cloud services, red (#ef4444) for firewalls/security.
    Position elements showing network structure with core infrastructure center and endpoints around.`,

  entityrelationship: `Create an entity-relationship diagram for database design.
    Use colors: blue (#3b82f6) for main entities, green (#10b981) for junction tables, violet (#8b5cf6) for lookup tables, amber (#f59e0b) for key attributes.
    Position related entities close together showing relationships clearly.`,

  // User Experience Diagrams
  userjourney: `Create a user journey map with stages and touchpoints.
    Use colors: blue (#3b82f6) for stages, green (#10b981) for positive touchpoints, amber (#f59e0b) for neutral touchpoints, red (#ef4444) for pain points, violet (#8b5cf6) for emotions/thoughts.
    Position elements left-to-right showing the journey progression.`,

  serviceblueprin: `Create a service blueprint showing frontstage and backstage activities.
    Use colors: blue (#3b82f6) for customer actions, green (#10b981) for frontstage employee actions, amber (#f59e0b) for backstage processes, violet (#8b5cf6) for support systems, cyan (#06b6d4) for physical evidence.
    Position in horizontal lanes with customer journey at top and support systems at bottom.`,

  persona: `Create a user persona profile with demographics, goals, and pain points.
    Use colors: blue (#3b82f6) for demographics, green (#10b981) for goals, red (#ef4444) for pain points, violet (#8b5cf6) for behaviors, amber (#f59e0b) for motivations.
    Position with main persona info center, surrounded by related attributes.`,

  // Planning & Organization Diagrams
  mindmap: `Create a mind map with a central idea and branching sub-topics.
    Use colors: violet (#8b5cf6) for the central idea, blue (#3b82f6) for main branches, cyan (#06b6d4) for sub-branches, lime (#84cc16) for leaf nodes.
    Position the central idea in the middle with branches radiating outward.`,

  timeline: `Create a timeline with sequential events or milestones.
    Use colors: blue (#3b82f6) for major milestones, green (#10b981) for completed items, amber (#f59e0b) for current/in-progress, pink (#ec4899) for future goals.
    Position elements horizontally left-to-right chronologically.`,

  kanban: `Create a kanban board with task columns.
    Use colors: slate (#64748b) for column headers, blue (#3b82f6) for "To Do" tasks, amber (#f59e0b) for "In Progress" tasks, green (#10b981) for "Done" tasks.
    Position elements in columns left-to-right.`,

  roadmap: `Create a product/project roadmap with phases and deliverables.
    Use colors: blue (#3b82f6) for current phase, green (#10b981) for completed phases, amber (#f59e0b) for next phase, violet (#8b5cf6) for future phases, pink (#ec4899) for key milestones.
    Position phases horizontally with deliverables stacked vertically within each phase.`,

  gantt: `Create a Gantt-style project timeline with tasks and dependencies.
    Use colors: blue (#3b82f6) for active tasks, green (#10b981) for completed tasks, amber (#f59e0b) for milestones, red (#ef4444) for critical path, slate (#64748b) for task groups.
    Position tasks vertically with time flowing left-to-right showing durations.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { diagramType, topic, additionalContext } = await req.json();

    console.log(`Generating ${diagramType} diagram for: ${topic}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const diagramPrompt = DIAGRAM_PROMPTS[diagramType] || DIAGRAM_PROMPTS.flowchart;

    const systemPrompt = `You are an expert business analyst and diagram creation assistant. You create professional, well-structured diagrams for business strategy, technical architecture, and organizational planning.
    
${diagramPrompt}

IMPORTANT GUIDELINES:
1. Generate between 6-15 elements depending on complexity and diagram type.
2. Each element should have meaningful, professional content appropriate for the diagram type.
3. Use the specified color palette to convey meaning and categorization.
4. Position elements logically based on the diagram type's conventions.
5. Content should be concise but informative (1-3 sentences per element).
6. For business models, include industry-specific insights when possible.

Each element MUST have:
- section_key: A short uppercase label (e.g., "PARTNERS", "PROBLEM", "PHASE 1", "CEO")
- section_title: A brief descriptive title
- content: Detailed text content (1-3 sentences with actionable insights)
- color: A hex color from the specified palette
- position_x: X coordinate (range 50-2000, increment by ~350 for horizontal spacing)
- position_y: Y coordinate (range 50-1500, increment by ~250 for vertical spacing)`;

    const userPrompt = `Create a professional ${diagramType} diagram about: ${topic}
${additionalContext ? `\nAdditional context and requirements: ${additionalContext}` : ""}

Generate elements that would be valuable for real business planning and decision-making. Return the diagram elements in the specified JSON format.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_diagram_elements",
              description: "Create professional diagram elements for the board",
              parameters: {
                type: "object",
                properties: {
                  elements: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        section_key: { type: "string", description: "Short uppercase label for quick identification" },
                        section_title: { type: "string", description: "Clear descriptive title" },
                        content: { type: "string", description: "Detailed content with actionable insights" },
                        color: { type: "string", description: "Hex color code from the specified palette" },
                        position_x: { type: "number", description: "X coordinate for positioning" },
                        position_y: { type: "number", description: "Y coordinate for positioning" },
                      },
                      required: ["section_key", "section_title", "content", "color", "position_x", "position_y"],
                    },
                  },
                },
                required: ["elements"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_diagram_elements" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error("AI generation failed");
    }

    const data = await response.json();
    console.log("AI response received, processing...");

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("Invalid AI response:", JSON.stringify(data, null, 2));
      throw new Error("Invalid AI response format");
    }

    const result = JSON.parse(toolCall.function.arguments);
    console.log(`Generated ${result.elements?.length || 0} elements for ${diagramType}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating diagram:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
