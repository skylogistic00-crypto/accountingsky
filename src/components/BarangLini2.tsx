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
import { Pencil, Trash2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface BarangLini2 {
  id?: string;
  sku: string;
  kode_barang?: string;
  nomor_dokumen_pabean?: string;
  nama_barang: string;
  asal: string;
  lokasi: string;
  tgl_masuk: string;
  batas_waktu_pengambilan?: string;
  tgl_keluar: string;
  hari_simpan: string;
  hari_di_lini_1: string;
  berat: string;
  volume: string;
  status: string;
}

export default function BarangLini2() {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [lini1Items, setLini1Items] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<BarangLini2>({
    sku: "",
    kode_barang: "",
    nomor_dokumen_pabean: "",
    nama_barang: "",
    asal: "",
    lokasi: "",
    tgl_masuk: new Date().toISOString().split("T")[0],
    batas_waktu_pengambilan: "",
    tgl_keluar: "",
    hari_simpan: "",
    hari_di_lini_1: "",
    berat: "",
    volume: "",
    status: "Aktif",
  });

  useEffect(() => {
    fetchItems();
    fetchLini1Items();

    const channel = supabase
      .channel("barang_lini_2_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "barang_lini_2" },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLini1Items = async () => {
    try {
      const { data, error } = await supabase
        .from("barang_lini_1")
        .select("*")
        .eq("status", "aktif")
        .order("nama_barang", { ascending: true });

      if (error) throw error;
      setLini1Items(data || []);
    } catch (error) {
      console.error("Error fetching lini 1 items:", error);
    }
  };

  const handleLini1Select = async (lini1Id: string) => {
    const selectedLini1 = lini1Items.find(item => item.id === lini1Id);
    if (selectedLini1) {
      // Calculate hari di lini 1
      const tanggalMasukLini1 = new Date(selectedLini1.tanggal_masuk);
      const today = new Date();
      const hariDiLini1 = Math.floor((today.getTime() - tanggalMasukLini1.getTime()) / (1000 * 60 * 60 * 24));

      setFormData({
        ...formData,
        sku: selectedLini1.sku || "",
        kode_barang: selectedLini1.kode_barang || "",
        nomor_dokumen_pabean: selectedLini1.nomor_dokumen_pabean || "",
        nama_barang: selectedLini1.nama_barang || "",
        asal: "Lini 1",
        berat: selectedLini1.berat?.toString() || "",
        volume: selectedLini1.volume?.toString() || "",
        lokasi: selectedLini1.lokasi || "",
        hari_di_lini_1: hariDiLini1.toString(),
        batas_waktu_pengambilan: selectedLini1.batas_waktu_pengambilan || "",
      });
      
      toast({
        title: "Data Diisi Otomatis",
        description: `Data dari Lini 1: ${selectedLini1.nama_barang} berhasil dimuat`,
      });
    }
  };

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("barang_lini_2")
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
        sku: formData.sku,
        kode_barang: formData.kode_barang || null,
        nomor_dokumen_pabean: formData.nomor_dokumen_pabean || null,
        nama_barang: formData.nama_barang,
        asal: formData.asal || null,
        lokasi: formData.lokasi || null,
        tgl_masuk: formData.tgl_masuk,
        batas_waktu_pengambilan: formData.batas_waktu_pengambilan || null,
        tgl_keluar: formData.tgl_keluar || null,
        hari_simpan: formData.hari_simpan ? parseInt(formData.hari_simpan) : null,
        hari_di_lini_1: formData.hari_di_lini_1 ? parseInt(formData.hari_di_lini_1) : null,
        berat: formData.berat ? parseFloat(formData.berat) : null,
        volume: formData.volume ? parseFloat(formData.volume) : null,
        status: formData.status,
      };

      if (editingItem) {
        const { error } = await supabase
          .from("barang_lini_2")
          .update(itemData)
          .eq("id", editingItem.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Data barang berhasil diupdate",
        });
      } else {
        const { error } = await supabase.from("barang_lini_2").insert(itemData);

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
      sku: item.sku,
      kode_barang: item.kode_barang || "",
      nomor_dokumen_pabean: item.nomor_dokumen_pabean || "",
      nama_barang: item.nama_barang,
      asal: item.asal || "",
      lokasi: item.lokasi || "",
      tgl_masuk: item.tgl_masuk,
      batas_waktu_pengambilan: item.batas_waktu_pengambilan || "",
      tgl_keluar: item.tgl_keluar || "",
      hari_simpan: item.hari_simpan?.toString() || "",
      hari_di_lini_1: item.hari_di_lini_1?.toString() || "",
      berat: item.berat?.toString() || "",
      volume: item.volume?.toString() || "",
      status: item.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    try {
      const { error } = await supabase.from("barang_lini_2").delete().eq("id", id);

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

  const resetForm = () => {
    setFormData({
      sku: "",
      kode_barang: "",
      nomor_dokumen_pabean: "",
      nama_barang: "",
      asal: "",
      lokasi: "",
      tgl_masuk: new Date().toISOString().split("T")[0],
      batas_waktu_pengambilan: "",
      tgl_keluar: "",
      hari_simpan: "",
      hari_di_lini_1: "",
      berat: "",
      volume: "",
      status: "Aktif",
    });
    setEditingItem(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Barang Lini 2</h1>
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
                    <Label htmlFor="lini1_select">Pilih dari Lini 1 (Opsional)</Label>
                    <Select onValueChange={handleLini1Select}>
                      <SelectTrigger id="lini1_select">
                        <SelectValue placeholder="-- Pilih barang dari Lini 1 --" />
                      </SelectTrigger>
                      <SelectContent>
                        {lini1Items.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.nama_barang} - {item.sku} (Masuk: {new Date(item.tanggal_masuk).toLocaleDateString("id-ID")})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Pilih barang dari Lini 1 untuk mengisi data otomatis
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
                    <Label htmlFor="asal">Asal</Label>
                    <Input
                      id="asal"
                      value={formData.asal}
                      onChange={(e) =>
                        setFormData({ ...formData, asal: e.target.value })
                      }
                      placeholder="Contoh: Lini 1, Supplier A"
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
                      placeholder="Contoh: Gudang B - Zona 2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tgl_masuk">Tanggal Masuk *</Label>
                    <Input
                      id="tgl_masuk"
                      type="date"
                      value={formData.tgl_masuk}
                      onChange={(e) =>
                        setFormData({ ...formData, tgl_masuk: e.target.value })
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
                    <Label htmlFor="tgl_keluar">Tanggal Keluar</Label>
                    <Input
                      id="tgl_keluar"
                      type="date"
                      value={formData.tgl_keluar}
                      onChange={(e) =>
                        setFormData({ ...formData, tgl_keluar: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hari_simpan">Hari Simpan</Label>
                    <Input
                      id="hari_simpan"
                      type="number"
                      value={formData.hari_simpan}
                      onChange={(e) =>
                        setFormData({ ...formData, hari_simpan: e.target.value })
                      }
                      placeholder="Contoh: 15"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hari_di_lini_1">Hari di Lini 1</Label>
                    <Input
                      id="hari_di_lini_1"
                      type="number"
                      value={formData.hari_di_lini_1}
                      onChange={(e) =>
                        setFormData({ ...formData, hari_di_lini_1: e.target.value })
                      }
                      placeholder="Contoh: 10"
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
                      placeholder="Contoh: 8.5"
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
                      placeholder="Contoh: 1.5"
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
                        <SelectItem value="Aktif">Aktif</SelectItem>
                        <SelectItem value="Proses">Proses</SelectItem>
                        <SelectItem value="Selesai">Selesai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
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
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Nama Barang</TableHead>
                <TableHead>Asal</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Tgl Masuk</TableHead>
                <TableHead>Tgl Keluar</TableHead>
                <TableHead>Hari Simpan</TableHead>
                <TableHead>Hari di Lini 1</TableHead>
                <TableHead>Berat (kg)</TableHead>
                <TableHead>Volume (m³)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center text-slate-500">
                    Belum ada data barang
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.sku}</TableCell>
                    <TableCell>{item.nama_barang}</TableCell>
                    <TableCell>{item.asal || "-"}</TableCell>
                    <TableCell>{item.lokasi || "-"}</TableCell>
                    <TableCell>
                      {new Date(item.tgl_masuk).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell>
                      {item.tgl_keluar
                        ? new Date(item.tgl_keluar).toLocaleDateString("id-ID")
                        : "-"}
                    </TableCell>
                    <TableCell>{item.hari_simpan || "-"}</TableCell>
                    <TableCell>{item.hari_di_lini_1 || "-"}</TableCell>
                    <TableCell>{item.berat || "-"}</TableCell>
                    <TableCell>{item.volume || "-"}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === "Aktif"
                            ? "bg-green-100 text-green-800"
                            : item.status === "Proses"
                            ? "bg-blue-100 text-blue-800"
                            : item.status === "Selesai"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
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