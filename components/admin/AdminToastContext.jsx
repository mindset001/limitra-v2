'use client';
/* Replaces the legacy `window.admToast(msg)` global (set up by admin-app.jsx's AdmToasts
   component and called from all over admin-sections.jsx) with a real React context.
   Visual markup/classes (`.adm-toasts` / `.adm-toast`) are verbatim from legacy/admin-app.jsx. */
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Icon } from '@/components/icons/Icon';

const AdminToastCtx = createContext(null);

export function AdminToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const idRef = useRef(0);

  const addToast = useCallback((msg) => {
    const i = ++idRef.current;
    setItems((x) => [...x, { i, msg }]);
    setTimeout(() => setItems((x) => x.filter((t) => t.i !== i)), 2600);
  }, []);

  return (
    <AdminToastCtx.Provider value={addToast}>
      {children}
      <div className="adm-toasts">
        {items.map((t) => (
          <div className="adm-toast" key={t.i}><Icon name="check" size={15} stroke={3} /> {t.msg}</div>
        ))}
      </div>
    </AdminToastCtx.Provider>
  );
}

export function useAdminToast() {
  const ctx = useContext(AdminToastCtx);
  return ctx || (() => {});
}
