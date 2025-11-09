# Chart of Accounts - PT. Solusi Logistik Nusantara
## Export Template untuk Excel/Google Sheets

---

## 📊 TABEL 1: MASTER CHART OF ACCOUNTS

| Kode Akun | Nama Akun | Kategori | Tipe Akun | Level | Is Header | Normal Balance | Deskripsi |
|-----------|-----------|----------|-----------|-------|-----------|----------------|-----------|
| **1-0000** | **ASET** | Aset | Aset | 1 | TRUE | Debit | Aset perusahaan |
| **1-1000** | **Aset Lancar** | Aset | Aset | 2 | TRUE | Debit | Aset yang dapat dicairkan dalam 1 tahun |
| 1-1100 | Kas di Tangan | Aset | Aset | 3 | FALSE | Debit | Kas fisik di tangan |
| 1-1200 | Kas di Bank | Aset | Aset | 3 | TRUE | Debit | Rekening bank perusahaan |
| 1-1210 | Bank BCA | Aset | Aset | 4 | FALSE | Debit | Rekening BCA |
| 1-1220 | Bank Mandiri | Aset | Aset | 4 | FALSE | Debit | Rekening Mandiri |
| 1-1300 | Piutang Usaha | Aset | Aset | 3 | TRUE | Debit | Piutang dari pelanggan |
| 1-1400 | Persediaan Bahan Kemasan/Packaging | Aset | Aset | 3 | TRUE | Debit | Persediaan bahan kemasan untuk pembelian material |
| 1-1410 | Persediaan Kardus | Aset | Aset | 4 | FALSE | Debit | Persediaan kardus |
| 1-1420 | Persediaan Bubble Wrap | Aset | Aset | 4 | FALSE | Debit | Persediaan bubble wrap |
| 1-1430 | Persediaan Kayu Packing | Aset | Aset | 4 | FALSE | Debit | Persediaan kayu packing |
| 1-1700 | Piutang Pajak (PPN Masukan) | Aset | Aset | 3 | TRUE | Debit | Piutang pajak dari pemerintah |
| **2-0000** | **KEWAJIBAN** | Kewajiban | Kewajiban | 1 | TRUE | Kredit | Kewajiban perusahaan |
| **2-1000** | **Kewajiban Lancar** | Kewajiban | Kewajiban | 2 | TRUE | Kredit | Kewajiban jangka pendek |
| 2-1500 | Hutang Pajak (PPN Keluaran, PPh 21,23,25) | Kewajiban | Kewajiban | 3 | TRUE | Kredit | Hutang pajak kepada pemerintah |
| 2-1510 | Hutang PPN Keluaran | Kewajiban | Kewajiban | 4 | FALSE | Kredit | Hutang PPN keluaran |
| 2-1520 | Hutang PPh 21 | Kewajiban | Kewajiban | 4 | FALSE | Kredit | Hutang PPh 21 |
| 2-1530 | Hutang PPh 23 | Kewajiban | Kewajiban | 4 | FALSE | Kredit | Hutang PPh 23 |
| **3-0000** | **EKUITAS** | Ekuitas | Ekuitas | 1 | TRUE | Kredit | Modal pemilik |
| 3-1000 | Modal Disetor | Ekuitas | Ekuitas | 2 | FALSE | Kredit | Modal awal pemilik |
| 3-2000 | Laba Ditahan | Ekuitas | Ekuitas | 2 | FALSE | Kredit | Laba tahun sebelumnya |
| 3-3000 | Laba Tahun Berjalan | Ekuitas | Ekuitas | 2 | FALSE | Kredit | Laba tahun ini |
| **4-0000** | **PENDAPATAN** | Pendapatan | Pendapatan | 1 | TRUE | Kredit | Pendapatan perusahaan |
| **4-1000** | **Pendapatan Jasa Cargo** | Pendapatan | Pendapatan | 2 | TRUE | Kredit | Pendapatan dari jasa pengiriman |
| 4-1110 | Pend. Cargo Udara Domestik | Pendapatan | Pendapatan | 4 | FALSE | Kredit | Pendapatan cargo udara domestik |
| 4-1120 | Pend. Cargo Udara Internasional | Pendapatan | Pendapatan | 4 | FALSE | Kredit | Pendapatan cargo udara internasional |
| 4-1210 | Pend. Cargo Laut (LCL) | Pendapatan | Pendapatan | 4 | FALSE | Kredit | Pendapatan cargo laut Less than Container Load |
| 4-1220 | Pend. Cargo Laut (FCL) | Pendapatan | Pendapatan | 4 | FALSE | Kredit | Pendapatan cargo laut Full Container Load |
| 4-1300 | Pend. Cargo Darat | Pendapatan | Pendapatan | 4 | FALSE | Kredit | Pendapatan cargo darat |
| **4-1400** | **Pendapatan Layanan Tambahan** | Pendapatan | Pendapatan | 3 | TRUE | Kredit | Pendapatan layanan tambahan |
| 4-1410 | Pend. Asuransi Pengiriman | Pendapatan | Pendapatan | 4 | FALSE | Kredit | Pendapatan asuransi pengiriman |
| 4-1420 | Pend. Jasa Packing/Kemasan | Pendapatan | Pendapatan | 4 | FALSE | Kredit | Pendapatan jasa packing dan kemasan |
| **4-2000** | **Pendapatan Jasa Gudang** | Pendapatan | Pendapatan | 2 | TRUE | Kredit | Pendapatan dari jasa pergudangan |
| 4-2110 | Pend. Sewa Gudang | Pendapatan | Pendapatan | 4 | FALSE | Kredit | Pendapatan sewa gudang |
| 4-2120 | Pend. Jasa Penyimpanan (Storage) | Pendapatan | Pendapatan | 4 | FALSE | Kredit | Pendapatan jasa penyimpanan |
| 4-2210 | Pend. Jasa Penanganan Barang | Pendapatan | Pendapatan | 4 | FALSE | Kredit | Pendapatan jasa penanganan barang |
| **5-0000** | **BEBAN POKOK PENJUALAN** | Beban Pokok Penjualan | Beban Pokok Penjualan | 1 | TRUE | Debit | Biaya langsung produksi/jasa |
| **5-1000** | **Beban Pokok Jasa Cargo** | Beban Pokok Penjualan | Beban Pokok Penjualan | 2 | TRUE | Debit | Biaya langsung jasa cargo |
| 5-1110 | Biaya Angkut ke Agen Utama | Beban Pokok Penjualan | Beban Pokok Penjualan | 3 | FALSE | Debit | Biaya angkut ke agen utama (Udara/Laut/Darat) |
| 5-1120 | Biaya Bongkar Muat | Beban Pokok Penjualan | Beban Pokok Penjualan | 3 | FALSE | Debit | Biaya bongkar muat di bandara/pelabuhan |
| 5-1130 | Biaya Asuransi Pengiriman | Beban Pokok Penjualan | Beban Pokok Penjualan | 3 | FALSE | Debit | Biaya asuransi pengiriman |
| 5-1140 | Biaya Kemasan/Packaging Material | Beban Pokok Penjualan | Beban Pokok Penjualan | 3 | FALSE | Debit | Biaya kemasan dan packaging material |
| **5-2000** | **Beban Pokok Jasa Gudang** | Beban Pokok Penjualan | Beban Pokok Penjualan | 2 | TRUE | Debit | Biaya langsung jasa gudang |
| 5-2110 | Biaya Tenaga Kerja Langsung Gudang | Beban Pokok Penjualan | Beban Pokok Penjualan | 3 | FALSE | Debit | Biaya tenaga kerja langsung gudang |
| 5-2120 | Biaya Listrik, Air, & Telepon Gudang | Beban Pokok Penjualan | Beban Pokok Penjualan | 3 | FALSE | Debit | Biaya listrik, air, dan telepon gudang |
| 5-2130 | Biaya Sewa Gedung/Tanah | Beban Pokok Penjualan | Beban Pokok Penjualan | 3 | FALSE | Debit | Biaya sewa gedung/tanah (jika gudang disewa) |
| 5-2140 | Biaya Perawatan Peralatan Gudang | Beban Pokok Penjualan | Beban Pokok Penjualan | 3 | FALSE | Debit | Biaya perawatan dan perbaikan peralatan gudang |
| **6-0000** | **BEBAN OPERASIONAL** | Beban Operasional | Beban Operasional | 1 | TRUE | Debit | Beban operasional perusahaan |
| 6-1000 | Beban Gaji & Upah | Beban Operasional | Beban Operasional | 2 | FALSE | Debit | Gaji karyawan non-produksi |
| 6-2000 | Beban Sewa Kantor | Beban Operasional | Beban Operasional | 2 | FALSE | Debit | Sewa kantor |
| 6-3000 | Beban Utilitas Kantor | Beban Operasional | Beban Operasional | 2 | FALSE | Debit | Listrik, air, telepon kantor |
| **7-0000** | **PENDAPATAN & BEBAN LAIN-LAIN** | Lain-lain | Lain-lain | 1 | TRUE | Kredit | Pendapatan dan beban di luar operasional |
| 7-1000 | Pendapatan Bunga Bank | Lain-lain | Pendapatan | 2 | FALSE | Kredit | Bunga dari bank |
| 7-2000 | Beban Bunga Pinjaman | Lain-lain | Beban | 2 | FALSE | Debit | Bunga pinjaman |

---

## 📋 TABEL 2: ATURAN PEMETAAN OTOMATIS (MAPPING RULES)

### A. JASA CARGO

| ID | Kategori Layanan | Jenis Layanan | Akun Pendapatan | Nama Akun Pendapatan | Akun HPP/Beban | Nama Akun HPP | Akun Aset | Deskripsi |
|----|------------------|---------------|-----------------|----------------------|----------------|---------------|-----------|-----------|
| 1 | Jasa Cargo | Cargo Udara Domestik | 4-1110 | Pend. Cargo Udara Domestik | 5-1110 | Biaya Angkut ke Agen Utama | - | Pengiriman cargo via udara dalam negeri |
| 2 | Jasa Cargo | Cargo Udara Internasional | 4-1120 | Pend. Cargo Udara Internasional | 5-1110 | Biaya Angkut ke Agen Utama | - | Pengiriman cargo via udara internasional |
| 3 | Jasa Cargo | Cargo Laut (LCL) | 4-1210 | Pend. Cargo Laut (LCL) | 5-1110 | Biaya Angkut ke Agen Utama | - | Pengiriman cargo via laut Less than Container Load |
| 4 | Jasa Cargo | Cargo Laut (FCL) | 4-1220 | Pend. Cargo Laut (FCL) | 5-1110 | Biaya Angkut ke Agen Utama | - | Pengiriman cargo via laut Full Container Load |
| 5 | Jasa Cargo | Cargo Darat | 4-1300 | Pend. Cargo Darat | 5-1110 | Biaya Angkut ke Agen Utama | - | Pengiriman cargo via darat/truk |

### B. JASA TAMBAHAN

| ID | Kategori Layanan | Jenis Layanan | Akun Pendapatan | Nama Akun Pendapatan | Akun HPP/Beban | Nama Akun HPP | Akun Aset | Deskripsi |
|----|------------------|---------------|-----------------|----------------------|----------------|---------------|-----------|-----------|
| 6 | Jasa Tambahan | Asuransi Pengiriman | 4-1410 | Pend. Asuransi Pengiriman | 5-1130 | Biaya Asuransi Pengiriman | - | Layanan asuransi untuk pengiriman barang |
| 7 | Jasa Tambahan | Packing Kayu | 4-1420 | Pend. Jasa Packing/Kemasan | 5-1140 | Biaya Kemasan/Packaging Material | - | Jasa packing dengan kayu untuk keamanan barang |
| 8 | Jasa Tambahan | Packing Kardus | 4-1420 | Pend. Jasa Packing/Kemasan | 5-1140 | Biaya Kemasan/Packaging Material | - | Jasa packing dengan kardus |
| 9 | Jasa Tambahan | Packing Bubble Wrap | 4-1420 | Pend. Jasa Packing/Kemasan | 5-1140 | Biaya Kemasan/Packaging Material | - | Jasa packing dengan bubble wrap |

### C. JASA GUDANG

| ID | Kategori Layanan | Jenis Layanan | Akun Pendapatan | Nama Akun Pendapatan | Akun HPP/Beban | Nama Akun HPP | Akun Aset | Deskripsi |
|----|------------------|---------------|-----------------|----------------------|----------------|---------------|-----------|-----------|
| 10 | Jasa Gudang | Sewa Gudang | 4-2110 | Pend. Sewa Gudang | 5-2130 | Biaya Sewa Gedung/Tanah | - | Pendapatan dari sewa ruang gudang |
| 11 | Jasa Gudang | Jasa Penyimpanan (Storage) | 4-2120 | Pend. Jasa Penyimpanan (Storage) | 5-2120 | Biaya Listrik, Air, & Telepon Gudang | - | Jasa penyimpanan barang di gudang |
| 12 | Jasa Gudang | Jasa Bongkar Muat | 4-2210 | Pend. Jasa Penanganan Barang | 5-1120 | Biaya Bongkar Muat | - | Jasa penanganan bongkar muat barang |
| 13 | Jasa Gudang | Jasa Penanganan Barang | 4-2210 | Pend. Jasa Penanganan Barang | 5-1120 | Biaya Bongkar Muat | - | Jasa penanganan dan handling barang |

### D. PERSEDIAAN (INVENTORY)

| ID | Kategori Layanan | Jenis Layanan | Akun Pendapatan | Nama Akun Pendapatan | Akun HPP/Beban | Nama Akun HPP | Akun Aset | Deskripsi |
|----|------------------|---------------|-----------------|----------------------|----------------|---------------|-----------|-----------|
| 14 | Persediaan | Pembelian Kardus | - | - | - | - | 1-1400 | Pembelian bahan kemasan kardus |
| 15 | Persediaan | Pembelian Bubble Wrap | - | - | - | - | 1-1400 | Pembelian bahan kemasan bubble wrap |
| 16 | Persediaan | Pembelian Kayu Packing | - | - | - | - | 1-1400 | Pembelian bahan kemasan kayu |
| 17 | Persediaan | Pembelian Lakban | - | - | - | - | 1-1400 | Pembelian bahan kemasan lakban |
| 18 | Persediaan | Pembelian Plastik Wrapping | - | - | - | - | 1-1400 | Pembelian bahan kemasan plastik |

---

## 📝 TABEL 3: CONTOH TRANSAKSI & JURNAL

### Contoh 1: Penjualan Jasa Cargo Udara Domestik (Rp 10.000.000)

| Tanggal | Keterangan | Akun | Debit | Kredit |
|---------|------------|------|-------|--------|
| 01/01/2024 | Invoice #INV-001 | 1-1300 (Piutang Usaha) | 11.000.000 | - |
| 01/01/2024 | Invoice #INV-001 | 4-1110 (Pend. Cargo Udara Domestik) | - | 10.000.000 |
| 01/01/2024 | Invoice #INV-001 | 2-1510 (Hutang PPN Keluaran 11%) | - | 1.000.000 |

### Contoh 2: Pembelian Biaya Angkut ke Agen (Rp 7.000.000)

| Tanggal | Keterangan | Akun | Debit | Kredit |
|---------|------------|------|-------|--------|
| 01/01/2024 | Bayar Agen Cargo | 5-1110 (Biaya Angkut ke Agen Utama) | 7.000.000 | - |
| 01/01/2024 | Bayar Agen Cargo | 1-1700 (Piutang Pajak - PPN Masukan) | 770.000 | - |
| 01/01/2024 | Bayar Agen Cargo | 1-1200 (Kas di Bank) | - | 7.770.000 |

### Contoh 3: Pembelian Kardus untuk Persediaan (Rp 2.000.000)

| Tanggal | Keterangan | Akun | Debit | Kredit |
|---------|------------|------|-------|--------|
| 01/01/2024 | Beli Kardus | 1-1400 (Persediaan Bahan Kemasan) | 2.000.000 | - |
| 01/01/2024 | Beli Kardus | 1-1700 (Piutang Pajak - PPN Masukan) | 220.000 | - |
| 01/01/2024 | Beli Kardus | 1-1200 (Kas di Bank) | - | 2.220.000 |

### Contoh 4: Pemakaian Kardus untuk Packing (Rp 500.000)

| Tanggal | Keterangan | Akun | Debit | Kredit |
|---------|------------|------|-------|--------|
| 01/01/2024 | Pakai Kardus | 5-1140 (Biaya Kemasan/Packaging Material) | 500.000 | - |
| 01/01/2024 | Pakai Kardus | 1-1400 (Persediaan Bahan Kemasan) | - | 500.000 |

---

## 🎯 CARA EXPORT KE EXCEL/GOOGLE SHEETS

### Langkah 1: Copy Tabel di Atas
1. Copy seluruh tabel (TABEL 1, 2, dan 3)
2. Paste ke Excel atau Google Sheets

### Langkah 2: Format Excel
1. **Sheet 1**: "Master COA" - Paste TABEL 1
2. **Sheet 2**: "Mapping Rules" - Paste TABEL 2
3. **Sheet 3**: "Contoh Transaksi" - Paste TABEL 3

### Langkah 3: Styling (Opsional)
- Bold untuk header rows (Is Header = TRUE)
- Color coding:
  - Aset: Hijau
  - Kewajiban: Merah
  - Ekuitas: Biru
  - Pendapatan: Kuning
  - Beban: Orange

---

## 📥 DOWNLOAD TEMPLATE

Anda dapat menggunakan format di atas untuk:
1. Import ke software akuntansi (Accurate, Zahir, SAP, dll)
2. Setup di Google Sheets untuk kolaborasi tim
3. Dokumentasi internal perusahaan

---

**Catatan**: File ini siap untuk di-copy paste ke Excel/Google Sheets atau digunakan sebagai referensi untuk setup software akuntansi.
