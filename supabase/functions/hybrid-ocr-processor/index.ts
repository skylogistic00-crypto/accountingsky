import { corsHeaders } from "@shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const { image_url, file_type, document_type_hint } = await req.json();

    if (!image_url) {
      throw new Error("image_url is required");
    }

    console.log(`Processing file with type: ${file_type}, hint: ${document_type_hint}`);
    console.log(`Image URL: ${image_url.substring(0, 100)}...`);

    let rawText = "";
    let ocrEngine = "";

    // Step 1: Detect file type and route to appropriate OCR engine
    const mimeType = (file_type || "image/jpeg").toLowerCase();
    
    console.log(`Detected MIME type: ${mimeType}`);
    
    // Check if it's a PDF
    const isPdf = mimeType === "application/pdf" || 
                  mimeType.includes("pdf") || 
                  image_url.toLowerCase().includes(".pdf");
    
    // Check if it's an image
    const isImage = mimeType.startsWith("image/") || 
                    ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/bmp"].includes(mimeType) ||
                    /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(image_url);

    console.log(`isPdf: ${isPdf}, isImage: ${isImage}`);

    if (isPdf) {
      // Use Tesseract OCR for PDF files
      ocrEngine = "tesseract";
      
      console.log("Using Tesseract OCR for PDF file");
      
      try {
        const ocrResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/supabase-functions-tesseract-ocr`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          },
          body: JSON.stringify({ pdf_url: image_url }),
        });

        if (!ocrResponse.ok) {
          const errorText = await ocrResponse.text();
          console.error("Tesseract OCR failed:", errorText);
          // Try Google Vision as fallback for PDF
          console.log("Falling back to Google Vision for PDF...");
          ocrEngine = "google_vision_fallback";
        } else {
          const ocrData = await ocrResponse.json();
          rawText = ocrData.text || "";
          console.log(`Tesseract returned ${rawText.length} characters`);
        }
      } catch (e) {
        console.error("Tesseract OCR error:", e);
        ocrEngine = "google_vision_fallback";
      }
    }
    
    if (isImage || ocrEngine === "google_vision_fallback" || (!rawText && !isPdf)) {
      // Use Google Vision OCR for image files or as fallback
      if (ocrEngine !== "google_vision_fallback") {
        ocrEngine = "google_vision";
      }
      
      console.log("Using Google Vision OCR");
      console.log("Image URL for OCR:", image_url);
      
      try {
        const ocrResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/supabase-functions-vision-google-ocr`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          },
          body: JSON.stringify({ 
            image_url: image_url,
            signedUrl: image_url  // Also pass as signedUrl for compatibility
          }),
        });

        console.log("Vision Google OCR response status:", ocrResponse.status);

        if (!ocrResponse.ok) {
          const errorText = await ocrResponse.text();
          console.error("Google Vision OCR failed:", errorText);
          
          // Try direct Google Vision API as last resort
          console.log("Falling back to direct Google Vision API...");
          rawText = await tryDirectGoogleVision(image_url);
          ocrEngine = "google_vision_direct";
        } else {
          const ocrData = await ocrResponse.json();
          console.log("Vision Google OCR response:", JSON.stringify(ocrData).substring(0, 500));
          rawText = ocrData.text || ocrData.extracted_text || "";
          console.log(`Google Vision returned ${rawText.length} characters`);
          
          if (!rawText && ocrData.error) {
            console.error("Vision Google OCR returned error:", ocrData.error);
            // Try direct Google Vision API
            rawText = await tryDirectGoogleVision(image_url);
            ocrEngine = "google_vision_direct";
          }
        }
      } catch (e) {
        console.error("Google Vision OCR error:", e);
        // Try direct Google Vision API
        rawText = await tryDirectGoogleVision(image_url);
        ocrEngine = "google_vision_direct";
      }
    }

    // If still no text, try direct Google Vision as absolute fallback
    if (!rawText || rawText.trim() === "") {
      console.log("No text from OCR engines, trying direct Google Vision API...");
      rawText = await tryDirectGoogleVision(image_url);
      ocrEngine = "google_vision_direct";
    }

    if (!rawText || rawText.trim() === "") {
      console.error("All OCR methods failed to extract text");
      return new Response(
        JSON.stringify({
          success: false,
          error: "OCR failed to extract any text from the document. Please ensure the image is clear and readable.",
          ocr_engine: ocrEngine || "none",
          jenis_dokumen: document_type_hint || "unknown",
          data: {},
          raw_text: "",
          clean_text: "",
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200, // Return 200 so frontend can handle gracefully
        }
      );
    }

    console.log(`OCR Engine: ${ocrEngine}, Raw text length: ${rawText.length}`);
    console.log(`Raw text preview: ${rawText.substring(0, 300)}...`);

    // Step 2: Use OpenAI directly for AI classification (Pica disabled)
    const openAiKey = Deno.env.get('OPEN_AI_KEY');

    let cleanText = rawText;
    let documentType = document_type_hint?.toUpperCase() || "UNKNOWN";
    let structuredData: Record<string, unknown> = {};

    // Special handling for KK documents - use dedicated KK Full Extractor
    const isKKDocument = document_type_hint?.toUpperCase() === "KK" || 
                         rawText.toUpperCase().includes("KARTU KELUARGA") ||
                         rawText.toUpperCase().includes("NOMOR KK");
    
    if (isKKDocument) {
      console.log("Detected KK document, using KK Full Extractor...");
      
      try {
        const kkResponse = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/supabase-functions-kk-full-extractor`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
            },
            body: JSON.stringify({ ocr_text: rawText }),
          }
        );

        if (kkResponse.ok) {
          const kkData = await kkResponse.json();
          if (kkData.success && kkData.data) {
            console.log("KK Full Extractor successful");
            return new Response(
              JSON.stringify({
                success: true,
                ocr_engine: ocrEngine + "_kk_extractor",
                jenis_dokumen: "KK",
                data: kkData.data,
                raw_text: rawText,
                clean_text: rawText,
              }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
              }
            );
          }
        }
        console.log("KK Full Extractor failed, falling back to generic extraction...");
      } catch (kkError) {
        console.error("KK Full Extractor error:", kkError);
      }
    }

    // Use OpenAI directly for AI classification
    if (openAiKey) {
      console.log("Using OpenAI directly for AI classification...");
      
      try {
        const extractResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{
              role: 'system',
              content: `Extract structured data from Indonesian documents. Return JSON with these fields based on document type:
              
KK: nomor_kk, nama_kepala_keluarga, alamat, rt_rw, kelurahan_desa, kecamatan, kabupaten_kota, provinsi, kode_pos
KTP: nik, nama, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, rt_rw, kelurahan_desa, kecamatan, agama, status_perkawinan, pekerjaan

Use null for missing fields. Dates in yyyy-MM-dd format.`
            }, {
              role: 'user',
              content: `Document type hint: ${document_type_hint || 'unknown'}\n\nOCR Text:\n${rawText}`
            }],
            temperature: 0,
            response_format: { type: "json_object" }
          }),
        });

        if (extractResponse.ok) {
          const extractData = await extractResponse.json();
          const content = extractData.choices?.[0]?.message?.content;
          if (content) {
            try {
              structuredData = JSON.parse(content);
              console.log(`Direct OpenAI extracted ${Object.keys(structuredData).length} fields`);
            } catch (e) {
              console.error("Failed to parse OpenAI response:", e);
            }
          }
        }
      } catch (openAiError) {
        console.error("Direct OpenAI error:", openAiError);
      }
    }

    // Final fallback: regex extraction for KK
    if (Object.keys(structuredData).length === 0 && (document_type_hint?.toUpperCase() === "KK" || documentType === "KK")) {
      console.log("Using regex fallback for KK extraction...");
      structuredData = extractKKWithRegex(rawText);
      documentType = "KK";
    }

    console.log("Extraction complete");
    console.log(`Final document type: ${documentType}`);
    console.log(`Final structured data keys: ${Object.keys(structuredData).join(", ")}`);

    // Return final output
    return new Response(
      JSON.stringify({
        success: true,
        ocr_engine: ocrEngine,
        jenis_dokumen: documentType,
        data: structuredData,
        raw_text: rawText,
        clean_text: cleanText,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Hybrid OCR Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error occurred",
        ocr_engine: "error",
        jenis_dokumen: "unknown",
        data: {},
        raw_text: "",
        clean_text: "",
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Return 200 so frontend can handle gracefully
      }
    );
  }
});

// Direct Google Vision API call
async function tryDirectGoogleVision(imageUrl: string): Promise<string> {
  const googleApiKey = Deno.env.get("GOOGLE_VISION_API_KEY");
  
  if (!googleApiKey) {
    console.log("Google Vision API key not found");
    return "";
  }

  try {
    console.log("Fetching image for Google Vision...");
    
    // Fetch the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.error(`Failed to fetch image: ${imageResponse.status}`);
      return "";
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = btoa(
      new Uint8Array(imageBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    console.log(`Image fetched, base64 length: ${base64Image.length}`);

    // Call Google Vision API
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${googleApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64Image },
              features: [
                { type: "DOCUMENT_TEXT_DETECTION", maxResults: 1 }
              ],
            },
          ],
        }),
      }
    );

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text();
      console.error("Google Vision API error:", errorText);
      return "";
    }

    const visionData = await visionResponse.json();
    const fullText = visionData.responses?.[0]?.fullTextAnnotation?.text || "";
    
    console.log(`Google Vision direct extracted ${fullText.length} characters`);
    return fullText;
  } catch (error) {
    console.error("Direct Google Vision error:", error);
    return "";
  }
}

// Regex fallback for KK extraction
function extractKKWithRegex(text: string): Record<string, string | null> {
  const data: Record<string, string | null> = {
    nomor_kk: null,
    nama_kepala_keluarga: null,
    alamat: null,
    rt_rw: null,
    kelurahan_desa: null,
    kecamatan: null,
    kabupaten_kota: null,
    provinsi: null,
    kode_pos: null,
  };

  // Extract nomor_kk (16 digits)
  const kkMatch = text.match(/(?:No\.?\s*(?:KK)?:?\s*)?(\d{16})/i);
  if (kkMatch) {
    data.nomor_kk = kkMatch[1];
  }

  // Extract RT/RW
  const rtRwMatch = text.match(/(?:RT\s*\/?\s*RW\s*:?\s*)?(\d{3})\s*\/\s*(\d{3})/i);
  if (rtRwMatch) {
    data.rt_rw = `${rtRwMatch[1]}/${rtRwMatch[2]}`;
  }

  // Extract kode pos (5 digits)
  const kodePosMatch = text.match(/\b(\d{5})\b/);
  if (kodePosMatch) {
    data.kode_pos = kodePosMatch[1];
  }

  // Common Jakarta areas
  const jakartaAreas = ["JAKARTA PUSAT", "JAKARTA SELATAN", "JAKARTA BARAT", "JAKARTA TIMUR", "JAKARTA UTARA"];
  for (const area of jakartaAreas) {
    if (text.toUpperCase().includes(area)) {
      data.kabupaten_kota = area;
      data.provinsi = "DKI JAKARTA";
      break;
    }
  }

  // Extract kelurahan/kecamatan patterns
  const kelurahanMatch = text.match(/(?:KEL(?:URAHAN)?\.?\s*:?\s*)([A-Z\s]+)/i);
  if (kelurahanMatch) {
    data.kelurahan_desa = kelurahanMatch[1].trim();
  }

  const kecamatanMatch = text.match(/(?:KEC(?:AMATAN)?\.?\s*:?\s*)([A-Z\s]+)/i);
  if (kecamatanMatch) {
    data.kecamatan = kecamatanMatch[1].trim();
  }

  // Try to extract nama kepala keluarga
  const namaMatch = text.match(/(?:Nama\s*Kepala\s*Keluarga\s*:?\s*)([A-Z\s]+)/i);
  if (namaMatch) {
    data.nama_kepala_keluarga = namaMatch[1].trim();
  }

  // Try to extract alamat
  const alamatMatch = text.match(/(?:Alamat\s*:?\s*)([^\n]+)/i);
  if (alamatMatch) {
    data.alamat = alamatMatch[1].trim();
  }

  return data;
}
