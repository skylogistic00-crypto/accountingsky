import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from './ui/use-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Search, Download, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import Header from './Header';
import Navigation from './Navigation';

interface BarangLama {
  lokasi: string;
  id: string;
  nama_barang: string;
  tanggal_masuk_barang: string;
  batas_waktu_pengambilan: string | null;
  lama_penyimpanan: number;
  status_pengambilan: string;
  sisa_hari: number | null;
  created_at: string;
}

interface PerpindahanLini {
  id: string;
  sku: string;
  nama_barang: string;
  tanggal_masuk_lini_1: string;
  tanggal_pindah_ke_lini_2: string | null;
  tanggal_masuk_lini_2: string;
  hari_di_lini_1: number;
  hari_di_lini_2: number;
  total_hari_penyimpanan: number;
  status: string;
  created_at: string;
}

export default function BarangLamaReport() {
  const { toast } = useToast();
  const [barangLama, setBarangLama] = useState<BarangLama[]>([]);
  const [perpindahanLini, setPerpindahanLini] = useState<PerpindahanLini[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLokasi, setFilterLokasi] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBarangLama();
    fetchPerpindahanLini();

    const channel = supabase
      .channel('report-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stock' }, () => {
        fetchBarangLama();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'barang_lini_1' }, () => {
        fetchBarangLama();
        fetchPerpindahanLini();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'barang_lini_2' }, () => {
        fetchBarangLama();
        fetchPerpindahanLini();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBarangLama = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('v_report_barang_lama')
        .select('*')
        .order('lama_penyimpanan', { ascending: false });

      if (error) throw error;
      setBarangLama(data || []);
    } catch (error) {
      console.error('Error fetching barang lama:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data barang lama',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPerpindahanLini = async () => {
    try {
      const { data, error } = await supabase
        .from('v_report_perpindahan_lini')
        .select('*')
        .order('tanggal_masuk_lini_2', { ascending: false });

      if (error) throw error;
      setPerpindahanLini(data || []);
    } catch (error) {
      console.error('Error fetching perpindahan lini:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data perpindahan lini',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Terlambat':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Terlambat
        </Badge>;
      case 'Mendekati Batas':
        return <Badge variant="default" className="bg-yellow-500 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Mendekati Batas
        </Badge>;
      default:
        return <Badge variant="default" className="bg-green-500 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Normal
        </Badge>;
    }
  };

  const filteredBarangLama = barangLama.filter((item) => {
    const matchSearch = item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase());
    const matchLokasi = filterLokasi === 'all' || item.lokasi === filterLokasi;
    const matchStatus = filterStatus === 'all' || item.status_pengambilan === filterStatus;
    return matchSearch && matchLokasi && matchStatus;
  });

  const filteredPerpindahan = perpindahanLini.filter((item) =>
    item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0] || {});
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const stats = {
    total: barangLama.length,
    terlambat: barangLama.filter(b => b.status_pengambilan === 'Terlambat').length,
    mendekati: barangLama.filter(b => b.status_pengambilan === 'Mendekati Batas').length,
    normal: barangLama.filter(b => b.status_pengambilan === 'Normal').length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <Navigation />

      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Report Barang Lama & Perpindahan</h1>
            <p className="text-slate-600">Monitoring lama penyimpanan dan perpindahan barang antar lini</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Total Barang</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-red-600">Terlambat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.terlambat}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-yellow-600">Mendekati Batas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.mendekati}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-600">Normal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.normal}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="barang-lama" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="barang-lama">Barang Lama</TabsTrigger>
              <TabsTrigger value="perpindahan">Perpindahan Lini</TabsTrigger>
            </TabsList>

            {/* Tab Barang Lama */}
            <TabsContent value="barang-lama" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle>Report Barang Lama di Gudang</CardTitle>
                      <CardDescription>Monitoring lama penyimpanan dan batas waktu pengambilan</CardDescription>
                    </div>
                    <Button 
                      onClick={() => exportToCSV(filteredBarangLama, 'report_barang_lama')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input
                        placeholder="Cari nama barang..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={filterLokasi} onValueChange={setFilterLokasi}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Filter Lokasi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Lokasi</SelectItem>
                        <SelectItem value="Stock Gudang">Stock Gudang</SelectItem>
                        <SelectItem value="Lini 1">Lini 1</SelectItem>
                        <SelectItem value="Lini 2">Lini 2</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Filter Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="Mendekati Batas">Mendekati Batas</SelectItem>
                        <SelectItem value="Terlambat">Terlambat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Lokasi</TableHead>
                          <TableHead>Nama Barang</TableHead>
                          <TableHead>Tanggal Masuk</TableHead>
                          <TableHead>Lama Simpan</TableHead>
                          <TableHead>Batas Waktu</TableHead>
                          <TableHead>Sisa Hari</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              Loading...
                            </TableCell>
                          </TableRow>
                        ) : filteredBarangLama.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                              Tidak ada data
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredBarangLama.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <Badge variant="outline">{item.lokasi}</Badge>
                              </TableCell>
                              <TableCell className="font-medium">{item.nama_barang}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-slate-400" />
                                  {new Date(item.tanggal_masuk_barang).toLocaleDateString('id-ID')}
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="font-semibold">{item.lama_penyimpanan}</span> hari
                              </TableCell>
                              <TableCell>
                                {item.batas_waktu_pengambilan 
                                  ? new Date(item.batas_waktu_pengambilan).toLocaleDateString('id-ID')
                                  : '-'}
                              </TableCell>
                              <TableCell>
                                {item.sisa_hari !== null ? (
                                  <span className={item.sisa_hari < 0 ? 'text-red-600 font-semibold' : ''}>
                                    {item.sisa_hari} hari
                                  </span>
                                ) : '-'}
                              </TableCell>
                              <TableCell>{getStatusBadge(item.status_pengambilan)}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Perpindahan Lini */}
            <TabsContent value="perpindahan" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle>Report Perpindahan Lini</CardTitle>
                      <CardDescription>Tracking perpindahan barang dari Lini 1 ke Lini 2</CardDescription>
                    </div>
                    <Button 
                      onClick={() => exportToCSV(filteredPerpindahan, 'report_perpindahan_lini')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      placeholder="Cari SKU atau nama barang..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>SKU</TableHead>
                          <TableHead>Nama Barang</TableHead>
                          <TableHead>Masuk Lini 1</TableHead>
                          <TableHead>Pindah ke Lini 2</TableHead>
                          <TableHead>Hari di Lini 1</TableHead>
                          <TableHead>Hari di Lini 2</TableHead>
                          <TableHead>Total Hari</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPerpindahan.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                              Tidak ada data perpindahan
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredPerpindahan.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                              <TableCell className="font-medium">{item.nama_barang}</TableCell>
                              <TableCell>
                                {item.tanggal_masuk_lini_1 
                                  ? new Date(item.tanggal_masuk_lini_1).toLocaleDateString('id-ID')
                                  : '-'}
                              </TableCell>
                              <TableCell>
                                {item.tanggal_pindah_ke_lini_2 
                                  ? new Date(item.tanggal_pindah_ke_lini_2).toLocaleDateString('id-ID')
                                  : new Date(item.tanggal_masuk_lini_2).toLocaleDateString('id-ID')}
                              </TableCell>
                              <TableCell>
                                <span className="font-semibold">{item.hari_di_lini_1}</span> hari
                              </TableCell>
                              <TableCell>
                                <span className="font-semibold">{item.hari_di_lini_2}</span> hari
                              </TableCell>
                              <TableCell>
                                <span className="font-bold text-blue-600">{item.total_hari_penyimpanan}</span> hari
                              </TableCell>
                              <TableCell>
                                <Badge variant={item.status === 'Aktif' ? 'default' : 'secondary'}>
                                  {item.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
