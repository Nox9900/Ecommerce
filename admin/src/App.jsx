import { Navigate, Route, Routes } from "react-router";
import LoginPage from "./pages/LoginPage";
import { useAuth } from "@clerk/clerk-react";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import CustomersPage from "./pages/CustomersPage";
import SettingsPage from "./pages/SettingsPage";
import DashboardLayout from "./layouts/DashboardLayout";
import VendorManagement from "./pages/admin/VendorManagement";
import GlobalSettings from "./pages/admin/GlobalSettings";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorOnboarding from "./pages/vendor/VendorOnboarding";
import VendorProducts from "./pages/vendor/VendorProducts";

import PageLoader from "./components/PageLoader";
import ProtectedRoute from "./components/ProtectedRoute";
import { useUser } from "@clerk/clerk-react";

function App() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  if (!isLoaded) return <PageLoader />;

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
  const isEmailAdmin = user?.emailAddresses?.[0]?.emailAddress === adminEmail;
  const role = isEmailAdmin ? "admin" : (user?.publicMetadata?.role || "customer");

  const getHomeRoute = () => {
    if (role === "admin") return "dashboard";
    if (role === "vendor") return "vendor-dashboard";
    return "vendor-onboarding";
  };

  return (
    <Routes>
      <Route path="/login" element={isSignedIn ? <Navigate to={"/dashboard"} /> : <LoginPage />} />

      <Route path="/" element={isSignedIn ? <DashboardLayout /> : <Navigate to={"/login"} />}>
        <Route index element={<Navigate to={getHomeRoute()} />} />

        {/* Admin Only Routes */}
        <Route path="dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><DashboardPage /></ProtectedRoute>} />
        <Route path="products" element={<ProtectedRoute allowedRoles={["admin"]}><ProductsPage /></ProtectedRoute>} />
        <Route path="orders" element={<ProtectedRoute allowedRoles={["admin"]}><OrdersPage /></ProtectedRoute>} />
        <Route path="customers" element={<ProtectedRoute allowedRoles={["admin"]}><CustomersPage /></ProtectedRoute>} />
        <Route path="vendors" element={<ProtectedRoute allowedRoles={["admin"]}><VendorManagement /></ProtectedRoute>} />
        <Route path="global-settings" element={<ProtectedRoute allowedRoles={["admin"]}><GlobalSettings /></ProtectedRoute>} />
        <Route path="mobile-app" element={<ProtectedRoute allowedRoles={["admin"]}><SettingsPage /></ProtectedRoute>} />

        {/* Vendor Only Routes */}
        <Route path="vendor-dashboard" element={<ProtectedRoute allowedRoles={["vendor", "admin"]}><VendorDashboard /></ProtectedRoute>} />
        <Route path="vendor-products" element={<ProtectedRoute allowedRoles={["vendor", "admin"]}><VendorProducts /></ProtectedRoute>} />

        {/* Customer / Onboarding Routes */}
        <Route path="vendor-onboarding" element={<ProtectedRoute allowedRoles={["customer", "admin"]}><VendorOnboarding /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

export default App;
