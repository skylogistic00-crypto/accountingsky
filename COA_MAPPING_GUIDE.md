# Chart of Accounts (COA) - PT. Solusi Logistik Nusantara

## 📊 Sistem Pemetaan Otomatis COA

Sistem ini dirancang untuk **otomatis memilih akun COA** berdasarkan kategori layanan/produk yang dipilih, meminimalisir kesalahan input manual dan mempercepat proses pencatatan.

---

## 🎯 Cara Kerja Sistem

### 1. **Pilih Kategori Layanan/Produk**
Saat user memilih kategori (contoh: "Jasa Cargo"), sistem akan menampilkan jenis-jenis layanan yang tersedia.

### 2. **Pilih Jenis Layanan/Barang**
Saat user memilih jenis (contoh: "Cargo Udara Domestik"), sistem **otomatis mengisi**:
- **Akun Pendapatan** (untuk penjualan/invoice)
- **Akun HPP/Beban Pokok** (untuk pembelian/biaya)
- **Akun Aset** (untuk persediaan)

### 3. **Pencatatan Otomatis**
Transaksi akan tercatat ke akun yang tepat tanpa perlu input manual.

---

## 📋 Tabel Pemetaan Lengkap

### A. JASA CARGO

| Jenis Layanan | Akun Pendapatan | Akun HPP/Beban | Deskripsi |
|---------------|-----------------|----------------|-----------|
| **Cargo Udara Domestik** | 4-1110 | 5-1110 | Pengiriman cargo via udara dalam negeri |
| **Cargo Udara Internasional** | 4-1120 | 5-1110 | Pengiriman cargo via udara internasional |
| **Cargo Laut (LCL)** | 4-1210 | 5-1110 | Pengiriman cargo via laut Less than Container Load |
| **Cargo Laut (FCL)** | 4-1220 | 5-1110 | Pengiriman cargo via laut Full Container Load |
| **Cargo Darat** | 4-1300 | 5-1110 | Pengiriman cargo via darat/truk |

### B. JASA TAMBAHAN

| Jenis Layanan | Akun Pendapatan | Akun HPP/Beban | Deskripsi |
|---------------|-----------------|----------------|-----------|
| **Asuransi Pengiriman** | 4-1410 | 5-1130 | Layanan asuransi untuk pengiriman barang |
| **Packing Kayu** | 4-1420 | 5-1140 | Jasa packing dengan kayu untuk keamanan barang |
| **Packing Kardus** | 4-1420 | 5-1140 | Jasa packing dengan kardus |
| **Packing Bubble Wrap** | 4-1420 | 5-1140 | Jasa packing dengan bubble wrap |

### C. JASA GUDANG

| Jenis Layanan | Akun Pendapatan | Akun HPP/Beban | Deskripsi |
|---------------|-----------------|----------------|-----------|
| **Sewa Gudang** | 4-2110 | 5-2130 | Pendapatan dari sewa ruang gudang |
| **Jasa Penyimpanan (Storage)** | 4-2120 | 5-2120 | Jasa penyimpanan barang di gudang |
| **Jasa Bongkar Muat** | 4-2210 | 5-1120 | Jasa penanganan bongkar muat barang |
| **Jasa Penanganan Barang** | 4-2210 | 5-1120 | Jasa penanganan dan handling barang |

### D. PERSEDIAAN (Inventory)

| Jenis Barang | Akun Aset | Deskripsi |
|--------------|-----------|-----------|
| **Pembelian Kardus** | 1-1400 | Pembelian bahan kemasan kardus |
| **Pembelian Bubble Wrap** | 1-1400 | Pembelian bahan kemasan bubble wrap |
| **Pembelian Kayu Packing** | 1-1400 | Pembelian bahan kemasan kayu |
| **Pembelian Lakban** | 1-1400 | Pembelian bahan kemasan lakban |
| **Pembelian Plastik Wrapping** | 1-1400 | Pembelian bahan kemasan plastik |

---

## 💡 Contoh Penggunaan

### Contoh 1: Faktur Penjualan Jasa Cargo Udara
1. **Pilih Kategori**: "Jasa Cargo"
2. **Pilih Jenis**: "Cargo Udara Domestik"
3. **Sistem Otomatis Mengisi**:
   - Akun Pendapatan: `4-1110 - Pend. Cargo Udara Domestik`

### Contoh 2: Pembelian Biaya Angkut ke Agen
1. **Pilih Kategori**: "Jasa Cargo"
2. **Pilih Jenis**: "Cargo Udara Domestik"
3. **Sistem Otomatis Mengisi**:
   - Akun Beban: `5-1110 - Biaya Angkut Udara`

### Contoh 3: Pembelian Kardus untuk Packing
1. **Pilih Kategori**: "Persediaan"
2. **Pilih Jenis**: "Pembelian Kardus"
3. **Sistem Otomatis Mengisi**:
   - Akun Aset: `1-1400 - Persediaan Bahan Kemasan/Packaging`

---

## 🔧 Fitur Teknis

### Database Functions
- `get_coa_mapping(category, type)` - Mendapatkan mapping COA untuk kategori dan jenis tertentu
- `get_service_types_by_category(category)` - Mendapatkan semua jenis layanan dalam kategori

### Tabel Database
- `coa_category_mapping` - Tabel pemetaan kategori ke akun COA
- `chart_of_accounts` - Master Chart of Accounts

### Integrasi
- ✅ **Stock Form** - Auto-select COA saat input stok
- ✅ **Cash Book** - Auto-select COA saat entry transaksi kas
- 🔄 **Purchase Request** - (Coming soon)
- 🔄 **Invoice/Sales** - (Coming soon)

---

## 📊 Struktur COA Lengkap

### 1. ASET (1-0000)
- **1-1000**: Aset Lancar
  - 1-1100: Kas di Tangan
  - 1-1200: Kas di Bank
  - 1-1300: Piutang Usaha
  - **1-1400: Persediaan Bahan Kemasan/Packaging** ⭐
  - 1-1700: Piutang Pajak (PPN Masukan)

### 2. KEWAJIBAN (2-0000)
- **2-1000**: Kewajiban Lancar
  - 2-1500: Hutang Pajak (PPN Keluaran, PPh 21, 23, 25)

### 3. EKUITAS (3-0000)
- Modal dan laba ditahan

### 4. PENDAPATAN (4-0000) ⭐
- **4-1000**: Pendapatan Jasa Cargo
  - **4-1110**: Pend. Cargo Udara Domestik
  - **4-1120**: Pend. Cargo Udara Internasional
  - **4-1210**: Pend. Cargo Laut (LCL)
  - **4-1220**: Pend. Cargo Laut (FCL)
  - **4-1300**: Pend. Cargo Darat
- **4-1400**: Pendapatan Layanan Tambahan
  - **4-1410**: Pend. Asuransi Pengiriman
  - **4-1420**: Pend. Jasa Packing/Kemasan
- **4-2000**: Pendapatan Jasa Gudang
  - **4-2110**: Pend. Sewa Gudang
  - **4-2120**: Pend. Jasa Penyimpanan (Storage)
  - **4-2210**: Pend. Jasa Penanganan Barang

### 5. BEBAN POKOK PENJUALAN (5-0000) ⭐
- **5-1000**: HPP Jasa Cargo
  - **5-1110**: Biaya Angkut (Udara/Laut/Darat)
  - **5-1120**: Biaya Bongkar Muat
  - **5-1130**: Biaya Asuransi Kirim
  - **5-1140**: Biaya Kemasan
- **5-2000**: HPP Jasa Gudang
  - **5-2110**: Biaya TKL Gudang
  - **5-2120**: Biaya Listrik & Air Gudang
  - **5-2130**: Biaya Sewa Gedung

### 6. BEBAN OPERASIONAL (6-0000)
- Gaji, sewa kantor, utilitas, dll.

### 7. PENDAPATAN & BEBAN LAIN-LAIN (7-0000)
- Bunga bank, selisih kurs, dll.

---

## ✅ Keunggulan Sistem

1. ✅ **Otomatis** - Tidak perlu hafal kode akun
2. ✅ **Akurat** - Mengurangi kesalahan input manual
3. ✅ **Cepat** - Proses pencatatan lebih efisien
4. ✅ **Konsisten** - Semua transaksi tercatat dengan standar yang sama
5. ✅ **Audit Trail** - Mudah dilacak dan diaudit
6. ✅ **Kompatibel** - Sesuai SAK ETAP/EMKM dan perpajakan Indonesia

---

## 🚀 Cara Menambah Mapping Baru

Untuk menambah kategori atau jenis layanan baru:

```sql
INSERT INTO coa_category_mapping 
  (service_category, service_type, revenue_account_code, cogs_account_code, description) 
VALUES 
  ('Kategori Baru', 'Jenis Baru', '4-XXXX', '5-XXXX', 'Deskripsi');
```

---

## 📞 Support

Jika ada pertanyaan atau butuh penambahan mapping, silakan hubungi tim accounting atau IT support.

---

**Dibuat untuk**: PT. Solusi Logistik Nusantara  
**Tanggal**: 2024  
**Versi**: 1.0
