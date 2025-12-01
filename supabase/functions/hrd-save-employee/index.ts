import { corsHeaders } from "@shared/cors.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight
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
        JSON.stringify({
          error: "Missing configuration",
          details: {
            ProjectID: !!SUPABASE_PROJECT_ID,
            SecretKey: !!PICA_SECRET_KEY,
            ConnectionKey: !!PICA_SUPABASE_CONNECTION_KEY,
          },
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { action, data, id } = body;

    // Sanitize string values to prevent SQL injection
    const sanitize = (val: string | null | undefined): string => {
      if (val === null || val === undefined || val === "") return "NULL";
      return `'${String(val).replace(/'/g, "''")}'`;
    };

    const sanitizeNumber = (val: string | number | null | undefined): string => {
      if (val === null || val === undefined || val === "") return "NULL";
      const num = typeof val === "string" ? parseFloat(val) : val;
      return isNaN(num) ? "NULL" : String(num);
    };

    // Sanitize UUID fields - returns NULL for empty strings or wraps valid UUIDs in quotes
    const sanitizeUUID = (val: string | null | undefined): string => {
      if (val === null || val === undefined || val === "" || val.trim() === "") return "NULL";
      // Basic UUID validation (8-4-4-4-12 format)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(val.trim())) {
        return `'${val.trim()}'`;
      }
      return "NULL";
    };

    // Sanitize date fields - returns NULL for empty strings or null values
    const sanitizeDate = (dateValue: string | null | undefined): string => {
      if (dateValue === null || dateValue === undefined) {
        return "NULL";
      }
      if (typeof dateValue === "string" && dateValue.trim() === "") {
        return "NULL";
      }
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dateValue)) {
        return "NULL";
      }
      return `'${dateValue}'`;
    };

    let sqlQuery: string;

    if (action === "insert") {
      sqlQuery = `
        INSERT INTO employees (
          full_name, email, phone, birth_date, birth_place, gender, religion, marital_status,
          address, city, province, postal_code, ktp_number, npwp_number, bpjs_kesehatan, bpjs_ketenagakerjaan,
          department_id, position_id, employment_status, join_date, basic_salary,
          bank_name, bank_account_number, bank_account_holder,
          emergency_contact_name, emergency_contact_relation, emergency_contact_phone, emergency_contact_address,
          last_education, institution_name, major, graduation_year, status, notes
        ) VALUES (
          ${sanitize(data.full_name)},
          ${sanitize(data.email)},
          ${sanitize(data.phone)},
          ${sanitizeDate(data.birth_date)},
          ${sanitize(data.birth_place)},
          ${sanitize(data.gender)},
          ${sanitize(data.religion)},
          ${sanitize(data.marital_status)},
          ${sanitize(data.address)},
          ${sanitize(data.city)},
          ${sanitize(data.province)},
          ${sanitize(data.postal_code)},
          ${sanitize(data.ktp_number)},
          ${sanitize(data.npwp_number)},
          ${sanitize(data.bpjs_kesehatan)},
          ${sanitize(data.bpjs_ketenagakerjaan)},
          ${sanitizeUUID(data.department_id)},
          ${sanitizeUUID(data.position_id)},
          ${sanitize(data.employment_status)},
          ${sanitizeDate(data.join_date)},
          ${sanitizeNumber(data.basic_salary)},
          ${sanitize(data.bank_name)},
          ${sanitize(data.bank_account_number)},
          ${sanitize(data.bank_account_holder)},
          ${sanitize(data.emergency_contact_name)},
          ${sanitize(data.emergency_contact_relation)},
          ${sanitize(data.emergency_contact_phone)},
          ${sanitize(data.emergency_contact_address)},
          ${sanitize(data.last_education)},
          ${sanitize(data.institution_name)},
          ${sanitize(data.major)},
          ${sanitizeNumber(data.graduation_year)},
          ${sanitize(data.status || "active")},
          ${sanitize(data.notes)}
        ) RETURNING id, employee_number;
      `;
    } else if (action === "update" && id) {
      sqlQuery = `
        UPDATE employees SET
          full_name = ${sanitize(data.full_name)},
          email = ${sanitize(data.email)},
          phone = ${sanitize(data.phone)},
          birth_date = ${sanitizeDate(data.birth_date)},
          birth_place = ${sanitize(data.birth_place)},
          gender = ${sanitize(data.gender)},
          religion = ${sanitize(data.religion)},
          marital_status = ${sanitize(data.marital_status)},
          address = ${sanitize(data.address)},
          city = ${sanitize(data.city)},
          province = ${sanitize(data.province)},
          postal_code = ${sanitize(data.postal_code)},
          ktp_number = ${sanitize(data.ktp_number)},
          npwp_number = ${sanitize(data.npwp_number)},
          bpjs_kesehatan = ${sanitize(data.bpjs_kesehatan)},
          bpjs_ketenagakerjaan = ${sanitize(data.bpjs_ketenagakerjaan)},
          department_id = ${sanitizeUUID(data.department_id)},
          position_id = ${sanitizeUUID(data.position_id)},
          employment_status = ${sanitize(data.employment_status)},
          join_date = ${sanitizeDate(data.join_date)},
          basic_salary = ${sanitizeNumber(data.basic_salary)},
          bank_name = ${sanitize(data.bank_name)},
          bank_account_number = ${sanitize(data.bank_account_number)},
          bank_account_holder = ${sanitize(data.bank_account_holder)},
          emergency_contact_name = ${sanitize(data.emergency_contact_name)},
          emergency_contact_relation = ${sanitize(data.emergency_contact_relation)},
          emergency_contact_phone = ${sanitize(data.emergency_contact_phone)},
          emergency_contact_address = ${sanitize(data.emergency_contact_address)},
          last_education = ${sanitize(data.last_education)},
          institution_name = ${sanitize(data.institution_name)},
          major = ${sanitize(data.major)},
          graduation_year = ${sanitizeNumber(data.graduation_year)},
          status = ${sanitize(data.status)},
          notes = ${sanitize(data.notes)},
          updated_at = NOW()
        WHERE id = ${sanitize(id)}
        RETURNING id, employee_number;
      `;
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid action. Use 'insert' or 'update'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Pica Passthrough API
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
          message: action === "insert" ? "Karyawan berhasil ditambahkan" : "Karyawan berhasil diupdate",
          data: responseData ? JSON.parse(responseData) : {},
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({
          error: "Database operation failed",
          details: responseData,
        }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
