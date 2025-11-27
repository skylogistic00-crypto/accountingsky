import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  FileText,
  Scale,
} from "lucide-react";
import { Link } from "react-router-dom";
import MonthlyFinanceChart from "./MonthlyFinanceChart";
import { canClick } from "@/utils/roleAccess";
import { useAuth } from "@/contexts/AuthContext";

interface FinancialSummary {
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  totalAssets: number;
  yearlyRevenue: number;
  yearlyExpense: number;
  yearlyProfit: number;
}

export default function FinancialDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { userRole } = useAuth();
  const [summary, setSummary] = useState<FinancialSummary>({
    totalRevenue: 0,
    totalExpense: 0,
    netProfit: 0,
    totalAssets: 0,
    yearlyRevenue: 0,
    yearlyExpense: 0,
    yearlyProfit: 0,
  });

  // Month and year filters
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    fetchFinancialSummary();
  }, [selectedMonth, selectedYear]);

  const fetchFinancialSummary = async () => {
    setLoading(true);

    try {
      // Fetch monthly data from vw_dashboard_summary view with month and year filters
      const { data, error } = await supabase
        .from("vw_dashboard_summary")
        .select("category, year, month, amount")
        .eq("year", selectedYear)
        .eq("month", selectedMonth);

      if (error) throw error;

      console.log("📊 Data from vw_dashboard_summary (monthly):", data);

      // Fetch yearly data (no month filter)
      const { data: yearlyData, error: yearlyError } = await supabase
        .from("vw_dashboard_summary")
        .select("category, year, amount")
        .eq("year", selectedYear);

      if (yearlyError) throw yearlyError;

      console.log("📊 Data from vw_dashboard_summary (yearly):", yearlyData);

      // Initialize values
      let totalRevenue = 0;
      let totalExpense = 0;
      let totalAssets = 0;

      // Aggregate amounts by category (monthly)
      data?.forEach((item) => {
        const amount = Number(item.amount) || 0;
        const category = (item.category || "").trim().toLowerCase();

        if (category === "pendapatan") {
          totalRevenue += amount;
        } else if (category === "beban") {
          totalExpense += amount;
        } else if (category === "aset") {
          totalAssets += amount;
        }
      });

      const netProfit = totalRevenue + totalExpense; // totalBeban sudah negatif dari view

      // Calculate yearly totals
      let yearlyRevenue = 0;
      let yearlyExpense = 0;

      yearlyData?.forEach((item) => {
        const amount = Number(item.amount) || 0;
        const category = (item.category || "").trim().toLowerCase();

        if (category === "pendapatan") {
          yearlyRevenue += amount;
        } else if (category === "beban") {
          yearlyExpense += amount;
        }
      });

      const yearlyProfit = yearlyRevenue + yearlyExpense; // totalBeban sudah negatif dari view

      setSummary({
        totalRevenue,
        totalExpense,
        netProfit,
        totalAssets,
        yearlyRevenue,
        yearlyExpense,
        yearlyProfit,
      });

      console.log("📊 Calculated summary:", {
        totalRevenue,
        totalExpense,
        netProfit,
        totalAssets,
        yearlyRevenue,
        yearlyExpense,
        yearlyProfit,
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Keuangan
            </h1>
            <p className="text-gray-600 mt-1">Ringkasan keuangan bulan ini</p>
          </div>

          {/* Month and Year Filters */}
          <div className="flex gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={1}>Januari</option>
              <option value={2}>Februari</option>
              <option value={3}>Maret</option>
              <option value={4}>April</option>
              <option value={5}>Mei</option>
              <option value={6}>Juni</option>
              <option value={7}>Juli</option>
              <option value={8}>Agustus</option>
              <option value={9}>September</option>
              <option value={10}>Oktober</option>
              <option value={11}>November</option>
              <option value={12}>Desember</option>
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
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
              {/*  <Link to="/profit-loss">*/}
              <Link
                to="/profit-loss"
                onClick={(e) => {
                  if (!canClick(userRole)) {
                    e.preventDefault();
                  }
                }}
              >
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
                    <p className="text-xs text-gray-500 mt-1">
                      Klik untuk detail
                    </p>
                  </CardContent>
                </Card>
              </Link>

              {/* Total Beban */}
              {/* <Link to="/profit-loss">*/}
              <Link
                to="/profit-loss"
                onClick={(e) => {
                  if (!canClick(userRole)) {
                    e.preventDefault();
                  }
                }}
              >
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
                    <p className="text-xs text-gray-500 mt-1">
                      Klik untuk detail
                    </p>
                  </CardContent>
                </Card>
              </Link>

              {/* Laba Bersih */}
              {/*<Link to="/profit-loss">*/}
              <Link
                to="/profit-loss"
                onClick={(e) => {
                  if (!canClick(userRole)) {
                    e.preventDefault();
                  }
                }}
              >
                <Card
                  className={`shadow-md rounded-2xl border-2 hover:shadow-lg transition-shadow cursor-pointer ${
                    summary.netProfit >= 0
                      ? "bg-blue-50 border-blue-500"
                      : "bg-orange-50 border-orange-500"
                  }`}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Laba Bersih Bulan Ini
                    </CardTitle>
                    <DollarSign
                      className={`h-5 w-5 ${
                        summary.netProfit >= 0
                          ? "text-blue-600"
                          : "text-orange-600"
                      }`}
                    />
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold ${
                        summary.netProfit >= 0
                          ? "text-blue-700"
                          : "text-orange-700"
                      }`}
                    >
                      {formatRupiah(Math.abs(summary.netProfit))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {summary.netProfit >= 0 ? "Laba" : "Rugi"}
                    </p>
                  </CardContent>
                </Card>
              </Link>

              {/* Total Aset */}
              {/*<Link to="/balance-sheet">*/}
              <Link
                to="/balance-sheet"
                onClick={(e) => {
                  if (!canClick(userRole)) {
                    e.preventDefault();
                  }
                }}
              >
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
                    <p className="text-xs text-gray-500 mt-1">
                      Klik untuk detail
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Yearly Summary Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Total Revenue Tahun Ini */}
              <Card className="bg-white shadow-md rounded-2xl border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Revenue Tahun Ini
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">
                    {formatRupiah(summary.yearlyRevenue)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Total pendapatan {selectedYear}
                  </p>
                </CardContent>
              </Card>

              {/* Total Expense Tahun Ini */}
              <Card className="bg-white shadow-md rounded-2xl border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Expense Tahun Ini
                  </CardTitle>
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-700">
                    {formatRupiah(summary.yearlyExpense)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Total beban {selectedYear}
                  </p>
                </CardContent>
              </Card>

              {/* Profit Bersih Tahun Ini */}
              <Card
                className={`shadow-md rounded-2xl border-2 ${
                  summary.yearlyProfit >= 0
                    ? "bg-blue-50 border-blue-500"
                    : "bg-orange-50 border-orange-500"
                }`}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Profit Bersih Tahun Ini
                  </CardTitle>
                  <DollarSign
                    className={`h-5 w-5 ${
                      summary.yearlyProfit >= 0
                        ? "text-blue-600"
                        : "text-orange-600"
                    }`}
                  />
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${
                      summary.yearlyProfit >= 0
                        ? "text-blue-700"
                        : "text-orange-700"
                    }`}
                  >
                    {formatRupiah(Math.abs(summary.yearlyProfit))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {summary.yearlyProfit >= 0 ? "Laba" : "Rugi"} {selectedYear}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Financial Reports Stats Cards */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                📊 Laporan Keuangan
              </h2>
              <div className="grid md:grid-cols-4 gap-4">
                {/* Laporan Keuangan Terintegrasi */}
                {/*    <Link to="/laporan-keuangan">*/}
                <Link
                  to="/laporan-keuangan"
                  onClick={(e) => {
                    if (!canClick(userRole)) {
                      e.preventDefault();
                    }
                  }}
                >
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
                {/*<Link to="/profit-loss"> */}
                <Link
                  to="/profit-loss"
                  onClick={(e) => {
                    if (!canClick(userRole)) {
                      e.preventDefault();
                    }
                  }}
                >
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
                {/*<Link to="/balance-sheet"> */}
                <Link
                  to="/balance-sheet"
                  onClick={(e) => {
                    if (!canClick(userRole)) {
                      e.preventDefault();
                    }
                  }}
                >
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
                {/*<Link to="/cash-flow"> */}
                <Link
                  to="/cash-flow"
                  onClick={(e) => {
                    if (!canClick(userRole)) {
                      e.preventDefault();
                    }
                  }}
                >
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

            {/* Monthly Finance Chart */}
            <MonthlyFinanceChart />
          </>
        )}
      </div>
    </div>
  );
}
