import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Download, Filter, FileText, TrendingUp, TrendingDown } from "lucide-react";

interface AccountBalance {
  account_code: string;
  account_name: string;
  account_type: string;
  debit: number;
  credit: number;
  balance: number;
}

export default function ProfitLossReport() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [revenues, setRevenues] = useState<AccountBalance[]>([]);
  const [cogs, setCogs] = useState<AccountBalance[]>([]);
  const [expenses, setExpenses] = useState<AccountBalance[]>([]);
  const [otherIncome, setOtherIncome] = useState<AccountBalance[]>([]);
  const [otherExpenses, setOtherExpenses] = useState<AccountBalance[]>([]);
  
  const [filterType, setFilterType] = useState<"month" | "year" | "custom">("month");
  const [dateFrom, setDateFrom] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
  );
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    fetchProfitLossData();
  }, [dateFrom, dateTo]);

  const handleFilterChange = (type: "month" | "year" | "custom") => {
    setFilterType(type);
    const now = new Date();
    
    if (type === "month") {
      setDateFrom(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]);
      setDateTo(new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0]);
    } else if (type === "year") {
      setDateFrom(new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0]);
      setDateTo(new Date(now.getFullYear(), 11, 31).toISOString().split("T")[0]);
    }
  };

  const fetchProfitLossData = async () => {
    setLoading(true);

    try {
      // Fetch journal entries for the period
      const { data: journalEntries, error: journalError } = await supabase
        .from("journal_entries")
        .select("account_code, debit, credit")
        .gte("transaction_date", dateFrom)
        .lte("transaction_date", dateTo);

      if (journalError) throw journalError;

      // Validate journal balance
      const totalDebit = journalEntries?.reduce((sum, entry) => sum + entry.debit, 0) || 0;
      const totalCredit = journalEntries?.reduce((sum, entry) => sum + entry.credit, 0) || 0;
      
      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        toast({
          title: "⚠️ Data tidak seimbang",
          description: `Total Debit (${formatRupiah(totalDebit)}) ≠ Total Kredit (${formatRupiah(totalCredit)}). Periksa jurnal manual di menu Journal Entries.`,
          variant: "destructive",
        });
      }

      // Fetch all COA accounts
      const { data: coaAccounts, error: coaError } = await supabase
        .from("chart_of_accounts")
        .select("account_code, account_name, account_type, normal_balance")
        .eq("is_active", true)
        .order("account_code");

      if (coaError) throw coaError;

      // Calculate balances per account
      const balances: { [key: string]: { debit: number; credit: number } } = {};
      
      journalEntries?.forEach((entry) => {
        if (!balances[entry.account_code]) {
          balances[entry.account_code] = { debit: 0, credit: 0 };
        }
        balances[entry.account_code].debit += entry.debit;
        balances[entry.account_code].credit += entry.credit;
      });

      // Categorize accounts
      const revenueAccounts: AccountBalance[] = [];
      const cogsAccounts: AccountBalance[] = [];
      const expenseAccounts: AccountBalance[] = [];
      const otherIncomeAccounts: AccountBalance[] = [];
      const otherExpenseAccounts: AccountBalance[] = [];

      coaAccounts?.forEach((acc) => {
        const accountBalance = balances[acc.account_code];
        if (!accountBalance || (accountBalance.debit === 0 && accountBalance.credit === 0)) return;

        const netBalance = accountBalance.debit - accountBalance.credit;
        const finalBalance = acc.normal_balance === "Kredit" ? -netBalance : netBalance;

        const balance: AccountBalance = {
          account_code: acc.account_code,
          account_name: acc.account_name,
          account_type: acc.account_type,
          debit: accountBalance.debit,
          credit: accountBalance.credit,
          balance: finalBalance,
        };

        if (acc.account_type === "Pendapatan") {
          revenueAccounts.push(balance);
        } else if (acc.account_type === "Beban Pokok Penjualan") {
          cogsAccounts.push(balance);
        } else if (acc.account_type === "Beban Operasional") {
          expenseAccounts.push(balance);
        } else if (acc.account_type === "Pendapatan & Beban Lain-lain") {
          if (acc.account_code.startsWith("7-1")) {
            otherIncomeAccounts.push(balance);
          } else if (acc.account_code.startsWith("7-2")) {
            otherExpenseAccounts.push(balance);
          }
        }
      });

      setRevenues(revenueAccounts);
      setCogs(cogsAccounts);
      setExpenses(expenseAccounts);
      setOtherIncome(otherIncomeAccounts);
      setOtherExpenses(otherExpenseAccounts);

      // Success notification
      toast({
        title: "✅ Laporan diperbarui otomatis",
        description: `Data laporan periode ${dateFrom} s/d ${dateTo} berhasil dimuat`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal memuat data laporan",
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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const totalRevenue = revenues.reduce((sum, acc) => sum + acc.balance, 0);
  const totalCOGS = cogs.reduce((sum, acc) => sum + acc.balance, 0);
  const grossProfit = totalRevenue - totalCOGS;
  const totalExpenses = expenses.reduce((sum, acc) => sum + acc.balance, 0);
  const operatingProfit = grossProfit - totalExpenses;
  const totalOtherIncome = otherIncome.reduce((sum, acc) => sum + acc.balance, 0);
  const totalOtherExpenses = otherExpenses.reduce((sum, acc) => sum + acc.balance, 0);
  const netProfit = operatingProfit + totalOtherIncome - totalOtherExpenses;

  const exportToCSV = () => {
    const csv = [
      ["LAPORAN LABA RUGI"],
      [`Periode: ${dateFrom} s/d ${dateTo}`],
      [""],
      ["Akun", "Debit", "Kredit", "Saldo"],
      [""],
      ["PENDAPATAN"],
      ...revenues.map((acc) => [
        `${acc.account_code} - ${acc.account_name}`,
        acc.debit.toFixed(2),
        acc.credit.toFixed(2),
        acc.balance.toFixed(2),
      ]),
      ["", "", "Total Pendapatan", totalRevenue.toFixed(2)],
      [""],
      ["BEBAN POKOK PENJUALAN"],
      ...cogs.map((acc) => [
        `${acc.account_code} - ${acc.account_name}`,
        acc.debit.toFixed(2),
        acc.credit.toFixed(2),
        acc.balance.toFixed(2),
      ]),
      ["", "", "Total HPP", totalCOGS.toFixed(2)],
      ["", "", "LABA KOTOR", grossProfit.toFixed(2)],
      [""],
      ["BEBAN OPERASIONAL"],
      ...expenses.map((acc) => [
        `${acc.account_code} - ${acc.account_name}`,
        acc.debit.toFixed(2),
        acc.credit.toFixed(2),
        acc.balance.toFixed(2),
      ]),
      ["", "", "Total Beban Operasional", totalExpenses.toFixed(2)],
      ["", "", "LABA OPERASIONAL", operatingProfit.toFixed(2)],
      [""],
      ["LABA BERSIH", "", "", netProfit.toFixed(2)],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laba_rugi_${dateFrom}_${dateTo}.csv`;
    a.click();

    toast({
      title: "✅ Berhasil",
      description: "Laporan berhasil diexport ke CSV",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <Card className="max-w-7xl mx-auto bg-white shadow-md rounded-2xl border">
        <CardHeader className="p-4">
          <CardTitle className="text-2xl">Laporan Laba Rugi</CardTitle>
          <CardDescription>
            Laporan keuangan yang menunjukkan pendapatan, beban, dan laba/rugi perusahaan
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          {/* Filter */}
          <div className="grid md:grid-cols-5 gap-3 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="space-y-2">
              <Label>Filter Waktu</Label>
              <Select value={filterType} onValueChange={(v: any) => handleFilterChange(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Per Bulan</SelectItem>
                  <SelectItem value="year">Per Tahun</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Dari Tanggal</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                disabled={filterType !== "custom"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">Sampai Tanggal</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                disabled={filterType !== "custom"}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={fetchProfitLossData} className="w-full bg-blue-600 hover:bg-blue-700">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={exportToCSV} variant="outline" className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Excel
              </Button>
              <Button variant="outline" className="flex-1">
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* PENDAPATAN */}
              <div className="border rounded-lg overflow-hidden bg-white">
                <div className="bg-green-100 px-4 py-2">
                  <h3 className="text-lg font-bold text-green-800">PENDAPATAN</h3>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Akun</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Kredit</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenues.map((acc) => (
                      <TableRow key={acc.account_code}>
                        <TableCell className="font-medium">
                          {acc.account_code} - {acc.account_name}
                        </TableCell>
                        <TableCell className="text-right">{formatRupiah(acc.debit)}</TableCell>
                        <TableCell className="text-right">{formatRupiah(acc.credit)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatRupiah(acc.balance)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-green-50 font-bold">
                      <TableCell colSpan={3}>Total Pendapatan</TableCell>
                      <TableCell className="text-right text-green-700">{formatRupiah(totalRevenue)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* BEBAN POKOK PENJUALAN */}
              <div className="border rounded-lg overflow-hidden bg-white">
                <div className="bg-orange-100 px-4 py-2">
                  <h3 className="text-lg font-bold text-orange-800">BEBAN POKOK PENJUALAN</h3>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Akun</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Kredit</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cogs.map((acc) => (
                      <TableRow key={acc.account_code}>
                        <TableCell className="font-medium">
                          {acc.account_code} - {acc.account_name}
                        </TableCell>
                        <TableCell className="text-right">{formatRupiah(acc.debit)}</TableCell>
                        <TableCell className="text-right">{formatRupiah(acc.credit)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatRupiah(acc.balance)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-orange-50 font-bold">
                      <TableCell colSpan={3}>Total Beban Pokok Penjualan</TableCell>
                      <TableCell className="text-right text-orange-700">{formatRupiah(totalCOGS)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* LABA KOTOR */}
              <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-blue-700">LABA KOTOR</span>
                  <span className="text-2xl font-bold text-blue-700">{formatRupiah(grossProfit)}</span>
                </div>
              </div>

              {/* BEBAN OPERASIONAL */}
              <div className="border rounded-lg overflow-hidden bg-white">
                <div className="bg-red-100 px-4 py-2">
                  <h3 className="text-lg font-bold text-red-800">BEBAN OPERASIONAL</h3>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Akun</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Kredit</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((acc) => (
                      <TableRow key={acc.account_code}>
                        <TableCell className="font-medium">
                          {acc.account_code} - {acc.account_name}
                        </TableCell>
                        <TableCell className="text-right">{formatRupiah(acc.debit)}</TableCell>
                        <TableCell className="text-right">{formatRupiah(acc.credit)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatRupiah(acc.balance)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-red-50 font-bold">
                      <TableCell colSpan={3}>Total Beban Operasional</TableCell>
                      <TableCell className="text-right text-red-700">{formatRupiah(totalExpenses)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* LABA BERSIH */}
              <div className={`border-4 rounded-lg p-6 ${netProfit >= 0 ? 'border-green-600 bg-green-50' : 'border-red-600 bg-red-50'}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {netProfit >= 0 ? (
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    ) : (
                      <TrendingDown className="h-8 w-8 text-red-600" />
                    )}
                    <span className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      LABA BERSIH = Pendapatan - Beban
                    </span>
                  </div>
                  <span className={`text-3xl font-bold ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {formatRupiah(Math.abs(netProfit))}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}