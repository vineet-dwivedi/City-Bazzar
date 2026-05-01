import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button/Button';
import Card from '../../components/ui/Card/Card';
import { ownerApi } from '../../lib/api.js';
import { APP_ROUTES } from '../../lib/routes.js';
import { formatDateTime, formatPickupStatus, formatCurrency } from '../../lib/format.js';

const NEXT_STATUS = {
  requested: 'acknowledged',
  acknowledged: 'ready_for_pickup',
  ready_for_pickup: 'completed',
};

export default function SellerRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shopMissing, setShopMissing] = useState(false);

  useEffect(() => {
    let active = true;

    const loadRequests = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await ownerApi.getPickupIntents();

        if (active) {
          setRequests(response.pickupIntents || []);
          setShopMissing(false);
        }
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (requestError.status === 404) {
          setShopMissing(true);
        } else {
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

  const updateStatus = async (requestId, status) => {
    try {
      const updated = await ownerApi.updatePickupIntent(requestId, status);
      setRequests((current) => current.map((request) => (
        request.id === requestId ? { ...request, ...updated } : request
      )));
    } catch (requestError) {
      setError(requestError.message || 'The request status could not be updated.');
    }
  };

  return (
    <div className="page-enter" style={{ display: 'grid', gap: '20px' }}>
      <div>
        <h1>Pickup Requests</h1>
        <p className="text-muted">Review and advance the live reservations buyers send through the backend.</p>
      </div>

      {loading && <p className="text-muted">Loading pickup requests...</p>}
      {error && <p className="text-error">{error}</p>}

      {shopMissing && !loading && (
        <Card>
          <div style={{ display: 'grid', gap: '12px' }}>
            <h3>Create your shop profile first</h3>
            <p className="text-muted">The backend cannot attach pickup requests until a seller shop exists.</p>
            <div>
              <Button onClick={() => navigate(APP_ROUTES.sellerSettings)}>Open Seller Settings</Button>
            </div>
          </div>
        </Card>
      )}

      {!shopMissing && !loading && requests.length === 0 && (
        <Card>
          <p className="text-muted">No pickup requests yet. Buyer reservations will appear here automatically.</p>
        </Card>
      )}

      {requests.map((request) => {
        const nextStatus = NEXT_STATUS[request.status];

        return (
          <Card key={request.id}>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <h3>{request.product?.name || 'Product unavailable'}</h3>
                <p>{request.customerName} - {request.customerPhone}</p>
                <p className="text-sm text-muted">Requested on {formatDateTime(request.createdAt)}</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <span className="badge badge--primary">{formatPickupStatus(request.status)}</span>
                <span className="badge badge--neutral">Qty {request.quantityRequested}</span>
                {request.product && <span className="badge badge--neutral">{formatCurrency(request.product.defaultMrp)} MRP</span>}
              </div>
              {request.note && <p className="text-sm text-muted">Buyer note: {request.note}</p>}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {nextStatus && (
                  <Button onClick={() => updateStatus(request.id, nextStatus)}>
                    Mark {formatPickupStatus(nextStatus)}
                  </Button>
                )}
                {!['completed', 'cancelled'].includes(request.status) && (
                  <Button variant="outline" onClick={() => updateStatus(request.id, 'cancelled')}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
