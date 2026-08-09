/* LIMITRA chrome, header, mega menu, mini-cart, footer, mobile nav */
const NAV = [
{ slug: 'new', name: 'New Arrivals' },
{ slug: 'phones', name: 'Phones' },
{ slug: 'fashion', name: 'Fashion' },
{ slug: 'beauty', name: 'Beauty' },
{ slug: 'electronics', name: 'Electronics' },
{ slug: 'home', name: 'Home Essentials' }];

const ALL_SUBCATS = window.LIMITRA && window.LIMITRA.SUBCATS || {};
// nav dropdowns show a trimmed subset (first 8); full lists live on category/banner pages
const SUBCATS = Object.fromEntries(Object.entries(ALL_SUBCATS).map(([k, v]) => [k, v.slice(0, 8)]));

const SUBCAT_SECTIONS = {
  fashion: [
  { title: 'Women', slug: 'womens', items: (ALL_SUBCATS.womens || []).slice(0, 7) },
  { title: 'Men', slug: 'mens', items: (ALL_SUBCATS.mens || []).slice(0, 7) }]

};

const subSlugify = (s) => s.toLowerCase().replace(/[’'`]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const SUBCAT_INDEX = {};
Object.entries(ALL_SUBCATS).forEach(([parent, items]) => items.forEach((it) => {SUBCAT_INDEX[parent + '/' + subSlugify(it)] = { label: it, parent };}));
window.SUBCAT_INDEX = SUBCAT_INDEX;
window.subSlugify = subSlugify;

const CAT_ICON = { phones: 'phone', computing: 'grid', electronics: 'spark', audio: 'headset', home: 'store', gaming: 'spark', wearables: 'clock', cameras: 'eye', accessories: 'tag', hair: 'hair', beauty: 'makeup', fashion: 'shirt', mens: 'shirt', womens: 'shirt', fragrance: 'spark', kids: 'gift', auto: 'truck', sports: 'spark', pets: 'heart', adult: 'heart', shoes: 'tag' };

function NavCategory({ n, active, go, onEnterClose, className }) {
  const [open, setOpen] = useState(false);
  const sections = SUBCAT_SECTIONS[n.slug];
  const subs = SUBCATS[n.slug] || [];
  const hasMenu = sections || subs.length > 0;
  const dealSlug = sections ? sections[0].slug : n.slug;
  const deal = (L.byCat(dealSlug) || []).
  filter((p) => p.was && p.was > p.price).
  sort((a, b) => (b.was - b.price) / b.was - (a.was - a.price) / a.was)[0];
  const dealPct = deal ? Math.round((1 - deal.price / deal.was) * 100) : 0;
  return (
    <div className={'nav-cat' + (className ? ' ' + className : '')} onMouseEnter={() => {setOpen(true);onEnterClose();}} onMouseLeave={() => setOpen(false)}>
      <a className={'nav-link' + (active ? ' active' : '')} onClick={() => {setOpen(false);go('shop', n.slug);}}>
        {n.name}{hasMenu && <Icon name="chevdown" size={13} className="nav-cat-chev" />}
      </a>
      {hasMenu && open &&
      <div className={'nav-sub' + (deal ? ' has-deal' : '') + (sections ? ' sectioned' : '')}>
          {sections ?
        <div className="nav-sub-list nav-sub-cols">
              {sections.map((sec) =>
          <div className="nav-sub-col" key={sec.slug}>
                  <div className="nav-sub-head"><Icon name={CAT_ICON[sec.slug] || 'shirt'} size={15} /> {sec.title}</div>
                  {sec.items.map((s) =>
            <button key={s} className="nav-sub-link" onClick={() => {setOpen(false);go('shop', sec.slug, subSlugify(s));}}>{s}</button>
            )}
                  <button className="nav-sub-all" onClick={() => {setOpen(false);go('shop', sec.slug);}}>Shop all {sec.title} <Icon name="arrowr" size={14} /></button>
                </div>
          )}
            </div> :

        <div className="nav-sub-list">
              <div className="nav-sub-head"><Icon name={CAT_ICON[n.slug] || 'grid'} size={15} /> {n.name}</div>
              {subs.map((s) =>
          <button key={s} className="nav-sub-link" onClick={() => {setOpen(false);go('shop', n.slug, subSlugify(s));}}>{s}</button>
          )}
              <button className="nav-sub-all" onClick={() => {setOpen(false);go('shop', n.slug);}}>Shop all {n.name} <Icon name="arrowr" size={14} /></button>
            </div>
        }
          {deal &&
        <button className="nav-sub-deal" onClick={() => {setOpen(false);go('product', deal.id);}}>
              <span className="nsd-label"><Icon name="flame" size={12} fill="currentColor" /> Featured sale</span>
              <span className="nsd-thumb"><Thumb product={deal} src={REAL_IMG[deal.id]} /><span className="nsd-badge">-{dealPct}%</span></span>
              <span className="nsd-name">{deal.name}</span>
              <span className="nsd-price"><b>{naira(deal.price)}</b><s>{naira(deal.was)}</s></span>
              <span className="nsd-cta">Shop deal <Icon name="arrowr" size={13} /></span>
            </button>
        }
        </div>
      }
    </div>);

}

function ThemeToggle({ compact }) {
  const { theme, toggleTheme } = useStore();
  return (
    <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle dark mode">
      <span className="tt-knob" data-on={theme === 'dark'}>
        <Icon name={theme === 'dark' ? 'moon' : 'sun'} size={15} />
      </span>
    </button>);

}

function SearchBody({ v, setV, close, go, setQuery, searchHistory, addSearch, clearSearch }) {
  const q = v.trim().toLowerCase();
  const results = q ? L.PRODUCTS.filter((p) => (p.name + ' ' + p.brand + ' ' + p.category).toLowerCase().includes(q)).slice(0, 6) : [];
  const catMatches = q ? L.CATEGORIES.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 4) : [];
  const recommended = L.PRODUCTS.filter((p) => p.bestseller).slice(0, 4);
  const trending = ['Apex 14 Pro', 'wireless earbuds', 'gaming laptop', 'smart bulb', 'power bank'];
  const submit = (term) => {const t = (term ?? v).trim();if (!t) return;addSearch(t);setQuery(t);close();go('search', encodeURIComponent(t));};
  const openProduct = (id) => {close();go('product', id);};
  return (
    <div className="sm-body">
      {!q &&
      <>
          <div className="sm-sec">
            <div className="sm-sec-head"><span>Recent searches</span>{searchHistory.length > 0 && <button className="link-btn" onClick={clearSearch}>Clear all</button>}</div>
            {searchHistory.length > 0 ?
          <div className="sm-chips">{searchHistory.map((h) => <button key={h} className="sm-chip" onClick={() => submit(h)}><Icon name="clock" size={14} /> {h}</button>)}</div> :
          <div className="sm-chips">{trending.map((h) => <button key={h} className="sm-chip" onClick={() => submit(h)}><Icon name="search" size={13} /> {h}</button>)}</div>}
          </div>
          <div className="sm-sec">
            <div className="sm-sec-head"><span>Recommended for you</span><button className="link-btn" onClick={() => {close();go('shop', 'all');}}>Browse all</button></div>
            <div className="sm-rec">
              {recommended.map((p) =>
            <button key={p.id} className="sm-rec-item" onClick={() => openProduct(p.id)}>
                  <div className="sm-rec-thumb"><Thumb product={p} src={REAL_IMG[p.id]} /></div>
                  <div className="sm-rec-info"><b>{p.name}</b><span>{naira(p.price)}</span></div>
                </button>
            )}
            </div>
          </div>
        </>
      }
      {q &&
      <>
          {catMatches.length > 0 &&
        <div className="sm-sec">
              <div className="sm-sec-head"><span>Categories</span></div>
              <div className="sm-chips">{catMatches.map((c) => <button key={c.slug} className="sm-chip" onClick={() => {addSearch(c.name);close();go('shop', c.slug);}}><Icon name={CAT_ICON[c.slug] || 'grid'} size={14} /> {c.name}</button>)}</div>
            </div>
        }
          <div className="sm-sec">
            <div className="sm-sec-head"><span>{results.length ? 'Products' : 'No matches'}</span>{results.length > 0 && <button className="link-btn" onClick={() => submit()}>See all results</button>}</div>
            {results.length === 0 ?
          <p className="muted" style={{ padding: '10px 2px' }}>No products match “{v}”. Try another term or browse categories.</p> :

          <div className="sm-results">
                  {results.map((p) =>
            <button key={p.id} className="sm-result" onClick={() => openProduct(p.id)}>
                      <div className="sm-result-thumb"><Thumb product={p} src={REAL_IMG[p.id]} /></div>
                      <div className="sm-result-info"><b>{p.name}</b><small className="muted">{p.brand} · {(L.CATEGORIES.find((c) => c.slug === p.category) || {}).name}</small></div>
                      <span className="sm-result-price">{naira(p.price)}</span>
                    </button>
            )}
                </div>
          }
          </div>
        </>
      }
    </div>);

}

function SearchBar() {
  const { go, setQuery, searchHistory, addSearch, clearSearch } = useStore();
  const [v, setV] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); inputRef.current && inputRef.current.blur(); } };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); window.removeEventListener('keydown', onKey); };
  }, [open]);
  const close = () => { setOpen(false); setV(''); };
  const submit = (e) => { e && e.preventDefault(); const t = v.trim(); if (!t) return; addSearch(t); setQuery(t); close(); go('search', encodeURIComponent(t)); };
  return (
    <div className="search-wrap" ref={wrapRef}>
      <form className={'searchbar' + (open ? ' active' : '')} onSubmit={submit}>
        <Icon name="search" size={19} className="sb-ic" />
        <input ref={inputRef} className="sb-input" placeholder="Search for products, brands and categories…"
        value={v} onChange={(e) => { setV(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} />
        {v && <button type="button" className="sb-clear" onClick={() => { setV(''); inputRef.current && inputRef.current.focus(); }} aria-label="Clear"><Icon name="close" size={16} /></button>}
        <button type="submit" className="sb-btn">Search</button>
      </form>
      {open &&
      <div className="search-drop">
          <SearchBody v={v} setV={setV} close={close} go={go} setQuery={setQuery} searchHistory={searchHistory} addSearch={addSearch} clearSearch={clearSearch} />
        </div>
      }
    </div>);

}

function SearchModal({ open, onClose }) {
  const { go, setQuery, searchHistory, addSearch, clearSearch } = useStore();
  const [v, setV] = useState('');
  const inputRef = useRef(null);
  useEffect(() => {
    if (open) {setV('');const t = setTimeout(() => inputRef.current && inputRef.current.focus(), 60);return () => clearTimeout(t);}
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {if (e.key === 'Escape') onClose();};
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {window.removeEventListener('keydown', onKey);document.body.style.overflow = '';};
  }, [open, onClose]);
  if (!open) return null;
  const close = () => { onClose(); setV(''); };
  const submit = (e) => { e && e.preventDefault(); const t = v.trim(); if (!t) return; addSearch(t); setQuery(t); close(); go('search', encodeURIComponent(t)); };
  return (
    <div className="search-modal-overlay" onMouseDown={onClose}>
      <div className="search-modal" onMouseDown={(e) => e.stopPropagation()}>
        <form className="sm-head" onSubmit={submit}>
          <Icon name="search" size={20} className="muted" />
          <input ref={inputRef} className="sm-input" placeholder="Search products, brands, categories…" value={v} onChange={(e) => setV(e.target.value)} />
          {v && <button type="button" className="sm-clear" onClick={() => {setV('');inputRef.current && inputRef.current.focus();}} aria-label="Clear"><Icon name="close" size={16} /></button>}
          <button type="button" className="sm-esc" onClick={onClose} aria-label="Close"><span className="sm-esc-text">Esc</span><span className="sm-esc-icon"><Icon name="close" size={18} /></span></button>
        </form>
        <SearchBody v={v} setV={setV} close={close} go={go} setQuery={setQuery} searchHistory={searchHistory} addSearch={addSearch} clearSearch={clearSearch} />
      </div>
    </div>);

}

function MegaMenu({ onClose }) {
  const { go } = useStore();
  return (
    <div className="mega" onMouseLeave={onClose}>
      <div className="mega-grid">
        {L.CATEGORIES.map((c) =>
        <a key={c.slug} className="mega-cat" onClick={() => {go('shop', c.slug);onClose();}}>
            <span className="mega-ic"><Icon name={CAT_ICON[c.slug]} size={20} /></span>
            <span>
              <strong>{c.name}</strong>
              <small>{c.count.toLocaleString()} items</small>
            </span>
          </a>
        )}
      </div>
      <div className="mega-promo" onClick={() => {go('shop', 'deals');onClose();}}>
        <span className="badge badge-sale" style={{ alignSelf: 'flex-start' }}>Flash Deals</span>
        <h4>Up to 40% off<br />trending tech</h4>
        <span className="row" style={{ gap: 6, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>Shop now <Icon name="arrowr" size={14} /></span>
      </div>
    </div>);

}

function MiniCart({ open, onClose }) {
  const { cart, setQty, cartTotal, cartCount, go } = useStore();
  return (
    <>
      <div className={'scrim' + (open ? ' on' : '')} onClick={onClose} />
      <aside className={'drawer right' + (open ? ' on' : '')} aria-hidden={!open}>
        <div className="drawer-head">
          <h3>Your Cart <span className="muted" style={{ fontWeight: 600, fontSize: 15 }}>({cartCount})</span></h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" size={18} /></button>
        </div>
        {cart.length === 0 ?
        <EmptyState icon="cart" title="Your cart is empty" body="Browse the store and add something you love." action="Start shopping" onAction={() => {onClose();go('shop', 'all');}} /> :

        <>
            <div className="drawer-body">
              {cart.map((it) => {
              const p = L.byId(it.id);
              return (
                <div className="mini-item" key={it.key}>
                    <div className="mini-thumb"><Thumb product={p} src={REAL_IMG[p.id]} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="mini-name">{p.name}</div>
                      <div className="muted" style={{ fontSize: 12, fontFamily: 'var(--font-display)' }}>{[it.color, it.storage].filter(Boolean).join(' · ')}</div>
                      <div className="row between" style={{ marginTop: 8 }}>
                        <QtyStepper size="sm" value={it.qty} onChange={(q) => setQty(it.key, q)} />
                        <strong style={{ fontFamily: 'var(--font-display)', fontSize: 15 }}>{naira(p.price * it.qty)}</strong>
                      </div>
                    </div>
                  </div>);

            })}
            </div>
            <div className="drawer-foot">
              <div className="row between" style={{ marginBottom: 14 }}>
                <span className="muted" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Subtotal</span>
                <strong style={{ fontFamily: 'var(--font-display)', fontSize: 21 }}>{naira(cartTotal)}</strong>
              </div>
              <button className="btn btn-primary btn-block btn-lg" onClick={() => {onClose();go('checkout');}}>Checkout</button>
              <button className="btn btn-ghost btn-block" style={{ marginTop: 10 }} onClick={() => {onClose();go('cart');}}>View cart</button>
            </div>
          </>
        }
      </aside>
    </>);

}

function MobileMenu({ open, onClose }) {
  const { go, theme, toggleTheme } = useStore();
  const nav = (n, ...p) => {onClose();go(n, ...p);};
  return (
    <>
      <div className={'scrim' + (open ? ' on' : '')} onClick={onClose} />
      <aside className={'drawer left' + (open ? ' on' : '')}>
        <div className="drawer-head">
          <span className="row" style={{ gap: 9 }}><Logo height={30} /></span>
          <button className="icon-btn" onClick={onClose}><Icon name="close" size={18} /></button>
        </div>
        <div className="drawer-body">
          <div className="mm-sec">Shop by category</div>
          {L.CATEGORIES.map((c) =>
          <a key={c.slug} className="mm-link" onClick={() => nav('shop', c.slug)}>
              <span className="row" style={{ gap: 12 }}><Icon name={CAT_ICON[c.slug]} size={18} />{c.name}</span>
              <Icon name="chevright" size={16} style={{ color: 'var(--text-faint)' }} />
            </a>
          )}
          <div className="mm-sec">Account</div>
          <a className="mm-link" onClick={() => nav('account')}><span className="row" style={{ gap: 12 }}><Icon name="user" size={18} />My account</span><Icon name="chevright" size={16} /></a>
          <a className="mm-link" onClick={() => nav('orders')}><span className="row" style={{ gap: 12 }}><Icon name="package" size={18} />Orders</span><Icon name="chevright" size={16} /></a>
          <a className="mm-link" onClick={() => nav('wishlist')}><span className="row" style={{ gap: 12 }}><Icon name="heart" size={18} />Wishlist</span><Icon name="chevright" size={16} /></a>
          <a className="mm-link" onClick={() => nav('auth', 'signin')}><span className="row" style={{ gap: 12 }}><Icon name="lock" size={18} />Sign in</span><Icon name="chevright" size={16} /></a>
          <div className="mm-sec">Preferences</div>
          <button className="mm-link mm-theme" onClick={toggleTheme}>
            <span className="row" style={{ gap: 12 }}><Icon name={theme === 'dark' ? 'moon' : 'sun'} size={18} />Dark mode</span>
            <span className="theme-toggle dark"><span className="tt-knob" data-on={theme === 'dark'}><Icon name={theme === 'dark' ? 'moon' : 'sun'} size={13} /></span></span>
          </button>
        </div>
      </aside>
    </>);

}

function Header() {
  const { go, cartCount, cartTotal, wish, route, theme, toggleTheme } = useStore();
  const [mega, setMega] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobOpen, setMobOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', f);return () => window.removeEventListener('scroll', f);
  }, []);

  return (
    <header className={'site-head' + (scrolled ? ' scrolled' : '')}>
      <div className="util-bar">
        <div className="wrap row between" style={{ height: '100%' }}>
          <span className="row" style={{ gap: 8 }}><Icon name="truck" size={15} /> Free Delivery <b>Nationwide</b></span>
          <div className="row" style={{ gap: 20 }}>
            <a onClick={() => go('affiliate')} style={{ cursor: 'pointer' }}>Become an Affiliate</a>
            <a onClick={() => go('help')} style={{ cursor: 'pointer' }}>Help Center</a>
            <a onClick={() => go('tracking')} style={{ cursor: 'pointer' }}>Track Order</a>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="main-bar">
        <div className="wrap row" style={{ gap: 22, height: '100%' }}>
          <button className="hamb" onClick={() => setMobOpen(true)} aria-label="Menu"><Icon name="menu" size={24} /></button>
          <a className="brand" onClick={() => { go('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <Logo height={34} />
          </a>
          <SearchBar />
          <button className="mob-search" onClick={() => setSearchOpen(true)} aria-label="Search"><Icon name="search" size={22} /></button>
          <div className="head-actions row">
            <button className="head-act loc" onClick={() => go('account', 'addresses')}>
              <Icon name="location" size={20} />
              <span className="ha-txt"><small>Deliver to</small><b>Lagos, NG</b></span>
            </button>
            <div className="user-pop-wrap" onMouseLeave={() => setUserOpen(false)}>
              <button className="head-act" onMouseEnter={() => setUserOpen(true)} onClick={() => go('account')}>
                <Icon name="user" size={20} />
                <span className="ha-txt"><small>Account</small><b>Sign in</b></span>
              </button>
              {userOpen &&
              <div className="user-pop">
                  <button className="btn btn-primary btn-block btn-sm" onClick={() => go('auth', 'signin')}>Sign in</button>
                  <p className="muted" style={{ fontSize: 12.5, textAlign: 'center', margin: '8px 0 12px' }}>New here? <a onClick={() => go('auth', 'signup')} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 700 }}>Create account</a></p>
                  {[['user', 'My account', 'account'], ['package', 'My orders', 'orders'], ['heart', 'Wishlist', 'wishlist'], ['pin', 'Track order', 'tracking']].map(([ic, lb, rt]) =>
                <a key={rt} className="pop-link" onClick={() => go(rt)}><Icon name={ic} size={17} />{lb}</a>
                )}
                </div>
              }
            </div>
            <button className="head-act icon-only" onClick={() => go('wishlist')} aria-label="Wishlist">
              <span className="badge-dot">{wish.length > 0 && <i>{wish.length}</i>}<Icon name="heart" size={22} /></span>
            </button>
            <button className="head-act cart-btn" onClick={() => setCartOpen(true)}>
              <span className="badge-dot"><i className="orange">{cartCount}</i><Icon name="cart" size={22} /></span>
              <span className="ha-txt"><small>Cart</small><b>{naira(cartTotal)}</b></span>
            </button>
          </div>
        </div>
      </div>

      <nav className="nav-bar" onMouseLeave={() => setMega(false)}>
        <div className="wrap row" style={{ gap: 4, height: '100%' }}>
          <button className={'nav-all' + (mega ? ' on' : '')} onMouseEnter={() => setMega(true)} onClick={() => setMega((m) => !m)}>
            <Icon name="grid" size={17} /> All Categories <Icon name="chevdown" size={15} />
          </button>
          {NAV.map((n, i) =>
          <NavCategory key={n.slug} n={n} active={route.name === 'shop' && route.params[0] === n.slug} go={go} onEnterClose={() => setMega(false)} className={i >= 3 ? 'nav-collapsible' : ''} />
          )}
          <a className="nav-link nav-collapsible" onClick={() => go('shop', 'all')}>All Products</a>
          <span style={{ flex: 1 }} />
          <a className="nav-link deals" onClick={() => go('shop', 'deals')}><Icon name="flame" size={15} fill="currentColor" /> Deals</a>
          <a className="nav-link" onClick={() => go('videos')}><Icon name="video" size={16} /> Videos</a>
          <a className="nav-link soft" onClick={() => go('help')}><Icon name="headset" size={16} /> Support</a>
        </div>
        {mega && <MegaMenu onClose={() => setMega(false)} />}
      </nav>

      <MiniCart open={cartOpen} onClose={() => setCartOpen(false)} />
      {!window.__STATIC_GALLERY && <MobileMenu open={mobOpen} onClose={() => setMobOpen(false)} />}
      {!window.__STATIC_GALLERY && <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />}
    </header>);

}

function MobileBottomNav() {
  const { go, route, cartCount } = useStore();
  const items = [['home', 'Home', 'home'], ['grid', 'Shop', 'shop'], ['heart', 'Saved', 'wishlist'], ['cart', 'Cart', 'cart'], ['user', 'Account', 'account']];
  const active = route.name;
  return (
    <nav className="mob-bottom">
      {items.map(([ic, lb, rt]) =>
      <button key={rt} className={'mb-item' + (active === rt ? ' on' : '')} onClick={() => go(rt === 'shop' ? 'shop' : rt, rt === 'shop' ? 'all' : undefined)}>
          <span className="mb-ic">
            {rt === 'cart' && cartCount > 0 && <i className="mb-badge">{cartCount}</i>}
            <Icon name={ic === 'home' ? 'store' : ic} size={21} />
          </span>
          {lb}
        </button>
      )}
    </nav>);

}

const SOCIALS = [
['X', 'https://x.com/limitra', 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z'],
['Facebook', 'https://facebook.com/limitra', 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'],
['Instagram', 'https://instagram.com/limitra', 'M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772c-.5.508-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 1.802c-2.67 0-2.986.01-4.04.058-.976.045-1.505.207-1.858.344-.466.182-.8.4-1.15.748-.35.35-.566.684-.748 1.15-.137.353-.3.882-.344 1.857-.048 1.055-.058 1.37-.058 4.041 0 2.67.01 2.986.058 4.04.045.977.207 1.505.344 1.858.182.466.399.8.748 1.15.35.35.684.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058 2.67 0 2.987-.01 4.04-.058.977-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.684.748-1.15.137-.353.3-.881.344-1.857.048-1.055.058-1.37.058-4.041 0-2.67-.01-2.986-.058-4.04-.045-.977-.207-1.505-.344-1.858a3.097 3.097 0 0 0-.748-1.15 3.098 3.098 0 0 0-1.15-.748c-.353-.137-.881-.3-1.857-.344-1.055-.048-1.37-.058-4.041-.058zm0 3.063a5.135 5.135 0 1 1 0 10.27 5.135 5.135 0 0 1 0-10.27zm0 8.468a3.333 3.333 0 1 0 0-6.666 3.333 3.333 0 0 0 0 6.666zm6.538-8.671a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z'],
['WhatsApp', 'https://wa.me/2347000000000', 'M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.871 9.871 0 0 0 1.519 5.26l-.999 3.648 3.78-.99zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01a1.1 1.1 0 0 0-.792.372c-.272.297-1.04 1.016-1.04 2.479s1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z']];


function Footer() {
  const { go, toast } = useStore();
  const cols = [
  ['Shop', [['Phones & Tablets', () => go('shop', 'phones')], ['Computers & Accessories', () => go('shop', 'computing')], ['Electronics', () => go('shop', 'electronics')], ['Women’s Fashion', () => go('shop', 'womens')], ['All deals', () => go('shop', 'deals')]]],
  ['Account', [['My account', () => go('account')], ['Orders', () => go('orders')], ['Wishlist', () => go('wishlist')], ['Track order', () => go('tracking')], ['Sign in', () => go('auth', 'signin')]]],
  ['Support', [['Help center', () => go('help')], ['About us', () => go('about')], ['Videos', () => go('videos')], ['Channels', () => go('channels')], ['Contact us', () => go('help', 'contact')]]],
  ['Earn from Limitra', [['Become an Affiliate', () => go('affiliate')], ['Affiliate dashboard', () => { location.href = 'aff-dashboard.html'; }], ['Careers', () => go('careers')]]]];

  return (
    <footer className="site-foot">
      <div className="foot-cta wrap">
        <div>
          <h3>Get the best of Limitra in your inbox</h3>
          <p className="muted">New drops, price alerts and members-only deals. No spam.</p>
        </div>
        <form className="foot-news" onSubmit={(e) => e.preventDefault()}>
          <input className="input" placeholder="Enter your email address" />
          <button className="btn btn-accent">Subscribe</button>
        </form>
      </div>
      <div className="wrap foot-main">
        <div className="foot-brand">
          <span className="row"><Logo height={38} /></span>
          <p className="muted" style={{ marginTop: 14, maxWidth: 280, textWrap: 'pretty' }}>Nigeria's premium marketplace for verified, authentic products.
Fast nationwide delivery.</p>
          <div className="trust-row">
            <span className="trust"><Icon name="shield" size={16} /> Buyer protection</span>
            <span className="trust"><Icon name="truck" size={16} /> Nationwide delivery</span>
          </div>
          <div className="foot-social">
            {SOCIALS.map(([label, href, path]) => <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className={'soc soc-' + label.toLowerCase()}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={path} /></svg>
              </a>
            )}
          </div>
        </div>
        {cols.map(([t, links]) =>
        <div key={t} className="foot-col">
            <h5>{t}</h5>
            {links.map(([lb, fn]) => <a key={lb} onClick={fn}>{lb}</a>)}
          </div>
        )}
        <div className="foot-col">
          <h5>Stay connected</h5>
          <span className="row" style={{ gap: 8, color: 'var(--text-muted)' }}><Icon name="mail" size={16} /> support@limitra.com.ng</span>
          <span className="row" style={{ gap: 8, color: 'var(--text-muted)', margin: '10px 0' }}><Icon name="phone" size={16} /> +234 700 LIMITRA</span>
          <div className="pay-row">
            <span className="pay"><img src="assets/img/promo-01.png" alt="Verve" /></span>
            <span className="pay txt">VISA</span>
            <span className="pay txt">Mastercard</span>
            <span className="pay txt">Bank Transfer</span>
          </div>
        </div>
      </div>
      <div className="foot-bottom wrap">
        <span>© 2026 Limitra Ltd. All rights reserved.</span>
        <span className="row" style={{ gap: 20 }}><a>Privacy</a><a>Terms</a><a>Cookies</a></span>
      </div>
    </footer>);

}

Object.assign(window, { Header, Footer, MobileBottomNav, ThemeToggle, SearchBar, NAV, CAT_ICON });