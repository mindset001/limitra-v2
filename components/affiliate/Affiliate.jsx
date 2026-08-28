'use client';
/* LIMITRA Affiliate Dashboard — shared demo data/UI + all 11 page components.
   Mechanical port of legacy/aff-sections.jsx + legacy/aff-dashboard.jsx into one module:
   - `window.X` cross-file globals become normal imports/exports.
   - `FL.naira` / `FL.PRODUCTS` (window.LIMITRA) become `naira` / `PRODUCTS` from '@/lib/data'.
   - `Kpi`/`BarChart`/`Donut` (originally reused from admin.jsx via window globals) now come
     from '@/components/charts/Charts', the shared module extracted for both dashboards.
   - The defensive `if (typeof window.SocialMark === 'undefined') {...}` fallback block from
     aff-sections.jsx is dropped; ShareRow imports the real '@/components/ui/SocialMark'.
   - `window.affToast && window.affToast(msg)` becomes `useAffiliateToast()`.
   - The legacy shell's `page` useState + `go(section) => setPage(section)` becomes real
     routing: `useAffGo()` below pushes to `/affiliate/dashboard[/section]` via next/navigation. */
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/icons/Icon';
import { Thumb, REAL_IMG } from '@/components/ui/Shared';
import { SocialMark } from '@/components/ui/SocialMark';
import { Kpi, BarChart, Donut } from '@/components/charts/Charts';
import { naira, PRODUCTS } from '@/lib/data';
import { useAffiliateToast } from './AffiliateToastContext';

const FIcon = Icon;
const FThumb = Thumb;
const FREAL = REAL_IMG;
const fn = naira;

const AFF = { name: 'Chidinma Okeke', handle: 'chidinma_styles', initials: 'CO', email: 'chidinma@email.com', id: 'AFF12345', channel: 'Instagram · 84k', joined: 'Jan 2026', tier: 'Pro', rate: 8 };
const SITE = 'https://limitra.ng';

const aff_link = (slug) => `${SITE}/product/${slug}?ref=${AFF.id}`;

const FAFF_NAV = [
  ['Overview', [['dashboard', 'Dashboard', 'grid'], ['analytics', 'Performance', 'spark']]],
  ['Promote', [['promote', 'Promotion Center', 'bag'], ['links', 'My Links', 'share'], ['resources', 'Marketing', 'gift']]],
  ['Earnings', [['earnings', 'Earnings', 'dollar'], ['withdraw', 'Withdrawals', 'card'], ['referrals', 'Referrals', 'user'], ['promocodes', 'Promo Codes', 'tag']]],
  ['Community', [['leaderboard', 'Leaderboard', 'flame']]],
  ['Account', [['settings', 'Profile & Settings', 'lock']]]];

/* demo data */
const FREFERRALS = [
  ['Tunde A.', '12 Jun 2026', '12 Jun 2026', 84000, 6720, 'Approved'],
  ['Bola K.', '10 Jun 2026', '11 Jun 2026', 156500, 12520, 'Approved'],
  ['Ngozi P.', '08 Jun 2026', ',', 0, 0, 'Pending'],
  ['Emeka U.', '05 Jun 2026', '06 Jun 2026', 42000, 3360, 'Paid'],
  ['Zainab M.', '02 Jun 2026', '03 Jun 2026', 298000, 23840, 'Paid'],
  ['Femi A.', '28 May 2026', '29 May 2026', 64000, 5120, 'Paid'],
  ['Aisha B.', '25 May 2026', ',', 0, 0, 'Cancelled'],
  ['Dapo O.', '21 May 2026', '22 May 2026', 119000, 9520, 'Paid'],
  ['Ada N.', '19 May 2026', '20 May 2026', 73500, 5880, 'Paid'],
  ['Kunle S.', '16 May 2026', ',', 0, 0, 'Pending'],
  ['Halima Y.', '14 May 2026', '15 May 2026', 211000, 16880, 'Paid'],
  ['Chuka E.', '11 May 2026', '12 May 2026', 56000, 4480, 'Approved'],
  ['Sade O.', '08 May 2026', '09 May 2026', 134000, 10720, 'Paid'],
  ['Ibrahim K.', '05 May 2026', ',', 0, 0, 'Cancelled'],
  ['Tobi A.', '02 May 2026', '03 May 2026', 89500, 7160, 'Paid'],
  ['Grace N.', '29 Apr 2026', '30 Apr 2026', 167000, 13360, 'Paid'],
  ['Yusuf M.', '26 Apr 2026', '27 Apr 2026', 48000, 3840, 'Approved'],
  ['Blessing O.', '23 Apr 2026', '24 Apr 2026', 252000, 20160, 'Paid'],
  ['Segun T.', '20 Apr 2026', ',', 0, 0, 'Pending'],
];
const FTXNS = [
  ['Commission, order LMT-90412', '12 Jun 2026', 6720, 'Pending'],
  ['Commission, order LMT-88107', '11 Jun 2026', 12520, 'Approved'],
  ['Withdrawal to GTBank ••4821', '08 Jun 2026', -45000, 'Paid'],
  ['Commission, order LMT-85220', '06 Jun 2026', 3360, 'Paid'],
  ['Commission, order LMT-83991', '03 Jun 2026', 23840, 'Paid'],
  ['Bonus, milestone 50 sales', '01 Jun 2026', 10000, 'Paid'],
];
const FWITHDRAWALS = [
  ['08 Jun 2026', 45000, 'Bank Transfer', 'Paid'],
  ['24 May 2026', 80000, 'Paystack', 'Paid'],
  ['10 May 2026', 32000, 'Flutterwave', 'Paid'],
];
const FLEADERS = [
  ['Bella Styles', 'TikTok · 220k', 540, 3120000],
  ['Halima Beauty', 'IG · 204k', 389, 2280000],
  ['Lola Trends', 'TikTok · 178k', 421, 2460000],
  ['Chidinma Okeke', 'IG · 84k', 312, 1980000],
  ['Femi Gadgets', 'YouTube · 112k', 167, 1080000],
];
const FSTATUS = { Approved: 'info', Pending: 'warn', Paid: 'ok', Cancelled: 'bad', Processing: 'info', Rejected: 'bad' };

/* routing — replaces the legacy shell's `page` useState + `go(section) => setPage(section)`.
   `affPath` is also used by app/affiliate/dashboard/layout.js so the sidebar's active-state
   check and its own `go` build the same URLs as this module's pages do. */
const affPath = (key) => '/affiliate/dashboard' + (key === 'dashboard' ? '' : '/' + key);
function useAffGo() {
  const router = useRouter();
  return (section) => router.push(affPath(section));
}

/* ---- small shared bits ---- */
function FHead({ title, sub, children }) {
  return <div className="adm-h"><div><h1>{title}</h1>{sub && <p>{sub}</p>}</div>{children && <div className="adm-h-actions">{children}</div>}</div>;
}
function Pill({ s }) { return <span className={'adm-pill ' + (FSTATUS[s] || 'muted')}>{s}</span>; }

function CopyField({ value, label }) {
  const [copied, setCopied] = useState(false);
  const affToast = useAffiliateToast();
  const copy = async () => { try { await navigator.clipboard.writeText(value); } catch (e) {} setCopied(true); affToast((label || 'Link') + ' copied'); setTimeout(() => setCopied(false), 1800); };
  return (
    <div className="aff-copyfield">
      <input readOnly value={value} onFocus={e => e.target.select()} />
      <button className="adm-btn primary" onClick={copy}><FIcon name={copied ? 'check' : 'copy'} size={15} stroke={copied ? 3 : 2} /> {copied ? 'Copied' : 'Copy'}</button>
    </div>
  );
}

/* QR placeholder built from CSS grid (deterministic from string) */
function QR({ text, size = 120 }) {
  const cells = [];
  let h = 0; for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  const N = 11;
  for (let i = 0; i < N * N; i++) { h = (h * 1103515245 + 12345) >>> 0; cells.push(((h >> 16) & 1) === 1); }
  // force finder-pattern corners on
  const corner = (r, c) => (r < 3 && c < 3) || (r < 3 && c >= N - 3) || (r >= N - 3 && c < 3);
  return (
    <div className="aff-qr" style={{ width: size, height: size, gridTemplateColumns: `repeat(${N},1fr)` }} aria-label="QR code">
      {cells.map((on, i) => { const r = Math.floor(i / N), c = i % N; const fill = corner(r, c) ? ((r % 2 === 0 || c % 2 === 0)) : on; return <span key={i} className={fill ? 'on' : ''} />; })}
    </div>
  );
}

function ShareRow({ url, msg }) {
  const enc = encodeURIComponent;
  const affToast = useAffiliateToast();
  const targets = [
    ['whatsapp', 'WhatsApp', `https://wa.me/?text=${enc(msg + ' ' + url)}`, false],
    ['facebook', 'Facebook', `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, false],
    ['x', 'X', `https://twitter.com/intent/tweet?text=${enc(msg)}&url=${enc(url)}`, false],
    ['instagram', 'Instagram', 'https://www.instagram.com/', true],
    ['tiktok', 'TikTok', 'https://www.tiktok.com/', true],
  ];
  return (
    <div className="aff-share-row">
      {targets.map(([cls, label, href, copyFirst]) => (
        <button key={cls} className={'aff-share-btn ' + cls} title={'Share on ' + label} onClick={async () => { if (copyFirst) { try { await navigator.clipboard.writeText(url); affToast('Link copied — paste it in ' + label); } catch (e) {} } window.open(href, '_blank', 'noopener,noreferrer'); }}>
          <SocialMark name={label === 'X' ? 'X' : label} size={16} />
        </button>
      ))}
    </div>
  );
}

/* styled select (custom popover; native options can't be themed) */
function FSelect({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = e => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc); window.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); window.removeEventListener('keydown', onKey); };
  }, [open]);
  return (
    <div className={'fsel' + (open ? ' open' : '')} ref={ref}>
      <button type="button" className="fsel-trigger" onClick={() => setOpen(o => !o)}><span>{value}</span><FIcon name="chevdown" size={15} className="fsel-chev" /></button>
      {open && (
        <div className="fsel-pop" role="listbox">
          {options.map(o => (
            <button type="button" key={o} role="option" aria-selected={o === value} className={'fsel-opt' + (o === value ? ' on' : '')} onClick={() => { onChange && onChange(o); setOpen(false); }}>
              {o}{o === value && <FIcon name="check" size={15} stroke={3} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* pagination hook + component */
function usePager(list, dep, per = 10) {
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [dep]);
  const pages = Math.max(1, Math.ceil(list.length / per));
  const cur = Math.min(page, pages);
  const shown = list.slice((cur - 1) * per, cur * per);
  return { shown, page: cur, pages, setPage };
}
function FPager({ page, pages, onPage }) {
  if (pages <= 1) return null;
  const win = []; for (let i = 1; i <= pages; i++) { if (i === 1 || i === pages || Math.abs(i - page) <= 1) win.push(i); else if (win[win.length - 1] !== '…') win.push('…'); }
  return (
    <div className="aff-pager">
      <button className="aff-pg" disabled={page === 1} onClick={() => onPage(page - 1)}><FIcon name="chevleft" size={16} /></button>
      {win.map((p, i) => p === '…' ? <span key={'g' + i} className="aff-pg-gap">…</span> : <button key={p} className={'aff-pg' + (p === page ? ' on' : '')} onClick={() => onPage(p)}>{p}</button>)}
      <button className="aff-pg" disabled={page === pages} onClick={() => onPage(page + 1)}><FIcon name="chevright" size={16} /></button>
    </div>
  );
}

/* ============ OVERVIEW ============ */
function AffOverview() {
  const [gen, setGen] = useState(false);
  const go = useAffGo();
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
  const [gran, setGran] = useState('Weekly');
  const C = { Daily: { d: [12, 18, 14, 22, 19, 25, 21], l: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }, Weekly: { d: [58, 72, 64, 80, 76, 91, 104, 98], l: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'] }, Monthly: { d: [220, 265, 248, 310, 290, 356], l: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] } };
  const top = PRODUCTS.slice(0, 5);
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
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(null);
  const list = PRODUCTS.filter(p => !q || p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 12);
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
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(null);
  useEffect(() => { const k = e => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', k); document.body.style.overflow = 'hidden'; return () => { window.removeEventListener('keydown', k); document.body.style.overflow = ''; }; }, [onClose]);
  if (sel) return <LinkModal product={sel} onClose={onClose} />;
  const list = PRODUCTS.filter(p => !q || p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 8);
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
  const [short, setShort] = useState(false);
  const url = aff_link(product.slug);
  const shortUrl = `${SITE}/r/${AFF.id}${product.id.replace(/\D/g, '')}`;
  const link = short ? shortUrl : url;
  const msg = `Check out ${product.name} on Limitra, ${fn(product.price)}`;
  useEffect(() => { const k = e => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose]);
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
  const affToast = useAffiliateToast();
  const links = PRODUCTS.slice(0, 14);
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
              <td><div className="adm-rowact"><button title="Copy link" onClick={async () => { try { await navigator.clipboard.writeText(aff_link(p.slug)); } catch (e) {} affToast('Link copied'); }}><FIcon name="copy" size={15} /></button></div></td></tr>
          ); })}</tbody>
        </table><FPager page={page} pages={pages} onPage={setPage} /></div>
      </div>
    </>
  );
}

/* ============ MARKETING RESOURCES ============ */
function AffResources() {
  const affToast = useAffiliateToast();
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
            <button className="adm-btn ghost block" onClick={() => affToast('Downloading ' + t + '…')}><FIcon name="download" size={15} /> Download</button>
          </div>
        ))}
      </div>
    </>
  );
}

/* ============ EARNINGS ============ */
function AffEarnings() {
  const go = useAffGo();
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
  const affToast = useAffiliateToast();
  const bal = 86400, min = 5000;
  const [amt, setAmt] = useState('');
  const [method, setMethod] = useState('Bank Transfer');
  const submit = () => {
    const v = parseInt(amt, 10);
    if (!v || v < min) { affToast('Minimum withdrawal is ' + fn(min)); return; }
    if (v > bal) { affToast('Amount exceeds available balance'); return; }
    affToast('Withdrawal request submitted'); setAmt('');
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
  const [tab, setTab] = useState('All');
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
  const affToast = useAffiliateToast();
  const [opt, setOpt] = useState(true);
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
      <label className="aff-optout"><input type="checkbox" checked={opt} onChange={e => { setOpt(e.target.checked); affToast(e.target.checked ? 'You’re visible on the public leaderboard' : 'You’ve opted out of public ranking'); }} /> Show me on the public leaderboard</label>
    </>
  );
}

/* ============ PROMO CODES ============ */
function AffPromoCodes() {
  const affToast = useAffiliateToast();
  /* legacy read localStorage synchronously at the top of the component (fine for a plain
     browser script that only ever ran client-side). Here that would run during SSR too and
     diverge from the client's first render, so — same fix StoreProvider.jsx uses — defaults
     render first and the real values hydrate in a useEffect right after mount. */
  const read = () => { try { return JSON.parse(localStorage.getItem('lim_aff_promos') || '[]'); } catch (e) { return []; } };
  const allPct = [5, 10, 15];
  const [maxCodes, setMaxCodes] = useState(1);
  const [codes, setCodes] = useState([]);
  const [creating, setCreating] = useState(false);
  const [code, setCode] = useState('');
  const [pct, setPct] = useState(10);
  const [err, setErr] = useState('');

  useEffect(() => {
    try { setMaxCodes(parseInt(localStorage.getItem('lim_aff_promo_max') || '1', 10)); } catch (e) {}
    setCodes(read().filter(c => c.affId === AFF.id));
  }, []);

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
    affToast('Promo code ' + c + ' created');
  };
  const toggle = (c) => { persist(codes.map(x => x.code === c ? { ...x, active: !x.active } : x)); };
  const remove = (c) => { persist(codes.filter(x => x.code !== c)); affToast('Promo code removed'); };
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
                <button className="adm-btn ghost sm" onClick={async () => { try { await navigator.clipboard.writeText(c.code); } catch (e) {} affToast('Code copied'); }}><FIcon name="copy" size={14} /> Copy</button>
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
  const affToast = useAffiliateToast();
  const [bank, setBank] = useState('GTBank');
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
          <button className="adm-btn primary" style={{ marginTop: 6 }} onClick={() => affToast('Profile saved')}>Save profile</button>
        </div>
        <div>
          <div className="panel" style={{ marginBottom: 14 }}>
            <h3 style={{ marginBottom: 16 }}>Payout details</h3>
            <div className="adm-field"><span>Bank</span><FSelect value={bank} options={['Access Bank', 'First Bank', 'GTBank', 'Kuda', 'Opay', 'Palmpay', 'Stanbic IBTC', 'Sterling Bank', 'UBA', 'Union Bank', 'Wema Bank', 'Zenith Bank']} onChange={setBank} /></div>
            <div className="adm-field-row"><label className="adm-field"><span>Account number</span><input defaultValue="0123454821" /></label><label className="adm-field"><span>Account name</span><input defaultValue={AFF.name} /></label></div>
            <button className="adm-btn primary" style={{ marginTop: 6 }} onClick={() => affToast('Payout details updated')}>Update</button>
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

export {
  AFF, aff_link, FAFF_NAV, FREFERRALS, FTXNS, FWITHDRAWALS, FLEADERS, FSTATUS,
  Pill, CopyField, QR, ShareRow, FSelect, usePager, FPager, fn, affPath, useAffGo,
  GenLinkModal, LinkModal,
  AffOverview, AffPerformance, AffPromote, AffLinks, AffResources, AffEarnings,
  AffWithdraw, AffReferrals, AffPromoCodes, AffLeaderboard, AffSettings,
};
