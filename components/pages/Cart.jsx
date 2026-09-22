'use client';
/* LIMITRA, Cart & Checkout flow — ported from legacy/pages-cart.jsx */
import { Fragment, useState, useEffect } from 'react';
import { Icon } from '@/components/icons/Icon';
import { useStore } from '@/components/store/StoreProvider';
import { Modal, AddressForm, CardForm, CardBrandMark, Field } from '@/components/forms/Shared';
import { Thumb, REAL_IMG, QtyStepper, Breadcrumbs, EmptyState } from '@/components/ui/Shared';
import { naira, byId } from '@/lib/data';
import { ordersApi } from '@/lib/api/endpoints';
import { messageFrom } from '@/lib/api/errors';

const SHIP_FEE = 3500;
const FREE_SHIP = 150000;

export function OrderSummary({ items, promo, ship, children, cta, onCta, ctaIcon, useCredit, onToggleCredit }) {
  const { referral } = useStore();
  const sub = items.reduce((s, it) => s + (byId(it.id)?.price || 0) * it.qty, 0);
  const disc = promo ? Math.round(sub * promo.pct) : 0;
  const shipping = ship == null ? 0 : ship;
  const beforeCredit = Math.max(0, sub - disc) + shipping;
  const credit = useCredit ? Math.min(referral.credit, beforeCredit) : 0;
  const total = beforeCredit - credit;
  return (
    <aside className="summary card">
      <h3>Order summary</h3>
      <div className="sum-row"><span className="muted">Subtotal ({items.reduce((s, i) => s + i.qty, 0)} items)</span><b>{naira(sub)}</b></div>
      {disc > 0 && <div className="sum-row"><span className="muted">Discount <span className="badge badge-soft" style={{ marginLeft: 4 }}>{promo.code}</span></span><b style={{ color: 'var(--success)' }}>−{naira(disc)}</b></div>}
      <div className="sum-row"><span className="muted">Delivery</span>{shipping === 0 ? <b style={{ color: 'var(--success)' }}>Free</b> : <b>{naira(shipping)}</b>}</div>
      {children}
      {referral.credit > 0 && onToggleCredit && (
        <label className="credit-row">
          <input type="checkbox" checked={!!useCredit} onChange={e => onToggleCredit(e.target.checked)} />
          <span className="cbox"><Icon name="check" size={12} stroke={3} /></span>
          <span className="credit-label"><span className="credit-label-main">Apply Lim Cash <img src="/assets/limcash.png" alt="" className="limcash-ic sm" /></span><small className="muted">{naira(referral.credit)} available</small></span>
          {credit > 0 && <b style={{ color: 'var(--success)' }}>−{naira(credit)}</b>}
        </label>
      )}
      <div className="sum-total"><span>Total</span><span>{naira(total)}</span></div>
      {shipping > 0
        ? <p className="ship-hint"><Icon name="truck" size={14} /> Add {naira(FREE_SHIP - (sub - disc))} more for free delivery</p>
        : <p className="ship-hint ship-hint-free"><Icon name="truck" size={14} /> Standard delivery is currently free</p>}
      {cta && <button className="btn btn-primary btn-block btn-lg" onClick={() => onCta(total, credit)} style={{ marginTop: 16 }}>{ctaIcon && <Icon name={ctaIcon} size={18} />}{cta}</button>}
      <div className="sum-trust"><span><Icon name="lock" size={14} /> Secure checkout</span><span><Icon name="shield" size={14} /> Buyer protection</span></div>
    </aside>
  );
}

function PromoBox({ promo, setPromo }) {
  const { rewards } = useStore();
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  // active won pct-coupons usable here
  const wonPct = (rewards || []).filter(r => r.status === 'Active' && r.kind === 'pct');
  const apply = (forced) => {
    const c = (forced || code).trim().toUpperCase();
    const valid = { LIMITRA10: 0.10, TECH15: 0.15, WELCOME: 0.05 };
    const won = wonPct.find(r => r.code.toUpperCase() === c);
    const affCodes = JSON.parse(localStorage.getItem('lim_aff_promos') || '[]');
    const aff = affCodes.find(a => a.code.toUpperCase() === c && a.active !== false);
    if (won) { setPromo({ code: won.code, pct: won.value }); setErr(''); }
    else if (aff) { setPromo({ code: aff.code, pct: aff.pct, aff: aff.affName }); setErr(''); }
    else if (valid[c]) { setPromo({ code: c, pct: valid[c] }); setErr(''); }
    else { setErr('Invalid or expired code'); setPromo(null); }
  };
  return (
    <div className="promo-box">
      <div className="v-label" style={{ marginBottom: 8 }}>Promo code</div>
      {wonPct.length > 0 && !promo && (
        <button className="promo-suggest" onClick={() => apply(wonPct[0].code)}>
          <span className="ps-ic"><Icon name="gift" size={16} /></span>
          <span className="ps-body">
            <span className="ps-label">Your reward</span>
            <span className="ps-code">{wonPct[0].code}</span>
          </span>
          <span className="ps-off">{Math.round(wonPct[0].value * 100)}% off</span>
          <span className="ps-apply">Apply</span>
        </button>
      )}
      <div className="row" style={{ gap: 8 }}>
        <input className={'input' + (err ? ' err' : '')} placeholder="e.g. LIMITRA10" value={code} onChange={e => { setCode(e.target.value); setErr(''); }} />
        <button className="btn btn-ghost" onClick={() => apply()} style={{ flex: 'none' }}>Apply</button>
      </div>
      {err && <span className="err-msg" style={{ marginTop: 6, display: 'block' }}>{err}</span>}
      {promo && <span className="row" style={{ gap: 6, color: 'var(--success)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, marginTop: 8 }}><Icon name="check" size={14} stroke={3} /> {promo.code} applied, {Math.round(promo.pct * 100)}% off{promo.aff ? ' · via ' + promo.aff : ''}</span>}
      <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>Try <b>LIMITRA10</b>, <b>TECH15</b> or <b>WELCOME</b></p>
    </div>
  );
}

export function CartPage() {
  const { cart, setQty, removeItem, clearCart, go, toast, referral, promo, setPromo } = useStore();
  const [useCredit, setUseCredit] = useState(false);
  useEffect(() => { try { setUseCredit(localStorage.getItem('lim_use_credit') === '1'); } catch (e) {} }, []);
  const toggleCredit = (v) => { setUseCredit(v); localStorage.setItem('lim_use_credit', v ? '1' : '0'); };

  if (cart.length === 0) {
    return (
      <div className="page page-fade"><div className="wrap">
        <Breadcrumbs items={[{ label: 'Home', to: ['home'] }, { label: 'Cart' }]} />
        <EmptyState icon="cart" title="Your cart is empty" body="Looks like you haven’t added anything yet. Explore the store and find something you’ll love." action="Start shopping" onAction={() => go('shop', 'all')} />
      </div></div>
    );
  }

  return (
    <div className="page page-fade"><div className="wrap">
      <Breadcrumbs items={[{ label: 'Home', to: ['home'] }, { label: 'Shopping cart' }]} />
      <div className="row between" style={{ margin: '8px 0 24px', flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 30 }}>Shopping cart <span className="muted" style={{ fontWeight: 600, fontSize: 18 }}>· {cart.length} {cart.length === 1 ? 'item' : 'items'}</span></h1>
        <button className="link-btn" onClick={() => { clearCart(); toast('Cart cleared'); }}>Clear cart</button>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {cart.map(it => {
            const p = byId(it.id);
            if (!p) return null;
            return (
              <div className="cart-item" key={it.key}>
                <div className="ci-thumb" onClick={() => go('product', p.id)}><Thumb product={p} src={REAL_IMG[p.id]} /></div>
                <div className="ci-info">
                  <span className="pc-brand">{p.brand}</span>
                  <h4 onClick={() => go('product', p.id)} style={{ cursor: 'pointer' }}>{p.name}</h4>
                  <div className="ci-meta">
                    {it.color && <span className="ci-tag"><i style={{ background: (p.colors.find(c => c.name === it.color) || {}).hex }} />{it.color}</span>}
                    {it.storage && <span className="ci-tag">{it.storage}</span>}
                    <span className="row" style={{ gap: 5, color: 'var(--success)' }}><Icon name="check" size={13} stroke={3} /> In stock</span>
                  </div>
                  <div className="ci-bottom">
                    <QtyStepper value={it.qty} onChange={q => setQty(it.key, q)} />
                    <button className="ci-remove" onClick={() => { removeItem(it.key); toast('Removed from cart'); }}><Icon name="trash" size={16} /> Remove</button>
                  </div>
                </div>
                <div className="ci-price">
                  {p.was ? <small className="ci-was">{naira(p.was * it.qty)}</small> : null}
                  <b className={p.was ? 'sale' : ''}>{naira(p.price * it.qty)}</b>
                  {p.was ? <small className="ci-save">Save {naira((p.was - p.price) * it.qty)}</small> : (it.qty > 1 ? <small className="muted">{naira(p.price)} each</small> : null)}
                </div>
              </div>
            );
          })}
          <button className="btn btn-ghost" onClick={() => go('shop', 'all')} style={{ marginTop: 8 }}><Icon name="chevleft" size={16} /> Continue shopping</button>
        </div>

        <OrderSummary items={cart} promo={promo} cta="Proceed to checkout" ctaIcon="lock" onCta={() => go('checkout')} useCredit={useCredit} onToggleCredit={toggleCredit}>
          <PromoBox promo={promo} setPromo={setPromo} />
        </OrderSummary>
      </div>
    </div></div>
  );
}

/* ---------------- CHECKOUT ---------------- */
const STEPS = [['Shipping', 'location'], ['Payment', 'card'], ['Review', 'check']];

function Stepper({ step }) {
  return (
    <div className="stepper">
      {STEPS.map(([label, ic], i) => (
        <Fragment key={i}>
          <div className={'step' + (i === step ? ' active' : '') + (i < step ? ' done' : '')}>
            <span className="step-dot">{i < step ? <Icon name="check" size={16} stroke={3} /> : <Icon name={ic} size={16} />}</span>
            <span className="step-label">{label}</span>
          </div>
          {i < STEPS.length - 1 && <span className={'step-line' + (i < step ? ' done' : '')} />}
        </Fragment>
      ))}
    </div>
  );
}

export function CheckoutPage() {
  const { cart, cartTotal, clearCart, go, toast, addresses, cards, saveAddress, saveCard, referral, redeemCredit, promo, user, isAuthenticated } = useStore();
  const [step, setStep] = useState(0);
  const [orderId, setOrderId] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [idemKey] = useState(() => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random()));
  const [useCredit, setUseCreditState] = useState(false);
  useEffect(() => { try { setUseCreditState(localStorage.getItem('lim_use_credit') === '1'); } catch (e) {} }, []);
  const setUseCredit = (v) => { setUseCreditState(v); localStorage.setItem('lim_use_credit', v ? '1' : '0'); };
  const primaryAddr = addresses.find(a => a.primary) || addresses[0];
  const primaryCard = cards.find(c => c.primary) || cards[0];
  const [selAddr, setSelAddr] = useState(primaryAddr ? primaryAddr.id : null);
  const [selCard, setSelCard] = useState(primaryCard ? primaryCard.id : null);
  const [email, setEmail] = useState(user?.email || '');
  useEffect(() => { if (user?.email) setEmail(e => e || user.email); }, [user]);
  const [method, setMethod] = useState('standard');
  const [payMethod, setPayMethod] = useState('card');
  const [addrModal, setAddrModal] = useState(false);
  const [cardModal, setCardModal] = useState(false);
  const [xferModal, setXferModal] = useState(false);
  const [xferDone, setXferDone] = useState(false);
  const [xferCopied, setXferCopied] = useState('');
  const [errs, setErrs] = useState({});

  const activeAddr = addresses.find(a => a.id === selAddr);
  const activeCard = cards.find(c => c.id === selCard);

  useEffect(() => { window.scrollTo({ top: 0 }); }, [step]);

  if (!isAuthenticated && !orderId) {
    return (
      <div className="page page-fade"><div className="wrap">
        <EmptyState icon="user" title="Sign in to check out" body="Orders are tied to your account — sign in to continue." action="Sign in" onAction={() => go('auth', 'signin')} />
      </div></div>
    );
  }

  if (cart.length === 0 && !orderId) {
    return (
      <div className="page page-fade"><div className="wrap">
        <EmptyState icon="cart" title="Nothing to check out" body="Your cart is empty. Add a few products first." action="Browse products" onAction={() => go('shop', 'all')} />
      </div></div>
    );
  }

  const addNewAddress = (d) => { const id = Date.now(); saveAddress({ ...d, id }); setSelAddr(id); setAddrModal(false); };
  const addNewCard = (d) => { const id = Date.now(); saveCard({ ...d, id }); setSelCard(id); setCardModal(false); };

  const validateShip = () => {
    const e = {};
    if (!activeAddr) e.addr = 'Select or add a delivery address';
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Enter a valid email';
    setErrs(e); return Object.keys(e).length === 0;
  };
  const validatePay = () => {
    if (payMethod !== 'card') { setErrs({}); return true; }
    const e = {};
    if (!activeCard) e.card = 'Select or add a card';
    setErrs(e); return Object.keys(e).length === 0;
  };

  const next = () => {
    if (step === 0 && !validateShip()) return;
    if (step === 1 && !validatePay()) return;
    setStep(s => s + 1);
  };
  const placeOrder = async (skipXfer) => {
    if (payMethod === 'transfer' && !xferDone && !skipXfer) { setXferModal(true); return; }
    if (placing) return;
    setPlacing(true);
    try {
      const order = await ordersApi.create(idemKey);
      if (useCredit) { const applied = redeemCredit(Math.min(referral.credit, cartTotal + shipFee)); if (applied > 0) toast(`${naira(applied)} credit applied`); }
      setOrderId(order?.id || order?.order_number || idemKey);
      await clearCart();
      toast('Order placed successfully!');
    } catch (err) {
      toast(messageFrom(err), 'error');
    } finally {
      setPlacing(false);
    }
  };

  if (orderId) return <OrderSuccess orderId={orderId} email={email} method={method} />;

  const shipFee = method === 'express' ? 5000 : 0;
  const methodLabel = { standard: 'Standard delivery · 10–14 days (Free)', express: 'Express delivery · 5–7 days', pickup: 'Pickup station' }[method];

  return (
    <div className="page page-fade"><div className="wrap page-narrow">
      <Breadcrumbs items={[{ label: 'Home', to: ['home'] }, { label: 'Cart', to: ['cart'] }, { label: 'Checkout' }]} />
      <h1 style={{ fontSize: 28, margin: '6px 0 26px' }}>Checkout</h1>
      <Stepper step={step} />

      <div className="checkout-layout">
        <div className="checkout-main">
          {step === 0 && (
            <div className="co-card card">
              <div className="row between" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <h3 className="co-h" style={{ marginBottom: 0 }}>Delivery address</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setAddrModal(true)}><Icon name="plus" size={15} /> Add new address</button>
              </div>
              {errs.addr && <span className="err-msg" style={{ marginBottom: 10, display: 'block' }}>{errs.addr}</span>}
              {addresses.length === 0 ? (
                <button className="addr-add" onClick={() => setAddrModal(true)} style={{ width: '100%', minHeight: 120 }}><Icon name="plus" size={24} /><span>Add a delivery address</span></button>
              ) : (
                <div className="addr-select">
                  {addresses.map(a => (
                    <label key={a.id} className={'addr-pick' + (selAddr === a.id ? ' on' : '')}>
                      <input type="radio" name="addr" checked={selAddr === a.id} onChange={() => setSelAddr(a.id)} />
                      <span className="rc-radio" />
                      <div className="ap-body">
                        <div className="row" style={{ gap: 8 }}><b>{a.label}</b>{a.primary && <span className="badge badge-soft" style={{ fontSize: 10 }}>Default</span>}</div>
                        <p className="muted">{a.name} · {a.line}, {a.city}{a.state ? ', ' + a.state : ''}</p>
                        <p className="muted" style={{ fontSize: 12.5 }}>{a.phone}</p>
                      </div>
                      <button type="button" className="ap-edit" onClick={(e) => { e.preventDefault(); setSelAddr(a.id); setAddrModal('edit-' + a.id); }} title="Edit"><Icon name="edit" size={15} /></button>
                    </label>
                  ))}
                </div>
              )}

              <h4 className="co-sub">Contact email</h4>
              <Field label="Order updates will be sent here" full value={email} onChange={setEmail} err={errs.email} placeholder="you@email.com" />

              <h4 className="co-sub">Delivery method</h4>
              <div className="radio-cards">
                {[['standard', 'Standard delivery', '10–14 days', 0, false, 2000], ['express', 'Express delivery', '5–7 days', 5000, false, 0], ['pickup', 'Pickup station', 'Temporarily unavailable', 0, true, 0]].map(([val, t, sub, fee, disabled, was]) => (
                  <label key={val} className={'radio-card' + (method === val ? ' on' : '') + (disabled ? ' disabled' : '')}>
                    <input type="radio" name="ship" checked={method === val} disabled={disabled} onChange={() => !disabled && setMethod(val)} />
                    <span className="rc-radio" />
                    <div className="rc-body"><b>{t}</b><small>{sub}</small></div>
                    {disabled ? <span className="rc-soon">Soon</span> : <span className="rc-price">{was ? <><span className="rc-was">{naira(was)}</span> <span className="rc-free">Free</span></> : (fee === 0 ? 'Free' : naira(fee))}</span>}
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="co-card card">
              <h3 className="co-h">Payment method</h3>
              <div className="radio-cards">
                {[['card', 'card', 'Credit / Debit card', 'Visa, Mastercard, Verve'], ['transfer', 'dollar', 'Bank transfer', 'Pay by direct bank transfer'], ['cod', 'truck', 'Pay on delivery', 'Cash or POS at your door']].map(([val, ic, t, sub]) => (
                  <label key={val} className={'radio-card' + (payMethod === val ? ' on' : '')}>
                    <input type="radio" name="pay" checked={payMethod === val} onChange={() => setPayMethod(val)} />
                    <span className="rc-radio" />
                    <span className="rc-ic"><Icon name={ic} size={19} /></span>
                    <div className="rc-body"><b>{t}</b><small>{sub}</small></div>
                  </label>
                ))}
              </div>

              {payMethod === 'card' && (
                <div style={{ marginTop: 22 }}>
                  <div className="row between" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                    <h4 className="co-sub" style={{ margin: 0 }}>Your saved cards</h4>
                    <button className="btn btn-ghost btn-sm" onClick={() => setCardModal(true)}><Icon name="plus" size={15} /> Add new card</button>
                  </div>
                  {errs.card && <span className="err-msg" style={{ marginBottom: 10, display: 'block' }}>{errs.card}</span>}
                  {cards.length === 0 ? (
                    <button className="addr-add" onClick={() => setCardModal(true)} style={{ width: '100%', minHeight: 110 }}><Icon name="plus" size={24} /><span>Add a payment card</span></button>
                  ) : (
                    <div className="card-select">
                      {cards.map(c => (
                        <label key={c.id} className={'card-pick' + (selCard === c.id ? ' on' : '')}>
                          <input type="radio" name="card" checked={selCard === c.id} onChange={() => setSelCard(c.id)} />
                          <span className="rc-radio" />
                          <CardBrandMark brand={c.brand} />
                          <div className="cp-body"><b>•••• {c.last}</b><small className="muted">{c.name} · exp {c.exp}</small></div>
                          {c.primary && <span className="badge badge-soft" style={{ fontSize: 10 }}>Default</span>}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {payMethod === 'transfer' && (
                <div className={'xfer-status' + (xferDone ? ' ok' : '')} style={{ marginTop: 18 }}>
                  <Icon name={xferDone ? 'check' : 'info'} size={17} />
                  <div style={{ flex: 1 }}>
                    <b>{xferDone ? 'Transfer confirmed' : 'Bank transfer selected'}</b>
                    <p className="muted" style={{ margin: '2px 0 0' }}>{xferDone ? 'We’ll verify your payment and process the order.' : 'You’ll get the account details when you place your order.'}</p>
                  </div>
                  {xferDone && <button className="btn btn-outline btn-sm" onClick={() => setXferModal(true)}>View details</button>}
                </div>
              )}
              {payMethod === 'cod' && <div className="co-note"><Icon name="info" size={17} />Have the exact amount ready. Our rider accepts cash and card on delivery.</div>}
            </div>
          )}

          {step === 2 && (
            <div className="co-card card">
              <h3 className="co-h">Review your order</h3>
              <div className="review-block">
                <div className="rb-head"><span><Icon name="location" size={16} /> Delivery to</span><button className="link-btn" onClick={() => setStep(0)}>Edit</button></div>
                {activeAddr && <p><b>{activeAddr.name}</b> <span className="badge badge-soft" style={{ fontSize: 10 }}>{activeAddr.label}</span><br />{activeAddr.line}, {activeAddr.city}{activeAddr.state ? ', ' + activeAddr.state : ''}<br />{activeAddr.phone} · {email}</p>}
                <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>{methodLabel}</div>
              </div>
              <div className="review-block">
                <div className="rb-head"><span><Icon name="card" size={16} /> Payment</span><button className="link-btn" onClick={() => setStep(1)}>Edit</button></div>
                <p>{payMethod === 'card'
                  ? (activeCard ? activeCard.brand + ' ending ' + activeCard.last : 'Card')
                  : (payMethod === 'transfer' ? 'Bank transfer' : 'Pay on delivery')}</p>
              </div>
              <div className="review-block">
                <div className="rb-head"><span><Icon name="bag" size={16} /> {cart.reduce((s, i) => s + i.qty, 0)} items</span><button className="link-btn" onClick={() => go('cart')}>Edit cart</button></div>
                <div className="review-items">
                  {cart.map(it => { const p = byId(it.id); if (!p) return null; return (
                    <div className="rev-item" key={it.key}>
                      <div className="rev-item-thumb"><Thumb product={p} src={REAL_IMG[p.id]} /></div>
                      <span className="rev-item-name">{p.name}<small className="muted"> × {it.qty}</small></span>
                      <b>{naira(p.price * it.qty)}</b>
                    </div>
                  ); })}
                </div>
              </div>
              {(() => {
                const disc = promo ? Math.round(cartTotal * promo.pct) : 0;
                const beforeCredit = Math.max(0, cartTotal - disc) + shipFee;
                const credit = useCredit ? Math.min(referral.credit, beforeCredit) : 0;
                const total = beforeCredit - credit;
                return (
                  <div className="review-block review-totals">
                    <div className="rb-head"><span><Icon name="dollar" size={16} /> Order total</span></div>
                    <div className="rev-tot-row"><span className="muted">Subtotal</span><b>{naira(cartTotal)}</b></div>
                    {disc > 0 && <div className="rev-tot-row"><span className="muted">Discount <span className="badge badge-soft" style={{ marginLeft: 4 }}>{promo.code}</span></span><b style={{ color: 'var(--success)' }}>−{naira(disc)}</b></div>}
                    <div className="rev-tot-row"><span className="muted">Delivery</span>{shipFee === 0 ? <b style={{ color: 'var(--success)' }}>Free</b> : <b>{naira(shipFee)}</b>}</div>
                    {credit > 0 && <div className="rev-tot-row"><span className="muted"><img src="/assets/limcash.png" alt="" className="limcash-ic sm" /> Lim Cash applied</span><b style={{ color: 'var(--success)' }}>−{naira(credit)}</b></div>}
                    <div className="rev-tot-row rev-tot-grand"><span>Total</span><b>{naira(total)}</b></div>
                  </div>
                );
              })()}
            </div>
          )}

          <div className="co-nav">
            <button className="btn btn-ghost" onClick={() => step === 0 ? go('cart') : setStep(s => s - 1)}><Icon name="chevleft" size={16} /> {step === 0 ? 'Back to cart' : 'Back'}</button>
            {step < 2
              ? <button className="btn btn-primary btn-lg" onClick={next}>Continue <Icon name="arrowr" size={17} /></button>
              : <button className="btn btn-accent btn-lg" disabled={placing} onClick={() => placeOrder()}><Icon name="lock" size={17} /> {placing ? 'Placing order…' : 'Place order'}</button>}
          </div>
        </div>

        <OrderSummary items={cart} promo={promo} ship={shipFee} useCredit={useCredit} onToggleCredit={setUseCredit} />
      </div>

      {addrModal && (
        <Modal title={typeof addrModal === 'string' && addrModal.startsWith('edit-') ? 'Edit address' : 'Add a new address'} sub="Where should we deliver your order?" onClose={() => setAddrModal(false)}>
          <AddressForm
            initial={typeof addrModal === 'string' && addrModal.startsWith('edit-') ? addresses.find(a => a.id === Number(addrModal.slice(5))) : null}
            onSave={(d) => { if (d.id) { saveAddress(d); setSelAddr(d.id); setAddrModal(false); } else { addNewAddress(d); } }}
            onCancel={() => setAddrModal(false)} />
        </Modal>
      )}
      {cardModal && (
        <Modal title="Add a new card" sub="Saved securely for faster checkout." width={460} onClose={() => setCardModal(false)}>
          <CardForm initial={null} onSave={addNewCard} onCancel={() => setCardModal(false)} />
        </Modal>
      )}
      {xferModal && (() => {
        const disc = promo ? Math.round(cartTotal * promo.pct) : 0;
        const beforeCredit = Math.max(0, cartTotal - disc) + shipFee;
        const creditUse = useCredit ? Math.min(referral.credit, beforeCredit) : 0;
        const due = Math.max(0, beforeCredit - creditUse);
        const namePart = (user?.username || user?.email || 'GUEST').split(/[@\s]/)[0].toUpperCase();
        const ref = 'LMT-' + String(Math.abs(cartTotal)).slice(-4) + '-' + namePart;
        const copy = (txt, key) => { navigator.clipboard?.writeText(txt); setXferCopied(key); toast('Copied'); setTimeout(() => setXferCopied(''), 1600); };
        return (
          <Modal title="Complete your bank transfer" sub="Transfer the exact amount to the account below." width={440} onClose={() => setXferModal(false)}>
            <div className="xfer-amt">
              <span className="muted">Amount to transfer</span>
              <b>{naira(due)}</b>
            </div>
            <div className="xfer-rows">
              {[['Bank', 'Providus Bank', 'bank'], ['Account number', '9701234567', 'acct'], ['Account name', 'Limitra Technologies Ltd', 'name'], ['Reference', ref, 'ref']].map(([label, value, key]) => (
                <div className="xfer-row" key={key}>
                  <span className="muted">{label}</span>
                  <div className="xfer-val">
                    <b className={key === 'acct' ? 'mono lg' : ''}>{value}</b>
                    <button className="xfer-copy" onClick={() => copy(value, key)} aria-label={'Copy ' + label}>
                      <Icon name={xferCopied === key ? 'check' : 'copy'} size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="co-note" style={{ marginTop: 14 }}><Icon name="info" size={16} />Include the reference so we can match your payment automatically.</div>
            <div className="row" style={{ gap: 10, marginTop: 18 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setXferModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1.4 }} onClick={() => { setXferDone(true); setXferModal(false); toast('Transfer confirmed — placing your order'); setTimeout(() => placeOrder(true), 400); }}>
                <Icon name="check" size={17} /> I’ve made this transfer
              </button>
            </div>
          </Modal>
        );
      })()}
    </div></div>
  );
}

export function OrderSuccess({ orderId, email, method }) {
  const { go } = useStore();
  const eta = method === 'pickup' ? 'Ready for pickup in 10–14 days' : 'In 10–14 days';
  return (
    <div className="page page-fade"><div className="wrap">
      <div className="success-screen">
        <div className="success-check"><Icon name="check" size={48} stroke={3} /></div>
        <h1>Order confirmed!</h1>
        <p className="muted">Thank you for your order. A confirmation has been sent to <b>{email || 'your email'}</b>.</p>
        <div className="success-card card">
          <div className="row between"><span className="muted">Order number</span><b style={{ fontFamily: 'var(--font-display)', fontSize: 17 }}>{orderId}</b></div>
          <div className="row between" style={{ marginTop: 12 }}><span className="muted">Estimated delivery</span><b style={{ color: 'var(--success)' }}>{eta}</b></div>
        </div>
        <div className="row" style={{ gap: 12, justifyContent: 'center', marginTop: 26, flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={() => go('tracking', orderId)}><Icon name="truck" size={18} /> Track order</button>
          <button className="btn btn-outline btn-lg" onClick={() => go('shop', 'all')}>Continue shopping</button>
        </div>
      </div>
    </div></div>
  );
}
