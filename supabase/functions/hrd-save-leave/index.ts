import { corsHeaders } from "@shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_PROJECT_ID = SUPABASE_URL?.match(
      /https:\/\/([^.]+)\.supabase\.co/
    )?.[1];
    const PICA_SECRET_KEY = Deno.env.get("PICA_SECRET_KEY");
    const PICA_SUPABASE_CONNECTION_KEY = Deno.env.get(
      "PICA_SUPABASE_CONNECTION_KEY"
    );

    if (!SUPABASE_PROJECT_ID || !PICA_SECRET_KEY || !PICA_SUPABASE_CONNECTION_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing configuration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { action, data, id } = body;

    const sanitize = (val: string | null | undefined): string => {
      if (val === null || val === undefined || val === "") return "NULL";
      return `'${String(val).replace(/'/g, "''")}'`;
    };

    const sanitizeNumber = (val: string | number | null | undefined): string => {
      if (val === null || val === undefined || val === "") return "NULL";
      const num = typeof val === "string" ? parseFloat(val) : val;
      return isNaN(num) ? "NULL" : String(num);
    };

    let sqlQuery: string;

    if (action === "insert") {
      sqlQuery = `
        INSERT INTO leave_requests (
          employee_id, leave_type, start_date, end_date, total_days, reason, status, approved_by, approved_at, notes
        ) VALUES (
          ${sanitize(data.employee_id)},
          ${sanitize(data.leave_type)},
          ${sanitize(data.start_date)},
          ${sanitize(data.end_date)},
          ${sanitizeNumber(data.total_days)},
          ${sanitize(data.reason)},
          ${sanitize(data.status || "pending")},
          ${data.approved_by ? sanitize(data.approved_by) : "NULL"},
          ${data.approved_at ? sanitize(data.approved_at) : "NULL"},
          ${sanitize(data.notes)}
        ) RETURNING id;
      `;
    } else if (action === "update" && id) {
      sqlQuery = `
        UPDATE leave_requests SET
          employee_id = ${sanitize(data.employee_id)},
          leave_type = ${sanitize(data.leave_type)},
          start_date = ${sanitize(data.start_date)},
          end_date = ${sanitize(data.end_date)},
          total_days = ${sanitizeNumber(data.total_days)},
          reason = ${sanitize(data.reason)},
          status = ${sanitize(data.status)},
          approved_by = ${data.approved_by ? sanitize(data.approved_by) : "NULL"},
          approved_at = ${data.approved_at ? sanitize(data.approved_at) : "NULL"},
          notes = ${sanitize(data.notes)},
          updated_at = NOW()
        WHERE id = ${sanitize(id)}
        RETURNING id;
      `;
    } else if (action === "approve" && id) {
      sqlQuery = `
        UPDATE leave_requests SET
          status = 'approved',
          approved_by = ${sanitize(data.approved_by)},
          approved_at = NOW(),
          updated_at = NOW()
        WHERE id = ${sanitize(id)}
        RETURNING id;
      `;
    } else if (action === "reject" && id) {
      sqlQuery = `
        UPDATE leave_requests SET
          status = 'rejected',
          approved_by = ${sanitize(data.approved_by)},
          approved_at = NOW(),
          notes = ${sanitize(data.notes)},
          updated_at = NOW()
        WHERE id = ${sanitize(id)}
        RETURNING id;
      `;
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch(
      `https://api.picaos.com/v1/passthrough/v1/projects/${SUPABASE_PROJECT_ID}/database/query`,
      {
        method: "POST",
        headers: {
          "x-pica-secret": PICA_SECRET_KEY,
          "x-pica-connection-key": PICA_SUPABASE_CONNECTION_KEY,
          "x-pica-action-id": "conn_mod_def::GC40SckOddE::NFFu2-49QLyGsPBdfweitg",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: sqlQuery }),
      }
    );

    const responseData = await response.text();

    if (response.status === 201 || response.ok) {
      return new Response(
        JSON.stringify({
          success: true,
          message: action === "insert" ? "Pengajuan cuti berhasil" : "Data cuti berhasil diupdate",
          data: responseData ? JSON.parse(responseData) : {},
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Database operation failed", details: responseData }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error", message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
