'use client';
/* Ported from the inline splash-screen script in legacy/index.html */
import { useEffect, useState } from 'react';

export function Splash() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setFading(true));
    const t = setTimeout(() => setVisible(false), 400);
    return () => { cancelAnimationFrame(raf); clearTimeout(t); };
  }, []);
  if (!visible) return null;
  return (
    <div
      id="lim-splash"
      style={{
        position: 'fixed', inset: 0, zIndex: 99999, display: 'grid', placeItems: 'center',
        background: 'var(--bg, #fff)', transition: 'opacity .35s ease', opacity: fading ? 0 : 1,
      }}
    >
      <img src="/assets/logo-icon.png" alt="Limitra" style={{ width: 76, height: 76, objectFit: 'contain' }} />
    </div>
  );
}
