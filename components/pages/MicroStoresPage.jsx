'use client';
/* LIMITRA, MicroStores (public marketing/landing page) */
import { Icon } from '@/components/icons/Icon';
import { useStore } from '@/components/store/StoreProvider';
import { Placeholder } from '@/components/ui/Shared';

const MS_TRUST = [
  ['package', 'No inventory required'],
  ['truck', 'Products, delivery & returns handled by Limitra'],
  ['dollar', 'Earn on delivered sales'],
  ['spark', 'AI content tools for your store'],
];

const MS_PREVIEW = [
  { label: 'Phones', price: '₦680,000', tint: ['rgba(4,56,182,.12)', 'rgba(4,56,182,.04)'] },
  { label: 'Beauty', price: '₦72,000', tint: ['rgba(246,114,8,.14)', 'rgba(246,114,8,.05)'] },
  { label: 'Fashion', price: '₦48,000', tint: ['rgba(16,122,69,.12)', 'rgba(16,122,69,.04)'] },
  { label: 'Home', price: '₦85,000', tint: ['rgba(142,85,230,.12)', 'rgba(142,85,230,.04)'] },
];

const MS_PERKS = ['Personal store URL', 'Curate multiple products', 'Store analytics', 'AI content studio'];

const MS_CATS = [
  ['phone', 'Phones', 'phones', 'rgba(4,56,182,.1)'],
  ['makeup', 'Beauty', 'beauty', 'rgba(246,114,8,.12)'],
  ['shirt', 'Fashion', 'fashion', 'rgba(16,122,69,.1)'],
  ['store', 'Home & Living', 'home', 'rgba(142,85,230,.1)'],
  ['grid', 'Appliances', 'appliances', 'rgba(4,56,182,.1)'],
  ['gift', 'Baby Products', 'baby', 'rgba(246,114,8,.12)'],
  ['truck', 'Spare Parts', 'spareparts', 'rgba(90,90,90,.1)'],
  ['tag', 'Deals', 'deals', 'rgba(229,72,77,.1)'],
];

const MS_STEPS = [
  ['cart', 'Choose products', 'Pick from millions of products across every category on Limitra.'],
  ['store', 'Create your store', 'Pick a name and claim your unique, shareable store URL in seconds.'],
  ['share', 'Share your store', 'Share one link on WhatsApp, TikTok, Instagram & more.'],
  ['dollar', 'Earn', 'Get paid out when your orders are successfully delivered.'],
];

const AFFILIATE_PERKS = ['Share a single product link', 'Earn on tracked sales'];
const STORE_PERKS = ['Personalized storefront', 'Choose your niche & products', 'AI content studio', 'Track sales & earnings', 'Build your brand'];

const FEATURED_STORES = [
  { name: 'Tech Hub', slug: 'techhub', color: 'var(--navy)', items: ['Phones', 'Watch', 'Laptop'] },
  { name: 'Glow Beauty', slug: 'glowbeauty', color: '#E0457B', items: ['Perfume', 'Palette', 'Skincare'] },
  { name: 'Home Essentials', slug: 'homeplus', color: '#C9890A', items: ['Sofa', 'Blender', 'Cookware'] },
  { name: "Amara's MicroStore", slug: 'amara', color: 'var(--orange)', items: ['Phones', 'Beauty', 'Bags'] },
];

export function MicroStoresPage() {
  const { go, toast } = useStore();
  const scrollToFeatured = () => {
    const el = document.getElementById('featured-stores');
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
  };
  const comingSoon = () => toast('MicroStores are launching soon — create an account to join the waitlist.');

  return (
    <div className="page page-fade">
      {/* hero */}
      <section className="ms-hero">
        <div className="wrap ms-hero-grid">
          <div className="ms-hero-copy">
            <span className="badge badge-soft">Limitra MicroStores™</span>
            <h1>Become a Limitra<br /><span className="hl">MicroStore Partner</span></h1>
            <p>Curate products, share your own storefront and earn on every delivered sale. Limitra still handles inventory, pricing, checkout, payment, fulfillment and returns — you just build the audience.</p>
            <div className="hero-cta">
              <button className="btn btn-accent btn-lg" onClick={() => go('auth', 'signup')}>Become a MicroStore Partner <Icon name="arrowr" size={18} /></button>
              <button className="btn btn-ghost-light btn-lg" onClick={scrollToFeatured}>Explore MicroStores</button>
            </div>
            <div className="ms-hero-trust">
              {MS_TRUST.map(([ic, label]) => (
                <span key={label}><Icon name={ic} size={16} />{label}</span>
              ))}
            </div>
          </div>

          <div className="ms-hero-visual">
            <div className="ms-phone">
              <div className="ms-phone-screen">
                <div className="ms-phone-head">
                  <span className="ms-phone-avatar">A</span>
                  <div><b>Amara&rsquo;s MicroStore</b><small>Curated by Amara</small></div>
                </div>
                <div className="ms-phone-tabs">
                  {['All', 'Phones', 'Beauty', 'Fashion', 'Home'].map((t, i) => <span key={t} className={i === 0 ? 'on' : ''}>{t}</span>)}
                </div>
                <div className="ms-phone-grid">
                  {MS_PREVIEW.map(p => (
                    <div key={p.label} className="ms-phone-item">
                      <div className="ms-phone-thumb"><Placeholder label={p.label} product={{ tint: p.tint }} /></div>
                      <b>{p.price}</b>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="ms-hero-perks">
            <span className="ms-hero-perks-ic"><Icon name="store" size={22} /></span>
            <span className="ms-hero-url"><Icon name="share" size={14} /> limitra.com.ng/amara</span>
            <div className="ms-hero-perk-list">
              {MS_PERKS.map(p => <span key={p}><Icon name="check" size={15} stroke={3} /> {p}</span>)}
            </div>
          </div>
        </div>
      </section>

      {/* category strip */}
      <section className="sec" style={{ paddingBottom: 8 }}>
        <div className="wrap">
          <div className="cat-strip">
            {MS_CATS.map(([ic, name, slug, tint]) => (
              <button key={slug} className="cat-tile" onClick={() => go('shop', slug)}>
                <span className="cat-tile-ic" style={{ '--ph-b': tint }}><Icon name={ic} size={24} /></span>
                <b>{name}</b>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* comparison */}
      <section className="sec">
        <div className="wrap">
          <div className="aff-sec-head">
            <span className="eyebrow">Two ways to earn</span>
            <h2>Affiliate <span className="hl">vs</span> MicroStore Partner</h2>
            <p className="muted" style={{ marginTop: 10, textWrap: 'pretty' }}>An Affiliate promotes individual product links. A MicroStore Partner builds and promotes an actual storefront — Limitra still controls inventory, pricing, checkout, payment, fulfillment, logistics and returns.</p>
          </div>
          <div className="ms-compare">
            <div className="ms-compare-card plain">
              <div className="ms-compare-top">
                <span className="ms-compare-ic"><Icon name="share" size={20} /></span>
                <div><b>Affiliate</b><p>Shares a product link. Earns on tracked sales.</p></div>
              </div>
              <div className="ms-url-pill"><span>limitra.com.ng/product/123</span><Icon name="copy" size={15} /></div>
              <div className="ms-check-list">
                {AFFILIATE_PERKS.map(p => <span key={p}><Icon name="check" size={13} stroke={3} /> {p}</span>)}
              </div>
            </div>

            <span className="ms-vs-badge">VS</span>

            <div className="ms-compare-card highlight">
              <div className="ms-compare-top">
                <span className="ms-compare-ic"><Icon name="store" size={20} /></span>
                <div><b>MicroStore Partner</b><p>Operates a personalized Limitra storefront, builds an audience, promotes products, and earns from sales.</p></div>
              </div>
              <div className="ms-url-pill"><span>limitra.com.ng/amara</span><Icon name="copy" size={15} /></div>
              <div className="ms-check-list">
                {STORE_PERKS.map(p => <span key={p}><Icon name="check" size={13} stroke={3} /> {p}</span>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* how it works */}
      <section className="sec">
        <div className="wrap">
          <div className="aff-sec-head">
            <span className="eyebrow">How it works</span>
            <h2>From idea to income in four steps</h2>
          </div>
          <div className="aff-steps">
            {MS_STEPS.map(([ic, t, b], i) => (
              <div key={t} className="aff-step">
                <span className="aff-step-num">{i + 1}</span>
                <span className="aff-step-ic"><Icon name={ic} size={22} /></span>
                <b>{t}</b>
                <p className="muted">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* featured microstores */}
      <section className="sec" id="featured-stores">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="eyebrow">Explore</div>
              <h2>Featured MicroStores</h2>
            </div>
          </div>
          <div className="ms-stores">
            {FEATURED_STORES.map(s => (
              <div key={s.slug} className="ms-store-card card">
                <div className="ms-store-head">
                  <span className="ms-store-avatar" style={{ background: s.color }}><Icon name="store" size={18} /></span>
                  <div><b>{s.name}</b><small>limitra.com.ng/{s.slug}</small></div>
                </div>
                <div className="ms-store-thumbs">
                  {s.items.map(it => <div key={it} className="ms-store-thumb"><Placeholder label={it} /></div>)}
                </div>
                <button className="btn btn-outline btn-sm btn-block" onClick={comingSoon}>View Store <Icon name="arrowr" size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* final cta */}
      <section className="sec">
        <div className="wrap">
          <div className="ms-cta">
            <h2>Ready to become a MicroStore Partner?</h2>
            <p>It takes a few minutes to set up. Limitra handles inventory, pricing, checkout, payment, fulfillment and returns — you just share your link and earn.</p>
            <button className="btn btn-lg" style={{ background: '#fff', color: 'var(--orange)' }} onClick={() => go('auth', 'signup')}>Become a MicroStore Partner <Icon name="arrowr" size={18} /></button>
          </div>
        </div>
      </section>
    </div>
  );
}
