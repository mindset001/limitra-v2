// Typed wrappers around the real Limitra backend, grouped by resource.
// Source of truth: the live OpenAPI spec at https://api.limitra.com.ng/docs?api-docs.json
// (L5 Swagger). Re-fetch and diff that against this file if the backend changes —
// it's the "Limitra User Service API", so more groups (affiliate, admin, etc.)
// likely live in other services and aren't in this spec yet.
import { apiFetch } from './client';
import { storeSession, clearTokens } from '@/lib/auth';

async function withSession(promise) {
  const payload = await promise;
  storeSession(payload);
  return payload;
}

// User.role is one of [user, admin, staff, affiliate].
export const authApi = {
  // 201 -> SuccessResponse only (no token yet — account is inactive until verify-email).
  // `ref` is an optional affiliate referral code query param.
  signup: (data, ref) => apiFetch('/signup', { method: 'POST', body: data, params: { ref }, auth: false }),
  // Resolves a TokenPayload — activates the account and logs it in.
  verifyEmail: (data) => withSession(apiFetch('/verify-email', { method: 'POST', body: data, auth: false })),
  login: (data) => withSession(apiFetch('/login', { method: 'POST', body: data, auth: false })),
  logout: async () => { await apiFetch('/logout', { method: 'POST' }); clearTokens(); },
  // Needs the CURRENT (soon-to-expire) access token as Bearer — not a separate refresh token.
  refresh: () => withSession(apiFetch('/refresh', { method: 'POST' })),
  me: () => apiFetch('/me'),
  forgotPassword: (data) => apiFetch('/forgot-password', { method: 'POST', body: data, auth: false }),
  resetPassword: (data) => apiFetch('/reset-password', { method: 'POST', body: data, auth: false }),
};

// Wallet/ledger accounts (deposit & withdraw) — distinct from user profile.
// create: { user_id*, balance, bonus_balance, currency }. update: { currency, bonus_balance }.
export const accountsApi = {
  list: (params) => apiFetch('/accounts', { params }), // staff/admin; params: { user_id }
  create: (data) => apiFetch('/accounts', { method: 'POST', body: data }), // admin
  get: (accountId) => apiFetch(`/accounts/${accountId}`),
  update: (accountId, data) => apiFetch(`/accounts/${accountId}`, { method: 'PUT', body: data }), // admin
  remove: (accountId) => apiFetch(`/accounts/${accountId}`, { method: 'DELETE' }),
  deposit: (accountId, amount) => apiFetch(`/accounts/${accountId}/deposit`, { method: 'POST', body: { amount } }),
  withdraw: (accountId, amount) => apiFetch(`/accounts/${accountId}/withdraw`, { method: 'POST', body: { amount } }),
};

// create/update: { type*, address_line_1*, address_line_2, city*, landmark, state*, country, postal_code*, is_default }.
export const addressesApi = {
  list: (params) => apiFetch('/addresses', { params }), // params: { type }
  create: (data) => apiFetch('/addresses', { method: 'POST', body: data }),
  get: (addressId) => apiFetch(`/addresses/${addressId}`),
  update: (addressId, data) => apiFetch(`/addresses/${addressId}`, { method: 'PUT', body: data }),
  remove: (addressId) => apiFetch(`/addresses/${addressId}`, { method: 'DELETE' }),
  setDefault: (addressId) => apiFetch(`/addresses/${addressId}/set-default`, { method: 'PATCH' }),
};

// Standalone cart-item resource. add: { cart_id*, product_id*, quantity* }. updateQty: { quantity* }.
export const cartItemsApi = {
  list: (params) => apiFetch('/cart-items', { params }), // params: { cart_id }
  add: (data) => apiFetch('/cart-items', { method: 'POST', body: data }),
  get: (cartItemId) => apiFetch(`/cart-items/${cartItemId}`),
  updateQty: (cartItemId, quantity) => apiFetch(`/cart-items/${cartItemId}`, { method: 'PUT', body: { quantity } }),
  remove: (cartItemId) => apiFetch(`/cart-items/${cartItemId}`, { method: 'DELETE' }),
};

// Cart resource — carts have their own id/status, plus cart-scoped item ops.
// addToActive: { product_id*, quantity* }. updateStatus: { status* }.
export const cartApi = {
  list: (params) => apiFetch('/cart', { params }), // params: { status }
  getOrCreateActive: () => apiFetch('/cart', { method: 'POST' }),
  get: (cartId) => apiFetch(`/cart/${cartId}`),
  updateStatus: (cartId, status) => apiFetch(`/cart/${cartId}`, { method: 'PUT', body: { status } }),
  remove: (cartId) => apiFetch(`/cart/${cartId}`, { method: 'DELETE' }),
  getActive: () => apiFetch('/cart/active'),
  addToActive: (data) => apiFetch('/cart/add', { method: 'POST', body: data }),
  removeItem: (cartId, cartItemId) => apiFetch(`/cart/${cartId}/items/${cartItemId}`, { method: 'DELETE' }),
  clear: (cartId) => apiFetch(`/cart/${cartId}/clear`, { method: 'DELETE' }),
};

// create/update: { name*, description }.
export const categoriesApi = {
  list: () => apiFetch('/categories', { auth: false }), // top-level + subcategories
  create: (data) => apiFetch('/categories', { method: 'POST', body: data }), // admin
  get: (categoryId) => apiFetch(`/categories/${categoryId}`, { auth: false }),
  listSubcategories: (categoryId) => apiFetch(`/categories/${categoryId}/subcategories`, { auth: false }),
  update: (categoryId, data) => apiFetch(`/categories/${categoryId}`, { method: 'PATCH', body: data }), // admin
  remove: (categoryId) => apiFetch(`/categories/${categoryId}`, { method: 'DELETE' }), // admin
};

export const favoritesApi = {
  list: () => apiFetch('/favorites'),
  add: (productId) => apiFetch('/favorites', { method: 'POST', body: { product_id: productId } }),
  get: (favoriteId) => apiFetch(`/favorites/${favoriteId}`),
  remove: (favoriteId) => apiFetch(`/favorites/${favoriteId}`, { method: 'DELETE' }),
};

export const ordersApi = {
  // No request body in the spec — order is derived server-side from the caller's
  // active cart/quote. Idempotency-Key (8-100 chars) is REQUIRED to avoid duplicate
  // orders on retry; generate one per checkout attempt (e.g. crypto.randomUUID()).
  create: (idempotencyKey) => apiFetch('/orders', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
  }),
};

// create: { category_id*, subcategory_id, name*, description, price*, stock*, images }.
export const productsApi = {
  // params: { category_id, subcategory_id, search, price_min, price_max, in_stock, sort_by, sort_dir, per_page }
  list: (params) => apiFetch('/products', { params, auth: false }),
  create: (data) => apiFetch('/products', { method: 'POST', body: data }), // admin
  get: (productId) => apiFetch(`/products/${productId}`, { auth: false }),
  update: (productId, data) => apiFetch(`/products/${productId}`, { method: 'PATCH', body: data }), // admin
  remove: (productId) => apiFetch(`/products/${productId}`, { method: 'DELETE' }), // admin
};

// Separate from the auth User record. update: { first_name, middle_name, last_name,
// avatar, phone, birthday, subscribe_to_newsletter }.
export const profileApi = {
  get: () => apiFetch('/profile'),
  update: (data) => apiFetch('/profile', { method: 'PATCH', body: data }),
};

// save/update: { brand*, last4*, exp_month*, exp_year*, card_token*, is_default }.
// card_token comes from the payment gateway's client-side tokenization — never send a raw PAN.
export const savedCardsApi = {
  list: () => apiFetch('/saved-cards'),
  save: (data) => apiFetch('/saved-cards', { method: 'POST', body: data }),
  get: (savedCardId) => apiFetch(`/saved-cards/${savedCardId}`),
  update: (savedCardId, data) => apiFetch(`/saved-cards/${savedCardId}`, { method: 'PUT', body: data }),
  remove: (savedCardId) => apiFetch(`/saved-cards/${savedCardId}`, { method: 'DELETE' }),
  setDefault: (savedCardId) => apiFetch(`/saved-cards/${savedCardId}/set-default`, { method: 'PATCH' }),
};
