import { useState } from 'react';
import { Upload, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';
import styles from './AddProduct.module.scss';

export default function AddProduct() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', stock: 1, desc: '' });

  return (
    <div className={`${styles.page} page-enter`}>
      <h1 className={styles.title}>Add New Product</h1>
      
      <div className={styles.grid}>
        <div className={styles.left}>
          <div className={`${styles.uploadZone} ${file ? styles.hasFile : ''}`}>
            {file ? (
              <img src={URL.createObjectURL(file)} alt="Preview" className={styles.previewImg} />
            ) : (
              <div className={styles.uploadEmpty}>
                <Upload size={32} className={styles.upIcon} />
                <p className={styles.upText}>Drag photos here or click to browse</p>
                <div className={styles.upActions}>
                  <Button variant="outline" size="sm" icon={<ImageIcon size={14}/>}>Gallery</Button>
                </div>
                <input 
                  type="file" accept="image/*" className={styles.fileInput}
                  onChange={e => e.target.files[0] && setFile(e.target.files[0])}
                />
              </div>
            )}
          </div>
        </div>

        <div className={styles.right}>
          <Card className={styles.formCard}>
            <Input label="Product Name" placeholder="e.g. Sony WH-1000XM4" 
              value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            
            <div className={styles.row}>
              <Input label="Price" type="number" prefix="₹" placeholder="0.00" 
                value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
              <Input label="Stock Quantity" type="number" value={form.stock} 
                onChange={e => setForm({...form, stock: e.target.value})} />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Description</label>
              <textarea 
                className={styles.textarea} placeholder="Describe the product..." rows={4}
                value={form.desc} onChange={e => setForm({...form, desc: e.target.value})}
              />
            </div>

            <Button 
              fullWidth size="lg" icon={<Sparkles size={16}/>}
              onClick={() => navigate('/seller/ai-review')}
              disabled={!file}
            >
              Analyze with AI
            </Button>
            <p className={styles.hint}>AI will automatically extract details and suggest a price.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
