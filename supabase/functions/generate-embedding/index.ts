import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    const PICA_SECRET_KEY = Deno.env.get('PICA_SECRET_KEY');
    const PICA_OPENAI_CONNECTION_KEY = Deno.env.get('PICA_OPENAI_CONNECTION_KEY');
    
    if (!PICA_SECRET_KEY || !PICA_OPENAI_CONNECTION_KEY) {
      throw new Error('Pica credentials not configured');
    }

    const response = await fetch('https://api.picaos.com/v1/passthrough/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pica-secret': PICA_SECRET_KEY,
        'x-pica-connection-key': PICA_OPENAI_CONNECTION_KEY,
        'x-pica-action-id': 'conn_mod_def::GDzgi1QfvM4::4OjsWvZhRxmAVuLAuWgfVA',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Pica API error: ${error}`);
    }

    const data = await response.json();
    const embedding = data.data[0].embedding;

    return new Response(
      JSON.stringify({ embedding }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
