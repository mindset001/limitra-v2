'use client';
/* LIMITRA store — global cart/wishlist/theme/etc state, ported from legacy/store.jsx.
   Routing changes from a hash router to next/navigation; everything else is unchanged. */
import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { naira, byId } from '@/lib/data';
import { routeFor, parseRoute } from '@/lib/routes';
import { getToken, clearTokens } from '@/lib/auth';
import { authApi, profileApi, cartApi, cartItemsApi, favoritesApi } from '@/lib/api/endpoints';
import { messageFrom } from '@/lib/api/errors';

const StoreCtx = createContext(null);
export const useStore = () => useContext(StoreCtx);

export function StoreProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const route = useMemo(() => parseRoute(pathname, searchParams), [pathname, searchParams]);

  const [theme, setTheme] = useState('light');
  /* guest cart/wishlist — localStorage-backed. Once signed in, the backend cart
     (remoteCart/favorites below) takes over as the source of truth instead;
     the backend has no guest/anonymous cart support (its routes require auth). */
  const [localCart, setLocalCart] = useState([]);
  const [localWish, setLocalWish] = useState([]);
  const [remoteCart, setRemoteCart] = useState(null); // raw cartApi cart object, signed-in users only
  const [favorites, setFavorites] = useState([]); // [{id, product_id, ...}], signed-in users only
  const [addresses, setAddresses] = useState([]);
  const [cards, setCards] = useState([]);
  const addressesRef = useRef(addresses); addressesRef.current = addresses;
  const cardsRef = useRef(cards); cardsRef.current = cards;
  const [toasts, setToasts] = useState([]);
  const [query, setQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [referral, setReferral] = useState({ code: null, credit: 0, referrals: [] });
  const [rewards, setRewards] = useState([]);
  const [promo, setPromo] = useState(null); // applied promo code (in-memory: never auto-applies on reload)
  const [spinUsed, setSpinUsed] = useState(false);
  const [user, setUser] = useState(null);
  const isAuthenticated = !!user;
  const [authLoading, setAuthLoading] = useState(true);
  const tid = useRef(0);

  /* hydrate from localStorage once on mount (avoids SSR/client markup mismatch).
     addresses/cards/referral have no fake seed anymore — they start empty until
     a real backend (or, for addresses/cards, the user's own local entries) fills them in. */
  useEffect(() => {
    try { setTheme(localStorage.getItem('lim_theme') || 'light'); } catch (e) {}
    try { setLocalCart(JSON.parse(localStorage.getItem('lim_cart') || '[]')); } catch (e) {}
    try { setLocalWish(JSON.parse(localStorage.getItem('lim_wish') || '[]')); } catch (e) {}
    try { setAddresses(JSON.parse(localStorage.getItem('lim_addr') || '[]')); } catch (e) {}
    try { setCards(JSON.parse(localStorage.getItem('lim_cards') || '[]')); } catch (e) {}
    try { setSearchHistory(JSON.parse(localStorage.getItem('lim_search') || '[]')); } catch (e) {}
    try {
      const saved = JSON.parse(localStorage.getItem('lim_referral') || 'null');
      if (saved) setReferral(saved);
    } catch (e) {}
    try { setRewards(JSON.parse(localStorage.getItem('lim_rewards') || '[]')); } catch (e) {}
    try { setSpinUsed(localStorage.getItem('lim_spin_used') === '1'); } catch (e) {}
  }, []);

  /* backend cart/favorites — only exist for signed-in users (both routes 401 without
     a token; there's no guest/anonymous cart on this backend). Loaded once right
     after a session resolves; refreshRemoteCart() re-fetches after any mutation
     since the API doesn't document what addToActive/updateQty/etc. return. */
  const refreshRemoteCart = useCallback(async () => {
    try { setRemoteCart(await cartApi.getActive()); } catch (e) { /* leave stale cart on a transient failure */ }
  }, []);
  const loadCartAndFavorites = useCallback(async () => {
    try {
      let c;
      try { c = await cartApi.getActive(); } catch (e) { c = await cartApi.getOrCreateActive(); }
      setRemoteCart(c);
    } catch (e) { setRemoteCart(null); }
    try {
      const favs = await favoritesApi.list();
      setFavorites(Array.isArray(favs) ? favs : favs?.data || []);
    } catch (e) { setFavorites([]); }
  }, []);

  /* real session — resolves who's signed in from a stored JWT.
     lib/api/endpoints.js: authApi.me() (id/username/email/role) + profileApi.get()
     (first_name/last_name/phone/etc.) together make up the real profile.
     Exposed as refreshUser() so a fresh login can populate `user` immediately
     instead of waiting for the next full page load. */
  const refreshUser = useCallback(async () => {
    if (!getToken()) { setUser(null); setRemoteCart(null); setFavorites([]); setAuthLoading(false); return; }
    try {
      const [me, profile] = await Promise.all([authApi.me(), profileApi.get()]);
      setUser({ ...me, ...profile });
      loadCartAndFavorites();
    } catch (e) {
      setUser(null); clearTokens();
    } finally {
      setAuthLoading(false);
    }
  }, [loadCartAndFavorites]);
  useEffect(() => { refreshUser(); }, [refreshUser]);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch (e) {}
    clearTokens();
    setUser(null);
    setRemoteCart(null);
    setFavorites([]);
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
  useEffect(() => { try { localStorage.setItem('lim_cart', JSON.stringify(localCart)); } catch (e) {} }, [localCart]);
  useEffect(() => { try { localStorage.setItem('lim_wish', JSON.stringify(localWish)); } catch (e) {} }, [localWish]);
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

  /* addresses — client-local for now: addressesApi (lib/api/endpoints.js) isn't
     deployed on the backend yet (404s live as of the last check). Swap this for
     real calls once it is. */
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

  /* saved cards — also client-local. savedCardsApi is live, but creating a real
     card needs a payment-gateway tokenization step (card_token) that doesn't
     exist in this app yet — HANDOFF.md is explicit a raw PAN must never reach
     the backend, so this stays local until that gateway is wired in. */
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

  /* cart ops — guests stay fully local; signed-in users hit the real backend and
     re-fetch the active cart afterward rather than trust each endpoint's response
     shape (undocumented in the API spec). Color/storage are UI-only: the backend
     cart has no variant fields, so they're never sent and won't survive a reload
     once signed in. */
  const addToCart = useCallback(async (product, opts = {}, qty = 1) => {
    if (!isAuthenticated) {
      const key = [product.id, opts.color || '', opts.storage || ''].join('|');
      setLocalCart(c => {
        const ex = c.find(i => i.key === key);
        if (ex) return c.map(i => i.key === key ? { ...i, qty: i.qty + qty } : i);
        return [...c, { key, id: product.id, qty, color: opts.color || '', storage: opts.storage || '' }];
      });
      toast(`Added to cart · ${product.name.split(',')[0]}`);
      return;
    }
    try {
      await cartApi.addToActive({ product_id: product.id, quantity: qty });
      await refreshRemoteCart();
      toast(`Added to cart · ${product.name.split(',')[0]}`);
    } catch (e) {
      toast(messageFrom(e), 'error');
    }
  }, [isAuthenticated, toast, refreshRemoteCart]);

  const setQty = useCallback(async (key, qty) => {
    if (!isAuthenticated) {
      setLocalCart(c => qty <= 0 ? c.filter(i => i.key !== key) : c.map(i => i.key === key ? { ...i, qty } : i));
      return;
    }
    try {
      if (qty <= 0) await cartApi.removeItem(remoteCart?.id, key);
      else await cartItemsApi.updateQty(key, qty);
      await refreshRemoteCart();
    } catch (e) {
      toast(messageFrom(e), 'error');
    }
  }, [isAuthenticated, remoteCart, refreshRemoteCart, toast]);

  const removeItem = useCallback(async (key) => {
    if (!isAuthenticated) { setLocalCart(c => c.filter(i => i.key !== key)); return; }
    try {
      await cartApi.removeItem(remoteCart?.id, key);
      await refreshRemoteCart();
    } catch (e) {
      toast(messageFrom(e), 'error');
    }
  }, [isAuthenticated, remoteCart, refreshRemoteCart, toast]);

  const clearCart = useCallback(async () => {
    if (!isAuthenticated) { setLocalCart([]); return; }
    try { if (remoteCart?.id) await cartApi.clear(remoteCart.id); } catch (e) { /* order creation may already have closed this cart */ }
    await refreshRemoteCart();
  }, [isAuthenticated, remoteCart, refreshRemoteCart]);

  /* wishlist — same guest-local / signed-in-real split as cart above.
     favoritesApi.remove takes the favorite record's own id, not the product id,
     so signed-in state has to track that pairing (unlike the plain id array below). */
  const toggleWish = useCallback(async (id) => {
    if (!isAuthenticated) {
      setLocalWish(w => {
        const has = w.includes(id);
        toast(has ? 'Removed from wishlist' : 'Saved to wishlist');
        return has ? w.filter(x => x !== id) : [...w, id];
      });
      return;
    }
    const existing = favorites.find(f => f.product_id === id);
    try {
      if (existing) {
        await favoritesApi.remove(existing.id);
        setFavorites(fs => fs.filter(f => f.id !== existing.id));
        toast('Removed from wishlist');
      } else {
        const created = await favoritesApi.add(id);
        setFavorites(fs => [...fs, created && created.id ? created : { id: Date.now(), product_id: id }]);
        toast('Saved to wishlist');
      }
    } catch (e) {
      toast(messageFrom(e), 'error');
    }
  }, [isAuthenticated, favorites, toast]);

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

  /* remote cart item shape is undocumented in the API spec — checked defensively
     against a couple of plausible field names, and needs live verification once
     /products (and therefore real cart items) actually exist. */
  const remoteCartItems = remoteCart?.items || remoteCart?.cart_items || [];
  const cart = isAuthenticated
    ? remoteCartItems.map(it => ({ key: it.id, id: it.product_id, qty: it.quantity, color: '', storage: '' }))
    : localCart;
  const wish = isAuthenticated ? favorites.map(f => f.product_id) : localWish;

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = isAuthenticated
    ? remoteCartItems.reduce((s, it) => s + Number(it.price ?? it.unit_price ?? it.product?.price ?? 0) * (it.quantity || 0), 0)
    : localCart.reduce((s, i) => s + (byId(i.id)?.price || 0) * i.qty, 0);

  const value = {
    theme, toggleTheme, route, go,
    user, isAuthenticated, authLoading, logout, refreshUser,
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
