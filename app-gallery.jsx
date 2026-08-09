/* LIMITRA, static gallery: every screen stacked as its own frame (for Figma import) */
window.__STATIC_GALLERY = true;
const GL = window.LIMITRA;

/* router copy (does not depend on app.jsx) */
function GRouter() {
  const { route } = useStore();
  const [name, ...params] = [route.name, ...route.params];
  const P = window;
  switch (name) {
    case 'home':     return <P.HomePage />;
    case 'shop':     return <P.ShopPage cat={params[0] || 'all'} />;
    case 'search':   return <P.SearchPage q={params[0]} />;
    case 'product':  return <P.ProductPage id={params[0]} />;
    case 'cart':     return <P.CartPage />;
    case 'checkout': return <P.CheckoutPage />;
    case 'account':  return <P.AccountPage tab={params[0]} />;
    case 'orders':   return <P.AccountPage tab="orders" />;
    case 'wishlist': return <P.WishlistPage />;
    case 'tracking': return <P.TrackingPage id={params[0]} />;
    case 'auth':     return <P.AuthPage mode={params[0] || 'signin'} />;
    case 'help':     return <P.HelpPage />;
    case 'affiliate': return <P.AffiliatePage />;
    default:         return <P.HomePage />;
  }
}

/* page shell WITHOUT fixed overlays (no Lucy / toasts / bottom-nav) */
function GApp() {
  const { route } = useStore();
  const minimal = route.name === 'auth';
  return (
    <>
      {!minimal && <Header />}
      <main className="app-main">
        <GRouter />
      </main>
      {!minimal && <Footer />}
    </>
  );
}

function Frame({ label, route, seedCart, height }) {
  return (
    <section className="g-frame">
      <div className="g-label"><span className="g-dotmark" />{label}</div>
      <div className="g-canvas" style={height ? { minHeight: height } : null}>
        <StoreProvider initialRoute={route} seedCart={seedCart}>
          <LimTweaksProvider>
            <GApp />
          </LimTweaksProvider>
        </StoreProvider>
      </div>
    </section>
  );
}

function Gallery() {
  const pid = (GL.PRODUCTS[0] || {}).id;
  const oid = (GL.ORDERS[0] || {}).id;
  const seed = GL.PRODUCTS.slice(0, 3).map((p, i) => ({ key: p.id + '||', id: p.id, qty: i === 0 ? 2 : 1, color: '', storage: '' }));

  const screens = [
    ['01 · Homepage', { name: 'home', params: [] }],
    ['02 · Shop, grid & filters', { name: 'shop', params: ['all'] }],
    ['03 · Category', { name: 'shop', params: ['phones'] }],
    ['04 · Product details', { name: 'product', params: [pid] }],
    ['05 · Search results', { name: 'search', params: ['phone'] }],
    ['06 · Cart', { name: 'cart', params: [] }, seed],
    ['07 · Checkout', { name: 'checkout', params: [] }, seed],
    ['08 · Account dashboard', { name: 'account', params: [] }],
    ['09 · Orders', { name: 'orders', params: [] }],
    ['10 · Wishlist', { name: 'wishlist', params: [] }],
    ['11 · Order tracking', { name: 'tracking', params: [oid] }],
    ['12 · Affiliate program', { name: 'affiliate', params: [] }],
    ['13 · Help center', { name: 'help', params: [] }],
    ['14 · Sign in', { name: 'auth', params: ['signin'] }],
    ['15 · Sign up', { name: 'auth', params: ['signup'] }],
  ];

  return (
    <div className="gallery">
      <header className="g-head">
        <span className="row" style={{ gap: 12 }}><Logo height={34} /></span>
        <div><b>Limitra, Full Screen Set</b><span>{screens.length} screens · import into Figma with html.to.design</span></div>
      </header>
      <div className="g-stack">
        {(window.__GALLERY_MAX ? screens.slice(0, window.__GALLERY_MAX) : screens).map(([label, route, seedCart]) => (
          <Frame key={label} label={label} route={route} seedCart={seedCart} />
        ))}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Gallery />);
