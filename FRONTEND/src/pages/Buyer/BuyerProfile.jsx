import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Package, Clock, Heart, Settings, ChevronRight, Edit2, LogOut, MapPin, CreditCard, Bell } from 'lucide-react';
import gsap from 'gsap';
import styles from './BuyerProfile.module.scss';

export default function BuyerProfile() {
  const { user, logout } = useAuth();
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.stagger-item', 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const stats = [
    { label: 'Active Requests', value: '2', icon: Clock },
    { label: 'Completed Pickups', value: '14', icon: Package },
    { label: 'Saved Shops', value: '5', icon: Heart },
  ];

  const recentActivity = [
    { id: 1, title: 'Sony WH-1000XM4', shop: 'TechZone', date: 'Today, 2:30 PM', status: 'pending' },
    { id: 2, title: 'Yoga Mat', shop: 'FitGear', date: 'Yesterday', status: 'completed' },
    { id: 3, title: 'Coffee Beans', shop: 'Brew Bros', date: 'Oct 12', status: 'completed' },
  ];

  const settingsLinks = [
    { icon: MapPin, label: 'Saved Addresses' },
    { icon: CreditCard, label: 'Payment Methods' },
    { icon: Bell, label: 'Notifications' },
    { icon: Settings, label: 'Account Settings' },
  ];

  return (
    <div className={styles.profile} ref={containerRef}>
      
      {/* Header */}
      <div className={`${styles.header} stagger-item`}>
        <div className={styles.avatar}>
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div className={styles.info}>
          <h1>{user?.name || 'Guest User'}</h1>
          <p>{user?.email || 'user@example.com'}</p>
        </div>
        <button className={styles.editBtn}>
          <Edit2 size={18} />
        </button>
      </div>

      {/* Stats Grid */}
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

      {/* Recent Activity */}
      <div className={`${styles.section} stagger-item`}>
        <div className={styles.sectionHeader}>
          <h2>Recent Activity</h2>
          <a href="#" className={styles.viewAll}>View All</a>
        </div>
        <div className={styles.activityList}>
          {recentActivity.map(activity => (
            <div key={activity.id} className={styles.activityItem}>
              <div className={styles.left}>
                <div className={styles.icon}>
                  <Package size={20} />
                </div>
                <div className={styles.details}>
                  <h4>{activity.title}</h4>
                  <p>{activity.shop} • {activity.date}</p>
                </div>
              </div>
              <div className={styles.right}>
                <span className={`${styles.status} ${styles[activity.status]}`}>
                  {activity.status === 'completed' ? 'Completed' : 'Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className={`${styles.section} stagger-item`}>
        <div className={styles.sectionHeader}>
          <h2>Preferences</h2>
        </div>
        <div className={styles.settingsList}>
          {settingsLinks.map((link, idx) => (
            <div key={idx} className={styles.settingItem}>
              <div className={styles.left}>
                <link.icon size={20} />
                <span>{link.label}</span>
              </div>
              <div className={styles.right}>
                <ChevronRight size={20} />
              </div>
            </div>
          ))}
          <div className={styles.settingItem} onClick={logout} style={{ color: '#e74c3c' }}>
             <div className={styles.left} style={{ color: '#e74c3c' }}>
                <LogOut size={20} />
                <span>Log Out</span>
             </div>
          </div>
        </div>
      </div>

    </div>
  );
}
