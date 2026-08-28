'use client';
/* shows the Spin & Win wheel once after a fresh signup, if not already used — ported from legacy/app.jsx */
import { useEffect, useState } from 'react';
import { SpinWheel } from '@/components/spin/SpinWheel';

export function SpinGate() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onSignup = () => { try { localStorage.setItem('lim_spin_used', '0'); } catch (e) {} setShow(true); };
    window.addEventListener('lim:signup', onSignup);
    return () => window.removeEventListener('lim:signup', onSignup);
  }, []);
  if (!show) return null;
  return <SpinWheel onClose={() => setShow(false)} />;
}
