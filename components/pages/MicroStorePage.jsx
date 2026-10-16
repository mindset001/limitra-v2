'use client';
/* LIMITRA, MicroStore storefront — a single MicroStore Partner's shop page.
   Demo content only (see lib/microstoresData.js) — these aren't real catalog
   products, so tiles here don't add to cart or link to a real product page.
   Reuses the real Shop page's FilterPanel/pagerList/priceSort (ShopPage.jsx)
   for full feature parity (price range, brand, rating, offers, pagination)
   instead of a cut-down copy. */
import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/components/icons/Icon';
import { useStore } from '@/components/store/StoreProvider';
import { Breadcrumbs, EmptyState, Placeholder, Stars, Price } from '@/components/ui/Shared';
import { Dropdown } from '@/components/forms/Shared';
import { FilterPanel, pagerList, priceSort } from '@/components/pages/ShopPage';
import { storeBySlug } from '@/lib/microstoresData';

const SORTS = [['relevance', 'Most relevant'], ['low', 'Price: low to high'], ['high', 'Price: high to low'], ['rating', 'Top rated'], ['new', 'Newest']];
const PER_PAGE = 10;

function useDemoNotice() {
  const { toast } = useStore();
  return () => toast('This is demo content — real products come from Limitra’s live catalog.');
}

function MsProductTile({ product }) {
  const demoNotice = useDemoNotice();
  return (
    <article className="pcard" onClick={demoNotice} style={{ cursor: 'pointer' }}>
      <div className="thumb">
        <Placeholder product={{ tint: product.tint }} label={product.name.split(' ')[0]} />
        <div className="thumb-badges">
          {product.off > 0 && <span className="badge badge-sale">-{product.off}%</span>}
          {product.badge === 'new' && <span className="badge badge-new">New</span>}
          {product.badge === 'best' && <span className="badge badge-hot">Best seller</span>}
        </div>
        <button className="pc-add" title="Add to cart" onClick={e => { e.stopPropagation(); demoNotice(); }}><Icon name="plus" size={20} /></button>
      </div>
      <div className="pc-body">
        <span className="pc-brand">{product.brand}</span>
        <span className="pc-name">{product.name}</span>
        <span className="pc-rate"><Stars value={product.rating} /> {product.rating} · {product.reviews.toLocaleString()}</span>
        <Price now={product.price} was={product.was} />
      </div>
    </article>
  );
}

function MsListTile({ product }) {
  const demoNotice = useDemoNotice();
  return (
    <article className="list-card" onClick={demoNotice} style={{ cursor: 'pointer' }}>
      <div className="lc-thumb"><Placeholder product={{ tint: product.tint }} label={product.name.split(' ')[0]} /></div>
      <div className="lc-body">
        <span className="pc-brand">{product.brand}</span>
        <h4 style={{ fontSize: 17, margin: '4px 0 6px' }}>{product.name}</h4>
        <span className="pc-rate" style={{ marginBottom: 8 }}><Stars value={product.rating} /> {product.rating} · {product.reviews.toLocaleString()} reviews</span>
        {product.desc && <p className="muted" style={{ fontSize: 13.5, maxWidth: 520, textWrap: 'pretty' }}>{product.desc}</p>}
      </div>
      <div className="lc-buy">
        <Price now={product.price} was={product.was} />
        {product.stock > 0 && product.stock <= 5 && <span className="badge badge-soft" style={{ marginTop: 8 }}>Only {product.stock} left</span>}
        {product.stock === 0 && <span className="badge badge-soft" style={{ marginTop: 8 }}>Out of stock</span>}
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={e => { e.stopPropagation(); demoNotice(); }}><Icon name="heart" size={15} /> Save</button>
        <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={e => { e.stopPropagation(); demoNotice(); }}><Icon name="cart" size={16} /> Add to cart</button>
      </div>
    </article>
  );
}

const EMPTY_FILTERS = { maxPrice: null, brands: [], minRating: 0, onSale: false, inStock: false };

export function MicroStorePage({ slug }) {
  const { go, toast } = useStore();
  const store = storeBySlug(slug);

  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [f, setF] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState('relevance');
  const [view, setView] = useState('grid');
  const [page, setPage] = useState(1);
  const [drawer, setDrawer] = useState(false);

  const products = useMemo(() => store?.products || [], [store]);
  const cats = useMemo(() => ['all', ...new Set(products.map(p => p.category))], [products]);
  const brands = useMemo(() => [...new Set(products.map(p => p.brand))].sort(), [products]);
  const priceCap = useMemo(() => Math.max(100000, Math.ceil(Math.max(...products.map(p => p.price), 0) / 100000) * 100000), [products]);

  const filtered = useMemo(() => {
    let r = products.filter(p =>
      (cat === 'all' || p.category === cat) &&
      (!q || p.name.toLowerCase().includes(q.toLowerCase())) &&
      p.price <= (f.maxPrice ?? Infinity) &&
      (f.brands.length === 0 || f.brands.includes(p.brand)) &&
      p.rating >= f.minRating &&
      (!f.onSale || p.off > 0) &&
      (!f.inStock || p.stock > 0)
    );
    r = [...r].sort((a, b) => priceSort(a, b, sort));
    return r;
  }, [products, cat, q, f, sort]);

  useEffect(() => setPage(1), [cat, q, f, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const shown = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const activeCount = f.brands.length + (f.onSale ? 1 : 0) + (f.inStock ? 1 : 0) + (f.minRating ? 1 : 0) + (f.maxPrice != null ? 1 : 0);
  const clearAll = () => setF(EMPTY_FILTERS);

  if (!store) {
    return (
      <div className="page page-fade"><div className="wrap">
        <EmptyState icon="store" title="Store not found" body="This MicroStore doesn’t exist or may have been removed." action="Explore MicroStores" onAction={() => go('microstoresExplore')} />
      </div></div>
    );
  }

  return (
    <div className="page page-fade">
      <section className="sec" style={{ paddingTop: 8, paddingBottom: 0 }}>
        <div className="wrap">
          <div className="ms-store-banner" style={{ background: `linear-gradient(120deg, ${store.color}, ${store.color}cc)` }}>
            <span className="ms-store-banner-avatar" style={{ background: store.color }}><Icon name="store" size={28} /></span>
            <div className="ms-store-banner-info">
              <b>{store.name}</b>
              <span>{store.tagline}</span>
              <p>{store.description}</p>
              <div className="ms-store-banner-meta">
                <span><Icon name="star" size={14} fill="#FFD166" /> {store.rating} ({store.reviews} reviews)</span>
                {store.verified && <span><Icon name="shield" size={14} /> Verified Store</span>}
                <span><Icon name="truck" size={14} /> Ships from {store.location}</span>
              </div>
            </div>
            <div className="ms-store-banner-cta">
              <button className="btn" style={{ background: '#fff', color: 'var(--text)' }} onClick={() => toast('Following ' + store.name)}><Icon name="heart" size={16} /> Follow Store</button>
              <button className="btn btn-ghost-light" onClick={() => toast('Chat isn’t connected yet')}><Icon name="chat" size={16} /> Chat with Store</button>
            </div>
          </div>
        </div>
      </section>

      <div className="wrap">
        <Breadcrumbs items={[{ label: 'Home', to: ['home'] }, { label: 'MicroStores', to: ['microstoresExplore'] }, { label: store.name }]} />
      </div>

      <section className="sec" style={{ paddingTop: 10 }}>
        <div className="wrap">
          <div className="shop-head">
            <div>
              <span className="eyebrow">Catalog</span>
              <h1 style={{ fontSize: 28 }}>Shop</h1>
              <p className="muted" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginTop: 4 }}>{filtered.length} products</p>
            </div>
            <div className="shop-tools">
              <button className="btn btn-outline mobile-filter" onClick={() => setDrawer(true)}>
                <Icon name="filter" size={17} /> Filters {activeCount > 0 && <span className="fcount">{activeCount}</span>}
              </button>
              <Dropdown value={sort} onChange={setSort} icon="sort" width={196} options={SORTS.map(([v, l]) => ({ value: v, label: l }))} />
              <div className="view-toggle">
                <button className={view === 'grid' ? 'on' : ''} onClick={() => setView('grid')}><Icon name="grid" size={17} /></button>
                <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')}><Icon name="list" size={17} /></button>
              </div>
            </div>
          </div>

          <div className="shop-layout">
            <aside className="shop-side">
              <div className="ms-search">
                <Icon name="search" size={16} className="muted" />
                <input className="input" placeholder={'Search ' + store.name + '…'} value={q} onChange={e => setQ(e.target.value)} />
              </div>
              <div className="filter-block">
                <h5>Shop categories</h5>
                {cats.map(c => (
                  <label key={c} className="check">
                    <input type="radio" name="storecat" checked={cat === c} onChange={() => setCat(c)} />
                    <span className="cbox round"><Icon name="check" size={12} stroke={3} /></span>{c === 'all' ? 'All products' : <span style={{ textTransform: 'capitalize' }}>{c}</span>}
                  </label>
                ))}
              </div>
              <div className="row between" style={{ margin: '18px 0 4px' }}>
                <h4 style={{ fontSize: 17 }}>Filters</h4>
                {activeCount > 0 && <button className="link-btn" onClick={clearAll}>Clear all</button>}
              </div>
              <FilterPanel f={f} setF={setF} brands={brands} priceCap={priceCap} />
            </aside>

            <div>
              {shown.length === 0 ? (
                <EmptyState icon="search" title="No products match your filters" body="Try a different search or widen your filters." action={(q || cat !== 'all' || activeCount > 0) ? 'Clear filters' : undefined} onAction={() => { setQ(''); setCat('all'); clearAll(); }} />
              ) : view === 'grid' ? (
                <div className="shop-grid">{shown.map(p => <MsProductTile key={p.id} product={p} />)}</div>
              ) : (
                <div className="list-grid">{shown.map(p => <MsListTile key={p.id} product={p} />)}</div>
              )}

              {pages > 1 && (
                <div className="pager">
                  <button className="pg" disabled={page === 1} onClick={() => setPage(p => p - 1)}><Icon name="chevleft" size={16} /></button>
                  {pagerList(page, pages).map((n, i) => (
                    n === '…'
                      ? <span key={'e' + i} className="pg-gap">…</span>
                      : <button key={n} className={'pg' + (page === n ? ' on' : '')} onClick={() => setPage(n)}>{n}</button>
                  ))}
                  <button className="pg" disabled={page === pages} onClick={() => setPage(p => p + 1)}><Icon name="chevright" size={16} /></button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className={'scrim' + (drawer ? ' on' : '')} onClick={() => setDrawer(false)} />
      <aside className={'drawer left' + (drawer ? ' on' : '')}>
        <div className="drawer-head"><h3>Filters</h3><button className="icon-btn" onClick={() => setDrawer(false)}><Icon name="close" size={18} /></button></div>
        <div className="drawer-body"><FilterPanel f={f} setF={setF} brands={brands} priceCap={priceCap} /></div>
        <div className="drawer-foot"><button className="btn btn-primary btn-block" onClick={() => setDrawer(false)}>Show {filtered.length} results</button></div>
      </aside>

      <section className="sec">
        <div className="wrap">
          <div className="ms-sell-banner">
            <span className="ms-sell-ic"><Icon name="store" size={22} /></span>
            <div><b>Want to sell on Limitra?</b><p>Start your own MicroStore, earn commissions and reach thousands of customers.</p></div>
            <button className="btn btn-accent" onClick={() => go('microstores')}>Create your own MicroStore</button>
          </div>
        </div>
      </section>
    </div>
  );
}
