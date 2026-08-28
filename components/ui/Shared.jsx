'use client';
/* LIMITRA shared atoms — ported from legacy/components.jsx */
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/components/icons/Icon';
import { useStore } from '@/components/store/StoreProvider';
import { naira, CATEGORIES } from '@/lib/data';

/* product image placeholder with category tint */
export function Placeholder({ product, label }) {
  const t = product?.tint || ['rgba(4,56,182,.08)', 'rgba(4,56,182,.04)'];
  return (
    <div className="ph" style={{ '--ph-a': t[0], '--ph-b': t[1] }}>
      <span>{(label || product?.shot || 'product') + '\nshot'}</span>
    </div>
  );
}

/* real-image-or-placeholder thumb */
export function Thumb({ product, src }) {
  if (src) return <img src={src} alt={product?.name || ''} loading="lazy" />;
  return <Placeholder product={product} />;
}

export function Stars({ value = 0, size = 13 }) {
  return (
    <span className="stars" aria-label={value + ' stars'}>
      {[0, 1, 2, 3, 4].map(i => (
        <Icon key={i} name="star" size={size} fill={i < Math.round(value) ? 'currentColor' : 'var(--surface-3)'} />
      ))}
    </span>
  );
}

export function Price({ now, was, size }) {
  return (
    <span className="pc-price" style={size ? { fontSize: size } : null}>
      <span className="now" style={size ? { fontSize: size } : null}>{naira(now)}</span>
      {was
        ? <span className="was">{naira(was)}</span>
        : <span className="was placeholder" aria-hidden="true">&nbsp;</span>}
    </span>
  );
}

export const REAL_IMG = { /* a few products get real photos */
  p1: '/assets/img/cat-03.jpg',
  p2: '/assets/img/cat-02.jpg',
  iphone17promax: '/assets/img/ip17-orange-front.webp',
};

export function ProductCard({ product, compact }) {
  const { go, addToCart, toggleWish, wish } = useStore();
  const faved = wish.includes(product.id);
  const [quick, setQuick] = useState(false);
  const open = () => go('product', product.slug || product.id);
  return (
    <article className="pcard" onClick={open} style={{ cursor: 'pointer' }}>
      <div className="thumb">
        <Thumb product={product} src={REAL_IMG[product.id]} />
        <div className="thumb-badges">
          {product.off > 0 && <span className="badge badge-sale">-{product.off}%</span>}
          {product.badges?.includes('new') && <span className="badge badge-new">New</span>}
          {product.badges?.includes('hot') && <span className="badge badge-hot">Hot</span>}
        </div>
        <div className="pc-actions">
          <button className={'icon-btn fav' + (faved ? ' on' : '')} title="Wishlist"
            onClick={e => { e.stopPropagation(); toggleWish(product.id); }}>
            <Icon name="heart" size={17} fill={faved ? 'currentColor' : 'none'} />
          </button>
          <button className="icon-btn" title="Quick view" onClick={e => { e.stopPropagation(); setQuick(true); }}>
            <Icon name="eye" size={17} />
          </button>
        </div>
        <button className="pc-add" title="Add to cart"
          onClick={e => { e.stopPropagation(); addToCart(product); }}>
          <Icon name="plus" size={20} />
        </button>
      </div>
      <div className="pc-body">
        <span className="pc-brand">{product.brand}</span>
        <span className="pc-name">{product.name}</span>
        {!compact && (
          <span className="pc-rate"><Stars value={product.rating} /> {product.rating} · {product.reviews.toLocaleString()}</span>
        )}
        <Price now={product.price} was={product.was} />
      </div>
      {quick && <QuickView product={product} onClose={() => setQuick(false)} />}
    </article>
  );
}

function productBlurb(p) {
  const cat = (CATEGORIES.find(c => c.slug === p.category) || {}).name || 'product';
  return `Authentic ${p.brand} ${p.name} — a ${cat.toLowerCase()} pick rated ${p.rating}★ by ${p.reviews.toLocaleString()} verified shoppers. Quality-checked and covered by Limitra buyer protection with fast nationwide delivery.`;
}

function QuickView({ product, onClose }) {
  const { go, addToCart, toggleWish, wish } = useStore();
  const faved = wish.includes(product.id);
  useEffect(() => {
    const k = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, [onClose]);
  return createPortal(
    <div className="qv-overlay" onClick={e => { e.stopPropagation(); if (e.target === e.currentTarget) onClose(); }}>
      <div className="qv-modal" onClick={e => e.stopPropagation()}>
        <button className="qv-x" onClick={onClose} aria-label="Close"><Icon name="close" size={20} /></button>
        <div className="qv-media">
          <Thumb product={product} src={REAL_IMG[product.id]} />
          <button className={'qv-fav icon-btn fav' + (faved ? ' on' : '')} title="Wishlist" onClick={() => toggleWish(product.id)}><Icon name="heart" size={18} fill={faved ? 'currentColor' : 'none'} /></button>
          <div className="thumb-badges">
            {product.off > 0 && <span className="badge badge-sale">-{product.off}%</span>}
            {product.badges?.includes('new') && <span className="badge badge-new">New</span>}
          </div>
        </div>
        <div className="qv-info">
          <span className="pc-brand">{product.brand}</span>
          <h3 className="qv-name">{product.name}</h3>
          <div className="qv-rate"><Stars value={product.rating} /> <span className="muted">{product.rating} · {product.reviews.toLocaleString()} reviews</span></div>
          <Price now={product.price} was={product.was} />
          <p className="qv-desc">{productBlurb(product)}</p>
          <div className="qv-actions">
            <button className="btn btn-primary" onClick={() => { addToCart(product); onClose(); }}><Icon name="cart" size={17} /> Add to cart</button>
            <button className="btn btn-outline" onClick={() => { onClose(); go('product', product.slug || product.id); }}>View details</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function QtyStepper({ value, onChange, size = 'md' }) {
  const pad = size === 'sm' ? '6px' : '9px';
  return (
    <div className="row" style={{ border: '1.5px solid var(--border)', borderRadius: 'var(--r-pill)', overflow: 'hidden', background: 'var(--surface)' }}>
      <button style={{ padding: pad + ' 12px', color: 'var(--text-muted)' }} onClick={() => onChange(value - 1)} aria-label="decrease"><Icon name="minus" size={16} /></button>
      <span style={{ minWidth: 30, textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>{value}</span>
      <button style={{ padding: pad + ' 12px', color: 'var(--text-muted)' }} onClick={() => onChange(value + 1)} aria-label="increase"><Icon name="plus" size={16} /></button>
    </div>
  );
}

export function Breadcrumbs({ items }) {
  const { go } = useStore();
  return (
    <nav className="row" style={{ gap: 7, flexWrap: 'wrap', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--text-muted)', padding: '20px 0 4px' }}>
      {items.map((it, i) => (
        <span key={i} className="row" style={{ gap: 7 }}>
          {i > 0 && <Icon name="chevright" size={13} style={{ color: 'var(--text-faint)' }} />}
          {it.to
            ? <a onClick={() => go(...it.to)} style={{ cursor: 'pointer' }} className="crumb">{it.label}</a>
            : <span style={{ color: 'var(--text)' }}>{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}

export function EmptyState({ icon = 'package', title, body, action, onAction }) {
  return (
    <div style={{ textAlign: 'center', padding: '72px 20px', maxWidth: 440, margin: '0 auto' }}>
      <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'var(--surface-2)', display: 'grid', placeItems: 'center', margin: '0 auto 22px', color: 'var(--text-faint)' }}>
        <Icon name={icon} size={36} stroke={1.6} />
      </div>
      <h3 style={{ fontSize: 21, marginBottom: 8 }}>{title}</h3>
      <p className="muted" style={{ marginBottom: action ? 24 : 0, textWrap: 'pretty' }}>{body}</p>
      {action && <button className="btn btn-primary" onClick={onAction}>{action}</button>}
    </div>
  );
}

export function SectionHead({ eyebrow, title, onSeeAll, seeAllLabel, seeAllShort }) {
  return (
    <div className="sec-head">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2>{title}</h2>
      </div>
      {onSeeAll && <a className="see-all" onClick={onSeeAll} style={{ cursor: 'pointer' }}>{seeAllShort ? <><span className="sa-full">{seeAllLabel || 'See all'}</span><span className="sa-short">{seeAllShort}</span></> : (seeAllLabel || 'See all')} <Icon name="arrowr" size={15} /></a>}
    </div>
  );
}

export function Toasts() {
  const { toasts } = useStore();
  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div className="toast" key={t.id}>
          <span className="tdot" style={{ background: t.kind === 'ok' ? 'var(--success)' : 'var(--accent)' }}>
            <Icon name={t.kind === 'ok' ? 'check' : 'info'} size={13} stroke={3} />
          </span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

/* simple scroll-reveal hook */
export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.in)');
    const io = new IntersectionObserver((es) => {
      es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.08 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  });
}
