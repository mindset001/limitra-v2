'use client';
/* People nav group (Customers, Affiliates, Referrals) — ported verbatim from
   legacy/admin-sections.jsx. `window.admToast` calls replaced with `useAdminToast()`;
   AdminAffiliates has `data-hlkey` rows so it reads the highlight query param too. */
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@/components/icons/Icon';
import { naira } from '@/lib/data';
import { Kpi, BarChart } from '@/components/charts/Charts';
import { useAdminToast } from './AdminToastContext';
import { AdmHead, Pager, usePager, Toggle, AdmSelect, useHighlight } from './AdminShared';

/* ---------- CUSTOMERS ---------- */
const ADMIN_CUSTOMERS = [
  ['Lucy Limitra', 'lucy@limitra.ng', 24, 4820000, 'Active'],
  ['Chidinma Okeke', 'chidinma.o@email.com', 12, 1640000, 'Active'],
  ['Tunde Adeyemi', 'tunde.a@email.com', 8, 980000, 'Active'],
  ['Bola Kareem', 'bola.k@email.com', 3, 412000, 'Active'],
  ['Emeka Uche', 'emeka.u@email.com', 19, 2890000, 'Active'],
  ['Zainab Musa', 'zainab.m@email.com', 1, 84000, 'Suspended'],
  ['Femi Alabi', 'femi.a@email.com', 6, 720000, 'Active'],
];
function CustomerDrawer({ cust, status: extStatus, onStatusChange, onClose }) {
  const addToast = useAdminToast();
  const [status, setStatus] = useState(extStatus || cust[4]);
  const [resetSent, setResetSent] = useState(false);
  const suspended = status === 'Suspended';
  const orders = [
    ['LMT-90412', 'Delivered', 84000, '12 Jun 2026'],
    ['LMT-88107', 'Delivered', 156500, '28 May 2026'],
    ['LMT-85220', 'Cancelled', 42000, '14 May 2026'],
  ];
  const resetPwd = () => { setResetSent(true); addToast('Password reset link sent to ' + cust[1]); };
  const toggleSuspend = () => {
    const next = suspended ? 'Active' : 'Suspended';
    setStatus(next);
    onStatusChange && onStatusChange(next);
    addToast(cust[0] + (next === 'Suspended' ? ' suspended' : ' restored'));
  };
  return (
    <>
      <div className="adm-drawer-scrim" onClick={onClose} />
      <aside className="adm-drawer" role="dialog" aria-label="Customer detail">
        <div className="adm-drawer-h">
          <h3>Customer profile</h3>
          <button className="adm-icon-btn" onClick={onClose} aria-label="Close"><Icon name="close" size={20} /></button>
        </div>
        <div className="adm-drawer-body">
          <div className="adm-cust-head">
            <span className="adm-li-av lg">{cust[0].split(' ').map(w => w[0]).join('').slice(0, 2)}</span>
            <div>
              <b style={{ fontSize: 18 }}>{cust[0]}</b>
              <div className="muted" style={{ fontSize: 13 }}>{cust[1]}</div>
              <span className={'adm-pill ' + (suspended ? 'bad' : 'ok')} style={{ marginTop: 6, display: 'inline-block' }}>{status}</span>
            </div>
          </div>

          <div className="adm-cust-stats">
            <div><span className="muted">Orders</span><b>{cust[2]}</b></div>
            <div><span className="muted">Lifetime value</span><b>{naira(cust[3])}</b></div>
            <div><span className="muted">Lim Cash</span><b>{naira(7000)}</b></div>
          </div>

          <h4 className="adm-sec-label">Purchase history</h4>
          <div className="adm-cust-orders">
            {orders.map((o, i) => (
              <div className="adm-cust-order" key={i}>
                <div><b>{o[0]}</b><small className="muted">{o[3]}</small></div>
                <span className={'adm-pill ' + (o[1] === 'Delivered' ? 'ok' : o[1] === 'Cancelled' ? 'bad' : 'warn')}>{o[1]}</span>
                <b>{naira(o[2])}</b>
              </div>
            ))}
          </div>

          <h4 className="adm-sec-label">Rewards & referrals</h4>
          <div className="adm-cust-rewards">
            <div className="adm-cust-reward"><span className="adm-cust-rico ok"><Icon name="gift" size={16} /></span><div><b>WELCOME5000</b><small className="muted">₦5,000 signup spin · active</small></div></div>
            <div className="adm-cust-reward"><span className="adm-cust-rico"><Icon name="share" size={16} /></span><div><b>3 successful referrals</b><small className="muted">₦21,000 earned in Lim Cash</small></div></div>
          </div>

          <h4 className="adm-sec-label">Reset password</h4>
          <div className="adm-cust-reset">
            <div><b>Send password reset link</b><small className="muted">{resetSent ? 'A reset link has been emailed to ' + cust[1] : 'Emails a secure reset link to the customer.'}</small></div>
            <button className="adm-btn ghost" onClick={resetPwd} disabled={resetSent}><Icon name={resetSent ? 'check' : 'mail'} size={15} /> {resetSent ? 'Sent' : 'Send link'}</button>
          </div>

          <div className="adm-drawer-foot">
            <button className="adm-btn ghost" onClick={resetPwd}><Icon name={resetSent ? 'check' : 'lock'} size={15} /> {resetSent ? 'Reset link sent' : 'Reset password'}</button>
            {suspended
              ? <button className="adm-btn primary" onClick={toggleSuspend}><Icon name="refresh" size={15} /> Restore account</button>
              : <button className="adm-btn danger" onClick={toggleSuspend}><Icon name="close" size={15} /> Suspend account</button>}
          </div>
        </div>
      </aside>
    </>
  );
}

export function AdminCustomers() {
  const addToast = useAdminToast();
  const [q, setQ] = useState('');
  const [view, setView] = useState(null);
  const [statusMap, setStatusMap] = useState({});
  const stOf = (c) => statusMap[c[1]] || c[4];
  const toggleSuspend = (c) => {
    const cur = stOf(c);
    const next = cur === 'Suspended' ? 'Active' : 'Suspended';
    setStatusMap(m => ({ ...m, [c[1]]: next }));
    addToast(c[0] + (next === 'Suspended' ? ' suspended' : ' restored'));
  };
  const list = ADMIN_CUSTOMERS.filter(c => !q || c[0].toLowerCase().includes(q.toLowerCase()) || c[1].includes(q.toLowerCase()));
  const { shown: cShown, page: cPage, pages: cPages, setPage: cSet } = usePager(list, q);
  return (
    <>
      <AdmHead title="Customers" sub="4,820 registered customers"><button className="adm-btn ghost"><Icon name="download" size={15} /> Export</button></AdmHead>
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <Kpi ic="user" tint="#0438B6" label="Total customers" val="4,820" delta="5.6%" up />
        <Kpi ic="spark" tint="#1F8A5B" label="New this month" val="612" delta="14%" up />
        <Kpi ic="refresh" tint="#7A5AE0" label="Retention" val="38%" delta="2%" up />
      </div>
      <div className="adm-filters"><div className="adm-mini-search"><Icon name="search" size={16} className="muted" /><input placeholder="Search customers…" value={q} onChange={e => setQ(e.target.value)} /></div></div>
      <div className="panel" style={{ padding: 0 }}>
        <div className="adm-table-wrap"><table className="adm-table">
          <thead><tr><th>Customer</th><th>Orders</th><th>Lifetime value</th><th>Status</th><th></th></tr></thead>
          <tbody>{cShown.map((c, i) => { const st = stOf(c); const susp = st === 'Suspended'; return (
            <tr key={i} className={susp ? 'adm-row-susp' : ''}>
              <td><div className="adm-prod"><span className="adm-li-av">{c[0].split(' ').map(w => w[0]).join('').slice(0, 2)}</span><div><b>{c[0]}</b><small>{c[1]}</small></div></div></td>
              <td>{c[2]}</td><td><b>{naira(c[3])}</b></td>
              <td><span className={'adm-pill ' + (susp ? 'bad' : 'ok')}>{st}</span></td>
              <td><div className="adm-rowact"><button title="View" onClick={() => setView(c)}><Icon name="eye" size={15} /></button><button title="Reset password" onClick={() => addToast('Password reset link sent')}><Icon name="lock" size={15} /></button>{susp
                ? <button className="restore" title="Restore" onClick={() => toggleSuspend(c)}><Icon name="refresh" size={15} /></button>
                : <button className="del" title="Suspend" onClick={() => toggleSuspend(c)}><Icon name="close" size={15} /></button>}</div></td>
            </tr>
          ); })}</tbody>
        </table><Pager page={cPage} pages={cPages} onPage={cSet} /></div>
      </div>
      {view && <CustomerDrawer cust={view} status={stOf(view)} onStatusChange={(s) => setStatusMap(m => ({ ...m, [view[1]]: s }))} onClose={() => setView(null)} />}
    </>
  );
}

/* ---------- AFFILIATES ---------- */
const ADMIN_AFFILIATES = [
  ['Chidinma O.', 'IG · 84k', 312, 1980000, 'Approved'],
  ['Tunde A.', 'X · 41k', 184, 1240000, 'Approved'],
  ['Bella Styles', 'TikTok · 220k', 540, 3120000, 'Approved'],
  ['Kunle Tech', 'YouTube · 65k', 98, 640000, 'Pending'],
  ['Aisha Beauty', 'IG · 132k', 276, 1740000, 'Approved'],
  ['Dapo Reviews', 'Blog · 28k', 41, 290000, 'Suspended'],
  ['Ngozi Hauls', 'TikTok · 96k', 203, 1310000, 'Approved'],
  ['Femi Gadgets', 'YouTube · 112k', 167, 1080000, 'Approved'],
  ['Zara Glam', 'IG · 58k', 88, 520000, 'Pending'],
  ['Emeka Plug', 'X · 33k', 54, 360000, 'Approved'],
  ['Lola Trends', 'TikTok · 178k', 421, 2460000, 'Approved'],
  ['Sadia Picks', 'Blog · 19k', 27, 180000, 'Pending'],
  ['Bayo Tech', 'YouTube · 47k', 73, 470000, 'Approved'],
  ['Halima Beauty', 'IG · 204k', 389, 2280000, 'Approved'],
  ['Chuka Reviews', 'X · 22k', 31, 210000, 'Suspended'],
];
function AffiliateDrawer({ aff, status, paid, onStatusChange, onPay, onClose }) {
  const addToast = useAdminToast();
  const payouts = [
    ['28 May 2026', 320000, 'Paid'],
    ['28 Apr 2026', 280000, 'Paid'],
    ['28 Mar 2026', 195000, 'Paid'],
  ];
  const act = (next, msg) => { onStatusChange && onStatusChange(next); addToast(msg); };
  return (
    <>
      <div className="adm-drawer-scrim" onClick={onClose} />
      <aside className="adm-drawer" role="dialog" aria-label="Affiliate detail">
        <div className="adm-drawer-h"><h3>Affiliate profile</h3><button className="adm-icon-btn" onClick={onClose} aria-label="Close"><Icon name="close" size={20} /></button></div>
        <div className="adm-drawer-body">
          <div className="adm-cust-head">
            <span className="adm-li-av lg">{aff[0].split(' ').map(w => w[0]).join('').slice(0, 2)}</span>
            <div>
              <b style={{ fontSize: 18 }}>{aff[0]}</b>
              <div className="muted" style={{ fontSize: 13 }}>{aff[1]}</div>
              <span className={'adm-pill ' + (status === 'Approved' ? 'ok' : status === 'Pending' ? 'warn' : 'bad')} style={{ marginTop: 6, display: 'inline-block' }}>{status}</span>
              {paid && <span className="adm-pill paid" style={{ marginTop: 6, marginLeft: 6, display: 'inline-block' }}><Icon name="check" size={11} stroke={3} /> Paid</span>}
            </div>
          </div>
          <div className="adm-cust-stats">
            <div><span className="muted">Sales</span><b>{aff[2]}</b></div>
            <div><span className="muted">Total earned</span><b>{naira(aff[3])}</b></div>
            <div><span className="muted">Commission</span><b>10%</b></div>
          </div>
          <h4 className="adm-sec-label">Payout history</h4>
          <div className="adm-cust-orders">
            {payouts.map((p, i) => (
              <div className="adm-cust-order" key={i}>
                <div><b>{naira(p[1])}</b><small className="muted">{p[0]}</small></div>
                <span className="adm-pill ok">{p[2]}</span>
                <button className="adm-btn ghost sm" onClick={() => addToast('Statement downloaded')}><Icon name="download" size={14} /></button>
              </div>
            ))}
          </div>
          <div className="adm-drawer-foot">
            {status === 'Pending' && <>
              <button className="adm-btn danger" onClick={() => { act('Suspended', aff[0] + ' rejected'); onClose(); }}><Icon name="close" size={15} /> Reject</button>
              <button className="adm-btn primary" onClick={() => act('Approved', aff[0] + ' approved')}><Icon name="check" size={15} /> Approve</button>
            </>}
            {status === 'Approved' && <>
              <button className="adm-btn danger" onClick={() => act('Suspended', aff[0] + ' suspended')}><Icon name="close" size={15} /> Suspend</button>
              {paid
                ? <button className="adm-btn ghost" disabled><Icon name="check" size={15} /> Paid out</button>
                : <button className="adm-btn primary" onClick={() => { onPay && onPay(); addToast('Payout of ' + naira(aff[3]) + ' sent to ' + aff[0]); }}><Icon name="dollar" size={15} /> Process payout</button>}
            </>}
            {status === 'Suspended' && <button className="adm-btn primary" onClick={() => act('Approved', aff[0] + ' reinstated')}><Icon name="refresh" size={15} /> Reinstate</button>}
          </div>
        </div>
      </aside>
    </>
  );
}

function InviteAffiliateDrawer({ onClose }) {
  const addToast = useAdminToast();
  const [f, setF] = useState({ name: '', email: '', channel: '', rate: '10' });
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const send = () => {
    if (!f.name.trim() || !/^\S+@\S+\.\S+$/.test(f.email)) { addToast('Enter a name and valid email'); return; }
    addToast('Invite sent to ' + f.email);
    onClose();
  };
  return (
    <>
      <div className="adm-drawer-scrim" onClick={onClose} />
      <div className="adm-modal" role="dialog" aria-label="Invite affiliate">
        <div className="adm-drawer-h"><h3>Invite affiliate</h3><button className="adm-icon-btn" onClick={onClose} aria-label="Close"><Icon name="close" size={20} /></button></div>
        <div className="adm-drawer-body">
          <label className="adm-field"><span>Full name</span><input value={f.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Chidinma Okeke" /></label>
          <label className="adm-field"><span>Email</span><input value={f.email} onChange={e => set('email', e.target.value)} placeholder="affiliate@email.com" /></label>
          <label className="adm-field"><span>Primary channel</span><input value={f.channel} onChange={e => set('channel', e.target.value)} placeholder="e.g. Instagram · 84k" /></label>
          <label className="adm-field"><span>Commission rate (%)</span><input type="number" value={f.rate} onChange={e => set('rate', e.target.value)} /></label>
          <div className="adm-drawer-foot">
            <button className="adm-btn ghost" onClick={onClose}>Cancel</button>
            <button className="adm-btn primary" onClick={send}><Icon name="mail" size={15} /> Send invite</button>
          </div>
        </div>
      </div>
    </>
  );
}

export function AdminAffiliates() {
  const addToast = useAdminToast();
  const highlight = useSearchParams().get('highlight');
  useHighlight(highlight);
  const [view, setView] = useState(null);
  const [invite, setInvite] = useState(false);
  const [statusMap, setStatusMap] = useState({});
  const [paidMap, setPaidMap] = useState({});
  const [q, setQ] = useState('');
  const [tab, setTab] = useState('All');
  const stOf = (a) => statusMap[a[0]] || a[4];
  const setSt = (a, s) => setStatusMap(m => ({ ...m, [a[0]]: s }));
  const markPaid = (a) => setPaidMap(m => ({ ...m, [a[0]]: true }));
  const tabs = ['All', 'Approved', 'Pending', 'Suspended'];
  const list = ADMIN_AFFILIATES.filter(a => (tab === 'All' || stOf(a) === tab) && (!q || a[0].toLowerCase().includes(q.toLowerCase()) || a[1].toLowerCase().includes(q.toLowerCase())));
  const [pg, setPg] = useState(1);
  const perPage = 10;
  const pages = Math.max(1, Math.ceil(list.length / perPage));
  const cur = Math.min(pg, pages);
  const shown = list.slice((cur - 1) * perPage, cur * perPage);
  useEffect(() => { setPg(1); }, [q, tab]);
  return (
    <>
      <AdmHead title="Affiliates" sub="Manage partners, commissions and payouts"><button className="adm-btn primary" onClick={() => setInvite(true)}><Icon name="plus" size={15} /> Invite affiliate</button></AdmHead>
      <div className="kpi-grid">
        <Kpi ic="share" tint="#0438B6" label="Active affiliates" val="1,284" delta="9%" up />
        <Kpi ic="dollar" tint="#1F8A5B" label="Affiliate revenue" val={naira(2840000)} delta="18%" up />
        <Kpi ic="eye" tint="#F67208" label="Avg conversion" val="4.2%" delta="0.6%" up />
        <Kpi ic="truck" tint="#7A5AE0" label="Pending payouts" val={naira(486000)} delta="" up />
      </div>
      <div className="adm-filters">
        <div className="adm-mini-search"><Icon name="search" size={16} className="muted" /><input placeholder="Search affiliates or channel…" value={q} onChange={e => setQ(e.target.value)} /></div>
        {tabs.map(t => <button key={t} className={'adm-chip' + (tab === t ? ' on' : '')} onClick={() => setTab(t)}>{t}</button>)}
      </div>
      <div className="panel" style={{ padding: 0 }}>
        <div className="panel-h" style={{ padding: '18px 20px 0' }}><h3>All affiliates <span className="muted" style={{ fontWeight: 400 }}>· {list.length}</span></h3></div>
        <div className="adm-table-wrap"><table className="adm-table">
          <thead><tr><th>Affiliate</th><th>Channel</th><th>Sales</th><th>Earnings</th><th>Status</th><th></th></tr></thead>
          <tbody>{shown.map((a, i) => { const st = stOf(a); return (
            <tr key={i} data-hlkey={a[0]}>
              <td><div className="adm-prod"><span className="adm-li-av">{a[0].split(' ').map(w => w[0]).join('').slice(0, 2)}</span><div><b>{a[0]}</b></div></div></td>
              <td className="muted">{a[1]}</td><td>{a[2]}</td><td><b>{naira(a[3])}</b></td>
              <td><span className={'adm-pill ' + (st === 'Approved' ? 'ok' : st === 'Pending' ? 'warn' : 'bad')}>{st}</span>{paidMap[a[0]] && <span className="adm-pill paid" style={{ marginLeft: 6 }}><Icon name="check" size={11} stroke={3} /> Paid</span>}</td>
              <td><div className="adm-rowact">{st === 'Pending' ? <><button title="Approve" onClick={() => { setSt(a, 'Approved'); addToast(a[0] + ' approved'); }}><Icon name="check" size={15} /></button><button className="del" title="Reject" onClick={() => { setSt(a, 'Suspended'); addToast(a[0] + ' rejected'); }}><Icon name="close" size={15} /></button></> : <><button title="View" onClick={() => setView(a)}><Icon name="eye" size={15} /></button><button title="Pay out" className={paidMap[a[0]] ? 'paid' : ''} onClick={() => { markPaid(a); addToast('Payout of ' + naira(a[3]) + ' sent to ' + a[0]); }}><Icon name="dollar" size={15} /></button></>}</div></td>
            </tr>
          ); })}</tbody>
        </table>{list.length === 0 && <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-faint)' }}>No affiliates match your search.</div>}
        <Pager page={cur} pages={pages} onPage={setPg} /></div>
      </div>
      {view && <AffiliateDrawer aff={view} status={stOf(view)} paid={!!paidMap[view[0]]} onStatusChange={(s) => setSt(view, s)} onPay={() => markPaid(view)} onClose={() => setView(null)} />}
      {invite && <InviteAffiliateDrawer onClose={() => setInvite(false)} />}
    </>
  );
}

/* ---------- REFERRALS ---------- */
export function AdminReferrals() {
  return (
    <>
      <AdmHead title="Referrals" sub="Lim Cash reward program" />
      <div className="kpi-grid">
        <Kpi ic="dollar" tint="#1F8A5B" label="Reward per referral" val={naira(5000)} delta="" up />
        <Kpi ic="user" tint="#0438B6" label="Successful referrals" val="1,842" delta="11%" up />
        <Kpi ic="gift" tint="#F67208" label="Lim Cash issued" val={naira(12894000)} delta="" up />
        <Kpi ic="refresh" tint="#7A5AE0" label="Redemption rate" val="62%" delta="4%" up />
      </div>
      <div className="adm-row c2">
        <div className="panel"><div className="panel-h"><h3>Referrals over time</h3></div><BarChart data={[120, 142, 168, 154, 196, 228, 254, 286]} labels={['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8']} alt /></div>
        <div className="panel"><div className="panel-h"><h3>Program settings</h3></div>
          <div className="adm-list">
            <div className="adm-li"><div className="adm-li-main"><b>Reward amount</b><small>Lim Cash per completed referral</small></div><input className="cfg-row" style={{ width: 90, textAlign: 'center', padding: 7, border: '1.5px solid var(--border)', borderRadius: 8, background: 'var(--surface)' }} defaultValue="₦7,000" /></div>
            <div className="adm-li"><div className="adm-li-main"><b>Min. payout order</b><small>Friend’s first order minimum</small></div><input style={{ width: 90, textAlign: 'center', padding: 7, border: '1.5px solid var(--border)', borderRadius: 8, background: 'var(--surface)' }} defaultValue="₦10,000" /></div>
            <div className="adm-li"><div className="adm-li-main"><b>Program active</b><small>Enable referral earning</small></div><Toggle defaultOn /></div>
          </div>
        </div>
      </div>
    </>
  );
}
