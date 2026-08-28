/* LIMITRA, app shell + router */
function NotReady({ name }) {
  const { go } = useStore();
  const label = name ? '“' + name + '”' : 'This page';
  return <div className="wrap"><EmptyState icon="package" title={label + " isn't available yet"} body="This part of Limitra is coming soon. Explore the rest of the store in the meantime." action="Back to home" onAction={() => go('home')} /></div>;
}

function Router() {
  const { route } = useStore();
  const [name, ...params] = [route.name, ...route.params];
  const P = window;
  switch (name) {
    case 'home':     return <P.HomePage />;
    case 'shop':     return <P.ShopPage cat={params[0] || 'all'} sub={params[1]} />;
    case 'search':   return <P.SearchPage q={params[0]} />;
    case 'product':  return <P.ProductPage id={params[0]} />;
    case 'cart':     return <P.CartPage />;
    case 'checkout': return <P.CheckoutPage />;
    case 'account':  return <P.AccountPage tab={params[0]} />;
    case 'orders':   return <P.AccountPage tab="orders" />;
    case 'wishlist': return <P.WishlistPage />;
    case 'tracking': return <P.TrackingPage id={params[0]} />;
    case 'auth':     return <P.AuthPage mode={params[0] || 'signin'} />;
    case 'help':     return <P.HelpPage section={params[0]} />;
    case 'affiliate': return <P.AffiliatePage />;
    case 'careers':  return <P.CareersPage />;
    case 'channels': return <P.ChannelsPage />;
    case 'about':    return <P.AboutPage />;
    case 'videos':   return <P.VideosPage />;
    case 'home':     return <P.HomePage />;
    default:         return <NotReady name={route.name} />;
  }
}

function App() {
  const { route } = useStore();
  const isAuth = route.name === 'auth';
  return (
    <>
      <Header />
      <main className="app-main" key={isAuth ? 'home' : route.name + route.params.join('/')}>
        {isAuth ? <HomePage /> : <Router />}
      </main>
      <Footer />
      <MobileBottomNav />
      {route.name === 'home' && <EloAI />}
      {isAuth && <Router />}
      <SpinGate />
      <Toasts />
    </>
  );
}

/* shows the Spin & Win wheel once after a fresh signup, if not already used */
function SpinGate() {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    const onSignup = () => { try { localStorage.setItem('lim_spin_used', '0'); } catch (e) {} setShow(true); };
    window.addEventListener('lim:signup', onSignup);
    return () => window.removeEventListener('lim:signup', onSignup);
  }, []);
  if (!show) return null;
  return <window.SpinWheel onClose={() => setShow(false)} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <StoreProvider>
    <LimTweaksProvider>
      <App />
      <LimTweaksPanel />
    </LimTweaksProvider>
  </StoreProvider>
);

requestAnimationFrame(() => { const s = document.getElementById('lim-splash'); if (s) { s.style.transition = 'opacity .35s ease'; s.style.opacity = '0'; setTimeout(() => s.remove(), 400); } });
