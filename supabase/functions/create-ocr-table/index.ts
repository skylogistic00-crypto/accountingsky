import { corsHeaders } from "@shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200 
    });
  }

  try {
    const PICA_SECRET_KEY = Deno.env.get('PICA_SECRET_KEY');
    const PICA_SUPABASE_CONNECTION_KEY = Deno.env.get('PICA_SUPABASE_CONNECTION_KEY');
    const SUPABASE_PROJECT_ID = Deno.env.get('SUPABASE_PROJECT_ID') || 'gfmokpjnnnbnjlqxhoux';

    if (!PICA_SECRET_KEY || !PICA_SUPABASE_CONNECTION_KEY || !SUPABASE_PROJECT_ID) {
      throw new Error('Missing required environment variables');
    }

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ocr_results (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        file_name TEXT NOT NULL,
        extracted_text TEXT NOT NULL,
        confidence NUMERIC(5,2) DEFAULT 0,
        image_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        created_by UUID REFERENCES auth.users(id)
      );

      ALTER TABLE ocr_results ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Users can view all OCR results" ON ocr_results;
      CREATE POLICY "Users can view all OCR results" ON ocr_results
        FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Users can insert OCR results" ON ocr_results;
      CREATE POLICY "Users can insert OCR results" ON ocr_results
        FOR INSERT WITH CHECK (true);

      DROP POLICY IF EXISTS "Users can delete their own OCR results" ON ocr_results;
      CREATE POLICY "Users can delete their own OCR results" ON ocr_results
        FOR DELETE USING (true);

      CREATE INDEX IF NOT EXISTS idx_ocr_results_created_at ON ocr_results(created_at DESC);
    `;

    const response = await fetch(
      `https://api.picaos.com/v1/passthrough/v1/projects/${SUPABASE_PROJECT_ID}/database/query`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-pica-secret': PICA_SECRET_KEY,
          'x-pica-connection-key': PICA_SUPABASE_CONNECTION_KEY,
          'x-pica-action-id': 'conn_mod_def::GC40SckOddE::NFFu2-49QLyGsPBdfweitg'
        },
        body: JSON.stringify({
          query: createTableQuery
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create table: ${response.status} ${errorText}`);
    }

    const result = await response.json();

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OCR results table created successfully',
        data: result 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating OCR table:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
