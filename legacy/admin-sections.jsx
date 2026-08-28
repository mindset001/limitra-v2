/* LIMITRA Admin, management sections (products, orders, customers, affiliates, etc.) */
const { useState: useMState } = React;
const ML = window.LIMITRA;
const mn = ML.naira;
const MIcon = window.Icon;
const MThumb = window.Thumb;
const MREAL = window.REAL_IMG || {};

function AdmHead({ title, sub, children }) {
  return <div className="adm-h"><div><h1>{title}</h1><p>{sub}</p></div><div className="adm-h-actions">{children}</div></div>;
}

/* ---------- PRODUCTS ---------- */
function Pager({ page, pages, onPage }) {
  // windowed page list with ellipsis: 1 … (p-1) p (p+1) … last
  const nums = [];
  const push = (n) => { if (!nums.includes(n) && n >= 1 && n <= pages) nums.push(n); };
  push(1); push(2);
  push(page - 1); push(page); push(page + 1);
  push(pages - 1); push(pages);
  const seq = [...new Set(nums)].sort((a, b) => a - b);
  const withGaps = [];
  seq.forEach((n, i) => {
    if (i > 0 && n - seq[i - 1] > 1) withGaps.push('…');
    withGaps.push(n);
  });
  return (
    <div className="adm-pager">
      <button className="pg" disabled={page <= 1} onClick={() => onPage(page - 1)}><MIcon name="chevleft" size={16} /></button>
      {withGaps.map((n, i) => n === '…'
        ? <span key={'g' + i} className="pg-gap">…</span>
        : <button key={n} className={'pg' + (page === n ? ' on' : '')} onClick={() => onPage(n)}>{n}</button>)}
      <button className="pg" disabled={page >= pages} onClick={() => onPage(page + 1)}><MIcon name="chevright" size={16} /></button>
    </div>
  );
}
function usePager(list, q, extra) {
  const [pg, setPg] = useMState(1);
  const per = 10;
  const pages = Math.max(1, Math.ceil(list.length / per));
  const cur = Math.min(pg, pages);
  React.useEffect(() => { setPg(1); }, [q, extra]);
  return { shown: list.slice((cur - 1) * per, cur * per), page: cur, pages, setPage: setPg };
}

function AdminProducts() {
  const [q, setQ] = useMState('');
  const [cat, setCat] = useMState('all');
  const [sort, setSort] = useMState('featured');
  const [stat, setStat] = useMState('All status');
  const [removed, setRemoved] = useMState([]);
  const [edits, setEdits] = useMState({}); // id -> overrides
  const [editing, setEditing] = useMState(null); // product being edited
  const [bulk, setBulk] = useMState(false);
  const cats = ['all', ...new Set(ML.PRODUCTS.map(p => p.category))];
  const view = (p) => ({ ...p, ...(edits[p.id] || {}) });
  const stock = (p) => edits[p.id]?.stock != null ? edits[p.id].stock : p.id.charCodeAt(1) * 7 % 60;
  const statusOf = (s) => s === 0 ? 'Out of stock' : s < 10 ? 'Low stock' : 'Active';
  let list = ML.PRODUCTS.filter(p => !removed.includes(p.id) && (cat === 'all' || p.category === cat) && (!q || view(p).name.toLowerCase().includes(q.toLowerCase())) && (stat === 'All status' || statusOf(stock(p)) === stat));
  list = [...list].sort((a, b) => {
    if (sort === 'price-low') return view(a).price - view(b).price;
    if (sort === 'price-high') return view(b).price - view(a).price;
    if (sort === 'name-az') return view(a).name.localeCompare(view(b).name);
    if (sort === 'stock-low') return stock(a) - stock(b);
    if (sort === 'stock-high') return stock(b) - stock(a);
    return 0;
  });
  const { shown: pShown, page: pPage, pages: pPages, setPage: pSet } = usePager(list, q + cat + sort + stat);
  const t = (m) => window.admToast && window.admToast(m);
  return (
    <>
      <AdmHead title="Products" sub={`${ML.PRODUCTS.length} products across ${cats.length - 1} categories`}>
        <button className="adm-btn ghost" onClick={() => setBulk(true)}><MIcon name="download" size={15} /> Bulk upload</button>
        <button className="adm-btn primary" onClick={() => setEditing({ id: 'new', name: '', brand: '', price: 0, category: cats[1] || 'phones', _stock: 20, _new: true })}><MIcon name="plus" size={15} /> Add product</button>
      </AdmHead>
      <div className="adm-filters">
        <div className="adm-mini-search"><MIcon name="search" size={16} className="muted" /><input placeholder="Search products…" value={q} onChange={e => setQ(e.target.value)} /></div>
        {cats.slice(0, 6).map(c => <button key={c} className={'adm-chip' + (cat === c ? ' on' : '')} onClick={() => setCat(c)}>{c === 'all' ? 'All' : (ML.CATEGORIES.find(x => x.slug === c)?.name || c)}</button>)}
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
              <td><div className="adm-prod"><span className="adm-prod-thumb"><MThumb product={raw} src={MREAL[raw.id]} /></span><div><b>{p.name.split(',')[0]}</b><small>{p.brand} · {raw.slug}</small></div></div></td>
              <td>{ML.CATEGORIES.find(x => x.slug === p.category)?.name || p.category}</td>
              <td><b>{mn(p.price)}</b></td>
              <td>{s}</td>
              <td><span className={'adm-pill ' + (s === 0 ? 'bad' : s < 10 ? 'warn' : 'ok')}>{statusOf(s)}</span></td>
              <td><div className="adm-rowact"><button title="Edit" onClick={() => setEditing({ id: raw.id, name: p.name, brand: p.brand, price: p.price, category: p.category, _stock: s, _raw: raw })}><MIcon name="edit" size={15} /></button><button className="del" title="Delete" onClick={() => { setRemoved(r => [...r, raw.id]); t('Product deleted'); }}><MIcon name="trash" size={15} /></button></div></td>
            </tr>
          ); })}</tbody>
        </table>{list.length === 0 && <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-faint)' }}>No products match your filters.</div>}<Pager page={pPage} pages={pPages} onPage={pSet} /></div>
      </div>
      {editing && <ProductEditDrawer draft={editing} onClose={() => setEditing(null)} onSave={(d) => {
        if (d._new) { t('Product created'); }
        else { setEdits(e => ({ ...e, [d.id]: { name: d.name, brand: d.brand, price: Number(d.price) || 0, category: d.category, stock: Number(d._stock) || 0 } })); t('Changes saved'); }
        setEditing(null);
      }} />}
      {bulk && <BulkUploadModal onClose={() => setBulk(false)} onDone={(n) => { window.admToast && window.admToast(n + ' products queued for import'); setBulk(false); }} />}
    </>
  );
}

function BulkUploadModal({ onClose, onDone }) {
  const [file, setFile] = useMState(null);
  return (
    <>
      <div className="adm-drawer-scrim" onClick={onClose} />
      <div className="adm-modal" role="dialog" aria-label="Bulk upload">
        <div className="adm-drawer-h"><h3>Bulk product upload</h3><button className="adm-icon-btn" onClick={onClose} aria-label="Close"><MIcon name="close" size={20} /></button></div>
        <div className="adm-drawer-body">
          <label className="adm-img-drop" style={{ height: 150 }}>
            {file
              ? <span className="adm-img-empty"><MIcon name="check" size={26} stroke={3} /><b>{file}</b><small>Ready to import</small></span>
              : <span className="adm-img-empty"><MIcon name="download" size={26} /><b>Drop CSV / Excel file</b><small>or click to browse · .csv, .xlsx</small></span>}
            <input type="file" accept=".csv,.xlsx,.xls" hidden onChange={e => { const fl = e.target.files && e.target.files[0]; if (fl) setFile(fl.name); }} />
          </label>
          <div className="adm-note"><MIcon name="info" size={15} /> Columns: name, brand, category, price, stock, description, image URL. <a>Download template</a></div>
        </div>
        <div className="adm-drawer-f">
          <button className="adm-btn ghost" onClick={onClose}>Cancel</button>
          <button className="adm-btn primary" disabled={!file} onClick={() => onDone(Math.floor(8 + Math.random() * 40))}>Import products</button>
        </div>
      </div>
    </>
  );
}

function ProductEditDrawer({ draft, onClose, onSave }) {
  const [f, setF] = useMState(draft);
  const [, force] = useMState(0);
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  window.ADMIN_EXTRA_CATS = window.ADMIN_EXTRA_CATS || [];
  const cats = [...ML.CATEGORIES, ...window.ADMIN_EXTRA_CATS];
  const addCat = (name) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!cats.some(c => c.slug === slug)) window.ADMIN_EXTRA_CATS.push({ slug, name });
    set('category', slug); force(n => n + 1);
    window.admToast && window.admToast('Category “' + name + '” added');
  };
  return (
    <>
      <div className="adm-drawer-scrim" onClick={onClose} />
      <aside className="adm-drawer" role="dialog" aria-label="Edit product">
        <div className="adm-drawer-h">
          <h3>{f._new ? 'Add product' : 'Edit product'}</h3>
          <button className="adm-icon-btn" onClick={onClose} aria-label="Close"><MIcon name="close" size={20} /></button>
        </div>
        <div className="adm-drawer-body">
          <label className="adm-img-drop">
            {f._img
              ? <img src={f._img} alt="preview" className="adm-img-preview" />
              : (!f._new && f._raw)
                ? <div className="adm-drawer-thumb" style={{ height: '100%' }}><MThumb product={f._raw} src={MREAL[f._raw.id]} /></div>
                : <span className="adm-img-empty"><MIcon name="download" size={26} /><b>Add product photo</b><small>Click to upload, JPG, PNG or WEBP</small></span>}
            <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e => {
              const file = e.target.files && e.target.files[0]; if (!file) return;
              const r = new FileReader(); r.onload = () => set('_img', r.result); r.readAsDataURL(file);
            }} />
            {f._img && <span className="adm-img-replace"><MIcon name="edit" size={13} /> Change photo</span>}
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
          <button className="adm-icon-btn" onClick={onClose} aria-label="Close"><MIcon name="close" size={20} /></button>
        </div>
        <div className="adm-drawer-body">
          <div className="inv-top">
            <div className="inv-brand"><img src="assets/logo.png" alt="Limitra" className="inv-logo" /><small className="muted">Lagos, Nigeria · support@limitra.com.ng</small></div>
            <div className="inv-meta">
              <div><span className="muted">Invoice</span><b>{order.id.replace('LMT', 'INV')}</b></div>
              <div><span className="muted">Date</span><b>{order.date}</b></div>
              <div><span className="muted">Status</span><span className={'adm-pill ' + (window.STATUS_CLS[order.status] || 'muted')}>{order.status}</span></div>
            </div>
          </div>
          <div className="inv-billto"><span className="muted">Billed to</span><b>{order.customer}</b></div>
          <table className="inv-table">
            <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Amount</th></tr></thead>
            <tbody>{lines.map((l, i) => (
              <tr key={i}><td>{l[0]}</td><td>{l[1]}</td><td>{mn(l[2])}</td><td><b>{mn(l[2] * l[1])}</b></td></tr>
            ))}</tbody>
          </table>
          <div className="inv-totals">
            <div><span className="muted">Subtotal</span><span>{mn(sub)}</span></div>
            <div><span className="muted">Shipping</span><span>{ship === 0 ? 'Free' : mn(ship)}</span></div>
            <div className="inv-grand"><span>Total</span><b>{mn(order.total)}</b></div>
          </div>
          <div className="adm-drawer-foot">
            <button className="adm-btn ghost" onClick={onClose}>Close</button>
            <button className="adm-btn primary" onClick={() => window.admToast && window.admToast('Invoice ' + order.id + ' downloaded (PDF)')}><MIcon name="download" size={15} /> Download PDF</button>
          </div>
        </div>
      </div>
    </>
  );
}

function AdminOrders() {
  const [status, setStatus] = useMState('All');
  const [q, setQ] = useMState('');
  const [sort, setSort] = useMState('recent');
  const [invoice, setInvoice] = useMState(null);
  const O = window.ADMIN_ORDERS, CLS = window.STATUS_CLS;
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
        <button className="adm-btn ghost"><MIcon name="download" size={15} /> Export CSV</button>
      </AdmHead>
      <div className="adm-filters">
        <div className="adm-mini-search"><MIcon name="search" size={16} className="muted" /><input placeholder="Search order # or customer…" value={q} onChange={e => setQ(e.target.value)} /></div>
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
              <td>{o.customer}</td><td className="muted">{o.date}</td><td>{o.items}</td><td><b>{mn(o.total)}</b></td>
              <td><span className={'adm-pill ' + (CLS[o.status] || 'muted')}>{o.status}</span></td>
              <td><div className="adm-rowact"><button title="View invoice" onClick={() => setInvoice(o)}><MIcon name="eye" size={15} /></button><button title="Download invoice" onClick={() => setInvoice(o)}><MIcon name="download" size={15} /></button></div></td>
            </tr>
          ))}</tbody>
        </table>{list.length === 0 && <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-faint)' }}>No orders match your filters.</div>}<Pager page={oPage} pages={oPages} onPage={oSet} /></div>
      </div>
      {invoice && <InvoiceModal order={invoice} onClose={() => setInvoice(null)} />}
    </>
  );
}

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
  const [status, setStatus] = useMState(extStatus || cust[4]);
  const [resetSent, setResetSent] = useMState(false);
  const suspended = status === 'Suspended';
  const orders = [
    ['LMT-90412', 'Delivered', 84000, '12 Jun 2026'],
    ['LMT-88107', 'Delivered', 156500, '28 May 2026'],
    ['LMT-85220', 'Cancelled', 42000, '14 May 2026'],
  ];
  const resetPwd = () => { setResetSent(true); window.admToast && window.admToast('Password reset link sent to ' + cust[1]); };
  const toggleSuspend = () => {
    const next = suspended ? 'Active' : 'Suspended';
    setStatus(next);
    onStatusChange && onStatusChange(next);
    window.admToast && window.admToast(cust[0] + (next === 'Suspended' ? ' suspended' : ' restored'));
  };
  return (
    <>
      <div className="adm-drawer-scrim" onClick={onClose} />
      <aside className="adm-drawer" role="dialog" aria-label="Customer detail">
        <div className="adm-drawer-h">
          <h3>Customer profile</h3>
          <button className="adm-icon-btn" onClick={onClose} aria-label="Close"><MIcon name="close" size={20} /></button>
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
            <div><span className="muted">Lifetime value</span><b>{mn(cust[3])}</b></div>
            <div><span className="muted">Lim Cash</span><b>{mn(7000)}</b></div>
          </div>

          <h4 className="adm-sec-label">Purchase history</h4>
          <div className="adm-cust-orders">
            {orders.map((o, i) => (
              <div className="adm-cust-order" key={i}>
                <div><b>{o[0]}</b><small className="muted">{o[3]}</small></div>
                <span className={'adm-pill ' + (o[1] === 'Delivered' ? 'ok' : o[1] === 'Cancelled' ? 'bad' : 'warn')}>{o[1]}</span>
                <b>{mn(o[2])}</b>
              </div>
            ))}
          </div>

          <h4 className="adm-sec-label">Rewards & referrals</h4>
          <div className="adm-cust-rewards">
            <div className="adm-cust-reward"><span className="adm-cust-rico ok"><MIcon name="gift" size={16} /></span><div><b>WELCOME5000</b><small className="muted">₦5,000 signup spin · active</small></div></div>
            <div className="adm-cust-reward"><span className="adm-cust-rico"><MIcon name="share" size={16} /></span><div><b>3 successful referrals</b><small className="muted">₦21,000 earned in Lim Cash</small></div></div>
          </div>

          <h4 className="adm-sec-label">Reset password</h4>
          <div className="adm-cust-reset">
            <div><b>Send password reset link</b><small className="muted">{resetSent ? 'A reset link has been emailed to ' + cust[1] : 'Emails a secure reset link to the customer.'}</small></div>
            <button className="adm-btn ghost" onClick={resetPwd} disabled={resetSent}><MIcon name={resetSent ? 'check' : 'mail'} size={15} /> {resetSent ? 'Sent' : 'Send link'}</button>
          </div>

          <div className="adm-drawer-foot">
            <button className="adm-btn ghost" onClick={resetPwd}><MIcon name={resetSent ? 'check' : 'lock'} size={15} /> {resetSent ? 'Reset link sent' : 'Reset password'}</button>
            {suspended
              ? <button className="adm-btn primary" onClick={toggleSuspend}><MIcon name="refresh" size={15} /> Restore account</button>
              : <button className="adm-btn danger" onClick={toggleSuspend}><MIcon name="close" size={15} /> Suspend account</button>}
          </div>
        </div>
      </aside>
    </>
  );
}

function AdminCustomers() {
  const [q, setQ] = useMState('');
  const [view, setView] = useMState(null);
  const [statusMap, setStatusMap] = useMState({});
  const stOf = (c) => statusMap[c[1]] || c[4];
  const toggleSuspend = (c) => {
    const cur = stOf(c);
    const next = cur === 'Suspended' ? 'Active' : 'Suspended';
    setStatusMap(m => ({ ...m, [c[1]]: next }));
    window.admToast && window.admToast(c[0] + (next === 'Suspended' ? ' suspended' : ' restored'));
  };
  const list = ADMIN_CUSTOMERS.filter(c => !q || c[0].toLowerCase().includes(q.toLowerCase()) || c[1].includes(q.toLowerCase()));
  const { shown: cShown, page: cPage, pages: cPages, setPage: cSet } = usePager(list, q);
  return (
    <>
      <AdmHead title="Customers" sub="4,820 registered customers"><button className="adm-btn ghost"><MIcon name="download" size={15} /> Export</button></AdmHead>
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <window.Kpi ic="user" tint="#0438B6" label="Total customers" val="4,820" delta="5.6%" up />
        <window.Kpi ic="spark" tint="#1F8A5B" label="New this month" val="612" delta="14%" up />
        <window.Kpi ic="refresh" tint="#7A5AE0" label="Retention" val="38%" delta="2%" up />
      </div>
      <div className="adm-filters"><div className="adm-mini-search"><MIcon name="search" size={16} className="muted" /><input placeholder="Search customers…" value={q} onChange={e => setQ(e.target.value)} /></div></div>
      <div className="panel" style={{ padding: 0 }}>
        <div className="adm-table-wrap"><table className="adm-table">
          <thead><tr><th>Customer</th><th>Orders</th><th>Lifetime value</th><th>Status</th><th></th></tr></thead>
          <tbody>{cShown.map((c, i) => { const st = stOf(c); const susp = st === 'Suspended'; return (
            <tr key={i} className={susp ? 'adm-row-susp' : ''}>
              <td><div className="adm-prod"><span className="adm-li-av">{c[0].split(' ').map(w => w[0]).join('').slice(0, 2)}</span><div><b>{c[0]}</b><small>{c[1]}</small></div></div></td>
              <td>{c[2]}</td><td><b>{mn(c[3])}</b></td>
              <td><span className={'adm-pill ' + (susp ? 'bad' : 'ok')}>{st}</span></td>
              <td><div className="adm-rowact"><button title="View" onClick={() => setView(c)}><MIcon name="eye" size={15} /></button><button title="Reset password" onClick={() => window.admToast && window.admToast('Password reset link sent')}><MIcon name="lock" size={15} /></button>{susp
                ? <button className="restore" title="Restore" onClick={() => toggleSuspend(c)}><MIcon name="refresh" size={15} /></button>
                : <button className="del" title="Suspend" onClick={() => toggleSuspend(c)}><MIcon name="close" size={15} /></button>}</div></td>
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
  const payouts = [
    ['28 May 2026', 320000, 'Paid'],
    ['28 Apr 2026', 280000, 'Paid'],
    ['28 Mar 2026', 195000, 'Paid'],
  ];
  const act = (next, msg) => { onStatusChange && onStatusChange(next); window.admToast && window.admToast(msg); };
  return (
    <>
      <div className="adm-drawer-scrim" onClick={onClose} />
      <aside className="adm-drawer" role="dialog" aria-label="Affiliate detail">
        <div className="adm-drawer-h"><h3>Affiliate profile</h3><button className="adm-icon-btn" onClick={onClose} aria-label="Close"><MIcon name="close" size={20} /></button></div>
        <div className="adm-drawer-body">
          <div className="adm-cust-head">
            <span className="adm-li-av lg">{aff[0].split(' ').map(w => w[0]).join('').slice(0, 2)}</span>
            <div>
              <b style={{ fontSize: 18 }}>{aff[0]}</b>
              <div className="muted" style={{ fontSize: 13 }}>{aff[1]}</div>
              <span className={'adm-pill ' + (status === 'Approved' ? 'ok' : status === 'Pending' ? 'warn' : 'bad')} style={{ marginTop: 6, display: 'inline-block' }}>{status}</span>
              {paid && <span className="adm-pill paid" style={{ marginTop: 6, marginLeft: 6, display: 'inline-block' }}><MIcon name="check" size={11} stroke={3} /> Paid</span>}
            </div>
          </div>
          <div className="adm-cust-stats">
            <div><span className="muted">Sales</span><b>{aff[2]}</b></div>
            <div><span className="muted">Total earned</span><b>{mn(aff[3])}</b></div>
            <div><span className="muted">Commission</span><b>10%</b></div>
          </div>
          <h4 className="adm-sec-label">Payout history</h4>
          <div className="adm-cust-orders">
            {payouts.map((p, i) => (
              <div className="adm-cust-order" key={i}>
                <div><b>{mn(p[1])}</b><small className="muted">{p[0]}</small></div>
                <span className="adm-pill ok">{p[2]}</span>
                <button className="adm-btn ghost sm" onClick={() => window.admToast && window.admToast('Statement downloaded')}><MIcon name="download" size={14} /></button>
              </div>
            ))}
          </div>
          <div className="adm-drawer-foot">
            {status === 'Pending' && <>
              <button className="adm-btn danger" onClick={() => { act('Suspended', aff[0] + ' rejected'); onClose(); }}><MIcon name="close" size={15} /> Reject</button>
              <button className="adm-btn primary" onClick={() => act('Approved', aff[0] + ' approved')}><MIcon name="check" size={15} /> Approve</button>
            </>}
            {status === 'Approved' && <>
              <button className="adm-btn danger" onClick={() => act('Suspended', aff[0] + ' suspended')}><MIcon name="close" size={15} /> Suspend</button>
              {paid
                ? <button className="adm-btn ghost" disabled><MIcon name="check" size={15} /> Paid out</button>
                : <button className="adm-btn primary" onClick={() => { onPay && onPay(); window.admToast && window.admToast('Payout of ' + mn(aff[3]) + ' sent to ' + aff[0]); }}><MIcon name="dollar" size={15} /> Process payout</button>}
            </>}
            {status === 'Suspended' && <button className="adm-btn primary" onClick={() => act('Approved', aff[0] + ' reinstated')}><MIcon name="refresh" size={15} /> Reinstate</button>}
          </div>
        </div>
      </aside>
    </>
  );
}

function InviteAffiliateDrawer({ onClose }) {
  const [f, setF] = useMState({ name: '', email: '', channel: '', rate: '10' });
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const send = () => {
    if (!f.name.trim() || !/^\S+@\S+\.\S+$/.test(f.email)) { window.admToast && window.admToast('Enter a name and valid email'); return; }
    window.admToast && window.admToast('Invite sent to ' + f.email);
    onClose();
  };
  return (
    <>
      <div className="adm-drawer-scrim" onClick={onClose} />
      <div className="adm-modal" role="dialog" aria-label="Invite affiliate">
        <div className="adm-drawer-h"><h3>Invite affiliate</h3><button className="adm-icon-btn" onClick={onClose} aria-label="Close"><MIcon name="close" size={20} /></button></div>
        <div className="adm-drawer-body">
          <label className="adm-field"><span>Full name</span><input value={f.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Chidinma Okeke" /></label>
          <label className="adm-field"><span>Email</span><input value={f.email} onChange={e => set('email', e.target.value)} placeholder="affiliate@email.com" /></label>
          <label className="adm-field"><span>Primary channel</span><input value={f.channel} onChange={e => set('channel', e.target.value)} placeholder="e.g. Instagram · 84k" /></label>
          <label className="adm-field"><span>Commission rate (%)</span><input type="number" value={f.rate} onChange={e => set('rate', e.target.value)} /></label>
          <div className="adm-drawer-foot">
            <button className="adm-btn ghost" onClick={onClose}>Cancel</button>
            <button className="adm-btn primary" onClick={send}><MIcon name="mail" size={15} /> Send invite</button>
          </div>
        </div>
      </div>
    </>
  );
}

function AdminAffiliates() {
  const [view, setView] = useMState(null);
  const [invite, setInvite] = useMState(false);
  const [statusMap, setStatusMap] = useMState({});
  const [paidMap, setPaidMap] = useMState({});
  const [q, setQ] = useMState('');
  const [tab, setTab] = useMState('All');
  const stOf = (a) => statusMap[a[0]] || a[4];
  const setSt = (a, s) => setStatusMap(m => ({ ...m, [a[0]]: s }));
  const markPaid = (a) => setPaidMap(m => ({ ...m, [a[0]]: true }));
  const tabs = ['All', 'Approved', 'Pending', 'Suspended'];
  const list = ADMIN_AFFILIATES.filter(a => (tab === 'All' || stOf(a) === tab) && (!q || a[0].toLowerCase().includes(q.toLowerCase()) || a[1].toLowerCase().includes(q.toLowerCase())));
  const [pg, setPg] = useMState(1);
  const perPage = 10;
  const pages = Math.max(1, Math.ceil(list.length / perPage));
  const cur = Math.min(pg, pages);
  const shown = list.slice((cur - 1) * perPage, cur * perPage);
  React.useEffect(() => { setPg(1); }, [q, tab]);
  return (
    <>
      <AdmHead title="Affiliates" sub="Manage partners, commissions and payouts"><button className="adm-btn primary" onClick={() => setInvite(true)}><MIcon name="plus" size={15} /> Invite affiliate</button></AdmHead>
      <div className="kpi-grid">
        <window.Kpi ic="share" tint="#0438B6" label="Active affiliates" val="1,284" delta="9%" up />
        <window.Kpi ic="dollar" tint="#1F8A5B" label="Affiliate revenue" val={mn(2840000)} delta="18%" up />
        <window.Kpi ic="eye" tint="#F67208" label="Avg conversion" val="4.2%" delta="0.6%" up />
        <window.Kpi ic="truck" tint="#7A5AE0" label="Pending payouts" val={mn(486000)} delta="" up />
      </div>
      <div className="adm-filters">
        <div className="adm-mini-search"><MIcon name="search" size={16} className="muted" /><input placeholder="Search affiliates or channel…" value={q} onChange={e => setQ(e.target.value)} /></div>
        {tabs.map(t => <button key={t} className={'adm-chip' + (tab === t ? ' on' : '')} onClick={() => setTab(t)}>{t}</button>)}
      </div>
      <div className="panel" style={{ padding: 0 }}>
        <div className="panel-h" style={{ padding: '18px 20px 0' }}><h3>All affiliates <span className="muted" style={{ fontWeight: 400 }}>· {list.length}</span></h3></div>
        <div className="adm-table-wrap"><table className="adm-table">
          <thead><tr><th>Affiliate</th><th>Channel</th><th>Sales</th><th>Earnings</th><th>Status</th><th></th></tr></thead>
          <tbody>{shown.map((a, i) => { const st = stOf(a); return (
            <tr key={i} data-hlkey={a[0]}>
              <td><div className="adm-prod"><span className="adm-li-av">{a[0].split(' ').map(w => w[0]).join('').slice(0, 2)}</span><div><b>{a[0]}</b></div></div></td>
              <td className="muted">{a[1]}</td><td>{a[2]}</td><td><b>{mn(a[3])}</b></td>
              <td><span className={'adm-pill ' + (st === 'Approved' ? 'ok' : st === 'Pending' ? 'warn' : 'bad')}>{st}</span>{paidMap[a[0]] && <span className="adm-pill paid" style={{ marginLeft: 6 }}><MIcon name="check" size={11} stroke={3} /> Paid</span>}</td>
              <td><div className="adm-rowact">{st === 'Pending' ? <><button title="Approve" onClick={() => { setSt(a, 'Approved'); window.admToast && window.admToast(a[0] + ' approved'); }}><MIcon name="check" size={15} /></button><button className="del" title="Reject" onClick={() => { setSt(a, 'Suspended'); window.admToast && window.admToast(a[0] + ' rejected'); }}><MIcon name="close" size={15} /></button></> : <><button title="View" onClick={() => setView(a)}><MIcon name="eye" size={15} /></button><button title="Pay out" className={paidMap[a[0]] ? 'paid' : ''} onClick={() => { markPaid(a); window.admToast && window.admToast('Payout of ' + mn(a[3]) + ' sent to ' + a[0]); }}><MIcon name="dollar" size={15} /></button></>}</div></td>
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
function AdminReferrals() {
  return (
    <>
      <AdmHead title="Referrals" sub="Lim Cash reward program" />
      <div className="kpi-grid">
        <window.Kpi ic="dollar" tint="#1F8A5B" label="Reward per referral" val={mn(5000)} delta="" up />
        <window.Kpi ic="user" tint="#0438B6" label="Successful referrals" val="1,842" delta="11%" up />
        <window.Kpi ic="gift" tint="#F67208" label="Lim Cash issued" val={mn(12894000)} delta="" up />
        <window.Kpi ic="refresh" tint="#7A5AE0" label="Redemption rate" val="62%" delta="4%" up />
      </div>
      <div className="adm-row c2">
        <div className="panel"><div className="panel-h"><h3>Referrals over time</h3></div><window.BarChart data={[120, 142, 168, 154, 196, 228, 254, 286]} labels={['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8']} alt /></div>
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

/* ---------- SPIN & WIN ---------- */
function AdminSpin() {
  const PALETTE = ['#0438B6', '#2F4BDB', '#F67208', '#7A5AE0', '#1F8A5B', '#0E9BD6', '#D6247C', '#F5A623', '#E5484D', '#0EA5A5'];
  const [prizes, setPrizes] = useMState([
    { name: '5% OFF', weight: 35, color: '#0438B6' },
    { name: '10% OFF', weight: 25, color: '#2F4BDB' },
    { name: '₦5,000', weight: 15, color: '#F67208' },
    { name: '20% OFF', weight: 8, color: '#7A5AE0' },
    { name: '₦1,000', weight: 10, color: '#1F8A5B' },
    { name: '₦2,500', weight: 5, color: '#0E9BD6' },
    { name: 'Free Shipping', weight: 0, color: '#D6247C' },
    { name: 'Mystery Gift', weight: 2, color: '#F5A623' },
  ]);
  const [swatch, setSwatch] = useMState(-1);
  const upd = (i, k, v) => setPrizes(ps => ps.map((p, j) => j === i ? { ...p, [k]: v } : p));
  const total = prizes.reduce((s, p) => s + (Number(p.weight) || 0), 0);
  const t = (m) => window.admToast && window.admToast(m);
  return (
    <>
      <AdmHead title="Spin & Win" sub="Signup roulette rewards & probabilities">
        <button className="adm-btn ghost" onClick={() => setPrizes(ps => [...ps, { name: 'New reward', weight: 0, color: PALETTE[ps.length % PALETTE.length] }])}><MIcon name="plus" size={15} /> Add reward</button>
      </AdmHead>
      <div className="kpi-grid">
        <window.Kpi ic="gift" tint="#F67208" label="Total spins" val="3,418" delta="22%" up />
        <window.Kpi ic="tag" tint="#0438B6" label="Coupons generated" val="3,418" delta="22%" up />
        <window.Kpi ic="check" tint="#1F8A5B" label="Coupons redeemed" val="1,204" delta="9%" up />
        <window.Kpi ic="dollar" tint="#7A5AE0" label="Revenue attributed" val={mn(8420000)} delta="16%" up />
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
              <button className="cfg-del" onClick={() => setPrizes(ps => ps.filter((_, j) => j !== i))} aria-label="Remove reward"><MIcon name="trash" size={14} /></button>
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
function AdminVideos() {
  const V = window.VIDEOS || [];
  const [edit, setEdit] = useMState(null);
  const [assign, setAssign] = useMState(null);
  const t = (m) => window.admToast && window.admToast(m);
  const { shown: vShown, page: vPage, pages: vPages, setPage: vSet } = usePager(V, '');
  return (
    <>
      <AdmHead title="Videos" sub={`${V.length} videos · demos, reviews, reels`}><button className="adm-btn primary" onClick={() => setEdit({ _new: true, title: '', cat: 'Demos', dur: '0:30' })}><MIcon name="plus" size={15} /> Upload video</button></AdmHead>
      <div className="kpi-grid">
        <window.Kpi ic="eye" tint="#0438B6" label="Total views" val="438K" delta="19%" up />
        <window.Kpi ic="clock" tint="#1F8A5B" label="Avg watch time" val="42s" delta="3%" up />
        <window.Kpi ic="bag" tint="#F67208" label="Product clicks" val="12.4K" delta="11%" up />
        <window.Kpi ic="dollar" tint="#7A5AE0" label="Sales from video" val={mn(3640000)} delta="24%" up />
      </div>
      <div className="panel" style={{ padding: 0 }}>
        <div className="adm-table-wrap"><table className="adm-table">
          <thead><tr><th>Video</th><th>Category</th><th>Views</th><th>Shoppable</th><th>Status</th><th></th></tr></thead>
          <tbody>{vShown.map(v => (
            <tr key={v.id}>
              <td><div className="adm-prod"><span className="adm-prod-thumb"><img src={window.VID_POSTER[v.id]} alt="" /></span><div><b>{v.title}</b><small>{v.dur}</small></div></div></td>
              <td>{v.cat}</td><td>{window.fmtViews(v.views)}</td>
              <td>{v.products.length ? <span className="adm-pill ok">{v.products.length} tagged</span> : <span className="adm-pill muted">,</span>}</td>
              <td><span className="adm-pill ok">Live</span></td>
              <td><div className="adm-rowact"><button title="Edit" onClick={() => setEdit({ ...v })}><MIcon name="edit" size={15} /></button><button title="Assign products" onClick={() => setAssign({ ...v, products: [...(v.products || [])] })}><MIcon name="bag" size={15} /></button></div></td>
            </tr>
          ))}</tbody>
        </table><Pager page={vPage} pages={vPages} onPage={vSet} /></div>
      </div>
      {edit && <VideoEditDrawer draft={edit} onClose={() => setEdit(null)} onSave={() => { t(edit._new ? 'Video uploaded' : 'Video updated'); setEdit(null); }} />}
      {assign && <VideoAssignModal draft={assign} onClose={() => setAssign(null)} onSave={(ids) => { t(ids.length + ' product(s) tagged to ' + assign.title); setAssign(null); }} />}
    </>
  );
}

function VideoEditDrawer({ draft, onClose, onSave }) {
  const [f, setF] = useMState(draft);
  const [, vforce] = useMState(0);
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  window.ADMIN_VIDEO_CATS = window.ADMIN_VIDEO_CATS || ['Demos', 'Unboxing', 'Reviews', 'How-to', 'Lookbook', 'Brand', 'Promo'];
  const addVCat = (name) => {
    if (!window.ADMIN_VIDEO_CATS.includes(name)) window.ADMIN_VIDEO_CATS.push(name);
    set('cat', name); vforce(n => n + 1);
    window.admToast && window.admToast('Category “' + name + '” added');
  };
  return (
    <div className="role-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="role-modal">
        <div className="role-modal-h">
          <div className="row" style={{ gap: 12 }}>
            <span className="kpi-ic" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}><MIcon name="video" size={18} /></span>
            <div><h3 style={{ fontSize: 18 }}>{f._new ? 'Upload video' : 'Edit video'}</h3><small className="muted">Video details & assignment</small></div>
          </div>
          <button className="role-modal-x" onClick={onClose} aria-label="Close"><MIcon name="close" size={18} /></button>
        </div>
        <div className="role-modal-b">
          <label className="adm-img-drop" style={{ height: 160 }}>
            {f.id && !f._file ? <img src={window.VID_POSTER[f.id]} alt="" className="adm-img-preview" /> : f._file ? <span className="adm-img-empty"><MIcon name="check" size={26} stroke={3} /><b>{f._file}</b><small>Ready to upload · {f.dur || 'duration detected on upload'}</small></span> : <span className="adm-img-empty"><MIcon name="video" size={26} /><b>Upload video file</b><small>MP4, MOV or WEBM · up to 500MB</small></span>}
            <input type="file" accept="video/mp4,video/quicktime,video/webm" hidden onChange={(e) => { const fl = e.target.files && e.target.files[0]; if (fl) { set('_file', fl.name); set('dur', ['0:48', '1:12', '1:30', '2:05'][Math.floor(Math.random() * 4)]); window.admToast && window.admToast('Video attached, duration detected'); } }} />
          </label>
          <label className="adm-field"><span>Title</span><input value={f.title} onChange={e => set('title', e.target.value)} placeholder="Video title" /></label>
          <div className="adm-field-row">
            <label className="adm-field"><span>Category</span>
              <AdmSelect value={f.cat} options={window.ADMIN_VIDEO_CATS} onChange={v => set('cat', v)} creatable onCreate={addVCat} />
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
  const [sel, setSel] = useMState(draft.products || []);
  const [q, setQ] = useMState('');
  const list = ML.PRODUCTS.filter(p => !q || p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 30);
  const toggle = (id) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  return (
    <>
      <div className="adm-drawer-scrim" onClick={onClose} />
      <div className="adm-modal" role="dialog" aria-label="Assign products">
        <div className="adm-drawer-h"><h3>Tag products · {draft.title}</h3><button className="adm-icon-btn" onClick={onClose} aria-label="Close"><MIcon name="close" size={20} /></button></div>
        <div className="adm-drawer-body" style={{ paddingTop: 14 }}>
          <div className="adm-mini-search" style={{ marginBottom: 12 }}><MIcon name="search" size={16} className="muted" /><input placeholder="Search products to tag…" value={q} onChange={e => setQ(e.target.value)} /></div>
          <div className="adm-assign-list">
            {list.map(p => (
              <button key={p.id} className={'adm-assign-row' + (sel.includes(p.id) ? ' on' : '')} onClick={() => toggle(p.id)}>
                <span className="adm-prod-thumb"><MThumb product={p} src={MREAL[p.id]} /></span>
                <div className="adm-assign-info"><b>{p.name.split(',')[0]}</b><small>{mn(p.price)}</small></div>
                <span className="adm-assign-check">{sel.includes(p.id) && <MIcon name="check" size={14} stroke={3} />}</span>
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
function AdminElo() {
  const qs = [['Where is my order?', 412], ['Recommend a phone under ₦400k', 318], ['Do you have this in black?', 264], ['What’s the return policy?', 201], ['Best laptop for students', 188]];
  return (
    <>
      <AdmHead title="Elo AI" sub="Assistant performance & knowledge base"><button className="adm-btn ghost"><MIcon name="download" size={15} /> Upload knowledge doc</button></AdmHead>
      <div className="kpi-grid">
        <window.Kpi ic="headset" tint="#0438B6" label="Conversations" val="1,932" delta="24%" up />
        <window.Kpi ic="check" tint="#1F8A5B" label="Resolution rate" val="87%" delta="3%" up />
        <window.Kpi ic="heart" tint="#D6247C" label="Satisfaction" val="4.6/5" delta="0.2" up />
        <window.Kpi ic="bag" tint="#F67208" label="AI-driven sales" val={mn(1980000)} delta="15%" up />
      </div>
      <div className="adm-row c2">
        <div className="panel"><div className="panel-h"><h3>Most asked questions</h3></div>
          <div className="adm-list">{qs.map((qq, i) => <div className="adm-li" key={i}><span className="adm-li-av">{i + 1}</span><div className="adm-li-main"><b style={{ fontSize: 13.5 }}>{qq[0]}</b></div><b style={{ fontFamily: 'var(--font-display)' }}>{qq[1]}</b></div>)}</div>
        </div>
        <div className="panel"><div className="panel-h"><h3>Conversation volume</h3></div><window.BarChart data={[180, 210, 264, 248, 312, 356, 402]} labels={['M', 'T', 'W', 'T', 'F', 'S', 'S']} alt /></div>
      </div>
    </>
  );
}

/* ---------- COUPONS ---------- */
const ADMIN_COUPONS = [['WELCOME15', '15% off first order', 1204, 'Active'], ['CASH5K', '₦5,000 spin reward', 842, 'Active'], ['FLASH40', 'Flash sale 40%', 3120, 'Scheduled'], ['FREESHIP', 'Free shipping', 640, 'Active'], ['EID20', 'Eid promo 20%', 980, 'Expired']];
function AdminCoupons() {
  const [coupons, setCoupons] = useMState(ADMIN_COUPONS.map(c => ({ code: c[0], desc: c[1], uses: c[2], status: c[3] })));
  const [edit, setEdit] = useMState(null);
  const t = (m) => window.admToast && window.admToast(m);
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
      <AdmHead title="Coupons & Promotions" sub="Discounts, flash sales & campaigns"><button className="adm-btn primary" onClick={() => setEdit({ _new: true, code: '', desc: '', type: 'Percentage', value: '', status: 'Active' })}><MIcon name="plus" size={15} /> Create coupon</button></AdmHead>
      <div className="panel" style={{ padding: 0 }}>
        <div className="adm-table-wrap"><table className="adm-table">
          <thead><tr><th>Code</th><th>Description</th><th>Uses</th><th>Status</th><th></th></tr></thead>
          <tbody>{cpShown.map((c, i) => (
            <tr key={i}><td><b style={{ fontFamily: 'var(--font-display)', letterSpacing: '.03em' }}>{c.code}</b></td><td className="muted">{c.desc}</td><td>{c.uses.toLocaleString()}</td>
              <td><span className={'adm-pill ' + (c.status === 'Active' ? 'ok' : c.status === 'Scheduled' ? 'info' : 'muted')}>{c.status}</span></td>
              <td><div className="adm-rowact"><button title="Edit" onClick={() => setEdit({ _orig: c.code, code: c.code, desc: c.desc, type: 'Percentage', value: '', status: c.status })}><MIcon name="edit" size={15} /></button><button className="del" title="Delete" onClick={() => { setCoupons(cs => cs.filter(x => x.code !== c.code)); t('Coupon ' + c.code + ' deleted'); }}><MIcon name="trash" size={15} /></button></div></td>
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
  const [max, setMax] = useMState(() => parseInt(localStorage.getItem('lim_aff_promo_max') || '1', 10));
  const [codes, setCodes] = useMState(() => JSON.parse(localStorage.getItem('lim_aff_promos') || '[]'));
  const saveMax = (v) => { const n = Math.max(0, Math.min(10, v)); setMax(n); localStorage.setItem('lim_aff_promo_max', String(n)); window.admToast && window.admToast('Affiliates can now create ' + n + ' code' + (n !== 1 ? 's' : '')); };
  const removeCode = (code) => { const next = codes.filter(c => c.code !== code); setCodes(next); localStorage.setItem('lim_aff_promos', JSON.stringify(next)); window.admToast && window.admToast('Affiliate code removed'); };
  return (
    <div style={{ marginTop: 24 }}>
      <div className="adm-row c2" style={{ alignItems: 'start' }}>
        <div className="panel">
          <div className="panel-h"><h3>Affiliate promo codes</h3></div>
          <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.6, marginBottom: 16 }}>Control how many promo codes each affiliate may create from their dashboard. Codes apply at checkout and are attributed to the affiliate.</p>
          <div className="adm-li"><div className="adm-li-main"><b>Codes allowed per affiliate</b><small>Super-admin controlled · 0 disables</small></div>
            <div className="aff-max-stepper"><button onClick={() => saveMax(max - 1)} disabled={max <= 0}><MIcon name="minus" size={15} /></button><span>{max}</span><button onClick={() => saveMax(max + 1)} disabled={max >= 10}><MIcon name="plus" size={15} /></button></div>
          </div>
        </div>
        <div className="panel" style={{ padding: 0 }}>
          <div className="panel-h" style={{ padding: '18px 20px 0' }}><h3>Active affiliate codes <span className="muted" style={{ fontWeight: 400 }}>· {codes.length}</span></h3></div>
          <div className="adm-table-wrap"><table className="adm-table">
            <thead><tr><th>Code</th><th>Affiliate</th><th>Discount</th><th>Uses</th><th></th></tr></thead>
            <tbody>{codes.map((c, i) => (
              <tr key={i}><td><b style={{ fontFamily: 'var(--font-display)', letterSpacing: '.03em' }}>{c.code}</b></td><td className="muted">{c.affName}</td><td>{Math.round(c.pct * 100)}%</td><td>{c.uses || 0}</td>
                <td><div className="adm-rowact"><button className="del" title="Revoke" onClick={() => removeCode(c.code)}><MIcon name="trash" size={15} /></button></div></td></tr>
            ))}</tbody>
          </table>{codes.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-faint)' }}>No affiliate codes created yet.</div>}</div>
        </div>
      </div>
    </div>
  );
}

function CouponModal({ draft, onClose, onSave }) {
  const [f, setF] = useMState(draft);
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  return (
    <>
      <div className="adm-drawer-scrim" onClick={onClose} />
      <div className="adm-modal" role="dialog" aria-label="Coupon">
        <div className="adm-drawer-h"><h3>{f._new ? 'Create coupon' : 'Edit coupon'}</h3><button className="adm-icon-btn" onClick={onClose} aria-label="Close"><MIcon name="close" size={20} /></button></div>
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
function AdminInventory() {
  const [q, setQ] = useMState('');
  const [stat, setStat] = useMState('All');
  const [sort, setSort] = useMState('stock-low');
  const stk = (p) => p.id.charCodeAt(1) * 3 % 12;
  const statusOf = (s) => s === 0 ? 'Out of stock' : s < 6 ? 'Low stock' : 'In stock';
  const base = ML.PRODUCTS.filter((p, i) => i % 2 === 0).slice(0, 24);
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
        <window.Kpi ic="package" tint="#0438B6" label="SKUs tracked" val={ML.PRODUCTS.length} delta="" up />
        <window.Kpi ic="info" tint="#F5A623" label="Low stock" val="14" delta="" up />
        <window.Kpi ic="close" tint="#E5484D" label="Out of stock" val="3" delta="" up />
      </div>
      <div className="adm-filters">
        <div className="adm-mini-search"><MIcon name="search" size={16} className="muted" /><input placeholder="Search products or SKU…" value={q} onChange={e => setQ(e.target.value)} /></div>
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
            <tr key={p.id} data-hlkey={p.name}><td><div className="adm-prod"><span className="adm-prod-thumb"><MThumb product={p} src={MREAL[p.id]} /></span><div><b>{p.name.split(',')[0]}</b></div></div></td>
              <td className="muted">{p.slug.slice(0, 12).toUpperCase()}</td><td>{s}</td>
              <td><span className={'adm-pill ' + (s === 0 ? 'bad' : s < 6 ? 'warn' : 'ok')}>{statusOf(s)}</span></td>
              <td><div className="adm-rowact"><button title="Restock" onClick={() => window.admToast && window.admToast('Restock order placed')}><MIcon name="plus" size={15} /></button></div></td></tr>
          ); })}</tbody>
        </table>{low.length === 0 && <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-faint)' }}>No products match your filters.</div>}<Pager page={invPage} pages={invPages} onPage={invSet} /></div>
      </div>
    </>
  );
}

/* ---------- ROLES ---------- */
const ADMIN_ROLES = [['Super Admin', 'Full access to everything', 1, '#0438B6'], ['Admin', 'Manage store operations', 3, '#2F4BDB'], ['Manager', 'Products, orders, inventory', 5, '#1F8A5B'], ['Customer Support', 'Orders & customer help', 8, '#0E9BD6'], ['Marketing Manager', 'Promos, videos, affiliates', 4, '#F67208'], ['Inventory Manager', 'Stock & warehouse', 2, '#7A5AE0']];
const ROLE_PERMS = ['Dashboard & analytics', 'Product management', 'Order management', 'Customer management', 'Affiliate management', 'Referral management', 'Video management', 'AI assistant', 'Coupons & promotions', 'Inventory', 'Roles & permissions', 'Website settings'];

const ROLE_NAMES = ['Super Admin', 'Admin', 'Manager', 'Customer Support', 'Marketing Manager', 'Inventory Manager'];
const STAFF = [
  ['Emmanuel Adefioye', 'adefioyeemman@gmail.com', 'Super Admin'],
  ['Saint John', 'saintjohnus@gmail.com', 'Super Admin'],
  ['Kola Bassey', 'kola@limitra.ng', 'Admin'],
  ['Bolaji Ahmed', 'bolaji@limitra.ng', 'Admin'],
  ['Ngozi Eze', 'ngozi@limitra.ng', 'Admin'],
  ['Tunde Bello', 'tunde@limitra.ng', 'Manager'],
  ['Aisha Sani', 'aisha@limitra.ng', 'Manager'],
  ['Femi Cole', 'femi@limitra.ng', 'Manager'],
  ['Chidi Obi', 'chidi@limitra.ng', 'Manager'],
  ['Zainab Yusuf', 'zainab@limitra.ng', 'Manager'],
  ['Grace Udo', 'grace@limitra.ng', 'Customer Support'],
  ['Peter Ade', 'peter@limitra.ng', 'Customer Support'],
  ['Mary John', 'mary@limitra.ng', 'Customer Support'],
  ['Sade Okoro', 'sade@limitra.ng', 'Marketing Manager'],
  ['Ibrahim Musa', 'ibrahim@limitra.ng', 'Marketing Manager'],
  ['Helen Paul', 'helen@limitra.ng', 'Inventory Manager'],
];

function RoleDrawer({ role, onClose, members, roleNames, onAssign, onAdd, onRemove }) {
  const isNew = !role;
  const [name, setName] = useMState(role ? role[0] : '');
  const [desc, setDesc] = useMState(role ? role[1] : '');
  const full = role && role[0] === 'Super Admin';
  const [perms, setPerms] = useMState(() => {
    const o = {};
    ROLE_PERMS.forEach((p, i) => { o[p] = full ? true : (role ? i % 2 === 0 : false); });
    return o;
  });
  const toggle = (p) => { if (full) return; setPerms(m => ({ ...m, [p]: !m[p] })); };
  const [adding, setAdding] = useMState(false);
  const [nn, setNn] = useMState('');
  const [ne, setNe] = useMState('');
  const [pending, setPending] = useMState([]);
  const list = isNew ? pending : (members || []);
  const submitAdd = () => {
    const rn = role ? role[0] : name.trim();
    if (!rn) { window.admToast && window.admToast('Enter a role name first'); return; }
    if (!nn.trim() || !/^\S+@\S+\.\S+$/.test(ne)) { window.admToast && window.admToast('Enter a name and valid email'); return; }
    if (isNew) { setPending(p => [...p, [nn.trim(), ne.trim(), rn]]); window.admToast && window.admToast(nn.trim() + ' added'); }
    else { onAdd && onAdd(nn.trim(), ne.trim(), rn); }
    setNn(''); setNe(''); setAdding(false);
  };
  const removeFrom = (email) => { if (isNew) setPending(p => p.filter(m => m[1] !== email)); else onRemove && onRemove(email); };
  return (
    <div className="role-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="role-modal">
        <div className="role-modal-h">
          <div className="row" style={{ gap: 12 }}>
            <span className="kpi-ic" style={{ background: (role ? role[3] : 'var(--primary)') + '22', color: role ? role[3] : 'var(--primary)' }}><MIcon name="lock" size={18} /></span>
            <div><h3 style={{ fontSize: 18 }}>{isNew ? 'Add role' : 'Edit role'}</h3><small className="muted">Configure access & members</small></div>
          </div>
          <button className="role-modal-x" onClick={onClose}><MIcon name="close" size={18} /></button>
        </div>
        <div className="role-modal-b">
          <div className="adm-field-row">
            <label className="adm-field"><span>Role name</span><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Marketing Manager" /></label>
            <label className="adm-field"><span>Members</span><input value={role ? list.length : 0} readOnly /></label>
          </div>
          <label className="adm-field"><span>Description</span><input value={desc} onChange={e => setDesc(e.target.value)} placeholder="What this role can do" /></label>
          <div className="adm-field">
            <span className="row between" style={{ alignItems: 'center' }}><span>Members ({list.length})</span> <button type="button" className="adm-link-btn" onClick={() => setAdding(a => !a)}><MIcon name={adding ? 'close' : 'plus'} size={13} /> {adding ? 'Cancel' : 'Add member'}</button></span>
              {adding && (
                <div className="role-add">
                  <input value={nn} onChange={e => setNn(e.target.value)} placeholder="Full name" />
                  <input value={ne} onChange={e => setNe(e.target.value)} placeholder="Email address" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submitAdd(); } }} />
                  <button type="button" className="adm-btn primary" onClick={submitAdd}>Add</button>
                </div>
              )}
              {list.length === 0 && !adding ? <small className="muted">{isNew ? 'Name the role, then add members.' : 'No members assigned to this role yet.'}</small> : (
                <div className="role-members">
                  {list.map(mem => (
                    <div key={mem[1]} className="role-member">
                      <span className="adm-li-av">{mem[0].split(' ').map(w => w[0]).join('').slice(0, 2)}</span>
                      <div className="role-member-info"><b>{mem[0]}</b><small>{mem[1]}</small></div>
                      <AdmSelect value={mem[2]} options={roleNames} onChange={(nv) => onAssign && onAssign(mem[1], nv)} />
                      <button type="button" className="role-member-x" title="Remove member" onClick={() => removeFrom(mem[1])}><MIcon name="trash" size={15} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          <div className="adm-field"><span>Permissions</span>
            <div className="role-perms">
              {ROLE_PERMS.map(p => (
                <label key={p} className="role-perm">
                  <span>{p}</span>
                  <button type="button" className={'toggle' + (perms[p] ? ' on' : '')} onClick={() => toggle(p)} aria-label={p} disabled={full} />
                </label>
              ))}
            </div>
            {full && <small className="muted" style={{ marginTop: 8, display: 'block' }}>Super Admin always has full access and can’t be limited.</small>}
          </div>
        </div>
        <div className="role-modal-f">
          <button className="adm-btn ghost" onClick={onClose}>Cancel</button>
          <button className="adm-btn primary" onClick={() => { window.admToast && window.admToast(isNew ? 'Role created' : role[0] + ' updated'); onClose(); }}>{isNew ? 'Create role' : 'Save changes'}</button>
        </div>
      </div>
    </div>
  );
}

function AdminRoles() {
  const [edit, setEdit] = useMState(null); // role array or 'new'
  const [staff, setStaff] = useMState(STAFF);
  const assign = (email, newRole) => { setStaff(s => s.map(m => m[1] === email ? [m[0], m[1], newRole] : m)); window.admToast && window.admToast(email + ' → ' + newRole); };
  const addMember = (nm, email, roleName) => {
    if (staff.some(m => m[1] === email)) { window.admToast && window.admToast('That email is already a member'); return; }
    setStaff(s => [...s, [nm, email, roleName]]); window.admToast && window.admToast(nm + ' added to ' + roleName);
  };
  const removeMember = (email) => { setStaff(s => s.filter(m => m[1] !== email)); window.admToast && window.admToast('Member removed'); };
  const editRole = edit && edit !== 'new' ? edit : null;
  return (
    <>
      <AdmHead title="Roles & Access" sub="Role-based permissions"><button className="adm-btn primary" onClick={() => setEdit('new')}><MIcon name="plus" size={15} /> Add role</button></AdmHead>
      <div className="adm-row c3">
        {ADMIN_ROLES.map((r, i) => (
          <div className="panel" key={i}>
            <span className="kpi-ic" style={{ background: r[3] + '22', color: r[3] }}><MIcon name="lock" size={18} /></span>
            <h3 style={{ margin: '12px 0 4px', fontSize: 16 }}>{r[0]}</h3>
            <p className="muted" style={{ fontSize: 13 }}>{r[1]}</p>
            <div className="row between" style={{ marginTop: 14 }}><small className="muted" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{staff.filter(s => s[2] === r[0]).length} member{staff.filter(s => s[2] === r[0]).length !== 1 ? 's' : ''}</small><a onClick={() => setEdit(r)} style={{ color: 'var(--primary)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Edit</a></div>
          </div>
        ))}
      </div>
      {edit && <RoleDrawer role={editRole} members={editRole ? staff.filter(s => s[2] === editRole[0]) : []} roleNames={ROLE_NAMES} onAssign={assign} onAdd={addMember} onRemove={removeMember} onClose={() => setEdit(null)} />}
    </>
  );
}

/* ---------- REPORTS ---------- */
function AdminReports() {
  const reports = [['Sales report', 'Revenue, AOV, refunds', 'dollar'], ['Orders report', 'All orders & statuses', 'truck'], ['Customers report', 'Acquisition & retention', 'user'], ['Affiliates report', 'Earnings & payouts', 'share'], ['Referrals report', 'Lim Cash issued', 'gift'], ['Inventory report', 'Stock movements', 'package']];
  return (
    <>
      <AdmHead title="Reports & Exports" sub="Generate and download business reports" />
      <div className="adm-row c3">
        {reports.map((r, i) => (
          <div className="panel" key={i}>
            <span className="kpi-ic" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}><MIcon name={r[2]} size={18} /></span>
            <h3 style={{ margin: '12px 0 4px', fontSize: 16 }}>{r[0]}</h3>
            <p className="muted" style={{ fontSize: 13, marginBottom: 14 }}>{r[1]}</p>
            <div className="row" style={{ gap: 8 }}><button className="adm-btn ghost" style={{ flex: 1, justifyContent: 'center' }}>CSV</button><button className="adm-btn ghost" style={{ flex: 1, justifyContent: 'center' }}>Excel</button><button className="adm-btn ghost" style={{ flex: 1, justifyContent: 'center' }}>PDF</button></div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------- CMS ---------- */
function CmsManageDrawer({ item, onClose }) {
  const [tab, setTab] = useMState(0);
  const key = item[0];
  const heroSlides = [
    { title: 'Premium marketplace, smarter shopping.', sub: 'Quality products. Secure shopping. Reliable delivery.', cta: 'Shop Now' },
    { title: 'Elevate every listening moment.', sub: 'Discover premium audio equipment.', cta: 'Shop audio' },
    { title: 'Wear your confidence every day.', sub: 'Fresh-season clothing and footwear.', cta: 'Shop fashion' },
  ];
  const faqs = [
    { q: 'How long does delivery take?', a: 'Standard delivery takes 10–14 days nationwide.' },
    { q: 'What payment methods are accepted?', a: 'Cards, bank transfer and pay-on-delivery in select cities.' },
    { q: 'What is your return policy?', a: 'Returns accepted within 7 days of delivery.' },
  ];
  const isHero = key === 'Homepage hero';
  const isBanner = key === 'Featured banners';
  const isFaq = key === 'FAQs';
  const isBlog = key === 'Blog posts';
  const isDoc = key === 'Terms & Conditions' || key === 'Privacy Policy';

  return (
    <div className="role-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="role-modal">
        <div className="role-modal-h">
          <div className="row" style={{ gap: 12 }}>
            <span className="kpi-ic" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}><MIcon name={item[2]} size={18} /></span>
            <div><h3 style={{ fontSize: 18 }}>Manage · {key}</h3><small className="muted">Edit site content</small></div>
          </div>
          <button className="role-modal-x" onClick={onClose} aria-label="Close"><MIcon name="close" size={18} /></button>
        </div>
        <div className="role-modal-b">

          {isHero && <>
            <div className="cms-tabs">{heroSlides.map((_, i) => <button key={i} className={'cms-tab' + (tab === i ? ' on' : '')} onClick={() => setTab(i)}>Slide {i + 1}</button>)}</div>
            <label className="adm-img-drop" style={{ height: 150 }}><span className="adm-img-empty"><MIcon name="eye" size={26} /><b>Add slide image</b><small>Drag &amp; drop or click to browse · JPG, PNG</small></span><input type="file" accept="image/*" hidden onChange={() => window.admToast && window.admToast('Image attached')} /></label>
            <label className="adm-field"><span>Headline</span><input defaultValue={heroSlides[tab].title} /></label>
            <label className="adm-field"><span>Subtext</span><textarea rows={2} defaultValue={heroSlides[tab].sub} /></label>
            <label className="adm-field"><span>Button label</span><input defaultValue={heroSlides[tab].cta} /></label>
            <div className="adm-field-row"><label className="adm-field"><span>Links to</span><input defaultValue="/shop" /></label><label className="adm-field"><span>Offer badge</span><input defaultValue="Up to 40% off" /></label></div>
          </>}

          {isBanner && <>
            <label className="adm-img-drop" style={{ height: 150 }}><span className="adm-img-empty"><MIcon name="tag" size={26} /><b>Add banner image</b><small>Drag &amp; drop or click to browse · JPG, PNG</small></span><input type="file" accept="image/*" hidden onChange={() => window.admToast && window.admToast('Image attached')} /></label>
            <label className="adm-field"><span>Banner title</span><input defaultValue="Eid Mubarak, Big Savings" /></label>
            <label className="adm-field"><span>Description</span><textarea rows={2} defaultValue="Up to 50% off on selected electronics & fashion." /></label>
            <div className="adm-field-row"><label className="adm-field"><span>CTA label</span><input defaultValue="Shop the sale" /></label><label className="adm-field"><span>Placement</span><input defaultValue="Homepage, mid" /></label></div>
          </>}

          {isFaq && <div className="cms-list">
            {faqs.map((f, i) => (
              <div className="cms-faq" key={i}>
                <label className="adm-field"><span>Question {i + 1}</span><input defaultValue={f.q} /></label>
                <label className="adm-field"><span>Answer</span><textarea rows={2} defaultValue={f.a} /></label>
              </div>
            ))}
            <button className="adm-btn ghost" onClick={() => window.admToast && window.admToast('New FAQ row added')}><MIcon name="plus" size={15} /> Add FAQ</button>
          </div>}

          {isBlog && <>
            <label className="adm-img-drop" style={{ height: 150 }}><span className="adm-img-empty"><MIcon name="edit" size={26} /><b>Add cover image</b><small>Drag &amp; drop or click to browse · JPG, PNG</small></span><input type="file" accept="image/*" hidden onChange={() => window.admToast && window.admToast('Image attached')} /></label>
            <label className="adm-field"><span>Post title</span><input placeholder="e.g. 5 gadgets to upgrade your setup" /></label>
            <label className="adm-field"><span>Excerpt</span><textarea rows={2} placeholder="Short summary shown in listings…" /></label>
            <label className="adm-field"><span>Body</span><textarea rows={6} placeholder="Write your post…" /></label>
          </>}

          {isDoc && <>
            <label className="adm-field"><span>Page title</span><input defaultValue={key} /></label>
            <label className="adm-field"><span>Content</span><textarea rows={12} defaultValue={'Last updated May 2026.\n\nEnter the ' + key + ' content here. This supports multiple paragraphs and will be shown on the public page.'} /></label>
          </>}

        </div>
        <div className="role-modal-f">
          <button className="adm-btn ghost" onClick={onClose}>Cancel</button>
          <button className="adm-btn primary" onClick={() => { window.admToast && window.admToast(key + ' saved'); onClose(); }}><MIcon name="check" size={15} /> Save changes</button>
        </div>
      </div>
    </div>
  );
}

function AdminCMS() {
  const [manage, setManage] = useMState(null);
  const items = [['Homepage hero', 'Carousel slides & banners', 'spark'], ['Featured banners', 'Promo placements', 'tag'], ['Blog posts', '14 published', 'edit'], ['FAQs', '23 entries', 'info'], ['Terms & Conditions', 'Last updated May 2026', 'shield'], ['Privacy Policy', 'Last updated May 2026', 'lock']];
  return (
    <>
      <AdmHead title="Content" sub="Manage site content & pages" />
      <div className="adm-row c3">{items.map((it, i) => (
        <div className="panel" key={i}><span className="kpi-ic" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}><MIcon name={it[2]} size={18} /></span><h3 style={{ margin: '12px 0 4px', fontSize: 16 }}>{it[0]}</h3><p className="muted" style={{ fontSize: 13 }}>{it[1]}</p><a onClick={() => setManage(it)} style={{ color: 'var(--primary)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, cursor: 'pointer', marginTop: 12, display: 'inline-block' }}>Manage →</a></div>
      ))}</div>
      {manage && <CmsManageDrawer item={manage} onClose={() => setManage(null)} />}
    </>
  );
}

function Toggle({ defaultOn, locked }) {
  const [on, setOn] = useMState(!!defaultOn);
  return <button className={'toggle' + (on ? ' on' : '') + (locked ? ' locked' : '')} onClick={() => { if (!locked) setOn(o => !o); else window.admToast && window.admToast('This control is locked for security'); }} aria-label="Toggle" title={locked ? 'Locked' : ''}>{locked && <MIcon name="lock" size={11} />}</button>;
}

function AdmDate({ value, onChange, placeholder }) {
  const [open, setOpen] = useMState(false);
  const [coords, setCoords] = useMState(null);
  const init = value ? new Date(value + 'T00:00:00') : new Date();
  const [view, setView] = useMState({ y: init.getFullYear(), m: init.getMonth() });
  const ref = React.useRef(null);
  const trigRef = React.useRef(null);
  const openCal = () => setOpen(o => !o);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc); document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);
  const MN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const first = new Date(view.y, view.m, 1).getDay();
  const days = new Date(view.y, view.m + 1, 0).getDate();
  const sel = value ? new Date(value + 'T00:00:00') : null;
  const isSel = (d) => sel && sel.getFullYear() === view.y && sel.getMonth() === view.m && sel.getDate() === d;
  const today = new Date();
  const isToday = (d) => today.getFullYear() === view.y && today.getMonth() === view.m && today.getDate() === d;
  const pick = (d) => { const mm = String(view.m + 1).padStart(2, '0'); const dd = String(d).padStart(2, '0'); onChange(`${view.y}-${mm}-${dd}`); setOpen(false); };
  const shift = (n) => setView(v => { let m = v.m + n, y = v.y; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } return { y, m }; });
  const label = value ? new Date(value + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  return (
    <div className={'adm-sel adm-date' + (open ? ' open' : '')} ref={ref}>
      <button type="button" ref={trigRef} className="adm-sel-trigger" onClick={openCal}>
        <span style={value ? null : { color: 'var(--text-faint)' }}>{label || placeholder || 'Select date'}</span><MIcon name="clock" size={15} className="adm-sel-chev" />
      </button>
      {open && (
        <div className="adm-cal" role="dialog">
          <div className="adm-cal-h">
            <button type="button" onClick={() => shift(-1)} aria-label="Previous month"><MIcon name="chevleft" size={16} /></button>
            <b>{MN[view.m]} {view.y}</b>
            <button type="button" onClick={() => shift(1)} aria-label="Next month"><MIcon name="chevright" size={16} /></button>
          </div>
          <div className="adm-cal-grid">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i} className="adm-cal-dow">{d}</span>)}
            {Array.from({ length: first }).map((_, i) => <span key={'e' + i} />)}
            {Array.from({ length: days }).map((_, i) => {
              const d = i + 1;
              return <button type="button" key={d} className={'adm-cal-day' + (isSel(d) ? ' on' : '') + (isToday(d) ? ' today' : '')} onClick={() => pick(d)}>{d}</button>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function AdmSelect({ value, options, onChange, creatable, onCreate, compact, icon, title }) {
  const [open, setOpen] = useMState(false);
  const [adding, setAdding] = useMState(false);
  const [nv, setNv] = useMState('');
  const [coords, setCoords] = useMState(null);
  const ref = React.useRef(null);
  const trigRef = React.useRef(null);
  const place = () => {
    if (!trigRef.current) return;
    const r = trigRef.current.getBoundingClientRect();
    if (compact) { const w = 208; setCoords({ left: Math.max(8, r.right - w), top: r.bottom + 5, width: w }); }
    else setCoords({ left: r.left, top: r.bottom + 5, width: r.width });
  };
  React.useEffect(() => {
    if (!open) return;
    place();
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setAdding(false); } };
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); setAdding(false); } };
    const onScroll = () => place();
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); window.removeEventListener('scroll', onScroll, true); window.removeEventListener('resize', onScroll); };
  }, [open]);
  const norm = options.map(o => typeof o === 'string' ? { value: o, label: o } : o);
  const cur = norm.find(o => o.value === value) || norm[0];
  const commit = () => {
    const name = nv.trim();
    if (!name) { setAdding(false); return; }
    onCreate && onCreate(name);
    setNv(''); setAdding(false); setOpen(false);
  };
  return (
    <div className={'adm-sel' + (open ? ' open' : '') + (compact ? ' compact' : '')} ref={ref}>
      <button type="button" ref={trigRef} className="adm-sel-trigger" onClick={() => setOpen(o => !o)} aria-haspopup="listbox" aria-expanded={open} title={title || (cur ? cur.label : '')}>
        {compact
          ? <><MIcon name={icon || 'sort'} size={16} /><MIcon name="chevdown" size={13} className="adm-sel-chev" /></>
          : <><span>{cur ? cur.label : 'Select…'}</span><MIcon name="chevdown" size={15} className="adm-sel-chev" /></>}
      </button>
      {open && coords && (
          <div className="adm-sel-pop fixed" role="listbox" style={{ position: 'fixed', left: coords.left, top: coords.top, width: coords.width }}>
            {compact && title && <div className="adm-sel-title">{title}</div>}
            {norm.map(o => (
              <button type="button" key={o.value} role="option" aria-selected={o.value === value}
                className={'adm-sel-opt' + (o.value === value ? ' on' : '')}
                onClick={() => { onChange(o.value); setOpen(false); }}>
                {o.label}{o.value === value && <MIcon name="check" size={15} stroke={3} />}
              </button>
            ))}
            {creatable && (adding ? (
              <div className="adm-sel-create">
                <input autoFocus value={nv} onChange={e => setNv(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commit(); } if (e.key === 'Escape') setAdding(false); }} placeholder="New category name" />
                <button type="button" className="adm-sel-add" onClick={commit} aria-label="Add"><MIcon name="check" size={15} stroke={3} /></button>
              </div>
            ) : (
              <button type="button" className="adm-sel-opt create" onClick={() => setAdding(true)}><MIcon name="plus" size={15} /> New category</button>
            ))}
          </div>
      )}
    </div>
  );
}

function AdminActivity() {
  const [filter, setFilter] = useMState('All');
  const ACT = [
    ['truck', 'info', 'Order', 'New order LMT-92481', '₦641,000 · 2 items, needs processing', '5 min ago'],
    ['package', 'warn', 'Inventory', 'Low stock alert', 'Aura Pro ANC Headphones, 4 left', '40 min ago'],
    ['user', 'ok', 'Customer', 'New signup', 'zainab.m@email.com created an account', '1 hr ago'],
    ['dollar', 'ok', 'Payout', 'Affiliate payout processed', '₦320,000 sent to Bella Styles', '2 hr ago'],
    ['share', 'info', 'Affiliate', 'New affiliate application', 'Kunle Tech, YouTube · 65k', '3 hr ago'],
    ['star', 'warn', 'Review', 'New 2★ review flagged', 'CoreByte Mini Desktop PC', '4 hr ago'],
    ['refresh', 'bad', 'Refund', 'Refund requested', 'LMT-85220 · ₦42,000', '5 hr ago'],
    ['gift', 'ok', 'Rewards', 'Spin reward claimed', 'Femi Alabi won ₦5,000 Lim Cash', '6 hr ago'],
    ['truck', 'info', 'Order', 'Order LMT-92470 delivered', '₦128,500 · Lagos', '8 hr ago'],
    ['package', 'bad', 'Inventory', 'Out of stock', 'Velvet Matte Lipstick, Ruby', '10 hr ago'],
    ['user', 'ok', 'Customer', 'New signup', 'david.o@email.com created an account', '12 hr ago'],
    ['dollar', 'ok', 'Order', 'Payment received', 'LMT-92455 · ₦96,000 via card', 'Yesterday'],
  ];
  const cats = ['All', 'Order', 'Inventory', 'Customer', 'Affiliate', 'Payout', 'Review', 'Refund', 'Rewards'];
  const list = ACT.filter(a => filter === 'All' || a[2] === filter);
  return (
    <>
      <AdmHead title="Activity log" sub="All notifications and recent store activity">
        <button className="adm-btn ghost"><MIcon name="download" size={15} /> Export</button>
      </AdmHead>
      <div className="adm-filters">
        {cats.map(c => <button key={c} className={'adm-chip' + (filter === c ? ' on' : '')} onClick={() => setFilter(c)}>{c}</button>)}
      </div>
      <div className="panel">
        <div className="adm-activity">
          {list.map((a, i) => (
            <div className="adm-act-row" key={i}>
              <span className={'adm-notif-ic ' + a[1]}><MIcon name={a[0]} size={16} /></span>
              <div className="adm-act-txt">
                <div className="adm-act-top"><b>{a[3]}</b><span className="adm-pill muted">{a[2]}</span></div>
                <small className="muted">{a[4]}</small>
              </div>
              <span className="adm-act-time muted">{a[5]}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

Object.assign(window, { AdminProducts, AdminOrders, AdminCustomers, AdminAffiliates, AdminReferrals, AdminSpin, AdminVideos, AdminElo, AdminCoupons, AdminInventory, AdminRoles, AdminReports, AdminCMS, AdminActivity, Toggle, AdmSelect, AdmDate });
