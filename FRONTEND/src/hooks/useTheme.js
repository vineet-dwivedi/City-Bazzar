import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'

const key = 'urbnbzr-theme'

// Adds a soft radial reveal when the theme changes.
export function useTheme() {
  const [theme, setThemeState] = useState(() => localStorage.getItem(key) || 'light')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(key, theme)
  }, [theme])

  const setTheme = (nextTheme, origin) => {
    document.documentElement.style.setProperty('--theme-origin-x', `${origin?.x ?? window.innerWidth / 2}px`)
    document.documentElement.style.setProperty('--theme-origin-y', `${origin?.y ?? 80}px`)

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        flushSync(() => setThemeState(nextTheme))
      })
      return
    }

    setThemeState(nextTheme)
  }

  return [theme, setTheme]
}
