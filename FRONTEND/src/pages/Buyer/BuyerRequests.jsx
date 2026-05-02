import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button/Button';
import Card from '../../components/ui/Card/Card';
import { pickupApi } from '../../lib/api.js';
import { formatDateTime, formatPickupStatus } from '../../lib/format.js';
import { APP_ROUTES } from '../../lib/routes.js';

export default function BuyerRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadRequests = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await pickupApi.listMine();

        if (active) {
          setRequests(response.pickupIntents || []);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message || 'Pickup requests could not be loaded.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadRequests();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="page-enter" style={{ display: 'grid', gap: '20px' }}>
      <div>
        <h1>Pickup Requests</h1>
        <p className="text-muted">These reservations now come from your live backend pickup history endpoint.</p>
      </div>

      {loading && <p className="text-muted">Loading pickup requests...</p>}
      {error && <p className="text-error">{error}</p>}

      {!loading && !error && requests.length === 0 && (
        <Card>
          <p className="text-muted">No pickup requests yet. Reserve something from a nearby shop to see it here.</p>
        </Card>
      )}

      {requests.map((request) => (
        <Card key={request.id}>
          <div style={{ display: 'grid', gap: '8px' }}>
            <h3>{request.product?.name || 'Product unavailable'}</h3>
            <p>{request.shop?.name || request.shopId}</p>
            <p className="text-sm text-muted">Requested on {formatDateTime(request.createdAt)}</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <span className="badge badge--primary">{formatPickupStatus(request.status)}</span>
              <span className="badge badge--neutral">Qty {request.quantityRequested}</span>
            </div>
          </div>
        </Card>
      ))}

      <Button onClick={() => navigate(APP_ROUTES.buyerSearch)}>Find More Products</Button>
    </div>
  );
}
