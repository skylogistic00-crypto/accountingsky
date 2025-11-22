import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  Users,
  ShoppingCart,
  Package,
  Warehouse,
  Building2,
  Layers,
  Plane,
  LayoutDashboard,
  FileText,
  DollarSign,
  ArrowUpFromLine,
  ClipboardList,
  Wallet,
  Truck,
  Receipt,
  Upload,
  Briefcase,
} from "lucide-react";

export default function Navigation() {
  const { userProfile } = useAuth();
  const location = useLocation();

  const role = userProfile?.roles?.role_name || "guest";
  
  console.log("Current user role:", role);
  console.log("User profile:", userProfile);

  // 🚀 Definisikan semua menu dan role yang boleh mengakses
  const navItems = [
    {
      path: "/",
      label: "Dashboard",
      icon: Home,
      roles: [
        "super_admin",
        "accounting_manager",
        "accounting_staff",
        "warehouse_manager",
        "warehouse_staff",
        "customs_specialist",
        "read_only",
      ],
    },
    {
      path: "/dashboard-keuangan",
      label: "Dashboard Keuangan",
      icon: LayoutDashboard,
      roles: [
        "super_admin",
        "accounting_manager",
        "accounting_staff",
        "read_only",
      ],
    },
    {
      path: "/users",
      label: "User Management",
      icon: Users,
      roles: ["super_admin"],
    },
    {
      path: "/purchase-request",
      label: "Purchase Request",
      icon: ShoppingCart,
      roles: [
        "super_admin",
        "accounting_manager",
        "accounting_staff",
        "read_only",
      ],
    },
    {
      path: "/supplier",
      label: "Suppliers",
      icon: Package,
      roles: [
        "super_admin",
        "accounting_staff",
        "warehouse_manager",
        "accounting_manager",
        "read_only",
      ],
    },
    {
      path: "/shipper",
      label: "Shippers",
      icon: Truck,
      roles: [
        "super_admin",
        "accounting_staff",
        "warehouse_manager",
        "accounting_manager",
        "read_only",
      ],
    },
    {
      path: "/consignee",
      label: "Consignees",
      icon: Package,
      roles: [
        "super_admin",
        "accounting_staff",
        "warehouse_manager",
        "accounting_manager",
        "read_only",
      ],
    },
    {
      path: "/customer",
      label: "Customers",
      icon: Users,
      roles: [
        "super_admin",
        "accounting_staff",
        "warehouse_manager",
        "accounting_manager",
        "read_only",
      ],
    },
    {
      path: "/service-items",
      label: "Service Items",
      icon: Briefcase,
      roles: [
        "super_admin",
        "accounting_manager",
        "accounting_staff",
        "read_only",
      ],
    },
    {
      path: "/stock",
      label: "Stock",
      icon: Warehouse,
      roles: [
        "super_admin",
        "accounting_manager",
        "accounting_staff",
        "warehouse_manager",
        "warehouse_staff",
        "read_only",
      ],
    },
    {
      path: "/warehouses",
      label: "Warehouses",
      icon: Building2,
      roles: [
        "super_admin",
        "warehouse_manager",
        "warehouse_staff",
        "read_only",
      ],
    },
    {
      path: "/barang-lini",
      label: "Barang Lini",
      icon: Layers,
      roles: [
        "super_admin",
        "warehouse_manager",
        "warehouse_staff",
        "read_only",
      ],
    },
    {
      path: "/barang-keluar",
      label: "Barang Keluar",
      icon: ArrowUpFromLine,
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
      path: "/stock-adjustment",
      label: "Stock Adjustment",
      icon: ClipboardList,
      roles: [
        "super_admin",
        "warehouse_manager",
        "accounting_manager",
        "accounting_staff",
        "warehouse_staff",
      ],
    },
    {
      path: "/air-waybill",
      label: "Air Waybill",
      icon: Plane,
      roles: [
        "super_admin",
        "accounting_manager",
        "accounting_staff",
        "customs_specialist",
      ],
    },
    {
      path: "/sales",
      label: "Penjualan",
      icon: ShoppingCart,
      roles: ["super_admin", "accounting_manager", "accounting_staff"],
    },
    {
      path: "/cash-book",
      label: "Cash Book",
      icon: Wallet,
      roles: ["super_admin", "accounting_manager", "accounting_staff"],
    },
    {
      path: "/tax-reports",
      label: "Laporan Pajak",
      icon: Receipt,
      roles: [
        "super_admin",
        "accounting_manager",
        "accounting_staff",
      ],
    },
    {
      path: "/coretax-upload",
      label: "Upload Coretax",
      icon: Upload,
      roles: [
        "super_admin",
        "accounting_manager",
        "accounting_staff",
      ],
    },
    {
      path: "/coretax-report",
      label: "Daftar Upload Coretax",
      icon: FileText,
      roles: [
        "super_admin",
        "accounting_manager",
        "accounting_staff",
      ],
    },
    {
      path: "/coa-management",
      label: "Chart of Accounts",
      icon: FileText,
      roles: ["super_admin", "accounting_manager", "accounting_staff"],
    },
    {
      path: "/coa-mapping",
      label: "COA Mapping",
      icon: FileText,
      roles: ["super_admin", "accounting_manager", "accounting_staff"],
    },
    {
      path: "/report-barang-lama",
      label: "Report Barang Lama",
      icon: FileText,
      roles: ["super_admin", "accounting_staff", "accounting_manager"],
    },
  ];

  // 🧩 Filter menu berdasarkan role user
  const filteredNavItems = navItems.filter((item) => item.roles.includes(role));

  // 💡 Tetap bagi jadi dua baris agar layout rapi
  const firstRow = filteredNavItems.slice(0, 8);
  const secondRow = filteredNavItems.slice(8);

  const renderNavItems = (items: typeof navItems) => {
    return items.map((item) => {
      const Icon = item.icon;
      const isActive = location.pathname === item.path;

      return (
        <Link
          key={item.path}
          to={item.path}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
            isActive
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Icon className="w-4 h-4" />
          {item.label}
        </Link>
      );
    });
  };

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="container mx-auto px-4">
        {/* 🔹 Baris 1 */}
        <div className="flex space-x-1 overflow-x-auto">
          {renderNavItems(firstRow)}
        </div>

        {/* 🔹 Baris 2 */}
        {secondRow.length > 0 && (
          <div className="flex space-x-1 overflow-x-auto border-t border-slate-100">
            {renderNavItems(secondRow)}
          </div>
        )}
      </div>
    </nav>
  );
}