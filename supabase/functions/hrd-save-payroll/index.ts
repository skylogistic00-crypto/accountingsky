import { corsHeaders } from "@shared/cors.ts";
import { createClient } from "@shared/supabase-client.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(authHeader);

    const body = await req.json();
    const { action, data, id } = body;

    let result;

    if (action === "insert") {
      const { data: insertData, error } = await supabase
        .from("payroll")
        .insert({
          employee_id: data.employee_id,
          period_month: data.period_month,
          period_year: data.period_year,
          basic_salary: data.basic_salary,
          allowances: data.allowances,
          overtime_pay: data.overtime_pay,
          deductions: data.deductions,
          tax: data.tax,
          bpjs_kesehatan: data.bpjs_kesehatan,
          bpjs_ketenagakerjaan: data.bpjs_ketenagakerjaan,
          net_salary: data.net_salary,
          status: data.status || "draft",
          paid_at: data.paid_at || null,
          notes: data.notes,
        })
        .select()
        .single();

      if (error) throw error;
      result = insertData;
    } else if (action === "update" && id) {
      const { data: updateData, error } = await supabase
        .from("payroll")
        .update({
          employee_id: data.employee_id,
          period_month: data.period_month,
          period_year: data.period_year,
          basic_salary: data.basic_salary,
          allowances: data.allowances,
          overtime_pay: data.overtime_pay,
          deductions: data.deductions,
          tax: data.tax,
          bpjs_kesehatan: data.bpjs_kesehatan,
          bpjs_ketenagakerjaan: data.bpjs_ketenagakerjaan,
          net_salary: data.net_salary,
          status: data.status,
          paid_at: data.paid_at || null,
          notes: data.notes,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      result = updateData;
    } else if (action === "process" && id) {
      const { data: processData, error } = await supabase
        .from("payroll")
        .update({
          status: "processed",
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      result = processData;
    } else if (action === "pay" && id) {
      const { data: payData, error } = await supabase
        .from("payroll")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      result = payData;
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: action === "insert" ? "Payroll berhasil dibuat" : "Payroll berhasil diupdate",
        data: result,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error", message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
