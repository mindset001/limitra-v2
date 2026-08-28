/* LIMITRA store, global state + tiny hash router (exposed on window) */
const { createContext, useContext, useState, useEffect, useCallback, useRef } = React;
const L = window.LIMITRA;
const naira = L.naira;

const StoreCtx = createContext(null);
const useStore = () => useContext(StoreCtx);

/* parse "#/route/param" */
function parseHash() {
  const h = (window.location.hash || '#/home').replace(/^#\/?/, '');
  const [name, ...rest] = h.split('/');
  return { name: name || 'home', params: rest };
}

function StoreProvider({ children, initialRoute, seedCart, seedWish }) {
  const staticMode = !!initialRoute;
  const [theme, setTheme] = useState(() => localStorage.getItem('lim_theme') || 'light');
  const [route, setRoute] = useState(() => initialRoute || parseHash());
  const [cart, setCart] = useState(() => staticMode ? (seedCart || []) : JSON.parse(localStorage.getItem('lim_cart') || '[]'));
  const [wish, setWish] = useState(() => staticMode ? (seedWish || ['p9', 'p21', 'p5']) : JSON.parse(localStorage.getItem('lim_wish') || '["p9","p21"]'));
  const [addresses, setAddresses] = useState(() => JSON.parse(localStorage.getItem('lim_addr') || 'null') || L.ADDRESSES);
  const [cards, setCards] = useState(() => JSON.parse(localStorage.getItem('lim_cards') || 'null') || L.CARDS);
  const addressesRef = useRef(addresses); addressesRef.current = addresses;
  const cardsRef = useRef(cards); cardsRef.current = cards;
  const [toasts, setToasts] = useState([]);
  const [query, setQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState(() => JSON.parse(localStorage.getItem('lim_search') || '[]'));
  const [referral, setReferral] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('lim_referral') || 'null');
    // migrate stale demo defaults (old LUCY* codes) to the current default
    if (!saved || /^LUCY/i.test(saved.code || '')) return L.REFERRAL;
    return saved;
  });
  const [rewards, setRewards] = useState(() => JSON.parse(localStorage.getItem('lim_rewards') || '[]'));
  const [promo, setPromo] = useState(null); // applied promo code (in-memory: never auto-applies on reload)
  const [spinUsed, setSpinUsed] = useState(() => localStorage.getItem('lim_spin_used') === '1');
  useEffect(() => {
    const onSignup = () => setSpinUsed(false);
    window.addEventListener('lim:signup', onSignup);
    return () => window.removeEventListener('lim:signup', onSignup);
  }, []);
  const tid = useRef(0);

  /* theme */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lim_theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  /* routing */
  useEffect(() => {
    if (staticMode) return;
    const onHash = () => { setRoute(parseHash()); window.scrollTo({ top: 0 }); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const go = useCallback((name, ...params) => {
    if (staticMode) return;
    window.location.hash = '/' + [name, ...params].filter(x => x !== undefined && x !== '').join('/');
  }, [staticMode]);

  /* persistence */
  useEffect(() => { if (!staticMode) localStorage.setItem('lim_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { if (!staticMode) localStorage.setItem('lim_wish', JSON.stringify(wish)); }, [wish]);
  useEffect(() => { if (!staticMode) localStorage.setItem('lim_addr', JSON.stringify(addresses)); }, [addresses]);
  useEffect(() => { if (!staticMode) localStorage.setItem('lim_cards', JSON.stringify(cards)); }, [cards]);
  useEffect(() => { if (!staticMode) localStorage.setItem('lim_search', JSON.stringify(searchHistory)); }, [searchHistory]);
  useEffect(() => { if (!staticMode) localStorage.setItem('lim_referral', JSON.stringify(referral)); }, [referral]);
  useEffect(() => { if (!staticMode) localStorage.setItem('lim_rewards', JSON.stringify(rewards)); }, [rewards]);
  useEffect(() => { if (!staticMode) localStorage.setItem('lim_spin_used', spinUsed ? '1' : '0'); }, [spinUsed]);

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
  const cartTotal = cart.reduce((s, i) => s + (L.byId(i.id)?.price || 0) * i.qty, 0);

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

const fmt = n => naira(n);
Object.assign(window, { StoreProvider, useStore, fmt, naira });
