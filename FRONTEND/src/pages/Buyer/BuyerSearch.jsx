import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, Package } from 'lucide-react';
import gsap from 'gsap';
import styles from './BuyerSearch.module.scss';
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

const PAGE_SIZE = 8;

const paginateItems = (items, page) => {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;

  return {
    items: items.slice(start, start + PAGE_SIZE),
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      totalItems,
      totalPages,
    },
  };
};

const buildFallbackInventory = async (location) => {
  const response = await discoveryApi.listShops(location);
  const shops = response.shops || [];
  const details = await Promise.all(
    shops.slice(0, 6).map((shop) => discoveryApi.getShop(shop.id).catch(() => null))
  );
  const shopDistanceMap = new Map(shops.map((shop) => [shop.id, shop.distanceKm || 0]));

  return details
    .filter(Boolean)
    .flatMap((shop) =>
      (shop.inventory || [])
        .filter((item) => item.product)
        .map((item) => ({
          id: `${shop.id}-${item.productId}`,
          productId: item.productId,
          shopId: shop.id,
          name: item.product.name,
          category: item.product.category,
          shop: shop.name,
          dist: shopDistanceMap.get(shop.id) || 0,
          price: item.price,
          quantity: item.quantity,
          stockStatus: item.stockStatus,
        }))
    )
    .sort((left, right) => left.dist - right.dist);
};

const buildSearchCards = (response) => (
  (response.results || []).map((result) => {
    const nearestShop = result.nearbyShops[0];

    return {
      id: `${result.product.id}-${nearestShop.shopId}`,
      productId: result.product.id,
      shopId: nearestShop.shopId,
      name: result.product.name,
      category: result.product.category,
      shop: nearestShop.shopName,
      dist: nearestShop.distanceKm,
      price: nearestShop.price,
      quantity: nearestShop.quantity,
      stockStatus: nearestShop.stockStatus,
    };
  })
);

export default function BuyerSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeFilter, setActiveFilter] = useState('All');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { location } = useUserLocation();
  const currentQuery = searchParams.get('q') || '';
  const currentPage = Math.max(1, Number(searchParams.get('page') || 1));
  const [pagination, setPagination] = useState({
    page: currentPage,
    pageSize: PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
  });

  useEffect(() => {
    setQuery(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.stagger-item',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    let active = true;

    const loadResults = async () => {
      setLoading(true);
      setError('');

      try {
        const trimmedQuery = currentQuery.trim();
        const searchResponse = trimmedQuery
          ? await discoveryApi.searchProducts({
              query: trimmedQuery,
              lat: location.lat,
              lng: location.lng,
              radiusKm: location.radiusKm,
              page: currentPage,
              pageSize: PAGE_SIZE,
            })
          : null;
        const fallbackResponse = !trimmedQuery
          ? paginateItems(await buildFallbackInventory(location), currentPage)
          : null;
        const nextResults = trimmedQuery
          ? buildSearchCards(searchResponse)
          : fallbackResponse.items;
        const nextPagination = trimmedQuery
          ? searchResponse.pagination
          : fallbackResponse.pagination;

        if (active) {
          setResults(nextResults);
          setPagination(nextPagination);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message || 'Search could not be completed.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    const debounceHandle = window.setTimeout(loadResults, currentQuery ? 250 : 0);

    return () => {
      active = false;
      window.clearTimeout(debounceHandle);
    };
  }, [currentPage, currentQuery, location]);

  const filters = useMemo(() => (
    ['All', 'Nearby', 'In Stock', ...new Set(results.map((item) => formatCategory(item.category)))]
  ), [results]);

  const filteredResults = useMemo(() => (
    results.filter((item) => {
      if (activeFilter === 'All' || activeFilter === 'Nearby') {
        return true;
      }

      if (activeFilter === 'In Stock') {
        return item.stockStatus === 'in_stock';
      }

      return formatCategory(item.category) === activeFilter;
    })
  ), [activeFilter, results]);

  const updateParams = (nextQuery, nextPage = 1) => {
    setQuery(nextQuery);
    const nextParams = new URLSearchParams(searchParams);

    if (nextQuery.trim()) {
      nextParams.set('q', nextQuery);
    } else {
      nextParams.delete('q');
    }

    if (nextPage > 1) {
      nextParams.set('page', String(nextPage));
    } else {
      nextParams.delete('page');
    }

    setSearchParams(nextParams, { replace: true });
  };

  const setPage = (nextPage) => updateParams(query, nextPage);

  return (
    <div className={styles.searchPage} ref={containerRef}>
      <div className={`${styles.searchHeader} stagger-item`}>
        <h1>Discover Local</h1>

        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Search products, shops, or categories..."
            value={query}
            onChange={(event) => updateParams(event.target.value, 1)}
            autoFocus
          />
          <button className={styles.filterBtn} type="button" onClick={() => setActiveFilter('All')}>
            <SlidersHorizontal size={20} />
          </button>
        </div>

        <div className={styles.quickFilters}>
          {filters.map((filter) => (
            <button
              key={filter}
              className={`${styles.chip} ${activeFilter === filter ? styles.active : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter === 'Nearby' && <MapPin size={14} />}
              {filter === 'In Stock' && <Package size={14} />}
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className={`${styles.resultsSection} stagger-item`}>
        <h2>{currentQuery ? `Results for "${currentQuery}"` : 'Recommended For You'}</h2>

        {loading && <p className="text-muted">Searching nearby shops...</p>}
        {error && <p className="text-error">{error}</p>}
        {!loading && !error && filteredResults.length === 0 && (
          <p className="text-muted">No matching products were found around {location.label}.</p>
        )}

        <div className={styles.grid}>
          {filteredResults.map((product) => (
            <div
              key={product.id}
              className={styles.productCard}
              onClick={() => navigate(APP_ROUTES.shopDetail(product.shopId))}
            >
              <div className={styles.imagePlaceholder}>
                <Package size={32} />
              </div>
              <div className={styles.info}>
                <h3>{product.name}</h3>
                <span className={styles.shop}>{product.shop}</span>
                <span className={`stock-pill ${getStockClassName(product.stockStatus)}`}>
                  {getStockLabel(product.stockStatus, product.quantity)}
                </span>
              </div>
              <div className={styles.footer}>
                <span className={styles.price}>{formatCurrency(product.price)}</span>
                <span className={styles.dist}>
                  <MapPin size={12} />
                  {formatDistance(product.dist)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {!loading && !error && pagination.totalPages > 1 && (
          <div className={styles.pagination}>
            <button type="button" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>
              Previous
            </button>
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <button type="button" disabled={currentPage >= pagination.totalPages} onClick={() => setPage(currentPage + 1)}>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
