import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";

interface CashFlowViewData {
  tahun: number;
  bulan: number;
  total_kas_masuk: number;
  total_kas_keluar: number;
  saldo_kas_bersih: number;
}

export default function CashFlowReport() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cashFlowData, setCashFlowData] = useState<CashFlowViewData | null>(
    null,
  );
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [selectedMonth, setSelectedMonth] = useState(
    (new Date().getMonth() + 1).toString().padStart(2, "0"),
  );

  useEffect(() => {
    fetchCashFlowData();
  }, [selectedYear, selectedMonth]);

  const fetchCashFlowData = async () => {
    setLoading(true);

    try {
      const monthText = getMonthName(selectedMonth).trim(); // hapus spasi
      const yearNum = parseInt(selectedYear);

      const { data, error } = await supabase
        .from("vw_cash_flow_report")
        .select("*")
        .eq("tahun", yearNum)
        .filter("bulan", "ilike", monthText)
        .maybeSingle();

      console.log("🧾 Raw Supabase Data:", data);

      if (error) throw error;

      if (data) {
        setCashFlowData({
          tahun: data.tahun,
          bulan: data.bulan.trim(), // hapus spasi dari hasil
          kas_masuk: Number(data.total_kas_masuk) || 0,
          kas_keluar: Number(data.total_kas_keluar) || 0,
          saldo_kas_bersih: Number(data.saldo_kas_bersih) || 0,
        });
      } else {
        setCashFlowData({
          tahun: yearNum,
          bulan: monthText,
          kas_masuk: 0,
          kas_keluar: 0,
          saldo_kas_bersih: 0,
        });
      }

      toast({
        title: "✅ Data berhasil dimuat",
        description: `Laporan arus kas ${monthText} ${yearNum}`,
      });
    } catch (error: any) {
      console.error("❌ Error fetching cash flow:", error);
      toast({
        title: "Error",
        description: error.message || "Gagal memuat data arus kas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month: string) => {
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
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

  const years = Array.from({ length: 5 }, (_, i) =>
    (new Date().getFullYear() - i).toString(),
  );
  const months = [
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
            <Button
              onClick={fetchCashFlowData}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Filter className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : cashFlowData ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3">
                  📊 Ringkasan {getMonthName(selectedMonth)} {selectedYear}
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="bg-green-50 border-2 border-green-300 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        💰 Kas Masuk
                      </CardTitle>
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-700">
                        {formatRupiah(cashFlowData.kas_masuk)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Total penerimaan kas
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-red-50 border-2 border-red-300 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        💸 Kas Keluar
                      </CardTitle>
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-700">
                        {formatRupiah(cashFlowData.kas_keluar)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Total pengeluaran kas
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className={`border-2 shadow-md ${
                      cashFlowData.saldo_kas_bersih >= 0
                        ? "bg-blue-50 border-blue-300"
                        : "bg-orange-50 border-orange-300"
                    }`}
                  >
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        📈 Saldo Kas Bersih
                      </CardTitle>
                      <DollarSign
                        className={`h-5 w-5 ${
                          cashFlowData.saldo_kas_bersih >= 0
                            ? "text-blue-600"
                            : "text-orange-600"
                        }`}
                      />
                    </CardHeader>
                    <CardContent>
                      <div
                        className={`text-2xl font-bold ${
                          cashFlowData.saldo_kas_bersih >= 0
                            ? "text-blue-700"
                            : "text-orange-700"
                        }`}
                      >
                        {formatRupiah(Math.abs(cashFlowData.saldo_kas_bersih))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {cashFlowData.saldo_kas_bersih >= 0
                          ? "Surplus"
                          : "Defisit"}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Tidak ada data untuk periode yang dipilih
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
