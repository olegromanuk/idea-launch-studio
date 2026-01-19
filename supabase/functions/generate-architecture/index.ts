import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ArchitectureNode {
  id: string;
  label: string;
  type: "client" | "server" | "database" | "external" | "cache" | "queue";
  icon?: string;
  description?: string;
}

interface ArchitectureConnection {
  from: string;
  to: string;
  label: string;
}

interface ArchitectureData {
  nodes: ArchitectureNode[];
  connections: ArchitectureConnection[];
  pattern?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { context, pattern } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a software architect AI that generates system architecture diagrams.
Given a product context and architecture pattern, generate a structured architecture with nodes and connections.

IMPORTANT: Return ONLY a valid JSON object with this structure:
{
  "nodes": [
    {
      "id": "unique_id",
      "label": "Display Name",
      "type": "client|server|database|external|cache|queue",
      "icon": "laptop|server|database|cloud|shield|globe|cpu|harddrive|lock|zap|message|payment|mail|file|users|chart",
      "description": "Brief description"
    }
  ],
  "connections": [
    {
      "from": "node_id",
      "to": "node_id", 
      "label": "Protocol/Description"
    }
  ],
  "pattern": "Brief description of the architecture pattern"
}

Node Types:
- client: Frontend applications
- server: Backend services, APIs, microservices
- database: Data storage systems
- external: Third-party services (payment, auth, etc.)
- cache: Caching layers, CDN, file storage
- queue: Message queues, event streams

Keep the diagram simple (3-7 nodes) and focused on the core data flow.
Ensure connections flow logically from client to backend to data stores.`;

    const userPrompt = `Generate a ${pattern} architecture for this product:

Product: ${context.productIdea}
Target Audience: ${context.targetAudience}
Features: ${context.features?.map((f: any) => f.name).join(", ")}
Technical Notes: ${context.technicalSolution || "Standard web application"}

Generate an architecture that:
1. Supports the listed features
2. Follows ${pattern} architectural patterns
3. Includes appropriate integrations (auth, payments, AI, etc.) based on features
4. Uses modern best practices

Return ONLY the JSON object, no explanation or markdown.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate architecture");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response
    let architecture: ArchitectureData;
    try {
      // Clean the response - remove markdown code blocks if present
      const cleanedContent = content
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      architecture = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid architecture format from AI");
    }

    // Validate the structure
    if (!architecture.nodes || !Array.isArray(architecture.nodes)) {
      throw new Error("Invalid nodes in architecture");
    }

    return new Response(
      JSON.stringify({ architecture }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating architecture:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
