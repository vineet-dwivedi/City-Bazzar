import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';
import { ownerApi } from '../../lib/api.js';
import { DEFAULT_LOCATION } from '../../lib/location.js';
import { useAuth } from '../../context/AuthContext';
import { APP_ROUTES } from '../../lib/routes.js';

const SHOP_TYPES = [
  { value: 'kirana', label: 'Kirana' },
  { value: 'stationery', label: 'Stationery' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'general-store', label: 'General Store' },
];

const buildInitialForm = (user) => ({
  name: '',
  type: 'kirana',
  ownerName: user?.fullName || user?.name || '',
  phone: user?.phone || '',
  address: DEFAULT_LOCATION.label,
  latitude: DEFAULT_LOCATION.lat,
  longitude: DEFAULT_LOCATION.lng,
  serviceRadiusKm: DEFAULT_LOCATION.radiusKm,
});

export default function SellerSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [form, setForm] = useState(() => buildInitialForm(user));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setForm((current) => ({
      ...current,
      ownerName: current.ownerName || user?.fullName || user?.name || '',
      phone: current.phone || user?.phone || '',
    }));
  }, [user]);

  useEffect(() => {
    let active = true;

    const loadShop = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await ownerApi.getShop();

        if (!active) {
          return;
        }

        setShop(response);
        setForm({
          name: response.name,
          type: response.type,
          ownerName: response.ownerName,
          phone: response.phone,
          address: response.address,
          latitude: response.latitude,
          longitude: response.longitude,
          serviceRadiusKm: response.serviceRadiusKm,
        });
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (requestError.status !== 404) {
          setError(requestError.message || 'We could not load your shop profile.');
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
  }, []);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const payload = {
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        serviceRadiusKm: Number(form.serviceRadiusKm),
      };

      const response = shop
        ? await ownerApi.updateShop(payload)
        : await ownerApi.createShop(payload);

      setShop(response);
      setMessage(shop ? 'Shop profile updated.' : 'Shop profile created. You can manage inventory now.');
    } catch (requestError) {
      setError(requestError.message || 'The shop profile could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-enter" style={{ display: 'grid', gap: '20px' }}>
      <div>
        <h1>Seller Settings</h1>
        <p className="text-muted">
          {shop
            ? 'Update the shop profile that powers your backend owner routes.'
            : 'Create your shop first. Inventory, analytics, and pickup requests depend on this profile.'}
        </p>
      </div>

      {loading && <p className="text-muted">Loading shop profile...</p>}
      {error && <p className="text-error">{error}</p>}
      {message && <p className="text-success">{message}</p>}

      {!loading && (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px', maxWidth: '720px' }}>
          <Input label="Shop Name" value={form.name} onChange={updateField('name')} required />

          <div style={{ display: 'grid', gap: '6px' }}>
            <label className="text-sm font-medium">Shop Type</label>
            <select
              value={form.type}
              onChange={updateField('type')}
              style={{
                height: '48px',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text)',
                padding: '0 14px',
              }}
            >
              {SHOP_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <Input label="Owner Name" value={form.ownerName} onChange={updateField('ownerName')} required />
          <Input label="Phone" value={form.phone} onChange={updateField('phone')} required />
          <Input label="Address" value={form.address} onChange={updateField('address')} required />

          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <Input label="Latitude" type="number" value={form.latitude} onChange={updateField('latitude')} required />
            <Input label="Longitude" type="number" value={form.longitude} onChange={updateField('longitude')} required />
            <Input label="Radius (km)" type="number" value={form.serviceRadiusKm} onChange={updateField('serviceRadiusKm')} required />
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : shop ? 'Update Shop' : 'Create Shop'}</Button>
            <Button variant="outline" onClick={() => navigate(APP_ROUTES.sellerHome)}>Back to Dashboard</Button>
          </div>
        </form>
      )}
    </div>
  );
}
