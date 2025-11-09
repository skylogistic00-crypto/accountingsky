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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useToast } from "./ui/use-toast";
import { Pencil, Trash2, Plus, Package, ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useNavigate } from "react-router-dom";

interface BarangLini1Form {
  id?: string;
  nama_barang: string;
  sku: string;
  kode_barang: string;
  nomor_dokumen_pabean: string;
  tanggal_masuk: string;
  lama_simpan: string;
  berat: string;
  volume: string;
  lokasi: string;
  status: string;
  total_biaya: string;
}

interface BarangLini2Form {
  id?: string;
  sku: string;
  nama_barang: string;
  kode_barang: string;
  nomor_dokumen_pabean: string;
  asal: string;
  lokasi: string;
  tgl_masuk: string;
  tgl_keluar: string;
  hari_simpan: string;
  hari_di_lini_1: string;
  berat: string;
  volume: string;
  status: string;
}

export default function BarangLini() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("lini1");
  
  // Lini 1 states
  const [lini1Items, setLini1Items] = useState<any[]>([]);
  const [isLini1DialogOpen, setIsLini1DialogOpen] = useState(false);
  const [editingLini1Item, setEditingLini1Item] = useState<any>(null);
  const [lini1FormData, setLini1FormData] = useState<BarangLini1Form>({
    nama_barang: "",
    sku: "",
    kode_barang: "",
    nomor_dokumen_pabean: "",
    tanggal_masuk: new Date().toISOString().split("T")[0],
    lama_simpan: "",
    berat: "",
    volume: "",
    lokasi: "",
    status: "Tersedia",
    total_biaya: "",
  });

  // Lini 2 states
  const [lini2Items, setLini2Items] = useState<any[]>([]);
  const [isLini2DialogOpen, setIsLini2DialogOpen] = useState(false);
  const [editingLini2Item, setEditingLini2Item] = useState<any>(null);
  const [lini2FormData, setLini2FormData] = useState<BarangLini2Form>({
    sku: "",
    nama_barang: "",
    kode_barang: "",
    nomor_dokumen_pabean: "",
    asal: "",
    lokasi: "",
    tgl_masuk: new Date().toISOString().split("T")[0],
    tgl_keluar: "",
    hari_simpan: "",
    hari_di_lini_1: "",
    berat: "",
    volume: "",
    status: "Aktif",
  });

  useEffect(() => {
    fetchLini1Items();
    fetchLini2Items();

    const channel1 = supabase
      .channel("barang_lini_1_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "barang_lini_1" },
        () => {
          fetchLini1Items();
        }
      )
      .subscribe();

    const channel2 = supabase
      .channel("barang_lini_2_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "barang_lini_2" },
        () => {
          fetchLini2Items();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel1);
      supabase.removeChannel(channel2);
    };
  }, []);

  // Lini 1 functions
  const fetchLini1Items = async () => {
    try {
      const { data, error } = await supabase
        .from("barang_lini_1")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLini1Items(data || []);
    } catch (error) {
      console.error("Error fetching lini 1 items:", error);
    }
  };

  const handleLini1Submit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const itemData = {
        nama_barang: lini1FormData.nama_barang,
        sku: lini1FormData.sku,
        kode_barang: lini1FormData.kode_barang || null,
        nomor_dokumen_pabean: lini1FormData.nomor_dokumen_pabean || null,
        tanggal_masuk: lini1FormData.tanggal_masuk,
        lama_simpan: lini1FormData.lama_simpan ? parseInt(lini1FormData.lama_simpan) : null,
        berat: lini1FormData.berat ? parseFloat(lini1FormData.berat) : null,
        volume: lini1FormData.volume ? parseFloat(lini1FormData.volume) : null,
        lokasi: lini1FormData.lokasi || null,
        status: lini1FormData.status,
        total_biaya: lini1FormData.total_biaya ? parseFloat(lini1FormData.total_biaya) : null,
      };

      if (editingLini1Item) {
        const { error } = await supabase
          .from("barang_lini_1")
          .update(itemData)
          .eq("id", editingLini1Item.id);

        if (error) throw error;
        toast({ title: "Success", description: "Data barang berhasil diupdate" });
      } else {
        const { error } = await supabase.from("barang_lini_1").insert(itemData);
        if (error) throw error;
        toast({ title: "Success", description: "Data barang berhasil ditambahkan" });
      }

      resetLini1Form();
      setIsLini1DialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan data",
        variant: "destructive",
      });
    }
  };

  const handleLini1Edit = (item: any) => {
    setEditingLini1Item(item);
    setLini1FormData({
      nama_barang: item.nama_barang,
      sku: item.sku,
      kode_barang: item.kode_barang || "",
      nomor_dokumen_pabean: item.nomor_dokumen_pabean || "",
      tanggal_masuk: item.tanggal_masuk,
      lama_simpan: item.lama_simpan?.toString() || "",
      berat: item.berat?.toString() || "",
      volume: item.volume?.toString() || "",
      lokasi: item.lokasi || "",
      status: item.status,
      total_biaya: item.total_biaya?.toString() || "",
    });
    setIsLini1DialogOpen(true);
  };

  const handleLini1Delete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    try {
      const { error } = await supabase.from("barang_lini_1").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Data barang berhasil dihapus" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal menghapus data",
        variant: "destructive",
      });
    }
  };

  const resetLini1Form = () => {
    setLini1FormData({
      nama_barang: "",
      sku: "",
      kode_barang: "",
      nomor_dokumen_pabean: "",
      tanggal_masuk: new Date().toISOString().split("T")[0],
      lama_simpan: "",
      berat: "",
      volume: "",
      lokasi: "",
      status: "Tersedia",
      total_biaya: "",
    });
    setEditingLini1Item(null);
  };

  // Lini 2 functions
  const fetchLini2Items = async () => {
    try {
      const { data, error } = await supabase
        .from("barang_lini_2")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLini2Items(data || []);
    } catch (error) {
      console.error("Error fetching lini 2 items:", error);
    }
  };

  const handleLini2Submit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const itemData = {
        sku: lini2FormData.sku,
        nama_barang: lini2FormData.nama_barang,
        kode_barang: lini2FormData.kode_barang || null,
        nomor_dokumen_pabean: lini2FormData.nomor_dokumen_pabean || null,
        asal: lini2FormData.asal || null,
        lokasi: lini2FormData.lokasi || null,
        tgl_masuk: lini2FormData.tgl_masuk,
        tgl_keluar: lini2FormData.tgl_keluar || null,
        hari_simpan: lini2FormData.hari_simpan ? parseInt(lini2FormData.hari_simpan) : null,
        hari_di_lini_1: lini2FormData.hari_di_lini_1 ? parseInt(lini2FormData.hari_di_lini_1) : null,
        berat: lini2FormData.berat ? parseFloat(lini2FormData.berat) : null,
        volume: lini2FormData.volume ? parseFloat(lini2FormData.volume) : null,
        status: lini2FormData.status,
      };

      if (editingLini2Item) {
        const { error } = await supabase
          .from("barang_lini_2")
          .update(itemData)
          .eq("id", editingLini2Item.id);

        if (error) throw error;
        toast({ title: "Success", description: "Data barang berhasil diupdate" });
      } else {
        const { error } = await supabase.from("barang_lini_2").insert(itemData);
        if (error) throw error;
        toast({ title: "Success", description: "Data barang berhasil ditambahkan" });
      }

      resetLini2Form();
      setIsLini2DialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan data",
        variant: "destructive",
      });
    }
  };

  const handleLini2Edit = (item: any) => {
    setEditingLini2Item(item);
    setLini2FormData({
      sku: item.sku,
      nama_barang: item.nama_barang,
      kode_barang: item.kode_barang || "",
      nomor_dokumen_pabean: item.nomor_dokumen_pabean || "",
      asal: item.asal || "",
      lokasi: item.lokasi || "",
      tgl_masuk: item.tgl_masuk,
      tgl_keluar: item.tgl_keluar || "",
      hari_simpan: item.hari_simpan?.toString() || "",
      hari_di_lini_1: item.hari_di_lini_1?.toString() || "",
      berat: item.berat?.toString() || "",
      volume: item.volume?.toString() || "",
      status: item.status,
    });
    setIsLini2DialogOpen(true);
  };

  const handleLini2Delete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    try {
      const { error } = await supabase.from("barang_lini_2").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Data barang berhasil dihapus" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal menghapus data",
        variant: "destructive",
      });
    }
  };

  const resetLini2Form = () => {
    setLini2FormData({
      sku: "",
      nama_barang: "",
      kode_barang: "",
      nomor_dokumen_pabean: "",
      asal: "",
      lokasi: "",
      tgl_masuk: new Date().toISOString().split("T")[0],
      tgl_keluar: "",
      hari_simpan: "",
      hari_di_lini_1: "",
      berat: "",
      volume: "",
      status: "Aktif",
    });
    setEditingLini2Item(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header with gradient */}
      <div className="border-b bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 shadow-lg">
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
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Manajemen Barang Lini</h1>
                <p className="text-sm text-blue-100">Kelola barang lini 1 dan lini 2</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="border-none shadow-lg bg-purple-400/90 text-white hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-white/90">Barang Lini 1</CardDescription>
                <Package className="h-8 w-8 text-white/80" />
              </div>
              <CardTitle className="text-4xl font-bold">{lini1Items.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-white/90">
                <Package className="mr-2 h-4 w-4" />
                Total barang di lini 1
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-emerald-400/90 text-white hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-white/90">Barang Lini 2</CardDescription>
                <Package className="h-8 w-8 text-white/80" />
              </div>
              <CardTitle className="text-4xl font-bold">{lini2Items.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-white/90">
                <Package className="mr-2 h-4 w-4" />
                Total barang di lini 2
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 bg-gradient-to-r from-indigo-100 to-blue-100">
                <TabsTrigger value="lini1" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                  Barang Lini 1
                </TabsTrigger>
                <TabsTrigger value="lini2" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                  Barang Lini 2
                </TabsTrigger>
              </TabsList>

              {/* Lini 1 Tab */}
              <TabsContent value="lini1">
                <div className="flex justify-end mb-4">
                  <Dialog open={isLini1DialogOpen} onOpenChange={setIsLini1DialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetLini1Form} className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Barang Lini 1
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingLini1Item ? "Edit Barang Lini 1" : "Tambah Barang Lini 1"}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleLini1Submit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="nama_barang">Nama Barang *</Label>
                            <Input
                              id="nama_barang"
                              value={lini1FormData.nama_barang}
                              onChange={(e) =>
                                setLini1FormData({ ...lini1FormData, nama_barang: e.target.value })
                              }
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="sku">SKU *</Label>
                            <Input
                              id="sku"
                              value={lini1FormData.sku}
                              onChange={(e) =>
                                setLini1FormData({ ...lini1FormData, sku: e.target.value })
                              }
                              required
                              disabled={!!editingLini1Item}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="kode_barang">Kode Barang</Label>
                            <Input
                              id="kode_barang"
                              value={lini1FormData.kode_barang}
                              onChange={(e) =>
                                setLini1FormData({ ...lini1FormData, kode_barang: e.target.value })
                              }
                              placeholder="Masukkan kode barang"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="nomor_dokumen_pabean">Nomor Dokumen Pabean</Label>
                            <Input
                              id="nomor_dokumen_pabean"
                              value={lini1FormData.nomor_dokumen_pabean}
                              onChange={(e) =>
                                setLini1FormData({ ...lini1FormData, nomor_dokumen_pabean: e.target.value })
                              }
                              placeholder="Masukkan nomor dokumen pabean"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="tanggal_masuk">Tanggal Masuk *</Label>
                            <Input
                              id="tanggal_masuk"
                              type="date"
                              value={lini1FormData.tanggal_masuk}
                              onChange={(e) =>
                                setLini1FormData({ ...lini1FormData, tanggal_masuk: e.target.value })
                              }
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="lama_simpan">Lama Simpan (hari)</Label>
                            <Input
                              id="lama_simpan"
                              type="number"
                              value={lini1FormData.lama_simpan}
                              onChange={(e) =>
                                setLini1FormData({ ...lini1FormData, lama_simpan: e.target.value })
                              }
                              placeholder="0"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="berat">Berat (kg)</Label>
                            <Input
                              id="berat"
                              type="number"
                              step="0.01"
                              value={lini1FormData.berat}
                              onChange={(e) =>
                                setLini1FormData({ ...lini1FormData, berat: e.target.value })
                              }
                              placeholder="0.00"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="volume">Volume (m³)</Label>
                            <Input
                              id="volume"
                              type="number"
                              step="0.001"
                              value={lini1FormData.volume}
                              onChange={(e) =>
                                setLini1FormData({ ...lini1FormData, volume: e.target.value })
                              }
                              placeholder="0.000"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="lokasi">Lokasi</Label>
                            <Input
                              id="lokasi"
                              value={lini1FormData.lokasi}
                              onChange={(e) =>
                                setLini1FormData({ ...lini1FormData, lokasi: e.target.value })
                              }
                              placeholder="Contoh: Gudang A - Rak 1"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="status">Status *</Label>
                            <Select
                              value={lini1FormData.status}
                              onValueChange={(value) =>
                                setLini1FormData({ ...lini1FormData, status: value })
                              }
                            >
                              <SelectTrigger id="status">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Tersedia">Tersedia</SelectItem>
                                <SelectItem value="Dalam Proses">Dalam Proses</SelectItem>
                                <SelectItem value="Keluar">Keluar</SelectItem>
                                <SelectItem value="Rusak">Rusak</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="total_biaya">Total Biaya (Rp)</Label>
                            <Input
                              id="total_biaya"
                              type="number"
                              step="0.01"
                              value={lini1FormData.total_biaya}
                              onChange={(e) =>
                                setLini1FormData({ ...lini1FormData, total_biaya: e.target.value })
                              }
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsLini1DialogOpen(false);
                              resetLini1Form();
                            }}
                          >
                            Batal
                          </Button>
                          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                            {editingLini1Item ? "Update" : "Simpan"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-slate-100 to-blue-100 hover:from-slate-100 hover:to-blue-100">
                        <TableHead className="font-semibold text-slate-700">Nama Barang</TableHead>
                        <TableHead className="font-semibold text-slate-700">SKU</TableHead>
                        <TableHead className="font-semibold text-slate-700">Tanggal Masuk</TableHead>
                        <TableHead className="font-semibold text-slate-700">Lama Simpan</TableHead>
                        <TableHead className="font-semibold text-slate-700">Berat (kg)</TableHead>
                        <TableHead className="font-semibold text-slate-700">Volume (m³)</TableHead>
                        <TableHead className="font-semibold text-slate-700">Lokasi</TableHead>
                        <TableHead className="font-semibold text-slate-700">Status</TableHead>
                        <TableHead className="font-semibold text-slate-700">Total Biaya</TableHead>
                        <TableHead className="text-right font-semibold text-slate-700">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lini1Items.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center text-slate-500 py-12">
                            <div className="inline-block p-4 bg-slate-100 rounded-full mb-4">
                              <Package className="h-12 w-12 text-slate-300" />
                            </div>
                            <p className="font-medium text-lg">Belum ada data barang</p>
                            <p className="text-sm text-slate-400 mt-1">Klik tombol "Tambah Barang Lini 1" untuk menambahkan data</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        lini1Items.map((item) => (
                          <TableRow key={item.id} className="hover:bg-indigo-50 transition-colors">
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
                                  item.status === "Tersedia"
                                    ? "bg-green-100 text-green-800"
                                    : item.status === "Dalam Proses"
                                    ? "bg-blue-100 text-blue-800"
                                    : item.status === "Keluar"
                                    ? "bg-gray-100 text-gray-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {item.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              {item.total_biaya ? formatCurrency(item.total_biaya) : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleLini1Edit(item)}
                                  className="hover:bg-blue-50"
                                >
                                  <Pencil className="w-4 h-4 text-blue-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleLini1Delete(item.id)}
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
              </TabsContent>

              {/* Lini 2 Tab */}
              <TabsContent value="lini2">
                <div className="flex justify-end mb-4">
                  <Dialog open={isLini2DialogOpen} onOpenChange={setIsLini2DialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetLini2Form} className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Barang Lini 2
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingLini2Item ? "Edit Barang Lini 2" : "Tambah Barang Lini 2"}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleLini2Submit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="sku2">SKU *</Label>
                            <Input
                              id="sku2"
                              value={lini2FormData.sku}
                              onChange={(e) =>
                                setLini2FormData({ ...lini2FormData, sku: e.target.value })
                              }
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="nama_barang2">Nama Barang *</Label>
                            <Input
                              id="nama_barang2"
                              value={lini2FormData.nama_barang}
                              onChange={(e) =>
                                setLini2FormData({ ...lini2FormData, nama_barang: e.target.value })
                              }
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="kode_barang2">Kode Barang</Label>
                            <Input
                              id="kode_barang2"
                              value={lini2FormData.kode_barang}
                              onChange={(e) =>
                                setLini2FormData({ ...lini2FormData, kode_barang: e.target.value })
                              }
                              placeholder="Masukkan kode barang"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="nomor_dokumen_pabean2">Nomor Dokumen Pabean</Label>
                            <Input
                              id="nomor_dokumen_pabean2"
                              value={lini2FormData.nomor_dokumen_pabean}
                              onChange={(e) =>
                                setLini2FormData({ ...lini2FormData, nomor_dokumen_pabean: e.target.value })
                              }
                              placeholder="Masukkan nomor dokumen pabean"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="asal">Asal</Label>
                            <Input
                              id="asal"
                              value={lini2FormData.asal}
                              onChange={(e) =>
                                setLini2FormData({ ...lini2FormData, asal: e.target.value })
                              }
                              placeholder="Contoh: Lini 1, Supplier A"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="lokasi2">Lokasi</Label>
                            <Input
                              id="lokasi2"
                              value={lini2FormData.lokasi}
                              onChange={(e) =>
                                setLini2FormData({ ...lini2FormData, lokasi: e.target.value })
                              }
                              placeholder="Contoh: Gudang B - Rak 2"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="tgl_masuk">Tgl Masuk *</Label>
                            <Input
                              id="tgl_masuk"
                              type="date"
                              value={lini2FormData.tgl_masuk}
                              onChange={(e) =>
                                setLini2FormData({ ...lini2FormData, tgl_masuk: e.target.value })
                              }
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="tgl_keluar">Tgl Keluar</Label>
                            <Input
                              id="tgl_keluar"
                              type="date"
                              value={lini2FormData.tgl_keluar}
                              onChange={(e) =>
                                setLini2FormData({ ...lini2FormData, tgl_keluar: e.target.value })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="hari_simpan">Hari Simpan</Label>
                            <Input
                              id="hari_simpan"
                              type="number"
                              value={lini2FormData.hari_simpan}
                              onChange={(e) =>
                                setLini2FormData({ ...lini2FormData, hari_simpan: e.target.value })
                              }
                              placeholder="0"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="hari_di_lini_1">Hari di Lini 1</Label>
                            <Input
                              id="hari_di_lini_1"
                              type="number"
                              value={lini2FormData.hari_di_lini_1}
                              onChange={(e) =>
                                setLini2FormData({ ...lini2FormData, hari_di_lini_1: e.target.value })
                              }
                              placeholder="0"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="berat2">Berat (kg)</Label>
                            <Input
                              id="berat2"
                              type="number"
                              step="0.01"
                              value={lini2FormData.berat}
                              onChange={(e) =>
                                setLini2FormData({ ...lini2FormData, berat: e.target.value })
                              }
                              placeholder="0.00"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="volume2">Volume (m³)</Label>
                            <Input
                              id="volume2"
                              type="number"
                              step="0.001"
                              value={lini2FormData.volume}
                              onChange={(e) =>
                                setLini2FormData({ ...lini2FormData, volume: e.target.value })
                              }
                              placeholder="0.000"
                            />
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="status2">Status *</Label>
                            <Select
                              value={lini2FormData.status}
                              onValueChange={(value) =>
                                setLini2FormData({ ...lini2FormData, status: value })
                              }
                            >
                              <SelectTrigger id="status2">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Aktif">Aktif</SelectItem>
                                <SelectItem value="Dalam Proses">Dalam Proses</SelectItem>
                                <SelectItem value="Keluar">Keluar</SelectItem>
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
                              setIsLini2DialogOpen(false);
                              resetLini2Form();
                            }}
                          >
                            Batal
                          </Button>
                          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                            {editingLini2Item ? "Update" : "Simpan"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-slate-100 to-emerald-100 hover:from-slate-100 hover:to-emerald-100">
                        <TableHead className="font-semibold text-slate-700">SKU</TableHead>
                        <TableHead className="font-semibold text-slate-700">Nama Barang</TableHead>
                        <TableHead className="font-semibold text-slate-700">Asal</TableHead>
                        <TableHead className="font-semibold text-slate-700">Lokasi</TableHead>
                        <TableHead className="font-semibold text-slate-700">Tgl Masuk</TableHead>
                        <TableHead className="font-semibold text-slate-700">Tgl Keluar</TableHead>
                        <TableHead className="font-semibold text-slate-700">Hari Simpan</TableHead>
                        <TableHead className="font-semibold text-slate-700">Hari di Lini 1</TableHead>
                        <TableHead className="font-semibold text-slate-700">Berat (kg)</TableHead>
                        <TableHead className="font-semibold text-slate-700">Volume (m³)</TableHead>
                        <TableHead className="font-semibold text-slate-700">Status</TableHead>
                        <TableHead className="text-right font-semibold text-slate-700">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lini2Items.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={12} className="text-center text-slate-500 py-12">
                            <div className="inline-block p-4 bg-slate-100 rounded-full mb-4">
                              <Package className="h-12 w-12 text-slate-300" />
                            </div>
                            <p className="font-medium text-lg">Belum ada data barang</p>
                            <p className="text-sm text-slate-400 mt-1">Klik tombol "Tambah Barang Lini 2" untuk menambahkan data</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        lini2Items.map((item) => (
                          <TableRow key={item.id} className="hover:bg-emerald-50 transition-colors">
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
                                    : item.status === "Dalam Proses"
                                    ? "bg-blue-100 text-blue-800"
                                    : item.status === "Keluar"
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
                                  onClick={() => handleLini2Edit(item)}
                                  className="hover:bg-emerald-50"
                                >
                                  <Pencil className="w-4 h-4 text-emerald-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleLini2Delete(item.id)}
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
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}