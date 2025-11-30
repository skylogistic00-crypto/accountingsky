import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Package,
  DollarSign,
  Users,
  FileText,
  Settings,
  TrendingUp,
  Warehouse,
  ShoppingCart,
  Truck,
  UserCheck,
  Building2,
  PackageOpen,
  ClipboardList,
  BarChart3,
  BookOpen,
  FileSpreadsheet,
  Calculator,
  Briefcase,
  ScanText,
  Loader2,
} from "lucide-react";

interface OcrResult {
  id: string;
  extracted_text: string;
  created_at: string;
}

function Home() {
  const navigate = useNavigate();
  const { userProfile, userRole } = useAuth();
  const [ocrResults, setOcrResults] = useState<OcrResult[]>([]);
  const [loadingOcr, setLoadingOcr] = useState(false);

  const menuCards = [
    {
      title: "Dashboard Keuangan",
      description: "Lihat ringkasan keuangan dan laporan",
      icon: LayoutDashboard,
      path: "/dashboard-keuangan",
      color: "bg-purple-500",
      roles: [
        "super_admin",
        "accounting_manager",
        "accounting_staff",
        "read_only",
      ],
    },
    {
      title: "Transaksi Keuangan",
      description: "Kelola transaksi kas dan keuangan",
      icon: DollarSign,
      path: "/transaksi-keuangan",
      color: "bg-green-500",
      roles: ["super_admin", "accounting_manager", "accounting_staff"],
    },
    {
      title: "Finance Transactions",
      description: "Manage expense transactions with OCR",
      icon: DollarSign,
      path: "/finance/transactions",
      color: "bg-emerald-500",
      roles: ["super_admin", "accounting_manager", "accounting_staff", "finance_manager", "finance_staff"],
    },
    {
      title: "Manajemen Stok",
      description: "Kelola inventori dan stok barang",
      icon: Package,
      path: "/stock",
      color: "bg-blue-500",
      roles: ["super_admin", "warehouse_manager", "warehouse_staff"],
    },
    {
      title: "Gudang",
      description: "Kelola data gudang dan lokasi",
      icon: Warehouse,
      path: "/warehouses",
      color: "bg-orange-500",
      roles: ["super_admin", "warehouse_manager", "warehouse_staff"],
    },
    {
      title: "Delivery",
      description: "Kelola pengiriman barang",
      icon: Truck,
      path: "/delivery",
      color: "bg-cyan-600",
      roles: ["super_admin", "warehouse_manager", "warehouse_staff"],
    },
    {
      title: "Supplier",
      description: "Kelola data supplier",
      icon: Truck,
      path: "/supplier",
      color: "bg-teal-500",
      roles: ["super_admin", "purchasing", "accounting_manager"],
    },
    {
      title: "Customer",
      description: "Kelola data customer",
      icon: UserCheck,
      path: "/customer",
      color: "bg-pink-500",
      roles: ["super_admin", "accounting_manager", "accounting_staff"],
    },
    {
      title: "Shipper",
      description: "Kelola data shipper",
      icon: Building2,
      path: "/shipper",
      color: "bg-amber-500",
      roles: ["super_admin", "warehouse_manager"],
    },
    {
      title: "Consignee",
      description: "Kelola data consignee",
      icon: Building2,
      path: "/consignee",
      color: "bg-lime-500",
      roles: ["super_admin", "warehouse_manager"],
    },
    {
      title: "Barang Lini",
      description: "Kelola barang lini 1 & 2",
      icon: PackageOpen,
      path: "/barang-lini",
      color: "bg-violet-500",
      roles: ["super_admin", "warehouse_manager", "warehouse_staff"],
    },
    {
      title: "Barang Keluar",
      description: "Kelola barang keluar",
      icon: PackageOpen,
      path: "/barang-keluar",
      color: "bg-fuchsia-500",
      roles: ["super_admin", "warehouse_manager", "warehouse_staff"],
    },
    {
      title: "Air Waybill",
      description: "Kelola air waybill",
      icon: ClipboardList,
      path: "/air-waybill",
      color: "bg-sky-500",
      roles: ["super_admin", "warehouse_manager", "warehouse_staff"],
    },
    {
      title: "COA Management",
      description: "Kelola chart of accounts",
      icon: BookOpen,
      path: "/coa-management",
      color: "bg-emerald-500",
      roles: ["super_admin", "accounting_manager"],
    },
    {
      title: "Stock Adjustment",
      description: "Kelola penyesuaian stok",
      icon: Calculator,
      path: "/stock-adjustment",
      color: "bg-slate-500",
      roles: ["super_admin", "warehouse_manager", "accounting_manager"],
    },
    {
      title: "Barang Import",
      description: "Kelola data stok barang import",
      icon: Package,
      path: "/stock-barang-import",
      color: "bg-violet-500",
      roles: [
        "super_admin",
        "warehouse_manager",
        "accounting_manager",
        "accounting_staff",
        "warehouse_staff",
        "read_only",
      ],
    },
    {
      title: "Laporan",
      description: "Lihat berbagai laporan keuangan",
      icon: FileText,
      path: "/laporan-keuangan",
      color: "bg-indigo-500",
      roles: [
        "super_admin",
        "accounting_manager",
        "accounting_staff",
        "read_only",
      ],
    },
    {
      title: "Manajemen User",
      description: "Kelola pengguna dan hak akses",
      icon: Users,
      path: "/users",
      color: "bg-red-500",
      roles: ["super_admin"],
    },
    {
      title: "Laporan Pajak",
      description: "Kelola pengguna dan hak akses",
      icon: BookOpen,
      path: "/tax-reports",
      color: "bg-red-500",
      roles: ["super_admin"],
    },
    {
      title: "HRD Management",
      description: "Kelola karyawan, absensi, payroll & kinerja",
      icon: Briefcase,
      path: "/hrd-dashboard",
      color: "bg-blue-600",
      roles: ["super_admin", "hr_manager", "hr_staff"],
    },
  ];

  const currentRole = userRole || "guest";
  const filteredMenus = menuCards.filter((menu) =>
    menu.roles.includes(currentRole),
  );

  useEffect(() => {
    fetchOcrResults();
  }, []);

  const fetchOcrResults = async () => {
    setLoadingOcr(true);
    try {
      const { data, error } = await supabase
        .from("ocr_results")
        .select("id, extracted_text, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data) {
        setOcrResults(data);
      }
    } catch (error: any) {
      console.error("Failed to fetch OCR results:", error);
    } finally {
      setLoadingOcr(false);
    }
  };

  console.log("🔍 Debug Home - userRole:", userRole);
  console.log("🔍 Debug Home - filteredMenus:", filteredMenus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Selamat Datang di Sistem Manajemen
          </h1>
          <p className="text-gray-600">Pilih menu di bawah untuk memulai</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* OCR Results Card */}
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => navigate("/google-ocr-scanner")}
          >
            <CardHeader>
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ScanText className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">OCR Scanner</CardTitle>
              <CardDescription>
                {loadingOcr ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </span>
                ) : ocrResults.length === 0 ? (
                  "Belum ada hasil OCR"
                ) : (
                  `${ocrResults.length} hasil OCR tersedia`
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="ghost"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/google-ocr-scanner");
                }}
              >
                Buka Menu →
              </Button>
            </CardContent>
          </Card>

          {filteredMenus.map((menu) => {
            const Icon = menu.icon;
            return (
              <Card
                key={menu.path}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(menu.path)}
              >
                <CardHeader>
                  <div
                    className={`w-12 h-12 ${menu.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{menu.title}</CardTitle>
                  <CardDescription>{menu.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(menu.path);
                    }}
                  >
                    Buka Menu →
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Home;
