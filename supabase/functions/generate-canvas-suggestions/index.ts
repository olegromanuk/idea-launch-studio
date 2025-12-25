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

    // Handle GTM section suggestions with structured output
    const gtmSections = ['audienceSegments', 'creatives', 'campaigns', 'contentPosts', 'adSets', 'launchPhases'];
    
    if (gtmSections.includes(section)) {
      const gtmPrompts: Record<string, { prompt: string; tool: any }> = {
        audienceSegments: {
          prompt: `Based on this product idea: "${productIdea.idea}" for audience "${productIdea.audience}" solving problem "${productIdea.problem}".
Generate 2-3 detailed audience segments with demographics and psychographics.`,
          tool: {
            type: 'function',
            function: {
              name: 'provide_audience_segments',
              description: 'Provide audience segments',
              parameters: {
                type: 'object',
                properties: {
                  segments: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string', description: 'Segment name (e.g., "Tech-Savvy Professionals")' },
                        description: { type: 'string', description: 'Brief description of this segment' },
                        ageRange: { type: 'string', enum: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'] },
                        gender: { type: 'string', enum: ['All', 'Male', 'Female'] },
                        location: { type: 'string', description: 'Geographic location' },
                        income: { type: 'string', description: 'Income range' },
                        occupation: { type: 'string', description: 'Job title or industry' },
                        interests: { type: 'array', items: { type: 'string' }, description: '3-5 interests' },
                        painPoints: { type: 'array', items: { type: 'string' }, description: '2-3 pain points' },
                        goals: { type: 'array', items: { type: 'string' }, description: '2-3 goals' },
                        behaviors: { type: 'array', items: { type: 'string' }, description: '2-3 behaviors' },
                        isPrimary: { type: 'boolean' }
                      },
                      required: ['name', 'description', 'ageRange', 'gender', 'location', 'interests', 'painPoints', 'goals']
                    }
                  }
                },
                required: ['segments']
              }
            }
          }
        },
        creatives: {
          prompt: `Based on this product idea: "${productIdea.idea}" for audience "${productIdea.audience}".
Generate 3-4 marketing creative ideas including ad copy, social media posts, and visual concepts.`,
          tool: {
            type: 'function',
            function: {
              name: 'provide_creatives',
              description: 'Provide marketing creatives',
              parameters: {
                type: 'object',
                properties: {
                  creatives: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string' },
                        type: { type: 'string', enum: ['ad', 'social', 'video', 'email', 'blog'] },
                        platform: { type: 'string', enum: ['facebook', 'instagram', 'linkedin', 'twitter', 'youtube', 'tiktok', 'email', 'blog'] },
                        headline: { type: 'string' },
                        body: { type: 'string' },
                        cta: { type: 'string' },
                        visualDescription: { type: 'string' }
                      },
                      required: ['title', 'type', 'platform', 'headline', 'body', 'cta']
                    }
                  }
                },
                required: ['creatives']
              }
            }
          }
        },
        campaigns: {
          prompt: `Based on this product idea: "${productIdea.idea}" for audience "${productIdea.audience}".
Generate 2-3 marketing campaign ideas with objectives, channels, and budgets.`,
          tool: {
            type: 'function',
            function: {
              name: 'provide_campaigns',
              description: 'Provide campaign plans',
              parameters: {
                type: 'object',
                properties: {
                  campaigns: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        objective: { type: 'string', enum: ['awareness', 'consideration', 'conversion', 'retention'] },
                        channel: { type: 'string', enum: ['social', 'search', 'email', 'content', 'influencer', 'paid'] },
                        budget: { type: 'number' },
                        startDate: { type: 'string' },
                        endDate: { type: 'string' },
                        kpis: { type: 'array', items: { type: 'string' } },
                        tactics: { type: 'array', items: { type: 'string' } }
                      },
                      required: ['name', 'objective', 'channel', 'budget', 'kpis', 'tactics']
                    }
                  }
                },
                required: ['campaigns']
              }
            }
          }
        },
        contentPosts: {
          prompt: `Based on this product idea: "${productIdea.idea}" for audience "${productIdea.audience}".
Generate 4-5 content post ideas for a content calendar across different platforms.`,
          tool: {
            type: 'function',
            function: {
              name: 'provide_content_posts',
              description: 'Provide content calendar posts',
              parameters: {
                type: 'object',
                properties: {
                  posts: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string' },
                        platform: { type: 'string', enum: ['instagram', 'twitter', 'linkedin', 'facebook', 'tiktok', 'youtube', 'blog'] },
                        content: { type: 'string' },
                        hashtags: { type: 'array', items: { type: 'string' } },
                        scheduledFor: { type: 'string' },
                        contentType: { type: 'string', enum: ['image', 'video', 'carousel', 'story', 'text'] }
                      },
                      required: ['title', 'platform', 'content', 'hashtags']
                    }
                  }
                },
                required: ['posts']
              }
            }
          }
        },
        adSets: {
          prompt: `Based on this product idea: "${productIdea.idea}" for audience "${productIdea.audience}".
Generate 2-3 ad set configurations with targeting and budget strategies.`,
          tool: {
            type: 'function',
            function: {
              name: 'provide_ad_sets',
              description: 'Provide ad set configurations',
              parameters: {
                type: 'object',
                properties: {
                  adSets: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        platform: { type: 'string', enum: ['facebook', 'instagram', 'google', 'linkedin', 'twitter', 'tiktok'] },
                        objective: { type: 'string', enum: ['awareness', 'traffic', 'engagement', 'leads', 'conversions'] },
                        dailyBudget: { type: 'number' },
                        bidStrategy: { type: 'string', enum: ['lowest_cost', 'cost_cap', 'bid_cap', 'target_cost'] },
                        targetingDescription: { type: 'string' },
                        placements: { type: 'array', items: { type: 'string' } }
                      },
                      required: ['name', 'platform', 'objective', 'dailyBudget', 'bidStrategy', 'targetingDescription']
                    }
                  }
                },
                required: ['adSets']
              }
            }
          }
        },
        launchPhases: {
          prompt: `Based on this product idea: "${productIdea.idea}".
Generate 3-4 launch phases with goals and key tasks for each phase.`,
          tool: {
            type: 'function',
            function: {
              name: 'provide_launch_phases',
              description: 'Provide launch strategy phases',
              parameters: {
                type: 'object',
                properties: {
                  phases: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        duration: { type: 'string' },
                        goals: { type: 'array', items: { type: 'string' } },
                        tasks: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              title: { type: 'string' },
                              completed: { type: 'boolean' }
                            },
                            required: ['title']
                          }
                        }
                      },
                      required: ['name', 'duration', 'goals', 'tasks']
                    }
                  }
                },
                required: ['phases']
              }
            }
          }
        }
      };

      const gtmConfig = gtmPrompts[section];
      console.log(`Generating suggestions for GTM section: ${section}`);

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'You are an expert marketing strategist helping create comprehensive go-to-market plans.' },
            { role: 'user', content: gtmConfig.prompt }
          ],
          tools: [gtmConfig.tool],
          tool_choice: { type: 'function', function: { name: gtmConfig.tool.function.name } }
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
      console.log('AI Response for GTM:', JSON.stringify(aiData));
      
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        const result = JSON.parse(toolCall.function.arguments);
        return new Response(
          JSON.stringify({ suggestions: result, section }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Handle scope section suggestions with structured output
    const scopeSections = ['userStories', 'featureScope', 'taskBreakdown', 'technicalSolution', 'risksConstraints', 'timeline'];
    
    if (scopeSections.includes(section)) {
      const scopePrompts: Record<string, { prompt: string; tool: any }> = {
        userStories: {
          prompt: `Based on this product idea: "${productIdea.idea}" for audience "${productIdea.audience}" solving problem "${productIdea.problem}".
Generate 4-5 user stories in the format: As a [persona], I want to [action], so that [benefit].
Each story should have a priority (high, medium, or low).`,
          tool: {
            type: 'function',
            function: {
              name: 'provide_user_stories',
              description: 'Provide user stories',
              parameters: {
                type: 'object',
                properties: {
                  stories: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        persona: { type: 'string', description: 'The user persona (e.g., busy professional, first-time user)' },
                        action: { type: 'string', description: 'What they want to do' },
                        benefit: { type: 'string', description: 'The benefit they get' },
                        priority: { type: 'string', enum: ['high', 'medium', 'low'] }
                      },
                      required: ['persona', 'action', 'benefit', 'priority']
                    }
                  }
                },
                required: ['stories']
              }
            }
          }
        },
        featureScope: {
          prompt: `Based on this product idea: "${productIdea.idea}" for audience "${productIdea.audience}".
Generate 5-7 features categorized as MVP (must-have), Future (nice-to-have later), or Nice-to-have (optional).
Include effort estimate for each (low, medium, high).`,
          tool: {
            type: 'function',
            function: {
              name: 'provide_features',
              description: 'Provide feature scope',
              parameters: {
                type: 'object',
                properties: {
                  features: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        description: { type: 'string' },
                        category: { type: 'string', enum: ['mvp', 'future', 'nice-to-have'] },
                        effort: { type: 'string', enum: ['low', 'medium', 'high'] }
                      },
                      required: ['name', 'description', 'category', 'effort']
                    }
                  }
                },
                required: ['features']
              }
            }
          }
        },
        taskBreakdown: {
          prompt: `Based on this product idea: "${productIdea.idea}".
Create 3 milestones with 2-4 tasks each. Include status and due dates.`,
          tool: {
            type: 'function',
            function: {
              name: 'provide_milestones',
              description: 'Provide milestones and tasks',
              parameters: {
                type: 'object',
                properties: {
                  milestones: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        tasks: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              name: { type: 'string' },
                              status: { type: 'string', enum: ['todo', 'in-progress', 'done'] }
                            },
                            required: ['name', 'status']
                          }
                        }
                      },
                      required: ['name', 'tasks']
                    }
                  }
                },
                required: ['milestones']
              }
            }
          }
        },
        timeline: {
          prompt: `Based on this product idea: "${productIdea.idea}".
Create a 4-phase timeline with duration in weeks for each phase.`,
          tool: {
            type: 'function',
            function: {
              name: 'provide_timeline',
              description: 'Provide timeline phases',
              parameters: {
                type: 'object',
                properties: {
                  phases: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        duration: { type: 'number', description: 'Duration in weeks' },
                        color: { type: 'string', enum: ['violet', 'blue', 'green', 'amber'] }
                      },
                      required: ['name', 'duration', 'color']
                    }
                  }
                },
                required: ['phases']
              }
            }
          }
        },
        risksConstraints: {
          prompt: `Based on this product idea: "${productIdea.idea}".
Identify 4-5 risks and constraints with impact, likelihood, and mitigation strategies.`,
          tool: {
            type: 'function',
            function: {
              name: 'provide_risks',
              description: 'Provide risks and constraints',
              parameters: {
                type: 'object',
                properties: {
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        type: { type: 'string', enum: ['risk', 'constraint'] },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        impact: { type: 'string', enum: ['high', 'medium', 'low'] },
                        likelihood: { type: 'string', enum: ['high', 'medium', 'low'] },
                        mitigation: { type: 'string' }
                      },
                      required: ['type', 'title', 'description', 'impact', 'likelihood', 'mitigation']
                    }
                  }
                },
                required: ['items']
              }
            }
          }
        },
        technicalSolution: {
          prompt: `Based on this product idea: "${productIdea.idea}".
Provide a technical architecture overview including frontend, backend, database, and key integrations.`,
          tool: {
            type: 'function',
            function: {
              name: 'provide_technical',
              description: 'Provide technical solution',
              parameters: {
                type: 'object',
                properties: {
                  solution: { type: 'string', description: 'Markdown formatted technical solution' }
                },
                required: ['solution']
              }
            }
          }
        }
      };

      const scopeConfig = scopePrompts[section];
      console.log(`Generating structured suggestions for scope section: ${section}`);

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'You are an expert product strategist helping create structured project documentation.' },
            { role: 'user', content: scopeConfig.prompt }
          ],
          tools: [scopeConfig.tool],
          tool_choice: { type: 'function', function: { name: scopeConfig.tool.function.name } }
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
      console.log('AI Response for scope:', JSON.stringify(aiData));
      
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        const result = JSON.parse(toolCall.function.arguments);
        return new Response(
          JSON.stringify({ suggestions: result, section }),
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
