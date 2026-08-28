/* LIMITRA, single-screen renderer for static export (one page per file).
   The host HTML sets window.__SCREEN = { route:{name,params}, seedCart?, label }. */
window.__STATIC_GALLERY = true;
const SC = window.__SCREEN || { route: { name: 'home', params: [] } };

function SRouter() {
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

function SApp() {
  const { route } = useStore();
  const minimal = route.name === 'auth';
  return (
    <>
      {!minimal && <Header />}
      <main className="app-main"><SRouter /></main>
      {!minimal && <Footer />}
    </>
  );
}

function Screen() {
  return (
    <div className="screen-page">
      <StoreProvider initialRoute={SC.route} seedCart={SC.seedCart}>
        <LimTweaksProvider>
          <SApp />
        </LimTweaksProvider>
      </StoreProvider>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Screen />);
