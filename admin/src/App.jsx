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

function App() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return <PageLoader />;

  return (
    <Routes>
      <Route path="/login" element={isSignedIn ? <Navigate to={"/dashboard"} /> : <LoginPage />} />

      <Route path="/" element={isSignedIn ? <DashboardLayout /> : <Navigate to={"/login"} />}>
        <Route index element={<Navigate to={"dashboard"} />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="vendors" element={<VendorManagement />} />
        <Route path="global-settings" element={<GlobalSettings />} />
        <Route path="vendor-dashboard" element={<VendorDashboard />} />
        <Route path="vendor-products" element={<VendorProducts />} />
        <Route path="vendor-onboarding" element={<VendorOnboarding />} />
        <Route path="mobile-app" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
