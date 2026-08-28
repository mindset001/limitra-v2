'use client';
/* Admin app shell — ported from legacy/admin-app.jsx's `AdminShell` (sidebar, topbar,
   notifications, account dropdown, theme toggle, mobile collapse). Unlike the legacy version
   this is no longer a `page`/`PAGES` switch that renders `<Page />` itself — routing is real
   now, so `{children}` is the matched /admin/* route. Two mechanisms from the legacy global
   scope were replaced with real primitives (see components/admin/AdminToastContext.jsx and
   components/admin/AdminShared.jsx's `useHighlight`):
     - `window.admToast`            -> AdminToastProvider / useAdminToast()
     - `window.__admHL` (notif nav) -> `?highlight=<match>` query param, read by the
                                        destination page via useSearchParams()
   NOTE: CSS previously lived under legacy/ (per admin.html's <link> tags: styles.css,
   admin.css) but has since been relocated to /styles by another workstream. styles.css is
   already imported globally by the root app/layout.js, so only admin.css is imported here
   (same convention app/affiliate/dashboard/layout.js uses for its own admin.css + extra). */
import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import '@/styles/admin.css';
import { Icon } from '@/components/icons/Icon';
import { ADMIN_NAV, ADMIN_ORDERS } from '@/components/admin/AdminShared';
import { AdminToastProvider } from '@/components/admin/AdminToastContext';

const pathForKey = (key) => '/admin' + (key === 'dashboard' ? '' : '/' + key);

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  /* route guard, super admin only (client-side only — see HANDOFF.md, no real backend yet) */
  useEffect(() => {
    let adm = null;
    try { adm = JSON.parse(localStorage.getItem('lim_admin') || 'null'); } catch (e) {}
    if (!adm) router.replace('/access-denied?need=admin');
  }, [router]);

  const [collapsed, setCollapsed] = useState(false);
  const [mobOpen, setMobOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  useEffect(() => {
    if (!notifOpen) return;
    const onDoc = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setNotifOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [notifOpen]);

  const [admin, setAdmin] = useState(null);
  const [acctOpen, setAcctOpen] = useState(false);
  /* hydrate theme + admin from localStorage once on mount (avoids SSR/client markup mismatch) */
  useEffect(() => {
    try { setTheme(localStorage.getItem('lim_theme') || 'light'); } catch (e) {}
    try { setAdmin(JSON.parse(localStorage.getItem('lim_admin') || 'null')); } catch (e) {}
  }, []);
  const adm = admin || { name: 'Super Admin', role: 'Super Admin', initials: 'SA', email: 'adefioyeemman@gmail.com' };

  const [notifs, setNotifs] = useState([
    { ic: 'truck', tint: 'info', title: 'New order LMT-92481', body: '₦641,000 · 2 items, needs processing', time: '5 min ago', read: false, go: 'orders', match: 'LMT-92481' },
    { ic: 'package', tint: 'warn', title: 'Low stock alert', body: 'Aura Pro ANC Headphones, 4 left', time: '40 min ago', read: false, go: 'inventory', match: 'Aura Pro' },
    { ic: 'share', tint: 'ok', title: 'New affiliate application', body: 'Tunde A. applied to the program', time: '2 hrs ago', read: false, go: 'affiliates', match: 'Tunde A.' },
    { ic: 'gift', tint: 'accent', title: 'Coupon redeemed', body: 'WELCOME10_42 used at checkout', time: '3 hrs ago', read: true, go: 'spin' },
    { ic: 'dollar', tint: 'ok', title: 'Referral completed', body: 'Chidinma O., ₦7,000 Lim Cash issued', time: 'Yesterday', read: true, go: 'referrals', match: 'Chidinma' },
  ]);
  const unread = notifs.filter(n => !n.read).length;

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); try { localStorage.setItem('lim_theme', theme); } catch (e) {} }, [theme]);

  const counts = { orders: ADMIN_ORDERS.filter(o => o.status === 'Pending').length, affiliates: 1 };

  const goTo = (key) => { router.push(pathForKey(key)); setMobOpen(false); };
  const notifClick = (i, nf) => {
    setNotifs(ns => ns.map((x, j) => j === i ? { ...x, read: true } : x));
    if (nf.go) {
      const target = pathForKey(nf.go);
      router.push(nf.match ? target + '?highlight=' + encodeURIComponent(nf.match) : target);
      setMobOpen(false);
    }
    setNotifOpen(false);
  };
  const signOut = () => {
    try { localStorage.removeItem('lim_admin'); } catch (e) {}
    window.location.href = '/';
  };

  return (
    <AdminToastProvider>
      <div className={'adm' + (collapsed ? ' collapsed' : '') + (mobOpen ? ' mobopen' : '')}>
        {mobOpen && <div className="adm-scrim" onClick={() => setMobOpen(false)} />}
        <aside className="adm-side">
          <div className="adm-brand">
            <img src="/assets/logo.png" alt="Limitra" />
            <span className="adm-badge">Admin</span>
            <button className="adm-collapse-btn" onClick={() => setCollapsed(c => !c)} aria-label="Collapse sidebar" title="Collapse sidebar"><Icon name="chevleft" size={17} /></button>
          </div>
          <nav className="adm-nav">
            {ADMIN_NAV.map(([grp, items]) => (
              <div key={grp}>
                <div className="adm-nav-grp">{grp}</div>
                {items.map(([key, label, ic]) => {
                  const on = pathname === pathForKey(key);
                  return (
                    <button key={key} className={'adm-link' + (on ? ' on' : '')} onClick={() => goTo(key)} title={label}>
                      <Icon name={ic} size={18} /><span>{label}</span>
                      {counts[key] ? <span className="adm-count">{counts[key]}</span> : null}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        <div className="adm-main">
          <div className="adm-top">
            <button className="adm-burger" onClick={() => { if (window.matchMedia('(max-width: 860px)').matches) setMobOpen(o => !o); else setCollapsed(c => !c); }} aria-label="Toggle menu"><Icon name="menu" size={20} /></button>
            <div className="adm-top-actions">
              <a className="adm-icon-btn" href="/" title="View store"><Icon name="store" size={19} /></a>
              <button className="adm-icon-btn" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} title="Theme"><Icon name={theme === 'dark' ? 'sun' : 'moon'} size={19} /></button>
              <div className="adm-notif-wrap" ref={notifRef}>
                <button className={'adm-icon-btn' + (notifOpen ? ' on' : '')} onClick={() => setNotifOpen(o => !o)} title="Notifications"><Icon name="bell" size={19} />{unread > 0 && <span className="adm-dot" />}</button>
                {notifOpen && (
                  <>
                    <div className="adm-notif-scrim" onClick={() => setNotifOpen(false)} />
                    <div className="adm-notif" role="menu">
                      <div className="adm-notif-h"><b>Notifications</b><button className="link-btn" onClick={() => setNotifs(ns => ns.map(n => ({ ...n, read: true })))}>Mark all read</button></div>
                      <div className="adm-notif-list">
                        {notifs.map((nf, i) => (
                          <button key={i} className={'adm-notif-item' + (nf.read ? '' : ' unread')} onClick={() => notifClick(i, nf)}>
                            <span className={'adm-notif-ic ' + nf.tint}><Icon name={nf.ic} size={15} /></span>
                            <div className="adm-notif-txt"><b>{nf.title}</b><small>{nf.body}</small><span className="adm-notif-time">{nf.time}</span></div>
                            {!nf.read && <span className="adm-notif-unread" />}
                          </button>
                        ))}
                      </div>
                      <div className="adm-notif-f"><a onClick={() => { setNotifOpen(false); router.push('/admin/activity'); }} style={{ cursor: 'pointer' }}>View all activity</a></div>
                    </div>
                  </>
                )}
              </div>
              <div className="adm-acct-wrap">
                <button className="adm-avatar" onClick={() => setAcctOpen(o => !o)}>{adm.initials}</button>
                {acctOpen && (
                  <>
                    <div className="adm-notif-scrim" onClick={() => setAcctOpen(false)} />
                    <div className="adm-acct" role="menu">
                      <div className="adm-acct-head"><span className="adm-avatar" style={{ width: 42, height: 42 }}>{adm.initials}</span><div><b>{adm.name}</b><small>{adm.email}</small></div></div>
                      <div className="adm-acct-role"><span className="adm-pill info">{adm.role}</span></div>
                      <button className="adm-acct-item" onClick={() => { router.push('/admin/roles'); setAcctOpen(false); }}><Icon name="lock" size={16} /> Roles &amp; access</button>
                      <button className="adm-acct-item" onClick={() => { router.push('/admin/cms'); setAcctOpen(false); }}><Icon name="edit" size={16} /> Website settings</button>
                      <button className="adm-acct-item danger" onClick={signOut}><Icon name="lock" size={16} /> Sign out</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="adm-body" onClick={(e) => { const go = e.target.closest('[data-go]'); if (go) goTo(go.getAttribute('data-go')); }}>
            <Suspense fallback={null}>{children}</Suspense>
          </div>
        </div>
      </div>
    </AdminToastProvider>
  );
}
