import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./contexts/AuthContext";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import HeroSection from "./components/HeroSection";
import UserManagement from "./components/UserManagement";
import Dashboard from "./components/Dashboard";
import PurchaseRequestForm from "./components/PurchaseRequestForm";
import PurchaseRequestList from "./components/PurchaseRequestList";
import SupplierForm from "./components/SupplierForm";
import StockForm from "./components/StockForm";
import WarehousesForm from "./components/WarehousesForm";
import BarangLini from "./components/BarangLini";
import BarangKeluar from "./components/BarangKeluar";
import AirWaybill from "./components/AirWaybill";
import CashBook from "./components/CashBook";
import AdminSetup from "./components/AdminSetup";
import COAManagement from "./components/COAManagement";
import BarangLamaReport from "./components/BarangLamaReport";
import SalesForm from "./components/SalesForm";
import InternalUsageForm from "./components/InternalUsageForm";
import COAMappingManager from "./components/COAMappingManager";
import IntegratedFinancialReport from "./components/IntegratedFinancialReport";
import ProfitLossReport from "./components/ProfitLossReport";
import BalanceSheetReport from "./components/BalanceSheetReport";
import FinancialDashboard from "./components/FinancialDashboard";
import CashFlowReport from "./components/CashFlowReport";
import { Toaster } from "./components/ui/toaster";

// 🔐 1️⃣ ProtectedRoute — hanya render jika role diizinkan
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth();

  // ⏳ Saat masih loading user data
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // 🚪 Jika belum login → redirect ke halaman utama
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 🔍 Jika role tidak diizinkan → sembunyikan (tidak render)
  if (
    allowedRoles &&
    userProfile?.roles?.role_name &&
    !allowedRoles.includes(userProfile.roles.role_name)
  ) {
    return null; // ✅ aman, tidak error & tidak render
  }

  return <>{children}</>;
}

// 🏠 2️⃣ HomePage: arahkan user sesuai role
function HomePage() {
  const { user, userProfile, loading } = useAuth();

  console.log("🧾 User from Auth:", user);
  console.log("👤 User Profile:", userProfile);
  console.log("🔐 Role detected:", userProfile?.roles?.role_name);

  // ⏳ Saat data user masih loading → tampilkan spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <div className="text-lg">Memuat data pengguna...</div>
      </div>
    );
  }

  // 🧍‍♂️ Jika sudah login → redirect sesuai role
  if (user && userProfile?.roles?.role_name) {
    const role = userProfile.roles.role_name;

    switch (role) {
      case "super_admin":
        return <Navigate to="/dashboard" replace />;
      case "warehouse_manager":
        return <Navigate to="/warehouses" replace />;
      case "purchasing":
        return <Navigate to="/purchase-request" replace />;
      case "finance":
        return <Navigate to="/financial-dashboard" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  // 🌐 Jika belum login → tampilkan landing page biasa
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
    </div>
  );
}

// 🧭 3️⃣ AppRoutes: definisikan semua route dengan pembatasan role
function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin-setup" element={<AdminSetup />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute
            allowedRoles={[
              "super_admin",
              "warehouse_manager",
              "accounting_staff",
            ]}
          >
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <div className="min-h-screen bg-slate-50">
              <Header />
              <Navigation />
              <UserManagement />
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchase-request"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <PurchaseRequestList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supplier"
        element={
          <ProtectedRoute
            allowedRoles={[
              "super_admin",
              "accounting_manager",
              "accounting_staff",
            ]}
          >
            <div className="min-h-screen bg-slate-50">
              <Header />
              <Navigation />
              <SupplierForm />
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/stock"
        element={
          <ProtectedRoute
            allowedRoles={[
              "super_admin",
              "accounting_manager",
              "accounting_staff",
              "warehouse_manager",
            ]}
          >
            <div className="min-h-screen bg-slate-50">
              <Header />
              <Navigation />
              <StockForm />
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/warehouses"
        element={
          <ProtectedRoute allowedRoles={["super_admin", "warehouse_manager"]}>
            <div className="min-h-screen bg-slate-50">
              <Header />
              <Navigation />
              <WarehousesForm />
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/barang-lini"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <div className="min-h-screen bg-slate-50">
              <Header />
              <Navigation />
              <BarangLini />
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/barang-keluar"
        element={
          <ProtectedRoute
            allowedRoles={[
              "super_admin",
              "warehouse_manager",
              "accounting_manager",
              "accounting_staff",
            ]}
          >
            <div className="min-h-screen bg-slate-50">
              <Header />
              <Navigation />
              <BarangKeluar />
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/air-waybill"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <div className="min-h-screen bg-slate-50">
              <Header />
              <Navigation />
              <AirWaybill />
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cash-book"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <CashBook />
          </ProtectedRoute>
        }
      />
      <Route
        path="/coa-management"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <COAManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/report-barang-lama"
        element={
          <ProtectedRoute
            allowedRoles={[
              "super_admin",
              "accounting_manager",
              "accounting_staff",
            ]}
          >
            <BarangLamaReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales"
        element={
          <ProtectedRoute
            allowedRoles={[
              "super_admin",
              "accounting_manager",
              "accounting_staff",
            ]}
          >
            <div className="min-h-screen bg-slate-50">
              <Header />
              <Navigation />
              <SalesForm />
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/internal-usage"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <div className="min-h-screen bg-slate-50">
              <Header />
              <Navigation />
              <InternalUsageForm />
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/coa-mapping"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <div className="min-h-screen bg-slate-50">
              <Header />
              <Navigation />
              <COAMappingManager />
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial-dashboard"
        element={
          <ProtectedRoute
            allowedRoles={[
              "super_admin",
              "accounting_staff",
              "accounting_manager",
            ]}
          >
            <div className="min-h-screen bg-slate-50">
              <Header />
              <Navigation />
              <FinancialDashboard />
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profit-loss"
        element={
          <ProtectedRoute
            allowedRoles={[
              "super_admin",
              "accounting_manager",
              "accounting_staff",
            ]}
          >
            <div className="min-h-screen bg-slate-50">
              <Header />
              <Navigation />
              <ProfitLossReport />
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/balance-sheet"
        element={
          <ProtectedRoute
            allowedRoles={[
              "super_admin",
              "accounting_manager",
              "accounting_staff",
            ]}
          >
            <div className="min-h-screen bg-slate-50">
              <Header />
              <Navigation />
              <BalanceSheetReport />
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cash-flow"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <div className="min-h-screen bg-slate-50">
              <Header />
              <Navigation />
              <CashFlowReport />
            </div>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
