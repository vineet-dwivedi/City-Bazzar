import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button/Button';
import Card from '../../components/ui/Card/Card';
import { getPickupHistory } from '../../lib/pickup-history.js';
import { formatDateTime, formatPickupStatus } from '../../lib/format.js';
import { APP_ROUTES } from '../../lib/routes.js';

export default function BuyerRequests() {
  const navigate = useNavigate();
  const requests = useMemo(() => getPickupHistory(), []);

  return (
    <div className="page-enter" style={{ display: 'grid', gap: '20px' }}>
      <div>
        <h1>Pickup Requests</h1>
        <p className="text-muted">These are the reservations you created from the live backend pickup flow.</p>
      </div>

      {requests.length === 0 && (
        <Card>
          <p className="text-muted">No pickup requests yet. Reserve something from a nearby shop to see it here.</p>
        </Card>
      )}

      {requests.map((request) => (
        <Card key={request.id}>
          <div style={{ display: 'grid', gap: '8px' }}>
            <h3>{request.productName}</h3>
            <p>{request.shopName}</p>
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
