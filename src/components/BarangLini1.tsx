import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { useToast } from "./ui/use-toast";
import { Pencil, Trash2, Plus, Calculator, ArrowRight, PackageCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";

interface BarangLini1 {
  nama_barang: string;
  sku: string;
  kode_barang: string;
  nomor_dokumen_pabean: string;
  tanggal_masuk: string;
  batas_waktu_pengambilan: string;
  lama_simpan: string;
  berat: string;
  volume: string;
  lokasi: string;
  status: string;
  total_biaya: string;
  wms_reference_number: string;
  ceisa_document_number: string;
  ceisa_document_type: string;
  ceisa_document_date: string;
  ceisa_status: string;
  wms_notes: string;
  ceisa_notes: string;
}

export default function BarangLini1() {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<BarangLini1>({
    nama_barang: "",
    sku: "",
    kode_barang: "",
    nomor_dokumen_pabean: "",
    tanggal_masuk: new Date().toISOString().split("T")[0],
    batas_waktu_pengambilan: "",
    lama_simpan: "",
    berat: "",
    volume: "",
    lokasi: "",
    status: "aktif",
    total_biaya: "",
    wms_reference_number: "",
    ceisa_document_number: "",
    ceisa_document_type: "",
    ceisa_document_date: "",
    ceisa_status: "",
    wms_notes: "",
    ceisa_notes: "",
  });

  useEffect(() => {
    fetchItems();
    fetchStockItems();

    const channel = supabase
      .channel("barang_lini_1_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "barang_lini_1" },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStockItems = async () => {
    try {
      const { data, error } = await supabase
        .from("stock")
        .select("*")
        .order("item_name", { ascending: true });

      if (error) {
        console.error("Error fetching stock:", error);
        toast({
          title: "Warning",
          description: "Gagal memuat data stock: " + error.message,
          variant: "destructive",
        });
        return;
      }
      
      console.log("Stock items loaded:", data?.length || 0);
      setStockItems(data || []);
      
      if (!data || data.length === 0) {
        toast({
          title: "Info",
          description: "Belum ada data stock tersedia",
        });
      }
    } catch (error: any) {
      console.error("Error fetching stock items:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data stock",
        variant: "destructive",
      });
    }
  };

  const handleStockSelect = (stockId: string) => {
    console.log("Selected stock ID:", stockId);
    const selectedStock = stockItems.find(item => item.id === stockId);
    console.log("Selected stock:", selectedStock);
    
    if (selectedStock) {
      setFormData({
        ...formData,
        nama_barang: selectedStock.item_name || "",
        sku: selectedStock.barcode || "",
        berat: selectedStock.weight?.toString() || "",
        volume: selectedStock.volume?.toString() || "",
        lokasi: selectedStock.warehouse_id || "",
      });
      
      toast({
        title: "Data Diisi Otomatis",
        description: `Data dari stock ${selectedStock.item_name} berhasil dimuat`,
      });
    } else {
      toast({
        title: "Error",
        description: "Stock tidak ditemukan",
        variant: "destructive",
      });
    }
  };

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("barang_lini_1")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching items:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data barang",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const itemData = {
        nama_barang: formData.nama_barang,
        sku: formData.sku,
        kode_barang: formData.kode_barang || null,
        nomor_dokumen_pabean: formData.nomor_dokumen_pabean || null,
        tanggal_masuk: formData.tanggal_masuk,
        batas_waktu_pengambilan: formData.batas_waktu_pengambilan || null,
        lama_simpan: formData.lama_simpan ? parseInt(formData.lama_simpan) : null,
        berat: formData.berat ? parseFloat(formData.berat) : null,
        volume: formData.volume ? parseFloat(formData.volume) : null,
        lokasi: formData.lokasi || null,
        status: formData.status,
        total_biaya: formData.total_biaya ? parseFloat(formData.total_biaya) : null,
        wms_reference_number: formData.wms_reference_number || null,
        ceisa_document_number: formData.ceisa_document_number || null,
        ceisa_document_type: formData.ceisa_document_type || null,
        ceisa_document_date: formData.ceisa_document_date || null,
        ceisa_status: formData.ceisa_status || null,
        wms_notes: formData.wms_notes || null,
        ceisa_notes: formData.ceisa_notes || null,
      };

      if (editingItem) {
        const { error } = await supabase
          .from("barang_lini_1")
          .update(itemData)
          .eq("id", editingItem.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Data barang berhasil diupdate",
        });
      } else {
        const { error } = await supabase.from("barang_lini_1").insert(itemData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Data barang berhasil ditambahkan",
        });
      }

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

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      nama_barang: item.nama_barang,
      sku: item.sku,
      kode_barang: item.kode_barang || "",
      nomor_dokumen_pabean: item.nomor_dokumen_pabean || "",
      tanggal_masuk: item.tanggal_masuk,
      batas_waktu_pengambilan: item.batas_waktu_pengambilan || "",
      lama_simpan: item.lama_simpan?.toString() || "",
      berat: item.berat?.toString() || "",
      volume: item.volume?.toString() || "",
      lokasi: item.lokasi || "",
      status: item.status,
      total_biaya: item.total_biaya?.toString() || "",
      wms_reference_number: item.wms_reference_number || "",
      ceisa_document_number: item.ceisa_document_number || "",
      ceisa_document_type: item.ceisa_document_type || "",
      ceisa_document_date: item.ceisa_document_date || "",
      ceisa_status: item.ceisa_status || "",
      wms_notes: item.wms_notes || "",
      ceisa_notes: item.ceisa_notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    try {
      const { error } = await supabase.from("barang_lini_1").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Data barang berhasil dihapus",
      });
    } catch (error: any) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus data",
        variant: "destructive",
      });
    }
  };

  const handleHitungUlangSewa = async (item: any) => {
    toast({
      title: "Hitung Ulang Sewa",
      description: `Menghitung ulang biaya sewa untuk ${item.nama_barang}`,
    });
  };

  const handlePindahkanLini2 = async (item: any) => {
    if (!confirm(`Pindahkan ${item.nama_barang} ke Lini 2?`)) return;

    try {
      const { error: updateError } = await supabase
        .from("barang_lini_1")
        .update({ status: "dipindahkan" })
        .eq("id", item.id);

      if (updateError) throw updateError;

      const { error: insertError } = await supabase.from("barang_lini_2").insert({
        nama_barang: item.nama_barang,
        sku: item.sku,
        kode_barang: item.kode_barang,
        nomor_dokumen_pabean: item.nomor_dokumen_pabean,
        tanggal_masuk: item.tanggal_masuk,
        lama_simpan: item.lama_simpan,
        berat: item.berat,
        volume: item.volume,
        lokasi: item.lokasi,
        status: "aktif",
        total_biaya: item.total_biaya,
      });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: `${item.nama_barang} berhasil dipindahkan ke Lini 2`,
      });
    } catch (error: any) {
      console.error("Error moving to lini 2:", error);
      toast({
        title: "Error",
        description: "Gagal memindahkan barang ke Lini 2",
        variant: "destructive",
      });
    }
  };

  const handleBarangDiambil = async (item: any) => {
    if (!confirm(`Tandai ${item.nama_barang} sebagai diambil supplier?`)) return;

    try {
      const { error } = await supabase
        .from("barang_lini_1")
        .update({ status: "diambil" })
        .eq("id", item.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${item.nama_barang} ditandai sebagai diambil supplier`,
      });
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Gagal mengupdate status barang",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nama_barang: "",
      sku: "",
      kode_barang: "",
      nomor_dokumen_pabean: "",
      tanggal_masuk: new Date().toISOString().split("T")[0],
      batas_waktu_pengambilan: "",
      lama_simpan: "",
      berat: "",
      volume: "",
      lokasi: "",
      status: "aktif",
      total_biaya: "",
      wms_reference_number: "",
      ceisa_document_number: "",
      ceisa_document_type: "",
      ceisa_document_date: "",
      ceisa_status: "",
      wms_notes: "",
      ceisa_notes: "",
    });
    setEditingItem(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Barang Lini 1</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Barang
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Edit Barang" : "Tambah Barang Baru"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="stock_select">Pilih dari Stock (Opsional)</Label>
                    <Select onValueChange={handleStockSelect}>
                      <SelectTrigger id="stock_select">
                        <SelectValue placeholder="-- Pilih barang dari stock --" />
                      </SelectTrigger>
                      <SelectContent>
                        {stockItems.map((stock) => (
                          <SelectItem key={stock.id} value={stock.id}>
                            {stock.item_name} - {stock.barcode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Pilih barang dari stock untuk mengisi data otomatis
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData({ ...formData, sku: e.target.value })
                      }
                      required
                      disabled={!!editingItem}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nama_barang">Nama Barang *</Label>
                    <Input
                      id="nama_barang"
                      value={formData.nama_barang}
                      onChange={(e) =>
                        setFormData({ ...formData, nama_barang: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="kode_barang">Kode Barang</Label>
                    <Input
                      id="kode_barang"
                      value={formData.kode_barang}
                      onChange={(e) =>
                        setFormData({ ...formData, kode_barang: e.target.value })
                      }
                      placeholder="Masukkan kode barang"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nomor_dokumen_pabean">Nomor Dokumen Pabean</Label>
                    <Input
                      id="nomor_dokumen_pabean"
                      value={formData.nomor_dokumen_pabean}
                      onChange={(e) =>
                        setFormData({ ...formData, nomor_dokumen_pabean: e.target.value })
                      }
                      placeholder="Masukkan nomor dokumen pabean"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tanggal_masuk">Tanggal Masuk *</Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="batas_waktu_pengambilan">Batas Waktu Pengambilan</Label>
                    <Input
                      id="batas_waktu_pengambilan"
                      type="date"
                      value={formData.batas_waktu_pengambilan}
                      onChange={(e) =>
                        setFormData({ ...formData, batas_waktu_pengambilan: e.target.value })
                      }
                    />
                    <p className="text-xs text-gray-500">
                      Tanggal batas waktu untuk pengambilan barang
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lama_simpan">Lama Simpan (hari)</Label>
                    <Input
                      id="lama_simpan"
                      type="number"
                      value={formData.lama_simpan}
                      onChange={(e) =>
                        setFormData({ ...formData, lama_simpan: e.target.value })
                      }
                      placeholder="Contoh: 30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="berat">Berat (kg)</Label>
                    <Input
                      id="berat"
                      type="number"
                      step="0.01"
                      value={formData.berat}
                      onChange={(e) =>
                        setFormData({ ...formData, berat: e.target.value })
                      }
                      placeholder="Contoh: 10.5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="volume">Volume (m³)</Label>
                    <Input
                      id="volume"
                      type="number"
                      step="0.01"
                      value={formData.volume}
                      onChange={(e) =>
                        setFormData({ ...formData, volume: e.target.value })
                      }
                      placeholder="Contoh: 2.5"
                    />
                  </div>

                  <div className="space-y-2">
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

                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
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
                        <SelectItem value="aktif">Aktif</SelectItem>
                        <SelectItem value="dipindahkan">Dipindahkan</SelectItem>
                        <SelectItem value="diambil">Diambil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="total_biaya">Total Biaya</Label>
                    <Input
                      id="total_biaya"
                      type="number"
                      value={formData.total_biaya}
                      onChange={(e) =>
                        setFormData({ ...formData, total_biaya: e.target.value })
                      }
                    />
                  </div>

                  {/* WMS/CEISA Section */}
                  <div className="md:col-span-2 border-t pt-4 mt-4">
                    <h3 className="text-lg font-semibold mb-4">Informasi WMS/CEISA</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="wms_reference_number">Nomor Referensi WMS</Label>
                        <Input
                          id="wms_reference_number"
                          value={formData.wms_reference_number}
                          onChange={(e) =>
                            setFormData({ ...formData, wms_reference_number: e.target.value })
                          }
                          placeholder="WMS-2024-XXXX"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ceisa_document_number">Nomor Dokumen CEISA</Label>
                        <Input
                          id="ceisa_document_number"
                          value={formData.ceisa_document_number}
                          onChange={(e) =>
                            setFormData({ ...formData, ceisa_document_number: e.target.value })
                          }
                          placeholder="000000-XXXXXX-XXXXXXXX"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ceisa_document_type">Jenis Dokumen CEISA</Label>
                        <Select
                          value={formData.ceisa_document_type}
                          onValueChange={(value) =>
                            setFormData({ ...formData, ceisa_document_type: value })
                          }
                        >
                          <SelectTrigger id="ceisa_document_type">
                            <SelectValue placeholder="Pilih jenis dokumen" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BC 2.3">BC 2.3 - Pemberitahuan Impor Barang</SelectItem>
                            <SelectItem value="BC 4.0">BC 4.0 - Pemberitahuan Ekspor Barang</SelectItem>
                            <SelectItem value="BC 2.5">BC 2.5 - Pemberitahuan Impor Barang Khusus</SelectItem>
                            <SelectItem value="BC 3.0">BC 3.0 - Pemberitahuan Ekspor Barang Khusus</SelectItem>
                            <SelectItem value="BC 1.1">BC 1.1 - Pemberitahuan Pabean</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ceisa_document_date">Tanggal Dokumen CEISA</Label>
                        <Input
                          id="ceisa_document_date"
                          type="date"
                          value={formData.ceisa_document_date}
                          onChange={(e) =>
                            setFormData({ ...formData, ceisa_document_date: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ceisa_status">Status CEISA</Label>
                        <Select
                          value={formData.ceisa_status}
                          onValueChange={(value) =>
                            setFormData({ ...formData, ceisa_status: value })
                          }
                        >
                          <SelectTrigger id="ceisa_status">
                            <SelectValue placeholder="Pilih status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Submitted">Submitted</SelectItem>
                            <SelectItem value="Approved">Approved</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="wms_notes">Catatan WMS</Label>
                        <Textarea
                          id="wms_notes"
                          value={formData.wms_notes}
                          onChange={(e) =>
                            setFormData({ ...formData, wms_notes: e.target.value })
                          }
                          placeholder="Catatan tambahan untuk WMS"
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="ceisa_notes">Catatan CEISA</Label>
                        <Textarea
                          id="ceisa_notes"
                          value={formData.ceisa_notes}
                          onChange={(e) =>
                            setFormData({ ...formData, ceisa_notes: e.target.value })
                          }
                          placeholder="Catatan tambahan untuk CEISA"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter>
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
                  <Button type="submit">
                    {editingItem ? "Update" : "Simpan"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Barang</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Tanggal Masuk</TableHead>
                <TableHead>Lama Simpan</TableHead>
                <TableHead>Berat (kg)</TableHead>
                <TableHead>Volume (m³)</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Biaya</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-slate-500">
                    Belum ada data barang
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.nama_barang}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>
                      {new Date(item.tanggal_masuk).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell>{item.lama_simpan || "-"} hari</TableCell>
                    <TableCell>{item.berat || "-"}</TableCell>
                    <TableCell>{item.volume || "-"}</TableCell>
                    <TableCell>{item.lokasi || "-"}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === "aktif"
                            ? "bg-green-100 text-green-800"
                            : item.status === "dipindahkan"
                            ? "bg-blue-100 text-blue-800"
                            : item.status === "diambil"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.status === "aktif" ? "Aktif" : item.status === "dipindahkan" ? "Dipindahkan" : "Diambil"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {item.total_biaya ? formatCurrency(item.total_biaya) : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleHitungUlangSewa(item)}
                          disabled={item.status !== "aktif"}
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          <Calculator className="w-4 h-4 mr-1" />
                          Hitung Ulang Sewa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePindahkanLini2(item)}
                          disabled={item.status !== "aktif"}
                          className="text-purple-600 hover:bg-purple-50"
                        >
                          <ArrowRight className="w-4 h-4 mr-1" />
                          Pindahkan ke Lini 2
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBarangDiambil(item)}
                          disabled={item.status !== "aktif"}
                          className="text-green-600 hover:bg-green-50"
                        >
                          <PackageCheck className="w-4 h-4 mr-1" />
                          Barang Diambil Supplier
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}