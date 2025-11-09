import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import UserManagement from './components/UserManagement';
import Dashboard from './components/Dashboard';
import PurchaseRequestForm from './components/PurchaseRequestForm';
import PurchaseRequestList from './components/PurchaseRequestList';
import SupplierForm from './components/SupplierForm';
import StockForm from './components/StockForm';
import WarehousesForm from './components/WarehousesForm';
import BarangLini from './components/BarangLini';
import BarangKeluar from './components/BarangKeluar';
import AirWaybill from './components/AirWaybill';
import CashBook from './components/CashBook';
import AdminSetup from './components/AdminSetup';
import COAManagement from './components/COAManagement';
import BarangLamaReport from './components/BarangLamaReport';
import { Toaster } from './components/ui/toaster';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function HomePage() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
    </div>
  );
}

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
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
          <ProtectedRoute>
            <PurchaseRequestList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supplier"
        element={
          <ProtectedRoute>
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
          <ProtectedRoute>
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
          <ProtectedRoute>
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
          <ProtectedRoute>
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
          <ProtectedRoute>
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
          <ProtectedRoute>
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
          <ProtectedRoute>
            <CashBook />
          </ProtectedRoute>
        }
      />
      <Route
        path="/coa-management"
        element={
          <ProtectedRoute>
            <COAManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/report-barang-lama"
        element={
          <ProtectedRoute>
            <BarangLamaReport />
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