import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "@shared/cors.ts";
import { getAccountCOA, getAccountCOAByCode } from "@shared/coa-helper.ts";

interface CashDisbursementJournalRequest {
  disbursement_id?: string;
  date: string;
  amount: number;
  description: string;

  debit_account_id?: string;
  debit_account_code?: string;

  credit_account_id?: string;
  credit_account_code?: string;

  tax_amount?: number;
  tax_account_id?: string;
  tax_account_code?: string;
}

function isUUID(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // INIT SUPABASE SERVICE CLIENT
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    // AUTH CHECK
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) throw new Error("Unauthorized");

    // PARSE PAYLOAD
    const payload: CashDisbursementJournalRequest = await req.json();

    /*
    ------------------------------------------------------------
    1️⃣ RESOLVE DEBIT ACCOUNT
    ------------------------------------------------------------
    */
    let debitCOA = null;

    if (payload.debit_account_id) {
      if (isUUID(payload.debit_account_id)) {
        debitCOA = await getAccountCOA(supabaseClient, payload.debit_account_id);
      } else {
        debitCOA = await getAccountCOAByCode(
          supabaseClient,
          payload.debit_account_id
        );
      }
    } else if (payload.debit_account_code) {
      debitCOA = await getAccountCOAByCode(
        supabaseClient,
        payload.debit_account_code
      );
    }

    if (!debitCOA) throw new Error("Debit COA not found");

    /*
    ------------------------------------------------------------
    2️⃣ RESOLVE CREDIT ACCOUNT
    ------------------------------------------------------------
    */
    let creditCOA = null;

    if (payload.credit_account_id) {
      if (isUUID(payload.credit_account_id)) {
        creditCOA = await getAccountCOA(
          supabaseClient,
          payload.credit_account_id
        );
      } else {
        creditCOA = await getAccountCOAByCode(
          supabaseClient,
          payload.credit_account_id
        );
      }
    } else if (payload.credit_account_code) {
      creditCOA = await getAccountCOAByCode(
        supabaseClient,
        payload.credit_account_code
      );
    } else {
      // DEFAULT kas
      creditCOA = await getAccountCOAByCode(supabaseClient, "1-1001");
    }

    if (!creditCOA) throw new Error("Credit COA not found");

    /*
    ------------------------------------------------------------
    3️⃣ BUILD JOURNAL ENTRIES
    ------------------------------------------------------------
    */
    const journalEntries: any[] = [];

    const debitAmount = payload.tax_amount
      ? payload.amount - payload.tax_amount
      : payload.amount;

    // DEBIT EXPENSE
    journalEntries.push({
      account_id: debitCOA.id,
      account_code: debitCOA.account_code,
      account_name: debitCOA.account_name,
      debit: debitAmount,
      credit: 0,
      description: payload.description,
    });

    // TAX ENTRY (PPN Masukan)
    if (payload.tax_amount && payload.tax_amount > 0) {
      let taxCOA = null;

      if (payload.tax_account_id) {
        if (isUUID(payload.tax_account_id)) {
          taxCOA = await getAccountCOA(
            supabaseClient,
            payload.tax_account_id
          );
        } else {
          taxCOA = await getAccountCOAByCode(
            supabaseClient,
            payload.tax_account_id
          );
        }
      } else if (payload.tax_account_code) {
        taxCOA = await getAccountCOAByCode(
          supabaseClient,
          payload.tax_account_code
        );
      } else {
        // DEFAULT PPN MASUKAN
        taxCOA = await getAccountCOAByCode(supabaseClient, "1-1700");
      }

      if (taxCOA) {
        journalEntries.push({
          account_id: taxCOA.id,
          account_code: taxCOA.account_code,
          account_name: taxCOA.account_name,
          debit: payload.tax_amount,
          credit: 0,
          description: `PPN Masukan - ${payload.description}`,
        });
      }
    }

    // CREDIT CASH/BANK
    journalEntries.push({
      account_id: creditCOA.id,
      account_code: creditCOA.account_code,
      account_name: creditCOA.account_name,
      debit: 0,
      credit: payload.amount,
      description: payload.description,
    });

    const totalDebit = journalEntries.reduce((s, e) => s + e.debit, 0);
    const totalCredit = journalEntries.reduce((s, e) => s + e.credit, 0);

    /*
    ------------------------------------------------------------
    4️⃣ INSERT JOURNAL ENTRY HEADER
    ------------------------------------------------------------
    */
    const journalEntryId = crypto.randomUUID();
    const journalRef = `CD-${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}-${payload.disbursement_id?.slice(0, 8) ??
      crypto.randomUUID().slice(0, 8)}`;

    const { error: journalError } = await supabaseClient
      .from("journal_entries")
      .insert({
        id: journalEntryId,
        journal_ref: journalRef,
        entry_date: payload.date,
        transaction_date: payload.date,
        description: payload.description,
        total_debit: totalDebit,
        total_credit: totalCredit,
        reference_type: "cash_disbursement",
        reference_id: payload.disbursement_id,
        status: "posted",
        created_by: user.id,
      });

    if (journalError) throw journalError;

    /*
    ------------------------------------------------------------
    5️⃣ INSERT JOURNAL LINES
    ------------------------------------------------------------
    */
    const lines = journalEntries.map((e) => ({
      journal_entry_id: journalEntryId,
      ...e,
    }));

    const { error: lineError } = await supabaseClient
      .from("journal_entry_lines")
      .insert(lines);

    if (lineError) throw lineError;

    /*
    ------------------------------------------------------------
    6️⃣ GENERAL LEDGER
    ------------------------------------------------------------
    */
    const gl = journalEntries.map((e) => ({
      journal_entry_id: journalEntryId,
      account_id: e.account_id,
      account_code: e.account_code,
      account_name: e.account_name,
      date: payload.date,
      debit: e.debit,
      credit: e.credit,
      description: e.description,
    }));

    const { error: glError } = await supabaseClient
      .from("general_ledger")
      .insert(gl);

    if (glError) throw glError;

    /*
    ------------------------------------------------------------
    7️⃣ UPDATE CASH DISBURSEMENT
    ------------------------------------------------------------
    */
    if (payload.disbursement_id) {
      await supabaseClient
        .from("cash_disbursement")
        .update({
          journal_entry_id: journalEntryId,
          journal_ref: journalRef,
          approval_status: "posted",
        })
        .eq("id", payload.disbursement_id);
    }

    /*
    ------------------------------------------------------------
    ✅ SUCCESS RESPONSE
    ------------------------------------------------------------
    */
    return new Response(
      JSON.stringify({
        success: true,
        journal_entry_id: journalEntryId,
        journal_ref: journalRef,
        entries: journalEntries,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
