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
import { Loader2, Download, Filter } from "lucide-react";

interface JournalEntry {
  id: string;
  transaction_id: string;
  transaction_date: string;
  account_code: string;
  account_name: string;
  debit: number;
  credit: number;
  description: string;
  created_by: string;
}

interface AccountBalance {
  account_code: string;
  account_name: string;
  account_type: string;
  debit_total: number;
  credit_total: number;
  balance: number;
}

export default function IntegratedFinancialReport() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"journal" | "ledger" | "trial">("journal");
  
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [accountBalances, setAccountBalances] = useState<AccountBalance[]>([]);
  
  const [dateFrom, setDateFrom] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
  );
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    fetchJournalEntries();
  }, [dateFrom, dateTo]);

  const fetchJournalEntries = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .gte("transaction_date", dateFrom)
      .lte("transaction_date", dateTo)
      .order("transaction_date", { ascending: true })
      .order("transaction_id", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data jurnal",
        variant: "destructive",
      });
    } else {
      setJournalEntries(data || []);
      calculateAccountBalances(data || []);
    }
    
    setLoading(false);
  };

  const calculateAccountBalances = async (entries: JournalEntry[]) => {
    // Get all COA accounts
    const { data: coaAccounts } = await supabase
      .from("chart_of_accounts")
      .select("account_code, account_name, account_type, normal_balance")
      .eq("is_active", true)
      .order("account_code");

    if (!coaAccounts) return;

    // Calculate balances
    const balances: { [key: string]: AccountBalance } = {};

    coaAccounts.forEach((acc) => {
      balances[acc.account_code] = {
        account_code: acc.account_code,
        account_name: acc.account_name,
        account_type: acc.account_type,
        debit_total: 0,
        credit_total: 0,
        balance: 0,
      };
    });

    entries.forEach((entry) => {
      if (balances[entry.account_code]) {
        balances[entry.account_code].debit_total += entry.debit;
        balances[entry.account_code].credit_total += entry.credit;
      }
    });

    // Calculate final balance based on normal balance
    Object.keys(balances).forEach((code) => {
      const acc = coaAccounts.find((a) => a.account_code === code);
      if (acc) {
        if (acc.normal_balance === "Debit") {
          balances[code].balance =
            balances[code].debit_total - balances[code].credit_total;
        } else {
          balances[code].balance =
            balances[code].credit_total - balances[code].debit_total;
        }
      }
    });

    setAccountBalances(
      Object.values(balances).filter(
        (b) => b.debit_total > 0 || b.credit_total > 0
      )
    );
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const exportToCSV = () => {
    if (activeTab === "journal") {
      const csv = [
        ["Tanggal", "ID Transaksi", "Kode Akun", "Nama Akun", "Debit", "Kredit", "Deskripsi"],
        ...journalEntries.map((entry) => [
          entry.transaction_date,
          entry.transaction_id,
          entry.account_code,
          entry.account_name,
          entry.debit,
          entry.credit,
          entry.description,
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jurnal_${dateFrom}_${dateTo}.csv`;
      a.click();
    } else if (activeTab === "ledger") {
      const csv = [
        ["Kode Akun", "Nama Akun", "Tipe", "Total Debit", "Total Kredit", "Saldo"],
        ...accountBalances.map((acc) => [
          acc.account_code,
          acc.account_name,
          acc.account_type,
          acc.debit_total,
          acc.credit_total,
          acc.balance,
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `buku_besar_${dateFrom}_${dateTo}.csv`;
      a.click();
    }

    toast({
      title: "✅ Berhasil",
      description: "Laporan berhasil diexport ke CSV",
    });
  };

  const getTotalDebit = () =>
    journalEntries.reduce((sum, entry) => sum + entry.debit, 0);
  
  const getTotalCredit = () =>
    journalEntries.reduce((sum, entry) => sum + entry.credit, 0);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <Card className="max-w-7xl mx-auto rounded-2xl shadow-md">
        <CardHeader className="p-4">
          <CardTitle className="text-2xl">Laporan Keuangan Terintegrasi</CardTitle>
          <CardDescription>
            Jurnal Umum, Buku Besar, dan Neraca Saldo dari semua transaksi
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          {/* Filter Date Range */}
          <div className="grid md:grid-cols-4 gap-3 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Dari Tanggal</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">Sampai Tanggal</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={fetchJournalEntries}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filter
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

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b">
            <Button
              variant={activeTab === "journal" ? "default" : "ghost"}
              onClick={() => setActiveTab("journal")}
              className="rounded-b-none"
            >
              Jurnal Umum
            </Button>
            <Button
              variant={activeTab === "ledger" ? "default" : "ghost"}
              onClick={() => setActiveTab("ledger")}
              className="rounded-b-none"
            >
              Buku Besar
            </Button>
            <Button
              variant={activeTab === "trial" ? "default" : "ghost"}
              onClick={() => setActiveTab("trial")}
              className="rounded-b-none"
            >
              Neraca Saldo
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              {/* Journal Tab */}
              {activeTab === "journal" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">
                      Jurnal Umum ({journalEntries.length} entri)
                    </h3>
                    <div className="text-sm text-gray-600">
                      Total Debit: {formatRupiah(getTotalDebit())} | Total Kredit:{" "}
                      {formatRupiah(getTotalCredit())}
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-100">
                          <TableHead>Tanggal</TableHead>
                          <TableHead>ID Transaksi</TableHead>
                          <TableHead>Kode Akun</TableHead>
                          <TableHead>Nama Akun</TableHead>
                          <TableHead className="text-right">Debit</TableHead>
                          <TableHead className="text-right">Kredit</TableHead>
                          <TableHead>Deskripsi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {journalEntries.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell>{entry.transaction_date}</TableCell>
                            <TableCell className="font-mono text-sm">
                              {entry.transaction_id}
                            </TableCell>
                            <TableCell className="font-mono">
                              {entry.account_code}
                            </TableCell>
                            <TableCell>{entry.account_name}</TableCell>
                            <TableCell className="text-right font-semibold text-green-700">
                              {entry.debit > 0 ? formatRupiah(entry.debit) : "-"}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-red-700">
                              {entry.credit > 0 ? formatRupiah(entry.credit) : "-"}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {entry.description}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Ledger Tab */}
              {activeTab === "ledger" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Buku Besar ({accountBalances.length} akun)
                  </h3>

                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-100">
                          <TableHead>Kode Akun</TableHead>
                          <TableHead>Nama Akun</TableHead>
                          <TableHead>Tipe</TableHead>
                          <TableHead className="text-right">Total Debit</TableHead>
                          <TableHead className="text-right">Total Kredit</TableHead>
                          <TableHead className="text-right">Saldo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accountBalances.map((acc) => (
                          <TableRow key={acc.account_code}>
                            <TableCell className="font-mono">
                              {acc.account_code}
                            </TableCell>
                            <TableCell className="font-medium">
                              {acc.account_name}
                            </TableCell>
                            <TableCell>
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                {acc.account_type}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              {formatRupiah(acc.debit_total)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatRupiah(acc.credit_total)}
                            </TableCell>
                            <TableCell className="text-right font-bold">
                              {formatRupiah(Math.abs(acc.balance))}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Trial Balance Tab */}
              {activeTab === "trial" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Neraca Saldo</h3>

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
                        {accountBalances.map((acc) => (
                          <TableRow key={acc.account_code}>
                            <TableCell className="font-mono">
                              {acc.account_code}
                            </TableCell>
                            <TableCell>{acc.account_name}</TableCell>
                            <TableCell className="text-right font-semibold text-green-700">
                              {acc.balance > 0 ? formatRupiah(acc.balance) : "-"}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-red-700">
                              {acc.balance < 0 ? formatRupiah(Math.abs(acc.balance)) : "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-gray-100 font-bold">
                          <TableCell colSpan={2}>TOTAL</TableCell>
                          <TableCell className="text-right text-green-700">
                            {formatRupiah(
                              accountBalances
                                .filter((a) => a.balance > 0)
                                .reduce((sum, a) => sum + a.balance, 0)
                            )}
                          </TableCell>
                          <TableCell className="text-right text-red-700">
                            {formatRupiah(
                              accountBalances
                                .filter((a) => a.balance < 0)
                                .reduce((sum, a) => sum + Math.abs(a.balance), 0)
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
