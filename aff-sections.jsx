/* LIMITRA Affiliate Dashboard, shared data + section components */
const FL = window.LIMITRA;
const fn = FL.naira;
const FIcon = window.Icon;
const FThumb = window.Thumb;
const FREAL = window.REAL_IMG || {};
const { useState: useFAState } = React;

/* SocialMark fallback (this page doesn't load pages-auth/share) */
if (typeof window.SocialMark === 'undefined') {
  window.SocialMark = function SocialMark({ name, size = 18 }) {
    const d = (window.LIMITRA.SOCIAL_GLYPHS || {})[name];
    if (!d) return <window.Icon name="share" size={size} />;
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={d} /></svg>;
  };
}

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

/* ---- small shared bits ---- */
function FHead({ title, sub, children }) {
  return <div className="adm-h"><div><h1>{title}</h1>{sub && <p>{sub}</p>}</div>{children && <div className="adm-h-actions">{children}</div>}</div>;
}
function Pill({ s }) { return <span className={'adm-pill ' + (FSTATUS[s] || 'muted')}>{s}</span>; }

function CopyField({ value, label }) {
  const [copied, setCopied] = useFAState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(value); } catch (e) {} setCopied(true); window.affToast && window.affToast((label || 'Link') + ' copied'); setTimeout(() => setCopied(false), 1800); };
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
  const targets = [
    ['whatsapp', 'WhatsApp', `https://wa.me/?text=${enc(msg + ' ' + url)}`, false],
    ['facebook', 'Facebook', `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, false],
    ['x', 'X', `https://twitter.com/intent/tweet?text=${enc(msg)}&url=${enc(url)}`, false],
    ['instagram', 'Instagram', 'https://www.instagram.com/', true],
    ['tiktok', 'TikTok', 'https://www.tiktok.com/', true],
  ];
  const SM = window.SocialMark;
  return (
    <div className="aff-share-row">
      {targets.map(([cls, label, href, copyFirst]) => (
        <button key={cls} className={'aff-share-btn ' + cls} title={'Share on ' + label} onClick={async () => { if (copyFirst) { try { await navigator.clipboard.writeText(url); window.affToast && window.affToast('Link copied — paste it in ' + label); } catch (e) {} } window.open(href, '_blank', 'noopener,noreferrer'); }}>
          {SM ? <SM name={label === 'X' ? 'X' : label} size={16} /> : <FIcon name="share" size={16} />}
        </button>
      ))}
    </div>
  );
}

/* styled select (custom popover; native options can't be themed) */
function FSelect({ value, options, onChange }) {
  const [open, setOpen] = useFAState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
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
  const [page, setPage] = useFAState(1);
  React.useEffect(() => { setPage(1); }, [dep]);
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

Object.assign(window, { AFF, SITE, aff_link, FAFF_NAV, FREFERRALS, FTXNS, FWITHDRAWALS, FLEADERS, FSTATUS, FHead, Pill, CopyField, QR, ShareRow, FSelect, usePager, FPager, FL, fn, FIcon, FThumb, FREAL });
