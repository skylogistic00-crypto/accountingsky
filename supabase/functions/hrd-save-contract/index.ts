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
        INSERT INTO employee_contracts (
          employee_id, contract_number, contract_type, start_date, end_date, 
          salary, allowances, status, document_url, notes
        ) VALUES (
          ${sanitize(data.employee_id)},
          ${sanitize(data.contract_number)},
          ${sanitize(data.contract_type)},
          ${sanitize(data.start_date)},
          ${data.end_date ? sanitize(data.end_date) : "NULL"},
          ${sanitizeNumber(data.salary)},
          ${sanitizeNumber(data.allowances)},
          ${sanitize(data.status || "active")},
          ${sanitize(data.document_url)},
          ${sanitize(data.notes)}
        ) RETURNING id;
      `;
    } else if (action === "update" && id) {
      sqlQuery = `
        UPDATE employee_contracts SET
          employee_id = ${sanitize(data.employee_id)},
          contract_number = ${sanitize(data.contract_number)},
          contract_type = ${sanitize(data.contract_type)},
          start_date = ${sanitize(data.start_date)},
          end_date = ${data.end_date ? sanitize(data.end_date) : "NULL"},
          salary = ${sanitizeNumber(data.salary)},
          allowances = ${sanitizeNumber(data.allowances)},
          status = ${sanitize(data.status)},
          document_url = ${sanitize(data.document_url)},
          notes = ${sanitize(data.notes)},
          updated_at = NOW()
        WHERE id = ${sanitize(id)}
        RETURNING id;
      `;
    } else if (action === "terminate" && id) {
      sqlQuery = `
        UPDATE employee_contracts SET
          status = 'terminated',
          end_date = NOW(),
          notes = ${sanitize(data.notes)},
          updated_at = NOW()
        WHERE id = ${sanitize(id)}
        RETURNING id;
      `;
    } else if (action === "renew" && id) {
      // First terminate old contract, then create new one
      sqlQuery = `
        WITH terminated AS (
          UPDATE employee_contracts SET
            status = 'expired',
            updated_at = NOW()
          WHERE id = ${sanitize(id)}
          RETURNING employee_id
        )
        INSERT INTO employee_contracts (
          employee_id, contract_number, contract_type, start_date, end_date, 
          salary, allowances, status, notes
        ) 
        SELECT 
          employee_id,
          ${sanitize(data.contract_number)},
          ${sanitize(data.contract_type)},
          ${sanitize(data.start_date)},
          ${data.end_date ? sanitize(data.end_date) : "NULL"},
          ${sanitizeNumber(data.salary)},
          ${sanitizeNumber(data.allowances)},
          'active',
          'Perpanjangan kontrak'
        FROM terminated
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
          message: action === "insert" ? "Kontrak berhasil dibuat" : 
                   action === "renew" ? "Kontrak berhasil diperpanjang" : "Kontrak berhasil diupdate",
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
