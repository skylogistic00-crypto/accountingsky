import { corsHeaders } from "@shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const PICA_SECRET_KEY = Deno.env.get("PICA_SECRET_KEY");
    const PICA_OPENAI_CONNECTION_KEY = Deno.env.get("PICA_OPENAI_CONNECTION_KEY");

    if (!PICA_SECRET_KEY || !PICA_OPENAI_CONNECTION_KEY) {
      return new Response(
        JSON.stringify({
          connected: false,
          error: "Missing PICA credentials",
          message: "PICA_SECRET_KEY atau PICA_OPENAI_CONNECTION_KEY belum dikonfigurasi"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      );
    }

    const url = new URL("https://api.picaos.com/v1/passthrough/v1/batches");
    url.searchParams.append("limit", "1");

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "x-pica-secret": PICA_SECRET_KEY,
        "x-pica-connection-key": PICA_OPENAI_CONNECTION_KEY,
        "x-pica-action-id": "conn_mod_def::GDzgHyUm4yE::y5O23tXfQVe37XUK7aViNA"
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI connection check failed:", response.status, errorText);
      
      return new Response(
        JSON.stringify({
          connected: false,
          error: `Connection failed: ${response.status}`,
          message: "Koneksi ke OpenAI gagal. Periksa konfigurasi PICA.",
          details: errorText
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify({
        connected: true,
        message: "✅ Koneksi ke OpenAI berhasil!",
        batchCount: data.data?.length || 0,
        hasMore: data.has_more || false
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );

  } catch (error) {
    console.error("Error checking OpenAI connection:", error);
    
    return new Response(
      JSON.stringify({
        connected: false,
        error: error.message,
        message: "Terjadi kesalahan saat memeriksa koneksi OpenAI"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
