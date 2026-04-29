import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button/Button';
import Input from '../components/ui/Input/Input';
import styles from './Auth.module.scss';
import { ShoppingBag, Store } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState(null); // 'buyer' | 'seller'
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const r = role || 'buyer';
    login(r);
    navigate(r === 'seller' ? '/seller' : '/buyer');
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
              <p>Discover & pickup nearby products</p>
            </button>
            <button className={styles.roleCard} onClick={() => setRole('seller')}>
              <Store size={32} className={styles.roleIcon} />
              <h3>I'm a Seller</h3>
              <p>List products & manage inventory</p>
            </button>
            <div className={styles.footer}>
              <p>Already have an account? <span onClick={() => setIsLogin(true)}>Login</span></p>
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
            <p className={styles.sub}>Enter your details to continue</p>
            
            <form onSubmit={handleLogin} className={styles.form}>
              {!isLogin && <Input label="Full Name" placeholder="John Doe" required />}
              <Input label="Email" type="email" placeholder="you@example.com" required />
              <Input label="Password" type="password" placeholder="••••••••" required />
              
              <Button type="submit" fullWidth size="lg">
                {isLogin ? 'Login' : 'Sign Up'}
              </Button>
            </form>

            <div className={styles.footer}>
              {isLogin ? (
                <p>New to URBNBZR? <span onClick={() => setIsLogin(false)}>Sign up</span></p>
              ) : (
                <p>Already have an account? <span onClick={() => { setIsLogin(true); setRole(null); }}>Login</span></p>
              )}
            </div>
            
            {/* Quick dev bypass */}
            <div className={styles.devBypass}>
              <p>Dev Bypass:</p>
              <div className={styles.bpBtns}>
                <Button variant="outline" size="sm" onClick={() => { login('buyer'); navigate('/buyer'); }}>Buyer</Button>
                <Button variant="outline" size="sm" onClick={() => { login('seller'); navigate('/seller'); }}>Seller</Button>
                <Button variant="outline" size="sm" onClick={() => { login('admin'); navigate('/admin'); }}>Admin</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
