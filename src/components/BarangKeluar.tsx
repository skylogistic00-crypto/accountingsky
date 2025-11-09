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
import { Pencil, Trash2, Plus, TruckIcon, ArrowLeft, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useNavigate } from "react-router-dom";

interface BarangKeluarForm {
  id?: string;
  sku: string;
  nama_barang: string;
  kode_barang: string;
  nomor_dokumen_pabean: string;
  tanggal_keluar: string;
  tujuan: string;
  jumlah: string;
  keterangan: string;
  status: string;
}

export default function BarangKeluar() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<BarangKeluarForm>({
    sku: "",
    nama_barang: "",
    kode_barang: "",
    nomor_dokumen_pabean: "",
    tanggal_keluar: new Date().toISOString().split("T")[0],
    tujuan: "",
    jumlah: "",
    keterangan: "",
    status: "Pending",
  });

  useEffect(() => {
    fetchItems();

    const channel = supabase
      .channel("barang_keluar_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "barang_keluar" },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("barang_keluar")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const itemData = {
        sku: formData.sku,
        nama_barang: formData.nama_barang,
        kode_barang: formData.kode_barang || null,
        nomor_dokumen_pabean: formData.nomor_dokumen_pabean || null,
        tanggal_keluar: formData.tanggal_keluar,
        tujuan: formData.tujuan || null,
        jumlah: formData.jumlah ? parseInt(formData.jumlah) : null,
        keterangan: formData.keterangan || null,
        status: formData.status,
      };

      if (editingItem) {
        const { error } = await supabase
          .from("barang_keluar")
          .update(itemData)
          .eq("id", editingItem.id);

        if (error) throw error;
        toast({ title: "Success", description: "Data barang keluar berhasil diupdate" });
      } else {
        const { error } = await supabase.from("barang_keluar").insert(itemData);
        if (error) throw error;
        toast({ title: "Success", description: "Data barang keluar berhasil ditambahkan" });
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error: any) {
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
      nama_barang: item.nama_barang,
      kode_barang: item.kode_barang || "",
      nomor_dokumen_pabean: item.nomor_dokumen_pabean || "",
      tanggal_keluar: item.tanggal_keluar,
      tujuan: item.tujuan || "",
      jumlah: item.jumlah?.toString() || "",
      keterangan: item.keterangan || "",
      status: item.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    try {
      const { error } = await supabase.from("barang_keluar").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Data barang keluar berhasil dihapus" });
    } catch (error: any) {
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
      nama_barang: "",
      kode_barang: "",
      nomor_dokumen_pabean: "",
      tanggal_keluar: new Date().toISOString().split("T")[0],
      tujuan: "",
      jumlah: "",
      keterangan: "",
      status: "Pending",
    });
    setEditingItem(null);
  };

  const pendingCount = items.filter(item => item.status === "Pending").length;
  const completedCount = items.filter(item => item.status === "Selesai").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-50">
      {/* Header with gradient */}
      <div className="border-b bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 shadow-lg">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <TruckIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Barang Keluar</h1>
                <p className="text-sm text-orange-100">Kelola barang yang keluar dari gudang</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-none shadow-lg bg-orange-400/90 text-white hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-white/90">Total Barang Keluar</CardDescription>
                <TruckIcon className="h-8 w-8 text-white/80" />
              </div>
              <CardTitle className="text-4xl font-bold">{items.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-white/90">
                <Package className="mr-2 h-4 w-4" />
                Total transaksi keluar
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-yellow-400/90 text-white hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-white/90">Pending</CardDescription>
                <Package className="h-8 w-8 text-white/80" />
              </div>
              <CardTitle className="text-4xl font-bold">{pendingCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-white/90">
                <Package className="mr-2 h-4 w-4" />
                Menunggu proses
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-green-400/90 text-white hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-white/90">Selesai</CardDescription>
                <Package className="h-8 w-8 text-white/80" />
              </div>
              <CardTitle className="text-4xl font-bold">{completedCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-white/90">
                <Package className="mr-2 h-4 w-4" />
                Sudah diproses
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Daftar Barang Keluar</h2>
                <p className="text-sm text-slate-500 mt-1">Kelola data barang yang keluar dari gudang</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm} className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Barang Keluar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? "Edit Barang Keluar" : "Tambah Barang Keluar"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sku">SKU *</Label>
                        <Input
                          id="sku"
                          value={formData.sku}
                          onChange={(e) =>
                            setFormData({ ...formData, sku: e.target.value })
                          }
                          required
                          placeholder="Masukkan SKU barang"
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
                          placeholder="Masukkan nama barang"
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
                        <Label htmlFor="tanggal_keluar">Tanggal Keluar *</Label>
                        <Input
                          id="tanggal_keluar"
                          type="date"
                          value={formData.tanggal_keluar}
                          onChange={(e) =>
                            setFormData({ ...formData, tanggal_keluar: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tujuan">Tujuan</Label>
                        <Input
                          id="tujuan"
                          value={formData.tujuan}
                          onChange={(e) =>
                            setFormData({ ...formData, tujuan: e.target.value })
                          }
                          placeholder="Contoh: Customer A, Cabang Jakarta"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="jumlah">Jumlah</Label>
                        <Input
                          id="jumlah"
                          type="number"
                          value={formData.jumlah}
                          onChange={(e) =>
                            setFormData({ ...formData, jumlah: e.target.value })
                          }
                          placeholder="0"
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
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Dalam Proses">Dalam Proses</SelectItem>
                            <SelectItem value="Selesai">Selesai</SelectItem>
                            <SelectItem value="Dibatalkan">Dibatalkan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="keterangan">Keterangan</Label>
                        <Input
                          id="keterangan"
                          value={formData.keterangan}
                          onChange={(e) =>
                            setFormData({ ...formData, keterangan: e.target.value })
                          }
                          placeholder="Catatan tambahan (opsional)"
                        />
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
                      <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
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
                  <TableRow className="bg-gradient-to-r from-slate-100 to-orange-100 hover:from-slate-100 hover:to-orange-100">
                    <TableHead className="font-semibold text-slate-700">SKU</TableHead>
                    <TableHead className="font-semibold text-slate-700">Nama Barang</TableHead>
                    <TableHead className="font-semibold text-slate-700">Tanggal Keluar</TableHead>
                    <TableHead className="font-semibold text-slate-700">Tujuan</TableHead>
                    <TableHead className="font-semibold text-slate-700">Jumlah</TableHead>
                    <TableHead className="font-semibold text-slate-700">Keterangan</TableHead>
                    <TableHead className="font-semibold text-slate-700">Status</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-slate-500 py-12">
                        <div className="inline-block p-4 bg-slate-100 rounded-full mb-4">
                          <TruckIcon className="h-12 w-12 text-slate-300" />
                        </div>
                        <p className="font-medium text-lg">Belum ada data barang keluar</p>
                        <p className="text-sm text-slate-400 mt-1">Klik tombol "Tambah Barang Keluar" untuk menambahkan data</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item.id} className="hover:bg-orange-50 transition-colors">
                        <TableCell className="font-medium">{item.sku}</TableCell>
                        <TableCell>{item.nama_barang}</TableCell>
                        <TableCell>
                          {new Date(item.tanggal_keluar).toLocaleDateString("id-ID")}
                        </TableCell>
                        <TableCell>{item.tujuan || "-"}</TableCell>
                        <TableCell>{item.jumlah || "-"}</TableCell>
                        <TableCell>{item.keterangan || "-"}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : item.status === "Dalam Proses"
                                ? "bg-blue-100 text-blue-800"
                                : item.status === "Selesai"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
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
                              className="hover:bg-orange-50"
                            >
                              <Pencil className="w-4 h-4 text-orange-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                              className="hover:bg-red-50"
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
      </div>
    </div>
  );
}