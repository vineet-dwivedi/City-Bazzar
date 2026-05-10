import { StrictMode, Suspense, lazy, useState } from 'react';
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
import { APP_ROUTES, getHomePath, normalizeRole } from './lib/routes.js';

const SplashScreen = lazy(() => import('./components/SplashScreen/SplashScreen.jsx'));
const Auth = lazy(() => import('./pages/Auth.jsx'));
const BuyerHome = lazy(() => import('./pages/Buyer/BuyerHome.jsx'));
const BuyerSearch = lazy(() => import('./pages/Buyer/BuyerSearch.jsx'));
const BuyerProfile = lazy(() => import('./pages/Buyer/BuyerProfile.jsx'));
const BuyerRequests = lazy(() => import('./pages/Buyer/BuyerRequests.jsx'));
const ShopDetail = lazy(() => import('./pages/Buyer/ShopDetail.jsx'));
const SellerDashboard = lazy(() => import('./pages/Seller/Dashboard.jsx'));
const AddProduct = lazy(() => import('./pages/Seller/AddProduct.jsx'));
const SellerAiReview = lazy(() => import('./pages/Seller/AiReview.jsx'));
const SellerAnalytics = lazy(() => import('./pages/Seller/Analytics.jsx'));
const Inventory = lazy(() => import('./pages/Seller/Inventory.jsx'));
const SellerRequests = lazy(() => import('./pages/Seller/Requests.jsx'));
const SellerSettings = lazy(() => import('./pages/Seller/Settings.jsx'));

// Route Guards
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const normalizedRole = normalizeRole(user?.role);

  if (loading) {
    return <div className="page-enter" style={{ padding: '24px' }}>Loading your account...</div>;
  }

  if (!user || !normalizedRole || normalizedRole === 'admin') {
    return <Navigate to={APP_ROUTES.auth} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(normalizedRole)) {
    return <Navigate to={getHomePath(normalizedRole)} replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const normalizedRole = normalizeRole(user?.role);

  if (loading) {
    return <div className="page-enter" style={{ padding: '24px' }}>Checking your session...</div>;
  }

  if (user && normalizedRole && normalizedRole !== 'admin') {
    return <Navigate to={getHomePath(normalizedRole)} replace />;
  }

  return children;
};

const RootRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="page-enter" style={{ padding: '24px' }}>Loading...</div>;
  }

  return <Navigate to={getHomePath(user?.role)} replace />;
};

const PageFallback = () => (
  <div className="page-enter" style={{ padding: '24px' }}>
    Loading page...
  </div>
);

function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return (
      <Suspense fallback={<PageFallback />}>
        <SplashScreen onDone={() => setShowSplash(false)} />
      </Suspense>
    );
  }

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path={APP_ROUTES.auth} element={<PublicRoute><Auth /></PublicRoute>} />
          <Route path="/" element={<RootRoute />} />

          {/* Buyer Routes (App Layout) */}
          <Route element={<ProtectedRoute allowedRoles={['buyer']}><AppLayout /></ProtectedRoute>}>
            <Route path={APP_ROUTES.buyerHome} element={<BuyerHome />} />
            <Route path={APP_ROUTES.buyerSearch} element={<BuyerSearch />} />
            <Route path="/shop/:shopId" element={<ShopDetail />} />
            <Route path={APP_ROUTES.buyerProfile} element={<BuyerProfile />} />
            <Route path={APP_ROUTES.buyerRequests} element={<BuyerRequests />} />
          </Route>

          {/* Seller Routes (Dashboard Layout) */}
          <Route path={APP_ROUTES.sellerHome} element={<ProtectedRoute allowedRoles={['seller']}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<SellerDashboard />} />
            <Route path="add" element={<AddProduct />} />
            <Route path="ai-review" element={<SellerAiReview />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="requests" element={<SellerRequests />} />
            <Route path="analytics" element={<SellerAnalytics />} />
            <Route path="settings" element={<SellerSettings />} />
          </Route>

          {/* Catch All */}
          <Route path="*" element={<Navigate to={APP_ROUTES.auth} replace />} />
        </Routes>
      </Suspense>
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
