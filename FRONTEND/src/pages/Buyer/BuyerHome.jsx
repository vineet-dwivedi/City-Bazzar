import { useState } from 'react';
import { MapPin, Star, Filter, SlidersHorizontal, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import styles from './BuyerHome.module.scss';

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Books', 'Groceries', 'Home', 'Sports'];

const TRENDING = [
  { id: 1, name: 'Sony WH-1000XM4', shop: 'TechZone', dist: '1.2 km', price: '₹24,990', stock: true },
  { id: 2, name: 'Minimalist Desk Lamp', shop: 'Lumina Home', dist: '0.8 km', price: '₹1,299', stock: true },
  { id: 3, name: 'Yoga Mat', shop: 'FitGear', dist: '2.1 km', price: '₹899', stock: false },
  { id: 4, name: 'Mechanical Keyboard', shop: 'TechZone', dist: '1.2 km', price: '₹6,499', stock: true },
];

export default function BuyerHome() {
  const [activeCat, setActiveCat] = useState('All');
  const navigate = useNavigate();

  return (
    <div className={`${styles.page} page-enter`}>
      <div className={styles.catScroll}>
        <div className={styles.catRow}>
          {CATEGORIES.map(c => (
            <button key={c} 
              className={`${styles.catPill} ${activeCat === c ? styles.active : ''}`}
              onClick={() => setActiveCat(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Trending Nearby</h2>
          <p className={styles.sectionSub}>12 shops within 2km</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="outline" size="sm" icon={<Map size={14}/>}>Map View</Button>
          <Button variant="outline" size="sm" icon={<SlidersHorizontal size={14}/>}>Filters</Button>
        </div>
      </div>

      <div className={styles.grid}>
        {TRENDING.map(item => (
          <Card key={item.id} hover padding="12px" className={styles.productCard} onClick={() => navigate('/shop/techzone')}>
            <div className={styles.imgWrap}>
              <div className={styles.placeholderImg}/>
              <div className={styles.distBadge}><MapPin size={10}/> {item.dist}</div>
            </div>
            <div className={styles.pInfo}>
              <h3 className={styles.pName}>{item.name}</h3>
              <p className={styles.pShop}>{item.shop}</p>
              <div className={styles.pMeta}>
                <span className={styles.price}>{item.price}</span>
                {item.stock ? (
                  <span className="stock-pill in-stock">In Stock</span>
                ) : (
                  <span className="stock-pill low-stock">Low Stock</span>
                )}
              </div>
              <Button fullWidth size="sm" className={styles.ctaBtn} 
                onClick={(e) => { e.stopPropagation(); navigate('/request-pickup'); }}>
                Request Pickup
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
