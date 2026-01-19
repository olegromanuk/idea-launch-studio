import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DomainAvailabilityResponse {
  available: boolean;
  domain: string;
  price?: number;
  currency?: string;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain } = await req.json();

    if (!domain) {
      return new Response(
        JSON.stringify({ error: 'Domain is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean and validate domain
    const cleanDomain = domain.toLowerCase().trim().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    
    if (!cleanDomain || !cleanDomain.includes('.')) {
      return new Response(
        JSON.stringify({ error: 'Invalid domain format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Checking domain availability for: ${cleanDomain}`);

    const apiKey = Deno.env.get('GODADDY_API_KEY');
    const apiSecret = Deno.env.get('GODADDY_API_SECRET');

    if (!apiKey || !apiSecret) {
      console.error('GoDaddy API credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Domain checking service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GoDaddy API endpoint for domain availability
    const godaddyUrl = `https://api.godaddy.com/v1/domains/available?domain=${encodeURIComponent(cleanDomain)}`;
    
    console.log(`Making request to GoDaddy API...`);

    const response = await fetch(godaddyUrl, {
      method: 'GET',
      headers: {
        'Authorization': `sso-key ${apiKey}:${apiSecret}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GoDaddy API error: ${response.status} - ${errorText}`);
      
      // Handle specific GoDaddy error codes
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: 'Invalid API credentials' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Too many requests, please try again later' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Failed to check domain availability' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log(`GoDaddy response:`, JSON.stringify(data));

    const result: DomainAvailabilityResponse = {
      available: data.available === true,
      domain: cleanDomain,
      price: data.price ? data.price / 1000000 : undefined, // GoDaddy returns price in micros
      currency: data.currency || 'USD',
    };

    console.log(`Domain ${cleanDomain} is ${result.available ? 'available' : 'not available'}`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error checking domain availability:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
