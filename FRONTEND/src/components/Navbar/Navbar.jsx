// Global Navbar — search, location, theme toggle, avatar
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Sun, Moon, Bell, User, X, TrendingUp, Clock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.scss';

const TRENDING = ['wireless earbuds', 'phone stand', 'notebook', 'USB hub', 'hoodie'];
const RECENT   = ['sony headphones', 'mechanical keyboard', 'desk lamp'];

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>URBNBZR</Link>

        {/* Search Bar */}
        <form className={styles.searchBar} onSubmit={handleSearch}>
          <Search size={15} className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search nearby products..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            className={styles.searchInput}
          />
          <span className={styles.locationChip}>
            <MapPin size={12} />
            Andheri West
          </span>
          {query && (
            <button type="button" className={styles.clearBtn} onClick={() => setQuery('')}>
              <X size={14} />
            </button>
          )}
        </form>

        {/* Right Controls */}
        <div className={styles.controls}>
          <button className={styles.iconBtn} onClick={toggle} title="Toggle theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button className={styles.iconBtn}><Bell size={18} /></button>
          <div className={styles.avatarWrap} onClick={() => setMenuOpen(o => !o)}>
            <div className={styles.avatar}>
              <User size={16} />
            </div>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  className={styles.dropdown}
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className={styles.dropHeader}>
                    <p className={styles.dropName}>{user?.name || 'Guest'}</p>
                    <p className={styles.dropRole}>{user?.role}</p>
                  </div>
                  <Link to="/profile" className={styles.dropItem}>Profile</Link>
                  <Link to="/settings" className={styles.dropItem}>Settings</Link>
                  <button className={styles.dropItem} onClick={logout}>Logout</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Search Dropdown */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <div className={styles.searchBackdrop} onClick={() => setSearchOpen(false)} />
            <motion.div
              className={styles.searchDropdown}
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {query === '' && (
                <>
                  <div className={styles.dropSection}>
                    <p className={styles.dropLabel}><Clock size={12} /> Recent Searches</p>
                    {RECENT.map(t => (
                      <button key={t} className={styles.dropRow} onClick={() => { setQuery(t); setSearchOpen(false); navigate(`/search?q=${t}`); }}>
                        <Clock size={13} className={styles.dropRowIcon} />{t}
                      </button>
                    ))}
                  </div>
                  <div className={styles.dropDivider} />
                  <div className={styles.dropSection}>
                    <p className={styles.dropLabel}><TrendingUp size={12} /> Trending Near You</p>
                    <div className={styles.trendingChips}>
                      {TRENDING.map(t => (
                        <button key={t} className={styles.trendChip} onClick={() => { setQuery(t); setSearchOpen(false); navigate(`/search?q=${t}`); }}>
                          🔥 {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
