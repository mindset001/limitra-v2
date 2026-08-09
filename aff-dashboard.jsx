/* LIMITRA Affiliate Dashboard, shell + all section pages */
const { useState: useFD, useEffect: useFDE } = React;
const Kpi = window.Kpi, BarChart = window.BarChart, Donut = window.Donut;
const { AFF, aff_link, FAFF_NAV, FREFERRALS, FTXNS, FWITHDRAWALS, FLEADERS, FHead, Pill, CopyField, QR, ShareRow, FSelect, usePager, FPager } = window;

/* ============ OVERVIEW ============ */
function AffOverview({ go }) {
  const [gen, setGen] = useFD(false);
  return (
    <>
      <FHead title={'Welcome back, ' + AFF.name.split(' ')[0]} sub="Here’s how your Limitra partnership is performing.">
        <button className="adm-btn primary" onClick={() => setGen(true)}><FIcon name="plus" size={15} /> Generate a link</button>
      </FHead>
      {gen && <GenLinkModal onClose={() => setGen(false)} />}
      <div className="kpi-grid">
        <Kpi ic="dollar" tint="#1F8A5B" label="Total earnings" val={fn(248500)} delta="18%" up />
        <Kpi ic="clock" tint="#F5A623" label="Pending" val={fn(19240)} delta="6%" up />
        <Kpi ic="card" tint="#0438B6" label="Available balance" val={fn(86400)} delta="" up />
        <Kpi ic="bag" tint="#F67208" label="Referral sales" val={fn(1980000)} delta="12%" up />
      </div>
      <div className="kpi-grid" style={{ marginTop: 14 }}>
        <Kpi ic="eye" tint="#7A5AE0" label="Total clicks" val="1,940" delta="9%" up />
        <Kpi ic="truck" tint="#0438B6" label="Orders" val="312" delta="14%" up />
        <Kpi ic="spark" tint="#1F8A5B" label="Conversion" val="16.1%" delta="1.2%" up />
        <Kpi ic="share" tint="#F67208" label="Active links" val="24" delta="" up />
      </div>
      <div className="adm-row c2">
        <div className="panel"><div className="panel-h"><h3>Earnings over time</h3><span className="adm-pill ok">+18% MoM</span></div>
          <BarChart data={[58, 72, 64, 80, 76, 91, 104, 98]} labels={['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8']} alt /></div>
        <div className="panel"><div className="panel-h"><h3>Traffic sources</h3></div>
          <Donut segments={[{ label: 'Instagram', v: 1180, c: '#F67208' }, { label: 'WhatsApp', v: 520, c: '#1F8A5B' }, { label: 'Direct', v: 240, c: '#0438B6' }]} /></div>
      </div>
      <div className="panel" style={{ padding: 0 }}>
        <div className="panel-h" style={{ padding: '18px 20px 0' }}><h3>Recent referrals</h3><button className="link-btn" onClick={() => go('referrals')}>View all</button></div>
        <div className="adm-table-wrap"><table className="adm-table">
          <thead><tr><th>Referral</th><th>Purchase</th><th>Order value</th><th>Commission</th><th>Status</th></tr></thead>
          <tbody>{FREFERRALS.slice(0, 5).map((r, i) => (
            <tr key={i}><td><div className="adm-prod"><span className="adm-li-av">{r[0].split(' ').map(w => w[0]).join('').slice(0, 2)}</span><b>{r[0]}</b></div></td>
              <td className="muted">{r[2]}</td><td>{r[3] ? fn(r[3]) : ','}</td><td><b>{r[4] ? fn(r[4]) : ','}</b></td><td><Pill s={r[5]} /></td></tr>
          ))}</tbody>
        </table></div>
      </div>
    </>
  );
}

/* ============ PERFORMANCE ============ */
function AffPerformance() {
  const [gran, setGran] = useFD('Weekly');
  const C = { Daily: { d: [12, 18, 14, 22, 19, 25, 21], l: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }, Weekly: { d: [58, 72, 64, 80, 76, 91, 104, 98], l: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'] }, Monthly: { d: [220, 265, 248, 310, 290, 356], l: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] } };
  const top = FL.PRODUCTS.slice(0, 5);
  return (
    <>
      <FHead title="Performance" sub="Track clicks, conversions and revenue you’ve driven." />
      <div className="kpi-grid">
        <Kpi ic="dollar" tint="#1F8A5B" label="Revenue generated" val={fn(1980000)} delta="12%" up />
        <Kpi ic="eye" tint="#7A5AE0" label="Link clicks" val="1,940" delta="9%" up />
        <Kpi ic="user" tint="#0438B6" label="Visitors referred" val="1,612" delta="11%" up />
        <Kpi ic="spark" tint="#F67208" label="Conversion" val="16.1%" delta="1.2%" up />
      </div>
      <div className="panel"><div className="panel-h"><h3>Earnings</h3><div className="seg">{['Daily', 'Weekly', 'Monthly'].map(g => <button key={g} className={gran === g ? 'on' : ''} onClick={() => setGran(g)}>{g}</button>)}</div></div>
        <BarChart key={gran} data={C[gran].d} labels={C[gran].l} alt /></div>
      <div className="panel" style={{ padding: 0 }}>
        <div className="panel-h" style={{ padding: '18px 20px 0' }}><h3>Top performing products</h3></div>
        <div className="adm-table-wrap"><table className="adm-table">
          <thead><tr><th>Product</th><th>Clicks</th><th>Orders</th><th>Revenue</th><th>Commission</th></tr></thead>
          <tbody>{top.map((p, i) => { const clicks = 420 - i * 62, orders = 58 - i * 9; return (
            <tr key={p.id}><td><div className="adm-prod"><span className="adm-prod-thumb"><FThumb product={p} src={FREAL[p.id]} /></span><b>{p.name.split(',')[0]}</b></div></td>
              <td>{clicks}</td><td>{orders}</td><td>{fn(orders * p.price)}</td><td><b>{fn(Math.round(orders * p.price * AFF.rate / 100))}</b></td></tr>
          ); })}</tbody>
        </table></div>
      </div>
    </>
  );
}

/* ============ PROMOTION CENTER ============ */
function AffPromote() {
  const [q, setQ] = useFD('');
  const [sel, setSel] = useFD(null);
  const list = FL.PRODUCTS.filter(p => !q || p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 12);
  return (
    <>
      <FHead title="Promotion Center" sub="Browse products and generate your referral links instantly." />
      <div className="adm-filters"><div className="adm-mini-search"><FIcon name="search" size={16} className="muted" /><input placeholder="Search products to promote…" value={q} onChange={e => setQ(e.target.value)} /></div></div>
      <div className="aff-promo-grid">
        {list.map(p => (
          <div className="aff-promo-card" key={p.id}>
            <div className="aff-promo-thumb"><FThumb product={p} src={FREAL[p.id]} /></div>
            <div className="aff-promo-body">
              <span className="pc-brand" style={{ fontSize: 11 }}>{p.brand}</span>
              <b className="aff-promo-name">{p.name}</b>
              <div className="aff-promo-meta"><span className="aff-promo-price">{fn(p.price)}</span><span className="aff-promo-comm">{AFF.rate}% · {fn(Math.round(p.price * AFF.rate / 100))}</span></div>
              <button className="adm-btn primary block" onClick={() => setSel(p)}><FIcon name="share" size={15} /> Get link</button>
            </div>
          </div>
        ))}
      </div>
      {sel && <LinkModal product={sel} onClose={() => setSel(null)} />}
    </>
  );
}

function GenLinkModal({ onClose }) {
  const [q, setQ] = useFD('');
  const [sel, setSel] = useFD(null);
  useFDE(() => { const k = e => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', k); document.body.style.overflow = 'hidden'; return () => { window.removeEventListener('keydown', k); document.body.style.overflow = ''; }; }, [onClose]);
  if (sel) return <LinkModal product={sel} onClose={onClose} />;
  const list = FL.PRODUCTS.filter(p => !q || p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 8);
  return (
    <div className="role-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="role-modal">
        <div className="role-modal-h">
          <div><h3 style={{ fontSize: 18 }}>Generate a referral link</h3><small className="muted">Pick a product to create your link</small></div>
          <button className="role-modal-x" onClick={onClose}><FIcon name="close" size={18} /></button>
        </div>
        <div className="role-modal-b">
          <div className="gen-pick-search"><FIcon name="search" size={17} /><input autoFocus placeholder="Search products to promote…" value={q} onChange={e => setQ(e.target.value)} /></div>
          <div className="gen-pick-list">
            {list.map(p => (
              <button key={p.id} className="gen-pick" onClick={() => setSel(p)}>
                <span className="adm-prod-thumb"><FThumb product={p} src={FREAL[p.id]} /></span>
                <div className="gen-pick-info"><b>{p.name.split(',')[0]}</b><small className="muted">{fn(p.price)} · {AFF.rate}% commission</small></div>
                <span className="gen-pick-go"><FIcon name="arrowr" size={16} /></span>
              </button>
            ))}
            {list.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-faint)' }}>No products match “{q}”.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function LinkModal({ product, onClose }) {
  const [short, setShort] = useFD(false);
  const url = aff_link(product.slug);
  const shortUrl = `${window.SITE}/r/${AFF.id}${product.id.replace(/\D/g, '')}`;
  const link = short ? shortUrl : url;
  const msg = `Check out ${product.name} on Limitra, ${fn(product.price)}`;
  useFDE(() => { const k = e => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose]);
  return (
    <div className="role-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="role-modal">
        <div className="role-modal-h">
          <div className="row" style={{ gap: 12 }}><span className="adm-prod-thumb" style={{ width: 44, height: 44 }}><FThumb product={product} src={FREAL[product.id]} /></span>
            <div><h3 style={{ fontSize: 17 }}>{product.name.split(',')[0]}</h3><small className="muted">{AFF.rate}% commission · {fn(Math.round(product.price * AFF.rate / 100))} per sale</small></div></div>
          <button className="role-modal-x" onClick={onClose}><FIcon name="close" size={18} /></button>
        </div>
        <div className="role-modal-b">
          <div className="aff-link-head"><span className="adm-field-label">Your referral link</span><button className={'aff-toggle' + (short ? ' on' : '')} onClick={() => setShort(s => !s)}>{short ? 'Short link' : 'Full link'}</button></div>
          <CopyField value={link} label="Referral link" />
          <div className="aff-qr-block">
            <QR text={link} size={130} />
            <div><b>Share QR code</b><p className="muted" style={{ fontSize: 13 }}>Download or share the QR code so shoppers can scan it and buy through your link.</p>
              <ShareRow url={link} msg={msg} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ MY LINKS ============ */
function AffLinks() {
  const links = FL.PRODUCTS.slice(0, 14);
  const { shown, page, pages, setPage } = usePager(links, 'links');
  return (
    <>
      <FHead title="My Links" sub="Every referral link you’ve generated, with live stats." />
      <div className="panel" style={{ padding: 0 }}>
        <div className="adm-table-wrap"><table className="adm-table">
          <thead><tr><th>Product</th><th>Link</th><th>Clicks</th><th>Orders</th><th>Earned</th><th></th></tr></thead>
          <tbody>{shown.map((p, i) => { const clicks = 180 - i * 22, orders = 24 - i * 3; return (
            <tr key={p.id}><td><div className="adm-prod"><span className="adm-prod-thumb"><FThumb product={p} src={FREAL[p.id]} /></span><b>{p.name.split(',')[0]}</b></div></td>
              <td><code className="aff-link-code">/r/{AFF.id}{p.id.replace(/\D/g, '')}</code></td>
              <td>{clicks}</td><td>{orders}</td><td><b>{fn(Math.round(orders * p.price * AFF.rate / 100))}</b></td>
              <td><div className="adm-rowact"><button title="Copy link" onClick={async () => { try { await navigator.clipboard.writeText(aff_link(p.slug)); } catch (e) {} window.affToast && window.affToast('Link copied'); }}><FIcon name="copy" size={15} /></button></div></td></tr>
          ); })}</tbody>
        </table><FPager page={page} pages={pages} onPage={setPage} /></div>
      </div>
    </>
  );
}

/* ============ MARKETING RESOURCES ============ */
function AffResources() {
  const assets = [
    ['Promotional banners', 'image', '12 sizes · JPG/PNG', '#0438B6'],
    ['Product image pack', 'bag', '480 product shots', '#F67208'],
    ['Video content', 'video', 'Reels & demos · MP4', '#7A5AE0'],
    ['Social templates', 'share', 'IG/TikTok/X · editable', '#1F8A5B'],
    ['Email templates', 'mail', '6 ready-to-send emails', '#F5A623'],
    ['Brand & logo kit', 'spark', 'Logos, colours, fonts', '#0438B6'],
  ];
  return (
    <>
      <FHead title="Marketing Center" sub="Ready-made creatives to help you convert, one-click download." />
      <div className="aff-res-grid">
        {assets.map(([t, ic, sub, c]) => (
          <div className="aff-res-card" key={t}>
            <span className="aff-res-ic" style={{ background: c + '22', color: c }}><FIcon name={ic} size={22} /></span>
            <b>{t}</b><small className="muted">{sub}</small>
            <button className="adm-btn ghost block" onClick={() => window.affToast && window.affToast('Downloading ' + t + '…')}><FIcon name="download" size={15} /> Download</button>
          </div>
        ))}
      </div>
    </>
  );
}

/* ============ EARNINGS ============ */
function AffEarnings({ go }) {
  return (
    <>
      <FHead title="Earnings" sub="Your commission breakdown and transaction history.">
        <button className="adm-btn primary" onClick={() => go('withdraw')}><FIcon name="card" size={15} /> Withdraw</button>
      </FHead>
      <div className="kpi-grid">
        <Kpi ic="dollar" tint="#1F8A5B" label="Total earned" val={fn(248500)} delta="" up />
        <Kpi ic="clock" tint="#F5A623" label="Pending" val={fn(19240)} delta="" up />
        <Kpi ic="check" tint="#0438B6" label="Approved" val={fn(142860)} delta="" up />
        <Kpi ic="card" tint="#F67208" label="Withdrawable" val={fn(86400)} delta="" up />
      </div>
      <div className="panel" style={{ padding: 0 }}>
        <div className="panel-h" style={{ padding: '18px 20px 0' }}><h3>Transaction history</h3></div>
        <div className="adm-table-wrap"><table className="adm-table">
          <thead><tr><th>Description</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>{FTXNS.map((t, i) => (
            <tr key={i}><td><b>{t[0]}</b></td><td className="muted">{t[1]}</td>
              <td className={t[2] < 0 ? 'aff-neg' : 'aff-pos'}><b>{t[2] < 0 ? '−' + fn(-t[2]) : '+' + fn(t[2])}</b></td>
              <td><Pill s={t[3]} /></td></tr>
          ))}</tbody>
        </table></div>
      </div>
    </>
  );
}

/* ============ WITHDRAWALS ============ */
function AffWithdraw() {
  const bal = 86400, min = 5000;
  const [amt, setAmt] = useFD('');
  const [method, setMethod] = useFD('Bank Transfer');
  const submit = () => {
    const v = parseInt(amt, 10);
    if (!v || v < min) { window.affToast && window.affToast('Minimum withdrawal is ' + fn(min)); return; }
    if (v > bal) { window.affToast && window.affToast('Amount exceeds available balance'); return; }
    window.affToast && window.affToast('Withdrawal request submitted'); setAmt('');
  };
  return (
    <>
      <FHead title="Withdrawals" sub="Request a payout to your bank or wallet." />
      <div className="adm-row c2">
        <div className="panel aff-wd-card">
          <span className="aff-wd-label">Available balance</span>
          <div className="aff-wd-bal">{fn(bal)}</div>
          <label className="adm-field"><span>Amount to withdraw</span><input type="number" value={amt} onChange={e => setAmt(e.target.value)} placeholder={'Min. ' + fn(min)} /></label>
          <div className="adm-field"><span>Payout method</span>
            <div className="aff-method-row">{['Bank Transfer'].map(m => <button key={m} className={'aff-method' + (method === m ? ' on' : '')} onClick={() => setMethod(m)}>{m}</button>)}</div>
          </div>
          <div className="aff-wd-dest"><FIcon name="card" size={16} /> GTBank ••••4821 · Chidinma Okeke</div>
          <button className="adm-btn primary block lg" onClick={submit}>Request withdrawal</button>
          <p className="muted" style={{ fontSize: 12, textAlign: 'center', marginTop: 8 }}>Payouts are processed within 1–3 business days.</p>
        </div>
        <div className="panel" style={{ padding: 0 }}>
          <div className="panel-h" style={{ padding: '18px 20px 0' }}><h3>Withdrawal history</h3></div>
          <div className="adm-table-wrap"><table className="adm-table">
            <thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Status</th></tr></thead>
            <tbody>{FWITHDRAWALS.map((w, i) => (
              <tr key={i}><td className="muted">{w[0]}</td><td><b>{fn(w[1])}</b></td><td>{w[2]}</td><td><Pill s={w[3]} /></td></tr>
            ))}</tbody>
          </table></div>
        </div>
      </div>
    </>
  );
}

/* ============ REFERRALS ============ */
function AffReferrals() {
  const [tab, setTab] = useFD('All');
  const tabs = ['All', 'Approved', 'Pending', 'Paid', 'Cancelled'];
  const list = FREFERRALS.filter(r => tab === 'All' || r[5] === tab);
  const { shown, page, pages, setPage } = usePager(list, tab);
  return (
    <>
      <FHead title="Referrals" sub="Everyone who shopped through your links." />
      <div className="adm-filters">{tabs.map(t => <button key={t} className={'adm-chip' + (tab === t ? ' on' : '')} onClick={() => setTab(t)}>{t}</button>)}</div>
      <div className="panel" style={{ padding: 0 }}>
        <div className="adm-table-wrap"><table className="adm-table">
          <thead><tr><th>Referral</th><th>Signup</th><th>Purchase</th><th>Order value</th><th>Commission</th><th>Status</th></tr></thead>
          <tbody>{shown.map((r, i) => (
            <tr key={i}><td><div className="adm-prod"><span className="adm-li-av">{r[0].split(' ').map(w => w[0]).join('').slice(0, 2)}</span><b>{r[0]}</b></div></td>
              <td className="muted">{r[1]}</td><td className="muted">{r[2]}</td><td>{r[3] ? fn(r[3]) : ','}</td><td><b>{r[4] ? fn(r[4]) : ','}</b></td><td><Pill s={r[5]} /></td></tr>
          ))}</tbody>
        </table>{list.length === 0 && <div style={{ padding: 28, textAlign: 'center', color: 'var(--text-faint)' }}>No referrals with this status.</div>}<FPager page={page} pages={pages} onPage={setPage} /></div>
      </div>
    </>
  );
}

/* ============ LEADERBOARD ============ */
function AffLeaderboard() {
  const [opt, setOpt] = useFD(true);
  const ranked = [...FLEADERS].sort((a, b) => b[3] - a[3]);
  return (
    <>
      <FHead title="Leaderboard" sub="Top affiliates this month across Limitra." />
      <div className="aff-podium">
        {[ranked[1], ranked[0], ranked[2]].map((r, i) => { const rank = r === ranked[0] ? 1 : r === ranked[1] ? 2 : 3; return (
          <div className={'aff-pod aff-pod-' + rank} key={r[0]}>
            <span className="aff-pod-rank">{rank}</span>
            <span className="adm-li-av lg">{r[0].split(' ').map(w => w[0]).join('').slice(0, 2)}</span>
            <b>{r[0]}</b><small className="muted">{r[1]}</small>
            <span className="aff-pod-sales">{fn(r[3])}</span>
          </div>
        ); })}
      </div>
      <div className="panel" style={{ padding: 0 }}>
        <div className="adm-table-wrap"><table className="adm-table">
          <thead><tr><th>#</th><th>Affiliate</th><th>Channel</th><th>Sales</th><th>Revenue</th></tr></thead>
          <tbody>{ranked.map((r, i) => (
            <tr key={r[0]} className={r[0] === AFF.name ? 'aff-me-row' : ''}><td><b>{i + 1}</b></td>
              <td><div className="adm-prod"><span className="adm-li-av">{r[0].split(' ').map(w => w[0]).join('').slice(0, 2)}</span><b>{r[0]}{r[0] === AFF.name ? ' (You)' : ''}</b></div></td>
              <td className="muted">{r[1]}</td><td>{r[2]}</td><td><b>{fn(r[3])}</b></td></tr>
          ))}</tbody>
        </table></div>
      </div>
      <label className="aff-optout"><input type="checkbox" checked={opt} onChange={e => { setOpt(e.target.checked); window.affToast && window.affToast(e.target.checked ? 'You’re visible on the public leaderboard' : 'You’ve opted out of public ranking'); }} /> Show me on the public leaderboard</label>
    </>
  );
}

/* ============ PROMO CODES ============ */
function AffPromoCodes() {
  const maxCodes = parseInt(localStorage.getItem('lim_aff_promo_max') || '1', 10);
  const allPct = [5, 10, 15];
  const read = () => JSON.parse(localStorage.getItem('lim_aff_promos') || '[]');
  const [codes, setCodes] = useFD(() => read().filter(c => c.affId === AFF.id));
  const [creating, setCreating] = useFD(false);
  const [code, setCode] = useFD('');
  const [pct, setPct] = useFD(10);
  const [err, setErr] = useFD('');

  const persist = (mine) => {
    const others = read().filter(c => c.affId !== AFF.id);
    localStorage.setItem('lim_aff_promos', JSON.stringify([...others, ...mine]));
    setCodes(mine);
  };
  const create = () => {
    const c = code.trim().toUpperCase();
    if (!/^[A-Z0-9]{4,16}$/.test(c)) { setErr('4–16 letters or numbers, no spaces'); return; }
    const all = read();
    if (all.some(x => x.code.toUpperCase() === c)) { setErr('That code is already taken'); return; }
    const next = [...codes, { code: c, pct: pct / 100, affId: AFF.id, affName: AFF.name, active: true, uses: 0, created: 'Today' }];
    persist(next); setCreating(false); setCode(''); setErr('');
    window.affToast && window.affToast('Promo code ' + c + ' created');
  };
  const toggle = (c) => { persist(codes.map(x => x.code === c ? { ...x, active: !x.active } : x)); };
  const remove = (c) => { persist(codes.filter(x => x.code !== c)); window.affToast && window.affToast('Promo code removed'); };
  const atLimit = codes.length >= maxCodes;

  return (
    <>
      <FHead title="Promo Codes" sub={`Create discount codes for your audience — applied at checkout and attributed to you.`}>
        {!atLimit && <button className="adm-btn primary" onClick={() => { setCreating(true); setErr(''); }}><FIcon name="plus" size={15} /> Create code</button>}
      </FHead>
      <div className="aff-promo-note"><FIcon name="info" size={15} /> Your plan allows <b>{maxCodes}</b> promo code{maxCodes !== 1 ? 's' : ''}. {atLimit ? 'You’ve reached your limit — remove one to create another, or contact support to request more.' : `You have ${codes.length} of ${maxCodes} in use.`}</div>

      {codes.length === 0 && !creating && (
        <div className="panel" style={{ textAlign: 'center', padding: 40 }}>
          <span className="aff-empty-ic"><FIcon name="tag" size={26} /></span>
          <h3 style={{ margin: '12px 0 4px' }}>No promo code yet</h3>
          <p className="muted" style={{ marginBottom: 16 }}>Create a code your audience can use for a discount at checkout.</p>
          <button className="adm-btn primary" onClick={() => setCreating(true)}><FIcon name="plus" size={15} /> Create your code</button>
        </div>
      )}

      {codes.length > 0 && (
        <div className="aff-code-grid">
          {codes.map(c => (
            <div key={c.code} className={'aff-code-card' + (c.active ? '' : ' off')}>
              <div className="aff-code-top">
                <span className="aff-code-val">{c.code}</span>
                <span className={'adm-pill ' + (c.active ? 'ok' : 'muted')}>{c.active ? 'Active' : 'Paused'}</span>
              </div>
              <div className="aff-code-pct">{Math.round(c.pct * 100)}% off</div>
              <div className="aff-code-meta"><span><FIcon name="bag" size={13} /> {c.uses} uses</span><span><FIcon name="clock" size={13} /> {c.created}</span></div>
              <div className="aff-code-actions">
                <button className="adm-btn ghost sm" onClick={async () => { try { await navigator.clipboard.writeText(c.code); } catch (e) {} window.affToast && window.affToast('Code copied'); }}><FIcon name="copy" size={14} /> Copy</button>
                <button className="adm-btn ghost sm" onClick={() => toggle(c.code)}>{c.active ? 'Pause' : 'Activate'}</button>
                <button className="adm-btn ghost sm danger" onClick={() => remove(c.code)} title="Delete"><FIcon name="trash" size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {creating && (
        <div className="role-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setCreating(false); }}>
          <div className="role-modal" style={{ maxWidth: 440 }}>
            <div className="role-modal-h"><div><h3 style={{ fontSize: 18 }}>Create promo code</h3><small className="muted">Shoppers enter this at checkout</small></div><button className="role-modal-x" onClick={() => setCreating(false)}><FIcon name="close" size={18} /></button></div>
            <div className="role-modal-b">
              <label className="adm-field"><span>Code</span><input value={code} onChange={e => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')); setErr(''); }} placeholder="e.g. CHIDINMA10" maxLength={16} /></label>
              {err && <span className="err-msg" style={{ display: 'block', marginTop: -6, marginBottom: 8 }}>{err}</span>}
              <div className="adm-field"><span>Discount</span>
                <div className="aff-pct-row">{allPct.map(p => <button key={p} className={'aff-pct' + (pct === p ? ' on' : '')} onClick={() => setPct(p)}>{p}% off</button>)}</div>
              </div>
              <div className="aff-code-preview"><span className="muted">Preview</span><div><b>{code || 'YOURCODE'}</b> — {pct}% off at checkout</div></div>
            </div>
            <div className="role-modal-f"><button className="adm-btn ghost" onClick={() => setCreating(false)}>Cancel</button><button className="adm-btn primary" onClick={create}><FIcon name="check" size={15} /> Create code</button></div>
          </div>
        </div>
      )}
    </>
  );
}

/* ============ SETTINGS ============ */
function AffSettings() {
  const [bank, setBank] = useFD('GTBank');
  return (
    <>
      <FHead title="Profile & Settings" sub="Manage your affiliate profile and payout details." />
      <div className="adm-row c2">
        <div className="panel">
          <h3 style={{ marginBottom: 16 }}>Profile</h3>
          <div className="row" style={{ gap: 14, marginBottom: 18 }}><span className="adm-li-av lg">{AFF.initials}</span><div><b style={{ fontFamily: 'var(--font-display)', fontSize: 16 }}>{AFF.name}</b><div className="muted" style={{ fontSize: 13 }}>@{AFF.handle} · {AFF.channel}</div><span className="adm-pill info" style={{ marginTop: 6, display: 'inline-block' }}>{AFF.tier} · {AFF.rate}% commission</span></div></div>
          <label className="adm-field"><span>Full name</span><input defaultValue={AFF.name} /></label>
          <label className="adm-field"><span>Email</span><input defaultValue={AFF.email} /></label>
          <label className="adm-field"><span>Primary channel</span><input defaultValue={AFF.channel} readOnly className="adm-readonly" title="Your primary channel is set from your verified social account" /></label>
          <button className="adm-btn primary" style={{ marginTop: 6 }} onClick={() => window.affToast && window.affToast('Profile saved')}>Save profile</button>
        </div>
        <div>
          <div className="panel" style={{ marginBottom: 14 }}>
            <h3 style={{ marginBottom: 16 }}>Payout details</h3>
            <div className="adm-field"><span>Bank</span><FSelect value={bank} options={['Access Bank', 'First Bank', 'GTBank', 'Kuda', 'Opay', 'Palmpay', 'Stanbic IBTC', 'Sterling Bank', 'UBA', 'Union Bank', 'Wema Bank', 'Zenith Bank']} onChange={setBank} /></div>
            <div className="adm-field-row"><label className="adm-field"><span>Account number</span><input defaultValue="0123454821" /></label><label className="adm-field"><span>Account name</span><input defaultValue={AFF.name} /></label></div>
            <button className="adm-btn primary" style={{ marginTop: 6 }} onClick={() => window.affToast && window.affToast('Payout details updated')}>Update</button>
          </div>
          <div className="panel">
            <h3 style={{ marginBottom: 14 }}>Notifications</h3>
            {[['New referral signup', true], ['Referral purchase', true], ['Commission earned', true], ['Withdrawal updates', true], ['Weekly summary email', false]].map(([t, on]) => (
              <label className="aff-notif-opt" key={t}><span>{t}</span><input type="checkbox" defaultChecked={on} /></label>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ============ SHELL ============ */
function AffShell() {
  /* route guard, affiliate (or super admin) only */
  useFDE(() => {
    let aff = null, adm = null;
    try { aff = JSON.parse(localStorage.getItem('lim_affiliate') || 'null'); } catch (e) {}
    try { adm = JSON.parse(localStorage.getItem('lim_admin') || 'null'); } catch (e) {}
    if (!aff && !adm) { window.location.replace('access-denied.html?need=affiliate'); }
  }, []);
  const [page, setPage] = useFD(() => location.hash.replace('#/', '') || 'dashboard');
  const [collapsed, setCollapsed] = useFD(false);
  const [mobOpen, setMobOpen] = useFD(false);
  const [theme, setTheme] = useFD(() => localStorage.getItem('lim_theme') || 'light');
  const [acctOpen, setAcctOpen] = useFD(false);
  useFDE(() => { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('lim_theme', theme); }, [theme]);
  useFDE(() => { location.hash = '/' + page; setMobOpen(false); window.scrollTo(0, 0); }, [page]);
  const go = (p) => setPage(p);

  const PAGES = { dashboard: AffOverview, analytics: AffPerformance, promote: AffPromote, links: AffLinks, resources: AffResources, earnings: AffEarnings, withdraw: AffWithdraw, referrals: AffReferrals, promocodes: AffPromoCodes, leaderboard: AffLeaderboard, settings: AffSettings };
  const Page = PAGES[page] || AffOverview;

  return (
    <div className={'adm' + (collapsed ? ' collapsed' : '') + (mobOpen ? ' mobopen' : '')}>
      {mobOpen && <div className="adm-scrim" onClick={() => setMobOpen(false)} />}
      <aside className="adm-side">
        <div className="adm-brand"><img src="assets/logo.png" alt="Limitra" /><span className="adm-badge aff">Affiliate</span><button className="adm-collapse-btn" onClick={() => setCollapsed(c => !c)} aria-label="Collapse sidebar" title="Collapse sidebar"><FIcon name="chevleft" size={17} /></button></div>
        <nav className="adm-nav">
          {FAFF_NAV.map(([grp, items]) => (
            <React.Fragment key={grp}>
              <div className="adm-nav-grp">{grp}</div>
              {items.map(([key, label, ic]) => (
                <button key={key} className={'adm-link' + (page === key ? ' on' : '')} onClick={() => go(key)} title={label}><FIcon name={ic} size={18} /><span>{label}</span></button>
              ))}
            </React.Fragment>
          ))}
        </nav>
      </aside>
      <div className="adm-main">
        <div className="adm-top">
          <button className="adm-burger" onClick={() => { if (window.matchMedia('(max-width: 860px)').matches) setMobOpen(o => !o); else setCollapsed(c => !c); }} aria-label="Toggle menu"><FIcon name="menu" size={20} /></button>
          <div className="aff-balance-chip"><FIcon name="card" size={15} /> Balance <b>{fn(86400)}</b><button className="aff-bal-wd" onClick={() => go('withdraw')}>Withdraw</button></div>
          <div className="adm-top-actions">
            <a className="adm-icon-btn" href="index.html" title="View store"><FIcon name="store" size={19} /></a>
            <button className="adm-icon-btn" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} title="Theme"><FIcon name={theme === 'dark' ? 'sun' : 'moon'} size={19} /></button>
            <div className="adm-acct-wrap">
              <button className="adm-avatar" onClick={() => setAcctOpen(o => !o)}>{AFF.initials}</button>
              {acctOpen && (<>
                <div className="adm-notif-scrim" onClick={() => setAcctOpen(false)} />
                <div className="adm-acct" role="menu">
                  <div className="adm-acct-head"><span className="adm-avatar" style={{ width: 42, height: 42 }}>{AFF.initials}</span><div><b>{AFF.name}</b><small>{AFF.email}</small></div></div>
                  <div className="adm-acct-role"><span className="adm-pill info">{AFF.tier} affiliate</span></div>
                  <button className="adm-acct-item" onClick={() => { go('settings'); setAcctOpen(false); }}><FIcon name="lock" size={16} /> Profile &amp; settings</button>
                  <button className="adm-acct-item" onClick={() => { go('withdraw'); setAcctOpen(false); }}><FIcon name="card" size={16} /> Withdraw earnings</button>
                  <a className="adm-acct-item" href="index.html"><FIcon name="store" size={16} /> Back to store</a>
                  <button className="adm-acct-item danger" onClick={() => { try { localStorage.removeItem('lim_affiliate'); } catch (e) {} window.location.href = 'index.html'; }}><FIcon name="lock" size={16} /> Sign out</button>
                </div>
              </>)}
            </div>
          </div>
        </div>
        <div className="adm-body" data-page={page}><Page go={go} /></div>
      </div>
      <AffToasts />
    </div>
  );
}

function AffToasts() {
  const [items, setItems] = useFD([]);
  useFDE(() => { let id = 0; window.affToast = (msg) => { const i = ++id; setItems(x => [...x, { i, msg }]); setTimeout(() => setItems(x => x.filter(t => t.i !== i)), 2600); }; }, []);
  return <div className="adm-toasts">{items.map(t => <div className="adm-toast" key={t.i}><FIcon name="check" size={15} stroke={3} /> {t.msg}</div>)}</div>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<AffShell />);
