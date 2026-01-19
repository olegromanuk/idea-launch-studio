import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DomainResult {
  available: boolean;
  domain: string;
  price?: number;
  currency?: string;
}

interface DomainAvailabilityResponse {
  available: boolean;
  domain: string;
  price?: number;
  currency?: string;
  error?: string;
  alternatives?: DomainResult[];
}

const ALTERNATIVE_TLDS = ['.net', '.io', '.co', '.org', '.app', '.dev', '.tech', '.ai'];

async function checkSingleDomain(domain: string, apiKey: string, apiSecret: string): Promise<DomainResult | null> {
  try {
    const response = await fetch(`https://api.godaddy.com/v1/domains/available?domain=${encodeURIComponent(domain)}`, {
      method: 'GET',
      headers: {
        'Authorization': `sso-key ${apiKey}:${apiSecret}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Failed to check ${domain}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return {
      available: data.available === true,
      domain: domain,
      price: data.price ? data.price / 1000000 : undefined,
      currency: data.currency || 'USD',
    };
  } catch (error) {
    console.error(`Error checking ${domain}:`, error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain, checkAlternatives = true } = await req.json();

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

    // Check the primary domain
    const primaryResult = await checkSingleDomain(cleanDomain, apiKey, apiSecret);

    if (!primaryResult) {
      return new Response(
        JSON.stringify({ error: 'Failed to check domain availability' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result: DomainAvailabilityResponse = {
      available: primaryResult.available,
      domain: primaryResult.domain,
      price: primaryResult.price,
      currency: primaryResult.currency,
    };

    // If domain is not available and checkAlternatives is true, check alternative TLDs
    if (!primaryResult.available && checkAlternatives) {
      console.log('Primary domain not available, checking alternatives...');
      
      // Extract base name (without TLD)
      const parts = cleanDomain.split('.');
      const baseName = parts.slice(0, -1).join('.');
      const currentTld = '.' + parts[parts.length - 1];
      
      // Filter out the current TLD from alternatives
      const tldsToCheck = ALTERNATIVE_TLDS.filter(tld => tld !== currentTld);
      
      // Check alternatives in parallel (limit to 6 for performance)
      const alternativeChecks = tldsToCheck.slice(0, 6).map(tld => 
        checkSingleDomain(`${baseName}${tld}`, apiKey, apiSecret)
      );
      
      const alternativeResults = await Promise.all(alternativeChecks);
      
      // Filter to only available alternatives
      const availableAlternatives = alternativeResults
        .filter((r): r is DomainResult => r !== null && r.available)
        .sort((a, b) => (a.price || 0) - (b.price || 0)); // Sort by price
      
      if (availableAlternatives.length > 0) {
        result.alternatives = availableAlternatives;
        console.log(`Found ${availableAlternatives.length} available alternatives`);
      }
    }

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
