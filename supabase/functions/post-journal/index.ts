import { corsHeaders } from "@shared/cors.ts";

const PICA_SECRET = Deno.env.get("PICA_SECRET_KEY")!;
const PICA_CONNECTION_KEY = Deno.env.get("PICA_SUPABASE_CONNECTION_KEY")!;
const SUPABASE_PROJECT_REF = Deno.env.get("SUPABASE_PROJECT_ID")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const body = await req.json();
    const { disbursement_id } = body;

    if (!disbursement_id) {
      return new Response(
        JSON.stringify({ success: false, error: "disbursement_id is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Call Supabase RPC via Pica passthrough
    const url = `https://api.picaos.com/v1/passthrough/projects/${SUPABASE_PROJECT_REF}/functions/rpc`;
    
    const rpcBody = {
      function: "post_cash_disbursement_to_journal",
      parameters: {
        p_disbursement_id: disbursement_id
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-pica-secret": PICA_SECRET,
        "x-pica-connection-key": PICA_CONNECTION_KEY,
        "x-pica-action-id": "conn_mod_def::GC40T84CyNM::ee8XBvT6TRua_1upUL_H5Q",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(rpcBody)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("RPC Error:", data);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: data.error?.message || data.message || "Failed to post journal" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: response.status }
      );
    }

    // Check RPC result
    const result = data.result || data;
    if (result && !result.success) {
      return new Response(
        JSON.stringify({ success: false, error: result.error }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Jurnal berhasil diposting",
        data: result
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Post journal error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
