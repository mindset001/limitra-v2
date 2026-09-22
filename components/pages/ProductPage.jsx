'use client';
/* LIMITRA, Product details — ported from legacy/pages-product.jsx */
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/components/icons/Icon';
import { useStore } from '@/components/store/StoreProvider';
import { Thumb, REAL_IMG, Placeholder, Stars, QtyStepper, Breadcrumbs, SectionHead, ProductCard, EmptyState } from '@/components/ui/Shared';
import { ShareButton } from '@/components/share/Share';
import { VideoStage, VID_POSTER, VIDEOS } from '@/components/video/Video';
import { CATEGORIES, VARIANTS, naira, byId, bySlug, byCat } from '@/lib/data';

function Gallery({ product, color }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [lightbox, setLightbox] = useState(false);
  const isMobile = () => window.matchMedia('(max-width: 767px)').matches;
  const real = REAL_IMG[product.id];
  const gImgs = null;
  const angles = ['front', 'back', 'side', 'detail'];
  const vid = (VIDEOS || []).find(v => (v.products || []).includes(product.id));
  const VIDEO_TAB = angles.length; // index for the video view
  useEffect(() => { if (active >= angles.length) setActive(0); }, [color]);
  const move = e => {
    if (isMobile()) return;
    const r = e.currentTarget.getBoundingClientRect();
    setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };
  useEffect(() => {
    if (!lightbox) return;
    const onKey = e => { if (e.key === 'Escape') setLightbox(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lightbox]);
  return (
    <div className="gallery">
      <div className="g-thumbs">
        {angles.map((a, i) => (
          <button key={i} className={'g-thumb' + (active === i ? ' on' : '')} onClick={() => setActive(i)}>
            {gImgs ? <img src={gImgs[i]} alt="" /> : (real && i === 0 ? <img src={real} alt="" /> : <Placeholder product={product} label={a} />)}
          </button>
        ))}
        {vid && (
          <button className={'g-thumb video-thumb' + (active === VIDEO_TAB ? ' on' : '')} onClick={() => setActive(VIDEO_TAB)} aria-label="Watch video">
            <img src={VID_POSTER[vid.id]} alt="Video demo" />
          </button>
        )}
      </div>
      {active === VIDEO_TAB && vid ? (
        <div className="g-main g-video"><VideoStage video={vid} /></div>
      ) : (
      <div className={'g-main g-clickable' + (gImgs ? ' g-main-contain' : '')} onClick={() => setLightbox(true)}>
        <div className="thumb-badges">
          {product.off > 0 && <span className="badge badge-sale">-{product.off}%</span>}
          {product.badges?.includes('new') && <span className="badge badge-new">New</span>}
        </div>
        {gImgs
          ? <img src={gImgs[active]} alt={product.name} className="g-img g-img-contain" />
          : (real && active === 0
            ? <img src={real} alt={product.name} className="g-img" />
            : <div className="g-img"><Placeholder product={product} label={angles[active]} /></div>)}
        <span className="g-zoom-hint"><Icon name="zoom" size={15} /> Tap to view</span>
      </div>
      )}
      {lightbox && createPortal((
        <div className="g-lightbox" onClick={() => setLightbox(false)}>
          <button className="g-lightbox-x" onClick={() => setLightbox(false)} aria-label="Close"><Icon name="close" size={22} /></button>
          <div className="g-lightbox-img" onClick={e => e.stopPropagation()}>
            {gImgs
              ? <img src={gImgs[active]} alt={product.name} />
              : (real && active === 0
                ? <img src={real} alt={product.name} />
                : <Placeholder product={product} label={angles[active]} />)}
          </div>
          <div className="g-lightbox-thumbs" onClick={e => e.stopPropagation()}>
            {angles.map((a, i) => (
              <button key={i} className={'g-thumb' + (active === i ? ' on' : '')} onClick={() => setActive(i)}>
                {gImgs ? <img src={gImgs[i]} alt="" /> : (real && i === 0 ? <img src={real} alt="" /> : <Placeholder product={product} label={a} />)}
              </button>
            ))}
          </div>
        </div>
      ), document.body)}
    </div>
  );
}

function ReviewBreakdown({ product }) {
  return (
    <div className="rev-summary">
      <div className="rev-score">
        <span className="rs-num">{product.rating}</span>
        <Stars value={product.rating} size={18} />
        <small className="muted">{product.reviews.toLocaleString()} reviews</small>
      </div>
    </div>
  );
}

export function ProductPage({ id }) {
  const { go, addToCart, toggleWish, wish, cart } = useStore();
  const product = bySlug(id) || byId(id);
  const [color, setColor] = useState(product?.colors?.[0]?.name);
  const [storage, setStorage] = useState(VARIANTS.storage[1]);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('desc');
  const hasStorage = !!product && ['phone', 'tablet', 'laptop'].includes(product.shot);
  const related = product ? byCat(product.category).filter(p => p.id !== product.id).slice(0, 5) : [];
  const faved = !!product && wish.includes(product.id);
  useEffect(() => { if (!product) return; setColor(product.colors[0]?.name); setQty(1); setTab('desc'); }, [id, product]);

  if (!product) {
    return (
      <div className="page page-fade"><div className="wrap">
        <Breadcrumbs items={[{ label: 'Home', to: ['home'] }, { label: 'Product' }]} />
        <EmptyState icon="package" title="Product catalog isn't available yet" body="We're still connecting the product catalog to Limitra. Check back soon." action="Back to shop" onAction={() => go('shop', 'all')} />
      </div></div>
    );
  }

  const buy = (checkout) => { addToCart(product, { color, storage: hasStorage ? storage : '' }, qty); if (checkout) go('checkout'); };

  return (
    <div className="page page-fade"><div className="wrap">
      <Breadcrumbs items={[{ label: 'Home', to: ['home'] }, { label: CATEGORIES.find(c => c.slug === product.category)?.name, to: ['shop', product.category] }, { label: product.brand }]} />

      <div className="pdp">
        <Gallery product={product} color={color} />
        <div className="pdp-info">
          <div className="row between">
            <span className="pc-brand" style={{ fontSize: 13 }}>{product.brand} · <span style={{ color: 'var(--text-muted)' }}>{product.store}</span></span>
            <button className={'icon-btn fav' + (faved ? ' on' : '')} onClick={() => toggleWish(product.id)}><Icon name="heart" size={17} fill={faved ? 'currentColor' : 'none'} /></button>
          </div>
          <h1 style={{ fontSize: 28, margin: '8px 0 12px', lineHeight: 1.15 }}>{product.name}</h1>
          <div className="row" style={{ gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
            <span className="pc-rate"><Stars value={product.rating} size={15} /> {product.rating}</span>
            <span className="muted" style={{ fontSize: 13 }}>·</span>
            <a className="link-btn" onClick={() => setTab('reviews')}>{product.reviews.toLocaleString()} reviews</a>
            <span className="muted" style={{ fontSize: 13 }}>·</span>
            <span className="row" style={{ gap: 5, color: 'var(--success)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}><Icon name="check" size={14} stroke={3} /> {product.stock > 0 ? 'In stock' : 'Out of stock'}</span>
          </div>

          <div className="pdp-price">
            <span className="now">{naira(product.price)}</span>
            {product.was > 0 && <><span className="was">{naira(product.was)}</span><span className="badge badge-sale">Save {naira(product.was - product.price)}</span></>}
          </div>

          <div className="variant">
            <div className="v-label">Colour: <b>{color}</b></div>
            <div className="swatches">
              {product.colors.map(c => (
                <button key={c.name} className={'swatch' + (color === c.name ? ' on' : '')} style={{ '--sw': c.hex }} title={c.name} onClick={() => setColor(c.name)}>
                  <span style={{ background: c.hex }} />
                </button>
              ))}
            </div>
          </div>

          {hasStorage && (
            <div className="variant">
              <div className="v-label">Storage</div>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                {VARIANTS.storage.map(s => (
                  <button key={s} className={'chip' + (storage === s ? ' on' : '')} onClick={() => setStorage(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}

          <div className="buy-row">
            <QtyStepper value={qty} onChange={q => setQty(Math.max(1, q))} />
            <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={() => buy(false)}><Icon name="cart" size={18} /> Add to cart</button>
            <button className="btn btn-accent btn-lg" style={{ flex: 1 }} onClick={() => buy(true)}>Buy now</button>
            <ShareButton product={product} className="btn btn-outline btn-lg share-btn icon-only" compact />
          </div>
          {product.stock <= 5 && <p className="stock-warn"><Icon name="flame" size={14} fill="currentColor" /> Only {product.stock} left, order soon</p>}

          <div className="pdp-perks">
            {[['truck', 'Free delivery', 'Nationwide in 10–14 days'], ['refresh', '7-day returns', 'No questions asked'], ['shield', 'Warranty', product.specs.find(s => s[0] === 'Warranty')?.[1] || '12 months']].map(([ic, t, s]) => (
              <div key={t} className="perk"><span className="perk-ic"><Icon name={ic} size={18} /></span><div><b>{t}</b><small>{s}</small></div></div>
            ))}
          </div>

          <button className="aff-banner" onClick={() => go('affiliate')}>
            <span className="afb-logo"><img src="/assets/logo-icon.png" alt="Limitra" /></span>
            <div className="afb-copy">
              <b>Affiliate earn for <span className="afb-brand">Limitra</span></b>
              <span className="afb-earn">Earn up to <b>{naira(Math.round(product.price * 0.15))}</b> per sale <Icon name="info" size={13} /></span>
              <small>Tap to learn more and earn</small>
            </div>
            <span className="afb-cta"><span className="afb-cta-ic"><Icon name="sort" size={16} /></span><span className="afb-cta-txt">View earnings<br />&amp; tools</span><Icon name="chevright" size={16} /></span>
          </button>
        </div>
      </div>

      <div className="pdp-tabs">
        <div className="tab-bar">
          {[['desc', 'Description'], ['specs', 'Specifications'], ['reviews', 'Reviews (' + product.reviews.toLocaleString() + ')']].map(([k, l]) => (
            <button key={k} className={'tab' + (tab === k ? ' on' : '')} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        <div className="tab-body">
          {tab === 'desc' && (
            <div className="prose">
              <p>{product.desc}</p>
              <p>Every Limitra order ships in tamper-proof packaging and is covered by our buyer-protection guarantee. This product is sold by <b>{product.store}</b>, a verified Limitra seller with a 98% positive rating.</p>
              <ul className="feat-list">
                <li><Icon name="check" size={16} stroke={3} /> Genuine product with official manufacturer warranty</li>
                <li><Icon name="check" size={16} stroke={3} /> Inspected & quality-checked before dispatch</li>
                <li><Icon name="check" size={16} stroke={3} /> Pay on delivery available in select cities</li>
              </ul>
            </div>
          )}
          {tab === 'specs' && (
            <table className="spec-table">
              <tbody>
                {product.specs.map(([k, v]) => (
                  <tr key={k}><td>{k}</td><td>{v}</td></tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === 'reviews' && (
            <div className="reviews">
              <ReviewBreakdown product={product} />
              <EmptyState icon="star" title="No reviews yet" body="Reviews aren't connected yet — check back once they're live." />
            </div>
          )}
        </div>
      </div>
    </div>

      <section className="sec"><div className="wrap">
        <SectionHead eyebrow="You may also like" title="Related products" onSeeAll={() => go('shop', product.category)} />
        <div className="grid-prod">{related.map(p => <ProductCard key={p.id} product={p} />)}</div>
      </div></section>

      <div className="pdp-stickybar">
        <ShareButton product={product} className="psb-share" compact />
        <button className="btn btn-primary psb-cart" onClick={() => buy(false)}><Icon name="cart" size={18} /> Add to cart</button>
        <button className="btn btn-accent psb-buy" onClick={() => buy(true)}>Buy now</button>
      </div>
    </div>
  );
}
