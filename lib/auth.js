// Session storage for the backend integration.
// login/verify-email/refresh resolve a TokenPayload: { access_token, token_type,
// expires_in, user }. Auth is pure Bearer JWT — POST /refresh itself requires
// the current (soon-to-expire) access token as its Authorization header and
// returns a new one; there is no separate refresh token or cookie.
const TOKEN_KEY = 'lim_token';
const USER_KEY = 'lim_user';

export function getToken() {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; }
}

export function setToken(token) {
  try { localStorage.setItem(TOKEN_KEY, token); } catch (e) {}
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch (e) { return null; }
}

export function setStoredUser(user) {
  try { localStorage.setItem(USER_KEY, JSON.stringify(user)); } catch (e) {}
}

// Convenience: persist both halves of a TokenPayload after login/signup/refresh.
export function storeSession({ access_token, user } = {}) {
  if (access_token) setToken(access_token);
  if (user) setStoredUser(user);
}

export function clearTokens() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (e) {}
}
