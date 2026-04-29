import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Package, Eye, MousePointerClick, ClipboardList, TrendingUp } from 'lucide-react';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import styles from './Dashboard.module.scss';
import { useNavigate } from 'react-router-dom';

const KPIS = [
  { label: 'Products', value: '124', icon: <Package size={20}/>, trend: '+12%' },
  { label: 'Views Today', value: '1,847', icon: <Eye size={20}/>, trend: '+4.5%' },
  { label: 'Clicks', value: '340', icon: <MousePointerClick size={20}/>, trend: '+2%' },
  { label: 'Pickup Requests', value: '12', icon: <ClipboardList size={20}/>, trend: '-1' },
];

const ACTIVITY = [
  { id: 1, text: 'New pickup request for Wireless Earbuds', time: '10 min ago' },
  { id: 2, text: 'Product Phone Stand approved by AI', time: '1 hr ago' },
  { id: 3, text: 'Inventory low: USB Hub (2 left)', time: '3 hrs ago' },
];

export default function SellerDashboard() {
  const containerRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    gsap.fromTo('.stagger-card', 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out', delay: 0.1 }
    );
  }, []);

  return (
    <div className={`${styles.dashboard} page-enter`} ref={containerRef}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
      </div>

      <div className={styles.kpiGrid}>
        {KPIS.map((kpi, i) => (
          <Card key={i} className={`stagger-card ${styles.kpiCard}`} hover>
            <div className={styles.kpiTop}>
              <span className={styles.iconWrap}>{kpi.icon}</span>
              <span className={`${styles.trend} ${kpi.trend.startsWith('+') ? 'text-success' : 'text-warning'}`}>
                <TrendingUp size={12}/> {kpi.trend}
              </span>
            </div>
            <h3 className={styles.kpiValue}>{kpi.value}</h3>
            <p className={styles.kpiLabel}>{kpi.label}</p>
          </Card>
        ))}
      </div>

      <div className={`stagger-card ${styles.quickActions}`}>
        <Button onClick={() => navigate('/seller/add')}>Add Product</Button>
        <Button variant="outline" onClick={() => navigate('/seller/inventory')}>View Inventory</Button>
        <Button variant="outline" onClick={() => navigate('/seller/requests')}>Requests</Button>
      </div>

      <div className={styles.grid2}>
        <Card className={`stagger-card ${styles.section}`}>
          <h3 className={styles.sectionTitle}>Recent Activity</h3>
          <div className={styles.list}>
            {ACTIVITY.map(act => (
              <div key={act.id} className={styles.listItem}>
                <div className={styles.dot}/>
                <p className={styles.listText}>{act.text}</p>
                <span className={styles.listTime}>{act.time}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className={`stagger-card ${styles.section}`}>
          <h3 className={styles.sectionTitle}>Low Stock Alerts</h3>
          <div className={styles.list}>
            <div className={styles.listItem}>
              <p className={styles.listText}>USB C Hub Anker</p>
              <span className="stock-pill low-stock">3 left</span>
            </div>
            <div className={styles.listItem}>
              <p className={styles.listText}>Mechanical Keyboard</p>
              <span className="stock-pill out-stock">0 left</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
