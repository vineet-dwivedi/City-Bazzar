import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import { ownerApi } from '../../lib/api.js';
import { APP_ROUTES } from '../../lib/routes.js';

export default function SellerAnalytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shopMissing, setShopMissing] = useState(false);

  useEffect(() => {
    let active = true;

    const loadAnalytics = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await ownerApi.getAnalytics();

        if (active) {
          setAnalytics(response);
          setShopMissing(false);
        }
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (requestError.status === 404) {
          setShopMissing(true);
        } else {
          setError(requestError.message || 'Analytics could not be loaded.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      active = false;
    };
  }, []);

  const metrics = useMemo(() => analytics ? [
    { label: 'Profile views', value: analytics.views },
    { label: 'Product clicks', value: analytics.clicks },
    { label: 'Search hits', value: analytics.searchHits },
    { label: 'Inventory items', value: analytics.inventoryCount },
    { label: 'Pickup requests', value: analytics.pickupIntentCount },
  ] : [], [analytics]);

  return (
    <div className="page-enter" style={{ display: 'grid', gap: '20px' }}>
      <div>
        <h1>Analytics</h1>
        <p className="text-muted">These numbers come directly from your backend owner analytics route.</p>
      </div>

      {loading && <p className="text-muted">Loading analytics...</p>}
      {error && <p className="text-error">{error}</p>}

      {shopMissing && !loading && (
        <Card>
          <div style={{ display: 'grid', gap: '12px' }}>
            <h3>Create your shop profile first</h3>
            <p className="text-muted">Analytics unlock after the seller shop is registered.</p>
            <div>
              <Button onClick={() => navigate(APP_ROUTES.sellerSettings)}>Open Seller Settings</Button>
            </div>
          </div>
        </Card>
      )}

      {!shopMissing && !loading && (
        <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {metrics.map((metric) => (
            <Card key={metric.label}>
              <p className="text-muted">{metric.label}</p>
              <h2 style={{ marginTop: '8px' }}>{metric.value}</h2>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
