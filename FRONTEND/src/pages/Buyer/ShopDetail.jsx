import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, Clock, Phone, ChevronLeft, Map, CheckCircle } from 'lucide-react';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import styles from './ShopDetail.module.scss';
import { useState } from 'react';
import Modal from '../../components/ui/Modal/Modal';
import Input from '../../components/ui/Input/Input';

const SHOP_INVENTORY = [
  { id: 1, name: 'Sony WH-1000XM4', price: '₹24,990', stock: true },
  { id: 2, name: 'Apple AirPods Pro', price: '₹20,900', stock: true },
  { id: 3, name: 'Logitech MX Master 3S', price: '₹8,995', stock: false },
  { id: 4, name: 'Keychron K2 V2', price: '₹7,499', stock: true },
];

export default function ShopDetail() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [successMode, setSuccessMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const handleRequestPickup = (product) => {
    setSelectedProduct(product);
    setSuccessMode(false);
    setModalOpen(true);
  };

  const confirmPickup = () => {
    setSuccessMode(true);
    setTimeout(() => {
      setModalOpen(false);
    }, 2000);
  };

  return (
    <div className={`${styles.page} page-enter`}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        <ChevronLeft size={20} /> Back
      </button>

      {/* Shop Header */}
      <div className={styles.header}>
        <div className={styles.coverImg}>
          <div className={styles.shopAvatar}>T</div>
        </div>
        <div className={styles.info}>
          <h1 className={styles.shopName}>TechZone Electronics</h1>
          <div className={styles.meta}>
            <span className={styles.metaItem}><MapPin size={14}/> 1.2 km away • Andheri West</span>
            <span className={styles.metaItem}><Star size={14} className="text-warning"/> 4.8 (124 reviews)</span>
          </div>
          <div className={styles.meta2}>
            <span className={styles.metaItem}><Clock size={14}/> Open until 9:00 PM</span>
            <span className={styles.metaItem}><Phone size={14}/> +91 98765 43210</span>
          </div>
          <div className={styles.actions}>
            <Button variant="outline" size="sm" icon={<Map size={16}/>}>Get Directions</Button>
          </div>
        </div>
      </div>

      {/* Inventory */}
      <div className={styles.inventory}>
        <h2 className={styles.sectionTitle}>Available Products</h2>
        <div className={styles.grid}>
          {SHOP_INVENTORY.map(item => (
            <Card key={item.id} hover padding="12px" className={styles.productCard}>
              <div className={styles.imgWrap}>
                <div className={styles.placeholderImg}/>
              </div>
              <div className={styles.pInfo}>
                <h3 className={styles.pName}>{item.name}</h3>
                <div className={styles.pMeta}>
                  <span className={styles.price}>{item.price}</span>
                  {item.stock ? (
                    <span className="stock-pill in-stock">In Stock</span>
                  ) : (
                    <span className="stock-pill out-stock">Out of Stock</span>
                  )}
                </div>
                <Button fullWidth size="sm" className={styles.ctaBtn} 
                  disabled={!item.stock}
                  onClick={() => handleRequestPickup(item)}>
                  {item.stock ? 'Reserve for Pickup' : 'Join Waitlist'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Pickup Request Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={successMode ? '' : 'Confirm Pickup'}>
        {successMode ? (
          <div className={styles.successState}>
            <CheckCircle size={64} className="text-success" />
            <h2>Reservation Confirmed!</h2>
            <p>Your item has been reserved at TechZone Electronics. Please pick it up before 9:00 PM today.</p>
          </div>
        ) : (
          <div className={styles.requestFlow}>
            <div className={styles.reqProduct}>
              <div className={styles.reqImg} />
              <div>
                <p className={styles.reqName}>{selectedProduct?.name}</p>
                <p className={styles.reqPrice}>{selectedProduct?.price}</p>
              </div>
            </div>
            
            <div className={styles.reqForm}>
              <Input label="Your Name" placeholder="Priya Sharma" defaultValue="Priya" />
              <Input label="Phone Number" placeholder="+91" defaultValue="+91 98765 12345" />
              <div className={styles.etaSelector}>
                <label className={styles.label}>Estimated Pickup Time</label>
                <div className={styles.etaGrid}>
                  {['In 30 mins', '1 hour', '2 hours', 'Today evening'].map((time, i) => (
                    <button key={i} className={`${styles.etaBtn} ${i===0 ? styles.active : ''}`}>{time}</button>
                  ))}
                </div>
              </div>
            </div>

            <Button fullWidth size="lg" onClick={confirmPickup}>Confirm Reservation</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
