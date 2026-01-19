import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DomainSuggestion {
  domain: string;
  style: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectName, keywords, industry } = await req.json();

    if (!projectName) {
      return new Response(
        JSON.stringify({ error: 'Project name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating domain suggestions for: ${projectName}`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a creative domain name generator. Generate unique, memorable, and brandable domain name suggestions.

Rules for domain suggestions:
- Keep names short (preferably under 15 characters before the TLD)
- Make them easy to spell and pronounce
- Avoid hyphens and numbers
- Mix creative styles: abbreviations, portmanteaus, invented words, prefixes/suffixes
- Include various TLDs: .com, .io, .co, .app, .dev, .ai, .tech
- Focus on availability-friendly names (less common combinations)`;

    const userPrompt = `Generate 8 creative domain name suggestions for a project called "${projectName}"${keywords ? ` with keywords: ${keywords}` : ''}${industry ? ` in the ${industry} industry` : ''}.

For each suggestion, provide the full domain (with TLD) and a brief style description.

Be creative with variations like:
- Shortened forms (e.g., "getapp" -> "gtapp")
- Word combinations (e.g., "cloud" + "sync" -> "cloudsync")
- Prefixes (try, get, go, my, use, hey)
- Suffixes (ly, ify, hub, lab, io, hq)
- Invented/brandable words`;

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
        tools: [
          {
            type: 'function',
            function: {
              name: 'suggest_domains',
              description: 'Return domain name suggestions',
              parameters: {
                type: 'object',
                properties: {
                  suggestions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        domain: { 
                          type: 'string',
                          description: 'Full domain name with TLD (e.g., myapp.io)'
                        },
                        style: { 
                          type: 'string',
                          description: 'Brief description of the naming style used'
                        }
                      },
                      required: ['domain', 'style'],
                      additionalProperties: false
                    }
                  }
                },
                required: ['suggestions'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'suggest_domains' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate suggestions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI response:', JSON.stringify(data));

    // Extract suggestions from tool call response
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error('No tool call in response');
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    const suggestions: DomainSuggestion[] = parsed.suggestions || [];

    console.log(`Generated ${suggestions.length} domain suggestions`);

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating domain suggestions:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
