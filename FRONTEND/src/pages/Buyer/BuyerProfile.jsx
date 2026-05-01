import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Package, Clock, Heart, Settings, ChevronRight, Edit2, LogOut, MapPin, Bell } from 'lucide-react';
import gsap from 'gsap';
import styles from './BuyerProfile.module.scss';
import { getPickupHistory } from '../../lib/pickup-history.js';
import { formatDateTime, formatPickupStatus } from '../../lib/format.js';
import { APP_ROUTES } from '../../lib/routes.js';

export default function BuyerProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const pickupHistory = useMemo(() => getPickupHistory(), []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.stagger-item',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const stats = [
    { label: 'Active Requests', value: String(pickupHistory.filter((item) => item.status !== 'completed').length), icon: Clock },
    { label: 'Completed Pickups', value: String(pickupHistory.filter((item) => item.status === 'completed').length), icon: Package },
    { label: 'Saved Shops', value: String(new Set(pickupHistory.map((item) => item.shopName)).size), icon: Heart },
  ];

  const settingsLinks = [
    { icon: MapPin, label: 'Pickup Requests', action: () => navigate(APP_ROUTES.buyerRequests) },
    { icon: Bell, label: 'Search Nearby', action: () => navigate(APP_ROUTES.buyerSearch) },
    { icon: Settings, label: 'Account Settings', action: () => navigate(APP_ROUTES.buyerProfile) },
  ];

  return (
    <div className={styles.profile} ref={containerRef}>
      <div className={`${styles.header} stagger-item`}>
        <div className={styles.avatar}>
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div className={styles.info}>
          <h1>{user?.name || 'Guest User'}</h1>
          <p>{user?.email || 'No email on file'}</p>
        </div>
        <button className={styles.editBtn} onClick={() => navigate(APP_ROUTES.buyerRequests)}>
          <Edit2 size={18} />
        </button>
      </div>

      <div className={`${styles.statsGrid} stagger-item`}>
        {stats.map((stat, idx) => (
          <div key={idx} className={styles.statCard}>
            <div className={styles.iconWrapper}>
              <stat.icon size={24} />
            </div>
            <h3>{stat.value}</h3>
            <p>{stat.label}</p>
          </div>
        ))}
      </div>

      <div className={`${styles.section} stagger-item`}>
        <div className={styles.sectionHeader}>
          <h2>Recent Activity</h2>
          <button className={styles.viewAll} onClick={() => navigate(APP_ROUTES.buyerRequests)}>View All</button>
        </div>
        <div className={styles.activityList}>
          {pickupHistory.slice(0, 3).map((activity) => (
            <div key={activity.id} className={styles.activityItem}>
              <div className={styles.left}>
                <div className={styles.icon}>
                  <Package size={20} />
                </div>
                <div className={styles.details}>
                  <h4>{activity.productName}</h4>
                  <p>{activity.shopName} - {formatDateTime(activity.createdAt)}</p>
                </div>
              </div>
              <div className={styles.right}>
                <span className={`${styles.status} ${styles.pending}`}>
                  {formatPickupStatus(activity.status)}
                </span>
              </div>
            </div>
          ))}
          {pickupHistory.length === 0 && (
            <p className="text-muted">Your backend-powered reservations will appear here after the first pickup request.</p>
          )}
        </div>
      </div>

      <div className={`${styles.section} stagger-item`}>
        <div className={styles.sectionHeader}>
          <h2>Preferences</h2>
        </div>
        <div className={styles.settingsList}>
          {settingsLinks.map((link, idx) => (
            <button key={idx} className={styles.settingItem} onClick={link.action}>
              <div className={styles.left}>
                <link.icon size={20} />
                <span>{link.label}</span>
              </div>
              <div className={styles.right}>
                <ChevronRight size={20} />
              </div>
            </button>
          ))}
          <button className={styles.settingItem} onClick={logout} style={{ color: '#e74c3c' }}>
            <div className={styles.left} style={{ color: '#e74c3c' }}>
              <LogOut size={20} />
              <span>Log Out</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
