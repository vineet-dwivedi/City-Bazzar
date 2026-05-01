// Desktop sidebar + mobile bottom nav for Seller / Buyer
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ClipboardList, BarChart2,
  Settings, PlusCircle, Home, Search, User, X, Menu
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.scss';
import { APP_ROUTES } from '../../lib/routes.js';

const SELLER_NAV = [
  { to: APP_ROUTES.sellerHome,        icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: APP_ROUTES.sellerAddProduct,  icon: <PlusCircle size={18} />,      label: 'Add Product' },
  { to: APP_ROUTES.sellerInventory,   icon: <Package size={18} />,         label: 'Inventory' },
  { to: APP_ROUTES.sellerRequests,    icon: <ClipboardList size={18} />,   label: 'Requests' },
  { to: APP_ROUTES.sellerAnalytics,   icon: <BarChart2 size={18} />,       label: 'Analytics' },
  { to: APP_ROUTES.sellerSettings,    icon: <Settings size={18} />,        label: 'Settings' },
];

const BUYER_BOTTOM = [
  { to: APP_ROUTES.buyerHome,     icon: <Home size={20} />,   label: 'Home' },
  { to: APP_ROUTES.buyerSearch,   icon: <Search size={20} />, label: 'Search' },
  { to: APP_ROUTES.buyerRequests, icon: <ClipboardList size={20}/>, label: 'Requests' },
  { to: APP_ROUTES.buyerProfile,  icon: <User size={20} />,   label: 'Profile' },
];

export function SellerSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>URBNBZR</div>
        <div className={styles.sidebarMeta}>
          <div className={styles.sidebarAvatar}>{user?.name?.[0] || 'S'}</div>
          <div>
            <p className={styles.sidebarName}>{user?.name || 'Seller'}</p>
            <p className={styles.sidebarRole}>Seller Account</p>
          </div>
        </div>
        <nav className={styles.sidebarNav}>
          {SELLER_NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to} to={to} end={to === APP_ROUTES.sellerHome}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              {icon}<span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile hamburger */}
      <button className={styles.hamburger} onClick={() => setMobileOpen(true)}>
        <Menu size={22} />
      </button>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div className={styles.drawerBackdrop}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)} />
            <motion.div className={styles.drawer}
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              <div className={styles.drawerHeader}>
                <span className={styles.sidebarLogo}>URBNBZR</span>
                <button onClick={() => setMobileOpen(false)}><X size={20} /></button>
              </div>
              <nav className={styles.sidebarNav}>
                {SELLER_NAV.map(({ to, icon, label }) => (
                  <NavLink key={to} to={to} end={to === APP_ROUTES.sellerHome}
                    className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                    onClick={() => setMobileOpen(false)}>
                    {icon}<span>{label}</span>
                  </NavLink>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function BuyerBottomNav() {
  return (
    <nav className={styles.bottomNav}>
      {BUYER_BOTTOM.map(({ to, icon, label }) => (
        <NavLink key={to} to={to} end={to === APP_ROUTES.buyerHome}
          className={({ isActive }) => `${styles.bottomItem} ${isActive ? styles.active : ''}`}>
          {icon}
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
