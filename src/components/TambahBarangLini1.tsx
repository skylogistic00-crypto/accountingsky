import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useToast } from "./ui/use-toast";
import { Plus, Check, ChevronsUpDown } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "../lib/utils";

interface StockItem {
  id: string;
  item_name: string;
  sku: string;
  kode_barang?: string;
}

interface InventoryItemForm {
  stock_id: string;
  nama_barang: string;
  sku: string;
  kode_barang: string;
  nomor_batch_lot: string;
  nomor_seri: string;
  jenis_barang: string;
  asal_barang: string;
  nomor_dokumen_pabean: string;
  tanggal_masuk: string;
  lama_simpan: string;
  berat: string;
  volume: string;
  lokasi: string;
  status: string;
  keterangan: string;
  harga_per_unit: string;
  qty: string;
  total_biaya: string;
  mata_uang: string;
  akun_persediaan: string;
  tanggal_posting_ceisa: string;
  sync_status: string;
}

export default function TambahBarangLini1() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [coaAccounts, setCoaAccounts] = useState<any[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [openStockCombobox, setOpenStockCombobox] = useState(false);
  const [formData, setFormData] = useState<InventoryItemForm>({
    stock_id: "",
    nama_barang: "",
    sku: "",
    kode_barang: "",
    nomor_batch_lot: "",
    nomor_seri: "",
    jenis_barang: "",
    asal_barang: "",
    nomor_dokumen_pabean: "",
    tanggal_masuk: new Date().toISOString().split("T")[0],
    lama_simpan: "",
    berat: "",
    volume: "",
    lokasi: "",
    status: "Tersedia",
    keterangan: "",
    harga_per_unit: "",
    qty: "1",
    total_biaya: "",
    mata_uang: "IDR",
    akun_persediaan: "",
    tanggal_posting_ceisa: "",
    sync_status: "Belum Terkirim",
  });

  useEffect(() => {
    fetchCOAAccounts();
    fetchStockItems();
  }, []);

  useEffect(() => {
    // Auto-calculate total_biaya
    const harga = parseFloat(formData.harga_per_unit) || 0;
    const qty = parseFloat(formData.qty) || 1;
    const total = harga * qty;
    setFormData(prev => ({ ...prev, total_biaya: total.toString() }));
  }, [formData.harga_per_unit, formData.qty]);

  const fetchCOAAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from("chart_of_accounts")
        .select("account_code, account_name")
        .ilike("account_name", "%persediaan%")
        .order("account_code", { ascending: true });

      if (error) throw error;
      setCoaAccounts(data || []);
    } catch (error) {
      console.error("Error fetching COA accounts:", error);
    }
  };

  const fetchStockItems = async () => {
    try {
      const { data, error } = await supabase
        .from("stock")
        .select("id, item_name, sku, kode_barang")
        .order("item_name", { ascending: true });

      if (error) throw error;
      setStockItems(data || []);
    } catch (error) {
      console.error("Error fetching stock items:", error);
    }
  };

  const handleStockSelect = (stockId: string) => {
    const selectedStock = stockItems.find(item => item.id === stockId);
    if (selectedStock) {
      setFormData({
        ...formData,
        stock_id: stockId,
        nama_barang: selectedStock.item_name,
        sku: selectedStock.sku,
        kode_barang: selectedStock.kode_barang || "",
      });
    }
    setOpenStockCombobox(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi field wajib
    if (!formData.nama_barang || !formData.sku || !formData.tanggal_masuk || !formData.status) {
      toast({
        title: "Validasi Gagal",
        description: "Nama Barang, SKU, Tanggal Masuk, dan Status wajib diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      const itemData = {
        stock_id: formData.stock_id || null,
        nama_barang: formData.nama_barang,
        sku: formData.sku,
        kode_barang: formData.kode_barang || null,
        nomor_batch_lot: formData.nomor_batch_lot || null,
        nomor_seri: formData.nomor_seri || null,
        jenis_barang: formData.jenis_barang || null,
        asal_barang: formData.asal_barang || null,
        nomor_dokumen_pabean: formData.nomor_dokumen_pabean || null,
        tanggal_masuk: formData.tanggal_masuk,
        lama_simpan: formData.lama_simpan ? parseInt(formData.lama_simpan) : null,
        berat: formData.berat ? parseFloat(formData.berat) : null,
        volume: formData.volume ? parseFloat(formData.volume) : null,
        lokasi: formData.lokasi || null,
        status: formData.status,
        keterangan: formData.keterangan || null,
        harga_per_unit: formData.harga_per_unit ? parseFloat(formData.harga_per_unit) : null,
        total_biaya: formData.total_biaya ? parseFloat(formData.total_biaya) : null,
        mata_uang: formData.mata_uang,
        akun_persediaan: formData.akun_persediaan || null,
        dibuat_oleh: user?.email || null,
        tanggal_posting_ceisa: formData.tanggal_posting_ceisa || null,
        sync_status: formData.sync_status,
      };

      const { error } = await supabase.from("inventory_items").insert(itemData);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Data barang berhasil ditambahkan",
      });

      resetForm();
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving item:", error);
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan data",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      stock_id: "",
      nama_barang: "",
      sku: "",
      kode_barang: "",
      nomor_batch_lot: "",
      nomor_seri: "",
      jenis_barang: "",
      asal_barang: "",
      nomor_dokumen_pabean: "",
      tanggal_masuk: new Date().toISOString().split("T")[0],
      lama_simpan: "",
      berat: "",
      volume: "",
      lokasi: "",
      status: "Tersedia",
      keterangan: "",
      harga_per_unit: "",
      qty: "1",
      total_biaya: "",
      mata_uang: "IDR",
      akun_persediaan: "",
      tanggal_posting_ceisa: "",
      sync_status: "Belum Terkirim",
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Barang Lini 1
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Tambah Barang Lini 1
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1️⃣ Identitas Barang */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-slate-800 border-b pb-2">
              1️⃣ Identitas Barang
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="nama_barang">
                  Nama Barang <span className="text-red-500">*</span>
                </Label>
                <Popover open={openStockCombobox} onOpenChange={setOpenStockCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={openStockCombobox}
                      className="w-full justify-between"
                    >
                      {formData.nama_barang || "Pilih barang dari stock..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[600px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Cari barang..." />
                      <CommandEmpty>Barang tidak ditemukan.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {stockItems.map((item) => (
                          <CommandItem
                            key={item.id}
                            value={item.item_name}
                            onSelect={() => handleStockSelect(item.id)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.stock_id === item.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">{item.item_name}</span>
                              <span className="text-xs text-gray-500">SKU: {item.sku}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sku">
                  SKU <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                  required
                  className="bg-gray-50"
                  readOnly
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="kode_barang">Kode Barang</Label>
                <Input
                  id="kode_barang"
                  value={formData.kode_barang}
                  onChange={(e) =>
                    setFormData({ ...formData, kode_barang: e.target.value })
                  }
                  className="bg-gray-50"
                  readOnly
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nomor_batch_lot">Nomor Batch / Lot</Label>
                <Input
                  id="nomor_batch_lot"
                  value={formData.nomor_batch_lot}
                  onChange={(e) =>
                    setFormData({ ...formData, nomor_batch_lot: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nomor_seri">Nomor Seri</Label>
                <Input
                  id="nomor_seri"
                  value={formData.nomor_seri}
                  onChange={(e) =>
                    setFormData({ ...formData, nomor_seri: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="jenis_barang">Jenis Barang</Label>
                <Select
                  value={formData.jenis_barang}
                  onValueChange={(value) =>
                    setFormData({ ...formData, jenis_barang: value })
                  }
                >
                  <SelectTrigger id="jenis_barang">
                    <SelectValue placeholder="Pilih jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Berikat">Berikat</SelectItem>
                    <SelectItem value="Non-Berikat">Non-Berikat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="asal_barang">Asal Barang</Label>
                <Select
                  value={formData.asal_barang}
                  onValueChange={(value) =>
                    setFormData({ ...formData, asal_barang: value })
                  }
                >
                  <SelectTrigger id="asal_barang">
                    <SelectValue placeholder="Pilih asal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Impor">Impor</SelectItem>
                    <SelectItem value="Lokal">Lokal</SelectItem>
                    <SelectItem value="Produksi Dalam Negeri">Produksi Dalam Negeri</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 2️⃣ Dokumen Pabean */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-slate-800 border-b pb-2">
              2️⃣ Dokumen Pabean
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="nomor_dokumen_pabean">Nomor Dokumen Pabean</Label>
                <Input
                  id="nomor_dokumen_pabean"
                  value={formData.nomor_dokumen_pabean}
                  onChange={(e) =>
                    setFormData({ ...formData, nomor_dokumen_pabean: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tanggal_masuk">
                  Tanggal Masuk <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="tanggal_masuk"
                  type="date"
                  value={formData.tanggal_masuk}
                  onChange={(e) =>
                    setFormData({ ...formData, tanggal_masuk: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lama_simpan">Lama Simpan (hari)</Label>
                <Input
                  id="lama_simpan"
                  type="number"
                  value={formData.lama_simpan}
                  onChange={(e) =>
                    setFormData({ ...formData, lama_simpan: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="berat">Berat (kg)</Label>
                <Input
                  id="berat"
                  type="number"
                  step="0.01"
                  value={formData.berat}
                  onChange={(e) =>
                    setFormData({ ...formData, berat: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="volume">Volume (m³)</Label>
                <Input
                  id="volume"
                  type="number"
                  step="0.001"
                  value={formData.volume}
                  onChange={(e) =>
                    setFormData({ ...formData, volume: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* 3️⃣ Lokasi & Status */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-slate-800 border-b pb-2">
              3️⃣ Lokasi & Status
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="lokasi">Lokasi</Label>
                <Input
                  id="lokasi"
                  value={formData.lokasi}
                  onChange={(e) =>
                    setFormData({ ...formData, lokasi: e.target.value })
                  }
                  placeholder="Contoh: Gudang A - Rak 1"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status">
                  Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tersedia">Tersedia</SelectItem>
                    <SelectItem value="Terpakai">Terpakai</SelectItem>
                    <SelectItem value="Dipindahkan">Dipindahkan</SelectItem>
                    <SelectItem value="Rusak">Rusak</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="keterangan">Keterangan</Label>
                <Textarea
                  id="keterangan"
                  value={formData.keterangan}
                  onChange={(e) =>
                    setFormData({ ...formData, keterangan: e.target.value })
                  }
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* 4️⃣ Nilai Barang */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-slate-800 border-b pb-2">
              4️⃣ Nilai Barang
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="harga_per_unit">Harga per Unit</Label>
                <Input
                  id="harga_per_unit"
                  type="number"
                  step="0.01"
                  value={formData.harga_per_unit}
                  onChange={(e) =>
                    setFormData({ ...formData, harga_per_unit: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="qty">Quantity</Label>
                <Input
                  id="qty"
                  type="number"
                  value={formData.qty}
                  onChange={(e) =>
                    setFormData({ ...formData, qty: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="total_biaya">Total Biaya (Auto)</Label>
                <Input
                  id="total_biaya"
                  type="number"
                  step="0.01"
                  value={formData.total_biaya}
                  readOnly
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mata_uang">Mata Uang</Label>
                <Select
                  value={formData.mata_uang}
                  onValueChange={(value) =>
                    setFormData({ ...formData, mata_uang: value })
                  }
                >
                  <SelectTrigger id="mata_uang">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IDR">IDR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="akun_persediaan">Akun Persediaan</Label>
                <Select
                  value={formData.akun_persediaan}
                  onValueChange={(value) =>
                    setFormData({ ...formData, akun_persediaan: value })
                  }
                >
                  <SelectTrigger id="akun_persediaan">
                    <SelectValue placeholder="Pilih akun persediaan" />
                  </SelectTrigger>
                  <SelectContent>
                    {coaAccounts.map((account) => (
                      <SelectItem key={account.account_code} value={account.account_name}>
                        {account.account_code} - {account.account_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 5️⃣ Audit & Sinkronisasi */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-slate-800 border-b pb-2">
              5️⃣ Audit & Sinkronisasi
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dibuat_oleh">Dibuat Oleh (Auto)</Label>
                <Input
                  id="dibuat_oleh"
                  value={user?.email || ""}
                  readOnly
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tanggal_posting_ceisa">Tanggal Posting CEISA</Label>
                <Input
                  id="tanggal_posting_ceisa"
                  type="date"
                  value={formData.tanggal_posting_ceisa}
                  onChange={(e) =>
                    setFormData({ ...formData, tanggal_posting_ceisa: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="sync_status">Sync Status</Label>
                <Select
                  value={formData.sync_status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, sync_status: value })
                  }
                >
                  <SelectTrigger id="sync_status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Belum Terkirim">Belum Terkirim</SelectItem>
                    <SelectItem value="Terkirim ke WMS">Terkirim ke WMS</SelectItem>
                    <SelectItem value="Terkirim ke CEISA">Terkirim ke CEISA</SelectItem>
                    <SelectItem value="Selesai">Selesai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                resetForm();
              }}
            >
              Batal
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}