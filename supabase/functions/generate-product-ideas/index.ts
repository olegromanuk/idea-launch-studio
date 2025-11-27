import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PERSONA_CONTEXTS = {
  enterprise: {
    name: "Enterprise Client",
    systemContext: `You are an expert enterprise product strategist specializing in B2B solutions, digital transformation, and large-scale software implementations.
Focus on enterprise-grade solutions: compliance platforms, workflow automation, data analytics, integration tools, and scalable SaaS products.
Consider regulatory requirements, security, scalability, ROI metrics, and enterprise procurement processes.
Ideas should address pain points common in large organizations: legacy system integration, cross-department collaboration, data silos, and operational efficiency.`,
    ideaTypes: "enterprise SaaS, B2B platforms, compliance tools, workflow automation systems, data analytics dashboards, integration middleware, or AI-powered enterprise solutions",
    audienceContext: "enterprise organizations, CTOs, IT directors, department heads, compliance officers, or operations managers"
  },
  agency: {
    name: "Small Agency",
    systemContext: `You are an expert product strategist for digital agencies, creative studios, and consultancies.
Focus on tools that help agencies scale: client management platforms, project collaboration tools, white-label solutions, and productized services.
Consider agency economics: recurring revenue, client retention, team utilization, and differentiating from competitors.
Ideas should help agencies work smarter, deliver better client results, or create new revenue streams beyond hourly billing.`,
    ideaTypes: "client portals, project management tools, white-label platforms, creative workflow tools, agency analytics, proposal/invoicing systems, or productized service offerings",
    audienceContext: "creative agencies, marketing firms, consulting companies, freelance collectives, or design studios"
  },
  solo: {
    name: "Solo Founder",
    systemContext: `You are an expert product strategist and market analyst who deeply understands solopreneurship, indie hacking, and bootstrapping.
Focus on products a single person can build and maintain: micro-SaaS, niche tools, content platforms, and community-driven products.
Consider solo founder constraints: limited time, need for passive income, desire for work-life balance, and building in public.
Ideas should be achievable without a team, have clear monetization paths, and align with the founder's lifestyle goals.`,
    ideaTypes: "micro-SaaS, niche productivity tools, content platforms, community products, API services, browser extensions, or mobile apps",
    audienceContext: "individual professionals, small teams, niche communities, or specific professional roles"
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { interests, refinement, regenerate, persona = 'solo' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating ideas for persona:', persona, 'with interests:', interests);

    const validPersona = persona as keyof typeof PERSONA_CONTEXTS;
    const personaContext = PERSONA_CONTEXTS[validPersona] || PERSONA_CONTEXTS.solo;

    let systemPrompt = personaContext.systemContext;

    let userPrompt = '';
    
    if (refinement && Object.keys(refinement).length > 0) {
      const regenerateNote = regenerate ? '\n\nIMPORTANT: Generate completely NEW ideas different from previous suggestions.' : '';
      
      systemPrompt += `\n\nAnalyze the user's complete profile to generate ideas that authentically match WHO they are and their ${personaContext.name} context.
Consider market viability, their available resources, and realistic execution paths.${regenerateNote}`;

      // Build persona-specific prompt sections
      let profileSection = '';
      
      if (persona === 'enterprise') {
        profileSection = `ORGANIZATION CONTEXT:
Industry/Sector: ${refinement.passions || 'Not specified'}
Strategic Priorities: ${refinement.dailyLife || 'Not specified'}

APPROACH & CAPABILITIES:
Innovation Approach: ${refinement.problemSolving || 'Not specified'}
Key Success Criteria: ${refinement.values || 'Not specified'}
Technical Capability: ${refinement.experience || 'Not specified'}

RESOURCES & TIMELINE:
Deployment Timeline: ${refinement.timeCommitment || 'Not specified'}
Budget Range: ${refinement.budget || 'Not specified'}`;
      } else if (persona === 'agency') {
        profileSection = `AGENCY PROFILE:
Services Offered: ${refinement.passions || 'Not specified'}
Client Engagement Style: ${refinement.dailyLife || 'Not specified'}

WORK APPROACH:
Project Methodology: ${refinement.problemSolving || 'Not specified'}
Core Values: ${refinement.values || 'Not specified'}
Agency Size: ${refinement.experience || 'Not specified'}

RESOURCES:
Available Time: ${refinement.timeCommitment || 'Not specified'} hours/week
Investment Budget: ${refinement.budget || 'Not specified'}`;
      } else {
        profileSection = `PASSIONS & INTERESTS:
${refinement.passions || 'Not specified'}

LIFESTYLE & WORK STYLE:
${refinement.dailyLife || 'Not specified'}

THINKING & PROBLEM-SOLVING APPROACH:
${refinement.problemSolving || 'Not specified'}

CORE VALUES:
${refinement.values || 'Not specified'}

EXPERIENCE LEVEL:
${refinement.experience || 'Not specified'}

AVAILABLE RESOURCES:
- Time commitment: ${refinement.timeCommitment || 'Not specified'} hours/week
- Budget: ${refinement.budget || 'Not specified'}`;
      }

      userPrompt = `Generate 5 highly personalized product ideas for a ${personaContext.name} based on this profile:

${profileSection}

Selected interest areas: ${interests.join(', ')}

INSTRUCTIONS:
1. Generate ${personaContext.ideaTypes}
2. Target ${personaContext.audienceContext}
3. Match complexity and scale to their resources and capabilities
4. Ensure ideas align with their stated priorities and values
5. Consider their timeline and budget constraints
6. Each idea should feel specifically relevant to their ${personaContext.name} context

For each idea, provide:
- Title: Catchy, specific name (max 8 words)
- Description: Clear value proposition (max 20 words)
- Audience: Specific target users (max 15 words)
- Problem: Real pain point this solves (max 20 words)`;
    } else {
      userPrompt = `Generate 5 product ideas for a ${personaContext.name} based on these interests: ${interests.join(', ')}.

Focus on ${personaContext.ideaTypes}.
Target audience should be ${personaContext.audienceContext}.

For each idea, provide:
1. A catchy title (max 8 words)
2. A one-line description (max 20 words)
3. Target audience (max 15 words)
4. The core problem it solves (max 20 words)`;
    }

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
