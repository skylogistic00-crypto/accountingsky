import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "@shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY")!;
const googleVisionApiKey = Deno.env.get("GOOGLE_VISION_API_KEY");

const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!googleVisionApiKey) {
      throw new Error("GOOGLE_VISION_API_KEY is not configured");
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      throw new Error("No file provided");
    }

    // Upload file to Supabase Storage
    const fileName = `ocr-${Date.now()}-${file.name}`;
    const fileBuffer = await file.arrayBuffer();
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("documents")
      .getPublicUrl(fileName);

    const fileUrl = urlData.publicUrl;

    // Convert file to base64
    const base64Content = btoa(
      String.fromCharCode(...new Uint8Array(fileBuffer))
    );

    // Call Google Vision API
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${googleVisionApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Content,
              },
              features: [
                {
                  type: "DOCUMENT_TEXT_DETECTION",
                  maxResults: 1,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text();
      throw new Error(`Google Vision API error: ${errorText}`);
    }

    const visionData = await visionResponse.json();
    
    // Extract text from response
    const extractedText =
      visionData.responses?.[0]?.fullTextAnnotation?.text || "";

    // Save to database
    const { data: dbData, error: dbError } = await supabase
      .from("ocr_results")
      .insert([
        {
          file_url: fileUrl,
          extracted_text: extractedText,
          json_data: visionData,
          ocr_data: visionData,
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        file_url: fileUrl,
        extracted_text: extractedText,
        json_data: visionData,
        db_record: dbData,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("OCR Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
