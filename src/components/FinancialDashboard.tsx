import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, TrendingUp, TrendingDown, DollarSign, Wallet, FileText, Scale } from "lucide-react";
import { Link } from "react-router-dom";
import MonthlyFinanceChart from "./MonthlyFinanceChart";

interface FinancialSummary {
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  totalAssets: number;
}

export default function FinancialDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalRevenue: 0,
    totalExpense: 0,
    netProfit: 0,
    totalAssets: 0,
  });

  useEffect(() => {
    fetchFinancialSummary();
  }, []);

  const fetchFinancialSummary = async () => {
    setLoading(true);

    try {
      // Fetch data from vw_dashboard_summary view
      const { data: summaryData, error: summaryError } = await supabase
        .from("vw_dashboard_summary")
        .select("account_type, total_balance");

      if (summaryError) throw summaryError;

      // Initialize values
      let totalRevenue = 0;
      let totalExpense = 0;
      let totalAssets = 0;

      // Map data from view based on normalized account_type
      summaryData?.forEach((item) => {
        const balance = item.total_balance || 0;
        const normalizedType = (item.account_type || "").trim().toLowerCase();
        
        switch (normalizedType) {
          case "pendapatan":
            totalRevenue = balance;
            break;
          case "beban pokok penjualan":
          case "beban operasional":
          case "beban":
            totalExpense += balance;
            break;
          case "aset":
            totalAssets = balance;
            break;
        }
      });

      const netProfit = totalRevenue - totalExpense;

      setSummary({
        totalRevenue,
        totalExpense,
        netProfit,
        totalAssets,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal memuat ringkasan keuangan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Keuangan</h1>
          <p className="text-gray-600 mt-1">Ringkasan keuangan bulan ini</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              {/* Total Pendapatan */}
              <Link to="/profit-loss">
                <Card className="bg-white shadow-md rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Total Pendapatan Bulan Ini
                    </CardTitle>
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-700">
                      {formatRupiah(summary.totalRevenue)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Klik untuk detail</p>
                  </CardContent>
                </Card>
              </Link>

              {/* Total Beban */}
              <Link to="/profit-loss">
                <Card className="bg-white shadow-md rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Total Beban Bulan Ini
                    </CardTitle>
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-700">
                      {formatRupiah(summary.totalExpense)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Klik untuk detail</p>
                  </CardContent>
                </Card>
              </Link>

              {/* Laba Bersih */}
              <Link to="/profit-loss">
                <Card className={`shadow-md rounded-2xl border-2 hover:shadow-lg transition-shadow cursor-pointer ${
                  summary.netProfit >= 0
                    ? "bg-blue-50 border-blue-500"
                    : "bg-orange-50 border-orange-500"
                }`}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Laba Bersih Bulan Ini
                    </CardTitle>
                    <DollarSign className={`h-5 w-5 ${
                      summary.netProfit >= 0 ? "text-blue-600" : "text-orange-600"
                    }`} />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${
                      summary.netProfit >= 0 ? "text-blue-700" : "text-orange-700"
                    }`}>
                      {formatRupiah(Math.abs(summary.netProfit))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {summary.netProfit >= 0 ? "Laba" : "Rugi"}
                    </p>
                  </CardContent>
                </Card>
              </Link>

              {/* Total Aset */}
              <Link to="/balance-sheet">
                <Card className="bg-white shadow-md rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Total Aset Saat Ini
                    </CardTitle>
                    <Wallet className="h-5 w-5 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-700">
                      {formatRupiah(summary.totalAssets)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Klik untuk detail</p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Monthly Finance Chart */}
            <MonthlyFinanceChart />

            {/* Financial Reports Stats Cards */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">📊 Laporan Keuangan</h2>
              <div className="grid md:grid-cols-4 gap-4">
                {/* Laporan Keuangan Terintegrasi */}
                <Link to="/financial-report">
                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-purple-800">
                        Laporan Keuangan
                      </CardTitle>
                      <FileText className="h-5 w-5 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-purple-700">
                        Laporan keuangan terintegrasi lengkap
                      </p>
                    </CardContent>
                  </Card>
                </Link>

                {/* Laba Rugi */}
                <Link to="/profit-loss">
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-green-800">
                        Laba Rugi
                      </CardTitle>
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-green-700">
                        Detail pendapatan, beban, dan laba/rugi
                      </p>
                    </CardContent>
                  </Card>
                </Link>

                {/* Neraca */}
                <Link to="/balance-sheet">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-blue-800">
                        Neraca
                      </CardTitle>
                      <Scale className="h-5 w-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-blue-700">
                        Posisi aset, kewajiban, dan ekuitas
                      </p>
                    </CardContent>
                  </Card>
                </Link>

                {/* Arus Kas */}
                <Link to="/cash-flow">
                  <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-2 border-cyan-300 hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-cyan-800">
                        Arus Kas
                      </CardTitle>
                      <Wallet className="h-5 w-5 text-cyan-600" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-cyan-700">
                        Laporan kas masuk dan kas keluar
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}