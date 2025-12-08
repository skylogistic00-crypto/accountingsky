import { corsHeaders } from "@shared/cors.ts";
import { createSupabaseClient } from "@shared/supabase-client.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      headers: corsHeaders, 
      status: 204 
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createSupabaseClient();

    const body = await req.json();
    const { action, data, id } = body;

    let result;

    if (action === "insert") {
      // Calculate totals
      const basicSalary = parseFloat(data.basic_salary) || 0;
      const allowances = parseFloat(data.allowances) || 0;
      const overtimePay = parseFloat(data.overtime_pay) || 0;
      const deductions = parseFloat(data.deductions) || 0;
      const tax = parseFloat(data.tax) || 0;
      const bpjsKesehatan = parseFloat(data.bpjs_kesehatan) || 0;
      const bpjsKetenagakerjaan = parseFloat(data.bpjs_ketenagakerjaan) || 0;

      const grossSalary = basicSalary + allowances + overtimePay;
      const totalDeductions = deductions + tax + bpjsKesehatan + bpjsKetenagakerjaan;
      const netSalary = grossSalary - totalDeductions;

      const { data: insertData, error } = await supabase
        .from("payroll")
        .insert({
          employee_id: data.employee_id,
          period_month: data.period_month,
          period_year: data.period_year,
          basic_salary: basicSalary,
          other_allowances: allowances > 0 ? { other: allowances } : null,
          overtime_hours: parseFloat(data.overtime_hours) || 0,
          overtime_pay: overtimePay,
          other_deductions: deductions > 0 ? { other: deductions } : null,
          tax_pph21: tax,
          bpjs_kesehatan_deduction: bpjsKesehatan,
          bpjs_ketenagakerjaan_deduction: bpjsKetenagakerjaan,
          gross_salary: grossSalary,
          total_deductions: totalDeductions,
          net_salary: netSalary,
          payment_status: data.status || "pending",
          notes: data.notes,
        })
        .select()
        .single();

      if (error) throw error;
      result = insertData;
    } else if (action === "update" && id) {
      // Calculate totals for update
      const basicSalary = parseFloat(data.basic_salary) || 0;
      const allowances = parseFloat(data.allowances) || 0;
      const overtimePay = parseFloat(data.overtime_pay) || 0;
      const deductions = parseFloat(data.deductions) || 0;
      const tax = parseFloat(data.tax) || 0;
      const bpjsKesehatan = parseFloat(data.bpjs_kesehatan) || 0;
      const bpjsKetenagakerjaan = parseFloat(data.bpjs_ketenagakerjaan) || 0;

      const grossSalary = basicSalary + allowances + overtimePay;
      const totalDeductions = deductions + tax + bpjsKesehatan + bpjsKetenagakerjaan;
      const netSalary = grossSalary - totalDeductions;

      const { data: updateData, error } = await supabase
        .from("payroll")
        .update({
          employee_id: data.employee_id,
          period_month: data.period_month,
          period_year: data.period_year,
          basic_salary: basicSalary,
          other_allowances: allowances > 0 ? { other: allowances } : null,
          overtime_hours: parseFloat(data.overtime_hours) || 0,
          overtime_pay: overtimePay,
          other_deductions: deductions > 0 ? { other: deductions } : null,
          tax_pph21: tax,
          bpjs_kesehatan_deduction: bpjsKesehatan,
          bpjs_ketenagakerjaan_deduction: bpjsKetenagakerjaan,
          gross_salary: grossSalary,
          total_deductions: totalDeductions,
          net_salary: netSalary,
          payment_status: data.status || "pending",
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
          payment_status: "processed",
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
          payment_status: "paid",
          payment_date: new Date().toISOString(),
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
