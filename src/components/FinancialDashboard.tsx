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
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
      const today = now.toISOString().split("T")[0];

      // Fetch journal entries for current month
      const { data: monthlyEntries, error: monthlyError } = await supabase
        .from("journal_entries")
        .select("account_code, debit, credit")
        .gte("transaction_date", firstDayOfMonth)
        .lte("transaction_date", today);

      if (monthlyError) throw monthlyError;

      // Fetch all journal entries for total assets
      const { data: allEntries, error: allError } = await supabase
        .from("journal_entries")
        .select("account_code, debit, credit")
        .lte("transaction_date", today);

      if (allError) throw allError;

      // Fetch COA accounts
      const { data: coaAccounts, error: coaError } = await supabase
        .from("chart_of_accounts")
        .select("account_code, account_type, normal_balance")
        .eq("is_active", true);

      if (coaError) throw coaError;

      // Create account type map
      const accountTypeMap: { [key: string]: { type: string; normalBalance: string } } = {};
      coaAccounts?.forEach((acc) => {
        accountTypeMap[acc.account_code] = {
          type: acc.account_type,
          normalBalance: acc.normal_balance,
        };
      });

      // Calculate monthly revenue and expenses
      let totalRevenue = 0;
      let totalExpense = 0;

      const monthlyBalances: { [key: string]: number } = {};
      monthlyEntries?.forEach((entry) => {
        if (!monthlyBalances[entry.account_code]) {
          monthlyBalances[entry.account_code] = 0;
        }
        monthlyBalances[entry.account_code] += entry.debit - entry.credit;
      });

      Object.keys(monthlyBalances).forEach((accountCode) => {
        const accountInfo = accountTypeMap[accountCode];
        if (!accountInfo) return;

        const balance = monthlyBalances[accountCode];
        const finalBalance = accountInfo.normalBalance === "Kredit" ? -balance : balance;

        if (accountInfo.type === "Pendapatan") {
          totalRevenue += finalBalance;
        } else if (
          accountInfo.type === "Beban Pokok Penjualan" ||
          accountInfo.type === "Beban Operasional"
        ) {
          totalExpense += finalBalance;
        }
      });

      // Calculate total assets
      let totalAssets = 0;
      const allBalances: { [key: string]: number } = {};
      allEntries?.forEach((entry) => {
        if (!allBalances[entry.account_code]) {
          allBalances[entry.account_code] = 0;
        }
        allBalances[entry.account_code] += entry.debit - entry.credit;
      });

      Object.keys(allBalances).forEach((accountCode) => {
        const accountInfo = accountTypeMap[accountCode];
        if (!accountInfo) return;

        const balance = allBalances[accountCode];
        const finalBalance = accountInfo.normalBalance === "Kredit" ? -balance : balance;

        if (accountInfo.type === "Aset") {
          totalAssets += finalBalance;
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