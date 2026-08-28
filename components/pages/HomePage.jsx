'use client';
/* LIMITRA, Homepage — ported from legacy/pages-home.jsx */
import { Fragment, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/components/icons/Icon';
import { useStore } from '@/components/store/StoreProvider';
import { SectionHead, ProductCard, Thumb, REAL_IMG, Placeholder, useReveal, Stars } from '@/components/ui/Shared';
import { SocialMark } from '@/components/ui/SocialMark';
import { CAT_ICON } from '@/components/chrome/Chrome';
import { FeaturedVideo } from '@/components/video/Video';
import { PRODUCTS, CATEGORIES, naira, REVIEWS } from '@/lib/data';

export function Countdown({ hours = 8 }) {
  const [t, setT] = useState(hours * 3600 + 1423);
  useEffect(() => {const id = setInterval(() => setT((x) => x > 0 ? x - 1 : 0), 1000);return () => clearInterval(id);}, []);
  const h = String(Math.floor(t / 3600)).padStart(2, '0');
  const m = String(Math.floor(t % 3600 / 60)).padStart(2, '0');
  const s = String(t % 60).padStart(2, '0');
  return (
    <div className="countdown">
      {[h, m, s].map((u, i) =>
      <Fragment key={i}>
          {i > 0 && <span className="cd-sep">:</span>}
          <span className="cd-unit">{u}</span>
        </Fragment>
      )}
    </div>);

}

const HERO_SLIDES = [
{
  eyebrow: 'Limitra Exclusive',
  title: ['Premium marketplace,', 'smarter', ' shopping.'],
  body: 'Quality products. Secure shopping. Reliable delivery across Nigeria. Plus, earn more with our affiliate program.',
  primary: ['Shop Now', 'shop', 'all'],
  secondary: ['Become an Affiliate', 'affiliate', null, 'user'],
  img: '/assets/img/hero-shop3d.png',
  pos: 'right center'
},
{
  eyebrow: 'New Season · Audio',
  title: ['Elevate every', 'listening', ' moment.'],
  body: 'Discover premium audio equipment designed for immersive sound, exceptional comfort, and uncompromising performance.',
  primary: ['Shop electronics', 'shop', 'electronics'],
  secondary: ['View deals', 'shop', 'deals', 'flame'],
  img: '/assets/img/hero-audio.jpg',
  offer: ['Save', '25%', 'today']
},
{
  eyebrow: 'Work & Play',
  title: ['Power up your', 'setup', ' today.'],
  body: 'Laptops, phones, earbuds and accessories built to keep you productive, premium tech from trusted brands, delivered fast.',
  primary: ['Shop computing', 'shop', 'computing'],
  secondary: ['Become an Affiliate', 'affiliate', null, 'user'],
  img: '/assets/img/hero-tech.jpg',
  offer: ['Student', '15%', 'deal']
},
{
  eyebrow: 'Style Edit · Fashion',
  title: ['Wear your', 'confidence', ' every day.'],
  body: 'Fresh-season clothing and footwear for men and women. Premium fabrics, true-to-size fits and styles that move with you.',
  primary: ['Shop fashion', 'shop', 'womens'],
  secondary: ['Shop men’s', 'shop', 'mens', 'tag'],
  img: '/assets/img/hero-fashion.jpg',
  offer: ['Up to', '30%', 'off']
},
{
  eyebrow: 'Beauty · Cosmetics',
  title: ['Glow that', 'speaks', ' for itself.'],
  body: 'Skincare, makeup and fragrance from trusted brands, authentic products, expertly curated, delivered fast across Nigeria.',
  primary: ['Shop cosmetics', 'shop', 'beauty'],
  secondary: ['Explore beauty', 'shop', 'beauty', 'spark'],
  img: '/assets/img/hero-cosmetics.jpg',
  offer: ['Save', '20%', 'now']
}];


const HERO_TRUST = [
['check', 'Verified Products'],
['headset', '24/7 Support'],
['refresh', 'Easy Returns'],
['truck', 'Fast Delivery'],
['tag', 'Best Prices']];


function HeroSlide({ slide, showChips, showStats }) {
  const { go } = useStore();
  const [secLabel, secRoute, secParam, secIcon] = slide.secondary;
  return (
    <div className="hero">
      <img className="hero-bg" src={slide.img} alt={slide.title.join(' ')} style={slide.pos ? { objectPosition: slide.pos } : null} />
      <span className="hero-scrim" />
      <div className="hero-overlay">
        <div className="hero-copy" style={{ width: "560px" }}>
          {slide.eyebrow && <span className="hero-eyebrow">{slide.eyebrow}</span>}
          <h1 style={{ width: "600px" }}>{slide.title[0]}<br /><span className="hl">{slide.title[1]}</span>{slide.title[2]}</h1>
          <p className="hero-sub">{slide.body}</p>
          {showStats &&
          <div className="hero-inline-trust">
              {HERO_TRUST.slice(0, 3).map(([ic, label]) =>
            <span className="hit-item" key={label}><span className="hit-ic"><Icon name={ic} size={15} /></span>{label}</span>
            )}
            </div>
          }
          <div className="hero-cta">
            <button className="btn btn-primary btn-lg" onClick={() => go(slide.primary[1], slide.primary[2])}>{slide.primary[0]} <Icon name="arrowr" size={18} /></button>
            <button className="btn btn-ghost-light btn-lg" onClick={() => go(secRoute, secParam)}>{secIcon && <Icon name={secIcon} size={17} />} {secLabel}</button>
          </div>
        </div>
        {showChips && slide.offer &&
        <div className="hero-offer">
            <small>{slide.offer[0]}</small>
            <b>{slide.offer[1]}</b>
            <small>{slide.offer[2]}</small>
          </div>
        }
      </div>
    </div>);

}

function HeroSidePanel({ tile }) {
  const { go } = useStore();
  return (
    <button className={'hero-tile ' + tile.cls} onClick={() => go(tile.route, tile.param)}>
      <span className="hero-tile-eyebrow">{tile.eyebrow}</span>
      <b className="hero-tile-title">{tile.title}</b>
      <span className="hero-tile-cta">{tile.cta} <Icon name="arrowr" size={14} /></span>
      <span className="hero-tile-art" aria-hidden="true"><span className="ph-label">{tile.ph}</span></span>
    </button>);

}

const HERO_TILES = [
{ eyebrow: 'New Season', title: 'Fashion edit', cta: 'Shop now', route: 'shop', param: 'womens', cls: 'tone-accent', ph: 'fashion shot' },
{ eyebrow: 'Best Sellers', title: 'Top picks', cta: 'Shop now', route: 'shop', param: 'all', cls: 'tone-navy', ph: 'bestseller shot' },
{ eyebrow: 'Trending', title: 'Latest phones', cta: 'Explore', route: 'shop', param: 'phones', cls: 'tone-primary', ph: 'phone shot' },
{ eyebrow: 'Save big', title: 'Beauty deals', cta: 'Shop deals', route: 'shop', param: 'beauty', cls: 'tone-navy', ph: 'beauty shot' }];


export function HeroGrid() {
  return (
    <div className="hero-grid hero-grid-2">
      <HeroCarousel />
      <div className="hero-grid-col">
        <HeroSidePanel tile={HERO_TILES[2]} />
        <HeroSidePanel tile={HERO_TILES[3]} />
      </div>
    </div>);

}

/* Dropped legacy/tweaks.jsx (dev-tooling panel, postMessage'd to a host editor) —
   these are the TWEAK_DEFAULTS values it used to feed HeroCarousel via window.useLimTweaks(). */
const HERO_TWEAKS = { heroAutoplay: true, heroSpeed: 5, heroTransition: 'slide', heroArrows: true, heroDots: true, heroChips: true, heroStats: true };

export function HeroCarousel() {
  const t = HERO_TWEAKS;
  const slides = HERO_SLIDES;
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);

  const goTo = (n, d) => {setDir(d != null ? d : n > i ? 1 : -1);setI((n + slides.length) % slides.length);};
  const next = () => goTo(i + 1, 1);
  const prev = () => goTo(i - 1, -1);

  /* touch swipe (mobile) */
  const touch = useRef({ x: 0, y: 0, active: false });
  const onTouchStart = (e) => {const t0 = e.touches[0];touch.current = { x: t0.clientX, y: t0.clientY, active: true };setPaused(true);};
  const onTouchMove = (e) => {
    if (!touch.current.active) return;
    const t0 = e.touches[0];
    if (Math.abs(t0.clientX - touch.current.x) > Math.abs(t0.clientY - touch.current.y) + 6) e.preventDefault();
  };
  const onTouchEnd = (e) => {
    if (!touch.current.active) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    touch.current.active = false;
    setPaused(false);
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {dx < 0 ? next() : prev();}
  };

  useEffect(() => {
    if (!t.heroAutoplay || paused) return;
    const id = setInterval(() => setI((x) => (x + 1) % slides.length), Math.max(2, t.heroSpeed) * 1000);
    return () => clearInterval(id);
  }, [t.heroAutoplay, t.heroSpeed, paused, slides.length]);

  return (
    <div className={'hero-carousel mode-' + t.heroTransition} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="hero-banner">
        <div className="hero-viewport" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
          <div className="hero-slide-anim" key={i} style={{ '--dir': dir }}>
            <HeroSlide slide={slides[i]} showChips={t.heroChips} showStats={t.heroStats} />
          </div>
        </div>

        {t.heroArrows && slides.length > 1 &&
        <Fragment>
            <button className="hero-arrow edge left" onClick={prev} aria-label="Previous slide"><Icon name="chevleft" size={22} /></button>
            <button className="hero-arrow edge right" onClick={next} aria-label="Next slide"><Icon name="chevright" size={22} /></button>
          </Fragment>
        }

        {t.heroDots && slides.length > 1 &&
        <div className="hero-dots">
            {slides.map((_, n) =>
          <button key={n} className={'hero-dot' + (n === i ? ' on' : '')} onClick={() => goTo(n)} aria-label={'Go to slide ' + (n + 1)}>
                {n === i && t.heroAutoplay && !paused && <span className="hero-dot-fill" style={{ animationDuration: Math.max(2, t.heroSpeed) + 's' }} />}
              </button>
          )}
          </div>
        }
      </div>
    </div>);

}

export function AffiliatePicks() {
  const { go, addToCart, toast } = useStore();
  const [promote, setPromote] = useState(null);
  const picks = PRODUCTS.filter((p) => p.bestseller).slice(0, 4);
  const rate = (p) => p.price >= 500000 ? 12 : p.price >= 100000 ? 10 : 8;
  return (
    <section className="sec" style={{ paddingTop: 40 }}>
      <div className="wrap">
        <SectionHead eyebrow="Affiliate Spotlight" title="Promoted by our affiliates" onSeeAll={() => go('affiliate')} seeAllLabel="Join the program" seeAllShort="Join" />
        <div className="aff-picks">
          {picks.map((p) => {
            const pct = rate(p);
            const earn = Math.round(p.price * pct / 100);
            return (
              <div key={p.id} className="aff-pick reveal">
                <div className="aff-pick-thumb" onClick={() => go('product', p.slug || p.id)}>
                  <Thumb product={p} src={REAL_IMG[p.id]} />
                  <span className="aff-pick-badge"><Icon name="spark" size={12} /> Affiliate pick</span>
                  {p.off > 0 && <span className="aff-pick-off">-{p.off}%</span>}
                </div>
                <div className="aff-pick-body">
                  <span className="pc-brand" style={{ fontSize: 11 }}>{p.brand}</span>
                  <b className="aff-pick-name" onClick={() => go('product', p.slug || p.id)}>{p.name}</b>
                  <div className="aff-pick-price"><span className="now">{naira(p.price)}</span>{p.was > 0 && <span className="was">{naira(p.was)}</span>}</div>
                  <div className="aff-pick-earn"><Icon name="dollar" size={14} /> <span className="ape-amt">Earn {naira(earn)}</span> <small>{pct}% commission</small></div>
                  <div className="aff-pick-cta">
                    <button className="btn btn-primary btn-sm" onClick={() => {addToCart(p, {}, 1);}}><Icon name="cart" size={15} /> Add</button>
                    <button className="btn btn-outline btn-sm" onClick={() => setPromote({ p, pct, earn })}>Promote</button>
                  </div>
                </div>
              </div>);

          })}
        </div>
      </div>
      {promote && <PromoteModal data={promote} onClose={() => setPromote(null)} />}
    </section>);

}

function CategoryStrip() {
  const { go } = useStore();
  return (
    <section className="sec" style={{ paddingTop: 40 }}>
      <div className="wrap">
        <SectionHead eyebrow="Browse" title="Shop by category" onSeeAll={() => go('shop', 'all')} />
        <div className="cat-strip">
          {CATEGORIES.map((c) =>
          <button key={c.slug} className="cat-tile reveal" onClick={() => go('shop', c.slug)}>
              <span className="cat-tile-ic" style={{ '--ph-b': c.tint?.[1] }}><Icon name={CAT_ICON[c.slug]} size={26} /></span>
              <b>{c.name}</b>
              <small>{c.count.toLocaleString()} items</small>
            </button>
          )}
        </div>
      </div>
    </section>);

}

function FlashDeals() {
  const { go } = useStore();
  const deals = PRODUCTS.filter((p) => p.off > 0).slice(0, 6);
  return (
    <section className="sec">
      <div className="wrap">
        <div className="flash-band reveal">
          <div className="flash-head">
            <div className="row" style={{ gap: 14 }}>
              <span className="flash-ic"><Icon name="flame" size={24} fill="currentColor" /></span>
              <div>
                <h2 style={{ color: '#fff', fontSize: 26 }}>Flash Deals</h2>
                <p style={{ color: 'rgba(255,255,255,.8)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Ends in</p>
              </div>
              <Countdown />
            </div>
            <button className="btn flash-see-top" style={{ background: 'rgba(255,255,255,.16)', color: '#fff' }} onClick={() => go('shop', 'deals')}>See all <Icon name="arrowr" size={16} /></button>
          </div>
          <div className="rail flash-rail">
            {deals.map((p) => <div key={p.id} style={{ width: 220 }}><ProductCard product={p} /></div>)}
          </div>
          <FlashStack deals={deals} />
          <button className="btn flash-see-bottom" style={{ background: 'rgba(255,255,255,.16)', color: '#fff' }} onClick={() => go('shop', 'deals')}>See all deals <Icon name="arrowr" size={16} /></button>
        </div>
      </div>
    </section>);

}

/* Mobile-only swipeable card stack for flash deals */
function FlashStack({ deals }) {
  const [top, setTop] = useState(0);
  const [drag, setDrag] = useState(0);
  const [flyOut, setFlyOut] = useState(0); // -1 left, 1 right, 0 none
  const startX = useRef(null);
  const n = deals.length;

  const advance = (dir) => {
    setFlyOut(dir);
    setTimeout(() => { setTop(t => (t + 1) % n); setDrag(0); setFlyOut(0); }, 260);
  };
  const onStart = (e) => { startX.current = e.touches[0].clientX; };
  const onMove = (e) => { if (startX.current != null) setDrag(e.touches[0].clientX - startX.current); };
  const onEnd = () => {
    if (Math.abs(drag) > 80) advance(drag < 0 ? -1 : 1);
    else setDrag(0);
    startX.current = null;
  };

  // render up to 3 stacked cards from the top index
  const stack = [];
  for (let d = Math.min(2, n - 1); d >= 0; d--) {
    const idx = (top + d) % n;
    const isTop = d === 0;
    const off = flyOut ? flyOut * (window.innerWidth || 400) : drag;
    const rot = isTop ? off * 0.05 : 0;
    const style = isTop
      ? { transform: `translateX(${off}px) rotate(${rot}deg)`, transition: (flyOut || startX.current == null) ? 'transform .26s cubic-bezier(.22,1,.36,1)' : 'none', zIndex: 30, opacity: flyOut ? 0 : 1 }
      : { transform: `translateY(${d * 12}px) scale(${1 - d * 0.06})`, zIndex: 30 - d, opacity: 1 - d * 0.16, transition: 'transform .26s var(--ease), opacity .26s var(--ease)' };
    stack.push(
      <div className="flash-stack-card" key={deals[idx].id + '-' + d} style={style}
        onTouchStart={isTop ? onStart : undefined} onTouchMove={isTop ? onMove : undefined} onTouchEnd={isTop ? onEnd : undefined}>
        <ProductCard product={deals[idx]} />
      </div>
    );
  }
  return (
    <div className="flash-stack">
      <div className="flash-stack-deck">{stack}</div>
      <div className="flash-stack-foot">
        <button className="fs-nav" onClick={() => advance(-1)} aria-label="Previous"><Icon name="chevleft" size={18} /></button>
        <div className="fs-dots">{deals.map((_, i) => <span key={i} className={'fs-dot' + (i === top ? ' on' : '')} />)}</div>
        <button className="fs-nav" onClick={() => advance(1)} aria-label="Next"><Icon name="chevright" size={18} /></button>
      </div>
      <p className="fs-hint">Swipe cards to browse deals</p>
    </div>
  );
}

export function ImageShowcase() {
  const { go } = useStore();
  const slides = [
    { img: '/assets/img/hero-fashion.jpg', eyebrow: 'New season', title: 'Fashion that moves with you', cta: 'Shop fashion', route: 'shop', param: 'womens' },
    { img: '/assets/img/hero-cosmetics.jpg', eyebrow: 'Beauty', title: 'Glow that speaks for itself', cta: 'Shop cosmetics', route: 'shop', param: 'beauty' },
    { img: '/assets/img/hero-tech.jpg', eyebrow: 'Work & play', title: 'Premium tech, smarter prices', cta: 'Shop electronics', route: 'shop', param: 'electronics' },
    { img: '/assets/img/hero-audio.jpg', eyebrow: 'New season · audio', title: 'Sound that moves you', cta: 'Shop audio', route: 'shop', param: 'electronics' },
  ];
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = slides.length;
  const go2 = (x) => setI((x + n) % n);
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setI(x => (x + 1) % n), 5000);
    return () => clearInterval(id);
  }, [paused, n]);
  const s = slides[i];
  const touch = useRef(null);
  const onTouchStart = (e) => { touch.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touch.current == null) return;
    const dx = e.changedTouches[0].clientX - touch.current;
    if (Math.abs(dx) > 45) go2(dx < 0 ? i + 1 : i - 1);
    touch.current = null;
  };
  return (
    <section className="sec">
      <div className="wrap">
        <div className="showcase" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {slides.map((sl, x) => (
            <div key={x} className={'showcase-slide' + (x === i ? ' on' : '')} style={{ backgroundImage: `url('${sl.img}')` }} aria-hidden={x !== i} />
          ))}
          <div className="showcase-scrim" />
          <div className="showcase-copy">
            <h2>{s.title}</h2>
            <button className="btn btn-primary btn-lg" onClick={() => go(s.route, s.param)}>{s.cta} <Icon name="arrowr" size={18} /></button>
          </div>
          <button className="showcase-arrow left" onClick={() => go2(i - 1)} aria-label="Previous"><Icon name="chevleft" size={22} /></button>
          <button className="showcase-arrow right" onClick={() => go2(i + 1)} aria-label="Next"><Icon name="chevright" size={22} /></button>
          <div className="showcase-dots">
            {slides.map((_, x) => <button key={x} className={'showcase-dot' + (x === i ? ' on' : '')} onClick={() => go2(x)} aria-label={'Slide ' + (x + 1)}>{x === i && !paused && <span className="showcase-dot-fill" style={{ animationDuration: '5s' }} />}</button>)}
          </div>
        </div>
      </div>
    </section>
  );
}

function PromoBanners() {
  const { go } = useStore();
  return (
    <section className="sec" style={{ paddingTop: 8 }}>
      <div className="wrap promo-2">
        <div className="promo-card navy reveal" onClick={() => go('shop', 'electronics')}>
          <div>
            <span className="eyebrow" style={{ color: 'var(--orange-soft)' }}>New season</span>
            <h3>Sound that<br />moves you</h3>
            <p>Premium ANC headphones & earbuds from ₦64,000</p>
            <span className="promo-link">Shop audio <Icon name="arrowr" size={15} /></span>
          </div>
          <div className="promo-ph"><Placeholder label="headphones" product={{ tint: ['rgba(255,255,255,.12)', 'rgba(255,255,255,.04)'] }} /></div>
        </div>
        <div className="promo-card orange reveal" onClick={() => go('shop', 'computing')}>
          <div>
            <span className="eyebrow" style={{ color: '#fff', opacity: .85 }}>Work & play</span>
            <h3>Power up your<br />setup</h3>
            <p>Laptops, monitors & desktops with student deals</p>
            <span className="promo-link">Shop computing <Icon name="arrowr" size={15} /></span>
          </div>
          <div className="promo-ph"><Placeholder label="laptop" product={{ tint: ['rgba(255,255,255,.14)', 'rgba(255,255,255,.05)'] }} /></div>
        </div>
      </div>
    </section>);

}

function ProductRow({ eyebrow, title, items, cat }) {
  const { go } = useStore();
  return (
    <section className="sec">
      <div className="wrap">
        <SectionHead eyebrow={eyebrow} title={title} onSeeAll={() => go('shop', cat || 'all')} />
        <div className="grid-prod">
          {items.map((p) => <div key={p.id} className="reveal"><ProductCard product={p} /></div>)}
        </div>
      </div>
    </section>);

}

function WhyLimitra() {
  const feats = [
  ['shield', 'Buyer protection', 'Shop with confidence. Eligible issues are resolved fairly.'],
  ['truck', 'Delivery duration', 'Free nationwide delivery for eligible products.'],
  ['refresh', 'Easy Returns', 'Returns accepted only for eligible issues under Limitra’s return policy.'],
  ['headset', '24/7 support', 'Real humans, ready to help any time you need.']];

  return (
    <section className="sec">
      <div className="wrap why-grid">
        {feats.map(([ic, t, b]) =>
        <div key={t} className="why-card reveal">
            <span className="why-ic"><Icon name={ic} size={22} /></span>
            <div><b>{t}</b><p className="muted">{b}</p></div>
          </div>
        )}
      </div>
    </section>);

}

function Testimonials() {
  const items = REVIEWS.slice(0, 3);
  return (
    <section className="sec">
      <div className="wrap">
        <SectionHead eyebrow="Loved by shoppers" title="What customers say" />
        <div className="grid-3">
          {items.map((r, i) =>
          <div key={i} className="testi reveal">
              <Stars value={r.rate} size={16} />
              <p>“{r.body}”</p>
              <div className="row" style={{ gap: 12 }}>
                <span className="avatar">{r.name[0]}</span>
                <div><b>{r.name}</b><small className="muted">{r.verified ? 'Verified buyer' : 'Customer'}</small></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}

export function HomePage() {
  useReveal();
  const trending = PRODUCTS.filter((p) => p.bestseller).slice(0, 5);
  const arrivals = PRODUCTS.filter((p) => p.badges.includes('new')).concat(PRODUCTS.slice(0, 5)).slice(0, 5);
  return (
    <div className="page-fade">
      <div className="wrap" style={{ paddingTop: 28 }}><HeroGrid /></div>
      <AffiliatePicks />
      <FlashDeals />
      <ProductRow eyebrow="Best sellers" title="Trending this week" items={trending} cat="trending" />
      <PromoBanners />
      <ImageShowcase />
      <ProductRow eyebrow="Just landed" title="New arrivals" items={arrivals} cat="new" />
      <FeaturedVideo />
      <WhyLimitra />
      <Testimonials />
    </div>);

}

function PromoteModal({ data, onClose }) {
  const { toast, go } = useStore();
  const { p, pct, earn } = data;
  const [copied, setCopied] = useState(false);
  const url = `https://limitra.ng/product/${p.slug || p.id}?ref=AFF12345`;
  const msg = `Check out ${p.name} on Limitra — ${naira(p.price)}`;
  const enc = encodeURIComponent;
  const copy = async () => {try {await navigator.clipboard.writeText(url);} catch (e) {}setCopied(true);toast('Referral link copied');setTimeout(() => setCopied(false), 1800);};
  useEffect(() => {const k = (e) => {if (e.key === 'Escape') onClose();};window.addEventListener('keydown', k);document.body.style.overflow = 'hidden';return () => {window.removeEventListener('keydown', k);document.body.style.overflow = '';};}, [onClose]);
  const targets = [
  ['whatsapp', 'WhatsApp', `https://wa.me/?text=${enc(msg + ' ' + url)}`, false],
  ['facebook', 'Facebook', `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, false],
  ['x', 'X', `https://twitter.com/intent/tweet?text=${enc(msg)}&url=${enc(url)}`, false],
  ['instagram', 'Instagram', 'https://www.instagram.com/', true],
  ['tiktok', 'TikTok', 'https://www.tiktok.com/', true]];

  return createPortal(
    <div className="qv-overlay" onClick={(e) => {e.stopPropagation();if (e.target === e.currentTarget) onClose();}}>
      <div className="promote-modal" onClick={(e) => e.stopPropagation()}>
        <button className="qv-x" onClick={onClose} aria-label="Close"><Icon name="close" size={20} /></button>
        <div className="promote-head">
          <span className="promote-thumb"><Thumb product={p} src={REAL_IMG[p.id]} /></span>
          <div><span className="pc-brand" style={{ fontSize: 11 }}>{p.brand}</span><b className="promote-name">{p.name}</b><div className="promote-earn"><Icon name="dollar" size={14} /> Earn {naira(earn)} <small>· {pct}% commission</small></div></div>
        </div>
        <div className="promote-link-label">Your referral link</div>
        <div className="promote-copy">
          <input readOnly value={url} onFocus={(e) => e.target.select()} />
          <button className="btn btn-primary btn-sm" onClick={copy}><Icon name={copied ? 'check' : 'copy'} size={15} stroke={copied ? 3 : 2} /> {copied ? 'Copied' : 'Copy'}</button>
        </div>
        <div className="promote-share-label">Share to</div>
        <div className="promote-share">
          {targets.map(([cls, label, href, copyFirst]) =>
          <button key={cls} className={'aff-share-btn ' + cls} title={'Share on ' + label} onClick={async () => {if (copyFirst) {try {await navigator.clipboard.writeText(url);toast('Link copied — paste it in ' + label);} catch (e) {}}window.open(href, '_blank', 'noopener,noreferrer');}}>
              <SocialMark name={label === 'X' ? 'X' : label} size={16} />
            </button>
          )}
        </div>
        <p className="promote-foot"><Icon name="info" size={13} /> Not an affiliate yet? <a onClick={() => {onClose();go('affiliate');}}>Join the program</a> to start earning.</p>
      </div>
    </div>,
    document.body
  );
}
