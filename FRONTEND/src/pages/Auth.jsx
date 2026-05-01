import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button/Button';
import Input from '../components/ui/Input/Input';
import styles from './Auth.module.scss';
import { getHomePath } from '../lib/routes.js';

const EMPTY_FORM = {
  fullName: '',
  identifier: '',
  email: '',
  phone: '',
  password: '',
};

const resolveIdentifier = (identifier) => {
  const value = identifier.trim();

  if (!value) {
    return { email: '', phone: '' };
  }

  return value.includes('@')
    ? { email: value.toLowerCase(), phone: '' }
    : { email: '', phone: value };
};

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const trimmedEmail = form.email.trim().toLowerCase();
      const trimmedPhone = form.phone.trim();
      const identifier = resolveIdentifier(form.identifier);

      if (isLogin && !identifier.email && !identifier.phone) {
        throw new Error('Enter your email or phone number to continue.');
      }

      if (!isLogin && !trimmedEmail && !trimmedPhone) {
        throw new Error('Add at least an email or a phone number to create your account.');
      }

      const account = isLogin
        ? await login({
            email: identifier.email,
            phone: identifier.phone,
            password: form.password,
          })
        : await register({
            fullName: form.fullName.trim(),
            email: trimmedEmail,
            phone: trimmedPhone,
            password: form.password,
            role: role || 'buyer',
          });

      navigate(getHomePath(account.role), { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'We could not complete that request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!role && !isLogin) {
    return (
      <div className={`${styles.authWrap} page-enter`}>
        <div className={styles.roleSelection}>
          <div className={styles.brandPanel}>
            <h1 className={styles.logo}>URBNBZR</h1>
            <p className={styles.tag}>Your neighbourhood. Reimagined.</p>
          </div>
          <div className={styles.roles}>
            <button className={styles.roleCard} onClick={() => setRole('buyer')}>
              <ShoppingBag size={32} className={styles.roleIcon} />
              <h3>I'm a Buyer</h3>
              <p>Discover and reserve nearby products in real time.</p>
            </button>
            <button className={styles.roleCard} onClick={() => setRole('seller')}>
              <Store size={32} className={styles.roleIcon} />
              <h3>I'm a Seller</h3>
              <p>Create your shop profile and manage local inventory.</p>
            </button>
            <div className={styles.footer}>
              <p>Already have an account? <span onClick={() => { setIsLogin(true); resetForm(); }}>Login</span></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.authWrap} page-enter`}>
      <div className={styles.container}>
        <div className={styles.brandPanel}>
          <h1 className={styles.logo}>URBNBZR</h1>
          <p className={styles.tag}>Your neighbourhood. Reimagined.</p>
        </div>
        <div className={styles.formPanel}>
          <div className={styles.formInner}>
            <h2>{isLogin ? 'Welcome back' : `Create ${role === 'seller' ? 'Seller' : 'Buyer'} Account`}</h2>
            <p className={styles.sub}>
              {isLogin ? 'Login with the account you created on the backend.' : 'Create a real account and continue.'}
            </p>

            <form onSubmit={handleSubmit} className={styles.form}>
              {!isLogin && (
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  value={form.fullName}
                  onChange={updateField('fullName')}
                  required
                />
              )}
              {isLogin ? (
                <Input
                  label="Email or Phone"
                  placeholder="you@example.com or +91 98765 12345"
                  value={form.identifier}
                  onChange={updateField('identifier')}
                  required
                />
              ) : (
                <>
                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={updateField('email')}
                  />
                  <Input
                    label="Phone"
                    placeholder="+91 98765 12345"
                    value={form.phone}
                    onChange={updateField('phone')}
                  />
                </>
              )}
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={updateField('password')}
                required
              />

              {error && <p className="text-error text-sm">{error}</p>}

              <Button type="submit" fullWidth size="lg" disabled={submitting}>
                {submitting ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
              </Button>
            </form>

            <div className={styles.footer}>
              {isLogin ? (
                <p>New to URBNBZR? <span onClick={() => { setIsLogin(false); resetForm(); }}>Sign up</span></p>
              ) : (
                <p>Already have an account? <span onClick={() => { setIsLogin(true); setRole(null); resetForm(); }}>Login</span></p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
