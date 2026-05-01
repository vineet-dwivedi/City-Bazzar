import { useEffect, useMemo, useState } from 'react';
import { MapPin, SlidersHorizontal, Map as MapIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import styles from './BuyerHome.module.scss';
import { APP_ROUTES } from '../../lib/routes.js';
import { discoveryApi } from '../../lib/api.js';
import { useUserLocation } from '../../hooks/useUserLocation.js';
import {
  formatCategory,
  formatCurrency,
  formatDistance,
  getStockClassName,
  getStockLabel,
} from '../../lib/format.js';

const buildFeaturedInventory = async (location) => {
  const response = await discoveryApi.listShops(location);
  const shops = response.shops || [];
  const details = await Promise.all(
    shops.slice(0, 6).map((shop) => discoveryApi.getShop(shop.id).catch(() => null))
  );
  const shopDistanceMap = new Map(shops.map((shop) => [shop.id, shop.distanceKm || 0]));

  return {
    shops,
    items: details
      .filter(Boolean)
      .flatMap((shop) =>
        (shop.inventory || [])
          .filter((item) => item.product)
          .map((item) => ({
            id: `${shop.id}-${item.productId}`,
            shopId: shop.id,
            shopName: shop.name,
            distanceKm: shopDistanceMap.get(shop.id) || 0,
            price: item.price,
            quantity: item.quantity,
            stockStatus: item.stockStatus,
            product: item.product,
          }))
      )
      .sort((left, right) => {
        if (left.stockStatus !== right.stockStatus) {
          return left.stockStatus === 'in_stock' ? -1 : 1;
        }

        return left.distanceKm - right.distanceKm;
      }),
  };
};

export default function BuyerHome() {
  const [activeCat, setActiveCat] = useState('All');
  const [items, setItems] = useState([]);
  const [shopCount, setShopCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { location } = useUserLocation();

  useEffect(() => {
    let active = true;

    const loadNearbyInventory = async () => {
      setLoading(true);
      setError('');

      try {
        const result = await buildFeaturedInventory(location);

        if (!active) {
          return;
        }

        setItems(result.items);
        setShopCount(result.shops.length);
      } catch (requestError) {
        if (active) {
          setError(requestError.message || 'We could not load nearby products.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadNearbyInventory();

    return () => {
      active = false;
    };
  }, [location]);

  const categories = useMemo(() => (
    ['All', ...new Set(items.map((item) => formatCategory(item.product.category)))]
  ), [items]);

  const visibleItems = useMemo(() => (
    activeCat === 'All'
      ? items
      : items.filter((item) => formatCategory(item.product.category) === activeCat)
  ), [activeCat, items]);

  return (
    <div className={`${styles.page} page-enter`}>
      <div className={styles.catScroll}>
        <div className={styles.catRow}>
          {categories.map((category) => (
            <button
              key={category}
              className={`${styles.catPill} ${activeCat === category ? styles.active : ''}`}
              onClick={() => setActiveCat(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Trending Nearby</h2>
          <p className={styles.sectionSub}>
            {shopCount} shops around {location.label}
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="outline" size="sm" icon={<MapIcon size={14} />} disabled>Map View</Button>
          <Button variant="outline" size="sm" icon={<SlidersHorizontal size={14} />} disabled>Filters</Button>
        </div>
      </div>

      {loading && <p className="text-muted">Loading nearby inventory...</p>}
      {error && <p className="text-error">{error}</p>}
      {!loading && !error && visibleItems.length === 0 && (
        <p className="text-muted">No products are available around this demo location yet.</p>
      )}

      <div className={styles.grid}>
        {visibleItems.map((item) => (
          <Card
            key={item.id}
            hover
            padding="12px"
            className={styles.productCard}
            onClick={() => navigate(APP_ROUTES.shopDetail(item.shopId))}
          >
            <div className={styles.imgWrap}>
              <div className={styles.placeholderImg} />
              <div className={styles.distBadge}><MapPin size={10} /> {formatDistance(item.distanceKm)}</div>
            </div>
            <div className={styles.pInfo}>
              <h3 className={styles.pName}>{item.product.name}</h3>
              <p className={styles.pShop}>{item.shopName}</p>
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
                onClick={(event) => {
                  event.stopPropagation();
                  navigate(APP_ROUTES.shopDetail(item.shopId));
                }}
              >
                Request Pickup
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
