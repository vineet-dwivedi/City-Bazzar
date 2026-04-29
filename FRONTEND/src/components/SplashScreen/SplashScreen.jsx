// Splash / Loading Screen with GSAP animation
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import styles from './SplashScreen.module.scss';

export default function SplashScreen({ onDone }) {
  const logoRef = useRef();
  const barRef = useRef();
  const tagRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    const tl = gsap.timeline({ onComplete: () => onDone?.() });
    tl.fromTo(logoRef.current, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out' })
      .fromTo(tagRef.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 }, '-=0.2')
      .fromTo(barRef.current, { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: 'power2.inOut', transformOrigin: 'left' }, '-=0.1')
      .to(containerRef.current, { opacity: 0, duration: 0.35, delay: 0.3, ease: 'power2.in' });
    return () => tl.kill();
  }, []);

  return (
    <div className={styles.splash} ref={containerRef}>
      <div className={styles.center}>
        <h1 className={styles.logo} ref={logoRef}>URBNBZR</h1>
        <p className={styles.tag} ref={tagRef}>Discover. Pickup. Done.</p>
        <div className={styles.progressTrack}>
          <div className={styles.progressBar} ref={barRef} />
        </div>
      </div>
      <div className={styles.skeletons}>
        {[1,2,3].map(i => <div key={i} className={styles.skCard} />)}
      </div>
    </div>
  );
}
