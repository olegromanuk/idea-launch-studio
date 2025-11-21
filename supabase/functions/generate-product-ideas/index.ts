import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { interests } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a product ideation expert helping entrepreneurs generate viable product ideas.
Based on user interests and market trends, suggest 5 unique and actionable product ideas.
Each idea should be practical, market-validated, and suitable for solo founders or small teams.
Focus on digital products: SaaS, apps, tools, marketplaces, or AI-powered solutions.`;

    const userPrompt = `Generate 5 product ideas based on these interests: ${interests.join(', ')}.
For each idea, provide:
1. A catchy title (max 8 words)
2. A one-line description (max 20 words)
3. Target audience (max 15 words)
4. The core problem it solves (max 20 words)

Format as JSON array with objects containing: title, description, audience, problem`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_ideas",
            description: "Return 5 product idea suggestions",
            parameters: {
              type: "object",
              properties: {
                ideas: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      audience: { type: "string" },
                      problem: { type: "string" }
                    },
                    required: ["title", "description", "audience", "problem"],
                    additionalProperties: false
                  }
                }
              },
              required: ["ideas"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_ideas" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error('Failed to generate ideas');
    }

    const data = await response.json();
    console.log('AI Response:', JSON.stringify(data));
    
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const ideas = toolCall ? JSON.parse(toolCall.function.arguments).ideas : [];

    return new Response(JSON.stringify({ ideas }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-product-ideas:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
