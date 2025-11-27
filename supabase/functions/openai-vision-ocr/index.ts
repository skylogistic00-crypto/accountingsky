import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import OpenAI from "https://deno.land/x/openai@v4.52.0/mod.ts";
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
  // --- CORS PRE-FLIGHT HANDLER ---
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

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    const openai = new OpenAI({ apiKey });

    const form = await req.formData();
    const file = form.get("file") as File;

    if (!file) {
      return new Response("File not found", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    );

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "input_file",
              file_id: base64,
              mime_type: file.type,
            },
            {
              type: "text",
              text: `
              Extract all shipment details from this NOA PDF in valid JSON.
              Required fields:
              bl_number, vessel, voyage, consignee, shipper,
              port_loading, port_discharge, container_no,
              hs_code, goods_description, gross_weight, cbm,
              arrival_date, charges.
            `,
            },
          ],
        },
      ],
    });

    const result = JSON.parse(response.choices[0].message.content);

    // Upload the original PDF to storage
    const buffer = new Uint8Array(arrayBuffer);
    const filePath = `noa/${crypto.randomUUID()}.pdf`;

    const upload = await supabase.storage
      .from("documents")
      .upload(filePath, buffer, {
        contentType: file.type,
      });

    const file_url =
      `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/documents/${filePath}`;

    // Save OCR result to database
    await supabase.from("noa_documents").insert({
      file_url,
      ...result,
      full_json: result,
    });

    return new Response(
      JSON.stringify({
        message: "OCR success",
        file_url,
        data: result,
      }),
      {
        status: 200,
        headers: jsonHeaders,
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: jsonHeaders,
      }
    );
  }
});
