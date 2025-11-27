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
        INSERT INTO payroll (
          employee_id, period_month, period_year, basic_salary, allowances, overtime_pay,
          deductions, tax, bpjs_kesehatan, bpjs_ketenagakerjaan, net_salary, status, paid_at, notes
        ) VALUES (
          ${sanitize(data.employee_id)},
          ${sanitizeNumber(data.period_month)},
          ${sanitizeNumber(data.period_year)},
          ${sanitizeNumber(data.basic_salary)},
          ${sanitizeNumber(data.allowances)},
          ${sanitizeNumber(data.overtime_pay)},
          ${sanitizeNumber(data.deductions)},
          ${sanitizeNumber(data.tax)},
          ${sanitizeNumber(data.bpjs_kesehatan)},
          ${sanitizeNumber(data.bpjs_ketenagakerjaan)},
          ${sanitizeNumber(data.net_salary)},
          ${sanitize(data.status || "draft")},
          ${data.paid_at ? sanitize(data.paid_at) : "NULL"},
          ${sanitize(data.notes)}
        ) RETURNING id;
      `;
    } else if (action === "update" && id) {
      sqlQuery = `
        UPDATE payroll SET
          employee_id = ${sanitize(data.employee_id)},
          period_month = ${sanitizeNumber(data.period_month)},
          period_year = ${sanitizeNumber(data.period_year)},
          basic_salary = ${sanitizeNumber(data.basic_salary)},
          allowances = ${sanitizeNumber(data.allowances)},
          overtime_pay = ${sanitizeNumber(data.overtime_pay)},
          deductions = ${sanitizeNumber(data.deductions)},
          tax = ${sanitizeNumber(data.tax)},
          bpjs_kesehatan = ${sanitizeNumber(data.bpjs_kesehatan)},
          bpjs_ketenagakerjaan = ${sanitizeNumber(data.bpjs_ketenagakerjaan)},
          net_salary = ${sanitizeNumber(data.net_salary)},
          status = ${sanitize(data.status)},
          paid_at = ${data.paid_at ? sanitize(data.paid_at) : "NULL"},
          notes = ${sanitize(data.notes)},
          updated_at = NOW()
        WHERE id = ${sanitize(id)}
        RETURNING id;
      `;
    } else if (action === "process" && id) {
      sqlQuery = `
        UPDATE payroll SET
          status = 'processed',
          updated_at = NOW()
        WHERE id = ${sanitize(id)}
        RETURNING id;
      `;
    } else if (action === "pay" && id) {
      sqlQuery = `
        UPDATE payroll SET
          status = 'paid',
          paid_at = NOW(),
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
          message: action === "insert" ? "Payroll berhasil dibuat" : "Payroll berhasil diupdate",
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
