import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import { SellerSidebar, BuyerBottomNav } from '../components/Sidebar/Sidebar';
import styles from './Layouts.module.scss';
import { useAuth } from '../context/AuthContext';
import { normalizeRole } from '../lib/routes.js';

export function DashboardLayout() {
  const { user } = useAuth();
  const isSeller = normalizeRole(user?.role) === 'seller';

  return (
    <div className={styles.layout}>
      {isSeller && <SellerSidebar />}
      <div className={styles.mainContent}>
        <Navbar />
        <main className={styles.pageWrap}>
          <Outlet />
        </main>
        {!isSeller && <BuyerBottomNav />}
      </div>
    </div>
  );
}

export function AppLayout() {
  return (
    <div className={styles.layout}>
      <div className={styles.mainContent}>
        <Navbar />
        <main className={styles.pageWrap}>
          <Outlet />
        </main>
        <BuyerBottomNav />
      </div>
    </div>
  );
}
