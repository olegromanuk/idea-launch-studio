import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DIAGRAM_PROMPTS: Record<string, string> = {
  flowchart: `Create a flowchart diagram with clear process steps, decision points, and outcomes. 
    Use colors: blue (#3b82f6) for process steps, amber (#f59e0b) for decision points, green (#10b981) for success outcomes, red (#ef4444) for error/failure outcomes.
    Position elements left-to-right or top-to-bottom in a logical flow.`,
  
  mindmap: `Create a mind map with a central idea and branching sub-topics.
    Use colors: violet (#8b5cf6) for the central idea, blue (#3b82f6) for main branches, cyan (#06b6d4) for sub-branches, lime (#84cc16) for leaf nodes.
    Position the central idea in the middle with branches radiating outward.`,
  
  orgchart: `Create an organizational chart with hierarchical positions.
    Use colors: violet (#8b5cf6) for top leadership, blue (#3b82f6) for management, green (#10b981) for teams/departments, cyan (#06b6d4) for individual roles.
    Position elements in a top-down hierarchy.`,
  
  timeline: `Create a timeline with sequential events or milestones.
    Use colors: blue (#3b82f6) for major milestones, green (#10b981) for completed items, amber (#f59e0b) for current/in-progress, pink (#ec4899) for future goals.
    Position elements horizontally left-to-right chronologically.`,
  
  kanban: `Create a kanban board with task columns.
    Use colors: slate (#64748b) for column headers, blue (#3b82f6) for "To Do" tasks, amber (#f59e0b) for "In Progress" tasks, green (#10b981) for "Done" tasks.
    Position elements in columns left-to-right.`,
  
  swot: `Create a SWOT analysis with four quadrants.
    Use colors: green (#10b981) for Strengths, red (#ef4444) for Weaknesses, blue (#3b82f6) for Opportunities, amber (#f59e0b) for Threats.
    Position elements in a 2x2 grid layout.`,
  
  userjourney: `Create a user journey map with stages and touchpoints.
    Use colors: blue (#3b82f6) for stages, green (#10b981) for positive touchpoints, amber (#f59e0b) for neutral touchpoints, red (#ef4444) for pain points, violet (#8b5cf6) for emotions/thoughts.
    Position elements left-to-right showing the journey progression.`,
  
  architecture: `Create a system architecture diagram with components and connections.
    Use colors: blue (#3b82f6) for frontend/UI components, green (#10b981) for backend services, violet (#8b5cf6) for databases, amber (#f59e0b) for external APIs, cyan (#06b6d4) for infrastructure.
    Position elements showing logical system layers.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { diagramType, topic, additionalContext } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const diagramPrompt = DIAGRAM_PROMPTS[diagramType] || DIAGRAM_PROMPTS.flowchart;

    const systemPrompt = `You are a diagram creation assistant. You generate structured diagram elements for visual boards.
    
${diagramPrompt}

IMPORTANT: Generate between 4-12 elements depending on complexity. Each element should have:
- section_key: A short uppercase label (e.g., "STEP 1", "DECISION", "GOAL", "TEAM A")
- section_title: A brief descriptive title
- content: Detailed text content (1-3 sentences)
- color: A hex color from the specified palette
- position_x: X coordinate (range 50-2000, increment by ~350 for horizontal spacing)
- position_y: Y coordinate (range 50-1500, increment by ~250 for vertical spacing)

Arrange elements logically based on the diagram type. Use the color coding to convey meaning.`;

    const userPrompt = `Create a ${diagramType} diagram about: ${topic}
${additionalContext ? `\nAdditional context: ${additionalContext}` : ""}

Return the diagram elements in this exact JSON format.`;

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
              description: "Create diagram elements for the board",
              parameters: {
                type: "object",
                properties: {
                  elements: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        section_key: { type: "string", description: "Short uppercase label" },
                        section_title: { type: "string", description: "Descriptive title" },
                        content: { type: "string", description: "Detailed content" },
                        color: { type: "string", description: "Hex color code" },
                        position_x: { type: "number", description: "X coordinate" },
                        position_y: { type: "number", description: "Y coordinate" },
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
    console.log("AI response:", JSON.stringify(data, null, 2));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("Invalid AI response format");
    }

    const result = JSON.parse(toolCall.function.arguments);

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
