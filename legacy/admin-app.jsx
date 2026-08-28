/* LIMITRA Admin, app shell (sidebar, topbar, router) */
const { useState: useShlState, useEffect: useShlEffect } = React;

function AdminShell() {
  /* route guard, super admin only */
  useShlEffect(() => {
    let adm = null;
    try { adm = JSON.parse(localStorage.getItem('lim_admin') || 'null'); } catch (e) {}
    if (!adm) { window.location.replace('access-denied.html?need=admin'); }
  }, []);
  const [page, setPage] = useShlState(() => (location.hash.replace('#/', '') || 'dashboard'));
  const [collapsed, setCollapsed] = useShlState(false);
  const [mobOpen, setMobOpen] = useShlState(false);
  const [theme, setTheme] = useShlState(() => localStorage.getItem('lim_theme') || 'light');
  const [notifOpen, setNotifOpen] = useShlState(false);
  const notifRef = React.useRef(null);
  useShlEffect(() => {
    if (!notifOpen) return;
    const onDoc = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setNotifOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [notifOpen]);
  const [admin] = useShlState(() => { try { return JSON.parse(localStorage.getItem('lim_admin') || 'null'); } catch (e) { return null; } });
  const [acctOpen, setAcctOpen] = useShlState(false);
  const adm = admin || { name: 'Super Admin', role: 'Super Admin', initials: 'SA', email: 'adefioyeemman@gmail.com' };
  const [notifs, setNotifs] = useShlState([
    { ic: 'truck', tint: 'info', title: 'New order LMT-92481', body: '₦641,000 · 2 items, needs processing', time: '5 min ago', read: false, go: 'orders', match: 'LMT-92481' },
    { ic: 'package', tint: 'warn', title: 'Low stock alert', body: 'Aura Pro ANC Headphones, 4 left', time: '40 min ago', read: false, go: 'inventory', match: 'Aura Pro' },
    { ic: 'share', tint: 'ok', title: 'New affiliate application', body: 'Tunde A. applied to the program', time: '2 hrs ago', read: false, go: 'affiliates', match: 'Tunde A.' },
    { ic: 'gift', tint: 'accent', title: 'Coupon redeemed', body: 'WELCOME10_42 used at checkout', time: '3 hrs ago', read: true, go: 'spin' },
    { ic: 'dollar', tint: 'ok', title: 'Referral completed', body: 'Chidinma O., ₦7,000 Lim Cash issued', time: 'Yesterday', read: true, go: 'referrals', match: 'Chidinma' },
  ]);
  const unread = notifs.filter(n => !n.read).length;

  useShlEffect(() => { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('lim_theme', theme); }, [theme]);

  useShlEffect(() => {
    const hl = window.__admHL;
    if (!hl || hl.page !== page) return;
    let tries = 0;
    const run = () => {
      const rows = document.querySelectorAll('.adm-body [data-hlkey]');
      let hit = null;
      rows.forEach(r => { if (!hit && (r.getAttribute('data-hlkey') || '').toLowerCase().includes(hl.match.toLowerCase())) hit = r; });
      if (hit) {
        hit.classList.add('row-flash');
        try { hit.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {}
        setTimeout(() => hit.classList.remove('row-flash'), 2600);
        window.__admHL = null;
      } else if (tries++ < 8) { setTimeout(run, 120); }
    };
    const id = setTimeout(run, 160);
    return () => clearTimeout(id);
  }, [page]);
  useShlEffect(() => { location.hash = '/' + page; setMobOpen(false); }, [page]);

  const PAGES = {
    dashboard: window.AdminOverview, analytics: window.AdminAnalytics, products: window.AdminProducts,
    inventory: window.AdminInventory, orders: window.AdminOrders, coupons: window.AdminCoupons,
    customers: window.AdminCustomers, affiliates: window.AdminAffiliates, referrals: window.AdminReferrals,
    spin: window.AdminSpin, videos: window.AdminVideos, elo: window.AdminElo,
    cms: window.AdminCMS, roles: window.AdminRoles, reports: window.AdminReports, activity: window.AdminActivity,
  };
  const Page = PAGES[page] || window.AdminOverview;
  const counts = { orders: window.ADMIN_ORDERS.filter(o => o.status === 'Pending').length, affiliates: 1 };

  return (
    <div className={'adm' + (collapsed ? ' collapsed' : '') + (mobOpen ? ' mobopen' : '')}>
      {mobOpen && <div className="adm-scrim" onClick={() => setMobOpen(false)} />}
      <aside className="adm-side">
        <div className="adm-brand">
          <img src="assets/logo.png" alt="Limitra" />
          <span className="adm-badge">Admin</span>
          <button className="adm-collapse-btn" onClick={() => setCollapsed(c => !c)} aria-label="Collapse sidebar" title="Collapse sidebar"><Icon name="chevleft" size={17} /></button>
        </div>
        <nav className="adm-nav">
          {window.ADMIN_NAV.map(([grp, items]) => (
            <React.Fragment key={grp}>
              <div className="adm-nav-grp">{grp}</div>
              {items.map(([key, label, ic]) => (
                <button key={key} className={'adm-link' + (page === key ? ' on' : '')} onClick={() => setPage(key)} title={label}>
                  <Icon name={ic} size={18} /><span>{label}</span>
                  {counts[key] ? <span className="adm-count">{counts[key]}</span> : null}
                </button>
              ))}
            </React.Fragment>
          ))}
        </nav>
      </aside>

      <div className="adm-main">
        <div className="adm-top">
          <button className="adm-burger" onClick={() => { if (window.matchMedia('(max-width: 860px)').matches) setMobOpen(o => !o); else setCollapsed(c => !c); }} aria-label="Toggle menu"><Icon name="menu" size={20} /></button>
          <div className="adm-top-actions">
            <a className="adm-icon-btn" href="index.html" title="View store"><Icon name="store" size={19} /></a>
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
                        <button key={i} className={'adm-notif-item' + (nf.read ? '' : ' unread')} onClick={() => { setNotifs(ns => ns.map((x, j) => j === i ? { ...x, read: true } : x)); if (nf.go) { if (nf.match) { window.__admHL = { page: nf.go, match: nf.match, ts: Date.now() }; } setPage(nf.go); } setNotifOpen(false); }}>
                          <span className={'adm-notif-ic ' + nf.tint}><Icon name={nf.ic} size={15} /></span>
                          <div className="adm-notif-txt"><b>{nf.title}</b><small>{nf.body}</small><span className="adm-notif-time">{nf.time}</span></div>
                          {!nf.read && <span className="adm-notif-unread" />}
                        </button>
                      ))}
                    </div>
                    <div className="adm-notif-f"><a onClick={() => { setNotifOpen(false); setPage('activity'); }} style={{ cursor: 'pointer' }}>View all activity</a></div>
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
                    <button className="adm-acct-item" onClick={() => { setPage('roles'); setAcctOpen(false); }}><Icon name="lock" size={16} /> Roles &amp; access</button>
                    <button className="adm-acct-item" onClick={() => { setPage('cms'); setAcctOpen(false); }}><Icon name="edit" size={16} /> Website settings</button>
                    <button className="adm-acct-item danger" onClick={() => { try { localStorage.removeItem('lim_admin'); } catch (e) {} window.location.href = 'index.html'; }}><Icon name="lock" size={16} /> Sign out</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="adm-body" data-page={page} onClick={(e) => { const go = e.target.closest('[data-go]'); if (go) setPage(go.getAttribute('data-go')); }}>
          <Page />
        </div>
      </div>
      <AdmToasts />
    </div>
  );
}

function AdmToasts() {
  const [items, setItems] = useShlState([]);
  useShlEffect(() => {
    let id = 0;
    window.admToast = (msg) => { const i = ++id; setItems(x => [...x, { i, msg }]); setTimeout(() => setItems(x => x.filter(t => t.i !== i)), 2600); };
  }, []);
  return <div className="adm-toasts">{items.map(t => <div className="adm-toast" key={t.i}><Icon name="check" size={15} stroke={3} /> {t.msg}</div>)}</div>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<AdminShell />);
