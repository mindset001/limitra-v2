'use client';
/* LIMITRA store — global cart/wishlist/theme/etc state, ported from legacy/store.jsx.
   Routing changes from a hash router to next/navigation; everything else is unchanged. */
import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ADDRESSES, CARDS, REFERRAL, naira, byId } from '@/lib/data';
import { routeFor, parseRoute } from '@/lib/routes';

const StoreCtx = createContext(null);
export const useStore = () => useContext(StoreCtx);

export function StoreProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const route = useMemo(() => parseRoute(pathname, searchParams), [pathname, searchParams]);

  const [theme, setTheme] = useState('light');
  const [cart, setCart] = useState([]);
  const [wish, setWish] = useState(['p9', 'p21']);
  const [addresses, setAddresses] = useState(ADDRESSES);
  const [cards, setCards] = useState(CARDS);
  const addressesRef = useRef(addresses); addressesRef.current = addresses;
  const cardsRef = useRef(cards); cardsRef.current = cards;
  const [toasts, setToasts] = useState([]);
  const [query, setQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [referral, setReferral] = useState(REFERRAL);
  const [rewards, setRewards] = useState([]);
  const [promo, setPromo] = useState(null); // applied promo code (in-memory: never auto-applies on reload)
  const [spinUsed, setSpinUsed] = useState(false);
  const tid = useRef(0);

  /* hydrate from localStorage once on mount (avoids SSR/client markup mismatch) */
  useEffect(() => {
    try { setTheme(localStorage.getItem('lim_theme') || 'light'); } catch (e) {}
    try { setCart(JSON.parse(localStorage.getItem('lim_cart') || '[]')); } catch (e) {}
    try { setWish(JSON.parse(localStorage.getItem('lim_wish') || '["p9","p21"]')); } catch (e) {}
    try { setAddresses(JSON.parse(localStorage.getItem('lim_addr') || 'null') || ADDRESSES); } catch (e) {}
    try { setCards(JSON.parse(localStorage.getItem('lim_cards') || 'null') || CARDS); } catch (e) {}
    try { setSearchHistory(JSON.parse(localStorage.getItem('lim_search') || '[]')); } catch (e) {}
    try {
      const saved = JSON.parse(localStorage.getItem('lim_referral') || 'null');
      // migrate stale demo defaults (old LUCY* codes) to the current default
      if (saved && !/^LUCY/i.test(saved.code || '')) setReferral(saved);
    } catch (e) {}
    try { setRewards(JSON.parse(localStorage.getItem('lim_rewards') || '[]')); } catch (e) {}
    try { setSpinUsed(localStorage.getItem('lim_spin_used') === '1'); } catch (e) {}
  }, []);

  useEffect(() => {
    const onSignup = () => setSpinUsed(false);
    window.addEventListener('lim:signup', onSignup);
    return () => window.removeEventListener('lim:signup', onSignup);
  }, []);

  /* theme */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('lim_theme', theme); } catch (e) {}
  }, [theme]);
  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  /* routing */
  useEffect(() => { window.scrollTo({ top: 0 }); }, [pathname]);
  const go = useCallback((name, ...params) => {
    router.push(routeFor(name, params));
  }, [router]);

  /* persistence */
  useEffect(() => { try { localStorage.setItem('lim_cart', JSON.stringify(cart)); } catch (e) {} }, [cart]);
  useEffect(() => { try { localStorage.setItem('lim_wish', JSON.stringify(wish)); } catch (e) {} }, [wish]);
  useEffect(() => { try { localStorage.setItem('lim_addr', JSON.stringify(addresses)); } catch (e) {} }, [addresses]);
  useEffect(() => { try { localStorage.setItem('lim_cards', JSON.stringify(cards)); } catch (e) {} }, [cards]);
  useEffect(() => { try { localStorage.setItem('lim_search', JSON.stringify(searchHistory)); } catch (e) {} }, [searchHistory]);
  useEffect(() => { try { localStorage.setItem('lim_referral', JSON.stringify(referral)); } catch (e) {} }, [referral]);
  useEffect(() => { try { localStorage.setItem('lim_rewards', JSON.stringify(rewards)); } catch (e) {} }, [rewards]);
  useEffect(() => { try { localStorage.setItem('lim_spin_used', spinUsed ? '1' : '0'); } catch (e) {} }, [spinUsed]);

  /* search history */
  const addSearch = useCallback((q) => {
    q = (q || '').trim(); if (!q) return;
    setSearchHistory(h => [q, ...h.filter(x => x.toLowerCase() !== q.toLowerCase())].slice(0, 8));
  }, []);
  const clearSearch = useCallback(() => setSearchHistory([]), []);

  /* addresses */
  const saveAddress = useCallback((data) => {
    setAddresses(list => {
      const exists = data.id && list.some(a => a.id === data.id);
      const makeP = !!data.primary;
      if (exists) {
        return list.map(a => a.id === data.id ? { ...a, ...data } : (makeP ? { ...a, primary: false } : a));
      }
      const next = { ...data, id: data.id || Date.now() };
      const base = makeP ? list.map(a => ({ ...a, primary: false })) : list;
      return [...base, next];
    });
    toast(data.id && addressesRef.current.some(a => a.id === data.id) ? 'Address updated' : 'Address added');
  }, []);
  const removeAddress = useCallback((id) => { setAddresses(list => list.filter(a => a.id !== id)); toast('Address removed'); }, []);
  const setPrimaryAddress = useCallback((id) => { setAddresses(list => list.map(a => ({ ...a, primary: a.id === id }))); toast('Default address updated'); }, []);

  /* cards */
  const saveCard = useCallback((data) => {
    setCards(list => {
      const exists = data.id && list.some(c => c.id === data.id);
      const makeP = !!data.primary;
      if (exists) {
        return list.map(c => c.id === data.id ? { ...c, ...data, primary: makeP ? true : c.primary } : (makeP ? { ...c, primary: false } : c));
      }
      const next = { ...data, id: data.id || Date.now() };
      const base = makeP ? list.map(c => ({ ...c, primary: false })) : list;
      return [...base, next];
    });
    toast(data.id && cardsRef.current.some(c => c.id === data.id) ? 'Card updated' : 'Card saved');
  }, []);
  const removeCard = useCallback((id) => { setCards(list => list.filter(c => c.id !== id)); toast('Card removed'); }, []);
  const setPrimaryCard = useCallback((id) => { setCards(list => list.map(c => ({ ...c, primary: c.id === id }))); toast('Default card updated'); }, []);

  /* toasts */
  const toast = useCallback((msg, kind = 'ok') => {
    const id = ++tid.current;
    setToasts(t => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2600);
  }, []);

  /* cart ops */
  const addToCart = useCallback((product, opts = {}, qty = 1) => {
    const key = [product.id, opts.color || '', opts.storage || ''].join('|');
    setCart(c => {
      const ex = c.find(i => i.key === key);
      if (ex) return c.map(i => i.key === key ? { ...i, qty: i.qty + qty } : i);
      return [...c, { key, id: product.id, qty, color: opts.color || '', storage: opts.storage || '' }];
    });
    toast(`Added to cart · ${product.name.split(',')[0]}`);
  }, [toast]);
  const setQty = useCallback((key, qty) => {
    setCart(c => qty <= 0 ? c.filter(i => i.key !== key) : c.map(i => i.key === key ? { ...i, qty } : i));
  }, []);
  const removeItem = useCallback(key => setCart(c => c.filter(i => i.key !== key)), []);
  const clearCart = useCallback(() => setCart([]), []);

  /* wishlist */
  const toggleWish = useCallback((id) => {
    setWish(w => {
      const has = w.includes(id);
      toast(has ? 'Removed from wishlist' : 'Saved to wishlist');
      return has ? w.filter(x => x !== id) : [...w, id];
    });
  }, [toast]);

  /* referrals, referrer earns ₦5,000 store credit per completed referral; credit only offsets order totals */
  const REFERRAL_REWARD = 5000;
  // spend up to `amount` (or full balance) of credit; returns the amount actually applied
  const redeemCredit = useCallback((amount) => {
    let applied = 0;
    setReferral(r => { applied = Math.min(r.credit, amount); return { ...r, credit: r.credit - applied }; });
    return applied;
  }, []);

  // spin-to-win rewards (single spin per account); a reward becomes a coupon usable at checkout
  const claimSpin = useCallback((reward) => {
    // cash prizes go straight to referral credit (points), not a coupon
    if (reward.kind === 'fixed') {
      setReferral(r => ({ ...r, credit: r.credit + reward.value }));
      setSpinUsed(true);
      return null;
    }
    const code = (reward.codePrefix || 'WELCOME') + Math.floor(10 + Math.random() * 89);
    const expires = new Date(Date.now() + 7 * 864e5).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
    setRewards(r => [{ ...reward, code, expires, status: 'Active', won: 'Just now' }, ...r]);
    setSpinUsed(true);
    return code;
  }, []);
  const redeemReward = useCallback((code) => setRewards(r => r.map(x => x.code === code ? { ...x, status: 'Used' } : x)), []);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + (byId(i.id)?.price || 0) * i.qty, 0);

  const value = {
    theme, toggleTheme, route, go,
    cart, addToCart, setQty, removeItem, clearCart, cartCount, cartTotal,
    wish, toggleWish,
    addresses, saveAddress, removeAddress, setPrimaryAddress,
    cards, saveCard, removeCard, setPrimaryCard,
    toasts, toast,
    query, setQuery,
    searchHistory, addSearch, clearSearch,
    referral, REFERRAL_REWARD, redeemCredit,
    rewards, spinUsed, claimSpin, redeemReward,
    promo, setPromo,
  };
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export const fmt = n => naira(n);
