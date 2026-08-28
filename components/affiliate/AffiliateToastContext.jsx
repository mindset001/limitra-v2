'use client';
/* Affiliate dashboard toast notifications — replaces legacy/aff-dashboard.jsx's `AffToasts`
   component, which set `window.affToast = (msg) => {...}` in a useEffect for other code in
   the same global scope to call. There's no shared window scope across ES modules, so this
   becomes a React context instead: AffiliateToastProvider renders the toast list (same
   markup/classes as legacy AffToasts) and useAffiliateToast() returns the add-toast function
   that call sites previously reached via `window.affToast && window.affToast(msg)`. */
import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Icon } from '@/components/icons/Icon';

const AffiliateToastCtx = createContext(null);

export function AffiliateToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const id = useRef(0);

  const addToast = useCallback((msg) => {
    const i = ++id.current;
    setItems(x => [...x, { i, msg }]);
    setTimeout(() => setItems(x => x.filter(t => t.i !== i)), 2600);
  }, []);

  return (
    <AffiliateToastCtx.Provider value={addToast}>
      {children}
      <div className="adm-toasts">
        {items.map(t => (
          <div className="adm-toast" key={t.i}><Icon name="check" size={15} stroke={3} /> {t.msg}</div>
        ))}
      </div>
    </AffiliateToastCtx.Provider>
  );
}

/* returns the add-toast function; safe to call even outside the provider (no-op) so a
   component ported verbatim never has to guard the call site the way `window.affToast &&
   window.affToast(...)` used to. */
export function useAffiliateToast() {
  const ctx = useContext(AffiliateToastCtx);
  return ctx || (() => {});
}
