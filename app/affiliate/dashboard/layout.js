'use client';
/* Affiliate dashboard shell — ported from legacy/aff-dashboard.jsx's `AffShell`.
   The legacy `page` useState + `PAGES[page]` switch is gone; {children} is whatever the
   matched route under app/affiliate/dashboard renders for the current URL. Sidebar links and
   the active-state check are built from the same `affPath` helper the page components use for
   their own internal `go(...)` navigation (see components/affiliate/Affiliate.jsx), so both
   stay in sync. */
import { useState, useEffect, Fragment } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Icon } from '@/components/icons/Icon';
import { AFF, FAFF_NAV, fn, affPath } from '@/components/affiliate/Affiliate';
import { AffiliateToastProvider } from '@/components/affiliate/AffiliateToastContext';
// NOTE: these two stylesheets were relocated from legacy/ to styles/ as part of this
// conversion (styles/admin.css, styles/aff-dashboard.css); the affiliate dashboard depends
// on admin's shared .adm-* classes plus its own .aff-* additions on top (see
// legacy/aff-dashboard.html's <link> tags). Update these import paths if the CSS is moved
// again later.
import '@/styles/admin.css';
import '@/styles/aff-dashboard.css';

export default function AffiliateDashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  /* route guard, affiliate (or super admin) only */
  useEffect(() => {
    let aff = null, adm = null;
    try { aff = JSON.parse(localStorage.getItem('lim_affiliate') || 'null'); } catch (e) {}
    try { adm = JSON.parse(localStorage.getItem('lim_admin') || 'null'); } catch (e) {}
    if (!aff && !adm) { router.replace('/access-denied?need=affiliate'); }
  }, [router]);

  const [collapsed, setCollapsed] = useState(false);
  const [mobOpen, setMobOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [acctOpen, setAcctOpen] = useState(false);

  useEffect(() => { try { setTheme(localStorage.getItem('lim_theme') || 'light'); } catch (e) {} }, []);
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); try { localStorage.setItem('lim_theme', theme); } catch (e) {} }, [theme]);
  useEffect(() => { setMobOpen(false); window.scrollTo(0, 0); }, [pathname]);

  const go = (p) => { router.push(affPath(p)); };
  const isActive = (key) => pathname === affPath(key);
  const currentKey = FAFF_NAV.flatMap(([, items]) => items).find(([key]) => isActive(key))?.[0] || 'dashboard';

  const signOut = () => { try { localStorage.removeItem('lim_affiliate'); } catch (e) {} window.location.href = '/'; };

  return (
    <AffiliateToastProvider>
      <div className={'adm' + (collapsed ? ' collapsed' : '') + (mobOpen ? ' mobopen' : '')}>
        {mobOpen && <div className="adm-scrim" onClick={() => setMobOpen(false)} />}
        <aside className="adm-side">
          <div className="adm-brand"><img src="/assets/logo.png" alt="Limitra" /><span className="adm-badge aff">Affiliate</span><button className="adm-collapse-btn" onClick={() => setCollapsed(c => !c)} aria-label="Collapse sidebar" title="Collapse sidebar"><Icon name="chevleft" size={17} /></button></div>
          <nav className="adm-nav">
            {FAFF_NAV.map(([grp, items]) => (
              <Fragment key={grp}>
                <div className="adm-nav-grp">{grp}</div>
                {items.map(([key, label, ic]) => (
                  <button key={key} className={'adm-link' + (isActive(key) ? ' on' : '')} onClick={() => go(key)} title={label}><Icon name={ic} size={18} /><span>{label}</span></button>
                ))}
              </Fragment>
            ))}
          </nav>
        </aside>
        <div className="adm-main">
          <div className="adm-top">
            <button className="adm-burger" onClick={() => { if (window.matchMedia('(max-width: 860px)').matches) setMobOpen(o => !o); else setCollapsed(c => !c); }} aria-label="Toggle menu"><Icon name="menu" size={20} /></button>
            <div className="aff-balance-chip"><Icon name="card" size={15} /> Balance <b>{fn(86400)}</b><button className="aff-bal-wd" onClick={() => go('withdraw')}>Withdraw</button></div>
            <div className="adm-top-actions">
              <a className="adm-icon-btn" href="/" title="View store"><Icon name="store" size={19} /></a>
              <button className="adm-icon-btn" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} title="Theme"><Icon name={theme === 'dark' ? 'sun' : 'moon'} size={19} /></button>
              <div className="adm-acct-wrap">
                <button className="adm-avatar" onClick={() => setAcctOpen(o => !o)}>{AFF.initials}</button>
                {acctOpen && (<>
                  <div className="adm-notif-scrim" onClick={() => setAcctOpen(false)} />
                  <div className="adm-acct" role="menu">
                    <div className="adm-acct-head"><span className="adm-avatar" style={{ width: 42, height: 42 }}>{AFF.initials}</span><div><b>{AFF.name}</b><small>{AFF.email}</small></div></div>
                    <div className="adm-acct-role"><span className="adm-pill info">{AFF.tier} affiliate</span></div>
                    <button className="adm-acct-item" onClick={() => { go('settings'); setAcctOpen(false); }}><Icon name="lock" size={16} /> Profile &amp; settings</button>
                    <button className="adm-acct-item" onClick={() => { go('withdraw'); setAcctOpen(false); }}><Icon name="card" size={16} /> Withdraw earnings</button>
                    <a className="adm-acct-item" href="/"><Icon name="store" size={16} /> Back to store</a>
                    <button className="adm-acct-item danger" onClick={signOut}><Icon name="lock" size={16} /> Sign out</button>
                  </div>
                </>)}
              </div>
            </div>
          </div>
          <div className="adm-body" data-page={currentKey}>{children}</div>
        </div>
      </div>
    </AffiliateToastProvider>
  );
}
