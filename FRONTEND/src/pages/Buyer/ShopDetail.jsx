import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Clock, Phone, ChevronLeft, Map, CheckCircle } from 'lucide-react';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import styles from './ShopDetail.module.scss';
import Modal from '../../components/ui/Modal/Modal';
import Input from '../../components/ui/Input/Input';
import { discoveryApi, pickupApi } from '../../lib/api.js';
import { formatCurrency, getStockClassName, getStockLabel } from '../../lib/format.js';
import { useAuth } from '../../context/AuthContext';
import { recordPickupHistory } from '../../lib/pickup-history.js';

export default function ShopDetail() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [successMode, setSuccessMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customerName: user?.fullName || user?.name || '',
    customerPhone: user?.phone || '',
    quantityRequested: 1,
    note: '',
  });
  const hasRecordedView = useRef(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setForm((current) => ({
      ...current,
      customerName: user?.fullName || user?.name || current.customerName,
      customerPhone: user?.phone || current.customerPhone,
    }));
  }, [user]);

  useEffect(() => {
    let active = true;

    const loadShop = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await discoveryApi.getShop(shopId);

        if (!active) {
          return;
        }

        setShop(response);

        if (!hasRecordedView.current) {
          hasRecordedView.current = true;
          discoveryApi.recordShopEvent(shopId, 'view').catch(() => null);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message || 'We could not load this shop.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadShop();

    return () => {
      active = false;
    };
  }, [shopId]);

  const handleRequestPickup = (product) => {
    setSelectedProduct(product);
    setSuccessMode(false);
    setError('');
    setForm((current) => ({ ...current, quantityRequested: 1, note: '' }));
    setModalOpen(true);
  };

  const confirmPickup = async () => {
    if (!selectedProduct) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await pickupApi.createIntent({
        shopId: shop.id,
        productId: selectedProduct.productId,
        customerUserId: user?.id,
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        quantityRequested: Number(form.quantityRequested) || 1,
        note: form.note.trim() || undefined,
      });

      recordPickupHistory({
        id: response.id,
        status: response.status,
        createdAt: response.createdAt,
        shopName: response.shop.name,
        productName: response.product.name,
        quantityRequested: response.quantityRequested,
      });
      discoveryApi.recordShopEvent(shop.id, 'click').catch(() => null);
      setSuccessMessage(`Your item is reserved at ${response.shop.name}.`);
      setSuccessMode(true);
      setTimeout(() => setModalOpen(false), 1800);
    } catch (requestError) {
      setError(requestError.message || 'Your pickup request could not be submitted.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`${styles.page} page-enter`}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        <ChevronLeft size={20} /> Back
      </button>

      {loading && <p className="text-muted">Loading shop details...</p>}
      {error && !modalOpen && <p className="text-error">{error}</p>}

      {shop && (
        <>
          <div className={styles.header}>
            <div className={styles.coverImg}>
              <div className={styles.shopAvatar}>{shop.name?.charAt(0) || 'S'}</div>
            </div>
            <div className={styles.info}>
              <h1 className={styles.shopName}>{shop.name}</h1>
              <div className={styles.meta}>
                <span className={styles.metaItem}><MapPin size={14} /> {shop.address}</span>
                <span className={styles.metaItem}>Views: {shop.analytics?.views ?? 0}</span>
              </div>
              <div className={styles.meta2}>
                <span className={styles.metaItem}><Clock size={14} /> Service radius {shop.serviceRadiusKm} km</span>
                <span className={styles.metaItem}><Phone size={14} /> {shop.phone}</span>
              </div>
              <div className={styles.actions}>
                <Button variant="outline" size="sm" icon={<Map size={16} />} disabled>Directions</Button>
              </div>
            </div>
          </div>

          <div className={styles.inventory}>
            <h2 className={styles.sectionTitle}>Available Products</h2>
            <div className={styles.grid}>
              {(shop.inventory || []).filter((item) => item.product).map((item) => (
                <Card key={item.id} hover padding="12px" className={styles.productCard}>
                  <div className={styles.imgWrap}>
                    <div className={styles.placeholderImg} />
                  </div>
                  <div className={styles.pInfo}>
                    <h3 className={styles.pName}>{item.product.name}</h3>
                    <div className={styles.pMeta}>
                      <span className={styles.price}>{formatCurrency(item.price)}</span>
                      <span className={`stock-pill ${getStockClassName(item.stockStatus)}`}>
                        {getStockLabel(item.stockStatus, item.quantity)}
                      </span>
                    </div>
                    <Button
                      fullWidth
                      size="sm"
                      className={styles.ctaBtn}
                      disabled={item.stockStatus === 'out_of_stock'}
                      onClick={() => handleRequestPickup(item)}
                    >
                      {item.stockStatus === 'out_of_stock' ? 'Out of Stock' : 'Reserve for Pickup'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={successMode ? '' : 'Confirm Pickup'}>
        {successMode ? (
          <div className={styles.successState}>
            <CheckCircle size={64} className="text-success" />
            <h2>Reservation Confirmed</h2>
            <p>{successMessage}</p>
          </div>
        ) : (
          <div className={styles.requestFlow}>
            <div className={styles.reqProduct}>
              <div className={styles.reqImg} />
              <div>
                <p className={styles.reqName}>{selectedProduct?.product?.name}</p>
                <p className={styles.reqPrice}>{formatCurrency(selectedProduct?.price || 0)}</p>
              </div>
            </div>

            <div className={styles.reqForm}>
              <Input
                label="Your Name"
                placeholder="Priya Sharma"
                value={form.customerName}
                onChange={(event) => setForm((current) => ({ ...current, customerName: event.target.value }))}
              />
              <Input
                label="Phone Number"
                placeholder="+91 98765 12345"
                value={form.customerPhone}
                onChange={(event) => setForm((current) => ({ ...current, customerPhone: event.target.value }))}
              />
              <Input
                label="Quantity"
                type="number"
                min="1"
                value={form.quantityRequested}
                onChange={(event) => setForm((current) => ({ ...current, quantityRequested: event.target.value }))}
              />
              <div className={styles.field}>
                <label className={styles.label}>Pickup Note</label>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  placeholder="Arriving in 30 minutes"
                  value={form.note}
                  onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                />
              </div>
              {error && <p className="text-error text-sm">{error}</p>}
            </div>

            <Button fullWidth size="lg" onClick={confirmPickup} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Confirm Reservation'}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
