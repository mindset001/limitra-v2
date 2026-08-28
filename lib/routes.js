/* Storefront route-name <-> real-path mapping.
   Preserves the legacy `go(name, ...params)` call sites (chrome.jsx, pages-*.jsx) verbatim —
   only the underlying path scheme changes, from `#/name/params` to real Next.js routes. */

const BUILDERS = {
  home: () => '/',
  shop: ([cat, sub]) => '/shop/' + (cat || 'all') + (sub ? '/' + sub : ''),
  search: ([q]) => '/search' + (q ? '?q=' + q : ''),
  product: ([id]) => '/product/' + id,
  cart: () => '/cart',
  checkout: () => '/checkout',
  account: ([tab]) => (tab && tab !== 'dashboard') ? '/account/' + tab : '/account',
  orders: () => '/orders',
  wishlist: () => '/wishlist',
  tracking: ([id]) => '/tracking/' + id,
  auth: ([mode]) => '/auth/' + (mode || 'signin'),
  help: ([section]) => section ? '/help/' + section : '/help',
  affiliate: () => '/affiliate',
  careers: () => '/careers',
  channels: () => '/channels',
  about: () => '/about',
  videos: () => '/videos',
};

export function routeFor(name, params = []) {
  const build = BUILDERS[name];
  return build ? build(params) : '/';
}

/* Inverse of routeFor — used to derive `route: {name, params}` from usePathname()/useSearchParams()
   for components that still read useStore().route (active-nav highlighting, the auth-modal check). */
export function parseRoute(pathname, searchParams) {
  const segs = (pathname || '/').split('/').filter(Boolean);
  if (segs.length === 0) return { name: 'home', params: [] };
  const [first, second] = segs;
  switch (first) {
    case 'shop': return { name: 'shop', params: segs.slice(1) };
    case 'search': return { name: 'search', params: [searchParams?.get('q') || ''] };
    case 'product': return { name: 'product', params: [second] };
    case 'cart': return { name: 'cart', params: [] };
    case 'checkout': return { name: 'checkout', params: [] };
    case 'account': return { name: 'account', params: [second || 'dashboard'] };
    case 'orders': return { name: 'orders', params: [] };
    case 'wishlist': return { name: 'wishlist', params: [] };
    case 'tracking': return { name: 'tracking', params: [second] };
    case 'auth': return { name: 'auth', params: [second || 'signin'] };
    case 'help': return { name: 'help', params: second ? [second] : [] };
    case 'affiliate': return { name: 'affiliate', params: [] };
    case 'careers': return { name: 'careers', params: [] };
    case 'channels': return { name: 'channels', params: [] };
    case 'about': return { name: 'about', params: [] };
    case 'videos': return { name: 'videos', params: [] };
    default: return { name: first, params: segs.slice(1) };
  }
}
