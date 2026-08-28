'use client';
/* System nav group (Content/CMS, Roles & Access, Reports) — ported verbatim from
   legacy/admin-sections.jsx. `window.admToast` calls replaced with `useAdminToast()`. */
import { useState } from 'react';
import { Icon } from '@/components/icons/Icon';
import { useAdminToast } from './AdminToastContext';
import { AdmHead, AdmSelect } from './AdminShared';

/* ---------- CMS ---------- */
function CmsManageDrawer({ item, onClose }) {
  const addToast = useAdminToast();
  const [tab, setTab] = useState(0);
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
            <span className="kpi-ic" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}><Icon name={item[2]} size={18} /></span>
            <div><h3 style={{ fontSize: 18 }}>Manage · {key}</h3><small className="muted">Edit site content</small></div>
          </div>
          <button className="role-modal-x" onClick={onClose} aria-label="Close"><Icon name="close" size={18} /></button>
        </div>
        <div className="role-modal-b">

          {isHero && <>
            <div className="cms-tabs">{heroSlides.map((_, i) => <button key={i} className={'cms-tab' + (tab === i ? ' on' : '')} onClick={() => setTab(i)}>Slide {i + 1}</button>)}</div>
            <label className="adm-img-drop" style={{ height: 150 }}><span className="adm-img-empty"><Icon name="eye" size={26} /><b>Add slide image</b><small>Drag &amp; drop or click to browse · JPG, PNG</small></span><input type="file" accept="image/*" hidden onChange={() => addToast('Image attached')} /></label>
            <label className="adm-field"><span>Headline</span><input defaultValue={heroSlides[tab].title} /></label>
            <label className="adm-field"><span>Subtext</span><textarea rows={2} defaultValue={heroSlides[tab].sub} /></label>
            <label className="adm-field"><span>Button label</span><input defaultValue={heroSlides[tab].cta} /></label>
            <div className="adm-field-row"><label className="adm-field"><span>Links to</span><input defaultValue="/shop" /></label><label className="adm-field"><span>Offer badge</span><input defaultValue="Up to 40% off" /></label></div>
          </>}

          {isBanner && <>
            <label className="adm-img-drop" style={{ height: 150 }}><span className="adm-img-empty"><Icon name="tag" size={26} /><b>Add banner image</b><small>Drag &amp; drop or click to browse · JPG, PNG</small></span><input type="file" accept="image/*" hidden onChange={() => addToast('Image attached')} /></label>
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
            <button className="adm-btn ghost" onClick={() => addToast('New FAQ row added')}><Icon name="plus" size={15} /> Add FAQ</button>
          </div>}

          {isBlog && <>
            <label className="adm-img-drop" style={{ height: 150 }}><span className="adm-img-empty"><Icon name="edit" size={26} /><b>Add cover image</b><small>Drag &amp; drop or click to browse · JPG, PNG</small></span><input type="file" accept="image/*" hidden onChange={() => addToast('Image attached')} /></label>
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
          <button className="adm-btn primary" onClick={() => { addToast(key + ' saved'); onClose(); }}><Icon name="check" size={15} /> Save changes</button>
        </div>
      </div>
    </div>
  );
}

export function AdminCMS() {
  const [manage, setManage] = useState(null);
  const items = [['Homepage hero', 'Carousel slides & banners', 'spark'], ['Featured banners', 'Promo placements', 'tag'], ['Blog posts', '14 published', 'edit'], ['FAQs', '23 entries', 'info'], ['Terms & Conditions', 'Last updated May 2026', 'shield'], ['Privacy Policy', 'Last updated May 2026', 'lock']];
  return (
    <>
      <AdmHead title="Content" sub="Manage site content & pages" />
      <div className="adm-row c3">{items.map((it, i) => (
        <div className="panel" key={i}><span className="kpi-ic" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}><Icon name={it[2]} size={18} /></span><h3 style={{ margin: '12px 0 4px', fontSize: 16 }}>{it[0]}</h3><p className="muted" style={{ fontSize: 13 }}>{it[1]}</p><a onClick={() => setManage(it)} style={{ color: 'var(--primary)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, cursor: 'pointer', marginTop: 12, display: 'inline-block' }}>Manage →</a></div>
      ))}</div>
      {manage && <CmsManageDrawer item={manage} onClose={() => setManage(null)} />}
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
  const addToast = useAdminToast();
  const isNew = !role;
  const [name, setName] = useState(role ? role[0] : '');
  const [desc, setDesc] = useState(role ? role[1] : '');
  const full = role && role[0] === 'Super Admin';
  const [perms, setPerms] = useState(() => {
    const o = {};
    ROLE_PERMS.forEach((p, i) => { o[p] = full ? true : (role ? i % 2 === 0 : false); });
    return o;
  });
  const toggle = (p) => { if (full) return; setPerms(m => ({ ...m, [p]: !m[p] })); };
  const [adding, setAdding] = useState(false);
  const [nn, setNn] = useState('');
  const [ne, setNe] = useState('');
  const [pending, setPending] = useState([]);
  const list = isNew ? pending : (members || []);
  const submitAdd = () => {
    const rn = role ? role[0] : name.trim();
    if (!rn) { addToast('Enter a role name first'); return; }
    if (!nn.trim() || !/^\S+@\S+\.\S+$/.test(ne)) { addToast('Enter a name and valid email'); return; }
    if (isNew) { setPending(p => [...p, [nn.trim(), ne.trim(), rn]]); addToast(nn.trim() + ' added'); }
    else { onAdd && onAdd(nn.trim(), ne.trim(), rn); }
    setNn(''); setNe(''); setAdding(false);
  };
  const removeFrom = (email) => { if (isNew) setPending(p => p.filter(m => m[1] !== email)); else onRemove && onRemove(email); };
  return (
    <div className="role-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="role-modal">
        <div className="role-modal-h">
          <div className="row" style={{ gap: 12 }}>
            <span className="kpi-ic" style={{ background: (role ? role[3] : 'var(--primary)') + '22', color: role ? role[3] : 'var(--primary)' }}><Icon name="lock" size={18} /></span>
            <div><h3 style={{ fontSize: 18 }}>{isNew ? 'Add role' : 'Edit role'}</h3><small className="muted">Configure access & members</small></div>
          </div>
          <button className="role-modal-x" onClick={onClose}><Icon name="close" size={18} /></button>
        </div>
        <div className="role-modal-b">
          <div className="adm-field-row">
            <label className="adm-field"><span>Role name</span><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Marketing Manager" /></label>
            <label className="adm-field"><span>Members</span><input value={role ? list.length : 0} readOnly /></label>
          </div>
          <label className="adm-field"><span>Description</span><input value={desc} onChange={e => setDesc(e.target.value)} placeholder="What this role can do" /></label>
          <div className="adm-field">
            <span className="row between" style={{ alignItems: 'center' }}><span>Members ({list.length})</span> <button type="button" className="adm-link-btn" onClick={() => setAdding(a => !a)}><Icon name={adding ? 'close' : 'plus'} size={13} /> {adding ? 'Cancel' : 'Add member'}</button></span>
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
                      <button type="button" className="role-member-x" title="Remove member" onClick={() => removeFrom(mem[1])}><Icon name="trash" size={15} /></button>
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
          <button className="adm-btn primary" onClick={() => { addToast(isNew ? 'Role created' : role[0] + ' updated'); onClose(); }}>{isNew ? 'Create role' : 'Save changes'}</button>
        </div>
      </div>
    </div>
  );
}

export function AdminRoles() {
  const addToast = useAdminToast();
  const [edit, setEdit] = useState(null); // role array or 'new'
  const [staff, setStaff] = useState(STAFF);
  const assign = (email, newRole) => { setStaff(s => s.map(m => m[1] === email ? [m[0], m[1], newRole] : m)); addToast(email + ' → ' + newRole); };
  const addMember = (nm, email, roleName) => {
    if (staff.some(m => m[1] === email)) { addToast('That email is already a member'); return; }
    setStaff(s => [...s, [nm, email, roleName]]); addToast(nm + ' added to ' + roleName);
  };
  const removeMember = (email) => { setStaff(s => s.filter(m => m[1] !== email)); addToast('Member removed'); };
  const editRole = edit && edit !== 'new' ? edit : null;
  return (
    <>
      <AdmHead title="Roles & Access" sub="Role-based permissions"><button className="adm-btn primary" onClick={() => setEdit('new')}><Icon name="plus" size={15} /> Add role</button></AdmHead>
      <div className="adm-row c3">
        {ADMIN_ROLES.map((r, i) => (
          <div className="panel" key={i}>
            <span className="kpi-ic" style={{ background: r[3] + '22', color: r[3] }}><Icon name="lock" size={18} /></span>
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
export function AdminReports() {
  const reports = [['Sales report', 'Revenue, AOV, refunds', 'dollar'], ['Orders report', 'All orders & statuses', 'truck'], ['Customers report', 'Acquisition & retention', 'user'], ['Affiliates report', 'Earnings & payouts', 'share'], ['Referrals report', 'Lim Cash issued', 'gift'], ['Inventory report', 'Stock movements', 'package']];
  return (
    <>
      <AdmHead title="Reports & Exports" sub="Generate and download business reports" />
      <div className="adm-row c3">
        {reports.map((r, i) => (
          <div className="panel" key={i}>
            <span className="kpi-ic" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}><Icon name={r[2]} size={18} /></span>
            <h3 style={{ margin: '12px 0 4px', fontSize: 16 }}>{r[0]}</h3>
            <p className="muted" style={{ fontSize: 13, marginBottom: 14 }}>{r[1]}</p>
            <div className="row" style={{ gap: 8 }}><button className="adm-btn ghost" style={{ flex: 1, justifyContent: 'center' }}>CSV</button><button className="adm-btn ghost" style={{ flex: 1, justifyContent: 'center' }}>Excel</button><button className="adm-btn ghost" style={{ flex: 1, justifyContent: 'center' }}>PDF</button></div>
          </div>
        ))}
      </div>
    </>
  );
}
