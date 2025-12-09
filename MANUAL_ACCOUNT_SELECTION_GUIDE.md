# Manual Account Selection - Bypass AI Mapping

## Overview
Sistem ini memungkinkan user untuk **memilih akun beban secara manual** dan **bypass AI mapping** saat membuat transaksi pengeluaran kas.

## Fitur Utama

### 1. **UI Enhancement**
- ✅ Dropdown "Akun Beban" sekarang menyimpan detail lengkap akun yang dipilih
- ✅ Visual indicator hijau menunjukkan akun dipilih secara manual
- ✅ Badge "✓ Manual (Bypass AI)" muncul di label
- ✅ Border hijau pada input field saat akun manual dipilih
- ✅ Tombol "✕ Hapus Pilihan Manual" untuk reset ke AI mapping

### 2. **Data Flow**

#### Saat User Memilih Akun Beban:
```typescript
// State yang disimpan:
selectedExpenseAccount = {
  id: "uuid-coa",
  account_code: "6-1100",
  account_name: "Beban Operasional"
}
```

#### Saat Ditambahkan ke Cart:
```typescript
cartItem = {
  ...otherFields,
  selectedExpenseAccount: {
    id: "uuid",
    account_code: "6-1100",
    account_name: "Beban Operasional"
  }
}
```

#### Saat Checkout:
```typescript
// Cek apakah ada manual selection
if (item.selectedExpenseAccount) {
  // ✅ Gunakan akun manual - BYPASS AI
  expenseAccountCode = item.selectedExpenseAccount.account_code;
  expenseAccountName = item.selectedExpenseAccount.account_name;
  expenseAccountId = item.selectedExpenseAccount.id;
  console.log("✅ Using MANUAL expense account");
} else {
  // 🤖 Gunakan AI mapping
  const expenseLine = journalData.lines.find((l) => l.dc === "D");
  expenseAccountCode = expenseLine?.account_code || "6-1100";
  console.log("🤖 Using AI-mapped expense account");
}
```

### 3. **Database Integration**

Data yang dikirim ke `cash_disbursement` table:
```typescript
{
  transaction_date: "2025-12-09",
  payee_name: "Nama Karyawan",
  description: "Deskripsi transaksi",
  category: "Kategori",
  amount: 500000,
  payment_method: "Tunai",
  
  // COA Fields
  coa_expense_code: "6-1100",      // Dari manual selection atau AI
  coa_cash_code: "1-1100",         // Dari journal line
  account_code: "6-1100",          // Dari manual selection atau AI
  account_name: "Beban Operasional", // Dari manual selection atau AI
  coa_id: "uuid-coa",              // ✅ NEW: UUID reference ke chart_of_accounts
  
  // Other fields...
  approval_status: "waiting_approval",
  created_by: "user-uuid",
  bukti: "url-to-file",
  ocr_data: {...}
}
```

## Console Logs untuk Debugging

### Saat Manual Selection:
```
✅ Using MANUAL expense account: {
  code: "6-1100",
  name: "Beban Operasional",
  id: "uuid-coa"
}
```

### Saat AI Mapping:
```
🤖 Using AI-mapped expense account: {
  code: "6-1100",
  name: "Beban Operasional"
}
```

## Cara Penggunaan

### 1. **Pilih Akun Beban Manual**
1. Buka form "Transaksi Keuangan"
2. Pilih "Jenis Transaksi" = "Pengeluaran Kas"
3. Klik dropdown "Akun Beban"
4. Pilih akun dari daftar (contoh: "6-1100 — Beban Operasional")
5. ✅ Field akan berubah hijau dengan badge "✓ Manual (Bypass AI)"

### 2. **Tambah ke Keranjang**
1. Isi field lainnya (nominal, tanggal, dll)
2. Klik "🛒 Tambah ke Keranjang"
3. Item akan tersimpan dengan `selectedExpenseAccount`

### 3. **Checkout**
1. Klik "Checkout Semua" atau "Checkout" per item
2. Sistem akan:
   - ✅ Gunakan akun manual jika ada
   - 🤖 Gunakan AI mapping jika tidak ada
3. Data tersimpan ke `cash_disbursement` dengan `coa_id`

### 4. **Reset ke AI Mapping**
1. Klik tombol "✕ Hapus Pilihan Manual (Gunakan AI)"
2. Field akan kembali normal (tidak hijau)
3. Sistem akan menggunakan AI mapping saat checkout

## Backend Integration (Future)

Jika ada edge function yang perlu menggunakan data ini:

```typescript
// Edge Function: auto-post-transaction
const payload = await req.json();

let debitAccount = null;

// Jika user memilih akun manual dari UI
if (payload.debit_account_id || payload.coa_id) {
  debitAccount = payload.debit_account_id || payload.coa_id;
  console.log("✅ Using manual account:", debitAccount);
} else {
  // fallback ke AI / mapping otomatis
  debitAccount = aiSuggestedDebitAccount;
  console.log("🤖 Using AI-suggested account:", debitAccount);
}
```

## Database Schema

### Table: `cash_disbursement`
```sql
-- Existing columns
coa_expense_code TEXT
coa_cash_code TEXT
account_code TEXT
account_name TEXT

-- NEW column (already exists via migration 20240384)
coa_id UUID REFERENCES chart_of_accounts(id)
```

## Testing Checklist

- [x] UI menampilkan dropdown "Akun Beban"
- [x] Saat pilih akun, field berubah hijau dengan badge
- [x] Data tersimpan di cart dengan `selectedExpenseAccount`
- [x] Saat checkout, console log menunjukkan "✅ Using MANUAL expense account"
- [x] Data tersimpan ke database dengan `coa_id`
- [x] Tombol reset berfungsi dan menghapus pilihan manual
- [x] Jika tidak ada pilihan manual, sistem gunakan AI mapping
- [x] Console log menunjukkan "🤖 Using AI-mapped expense account"

## Files Modified

1. **src/components/TransaksiKeuanganForm.tsx**
   - Added `selectedExpenseAccount` state
   - Updated account selection handler
   - Added visual indicators (green border, badge)
   - Added reset button
   - Updated cart item structure
   - Updated checkout logic (both batch and single)
   - Added console logs for debugging

## Benefits

✅ **User Control**: User dapat override AI mapping jika diperlukan
✅ **Transparency**: Visual indicator jelas menunjukkan mode manual vs AI
✅ **Flexibility**: User dapat reset ke AI mapping kapan saja
✅ **Audit Trail**: `coa_id` tersimpan untuk tracking
✅ **Backward Compatible**: Jika tidak ada manual selection, sistem tetap gunakan AI

## Notes

- Manual selection hanya berlaku untuk **Akun Beban** (expense accounts)
- Akun Kas/Bank tetap menggunakan mapping otomatis dari journal lines
- `coa_id` field sudah ada di database (migration 20240384)
- Sistem tetap backward compatible dengan transaksi lama
