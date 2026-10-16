/* Product variant groups (Colour/Storage/etc, each option optionally carrying
   its own price override) have no backend field at all — confirmed: the real
   admin product response (GET /admin/products) never includes one, and
   productsApi.create/update's documented body doesn't accept one either. So an
   admin's variant configuration would otherwise vanish the instant the admin
   list refetches from the server. Persisted here per product id instead, the
   same "no backend field yet" localStorage pattern StoreProvider.jsx already
   uses for addresses/cards/referral/rewards. Survives a refresh in THIS
   browser only — it won't sync across devices or to other admins/customers
   until the backend actually models this. */
const KEY = 'lim_product_variants';

function readAll() {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; }
}

function writeAll(map) {
  try { localStorage.setItem(KEY, JSON.stringify(map)); } catch (e) {}
}

function getVariants(productId) {
  return readAll()[String(productId)] || [];
}

function setVariants(productId, variants) {
  const all = readAll();
  if (variants && variants.length) all[String(productId)] = variants;
  else delete all[String(productId)];
  writeAll(all);
}

// Merges stored variants onto a freshly-fetched product list (both the admin
// list and the public catalog loader call this) — only touches products that
// actually have something stored, leaving everything else untouched.
function applyStoredVariants(products) {
  const all = readAll();
  if (Object.keys(all).length === 0) return products;
  return products.map(p => (all[String(p.id)]?.length ? { ...p, variants: all[String(p.id)] } : p));
}

export { getVariants, setVariants, applyStoredVariants };
