import { motion } from 'framer-motion'
import { Moon, Search, SunMedium } from 'lucide-react'

export function PageTransition({ children, className = '' }) {
  return (
    <motion.main
      className={className}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.main>
  )
}

export function SectionHead({ eyebrow, title, note, action }) {
  return (
    <div className="section-head">
      <div>
        {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
        {note ? <p className="section-note">{note}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function SearchBar({ value, onChange, onSubmit, placeholder }) {
  return (
    <form className="search-shell" onSubmit={onSubmit}>
      <Search size={20} strokeWidth={2} />
      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </form>
  )
}

export function QuickPill({ active, children, ...props }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -1 }}
      className={`quick-pill ${active ? 'is-active' : ''}`.trim()}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'

  return (
    <motion.button
      type="button"
      className="theme-toggle"
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      aria-label="Toggle theme"
    >
      <span className={`theme-toggle__thumb ${isDark ? 'is-dark' : ''}`.trim()} />
      <span className="theme-toggle__icon is-sun">
        <SunMedium size={12} strokeWidth={2} />
      </span>
      <span className="theme-toggle__icon is-moon">
        <Moon size={12} strokeWidth={2} />
      </span>
    </motion.button>
  )
}
