import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Package, Eye, MousePointerClick, ClipboardList, TrendingUp } from 'lucide-react';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import styles from './Dashboard.module.scss';
import { useNavigate } from 'react-router-dom';
import { ownerApi } from '../../lib/api.js';
import { APP_ROUTES } from '../../lib/routes.js';
import { formatPickupStatus, getStockLabel } from '../../lib/format.js';

export default function SellerDashboard() {
  const containerRef = useRef();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shop, setShop] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [pickupIntents, setPickupIntents] = useState([]);
  const [shopMissing, setShopMissing] = useState(false);

  useEffect(() => {
    gsap.fromTo(
      '.stagger-card',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out', delay: 0.1 }
    );
  }, []);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError('');

      try {
        const shopResponse = await ownerApi.getShop();

        if (!active) {
          return;
        }

        setShop(shopResponse);
        setShopMissing(false);

        const [analyticsResponse, pickupResponse] = await Promise.all([
          ownerApi.getAnalytics(),
          ownerApi.getPickupIntents(),
        ]);

        if (!active) {
          return;
        }

        setAnalytics(analyticsResponse);
        setPickupIntents(pickupResponse.pickupIntents || []);
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (requestError.status === 404) {
          setShopMissing(true);
          setShop(null);
          setAnalytics(null);
          setPickupIntents([]);
        } else {
          setError(requestError.message || 'The seller dashboard could not be loaded.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const inventoryItems = shop?.inventory || [];
  const lowStockItems = inventoryItems.filter(
    (item) => item.stockStatus !== 'in_stock' || item.quantity <= 5
  );
  const recentActivity = pickupIntents.slice(0, 3);
  const kpis = [
    { label: 'Products', value: analytics?.inventoryCount ?? inventoryItems.length, icon: <Package size={20} /> },
    { label: 'Views', value: analytics?.views ?? 0, icon: <Eye size={20} /> },
    { label: 'Clicks', value: analytics?.clicks ?? 0, icon: <MousePointerClick size={20} /> },
    { label: 'Pickup Requests', value: analytics?.pickupIntentCount ?? pickupIntents.length, icon: <ClipboardList size={20} /> },
  ];

  return (
    <div className={`${styles.dashboard} page-enter`} ref={containerRef}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          {shop && <p className="text-muted">{shop.name}</p>}
        </div>
      </div>

      {loading && <p className="text-muted">Loading seller analytics...</p>}
      {error && <p className="text-error">{error}</p>}

      {shopMissing && !loading && (
        <Card className="stagger-card">
          <div style={{ display: 'grid', gap: '12px' }}>
            <h3>Create your shop profile first</h3>
            <p className="text-muted">Your backend owner routes need a real shop before inventory and analytics can load.</p>
            <div>
              <Button onClick={() => navigate(APP_ROUTES.sellerSettings)}>Open Seller Settings</Button>
            </div>
          </div>
        </Card>
      )}

      {!shopMissing && !loading && (
        <>
          <div className={styles.kpiGrid}>
            {kpis.map((kpi) => (
              <Card key={kpi.label} className={`stagger-card ${styles.kpiCard}`} hover>
                <div className={styles.kpiTop}>
                  <span className={styles.iconWrap}>{kpi.icon}</span>
                  <span className={styles.trend}><TrendingUp size={12} /> Live</span>
                </div>
                <h3 className={styles.kpiValue}>{kpi.value}</h3>
                <p className={styles.kpiLabel}>{kpi.label}</p>
              </Card>
            ))}
          </div>

          <div className={`stagger-card ${styles.quickActions}`}>
            <Button onClick={() => navigate(APP_ROUTES.sellerAddProduct)}>Add Product</Button>
            <Button variant="outline" onClick={() => navigate(APP_ROUTES.sellerInventory)}>View Inventory</Button>
            <Button variant="outline" onClick={() => navigate(APP_ROUTES.sellerRequests)}>Requests</Button>
          </div>

          <div className={styles.grid2}>
            <Card className={`stagger-card ${styles.section}`}>
              <h3 className={styles.sectionTitle}>Recent Activity</h3>
              <div className={styles.list}>
                {recentActivity.map((activity) => (
                  <div key={activity.id} className={styles.listItem}>
                    <div className={styles.dot} />
                    <p className={styles.listText}>
                      {activity.customerName} requested {activity.product?.name || 'a product'} - {formatPickupStatus(activity.status)}
                    </p>
                    <span className={styles.listTime}>{activity.quantityRequested} qty</span>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                  <p className="text-muted">New pickup requests will appear here once buyers start reserving products.</p>
                )}
              </div>
            </Card>

            <Card className={`stagger-card ${styles.section}`}>
              <h3 className={styles.sectionTitle}>Low Stock Alerts</h3>
              <div className={styles.list}>
                {lowStockItems.map((item) => (
                  <div key={item.id} className={styles.listItem}>
                    <p className={styles.listText}>{item.product?.name || item.productId}</p>
                    <span className={`stock-pill ${item.stockStatus === 'out_of_stock' ? 'out-stock' : 'low-stock'}`}>
                      {getStockLabel(item.stockStatus, item.quantity)}
                    </span>
                  </div>
                ))}
                {lowStockItems.length === 0 && (
                  <p className="text-muted">No low-stock items right now.</p>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
