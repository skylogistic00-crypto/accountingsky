import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JournalEntry {
  transaction_id: string;
  transaction_date: string;
  account_code: string;
  account_name: string;
  debit: number;
  credit: number;
  description: string;
  created_by: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { type, record } = await req.json();

    const journalEntries: JournalEntry[] = [];
    let transactionId = '';

    // Handle different transaction types
    if (type === 'sales_transaction') {
      transactionId = `SALE-${record.id.substring(0, 8)}`;

      if (record.transaction_type === 'Barang') {
        // 1. Dr Kas/Piutang
        const cashCode = record.payment_method === 'Piutang' ? '1-1200' : '1-1100';
        const cashName = record.payment_method === 'Piutang' ? 'Piutang Usaha' : 'Kas';
        
        journalEntries.push({
          transaction_id: transactionId,
          transaction_date: record.transaction_date,
          account_code: cashCode,
          account_name: cashName,
          debit: record.total_amount,
          credit: 0,
          description: `Penjualan Barang - ${record.item_name} (${record.payment_method})`,
          created_by: record.created_by || 'system',
        });

        // 2. Cr Pendapatan
        journalEntries.push({
          transaction_id: transactionId,
          transaction_date: record.transaction_date,
          account_code: record.coa_revenue_code || record.coa_account_code,
          account_name: record.coa_account_name || 'Pendapatan Penjualan',
          debit: 0,
          credit: record.subtotal,
          description: `Pendapatan Penjualan Barang - ${record.item_name}`,
          created_by: record.created_by || 'system',
        });

        // 3. Cr Pajak
        if (record.tax_amount > 0) {
          journalEntries.push({
            transaction_id: transactionId,
            transaction_date: record.transaction_date,
            account_code: '2-1250',
            account_name: 'Hutang PPN',
            debit: 0,
            credit: record.tax_amount,
            description: `PPN Keluaran ${record.tax_percentage}%`,
            created_by: record.created_by || 'system',
          });
        }

        // 4. Dr HPP
        if (record.coa_cogs_code) {
          const cogs = record.quantity * (record.unit_price - (record.subtotal / record.quantity));
          
          journalEntries.push({
            transaction_id: transactionId,
            transaction_date: record.transaction_date,
            account_code: record.coa_cogs_code,
            account_name: 'Harga Pokok Penjualan',
            debit: cogs,
            credit: 0,
            description: `HPP - ${record.item_name}`,
            created_by: record.created_by || 'system',
          });

          // 5. Cr Persediaan
          journalEntries.push({
            transaction_id: transactionId,
            transaction_date: record.transaction_date,
            account_code: record.coa_inventory_code,
            account_name: 'Persediaan Barang',
            debit: 0,
            credit: cogs,
            description: `Pengurangan Persediaan - ${record.item_name}`,
            created_by: record.created_by || 'system',
          });
        }
      } else {
        // Penjualan Jasa
        // 1. Dr Kas/Piutang
        const cashCode = record.payment_method === 'Piutang' ? '1-1200' : '1-1100';
        const cashName = record.payment_method === 'Piutang' ? 'Piutang Usaha' : 'Kas';
        
        journalEntries.push({
          transaction_id: transactionId,
          transaction_date: record.transaction_date,
          account_code: cashCode,
          account_name: cashName,
          debit: record.total_amount,
          credit: 0,
          description: `Penjualan Jasa - ${record.item_name} (${record.payment_method})`,
          created_by: record.created_by || 'system',
        });

        // 2. Cr Pendapatan Jasa
        journalEntries.push({
          transaction_id: transactionId,
          transaction_date: record.transaction_date,
          account_code: record.coa_revenue_code || record.coa_account_code,
          account_name: record.coa_account_name || 'Pendapatan Jasa',
          debit: 0,
          credit: record.subtotal,
          description: `Pendapatan Jasa - ${record.item_name}`,
          created_by: record.created_by || 'system',
        });

        // 3. Cr Pajak
        if (record.tax_amount > 0) {
          journalEntries.push({
            transaction_id: transactionId,
            transaction_date: record.transaction_date,
            account_code: '2-1250',
            account_name: 'Hutang PPN',
            debit: 0,
            credit: record.tax_amount,
            description: `PPN Keluaran ${record.tax_percentage}%`,
            created_by: record.created_by || 'system',
          });
        }
      }
    } else if (type === 'expense') {
      transactionId = `EXP-${record.id.substring(0, 8)}`;

      // 1. Dr Biaya Operasional
      journalEntries.push({
        transaction_id: transactionId,
        transaction_date: record.expense_date || record.transaction_date,
        account_code: record.coa_expense_code || record.coa_account_code,
        account_name: record.coa_account_name || 'Biaya Operasional',
        debit: record.amount || record.subtotal,
        credit: 0,
        description: `${record.expense_type || 'Pengeluaran'} - ${record.description || ''}`,
        created_by: record.created_by || 'system',
      });

      // 2. Dr PPN Masukan (if any)
      if (record.tax_amount > 0) {
        journalEntries.push({
          transaction_id: transactionId,
          transaction_date: record.expense_date || record.transaction_date,
          account_code: '1-1720',
          account_name: 'Piutang Pajak',
          debit: record.tax_amount,
          credit: 0,
          description: `PPN Masukan ${record.tax_percentage || 11}%`,
          created_by: record.created_by || 'system',
        });
      }

      // 3. Cr Kas/Bank
      journalEntries.push({
        transaction_id: transactionId,
        transaction_date: record.expense_date || record.transaction_date,
        account_code: '1-1100',
        account_name: 'Kas',
        debit: 0,
        credit: record.total_amount || (record.amount + (record.tax_amount || 0)),
        description: `Pembayaran ${record.expense_type || 'Pengeluaran'}`,
        created_by: record.created_by || 'system',
      });
    } else if (type === 'tax_payment') {
      transactionId = `TAX-${record.id.substring(0, 8)}`;

      // 1. Dr Kewajiban Pajak
      journalEntries.push({
        transaction_id: transactionId,
        transaction_date: record.transaction_date,
        account_code: record.coa_tax_code,
        account_name: record.coa_tax_name || 'Kewajiban Pajak',
        debit: record.amount,
        credit: 0,
        description: `Pembayaran ${record.tax_type}`,
        created_by: record.created_by || 'system',
      });

      // 2. Cr Kas/Bank
      journalEntries.push({
        transaction_id: transactionId,
        transaction_date: record.transaction_date,
        account_code: '1-1100',
        account_name: 'Kas',
        debit: 0,
        credit: record.amount,
        description: `Pembayaran ${record.tax_type}`,
        created_by: record.created_by || 'system',
      });
    } else if (type === 'internal_usage') {
      transactionId = `USAGE-${record.id.substring(0, 8)}`;

      // 1. Dr Beban Operasional
      journalEntries.push({
        transaction_id: transactionId,
        transaction_date: record.usage_date || record.transaction_date,
        account_code: record.coa_expense_code || record.coa_account_code,
        account_name: record.coa_account_name || 'Beban Operasional',
        debit: record.total_cost || record.total_amount,
        credit: 0,
        description: `Pemakaian Internal - ${record.item_name} (${record.department_name || ''})`,
        created_by: record.created_by || 'system',
      });

      // 2. Cr Persediaan
      journalEntries.push({
        transaction_id: transactionId,
        transaction_date: record.usage_date || record.transaction_date,
        account_code: record.coa_inventory_code,
        account_name: 'Persediaan Barang',
        debit: 0,
        credit: record.total_cost || record.total_amount,
        description: `Pengurangan Persediaan - ${record.item_name}`,
        created_by: record.created_by || 'system',
      });
    }

    // Validate journal balance
    const totalDebit = journalEntries.reduce((sum, entry) => sum + entry.debit, 0);
    const totalCredit = journalEntries.reduce((sum, entry) => sum + entry.credit, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new Error(`Jurnal tidak balance! Debit: ${totalDebit}, Kredit: ${totalCredit}`);
    }

    // Insert journal entries
    const { error: journalError } = await supabase
      .from('journal_entries')
      .insert(journalEntries);

    if (journalError) {
      throw journalError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${journalEntries.length} entri jurnal berhasil dibuat`,
        transaction_id: transactionId,
        entries: journalEntries.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
