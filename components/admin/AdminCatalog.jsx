'use client';
/* Catalog nav group (Products, Inventory, Orders, Coupons) — ported verbatim from
   legacy/admin-sections.jsx. `window.admToast` calls were replaced with `useAdminToast()`;
   `window.__admHL` cross-page highlight was replaced with `useHighlight()` reading
   `useSearchParams().get('highlight')` (see AdminOrders / AdminInventory below). */
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@/components/icons/Icon';
import { Thumb, REAL_IMG } from '@/components/ui/Shared';
import { naira, PRODUCTS, CATEGORIES } from '@/lib/data';
import { Kpi, STATUS_CLS } from '@/components/charts/Charts';
import { useAdminToast } from './AdminToastContext';
import { AdmHead, Pager, usePager, AdmSelect, AdmDate, ADMIN_ORDERS, useHighlight } from './AdminShared';

/* ---------- PRODUCTS ---------- */
/* module-scope, mirrors the legacy `window.ADMIN_EXTRA_CATS` mutable global */
let ADMIN_EXTRA_CATS = [];

export function AdminProducts() {
  const addToast = useAdminToast();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [sort, setSort] = useState('featured');
  const [stat, setStat] = useState('All status');
  const [removed, setRemoved] = useState([]);
  const [edits, setEdits] = useState({}); // id -> overrides
  const [editing, setEditing] = useState(null); // product being edited
  const [bulk, setBulk] = useState(false);
  const cats = ['all', ...new Set(PRODUCTS.map(p => p.category))];
  const view = (p) => ({ ...p, ...(edits[p.id] || {}) });
  const stock = (p) => edits[p.id]?.stock != null ? edits[p.id].stock : p.id.charCodeAt(1) * 7 % 60;
  const statusOf = (s) => s === 0 ? 'Out of stock' : s < 10 ? 'Low stock' : 'Active';
  let list = PRODUCTS.filter(p => !removed.includes(p.id) && (cat === 'all' || p.category === cat) && (!q || view(p).name.toLowerCase().includes(q.toLowerCase())) && (stat === 'All status' || statusOf(stock(p)) === stat));
  list = [...list].sort((a, b) => {
    if (sort === 'price-low') return view(a).price - view(b).price;
    if (sort === 'price-high') return view(b).price - view(a).price;
    if (sort === 'name-az') return view(a).name.localeCompare(view(b).name);
    if (sort === 'stock-low') return stock(a) - stock(b);
    if (sort === 'stock-high') return stock(b) - stock(a);
    return 0;
  });
  const { shown: pShown, page: pPage, pages: pPages, setPage: pSet } = usePager(list, q + cat + sort + stat);
  const t = (m) => addToast(m);
  return (
    <>
      <AdmHead title="Products" sub={`${PRODUCTS.length} products across ${cats.length - 1} categories`}>
        <button className="adm-btn ghost" onClick={() => setBulk(true)}><Icon name="download" size={15} /> Bulk upload</button>
        <button className="adm-btn primary" onClick={() => setEditing({ id: 'new', name: '', brand: '', price: 0, category: cats[1] || 'phones', _stock: 20, _new: true })}><Icon name="plus" size={15} /> Add product</button>
      </AdmHead>
      <div className="adm-filters">
        <div className="adm-mini-search"><Icon name="search" size={16} className="muted" /><input placeholder="Search products…" value={q} onChange={e => setQ(e.target.value)} /></div>
        {cats.slice(0, 6).map(c => <button key={c} className={'adm-chip' + (cat === c ? ' on' : '')} onClick={() => setCat(c)}>{c === 'all' ? 'All' : (CATEGORIES.find(x => x.slug === c)?.name || c)}</button>)}
        <div className="adm-filters-r">
          <AdmSelect compact icon="filter" title="Filter by status" value={stat} options={['All status', 'Active', 'Low stock', 'Out of stock']} onChange={setStat} />
          <AdmSelect compact icon="sort" title="Sort by" value={sort} options={[{ value: 'featured', label: 'Featured' }, { value: 'price-low', label: 'Price: Low → High' }, { value: 'price-high', label: 'Price: High → Low' }, { value: 'name-az', label: 'Name: A → Z' }, { value: 'stock-low', label: 'Stock: Low → High' }, { value: 'stock-high', label: 'Stock: High → Low' }]} onChange={setSort} />
        </div>
      </div>
      <div className="panel" style={{ padding: 0 }}>
        <div className="adm-table-wrap"><table className="adm-table">
          <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead>
          <tbody>{pShown.map(raw => { const p = view(raw); const s = stock(raw); return (
            <tr key={raw.id}>
              <td><div className="adm-prod"><span className="adm-prod-thumb"><Thumb product={raw} src={REAL_IMG[raw.id]} /></span><div><b>{p.name.split(',')[0]}</b><small>{p.brand} · {raw.slug}</small></div></div></td>
              <td>{CATEGORIES.find(x => x.slug === p.category)?.name || p.category}</td>
              <td><b>{naira(p.price)}</b></td>
              <td>{s}</td>
              <td><span className={'adm-pill ' + (s === 0 ? 'bad' : s < 10 ? 'warn' : 'ok')}>{statusOf(s)}</span></td>
              <td><div className="adm-rowact"><button title="Edit" onClick={() => setEditing({ id: raw.id, name: p.name, brand: p.brand, price: p.price, category: p.category, _stock: s, _raw: raw })}><Icon name="edit" size={15} /></button><button className="del" title="Delete" onClick={() => { setRemoved(r => [...r, raw.id]); t('Product deleted'); }}><Icon name="trash" size={15} /></button></div></td>
            </tr>
          ); })}</tbody>
        </table>{list.length === 0 && <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-faint)' }}>No products match your filters.</div>}<Pager page={pPage} pages={pPages} onPage={pSet} /></div>
      </div>
      {editing && <ProductEditDrawer draft={editing} onClose={() => setEditing(null)} onSave={(d) => {
        if (d._new) { t('Product created'); }
        else { setEdits(e => ({ ...e, [d.id]: { name: d.name, brand: d.brand, price: Number(d.price) || 0, category: d.category, stock: Number(d._stock) || 0, variants: d.variants || [] } })); t('Changes saved'); }
        setEditing(null);
      }} />}
      {bulk && <BulkUploadModal onClose={() => setBulk(false)} onDone={(n) => { addToast(n + ' products queued for import'); setBulk(false); }} />}
    </>
  );
}

function BulkUploadModal({ onClose, onDone }) {
  const [file, setFile] = useState(null);
  return (
    <>
      <div className="adm-drawer-scrim" onClick={onClose} />
      <div className="adm-modal" role="dialog" aria-label="Bulk upload">
        <div className="adm-drawer-h"><h3>Bulk product upload</h3><button className="adm-icon-btn" onClick={onClose} aria-label="Close"><Icon name="close" size={20} /></button></div>
        <div className="adm-drawer-body">
          <label className="adm-img-drop" style={{ height: 150 }}>
            {file
              ? <span className="adm-img-empty"><Icon name="check" size={26} stroke={3} /><b>{file}</b><small>Ready to import</small></span>
              : <span className="adm-img-empty"><Icon name="download" size={26} /><b>Drop CSV / Excel file</b><small>or click to browse · .csv, .xlsx</small></span>}
            <input type="file" accept=".csv,.xlsx,.xls" hidden onChange={e => { const fl = e.target.files && e.target.files[0]; if (fl) setFile(fl.name); }} />
          </label>
          <div className="adm-note"><Icon name="info" size={15} /> Columns: name, brand, category, price, stock, description, image URL. <a>Download template</a></div>
        </div>
        <div className="adm-drawer-f">
          <button className="adm-btn ghost" onClick={onClose}>Cancel</button>
          <button className="adm-btn primary" disabled={!file} onClick={() => onDone(Math.floor(8 + Math.random() * 40))}>Import products</button>
        </div>
      </div>
    </>
  );
}

/* Per-product variations (colour, storage, size, …) — the uploader defines
   whichever groups actually apply to this product; ProductPage only renders
   the ones present, so nothing shows for products with none. */
function VariantGroupRow({ group, onChange, onRemove }) {
  const [name, setName] = useState('');
  const [hex, setHex] = useState('#0438B6');
  const addOption = () => {
    const v = name.trim();
    if (!v) return;
    const exists = group.options.some(o => (group.type === 'color' ? o.name : o) === v);
    if (exists) return;
    onChange({ options: [...group.options, group.type === 'color' ? { name: v, hex } : v] });
    setName('');
  };
  const removeOption = (oi) => onChange({ options: group.options.filter((_, i) => i !== oi) });
  return (
    <div className="adm-variant-group" style={{ border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: 14, marginBottom: 12 }}>
      <div className="adm-field-row" style={{ marginBottom: 10 }}>
        <label className="adm-field"><span>Variation name</span><input value={group.name} onChange={e => onChange({ name: e.target.value })} placeholder="e.g. Colour, Size" /></label>
        <label className="adm-field"><span>Type</span>
          <AdmSelect value={group.type} options={[{ value: 'text', label: 'Text options' }, { value: 'color', label: 'Colour swatches' }]} onChange={v => onChange({ type: v, options: [] })} />
        </label>
      </div>
      <div className="row" style={{ gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {group.options.map((o, oi) => (
          <span key={oi} className="adm-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {group.type === 'color' && <i style={{ width: 12, height: 12, borderRadius: '50%', background: o.hex, display: 'inline-block' }} />}
            {group.type === 'color' ? o.name : o}
            <button type="button" onClick={() => removeOption(oi)} aria-label="Remove option" style={{ display: 'inline-flex', color: 'inherit' }}><Icon name="close" size={11} /></button>
          </span>
        ))}
        {group.options.length === 0 && <span className="muted" style={{ fontSize: 12.5 }}>No options yet</span>}
      </div>
      <div className="adm-field-row" style={{ alignItems: 'flex-end' }}>
        <label className="adm-field" style={{ flex: 1 }}>
          <span>{group.type === 'color' ? 'Add colour' : 'Add option'}</span>
          <input value={name} onChange={e => setName(e.target.value)} placeholder={group.type === 'color' ? 'e.g. Cosmic Orange' : 'e.g. 256GB'} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addOption(); } }} />
        </label>
        {group.type === 'color' && (
          <label className="adm-field" style={{ width: 56 }}>
            <span>Swatch</span>
            <input type="color" value={hex} onChange={e => setHex(e.target.value)} style={{ padding: 2, height: 42 }} />
          </label>
        )}
        <button type="button" className="adm-btn ghost" onClick={addOption}>Add</button>
      </div>
      <button type="button" className="adm-btn ghost del" style={{ marginTop: 10 }} onClick={onRemove}><Icon name="trash" size={13} /> Remove variation</button>
    </div>
  );
}

function VariantsEditor({ variants, onChange }) {
  const groups = variants || [];
  const updateGroup = (i, patch) => onChange(groups.map((g, gi) => gi === i ? { ...g, ...patch } : g));
  return (
    <div className="adm-field">
      <span>Variations</span>
      {groups.map((g, i) => (
        <VariantGroupRow key={i} group={g} onChange={patch => updateGroup(i, patch)} onRemove={() => onChange(groups.filter((_, gi) => gi !== i))} />
      ))}
      <button type="button" className="adm-btn ghost" style={{ alignSelf: 'flex-start' }} onClick={() => onChange([...groups, { name: '', type: 'text', options: [] }])}>
        <Icon name="plus" size={14} /> Add variation
      </button>
    </div>
  );
}

function ProductEditDrawer({ draft, onClose, onSave }) {
  const addToast = useAdminToast();
  const [f, setF] = useState({ ...draft, variants: draft.variants || draft._raw?.variants || [] });
  const [, force] = useState(0);
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const cats = [...CATEGORIES, ...ADMIN_EXTRA_CATS];
  const addCat = (name) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!cats.some(c => c.slug === slug)) ADMIN_EXTRA_CATS.push({ slug, name });
    set('category', slug); force(n => n + 1);
    addToast('Category “' + name + '” added');
  };
  return (
    <>
      <div className="adm-drawer-scrim" onClick={onClose} />
      <aside className="adm-drawer" role="dialog" aria-label="Edit product">
        <div className="adm-drawer-h">
          <h3>{f._new ? 'Add product' : 'Edit product'}</h3>
          <button className="adm-icon-btn" onClick={onClose} aria-label="Close"><Icon name="close" size={20} /></button>
        </div>
        <div className="adm-drawer-body">
          <label className="adm-img-drop">
            {f._img
              ? <img src={f._img} alt="preview" className="adm-img-preview" />
              : (!f._new && f._raw)
                ? <div className="adm-drawer-thumb" style={{ height: '100%' }}><Thumb product={f._raw} src={REAL_IMG[f._raw.id]} /></div>
                : <span className="adm-img-empty"><Icon name="download" size={26} /><b>Add product photo</b><small>Click to upload, JPG, PNG or WEBP</small></span>}
            <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e => {
              const file = e.target.files && e.target.files[0]; if (!file) return;
              const r = new FileReader(); r.onload = () => set('_img', r.result); r.readAsDataURL(file);
            }} />
            {f._img && <span className="adm-img-replace"><Icon name="edit" size={13} /> Change photo</span>}
          </label>
          <label className="adm-field"><span>Product name</span><input value={f.name} onChange={e => set('name', e.target.value)} placeholder="Product name" /></label>
          <label className="adm-field"><span>Brand</span><input value={f.brand} onChange={e => set('brand', e.target.value)} placeholder="Brand" /></label>
          <div className="adm-field-row">
            <label className="adm-field"><span>Price (₦)</span><input type="number" value={f.price} onChange={e => set('price', e.target.value)} /></label>
            <label className="adm-field"><span>Stock</span><input type="number" value={f._stock} onChange={e => set('_stock', e.target.value)} /></label>
          </div>
          <label className="adm-field"><span>Category</span>
            <AdmSelect value={f.category} options={cats.map(c => ({ value: c.slug, label: c.name }))} onChange={v => set('category', v)} creatable onCreate={addCat} />
          </label>
          <label className="adm-field"><span>Description</span><textarea rows={3} value={f.desc || (f._raw && f._raw.desc) || ''} onChange={e => set('desc', e.target.value)} placeholder="Short product description" /></label>
          <VariantsEditor variants={f.variants} onChange={v => set('variants', v)} />
        </div>
        <div className="adm-drawer-f">
          <button className="adm-btn ghost" onClick={onClose}>Cancel</button>
          <button className="adm-btn primary" onClick={() => onSave(f)}>{f._new ? 'Create product' : 'Save changes'}</button>
        </div>
      </aside>
    </>
  );
}

/* ---------- ORDERS ---------- */
function InvoiceModal({ order, onClose }) {
  const addToast = useAdminToast();
  const lines = [
    ['Wireless Noise-Cancelling Headphones', 1, Math.round(order.total * 0.46)],
    ['Fast Charge Power Bank 20,000mAh', 1, Math.round(order.total * 0.22)],
    ['USB-C Braided Cable (2m)', 2, Math.round(order.total * 0.08)],
  ];
  const sub = lines.reduce((s, l) => s + l[2] * l[1], 0);
  const ship = Math.max(0, order.total - sub);
  return (
    <>
      <div className="adm-drawer-scrim" onClick={onClose} />
      <div className="adm-modal inv-modal" role="dialog" aria-label="Invoice">
        <div className="adm-drawer-h">
          <h3>Invoice · {order.id}</h3>
          <button className="adm-icon-btn" onClick={onClose} aria-label="Close"><Icon name="close" size={20} /></button>
        </div>
        <div className="adm-drawer-body">
          <div className="inv-top">
            <div className="inv-brand"><img src="/assets/logo.png" alt="Limitra" className="inv-logo" /><small className="muted">Lagos, Nigeria · support@limitra.com.ng</small></div>
            <div className="inv-meta">
              <div><span className="muted">Invoice</span><b>{order.id.replace('LMT', 'INV')}</b></div>
              <div><span className="muted">Date</span><b>{order.date}</b></div>
              <div><span className="muted">Status</span><span className={'adm-pill ' + (STATUS_CLS[order.status] || 'muted')}>{order.status}</span></div>
            </div>
          </div>
          <div className="inv-billto"><span className="muted">Billed to</span><b>{order.customer}</b></div>
          <table className="inv-table">
            <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Amount</th></tr></thead>
            <tbody>{lines.map((l, i) => (
              <tr key={i}><td>{l[0]}</td><td>{l[1]}</td><td>{naira(l[2])}</td><td><b>{naira(l[2] * l[1])}</b></td></tr>
            ))}</tbody>
          </table>
          <div className="inv-totals">
            <div><span className="muted">Subtotal</span><span>{naira(sub)}</span></div>
            <div><span className="muted">Shipping</span><span>{ship === 0 ? 'Free' : naira(ship)}</span></div>
            <div className="inv-grand"><span>Total</span><b>{naira(order.total)}</b></div>
          </div>
          <div className="adm-drawer-foot">
            <button className="adm-btn ghost" onClick={onClose}>Close</button>
            <button className="adm-btn primary" onClick={() => addToast('Invoice ' + order.id + ' downloaded (PDF)')}><Icon name="download" size={15} /> Download PDF</button>
          </div>
        </div>
      </div>
    </>
  );
}

export function AdminOrders() {
  const highlight = useSearchParams().get('highlight');
  useHighlight(highlight);
  const [status, setStatus] = useState('All');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('recent');
  const [invoice, setInvoice] = useState(null);
  const O = ADMIN_ORDERS, CLS = STATUS_CLS;
  const tabs = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];
  let list = O.filter(o => (status === 'All' || o.status === status) && (!q || o.id.toLowerCase().includes(q.toLowerCase()) || (o.customer || '').toLowerCase().includes(q.toLowerCase())));
  list = [...list].sort((a, b) => {
    if (sort === 'total-high') return b.total - a.total;
    if (sort === 'total-low') return a.total - b.total;
    if (sort === 'items') return b.items - a.items;
    if (sort === 'oldest') return O.indexOf(b) - O.indexOf(a);
    return O.indexOf(a) - O.indexOf(b);
  });
  const { shown: oShown, page: oPage, pages: oPages, setPage: oSet } = usePager(list, q + status + sort);
  return (
    <>
      <AdmHead title="Orders" sub={`${O.length} total orders`}>
        <button className="adm-btn ghost"><Icon name="download" size={15} /> Export CSV</button>
      </AdmHead>
      <div className="adm-filters">
        <div className="adm-mini-search"><Icon name="search" size={16} className="muted" /><input placeholder="Search order # or customer…" value={q} onChange={e => setQ(e.target.value)} /></div>
        {tabs.map(t => <button key={t} className={'adm-chip' + (status === t ? ' on' : '')} onClick={() => setStatus(t)}>{t}</button>)}
        <div className="adm-filters-r">
          <AdmSelect compact icon="sort" title="Sort by" value={sort} options={[{ value: 'recent', label: 'Most recent' }, { value: 'oldest', label: 'Oldest first' }, { value: 'total-high', label: 'Total: High → Low' }, { value: 'total-low', label: 'Total: Low → High' }, { value: 'items', label: 'Most items' }]} onChange={setSort} />
        </div>
      </div>
      <div className="panel" style={{ padding: 0 }}>
        <div className="adm-table-wrap"><table className="adm-table">
          <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th></th></tr></thead>
          <tbody>{oShown.map(o => (
            <tr key={o.id} data-hlkey={o.id + ' ' + (o.customer || '')}>
              <td><b style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5 }}>{o.id}</b></td>
              <td>{o.customer}</td><td className="muted">{o.date}</td><td>{o.items}</td><td><b>{naira(o.total)}</b></td>
              <td><span className={'adm-pill ' + (CLS[o.status] || 'muted')}>{o.status}</span></td>
              <td><div className="adm-rowact"><button title="View invoice" onClick={() => setInvoice(o)}><Icon name="eye" size={15} /></button><button title="Download invoice" onClick={() => setInvoice(o)}><Icon name="download" size={15} /></button></div></td>
            </tr>
          ))}</tbody>
        </table>{list.length === 0 && <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-faint)' }}>No orders match your filters.</div>}<Pager page={oPage} pages={oPages} onPage={oSet} /></div>
      </div>
      {invoice && <InvoiceModal order={invoice} onClose={() => setInvoice(null)} />}
    </>
  );
}

/* ---------- COUPONS ---------- */
const ADMIN_COUPONS = [['WELCOME15', '15% off first order', 1204, 'Active'], ['CASH5K', '₦5,000 spin reward', 842, 'Active'], ['FLASH40', 'Flash sale 40%', 3120, 'Scheduled'], ['FREESHIP', 'Free shipping', 640, 'Active'], ['EID20', 'Eid promo 20%', 980, 'Expired']];
export function AdminCoupons() {
  const addToast = useAdminToast();
  const [coupons, setCoupons] = useState(ADMIN_COUPONS.map(c => ({ code: c[0], desc: c[1], uses: c[2], status: c[3] })));
  const [edit, setEdit] = useState(null);
  const t = (m) => addToast(m);
  const { shown: cpShown, page: cpPage, pages: cpPages, setPage: cpSet } = usePager(coupons, coupons.length);
  const save = (d) => {
    setCoupons(cs => {
      const i = cs.findIndex(c => c.code === d._orig);
      if (i >= 0) { const n = [...cs]; n[i] = { code: d.code, desc: d.desc, uses: cs[i].uses, status: d.status }; return n; }
      return [{ code: d.code, desc: d.desc, uses: 0, status: d.status }, ...cs];
    });
    t(d._orig ? 'Coupon updated' : 'Coupon created'); setEdit(null);
  };
  return (
    <>
      <AdmHead title="Coupons & Promotions" sub="Discounts, flash sales & campaigns"><button className="adm-btn primary" onClick={() => setEdit({ _new: true, code: '', desc: '', type: 'Percentage', value: '', status: 'Active' })}><Icon name="plus" size={15} /> Create coupon</button></AdmHead>
      <div className="panel" style={{ padding: 0 }}>
        <div className="adm-table-wrap"><table className="adm-table">
          <thead><tr><th>Code</th><th>Description</th><th>Uses</th><th>Status</th><th></th></tr></thead>
          <tbody>{cpShown.map((c, i) => (
            <tr key={i}><td><b style={{ fontFamily: 'var(--font-display)', letterSpacing: '.03em' }}>{c.code}</b></td><td className="muted">{c.desc}</td><td>{c.uses.toLocaleString()}</td>
              <td><span className={'adm-pill ' + (c.status === 'Active' ? 'ok' : c.status === 'Scheduled' ? 'info' : 'muted')}>{c.status}</span></td>
              <td><div className="adm-rowact"><button title="Edit" onClick={() => setEdit({ _orig: c.code, code: c.code, desc: c.desc, type: 'Percentage', value: '', status: c.status })}><Icon name="edit" size={15} /></button><button className="del" title="Delete" onClick={() => { setCoupons(cs => cs.filter(x => x.code !== c.code)); t('Coupon ' + c.code + ' deleted'); }}><Icon name="trash" size={15} /></button></div></td>
            </tr>
          ))}</tbody>
        </table><Pager page={cpPage} pages={cpPages} onPage={cpSet} /></div>
      </div>
      {edit && <CouponModal draft={edit} onClose={() => setEdit(null)} onSave={save} />}
      <AffPromoAdmin />
    </>
  );
}

function AffPromoAdmin() {
  const addToast = useAdminToast();
  const [max, setMax] = useState(1);
  const [codes, setCodes] = useState([]);
  useEffect(() => {
    try { setMax(parseInt(localStorage.getItem('lim_aff_promo_max') || '1', 10)); } catch (e) {}
    try { setCodes(JSON.parse(localStorage.getItem('lim_aff_promos') || '[]')); } catch (e) {}
  }, []);
  const saveMax = (v) => { const n = Math.max(0, Math.min(10, v)); setMax(n); localStorage.setItem('lim_aff_promo_max', String(n)); addToast('Affiliates can now create ' + n + ' code' + (n !== 1 ? 's' : '')); };
  const removeCode = (code) => { const next = codes.filter(c => c.code !== code); setCodes(next); localStorage.setItem('lim_aff_promos', JSON.stringify(next)); addToast('Affiliate code removed'); };
  return (
    <div style={{ marginTop: 24 }}>
      <div className="adm-row c2" style={{ alignItems: 'start' }}>
        <div className="panel">
          <div className="panel-h"><h3>Affiliate promo codes</h3></div>
          <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.6, marginBottom: 16 }}>Control how many promo codes each affiliate may create from their dashboard. Codes apply at checkout and are attributed to the affiliate.</p>
          <div className="adm-li"><div className="adm-li-main"><b>Codes allowed per affiliate</b><small>Super-admin controlled · 0 disables</small></div>
            <div className="aff-max-stepper"><button onClick={() => saveMax(max - 1)} disabled={max <= 0}><Icon name="minus" size={15} /></button><span>{max}</span><button onClick={() => saveMax(max + 1)} disabled={max >= 10}><Icon name="plus" size={15} /></button></div>
          </div>
        </div>
        <div className="panel" style={{ padding: 0 }}>
          <div className="panel-h" style={{ padding: '18px 20px 0' }}><h3>Active affiliate codes <span className="muted" style={{ fontWeight: 400 }}>· {codes.length}</span></h3></div>
          <div className="adm-table-wrap"><table className="adm-table">
            <thead><tr><th>Code</th><th>Affiliate</th><th>Discount</th><th>Uses</th><th></th></tr></thead>
            <tbody>{codes.map((c, i) => (
              <tr key={i}><td><b style={{ fontFamily: 'var(--font-display)', letterSpacing: '.03em' }}>{c.code}</b></td><td className="muted">{c.affName}</td><td>{Math.round(c.pct * 100)}%</td><td>{c.uses || 0}</td>
                <td><div className="adm-rowact"><button className="del" title="Revoke" onClick={() => removeCode(c.code)}><Icon name="trash" size={15} /></button></div></td></tr>
            ))}</tbody>
          </table>{codes.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-faint)' }}>No affiliate codes created yet.</div>}</div>
        </div>
      </div>
    </div>
  );
}

function CouponModal({ draft, onClose, onSave }) {
  const [f, setF] = useState(draft);
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  return (
    <>
      <div className="adm-drawer-scrim" onClick={onClose} />
      <div className="adm-modal" role="dialog" aria-label="Coupon">
        <div className="adm-drawer-h"><h3>{f._new ? 'Create coupon' : 'Edit coupon'}</h3><button className="adm-icon-btn" onClick={onClose} aria-label="Close"><Icon name="close" size={20} /></button></div>
        <div className="adm-drawer-body">
          <label className="adm-field"><span>Coupon code</span><input value={f.code} onChange={e => set('code', e.target.value.toUpperCase())} placeholder="e.g. WELCOME15" /></label>
          <label className="adm-field"><span>Description</span><input value={f.desc} onChange={e => set('desc', e.target.value)} placeholder="What the coupon does" /></label>
          <div className="adm-field-row">
            <label className="adm-field"><span>Type</span><AdmSelect value={f.type} options={['Percentage', 'Fixed amount', 'Free shipping']} onChange={v => set('type', v)} /></label>
            <label className="adm-field"><span>{f.type === 'Percentage' ? 'Percent off' : f.type === 'Fixed amount' ? 'Amount (₦)' : 'Value'}</span><input value={f.value} onChange={e => set('value', e.target.value)} placeholder={f.type === 'Percentage' ? '15' : '5000'} disabled={f.type === 'Free shipping'} /></label>
          </div>
          <div className="adm-field-row">
            <label className="adm-field"><span>Status</span><AdmSelect value={f.status} options={['Active', 'Scheduled', 'Expired']} onChange={v => set('status', v)} /></label>
            <label className="adm-field"><span>Expires</span><AdmDate value={f.expires} onChange={v => set('expires', v)} placeholder="Pick a date" /></label>
          </div>
        </div>
        <div className="adm-drawer-f"><button className="adm-btn ghost" onClick={onClose}>Cancel</button><button className="adm-btn primary" disabled={!f.code.trim()} onClick={() => onSave(f)}>{f._new ? 'Create coupon' : 'Save changes'}</button></div>
      </div>
    </>
  );
}

/* ---------- INVENTORY ---------- */
export function AdminInventory() {
  const addToast = useAdminToast();
  const highlight = useSearchParams().get('highlight');
  useHighlight(highlight);
  const [q, setQ] = useState('');
  const [stat, setStat] = useState('All');
  const [sort, setSort] = useState('stock-low');
  const stk = (p) => p.id.charCodeAt(1) * 3 % 12;
  const statusOf = (s) => s === 0 ? 'Out of stock' : s < 6 ? 'Low stock' : 'In stock';
  const base = PRODUCTS.filter((p, i) => i % 2 === 0).slice(0, 24);
  let low = base.filter(p => (!q || p.name.toLowerCase().includes(q.toLowerCase()) || p.slug.toLowerCase().includes(q.toLowerCase())) && (stat === 'All' || statusOf(stk(p)) === stat));
  low = [...low].sort((a, b) => {
    if (sort === 'stock-high') return stk(b) - stk(a);
    if (sort === 'name-az') return a.name.localeCompare(b.name);
    return stk(a) - stk(b);
  });
  const { shown: invShown, page: invPage, pages: invPages, setPage: invSet } = usePager(low, q + stat + sort);
  return (
    <>
      <AdmHead title="Inventory" sub="Stock levels & alerts" />
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <Kpi ic="package" tint="#0438B6" label="SKUs tracked" val={PRODUCTS.length} delta="" up />
        <Kpi ic="info" tint="#F5A623" label="Low stock" val="14" delta="" up />
        <Kpi ic="close" tint="#E5484D" label="Out of stock" val="3" delta="" up />
      </div>
      <div className="adm-filters">
        <div className="adm-mini-search"><Icon name="search" size={16} className="muted" /><input placeholder="Search products or SKU…" value={q} onChange={e => setQ(e.target.value)} /></div>
        <div className="adm-filters-r">
          <AdmSelect compact icon="filter" title="Filter by status" value={stat} options={['All', 'In stock', 'Low stock', 'Out of stock']} onChange={setStat} />
          <AdmSelect compact icon="sort" title="Sort by" value={sort} options={[{ value: 'stock-low', label: 'Stock: Low → High' }, { value: 'stock-high', label: 'Stock: High → Low' }, { value: 'name-az', label: 'Name: A → Z' }]} onChange={setSort} />
        </div>
      </div>
      <div className="panel" style={{ padding: 0 }}>
        <div className="panel-h" style={{ padding: '18px 20px 0' }}><h3>Stock levels</h3></div>
        <div className="adm-table-wrap"><table className="adm-table">
          <thead><tr><th>Product</th><th>SKU</th><th>In stock</th><th>Status</th><th></th></tr></thead>
          <tbody>{invShown.map((p) => { const s = stk(p); return (
            <tr key={p.id} data-hlkey={p.name}><td><div className="adm-prod"><span className="adm-prod-thumb"><Thumb product={p} src={REAL_IMG[p.id]} /></span><div><b>{p.name.split(',')[0]}</b></div></div></td>
              <td className="muted">{p.slug.slice(0, 12).toUpperCase()}</td><td>{s}</td>
              <td><span className={'adm-pill ' + (s === 0 ? 'bad' : s < 6 ? 'warn' : 'ok')}>{statusOf(s)}</span></td>
              <td><div className="adm-rowact"><button title="Restock" onClick={() => addToast('Restock order placed')}><Icon name="plus" size={15} /></button></div></td></tr>
          ); })}</tbody>
        </table>{low.length === 0 && <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-faint)' }}>No products match your filters.</div>}<Pager page={invPage} pages={invPages} onPage={invSet} /></div>
      </div>
    </>
  );
}
