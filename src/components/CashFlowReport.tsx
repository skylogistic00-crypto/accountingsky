import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Download, Filter, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface CashFlowData {
  period: string;
  cashIn: number;
  cashOut: number;
  netCash: number;
}

interface CashFlowSummary {
  totalCashIn: number;
  totalCashOut: number;
  netCashFlow: number;
}

interface MonthlySummary {
  cashInThisMonth: number;
  cashOutThisMonth: number;
  netCashThisMonth: number;
}

export default function CashFlowReport() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<CashFlowData[]>([]);
  const [summary, setSummary] = useState<CashFlowSummary>({
    totalCashIn: 0,
    totalCashOut: 0,
    netCashFlow: 0,
  });
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary>({
    cashInThisMonth: 0,
    cashOutThisMonth: 0,
    netCashThisMonth: 0,
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState("all");

  useEffect(() => {
    fetchCashFlowData();

    // Real-time subscription
    const channel = supabase
      .channel('realtime:cash_flow')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'journal_entries' }, () => {
        fetchCashFlowData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedYear, selectedMonth]);

  const fetchCashFlowData = async () => {
    setLoading(true);

    try {
      // Fetch cash/bank accounts
      const { data: cashAccounts, error: cashError } = await supabase
        .from("chart_of_accounts")
        .select("account_code")
        .eq("account_type", "Aset")
        .or("account_name.ilike.%kas%,account_name.ilike.%bank%");

      if (cashError) throw cashError;

      const cashAccountCodes = cashAccounts?.map(acc => acc.account_code) || [];

      if (cashAccountCodes.length === 0) {
        toast({
          title: "⚠️ Tidak ada akun kas/bank",
          description: "Pastikan ada akun dengan nama 'Kas' atau 'Bank' di Chart of Accounts",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Build date filter
      let startDate = `${selectedYear}-01-01`;
      let endDate = `${selectedYear}-12-31`;
      
      if (selectedMonth !== "all") {
        startDate = `${selectedYear}-${selectedMonth}-01`;
        const lastDay = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate();
        endDate = `${selectedYear}-${selectedMonth}-${lastDay}`;
      }

      // Fetch journal entries
      const { data: journalEntries, error: journalError } = await supabase
        .from("journal_entries")
        .select("debit_account_code, credit_account_code, debit, credit, transaction_date")
        .gte("transaction_date", startDate)
        .lte("transaction_date", endDate);

      if (journalError) throw journalError;

      // Group by month
      const monthlyMap: { [key: string]: { cashIn: number; cashOut: number } } = {};
      let totalCashIn = 0;
      let totalCashOut = 0;

      // Get current month for monthly summary
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      let cashInThisMonth = 0;
      let cashOutThisMonth = 0;

      journalEntries?.forEach((entry) => {
        const date = new Date(entry.transaction_date);
        const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        if (!monthlyMap[period]) {
          monthlyMap[period] = { cashIn: 0, cashOut: 0 };
        }

        // Cash inflow: Kas/Bank di debit
        if (cashAccountCodes.includes(entry.debit_account_code)) {
          monthlyMap[period].cashIn += entry.debit;
          totalCashIn += entry.debit;
          
          if (period === currentMonth) {
            cashInThisMonth += entry.debit;
          }
        }

        // Cash outflow: Kas/Bank di kredit
        if (cashAccountCodes.includes(entry.credit_account_code)) {
          monthlyMap[period].cashOut += entry.credit;
          totalCashOut += entry.credit;
          
          if (period === currentMonth) {
            cashOutThisMonth += entry.credit;
          }
        }
      });

      // Convert to array
      const data: CashFlowData[] = Object.keys(monthlyMap)
        .sort()
        .map((period) => ({
          period: formatPeriod(period),
          cashIn: monthlyMap[period].cashIn,
          cashOut: monthlyMap[period].cashOut,
          netCash: monthlyMap[period].cashIn - monthlyMap[period].cashOut,
        }));

      setChartData(data);
      setSummary({
        totalCashIn,
        totalCashOut,
        netCashFlow: totalCashIn - totalCashOut,
      });
      setMonthlySummary({
        cashInThisMonth,
        cashOutThisMonth,
        netCashThisMonth: cashInThisMonth - cashOutThisMonth,
      });

      toast({
        title: "✅ Laporan arus kas diperbarui",
        description: `Data periode ${selectedMonth === "all" ? selectedYear : `${getMonthName(selectedMonth)} ${selectedYear}`} berhasil dimuat`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal memuat data arus kas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPeriod = (period: string) => {
    const [year, month] = period.split("-");
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const getMonthName = (month: string) => {
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return monthNames[parseInt(month) - 1];
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const exportToCSV = () => {
    const headers = ["Periode", "Kas Masuk", "Kas Keluar", "Kas Bersih"];
    const rows = chartData.map(row => [
      row.period,
      row.cashIn,
      row.cashOut,
      row.netCash,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-arus-kas-${selectedYear}${selectedMonth !== "all" ? `-${selectedMonth}` : ""}.csv`;
    a.click();
  };

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());
  const months = [
    { value: "all", label: "Semua Bulan" },
    { value: "01", label: "Januari" },
    { value: "02", label: "Februari" },
    { value: "03", label: "Maret" },
    { value: "04", label: "April" },
    { value: "05", label: "Mei" },
    { value: "06", label: "Juni" },
    { value: "07", label: "Juli" },
    { value: "08", label: "Agustus" },
    { value: "09", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <Card className="max-w-7xl mx-auto bg-white shadow-md rounded-2xl border">
        <CardHeader className="p-4">
          <CardTitle className="text-2xl">💰 Laporan Arus Kas</CardTitle>
          <CardDescription>
            Laporan arus kas masuk, kas keluar, dan saldo kas bersih per periode
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          {/* Filter Year & Month */}
          <div className="flex items-center justify-between mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-semibold">Tahun:</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-32 border rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm font-semibold">Bulan:</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-40 border rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchCashFlowData} className="bg-blue-600 hover:bg-blue-700">
                <Filter className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button onClick={exportToCSV} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Monthly Summary Cards */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3">📊 Ringkasan Bulan Ini</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="bg-green-50 border-2 border-green-300 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        💰 Kas Masuk Bulan Ini
                      </CardTitle>
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-700">
                        {formatRupiah(monthlySummary.cashInThisMonth)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-red-50 border-2 border-red-300 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        💸 Kas Keluar Bulan Ini
                      </CardTitle>
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-700">
                        {formatRupiah(monthlySummary.cashOutThisMonth)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className={`border-2 shadow-md ${
                    monthlySummary.netCashThisMonth >= 0
                      ? "bg-blue-50 border-blue-300"
                      : "bg-orange-50 border-orange-300"
                  }`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        📈 Saldo Kas Bersih
                      </CardTitle>
                      <DollarSign className={`h-5 w-5 ${
                        monthlySummary.netCashThisMonth >= 0 ? "text-blue-600" : "text-orange-600"
                      }`} />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${
                        monthlySummary.netCashThisMonth >= 0 ? "text-blue-700" : "text-orange-700"
                      }`}>
                        {formatRupiah(Math.abs(monthlySummary.netCashThisMonth))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {monthlySummary.netCashThisMonth >= 0 ? "Surplus" : "Defisit"}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Yearly Summary Cards */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3">📅 Ringkasan Periode</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="bg-green-50 border border-green-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Total Kas Masuk
                      </CardTitle>
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold text-green-700">
                        {formatRupiah(summary.totalCashIn)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedMonth === "all" ? `Tahun ${selectedYear}` : `${getMonthName(selectedMonth)} ${selectedYear}`}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-red-50 border border-red-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Total Kas Keluar
                      </CardTitle>
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold text-red-700">
                        {formatRupiah(summary.totalCashOut)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedMonth === "all" ? `Tahun ${selectedYear}` : `${getMonthName(selectedMonth)} ${selectedYear}`}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className={`border shadow-sm ${
                    summary.netCashFlow >= 0
                      ? "bg-blue-50 border-blue-200"
                      : "bg-orange-50 border-orange-200"
                  }`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Kas Bersih
                      </CardTitle>
                      <DollarSign className={`h-5 w-5 ${
                        summary.netCashFlow >= 0 ? "text-blue-600" : "text-orange-600"
                      }`} />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-xl font-bold ${
                        summary.netCashFlow >= 0 ? "text-blue-700" : "text-orange-700"
                      }`}>
                        {formatRupiah(Math.abs(summary.netCashFlow))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {summary.netCashFlow >= 0 ? "Surplus" : "Defisit"}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Composed Chart */}
              <Card className="bg-white shadow-lg rounded-2xl border border-gray-200">
                <CardHeader className="p-6">
                  <CardTitle className="text-lg font-semibold text-gray-800">
                    Tren Arus Kas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}jt`} />
                      <Tooltip
                        formatter={(value: number) => formatRupiah(value)}
                        labelStyle={{ color: "#000" }}
                      />
                      <Legend />
                      <Bar dataKey="cashIn" fill="#16a34a" name="Kas Masuk" />
                      <Bar dataKey="cashOut" fill="#dc2626" name="Kas Keluar" />
                      <Line
                        type="monotone"
                        dataKey="netCash"
                        stroke="#2563eb"
                        strokeWidth={3}
                        name="Saldo Bersih"
                        dot={{ r: 5 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}