import { Navigate,Routes, Route } from "react-router"; 
import LoginPage from "./pages/LoginPage";
import { useAuth } from "@clerk/clerk-react";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import CustomersPage from "./pages/CustomersPage";
import DashboardLayout from "./layouts/DashboardLayout";

import PageLoader from "./components/PageLoader";


function App() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return <PageLoader />;

  return (
    <Routes>
      {/* 1. Add /* to login to allow Clerk's internal routing */}
      <Route 
        path="/login/*" 
        element={isSignedIn ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
      />

      {/* 2. Main Authenticated Wrapper */}
      <Route path="/" element={isSignedIn ? <DashboardLayout /> : <Navigate to="/login" replace />}>
        {/* Redirect root "/" to "/dashboard" */}
        <Route index element={<Navigate to="dashboard" replace />} />
        
        {/* These sub-routes will render inside the <Outlet /> of DashboardLayout */}
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="customers" element={<CustomersPage />} />
      </Route>

      {/* 3. Fallback for 404s */}
      <Route path="*" element={<Navigate to={isSignedIn ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}
export default App;