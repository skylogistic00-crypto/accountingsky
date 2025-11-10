import { Link, useLocation } from 'react-router-dom';
import { Home, Users, ShoppingCart, Package, Warehouse, Building2, ArrowUpFromLine, Layers, Plane, Receipt, BookOpen, BarChart3, DollarSign, PackageX, Link2, LayoutDashboard } from 'lucide-react';

export default function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/financial-dashboard', label: 'Dashboard Keuangan', icon: LayoutDashboard },
    { path: '/users', label: 'User Management', icon: Users },
    { path: '/purchase-request', label: 'Purchase Request', icon: ShoppingCart },
    { path: '/supplier', label: 'Suppliers', icon: Package },
    { path: '/stock', label: 'Stock', icon: Warehouse },
    { path: '/warehouses', label: 'Warehouses', icon: Building2 },
    { path: '/barang-lini', label: 'Barang Lini', icon: Layers },
    { path: '/barang-keluar', label: 'Barang Keluar', icon: ArrowUpFromLine },
    { path: '/air-waybill', label: 'Air Waybill', icon: Plane },
    { path: '/sales', label: 'Penjualan', icon: DollarSign },
    { path: '/internal-usage', label: 'Pemakaian Internal', icon: PackageX },
    { path: '/cash-book', label: 'Cash Book', icon: Receipt },
    { path: '/coa-management', label: 'COA Management', icon: BookOpen },
    { path: '/coa-mapping', label: 'COA Mapping', icon: Link2 },
    { path: '/report-barang-lama', label: 'Report Barang Lama', icon: BarChart3 },
  ];

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="container mx-auto px-4">
        <div className="flex space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}