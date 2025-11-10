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
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Download, Filter, FileText } from "lucide-react";

interface AccountBalance {
  account_code: string;
  account_name: string;
  account_type: string;
  debit: number;
  credit: number;
  balance: number;
}

export default function BalanceSheetReport() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [assets, setAssets] = useState<AccountBalance[]>([]);
  const [liabilities, setLiabilities] = useState<AccountBalance[]>([]);
  const [equity, setEquity] = useState<AccountBalance[]>([]);
  
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    fetchBalanceSheetData();
  }, [asOfDate]);

  const fetchBalanceSheetData = async () => {
    setLoading(true);

    try {
      // Fetch journal entries up to the date
      const { data: journalEntries, error: journalError } = await supabase
        .from("journal_entries")
        .select("account_code, debit, credit")
        .lte("transaction_date", asOfDate);

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
      const assetAccounts: AccountBalance[] = [];
      const liabilityAccounts: AccountBalance[] = [];
      const equityAccounts: AccountBalance[] = [];

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

        if (acc.account_type === "Aset") {
          assetAccounts.push(balance);
        } else if (acc.account_type === "Kewajiban") {
          liabilityAccounts.push(balance);
        } else if (acc.account_type === "Ekuitas") {
          equityAccounts.push(balance);
        }
      });

      setAssets(assetAccounts);
      setLiabilities(liabilityAccounts);
      setEquity(equityAccounts);

      // Success notification
      toast({
        title: "✅ Laporan diperbarui otomatis",
        description: `Data neraca per ${asOfDate} berhasil dimuat`,
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

  const totalAssets = assets.reduce((sum, acc) => sum + acc.balance, 0);
  const totalLiabilities = liabilities.reduce((sum, acc) => sum + acc.balance, 0);
  const totalEquity = equity.reduce((sum, acc) => sum + acc.balance, 0);
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
  const balanceDifference = totalAssets - totalLiabilitiesAndEquity;

  const exportToCSV = () => {
    const csv = [
      ["LAPORAN NERACA (BALANCE SHEET)"],
      [`Per Tanggal: ${asOfDate}`],
      [""],
      ["Akun", "Debit", "Kredit", "Saldo"],
      [""],
      ["ASET"],
      ...assets.map((acc) => [
        `${acc.account_code} - ${acc.account_name}`,
        acc.debit.toFixed(2),
        acc.credit.toFixed(2),
        acc.balance.toFixed(2),
      ]),
      ["", "", "TOTAL ASET", totalAssets.toFixed(2)],
      [""],
      ["KEWAJIBAN"],
      ...liabilities.map((acc) => [
        `${acc.account_code} - ${acc.account_name}`,
        acc.debit.toFixed(2),
        acc.credit.toFixed(2),
        acc.balance.toFixed(2),
      ]),
      ["", "", "TOTAL KEWAJIBAN", totalLiabilities.toFixed(2)],
      [""],
      ["EKUITAS"],
      ...equity.map((acc) => [
        `${acc.account_code} - ${acc.account_name}`,
        acc.debit.toFixed(2),
        acc.credit.toFixed(2),
        acc.balance.toFixed(2),
      ]),
      ["", "", "TOTAL EKUITAS", totalEquity.toFixed(2)],
      [""],
      ["", "", "TOTAL KEWAJIBAN & EKUITAS", totalLiabilitiesAndEquity.toFixed(2)],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `neraca_${asOfDate}.csv`;
    a.click();

    toast({
      title: "✅ Berhasil",
      description: "Laporan berhasil diexport ke CSV",
    });
  };

  const isBalanced = Math.abs(balanceDifference) < 0.01;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <Card className="max-w-7xl mx-auto bg-white shadow-md rounded-2xl border">
        <CardHeader className="p-4">
          <CardTitle className="text-2xl">Laporan Neraca</CardTitle>
          <CardDescription>
            Laporan posisi keuangan yang menunjukkan aset, kewajiban, dan ekuitas perusahaan
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          {/* Filter Date */}
          <div className="grid md:grid-cols-3 gap-3 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="space-y-2">
              <Label htmlFor="asOfDate">Per Tanggal</Label>
              <Input
                id="asOfDate"
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={fetchBalanceSheetData} className="w-full bg-blue-600 hover:bg-blue-700">
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
              {/* Grid 3 Kolom */}
              <div className="grid md:grid-cols-3 gap-4">
                {/* ASET */}
                <div className="border rounded-lg overflow-hidden bg-white shadow-md">
                  <div className="bg-blue-100 px-4 py-2">
                    <h3 className="text-lg font-bold text-blue-800">ASET</h3>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Akun</TableHead>
                        <TableHead className="text-right">Saldo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assets.map((acc) => (
                        <TableRow key={acc.account_code}>
                          <TableCell className="text-sm">
                            {acc.account_code}
                            <br />
                            <span className="text-xs text-gray-600">{acc.account_name}</span>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-sm">
                            {formatRupiah(acc.balance)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* KEWAJIBAN */}
                <div className="border rounded-lg overflow-hidden bg-white shadow-md">
                  <div className="bg-red-100 px-4 py-2">
                    <h3 className="text-lg font-bold text-red-800">KEWAJIBAN</h3>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Akun</TableHead>
                        <TableHead className="text-right">Saldo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {liabilities.map((acc) => (
                        <TableRow key={acc.account_code}>
                          <TableCell className="text-sm">
                            {acc.account_code}
                            <br />
                            <span className="text-xs text-gray-600">{acc.account_name}</span>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-sm">
                            {formatRupiah(acc.balance)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* EKUITAS */}
                <div className="border rounded-lg overflow-hidden bg-white shadow-md">
                  <div className="bg-green-100 px-4 py-2">
                    <h3 className="text-lg font-bold text-green-800">EKUITAS</h3>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Akun</TableHead>
                        <TableHead className="text-right">Saldo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {equity.map((acc) => (
                        <TableRow key={acc.account_code}>
                          <TableCell className="text-sm">
                            {acc.account_code}
                            <br />
                            <span className="text-xs text-gray-600">{acc.account_name}</span>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-sm">
                            {formatRupiah(acc.balance)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* TOTAL PER KATEGORI */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4">
                  <div className="text-center">
                    <p className="text-sm text-blue-600 font-semibold mb-1">TOTAL ASET</p>
                    <p className="text-2xl font-bold text-blue-700">{formatRupiah(totalAssets)}</p>
                  </div>
                </div>
                <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4">
                  <div className="text-center">
                    <p className="text-sm text-red-600 font-semibold mb-1">TOTAL KEWAJIBAN</p>
                    <p className="text-2xl font-bold text-red-700">{formatRupiah(totalLiabilities)}</p>
                  </div>
                </div>
                <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
                  <div className="text-center">
                    <p className="text-sm text-green-600 font-semibold mb-1">TOTAL EKUITAS</p>
                    <p className="text-2xl font-bold text-green-700">{formatRupiah(totalEquity)}</p>
                  </div>
                </div>
              </div>

              {/* RINGKASAN NERACA */}
              <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
                <h3 className="text-xl font-bold mb-4 text-center">Ringkasan Neraca</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-semibold text-blue-700">Total Aset</span>
                    <span className="text-xl font-bold text-blue-700">{formatRupiah(totalAssets)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="font-semibold text-purple-700">Total Kewajiban + Ekuitas</span>
                    <span className="text-xl font-bold text-purple-700">{formatRupiah(totalLiabilitiesAndEquity)}</span>
                  </div>
                  <div className={`flex justify-between items-center p-3 rounded-lg ${
                    isBalanced ? 'bg-green-50' : 'bg-yellow-50'
                  }`}>
                    <span className={`font-semibold ${isBalanced ? 'text-green-700' : 'text-yellow-700'}`}>
                      Selisih Neraca
                    </span>
                    <span className={`text-xl font-bold ${isBalanced ? 'text-green-700' : 'text-yellow-700'}`}>
                      {formatRupiah(Math.abs(balanceDifference))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Balance Warning */}
              {!isBalanced && (
                <div className="p-4 bg-yellow-100 border-2 border-yellow-400 rounded-lg">
                  <p className="text-yellow-800 font-semibold text-center flex items-center justify-center gap-2">
                    ⚠️ Perhatian: Neraca belum seimbang, periksa transaksi jurnal.
                  </p>
                  <p className="text-sm text-yellow-700 text-center mt-2">
                    Selisih: {formatRupiah(balanceDifference)} 
                    {balanceDifference > 0 ? ' (Aset lebih besar)' : ' (Kewajiban + Ekuitas lebih besar)'}
                  </p>
                </div>
              )}

              {/* Balance Check */}
              {isBalanced && (
                <div className="p-4 bg-green-100 border-2 border-green-400 rounded-lg">
                  <p className="text-green-700 font-semibold text-center">
                    ✅ Neraca Balance! Total Aset = Total Kewajiban + Ekuitas
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}