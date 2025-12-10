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
import {
  Loader2,
  Download,
  Filter,
  Search,
  ArrowLeft,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FinancialReportData {
  report_type: string;
  section: string;
  account_header: string;
  account_code: string;
  account_name: string;
  debit_total: number;
  credit_total: number;
  amount: number;
}

interface JournalEntry {
  id: string;
  entry_number: string;
  entry_date: string;
  description: string;
  debit_account: string;
  credit_account: string;
  debit: number;
  credit: number;
  created_at: string;
  debit_account_name?: string;
  credit_account_name?: string;
}

export default function IntegratedFinancialReport() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<FinancialReportData[]>([]);
  const [filteredData, setFilteredData] = useState<FinancialReportData[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loadingJournal, setLoadingJournal] = useState(false);

  const [reportType, setReportType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchReportData();
    fetchJournalEntries();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reportType, searchQuery, reportData]);

  const fetchReportData = async () => {
    setLoading(true);

    try {
      // First, fetch all chart_of_accounts to build parent hierarchy
      const { data: coaData, error: coaError } = await supabase
        .from("chart_of_accounts")
        .select("account_code, account_name, level, parent_id");

      if (coaError) {
        toast({
          title: "Error",
          description: `Gagal memuat COA: ${coaError.message}`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Build a map for quick lookup
      const coaMap = new Map(
        coaData?.map((coa) => [coa.account_code, coa]) || [],
      );

      // Fetch from general_ledger with chart_of_accounts join
      const { data, error } = await supabase
        .from("general_ledger")
        .select(
          `
          *,
          chart_of_accounts!general_ledger_account_code_fkey (
            account_name,
            account_type,
            parent_id,
            level,
            is_header
          )
        `,
        )
        .order("account_code", { ascending: true });

      if (error) {
        toast({
          title: "Error",
          description: `Gagal memuat data laporan keuangan: ${error.message}`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      console.log("📊 Data from general_ledger:", data);

      // Aggregate data by account_code
      const aggregated = aggregateGeneralLedgerData(data || [], coaMap);
      setReportData(aggregated);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching report data:", err);
      setLoading(false);
    }
  };

  const aggregateGeneralLedgerData = (
    glData: any[],
    coaMap: Map<string, any>,
  ): FinancialReportData[] => {
    const grouped = new Map<string, FinancialReportData>();

    // Helper function to find parent account with level 1 or 2
    const findAccountHeader = (accountCode: string): string => {
      let currentCode = accountCode;
      let iterations = 0;
      const maxIterations = 10; // Prevent infinite loops

      while (currentCode && iterations < maxIterations) {
        const account = coaMap.get(currentCode);
        if (!account) break;

        // If level is 1 or 2, return this account name
        if (account.level === 1 || account.level === 2) {
          return account.account_name;
        }

        // Move to parent
        if (account.parent_id) {
          currentCode = account.parent_id;
        } else {
          break;
        }
        iterations++;
      }

      // Fallback to account type if no parent found
      const account = coaMap.get(accountCode);
      return account?.account_name || "Unknown";
    };

    glData.forEach((entry) => {
      const accountCode = entry.account_code;
      const accountInfo = entry.chart_of_accounts;
      const accountName = accountInfo?.account_name || "Unknown Account";
      const accountType = accountInfo?.account_type || "Other";

      // Find the account header from level 1 or 2 parent
      const accountHeader = findAccountHeader(accountCode);

      // Determine report type and section based on account type
      let reportTypeValue = "Other";
      let section = "Other";

      if (accountType === "Aset") {
        reportTypeValue = "Balance Sheet";
        section = "Assets";
      } else if (accountType === "Kewajiban") {
        reportTypeValue = "Balance Sheet";
        section = "Liabilities";
      } else if (accountType === "Ekuitas") {
        reportTypeValue = "Balance Sheet";
        section = "Equity";
      } else if (accountType === "Pendapatan") {
        reportTypeValue = "Profit & Loss";
        section = "Revenue";
      } else if (accountType === "Beban Pokok Penjualan") {
        reportTypeValue = "Profit & Loss";
        section = "Cost of Goods Sold";
      } else if (accountType === "Beban Operasional") {
        reportTypeValue = "Profit & Loss";
        section = "Operating Expenses";
      } else if (accountType === "Pendapatan & Beban Lain-lain") {
        reportTypeValue = "Profit & Loss";
        section = "Other Income/Expenses";
      }

      const key = accountCode;

      if (!grouped.has(key)) {
        grouped.set(key, {
          report_type: reportTypeValue,
          section: section,
          account_header: accountHeader,
          account_code: accountCode,
          account_name: accountName,
          debit_total: 0,
          credit_total: 0,
          amount: 0,
        });
      }

      const item = grouped.get(key)!;
      item.debit_total += parseFloat(entry.debit || 0);
      item.credit_total += parseFloat(entry.credit || 0);
      item.amount = item.debit_total - item.credit_total;
    });

    return Array.from(grouped.values());
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

  const fetchJournalEntries = async () => {
    setLoadingJournal(true);
    try {
      const { data: journalData, error: journalError } = await supabase
        .from("journal_entries")
        .select("*")
        .order("entry_date", { ascending: false });

      if (journalError) {
        toast({
          title: "Error",
          description: `Gagal memuat journal entries: ${journalError.message}`,
          variant: "destructive",
        });
        return;
      }

      // Fetch COA data to get account names
      const { data: coaData, error: coaError } = await supabase
        .from("chart_of_accounts")
        .select("account_code, account_name");

      if (coaError) {
        toast({
          title: "Error",
          description: `Gagal memuat chart of accounts: ${coaError.message}`,
          variant: "destructive",
        });
        setJournalEntries(journalData || []);
        return;
      }

      // Create a map for quick lookup
      const coaMap = new Map(
        coaData?.map((coa) => [coa.account_code, coa.account_name]) || [],
      );

      // Enrich journal entries with account names
      const enrichedEntries =
        journalData?.map((entry) => ({
          ...entry,
          debit_account_name:
            coaMap.get(entry.debit_account) || entry.debit_account,
          credit_account_name:
            coaMap.get(entry.credit_account) || entry.credit_account,
        })) || [];

      setJournalEntries(enrichedEntries);
    } catch (err) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat journal entries",
        variant: "destructive",
      });
    } finally {
      setLoadingJournal(false);
    }
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
        "Account Header",
        "Account Code",
        "Account Name",
        "Debit Total",
        "Credit Total",
        "Amount",
      ],
      ...filteredData.map((item) => [
        item.report_type,
        item.section,
        item.account_header,
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

  const handleBack = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-0 space-y-4">
      {/* Header with gradient */}
      <div className="border-b bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 shadow-lg">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Laporan Keuangan
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Card className="max-w-7xl mx-auto rounded-2xl shadow-md">
        <CardHeader className="p-4">
          <CardTitle className="text-2xl">Laporan Keuangan</CardTitle>
          <CardDescription>Data Laporan Keuangan</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          {/* Filter Section */}
          <div className="grid md:grid-cols-4 gap-3 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type1</Label>
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
                      <TableHead>Account Header</TableHead>
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
                          colSpan={8}
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
                          <TableCell className="font-medium">
                            {item.account_header}
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

      {/* Journal Entries Table */}
      <Card className="max-w-7xl mx-auto rounded-2xl shadow-md mt-6">
        <CardHeader className="p-4">
          <CardTitle className="text-2xl">Journal Entries</CardTitle>
          <CardDescription>Data Journal Entries</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          {loadingJournal ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  Data Journal Entries ({journalEntries.length} entries)
                </h3>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead>Kode Akun</TableHead>
                      <TableHead>Nama Akun</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Kredit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {journalEntries.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-8 text-gray-500"
                        >
                          Tidak ada data
                        </TableCell>
                      </TableRow>
                    ) : (
                      journalEntries.map((entry) => (
                        <>
                          <TableRow key={`${entry.id}-debit`}>
                            <TableCell className="font-mono">
                              {entry.debit_account}
                            </TableCell>
                            <TableCell>
                              {entry.debit_account_name || "-"}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {formatRupiah(entry.debit || 0)}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              -
                            </TableCell>
                          </TableRow>
                          <TableRow key={`${entry.id}-credit`}>
                            <TableCell className="font-mono">
                              {entry.credit_account}
                            </TableCell>
                            <TableCell>
                              {entry.credit_account_name || "-"}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              -
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {formatRupiah(entry.credit || 0)}
                            </TableCell>
                          </TableRow>
                        </>
                      ))
                    )}
                    {journalEntries.length > 0 && (
                      <TableRow className="bg-gray-100 font-bold border-t-2 border-gray-300">
                        <TableCell colSpan={2} className="text-right">
                          Total
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatRupiah(
                            journalEntries.reduce(
                              (sum, entry) => sum + (entry.debit || 0),
                              0,
                            ),
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatRupiah(
                            journalEntries.reduce(
                              (sum, entry) => sum + (entry.credit || 0),
                              0,
                            ),
                          )}
                        </TableCell>
                      </TableRow>
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
