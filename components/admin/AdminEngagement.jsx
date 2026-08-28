'use client';
/* Engagement nav group (Spin & Win, Videos, Elo AI) — ported verbatim from
   legacy/admin-sections.jsx. `window.admToast` calls replaced with `useAdminToast()`;
   `window.VIDEOS`/`window.VID_POSTER`/`window.fmtViews` replaced with imports from
   `@/components/video/Video` (that module is being ported separately). */
import { useState } from 'react';
import { Icon } from '@/components/icons/Icon';
import { Thumb, REAL_IMG } from '@/components/ui/Shared';
import { naira, PRODUCTS } from '@/lib/data';
import { Kpi, BarChart } from '@/components/charts/Charts';
import { VIDEOS, VID_POSTER, fmtViews } from '@/components/video/Video';
import { useAdminToast } from './AdminToastContext';
import { AdmHead, Pager, usePager, Toggle, AdmSelect } from './AdminShared';

/* ---------- SPIN & WIN ---------- */
export function AdminSpin() {
  const addToast = useAdminToast();
  const PALETTE = ['#0438B6', '#2F4BDB', '#F67208', '#7A5AE0', '#1F8A5B', '#0E9BD6', '#D6247C', '#F5A623', '#E5484D', '#0EA5A5'];
  const [prizes, setPrizes] = useState([
    { name: '5% OFF', weight: 35, color: '#0438B6' },
    { name: '10% OFF', weight: 25, color: '#2F4BDB' },
    { name: '₦5,000', weight: 15, color: '#F67208' },
    { name: '20% OFF', weight: 8, color: '#7A5AE0' },
    { name: '₦1,000', weight: 10, color: '#1F8A5B' },
    { name: '₦2,500', weight: 5, color: '#0E9BD6' },
    { name: 'Free Shipping', weight: 0, color: '#D6247C' },
    { name: 'Mystery Gift', weight: 2, color: '#F5A623' },
  ]);
  const [swatch, setSwatch] = useState(-1);
  const upd = (i, k, v) => setPrizes(ps => ps.map((p, j) => j === i ? { ...p, [k]: v } : p));
  const total = prizes.reduce((s, p) => s + (Number(p.weight) || 0), 0);
  const t = (m) => addToast(m);
  return (
    <>
      <AdmHead title="Spin & Win" sub="Signup roulette rewards & probabilities">
        <button className="adm-btn ghost" onClick={() => setPrizes(ps => [...ps, { name: 'New reward', weight: 0, color: PALETTE[ps.length % PALETTE.length] }])}><Icon name="plus" size={15} /> Add reward</button>
      </AdmHead>
      <div className="kpi-grid">
        <Kpi ic="gift" tint="#F67208" label="Total spins" val="3,418" delta="22%" up />
        <Kpi ic="tag" tint="#0438B6" label="Coupons generated" val="3,418" delta="22%" up />
        <Kpi ic="check" tint="#1F8A5B" label="Coupons redeemed" val="1,204" delta="9%" up />
        <Kpi ic="dollar" tint="#7A5AE0" label="Revenue attributed" val={naira(8420000)} delta="16%" up />
      </div>
      <div className="adm-row c2">
        <div className="panel"><div className="panel-h"><h3>Reward probabilities</h3><span className={'muted' + (total !== 100 ? ' warn-text' : '')} style={{ fontSize: 12.5, fontWeight: 700, color: total !== 100 ? 'var(--gold)' : 'var(--success)' }}>{total}% total</span></div>
          <div className="cfg-grid">{prizes.map((p, i) => (
            <div className="cfg-row" key={i}>
              <div className="cfg-sw-wrap">
                <button className="cfg-sw" style={{ background: p.color }} onClick={() => setSwatch(swatch === i ? -1 : i)} aria-label="Change colour" />
                {swatch === i && (
                  <>
                    <div className="cfg-sw-scrim" onClick={() => setSwatch(-1)} />
                    <div className="cfg-sw-pop">{PALETTE.map(c => <button key={c} className={'cfg-sw-opt' + (p.color === c ? ' on' : '')} style={{ background: c }} onClick={() => { upd(i, 'color', c); setSwatch(-1); }} />)}</div>
                  </>
                )}
              </div>
              <input className="cfg-name" value={p.name} onChange={e => upd(i, 'name', e.target.value)} placeholder="Reward name" />
              <input className="cfg-val" type="number" value={p.weight} onChange={e => upd(i, 'weight', e.target.value)} />
              <span className="pct-tag">%</span>
              <button className="cfg-del" onClick={() => setPrizes(ps => ps.filter((_, j) => j !== i))} aria-label="Remove reward"><Icon name="trash" size={14} /></button>
            </div>
          ))}</div>
          <button className="adm-btn primary" style={{ marginTop: 14 }} onClick={() => t('Reward configuration saved')}>Save rewards</button>
        </div>
        <div className="panel"><div className="panel-h"><h3>Settings</h3></div>
          <div className="adm-list">
            <div className="adm-li"><div className="adm-li-main"><b>Wheel enabled</b><small>Show on signup</small></div><Toggle defaultOn /></div>
            <div className="adm-li"><div className="adm-li-main"><b>Coupon expiry</b><small>Days valid after win</small></div><input style={{ width: 70, textAlign: 'center', padding: 7, border: '1.5px solid var(--border)', borderRadius: 8, background: 'var(--surface)' }} defaultValue="7" /></div>
            <div className="adm-li"><div className="adm-li-main"><b>One spin per account</b><small>Anti-abuse lock</small></div><Toggle defaultOn locked /></div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- VIDEOS ---------- */
export function AdminVideos() {
  const addToast = useAdminToast();
  const V = VIDEOS || [];
  const [edit, setEdit] = useState(null);
  const [assign, setAssign] = useState(null);
  const t = (m) => addToast(m);
  const { shown: vShown, page: vPage, pages: vPages, setPage: vSet } = usePager(V, '');
  return (
    <>
      <AdmHead title="Videos" sub={`${V.length} videos · demos, reviews, reels`}><button className="adm-btn primary" onClick={() => setEdit({ _new: true, title: '', cat: 'Demos', dur: '0:30' })}><Icon name="plus" size={15} /> Upload video</button></AdmHead>
      <div className="kpi-grid">
        <Kpi ic="eye" tint="#0438B6" label="Total views" val="438K" delta="19%" up />
        <Kpi ic="clock" tint="#1F8A5B" label="Avg watch time" val="42s" delta="3%" up />
        <Kpi ic="bag" tint="#F67208" label="Product clicks" val="12.4K" delta="11%" up />
        <Kpi ic="dollar" tint="#7A5AE0" label="Sales from video" val={naira(3640000)} delta="24%" up />
      </div>
      <div className="panel" style={{ padding: 0 }}>
        <div className="adm-table-wrap"><table className="adm-table">
          <thead><tr><th>Video</th><th>Category</th><th>Views</th><th>Shoppable</th><th>Status</th><th></th></tr></thead>
          <tbody>{vShown.map(v => (
            <tr key={v.id}>
              <td><div className="adm-prod"><span className="adm-prod-thumb"><img src={VID_POSTER[v.id]} alt="" /></span><div><b>{v.title}</b><small>{v.dur}</small></div></div></td>
              <td>{v.cat}</td><td>{fmtViews(v.views)}</td>
              <td>{v.products.length ? <span className="adm-pill ok">{v.products.length} tagged</span> : <span className="adm-pill muted">,</span>}</td>
              <td><span className="adm-pill ok">Live</span></td>
              <td><div className="adm-rowact"><button title="Edit" onClick={() => setEdit({ ...v })}><Icon name="edit" size={15} /></button><button title="Assign products" onClick={() => setAssign({ ...v, products: [...(v.products || [])] })}><Icon name="bag" size={15} /></button></div></td>
            </tr>
          ))}</tbody>
        </table><Pager page={vPage} pages={vPages} onPage={vSet} /></div>
      </div>
      {edit && <VideoEditDrawer draft={edit} onClose={() => setEdit(null)} onSave={() => { t(edit._new ? 'Video uploaded' : 'Video updated'); setEdit(null); }} />}
      {assign && <VideoAssignModal draft={assign} onClose={() => setAssign(null)} onSave={(ids) => { t(ids.length + ' product(s) tagged to ' + assign.title); setAssign(null); }} />}
    </>
  );
}

/* module-scope, mirrors the legacy `window.ADMIN_VIDEO_CATS` mutable global */
let ADMIN_VIDEO_CATS = ['Demos', 'Unboxing', 'Reviews', 'How-to', 'Lookbook', 'Brand', 'Promo'];

function VideoEditDrawer({ draft, onClose, onSave }) {
  const addToast = useAdminToast();
  const [f, setF] = useState(draft);
  const [, vforce] = useState(0);
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const addVCat = (name) => {
    if (!ADMIN_VIDEO_CATS.includes(name)) ADMIN_VIDEO_CATS.push(name);
    set('cat', name); vforce(n => n + 1);
    addToast('Category “' + name + '” added');
  };
  return (
    <div className="role-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="role-modal">
        <div className="role-modal-h">
          <div className="row" style={{ gap: 12 }}>
            <span className="kpi-ic" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}><Icon name="video" size={18} /></span>
            <div><h3 style={{ fontSize: 18 }}>{f._new ? 'Upload video' : 'Edit video'}</h3><small className="muted">Video details & assignment</small></div>
          </div>
          <button className="role-modal-x" onClick={onClose} aria-label="Close"><Icon name="close" size={18} /></button>
        </div>
        <div className="role-modal-b">
          <label className="adm-img-drop" style={{ height: 160 }}>
            {f.id && !f._file ? <img src={VID_POSTER[f.id]} alt="" className="adm-img-preview" /> : f._file ? <span className="adm-img-empty"><Icon name="check" size={26} stroke={3} /><b>{f._file}</b><small>Ready to upload · {f.dur || 'duration detected on upload'}</small></span> : <span className="adm-img-empty"><Icon name="video" size={26} /><b>Upload video file</b><small>MP4, MOV or WEBM · up to 500MB</small></span>}
            <input type="file" accept="video/mp4,video/quicktime,video/webm" hidden onChange={(e) => { const fl = e.target.files && e.target.files[0]; if (fl) { set('_file', fl.name); set('dur', ['0:48', '1:12', '1:30', '2:05'][Math.floor(Math.random() * 4)]); addToast('Video attached, duration detected'); } }} />
          </label>
          <label className="adm-field"><span>Title</span><input value={f.title} onChange={e => set('title', e.target.value)} placeholder="Video title" /></label>
          <div className="adm-field-row">
            <label className="adm-field"><span>Category</span>
              <AdmSelect value={f.cat} options={ADMIN_VIDEO_CATS} onChange={v => set('cat', v)} creatable onCreate={addVCat} />
            </label>
            <label className="adm-field"><span>Duration</span><input value={f.dur || ''} readOnly placeholder="Auto-detected" title="Duration is detected automatically from the uploaded file" style={{ opacity: .7, cursor: 'not-allowed' }} /></label>
          </div>
          <div className="adm-li" style={{ padding: '4px 0' }}><div className="adm-li-main"><b>Published</b><small>Visible on storefront</small></div><Toggle defaultOn /></div>
        </div>
        <div className="role-modal-f"><button className="adm-btn ghost" onClick={onClose}>Cancel</button><button className="adm-btn primary" onClick={onSave}>{f._new ? 'Upload' : 'Save changes'}</button></div>
      </div>
    </div>
  );
}

function VideoAssignModal({ draft, onClose, onSave }) {
  const [sel, setSel] = useState(draft.products || []);
  const [q, setQ] = useState('');
  const list = PRODUCTS.filter(p => !q || p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 30);
  const toggle = (id) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  return (
    <>
      <div className="adm-drawer-scrim" onClick={onClose} />
      <div className="adm-modal" role="dialog" aria-label="Assign products">
        <div className="adm-drawer-h"><h3>Tag products · {draft.title}</h3><button className="adm-icon-btn" onClick={onClose} aria-label="Close"><Icon name="close" size={20} /></button></div>
        <div className="adm-drawer-body" style={{ paddingTop: 14 }}>
          <div className="adm-mini-search" style={{ marginBottom: 12 }}><Icon name="search" size={16} className="muted" /><input placeholder="Search products to tag…" value={q} onChange={e => setQ(e.target.value)} /></div>
          <div className="adm-assign-list">
            {list.map(p => (
              <button key={p.id} className={'adm-assign-row' + (sel.includes(p.id) ? ' on' : '')} onClick={() => toggle(p.id)}>
                <span className="adm-prod-thumb"><Thumb product={p} src={REAL_IMG[p.id]} /></span>
                <div className="adm-assign-info"><b>{p.name.split(',')[0]}</b><small>{naira(p.price)}</small></div>
                <span className="adm-assign-check">{sel.includes(p.id) && <Icon name="check" size={14} stroke={3} />}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="adm-drawer-f"><span className="muted" style={{ flex: 1, fontSize: 13, fontFamily: 'var(--font-display)', fontWeight: 600 }}>{sel.length} selected</span><button className="adm-btn ghost" onClick={onClose}>Cancel</button><button className="adm-btn primary" onClick={() => onSave(sel)}>Save tags</button></div>
      </div>
    </>
  );
}

/* ---------- ELO AI ---------- */
export function AdminElo() {
  const qs = [['Where is my order?', 412], ['Recommend a phone under ₦400k', 318], ['Do you have this in black?', 264], ['What’s the return policy?', 201], ['Best laptop for students', 188]];
  return (
    <>
      <AdmHead title="Elo AI" sub="Assistant performance & knowledge base"><button className="adm-btn ghost"><Icon name="download" size={15} /> Upload knowledge doc</button></AdmHead>
      <div className="kpi-grid">
        <Kpi ic="headset" tint="#0438B6" label="Conversations" val="1,932" delta="24%" up />
        <Kpi ic="check" tint="#1F8A5B" label="Resolution rate" val="87%" delta="3%" up />
        <Kpi ic="heart" tint="#D6247C" label="Satisfaction" val="4.6/5" delta="0.2" up />
        <Kpi ic="bag" tint="#F67208" label="AI-driven sales" val={naira(1980000)} delta="15%" up />
      </div>
      <div className="adm-row c2">
        <div className="panel"><div className="panel-h"><h3>Most asked questions</h3></div>
          <div className="adm-list">{qs.map((qq, i) => <div className="adm-li" key={i}><span className="adm-li-av">{i + 1}</span><div className="adm-li-main"><b style={{ fontSize: 13.5 }}>{qq[0]}</b></div><b style={{ fontFamily: 'var(--font-display)' }}>{qq[1]}</b></div>)}</div>
        </div>
        <div className="panel"><div className="panel-h"><h3>Conversation volume</h3></div><BarChart data={[180, 210, 264, 248, 312, 356, 402]} labels={['M', 'T', 'W', 'T', 'F', 'S', 'S']} alt /></div>
      </div>
    </>
  );
}
