'use client';
/* LIMITRA shared Modal, AddressForm, CardForm, Dropdown — ported from legacy/forms.jsx.
   Field (originally in legacy/pages-cart.jsx, reused by pages-account.jsx) lives here too. */
import { useState, useEffect, useRef } from 'react';
import { Icon } from '@/components/icons/Icon';
import { cardBrand as dataCardBrand } from '@/lib/data';

export const NG_STATES = ['Lagos', 'Abuja (FCT)', 'Rivers', 'Oyo', 'Kano', 'Enugu', 'Kaduna', 'Delta'];

export function Modal({ title, sub, onClose, children, width = 520 }) {
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: width }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div><h3>{title}</h3>{sub && <p className="muted" style={{ fontSize: 13.5, marginTop: 2 }}>{sub}</p>}</div>
          <button className="modal-x" onClick={onClose} aria-label="Close"><Icon name="close" size={20} /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

/* form-level failure banner (e.g. "Invalid credentials") — distinct from a
   field's own err-msg, which stays inline under that field. */
export function FormAlert({ children }) {
  if (!children) return null;
  return (
    <div className="form-alert" role="alert">
      <Icon name="close" size={14} />
      <span>{children}</span>
    </div>
  );
}

export function FField({ label, value, onChange, err, placeholder, type = 'text', span }) {
  return (
    <div className="field" style={{ gridColumn: span === 'full' ? '1 / -1' : 'auto' }}>
      <label>{label}</label>
      <input className={'input' + (err ? ' err' : '')} type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
      {err && <span className="err-msg">{err}</span>}
    </div>
  );
}

/* originally legacy/pages-cart.jsx's Field, reused as-is by pages-account.jsx */
export function Field({ label, value, onChange, err, placeholder, type = 'text', half, full }) {
  return (
    <div className="field" style={{ gridColumn: full ? '1 / -1' : half ? 'auto' : '1 / -1' }}>
      <label>{label}</label>
      <input className={'input' + (err ? ' err' : '')} type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
      {err && <span className="err-msg">{err}</span>}
    </div>
  );
}

export function FSelect({ label, value, onChange, options, span }) {
  return (
    <div className="field" style={{ gridColumn: span === 'full' ? '1 / -1' : 'auto' }}>
      <label>{label}</label>
      <div className="sort-wrap" style={{ height: 49, borderRadius: 'var(--r-sm)', width: '100%' }}>
        <select className="sort-sel" style={{ width: '100%' }} value={value} onChange={e => onChange(e.target.value)}>
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
        <Icon name="chevdown" size={15} className="muted sort-chev" />
      </div>
    </div>
  );
}

function CheckRow({ checked, onChange, children }) {
  return (
    <label className="check" style={{ marginTop: 4 }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="cbox"><Icon name="check" size={12} stroke={3} /></span>
      {children}
    </label>
  );
}

export function AddressForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(() => initial || { label: 'Home', name: '', line: '', city: '', state: 'Lagos', phone: '', primary: false });
  const [errs, setErrs] = useState({});
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const submit = e => {
    e.preventDefault();
    const er = {};
    if (!f.name.trim()) er.name = 'Recipient name is required';
    if (!f.line.trim()) er.line = 'Street address is required';
    if (!f.city.trim()) er.city = 'City is required';
    if (f.phone.replace(/\D/g, '').length < 10) er.phone = 'Enter a valid phone number';
    setErrs(er);
    if (Object.keys(er).length) return;
    onSave(f);
  };
  return (
    <form onSubmit={submit}>
      <div className="form-grid">
        <FSelect label="Label" value={f.label} onChange={v => set('label', v)} options={['Home', 'Office', 'Other']} />
        <FField label="Recipient name" value={f.name} onChange={v => set('name', v)} err={errs.name} placeholder="Lucy Limitra" />
        <FField label="Street address" span="full" value={f.line} onChange={v => set('line', v)} err={errs.line} placeholder="14 Admiralty Way, Lekki Phase 1" />
        <FField label="City" value={f.city} onChange={v => set('city', v)} err={errs.city} placeholder="Lagos" />
        <FSelect label="State" value={f.state} onChange={v => set('state', v)} options={NG_STATES} />
        <FField label="Phone number" span="full" value={f.phone} onChange={v => set('phone', v)} err={errs.phone} placeholder="+234 800 000 0000" />
      </div>
      <CheckRow checked={!!f.primary} onChange={v => set('primary', v)}>Set as default address</CheckRow>
      <div className="modal-foot">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">{initial && initial.id ? 'Save changes' : 'Add address'}</button>
      </div>
    </form>
  );
}

export function CardForm({ initial, onSave, onCancel }) {
  const editing = !!(initial && initial.id);
  const [f, setF] = useState(() => initial || { name: '', number: '', exp: '', cvv: '', primary: false });
  const [errs, setErrs] = useState({});
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const fmtCard = v => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const submit = e => {
    e.preventDefault();
    const er = {};
    if (!f.name.trim()) er.name = 'Name on card is required';
    if (!editing && (f.number || '').replace(/\s/g, '').length < 15) er.number = 'Enter a valid card number';
    if (!/^\d{2}\/\d{2}$/.test(f.exp)) er.exp = 'MM/YY';
    if (!editing && (f.cvv || '').length < 3) er.cvv = 'CVV';
    setErrs(er);
    if (Object.keys(er).length) return;
    if (editing) {
      onSave({ id: f.id, name: f.name, exp: f.exp, primary: f.primary, brand: f.brand, last: f.last });
    } else {
      const digits = f.number.replace(/\s/g, '');
      onSave({ name: f.name, exp: f.exp, primary: f.primary, brand: dataCardBrand(digits), last: digits.slice(-4) });
    }
  };
  return (
    <form onSubmit={submit}>
      <div className="form-grid">
        <FField label="Name on card" span="full" value={f.name} onChange={v => set('name', v)} err={errs.name} placeholder="LUCY LIMITRA" />
        {editing
          ? <div className="field" style={{ gridColumn: '1 / -1' }}><label>Card number</label><div className="input" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>{f.brand} •••• •••• •••• {f.last}</div></div>
          : <FField label="Card number" span="full" value={f.number} onChange={v => set('number', fmtCard(v))} err={errs.number} placeholder="4242 4242 4242 4242" />}
        <FField label="Expiry (MM/YY)" value={f.exp} onChange={v => set('exp', v.replace(/[^\d]/g, '').slice(0, 4).replace(/(\d{2})(\d)/, '$1/$2'))} err={errs.exp} placeholder="08/28" />
        {!editing && <FField label="CVV" value={f.cvv} onChange={v => set('cvv', v.replace(/\D/g, '').slice(0, 4))} err={errs.cvv} placeholder="123" />}
      </div>
      <CheckRow checked={!!f.primary} onChange={v => set('primary', v)}>Set as default card</CheckRow>
      <div className="modal-foot">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">{editing ? 'Save changes' : 'Save card'}</button>
      </div>
    </form>
  );
}

/* card brand chip — detects brand from a card object or PAN; reuses .card-chip styles */
export function CardBrandMark({ brand, number }) {
  const b = brand || dataCardBrand(number);
  const cls = b === 'Visa' ? 'visa' : b === 'Mastercard' ? 'mc' : b === 'Verve' ? 'verve' : 'other';
  return <span className={'card-chip ' + cls}>{b}</span>;
}

/* custom styled dropdown (trigger + floating option menu, like the account popover) */
export function Dropdown({ value, options, onChange, icon, getIcon, getMeta, placeholder, width }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = e => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); window.removeEventListener('keydown', onKey); };
  }, [open]);
  const norm = options.map(o => (typeof o === 'string' ? { value: o, label: o } : o));
  const cur = norm.find(o => o.value === value) || norm[0] || { label: placeholder || '' };
  return (
    <div className={'dd' + (open ? ' open' : '')} ref={ref} style={width ? { width } : null}>
      <button type="button" className="dd-trigger" onClick={() => setOpen(o => !o)} aria-haspopup="listbox" aria-expanded={open}>
        {icon && <Icon name={icon} size={17} className="dd-lead" />}
        <span className="dd-value">{cur.label}</span>
        <Icon name="chevdown" size={16} className="dd-chev" />
      </button>
      {open && (
        <div className="dd-menu" role="listbox">
          {norm.map(o => (
            <button type="button" key={o.value} role="option" aria-selected={o.value === value}
              className={'dd-opt' + (o.value === value ? ' on' : '')}
              onClick={() => { onChange(o.value); setOpen(false); }}>
              {getIcon && <span className="dd-opt-ic"><Icon name={getIcon(o.value)} size={15} /></span>}
              <span className="dd-opt-label">{o.label}</span>
              {getMeta && getMeta(o.value) != null && <span className="dd-opt-meta">{getMeta(o.value)}</span>}
              {o.value === value && <Icon name="check" size={15} stroke={3} className="dd-opt-check" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
