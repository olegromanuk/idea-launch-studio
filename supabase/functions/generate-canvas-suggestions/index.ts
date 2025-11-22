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
    const { section, productIdea, stepId } = await req.json();
    
    if (!section || !productIdea) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: section and productIdea' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Check if this is a request for AI step suggestions
    if (section.startsWith('step_') && stepId) {
      const stepSuggestionsPrompts: Record<number, string> = {
        1: `Based on this product idea: ${JSON.stringify(productIdea)}
        
Generate 3-4 actionable suggestions for Idea Validation. Include:
- Market opportunity analysis (use "trend" icon)
- Competitive differentiation strategy (use "users" icon)
- Unique value angle (use "lightbulb" icon)
- Revenue model recommendation (use "check" icon)

Format each suggestion with: icon, type (e.g., "Market Analysis", "Competition", "Value Prop"), title, and detailed content.`,
        2: `Based on this product idea: ${JSON.stringify(productIdea)}
        
Generate 3-4 suggestions for Target Audience & Value Proposition. Include:
- Primary user segment definition (use "users" icon)
- Key pain point to solve (use "lightbulb" icon)
- Value proposition clarity (use "check" icon)`,
        3: `Based on this product idea: ${JSON.stringify(productIdea)}
        
Generate 3-4 suggestions for Product Architecture. Include:
- Must-have features for MVP (use "check" icon)
- Nice-to-have features for later (use "lightbulb" icon)
- Technical architecture recommendations (use "trend" icon)`,
        4: `Based on this product idea: ${JSON.stringify(productIdea)}
        
Generate 2-3 suggestions for UI/UX Design. Include:
- Visual design direction (use "lightbulb" icon)
- User experience priorities (use "users" icon)`,
        5: `Based on this product idea: ${JSON.stringify(productIdea)}
        
Generate 2-3 suggestions for Tech Stack. Include:
- Recommended technology stack (use "trend" icon)
- MVP development approach (use "lightbulb" icon)`,
        6: `Based on this product idea: ${JSON.stringify(productIdea)}
        
Generate 3-4 suggestions for Launch & Marketing. Include:
- Launch strategy (use "users" icon)
- Marketing channels (use "trend" icon)
- Growth tactics (use "lightbulb" icon)`
      };

      const stepPrompt = stepSuggestionsPrompts[stepId] || `Generate helpful suggestions for step ${stepId}`;

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: 'You are a product strategy expert helping entrepreneurs validate and build their ideas.'
            },
            {
              role: 'user',
              content: stepPrompt
            }
          ],
          tools: [{
            type: 'function',
            function: {
              name: 'provide_suggestions',
              description: 'Provide AI suggestions for the step',
              parameters: {
                type: 'object',
                properties: {
                  suggestions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        icon: {
                          type: 'string',
                          enum: ['trend', 'users', 'lightbulb', 'check'],
                          description: 'Icon type for the suggestion'
                        },
                        type: {
                          type: 'string',
                          description: 'Category tag (e.g., Market Analysis, Competition)'
                        },
                        title: {
                          type: 'string',
                          description: 'Short title for the suggestion'
                        },
                        content: {
                          type: 'string',
                          description: 'Detailed suggestion content'
                        }
                      },
                      required: ['icon', 'type', 'title', 'content']
                    }
                  }
                },
                required: ['suggestions']
              }
            }
          }],
          tool_choice: { type: 'function', function: { name: 'provide_suggestions' } }
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: 'AI usage limit reached. Please add credits to continue.' }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const errorText = await response.text();
        console.error('AI Gateway error:', response.status, errorText);
        throw new Error(`AI Gateway returned ${response.status}`);
      }

      const aiData = await response.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      
      if (toolCall?.function?.arguments) {
        const result = JSON.parse(toolCall.function.arguments);
        return new Response(
          JSON.stringify({ suggestions: result.suggestions }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Original canvas section suggestions
    const sectionPrompts: Record<string, string> = {
      problem: `List 2-3 top problems that ${productIdea.audience} face related to: ${productIdea.problem}. Be specific and actionable.`,
      existingAlternatives: `List 2-3 existing ways people currently solve these problems: ${productIdea.problem}. Include both direct competitors and workarounds.`,
      solution: `Outline 2-3 possible solutions for ${productIdea.idea}. Keep each solution concise and focused on how it addresses the problem.`,
      keyMetrics: `List 3-4 key numbers/metrics that would tell if ${productIdea.idea} is succeeding. Focus on actionable metrics like user engagement, conversion rates, etc.`,
      uniqueValueProposition: `Create a single, clear, compelling message (1-2 sentences) that explains why ${productIdea.idea} is different and worth attention for ${productIdea.audience}.`,
      highLevelConcept: `Create an "X for Y" analogy for ${productIdea.idea}. Example: "YouTube = Flickr for videos". Be creative but clear.`,
      unfairAdvantage: `Suggest 2-3 potential unfair advantages for ${productIdea.idea} - things that cannot easily be bought or copied (network effects, insider information, existing audience, etc.).`,
      channels: `List 3-4 effective channels to reach ${productIdea.audience} for ${productIdea.idea}. Mix inbound (content, SEO) and outbound (ads, partnerships) approaches.`,
      customerSegments: `Define 2-3 specific customer segments within ${productIdea.audience} for ${productIdea.idea}. Be specific about demographics, behaviors, or needs.`,
      earlyAdopters: `List 3-4 key characteristics of ideal early adopters for ${productIdea.idea}. Focus on traits that make them likely to try new solutions.`,
      costStructure: `List 3-5 major fixed and variable costs for ${productIdea.idea}. Include development, hosting, marketing, support, etc.`,
      revenueStreams: `List 2-4 potential revenue sources for ${productIdea.idea}. Consider subscriptions, one-time fees, usage-based pricing, etc.`,
    };

    const prompt = sectionPrompts[section] || `Provide suggestions for the ${section} section of a Lean Canvas for: ${productIdea.idea}`;

    console.log(`Generating suggestions for section: ${section}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert product strategist helping entrepreneurs fill out their Lean Canvas. Provide practical, specific, and actionable suggestions. Format as bullet points for easy reading.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'provide_suggestions',
              description: 'Provide suggestions for a Lean Canvas section',
              parameters: {
                type: 'object',
                properties: {
                  suggestions: {
                    type: 'string',
                    description: 'Formatted suggestions as bullet points'
                  }
                },
                required: ['suggestions'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'provide_suggestions' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway returned ${response.status}`);
    }

    const data = await response.json();
    console.log('AI Response:', JSON.stringify(data));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in response');
    }

    const result = JSON.parse(toolCall.function.arguments);
    
    return new Response(
      JSON.stringify({ suggestions: result.suggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating canvas suggestions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
