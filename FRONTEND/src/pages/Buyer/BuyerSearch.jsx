import React, { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, MapPin, Star, Clock, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import styles from './BuyerSearch.module.scss';

// Dummy results for the search page
const SEARCH_RESULTS = [
  { id: 101, name: 'AirPods Pro (2nd Gen)', shop: 'iStore Hub', dist: '0.4 km', price: '₹22,900', rating: 4.9 },
  { id: 102, name: 'Organic Almonds 1kg', shop: 'Nature Fresh', dist: '1.5 km', price: '₹950', rating: 4.7 },
  { id: 103, name: 'Logitech C920 Webcam', shop: 'TechZone', dist: '1.2 km', price: '₹7,495', rating: 4.5 },
  { id: 104, name: 'Yoga Block Set', shop: 'FitGear', dist: '2.1 km', price: '₹450', rating: 4.8 },
  { id: 105, name: 'AeroPress Coffee Maker', shop: 'Brew Bros', dist: '0.5 km', price: '₹3,499', rating: 4.9 },
  { id: 106, name: 'Scented Candle - Lavender', shop: 'Lumina Home', dist: '0.8 km', price: '₹599', rating: 4.6 },
  { id: 107, name: 'Duffle Bag', shop: 'Urban Trends', dist: '1.9 km', price: '₹1,299', rating: 4.4 },
  { id: 108, name: 'Smart LED Bulb', shop: 'TechZone', dist: '1.2 km', price: '₹899', rating: 4.3 },
];

export default function BuyerSearch() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.stagger-item', 
        { opacity: 0, y: 15 }, 
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const filters = ['All', 'Nearby', 'Highly Rated', 'Tech', 'Groceries', 'Fitness'];

  return (
    <div className={styles.searchPage} ref={containerRef}>
      
      {/* Search Header */}
      <div className={`${styles.searchHeader} stagger-item`}>
        <h1>Discover Local</h1>
        
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} size={20} />
          <input 
            type="text" 
            placeholder="Search products, shops, or categories..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button className={styles.filterBtn}>
            <SlidersHorizontal size={20} />
          </button>
        </div>

        {/* Quick Filters */}
        <div className={styles.quickFilters}>
          {filters.map(filter => (
            <button 
              key={filter} 
              className={`${styles.chip} ${activeFilter === filter ? styles.active : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter === 'Nearby' && <MapPin size={14} />}
              {filter === 'Highly Rated' && <Star size={14} />}
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Results Grid */}
      <div className={`${styles.resultsSection} stagger-item`}>
        <h2>{query ? `Results for "${query}"` : 'Recommended For You'}</h2>
        
        <div className={styles.grid}>
          {SEARCH_RESULTS.map((product) => (
            <div 
              key={product.id} 
              className={styles.productCard}
              onClick={() => navigate(`/shop/${product.id}`)}
            >
              <div className={styles.imagePlaceholder}>
                <ImageIcon size={32} />
              </div>
              <div className={styles.info}>
                <h3>{product.name}</h3>
                <span className={styles.shop}>{product.shop}</span>
              </div>
              <div className={styles.footer}>
                <span className={styles.price}>{product.price}</span>
                <span className={styles.dist}>
                  <MapPin size={12} />
                  {product.dist}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
