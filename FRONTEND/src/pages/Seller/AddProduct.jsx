import { useEffect, useState } from 'react';
import { Upload, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';
import { APP_ROUTES } from '../../lib/routes.js';
import { onboardingApi, ownerApi } from '../../lib/api.js';
import styles from './AddProduct.module.scss';

export default function AddProduct() {
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', stock: 1, desc: '' });
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [shopMissing, setShopMissing] = useState(false);

  useEffect(() => {
    let active = true;

    const loadOwnerShop = async () => {
      setLoading(true);

      try {
        const response = await ownerApi.getShop();

        if (active) {
          setShop(response);
          setShopMissing(false);
        }
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (requestError.status === 404) {
          setShopMissing(true);
        } else {
          setError(requestError.message || 'We could not load your shop.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadOwnerShop();

    return () => {
      active = false;
    };
  }, []);

  const analyzeProduct = async () => {
    setAnalyzing(true);
    setError('');

    try {
      const imageUrl = `https://local-upload/${encodeURIComponent(file?.name || form.name || 'product')}`;
      const analysis = await onboardingApi.analyze({
        imageUrl,
        rawText: form.desc.trim() || undefined,
        manualHint: `${form.name} ${form.desc}`.trim() || undefined,
        shopId: shop?.id,
      });

      navigate(APP_ROUTES.sellerAiReview, {
        state: {
          analysis,
          draft: form,
          imageUrl,
        },
      });
    } catch (requestError) {
      setError(requestError.message || 'AI analysis could not be completed.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className={`${styles.page} page-enter`}>
      <h1 className={styles.title}>Add New Product</h1>
      {loading && <p className="text-muted">Loading seller profile...</p>}
      {error && <p className="text-error">{error}</p>}

      {shopMissing && !loading ? (
        <Card>
          <div style={{ display: 'grid', gap: '12px' }}>
            <h3>Create your shop before adding products</h3>
            <p className="text-muted">The backend onboarding flow needs a seller shop profile first.</p>
            <div>
              <Button onClick={() => navigate(APP_ROUTES.sellerSettings)}>Open Seller Settings</Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className={styles.grid}>
          <div className={styles.left}>
            <div className={`${styles.uploadZone} ${file ? styles.hasFile : ''}`}>
              {file ? (
                <img src={URL.createObjectURL(file)} alt="Preview" className={styles.previewImg} />
              ) : (
                <div className={styles.uploadEmpty}>
                  <Upload size={32} className={styles.upIcon} />
                  <p className={styles.upText}>Add a package photo so the AI flow can use its filename and details.</p>
                  <div className={styles.upActions}>
                    <Button variant="outline" size="sm" icon={<ImageIcon size={14} />}>Choose Image</Button>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className={styles.fileInput}
                    onChange={(event) => event.target.files?.[0] && setFile(event.target.files[0])}
                  />
                </div>
              )}
            </div>
          </div>

          <div className={styles.right}>
            <Card className={styles.formCard}>
              <Input
                label="Product Name"
                placeholder="e.g. Maggi 2-Minute Noodles"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              />

              <div className={styles.row}>
                <Input
                  label="Price"
                  type="number"
                  prefix="Rs"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                />
                <Input
                  label="Stock Quantity"
                  type="number"
                  value={form.stock}
                  onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Description / OCR Notes</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Paste label text, flavour, size, or anything the AI should use."
                  rows={4}
                  value={form.desc}
                  onChange={(event) => setForm((current) => ({ ...current, desc: event.target.value }))}
                />
              </div>

              <Button
                fullWidth
                size="lg"
                icon={<Sparkles size={16} />}
                onClick={analyzeProduct}
                disabled={analyzing || (!file && !form.name.trim())}
              >
                {analyzing ? 'Analyzing...' : 'Analyze with AI'}
              </Button>
              <p className={styles.hint}>This now calls your backend onboarding analyzer before the owner confirms the final inventory item.</p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
