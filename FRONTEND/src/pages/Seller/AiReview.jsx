import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';
import { onboardingApi } from '../../lib/api.js';
import { APP_ROUTES } from '../../lib/routes.js';
import { formatCategory } from '../../lib/format.js';

const CATEGORY_OPTIONS = [
  'grocery',
  'stationery',
  'pharmacy',
  'personal-care',
  'beverages',
  'snacks',
  'household',
];

const STOCK_OPTIONS = [
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
];

export default function SellerAiReview() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const analysis = state?.analysis;
  const draft = state?.draft;
  const imageUrl = state?.imageUrl;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState(() => ({
    name: analysis?.extracted?.name || draft?.name || '',
    brand: analysis?.extracted?.brand || '',
    category: analysis?.extracted?.category || 'grocery',
    mrp: analysis?.extracted?.mrp ?? draft?.price ?? '',
    price: analysis?.extracted?.price ?? draft?.price ?? '',
    quantity: draft?.stock || 1,
    stockStatus: 'in_stock',
    keywords: (analysis?.suggestedKeywords || []).join(', '),
  }));

  if (!analysis) {
    return (
      <div className="page-enter" style={{ display: 'grid', gap: '16px' }}>
        <h1>AI Review</h1>
        <p className="text-muted">No analysis payload was found. Start from Add Product to run the backend analyzer first.</p>
        <div>
          <Button onClick={() => navigate(APP_ROUTES.sellerAddProduct)}>Back to Add Product</Button>
        </div>
      </div>
    );
  }

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const confirmProduct = async () => {
    setSaving(true);
    setError('');
    setMessage('');

    try {
      await onboardingApi.confirm({
        onboardingSessionId: analysis.sessionId,
        catalogProductId: analysis.catalogMatch?.product?.id,
        name: form.name,
        brand: form.brand,
        category: form.category,
        mrp: Number(form.mrp) || null,
        price: Number(form.price) || null,
        quantity: Number(form.quantity) || 1,
        stockStatus: form.stockStatus,
        imageUrl,
        keywords: form.keywords
          .split(',')
          .map((keyword) => keyword.trim())
          .filter(Boolean),
      });

      setMessage('Inventory item confirmed and saved to the backend.');
      setTimeout(() => navigate(APP_ROUTES.sellerInventory), 900);
    } catch (requestError) {
      setError(requestError.message || 'The onboarding confirmation failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-enter" style={{ display: 'grid', gap: '20px', maxWidth: '860px' }}>
      <div>
        <h1>AI Review</h1>
        <p className="text-muted">
          {analysis.catalogMatch?.status === 'existing'
            ? `Matched catalog product with ${Math.round((analysis.catalogMatch.confidence || 0) * 100)}% confidence.`
            : 'No strong catalog match was found, so this will create a new catalog product when you confirm.'}
        </p>
      </div>

      <div
        style={{
          padding: '18px',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          background: 'var(--surface)',
          display: 'grid',
          gap: '10px',
        }}
      >
        <h3>Analysis Notes</h3>
        {analysis.notes?.length ? analysis.notes.map((note) => (
          <p key={note} className="text-sm text-muted">{note}</p>
        )) : <p className="text-sm text-muted">The analyzer is ready for your review.</p>}
        <p className="text-sm text-muted">
          Suggested category: {formatCategory(analysis.extracted.category)}
        </p>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        <Input label="Product Name" value={form.name} onChange={updateField('name')} />
        <Input label="Brand" value={form.brand} onChange={updateField('brand')} />

        <div style={{ display: 'grid', gap: '6px' }}>
          <label className="text-sm font-medium">Category</label>
          <select
            value={form.category}
            onChange={updateField('category')}
            style={{
              height: '48px',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text)',
              padding: '0 14px',
            }}
          >
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>{formatCategory(category)}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <Input label="MRP" type="number" value={form.mrp} onChange={updateField('mrp')} />
          <Input label="Selling Price" type="number" value={form.price} onChange={updateField('price')} />
          <Input label="Quantity" type="number" value={form.quantity} onChange={updateField('quantity')} />
        </div>

        <div style={{ display: 'grid', gap: '6px' }}>
          <label className="text-sm font-medium">Stock Status</label>
          <select
            value={form.stockStatus}
            onChange={updateField('stockStatus')}
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

        <Input
          label="Keywords"
          placeholder="maggi, noodles, grocery"
          value={form.keywords}
          onChange={updateField('keywords')}
        />

        {error && <p className="text-error">{error}</p>}
        {message && <p className="text-success">{message}</p>}

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
          <Button onClick={confirmProduct} disabled={saving}>
            {saving ? 'Saving...' : 'Confirm and Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}
