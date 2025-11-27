import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, content-type, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const form = await req.formData();
    const file = form.get("file") as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { status: 400, headers: jsonHeaders }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    const OPENAI_API_KEY = Deno.env.get("OPEN_AI_KEY");
    
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing OPENAI_API_KEY" }),
        { status: 500, headers: jsonHeaders }
      );
    }

    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${file.type};base64,${base64}`,
                  },
                },
                {
                  type: "text",
                  text: "Extract all text and data from this document. Return the extracted information in a structured JSON format with a 'data' field containing the extracted content.",
                },
              ],
            },
          ],
          max_tokens: 1000,
        }),
      }
    );

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
    }

    const openaiData = await openaiResponse.json();
    const extractedContent = openaiData.choices[0].message.content;
    
    // Try to parse as JSON, if it fails, use as plain text
    let result;
    try {
      result = JSON.parse(extractedContent);
    } catch {
      result = { text: extractedContent };
    }

    const buffer = new Uint8Array(arrayBuffer);
    const filePath = `ocr/${crypto.randomUUID()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, buffer, { contentType: file.type });

    if (uploadError) {
      console.warn(`Storage upload error: ${uploadError.message}`);
    }

    const file_url = uploadError 
      ? null 
      : `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/documents/${filePath}`;

    return new Response(
      JSON.stringify({
        message: "OCR success",
        data: result,
        file_url,
        confidence: 95,
      }),
      {
        status: 200,
        headers: jsonHeaders,
      }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: jsonHeaders,
      }
    );
  }
});
