import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Download, Filter, Search } from "lucide-react";

interface FinancialReportData {
  report_type: string;
  section: string;
  account_code: string;
  account_name: string;
  debit_total: number;
  credit_total: number;
  amount: number;
}

export default function IntegratedFinancialReport() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<FinancialReportData[]>([]);
  const [filteredData, setFilteredData] = useState<FinancialReportData[]>([]);

  const [reportType, setReportType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchReportData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reportType, searchQuery, reportData]);

  const fetchReportData = async () => {
    setLoading(true);

    // Fetch from journal_entries directly
    const { data: journalEntries, error: journalError } = await supabase
      .from("journal_entries")
      .select("*")
      .order("account_code", { ascending: true });


    if (journalError) {
      toast({
        title: "Error",
        description: `Gagal memuat data laporan keuangan: ${journalError.message}`,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Group by account and calculate totals
    const grouped = (journalEntries || []).reduce((acc: any, entry: any) => {
      const key = entry.account_code;
      if (!acc[key]) {
        acc[key] = {
          account_code: entry.account_code,
          account_name: entry.account_name,
          debit_total: 0,
          credit_total: 0,
          amount: 0,
          report_type: "GENERAL_LEDGER",
          section: "Accounts",
        };
      }
      acc[key].debit_total += entry.debit || 0;
      acc[key].credit_total += entry.credit || 0;
      acc[key].amount += (entry.debit || 0) - (entry.credit || 0);
      return acc;
    }, {});

    const reportDataArray = Object.values(grouped);
    setReportData(reportDataArray as FinancialReportData[]);
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...reportData];

    // Filter by report type
    if (reportType !== "ALL") {
      filtered = filtered.filter((item) => item.report_type === reportType);
    }

    // Filter by account name
    if (searchQuery.trim()) {
      filtered = filtered.filter((item) =>
        item.account_name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredData(filtered);
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalDebit = () =>
    filteredData.reduce((sum, item) => sum + (item.debit_total || 0), 0);

  const getTotalCredit = () =>
    filteredData.reduce((sum, item) => sum + (item.credit_total || 0), 0);

  const getTotalAmount = () =>
    filteredData.reduce((sum, item) => sum + (item.amount || 0), 0);

  const exportToCSV = () => {
    const csv = [
      [
        "Report Type",
        "Section",
        "Account Code",
        "Account Name",
        "Debit Total",
        "Credit Total",
        "Amount",
      ],
      ...filteredData.map((item) => [
        item.report_type,
        item.section,
        item.account_code,
        item.account_name,
        item.debit_total,
        item.credit_total,
        item.amount,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan_keuangan_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();

    toast({
      title: "✅ Berhasil",
      description: "Laporan berhasil diexport ke CSV",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <Card className="max-w-7xl mx-auto rounded-2xl shadow-md">
        <CardHeader className="p-4">
          <CardTitle className="text-2xl">Laporan Keuangan</CardTitle>
          <CardDescription>Data Laporan Keuangan</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          {/* Filter Section */}
          <div className="grid md:grid-cols-4 gap-3 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger id="reportType">
                  <SelectValue placeholder="Pilih Report Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua</SelectItem>
                  <SelectItem value="LABA_RUGI">Laba Rugi</SelectItem>
                  <SelectItem value="NERACA">Neraca</SelectItem>
                  <SelectItem value="ARUS_KAS">Arus Kas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="search">Cari Nama Akun</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Cari nama akun..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button
                onClick={fetchReportData}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Filter className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
            <div className="flex items-end">
              <Button
                onClick={exportToCSV}
                variant="outline"
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="p-4">
                <CardTitle className="text-sm text-green-700">
                  Total Debit
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold text-green-800">
                  {formatRupiah(getTotalDebit())}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardHeader className="p-4">
                <CardTitle className="text-sm text-red-700">
                  Total Credit
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold text-red-800">
                  {formatRupiah(getTotalCredit())}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="p-4">
                <CardTitle className="text-sm text-blue-700">
                  Total Amount
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold text-blue-800">
                  {formatRupiah(getTotalAmount())}
                </p>
              </CardContent>
            </Card>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  Data Laporan ({filteredData.length} baris)
                </h3>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead>Report Type</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Account Code</TableHead>
                      <TableHead>Account Name</TableHead>
                      <TableHead className="text-right">Debit Total</TableHead>
                      <TableHead className="text-right">Credit Total</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-gray-500"
                        >
                          Tidak ada data
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                              {item.report_type}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.section}
                          </TableCell>
                          <TableCell className="font-mono">
                            {item.account_code}
                          </TableCell>
                          <TableCell>{item.account_name}</TableCell>
                          <TableCell className="text-right font-mono">
                            {formatRupiah(item.debit_total || 0)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatRupiah(item.credit_total || 0)}
                          </TableCell>
                          <TableCell className="text-right font-mono font-semibold">
                            {formatRupiah(item.amount || 0)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}