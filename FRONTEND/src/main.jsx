import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ReactLenis } from 'lenis/react';

// Contexts
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

// Styles
import './styles/global.scss';

// Layouts
import { AppLayout, DashboardLayout } from './layouts/Layouts.jsx';

// Pages
import SplashScreen from './components/SplashScreen/SplashScreen.jsx';
import Auth from './pages/Auth.jsx';
import BuyerHome from './pages/Buyer/BuyerHome.jsx';
import SellerDashboard from './pages/Seller/Dashboard.jsx';
import AddProduct from './pages/Seller/AddProduct.jsx';
import Inventory from './pages/Seller/Inventory.jsx';

// Route Guards
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'seller' ? '/seller' : '/buyer'} />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === 'seller' ? '/seller' : '/buyer'} />;
  return children;
};

function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onDone={() => setShowSplash(false)} />;
  }

  return (
    <ReactLenis root>
      <Routes>
        {/* Public Routes */}
        <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />

        {/* Buyer Routes (App Layout) */}
        <Route path="/" element={<ProtectedRoute allowedRoles={['buyer']}><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/buyer" />} />
          <Route path="buyer" element={<BuyerHome />} />
          <Route path="search" element={<div className="page-enter"><h2>Search Results</h2></div>} />
          <Route path="profile" element={<div className="page-enter"><h2>Profile</h2></div>} />
        </Route>

        {/* Seller Routes (Dashboard Layout) */}
        <Route path="/seller" element={<ProtectedRoute allowedRoles={['seller']}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<SellerDashboard />} />
          <Route path="add" element={<AddProduct />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="requests" element={<div className="page-enter"><h2>Pickup Requests</h2></div>} />
          <Route path="analytics" element={<div className="page-enter"><h2>Analytics</h2></div>} />
        </Route>

        {/* Catch All */}
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    </ReactLenis>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>
);
