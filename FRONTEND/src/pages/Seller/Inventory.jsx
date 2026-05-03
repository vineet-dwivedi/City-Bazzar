import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Edit2, Trash2, Download } from 'lucide-react';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import Modal from '../../components/ui/Modal/Modal';
import Input from '../../components/ui/Input/Input';
import styles from './Inventory.module.scss';
import { ownerApi } from '../../lib/api.js';
import {
  formatCategory,
  formatCurrency,
  getStockClassName,
  getStockLabel,
} from '../../lib/format.js';
import { APP_ROUTES } from '../../lib/routes.js';

const STOCK_OPTIONS = [
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
];
const PAGE_SIZE = 10;

const createEditForm = (item) => ({
  quantity: item.quantity,
  price: item.price,
  mrp: item.mrp,
  stockStatus: item.stockStatus,
});

export default function Inventory() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [shopName, setShopName] = useState('');
  const [inventoryItems, setInventoryItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: PAGE_SIZE, totalItems: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [shopMissing, setShopMissing] = useState(false);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const stockStatus = filter === 'All'
      ? undefined
      : filter === 'In Stock'
        ? 'in_stock'
        : filter === 'Low Stock'
          ? 'low_stock'
          : 'out_of_stock';

    const loadInventory = async () => {
      setLoading(true);
      setError('');

      try {
        const [shopResponse, inventoryResponse] = await Promise.all([
          ownerApi.getShop(),
          ownerApi.getInventory({
            page,
            pageSize: PAGE_SIZE,
            query,
            stockStatus,
          }),
        ]);

        if (!active) {
          return;
        }

        setShopName(shopResponse.name);
        setInventoryItems(inventoryResponse.inventory || []);
        setPagination(inventoryResponse.pagination || { page, pageSize: PAGE_SIZE, totalItems: 0, totalPages: 1 });
        setShopMissing(false);
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (requestError.status === 404) {
          setShopMissing(true);
          setShopName('');
          setInventoryItems([]);
        } else {
          setError(requestError.message || 'Inventory could not be loaded.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadInventory();

    return () => {
      active = false;
    };
  }, [filter, query, searchParams]);

  const openEditor = (item) => {
    setEditingItem(item);
    setEditForm(createEditForm(item));
  };

  const closeEditor = () => {
    setEditingItem(null);
    setEditForm(null);
  };

  const updateInventoryItem = async () => {
    if (!editingItem || !editForm) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      const updated = await ownerApi.upsertInventoryItem({
        productId: editingItem.productId,
        quantity: Number(editForm.quantity),
        price: Number(editForm.price),
        mrp: Number(editForm.mrp),
        stockStatus: editForm.stockStatus,
        imageUrl: editingItem.imageUrl,
      }, editingItem.productId);

      setInventoryItems((current) => current.map((item) =>
        item.id === editingItem.id ? { ...item, ...updated } : item
      ));
      closeEditor();
    } catch (requestError) {
      setError(requestError.message || 'Inventory update failed.');
    } finally {
      setSaving(false);
    }
  };

  const deleteInventoryItem = async (item) => {
    const confirmed = window.confirm(`Delete ${item.product.name} from your inventory?`);

    if (!confirmed) {
      return;
    }

    try {
      await ownerApi.deleteInventoryItem(item.productId);
      setInventoryItems((current) => current.filter((entry) => entry.id !== item.id));
    } catch (requestError) {
      setError(requestError.message || 'The inventory item could not be deleted.');
    }
  };

  const exportCsv = () => {
    const rows = [
      ['Product', 'Category', 'Price', 'MRP', 'Quantity', 'Stock Status'],
      ...inventoryItems.map((item) => [
        item.product.name,
        formatCategory(item.product.category),
        String(item.price),
        String(item.mrp),
        String(item.quantity),
        item.stockStatus,
      ]),
    ];
    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'urbnbzr-inventory.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`${styles.page} page-enter`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Inventory Management</h1>
          {shopName && <p className="text-muted">{shopName}</p>}
        </div>
        <Button variant="outline" icon={<Download size={16} />} onClick={exportCsv} disabled={!inventoryItems.length}>
          Export CSV
        </Button>
      </div>

      {loading && <p className="text-muted">Loading inventory...</p>}
      {error && <p className="text-error">{error}</p>}

      {shopMissing && !loading && (
        <Card>
          <div style={{ display: 'grid', gap: '12px' }}>
            <h3>Create your shop before managing inventory</h3>
            <p className="text-muted">Your backend owner inventory endpoints activate after a shop profile exists.</p>
            <div>
              <Button onClick={() => navigate(APP_ROUTES.sellerSettings)}>Open Seller Settings</Button>
            </div>
          </div>
        </Card>
      )}

      {!shopMissing && !loading && (
        <>
          <div className={styles.controls}>
            <div className={styles.search}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search products..."
                className={styles.searchInput}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  const nextParams = new URLSearchParams(searchParams);
                  if (event.target.value.trim()) {
                    nextParams.set('q', event.target.value);
                  } else {
                    nextParams.delete('q');
                  }
                  nextParams.delete('page');
                  setSearchParams(nextParams, { replace: true });
                }}
              />
            </div>
            <div className={styles.filters}>
              {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map((value) => (
                <button
                  key={value}
                  className={`${styles.filterChip} ${filter === value ? styles.active : ''}`}
                  onClick={() => {
                    setFilter(value);
                    const nextParams = new URLSearchParams(searchParams);
                    nextParams.delete('page');
                    setSearchParams(nextParams, { replace: true });
                  }}
                >
                  {value}
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
                    <th>Price</th>
                    <th>MRP</th>
                    <th>Stock</th>
                    <th className={styles.right}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryItems.map((item) => (
                    <tr key={item.id}>
                      <td className={styles.tdName}>
                        <div className={styles.imgThumb} />
                        <span className={styles.nameText}>{item.product.name}</span>
                      </td>
                      <td>{formatCategory(item.product.category)}</td>
                      <td>{formatCurrency(item.price)}</td>
                      <td>{formatCurrency(item.mrp)}</td>
                      <td>
                        <span className={`stock-pill ${getStockClassName(item.stockStatus)}`}>
                          {getStockLabel(item.stockStatus, item.quantity)}
                        </span>
                      </td>
                      <td className={styles.right}>
                        <div className={styles.actions}>
                          <button className={styles.iconBtn} onClick={() => openEditor(item)}>
                            <Edit2 size={16} />
                          </button>
                          <button className={`${styles.iconBtn} ${styles.danger}`} onClick={() => deleteInventoryItem(item)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!inventoryItems.length && <p style={{ padding: '16px' }} className="text-muted">No inventory items match this filter.</p>}
            </div>
          </Card>
          {pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => {
                  const nextParams = new URLSearchParams(searchParams);
                  nextParams.set('page', String(pagination.page - 1));
                  setSearchParams(nextParams, { replace: true });
                }}
              >
                Previous
              </Button>
              <span className={styles.pageMeta}>Page {pagination.page} of {pagination.totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => {
                  const nextParams = new URLSearchParams(searchParams);
                  nextParams.set('page', String(pagination.page + 1));
                  setSearchParams(nextParams, { replace: true });
                }}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <Modal isOpen={Boolean(editingItem)} onClose={closeEditor} title={editingItem ? `Edit ${editingItem.product.name}` : 'Edit Inventory'}>
        {editingItem && editForm && (
          <div style={{ display: 'grid', gap: '14px' }}>
            <Input
              label="Quantity"
              type="number"
              value={editForm.quantity}
              onChange={(event) => setEditForm((current) => ({ ...current, quantity: event.target.value }))}
            />
            <Input
              label="Selling Price"
              type="number"
              value={editForm.price}
              onChange={(event) => setEditForm((current) => ({ ...current, price: event.target.value }))}
            />
            <Input
              label="MRP"
              type="number"
              value={editForm.mrp}
              onChange={(event) => setEditForm((current) => ({ ...current, mrp: event.target.value }))}
            />
            <div style={{ display: 'grid', gap: '6px' }}>
              <label className="text-sm font-medium">Stock Status</label>
              <select
                value={editForm.stockStatus}
                onChange={(event) => setEditForm((current) => ({ ...current, stockStatus: event.target.value }))}
                style={{
                  height: '48px',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  padding: '0 14px',
                }}
              >
                {STOCK_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <Button onClick={updateInventoryItem} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
