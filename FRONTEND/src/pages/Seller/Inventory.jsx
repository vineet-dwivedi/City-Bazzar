import { useState } from 'react';
import { Search, Edit2, Trash2, Download } from 'lucide-react';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import styles from './Inventory.module.scss';

const DATA = [
  { id: 1, name: 'Sony WH-1000XM4', cat: 'Electronics', price: '24,990', stock: 45, status: 'in-stock', views: 342 },
  { id: 2, name: 'Minimalist Desk Lamp', cat: 'Home', price: '1,299', stock: 3, status: 'low-stock', views: 89 },
  { id: 3, name: 'USB-C Hub Anker', cat: 'Accessories', price: '3,499', stock: 0, status: 'out-stock', views: 120 },
];

export default function Inventory() {
  const [filter, setFilter] = useState('All');

  return (
    <div className={`${styles.page} page-enter`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Inventory Management</h1>
        <Button variant="outline" icon={<Download size={16}/>}>Export CSV</Button>
      </div>

      <div className={styles.controls}>
        <div className={styles.search}>
          <Search size={16} className={styles.searchIcon}/>
          <input type="text" placeholder="Search products..." className={styles.searchInput}/>
        </div>
        <div className={styles.filters}>
          {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map(f => (
            <button key={f} 
              className={`${styles.filterChip} ${filter === f ? styles.active : ''}`}
              onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <Card padding="0" className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price (₹)</th>
                <th>Stock</th>
                <th>Views</th>
                <th className={styles.right}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {DATA.map(item => (
                <tr key={item.id}>
                  <td className={styles.tdName}>
                    <div className={styles.imgThumb}/>
                    <span className={styles.nameText}>{item.name}</span>
                  </td>
                  <td>{item.cat}</td>
                  <td>{item.price}</td>
                  <td>
                    <span className={`stock-pill ${item.status}`}>
                      {item.stock} left
                    </span>
                  </td>
                  <td>{item.views}</td>
                  <td className={styles.right}>
                    <div className={styles.actions}>
                      <button className={styles.iconBtn}><Edit2 size={16}/></button>
                      <button className={`${styles.iconBtn} ${styles.danger}`}><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
