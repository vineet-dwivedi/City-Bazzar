import { useEffect } from 'react'
import Lenis from 'lenis'

// Smooth scroll is subtle here so the app still feels practical.
export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1,
      smoothWheel: true,
      wheelMultiplier: 0.9,
    })

    let frame = 0

    const raf = (time) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }

    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [])
}
