import { AnimatePresence } from 'framer-motion'
import { Store } from 'lucide-react'
import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { ThemeToggle } from './components/ui'
import { useTheme } from './hooks/useTheme'
import { HomePage } from './pages/home-page'
import { OwnersPage } from './pages/owners-page'
import { SearchPage } from './pages/search-page'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Search', to: '/search' },
  { label: 'For Shop Owners', to: '/owners' },
]

function App() {
  const location = useLocation()
  const [theme, setTheme] = useTheme()

  const handleThemeToggle = (event) => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    const rect = event.currentTarget.getBoundingClientRect()

    setTheme(nextTheme, {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    })
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container header-inner">
          <NavLink className="brand" to="/" aria-label="URBNBZR home">
            <span className="brand__mark">
              <Store size={22} strokeWidth={2.1} />
            </span>
            <span className="brand__label">URBNBZR</span>
          </NavLink>

          <nav className="site-nav" aria-label="Primary">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `site-nav__link ${isActive ? 'is-active' : ''}`.trim()}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="header-tools">
            <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/owners" element={<OwnersPage />} />
        </Routes>
      </AnimatePresence>
    </div>
  )
}

export default App
