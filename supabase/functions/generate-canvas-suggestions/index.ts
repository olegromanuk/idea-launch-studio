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
    const { section, productIdea, stepId, variantCount = 3 } = await req.json();
    
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

    // Original canvas section suggestions - now generates multiple variants
    const sectionPrompts: Record<string, string> = {
      // Business Logic sections
      problem: `List 2-3 top problems that ${productIdea.audience} face related to: ${productIdea.problem}. Be specific and actionable.`,
      targetAudience: `Define the target audience for ${productIdea.idea}. Include: 1) Primary user segment with demographics and behaviors, 2) Their specific pain points and needs, 3) What motivates them to seek solutions. Target audience: ${productIdea.audience}`,
      uniqueValueProposition: `Create a single, clear, compelling message (1-2 sentences) that explains why ${productIdea.idea} is different and worth attention for ${productIdea.audience}.`,
      revenueModel: `List 2-4 potential revenue streams for ${productIdea.idea}. Consider subscriptions, freemium, one-time fees, usage-based pricing, licensing, etc. Include pricing strategy recommendations.`,
      marketTrends: `Analyze market trends and validation signals for ${productIdea.idea}. Include: 1) Current market trends supporting this idea, 2) Market size indicators, 3) Validation signals to look for.`,
      successMetrics: `List 4-5 key success metrics for ${productIdea.idea}. Include both leading indicators (early signals) and lagging indicators (outcome metrics) like user engagement, conversion rates, retention, revenue, etc.`,
      
      // Development sections
      coreFeatures: `List 5-7 must-have core features for the MVP of ${productIdea.idea}. Prioritize features that directly address ${productIdea.problem}. Format as bullet points with brief descriptions.`,
      userFlow: `Outline the main user flow for ${productIdea.idea}. Describe 4-6 key steps from user onboarding to achieving their main goal. Focus on the critical path.`,
      techStack: `Recommend a tech stack for ${productIdea.idea}. Include frontend, backend, database, hosting, and any specialized tools. Consider scalability and team expertise.`,
      dataRequirements: `List the key data requirements for ${productIdea.idea}. Include: 1) What user data needs to be collected, 2) Data storage needs, 3) Analytics requirements, 4) Any third-party data integrations.`,
      integrations: `List 3-5 important third-party integrations for ${productIdea.idea}. Consider payment processors, authentication, analytics, communication tools, and industry-specific services.`,
      securityConsiderations: `Outline 4-5 key security considerations for ${productIdea.idea}. Include data protection, authentication, authorization, compliance requirements, and infrastructure security.`,
      
      // Go-to-Market sections
      positioning: `Create positioning and messaging for ${productIdea.idea}. Include: 1) Positioning statement, 2) Key messaging pillars (3-4), 3) Tagline suggestions. Target audience: ${productIdea.audience}`,
      acquisitionChannels: `List 4-5 customer acquisition channels for ${productIdea.idea}. Mix organic (content, SEO, community) and paid (ads, partnerships) approaches. Include estimated effectiveness for ${productIdea.audience}.`,
      pricingModel: `Recommend a pricing model for ${productIdea.idea}. Include: 1) Pricing strategy (freemium, tiered, etc.), 2) Suggested price points, 3) Competitive positioning rationale.`,
      launchPlan: `Create a launch plan for ${productIdea.idea}. Include: 1) Pre-launch activities, 2) Launch day strategy, 3) Post-launch follow-up. Focus on building momentum with ${productIdea.audience}.`,
      contentStrategy: `Outline a content strategy for ${productIdea.idea}. Include: 1) Content types to create, 2) Key topics and themes, 3) Distribution channels, 4) Publishing cadence.`,
      growthLoops: `Identify 2-3 growth loops for ${productIdea.idea}. Describe viral mechanics, referral opportunities, and network effects that could drive organic growth.`,
      
      // Legacy Lean Canvas sections
      existingAlternatives: `List 2-3 existing ways people currently solve these problems: ${productIdea.problem}. Include both direct competitors and workarounds.`,
      solution: `Outline 2-3 possible solutions for ${productIdea.idea}. Keep each solution concise and focused on how it addresses the problem.`,
      keyMetrics: `List 3-4 key numbers/metrics that would tell if ${productIdea.idea} is succeeding. Focus on actionable metrics like user engagement, conversion rates, etc.`,
      highLevelConcept: `Create an "X for Y" analogy for ${productIdea.idea}. Example: "YouTube = Flickr for videos". Be creative but clear.`,
      unfairAdvantage: `Suggest 2-3 potential unfair advantages for ${productIdea.idea} - things that cannot easily be bought or copied (network effects, insider information, existing audience, etc.).`,
      channels: `List 3-4 effective channels to reach ${productIdea.audience} for ${productIdea.idea}. Mix inbound (content, SEO) and outbound (ads, partnerships) approaches.`,
      customerSegments: `Define 2-3 specific customer segments within ${productIdea.audience} for ${productIdea.idea}. Be specific about demographics, behaviors, or needs.`,
      earlyAdopters: `List 3-4 key characteristics of ideal early adopters for ${productIdea.idea}. Focus on traits that make them likely to try new solutions.`,
      costStructure: `List 3-5 major fixed and variable costs for ${productIdea.idea}. Include development, hosting, marketing, support, etc.`,
      revenueStreams: `List 2-4 potential revenue sources for ${productIdea.idea}. Consider subscriptions, one-time fees, usage-based pricing, etc.`,
    };

    const basePrompt = sectionPrompts[section] || `Provide suggestions for the ${section} section of a Lean Canvas for: ${productIdea.idea}`;

    console.log(`Generating ${variantCount} variants for section: ${section}`);

    // Generate multiple variants with different approaches
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
            content: `You are an expert product strategist helping entrepreneurs fill out their Lean Canvas. 
Generate ${variantCount} DISTINCT and DIFFERENT variants/approaches for the requested section.
Each variant should take a unique angle or perspective:
- Variant 1: Conservative/Traditional approach
- Variant 2: Innovative/Bold approach  
- Variant 3: Balanced/Hybrid approach

Make each variant genuinely different in content, tone, and strategy - not just rephrased versions of the same ideas.
Format each variant as bullet points for easy reading.`
          },
          {
            role: 'user',
            content: basePrompt
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'provide_variants',
              description: 'Provide multiple distinct variants for a Lean Canvas section',
              parameters: {
                type: 'object',
                properties: {
                  variants: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        label: {
                          type: 'string',
                          description: 'Short label for this variant (e.g., "Conservative", "Bold", "Balanced")'
                        },
                        description: {
                          type: 'string', 
                          description: 'One-line description of this approach'
                        },
                        content: {
                          type: 'string',
                          description: 'The actual suggestion content as bullet points'
                        }
                      },
                      required: ['label', 'description', 'content']
                    },
                    minItems: 3,
                    maxItems: 3
                  }
                },
                required: ['variants'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'provide_variants' } }
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
      JSON.stringify({ variants: result.variants }),
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
