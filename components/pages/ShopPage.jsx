'use client';
/* LIMITRA, Shop, Category & Search — ported from legacy/pages-shop.jsx */
import { useState, useEffect, useMemo } from 'react';
import { Icon } from '@/components/icons/Icon';
import { useStore } from '@/components/store/StoreProvider';
import { ProductCard, Thumb, REAL_IMG, Stars, Price, Breadcrumbs, EmptyState } from '@/components/ui/Shared';
import { Dropdown } from '@/components/forms/Shared';
import { CAT_ICON, subSlugify, SUBCAT_INDEX } from '@/components/chrome/Chrome';
import { PRODUCTS, CATEGORIES, SUBCATS, naira, byCat } from '@/lib/data';

const SORTS = [['relevance', 'Most relevant'], ['low', 'Price: low to high'], ['high', 'Price: high to low'], ['rating', 'Top rated'], ['new', 'Newest']];

// Windowed page list: 1 … around(current) … last, with ellipses.
function pagerList(cur, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out = [1];
  let lo = Math.max(2, cur - 1), hi = Math.min(total - 1, cur + 1);
  if (cur <= 3) { lo = 2; hi = 4; }
  if (cur >= total - 2) { lo = total - 3; hi = total - 1; }
  if (lo > 2) out.push('…');
  for (let i = lo; i <= hi; i++) out.push(i);
  if (hi < total - 1) out.push('…');
  out.push(total);
  return out;
}

function priceSort(a, b, s) {
  if (s === 'low') return a.price - b.price;
  if (s === 'high') return b.price - a.price;
  if (s === 'rating') return b.rating - a.rating;
  if (s === 'new') return (b.badges.includes('new') ? 1 : 0) - (a.badges.includes('new') ? 1 : 0);
  return b.reviews - a.reviews;
}

function FilterPanel({ f, setF, brands, priceCap }) {
  const toggleBrand = b => setF(s => ({ ...s, brands: s.brands.includes(b) ? s.brands.filter(x => x !== b) : [...s.brands, b] }));
  return (
    <div className="filters">
      <div className="filter-block">
        <h5>Price range</h5>
        <input type="range" min="10000" max={priceCap} step="10000" value={f.maxPrice ?? priceCap}
          onChange={e => setF(s => ({ ...s, maxPrice: +e.target.value >= priceCap ? null : +e.target.value }))} className="range" />
        <div className="row between" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>
          <span className="muted">₦ 10,000</span><span style={{ color: 'var(--primary)' }}>up to {f.maxPrice == null ? naira(priceCap) + '+' : naira(f.maxPrice)}</span>
        </div>
      </div>
      <div className="filter-block">
        <h5>Brand</h5>
        {brands.map(b => (
          <label key={b} className="check">
            <input type="checkbox" checked={f.brands.includes(b)} onChange={() => toggleBrand(b)} />
            <span className="cbox"><Icon name="check" size={13} stroke={3} /></span>{b}
          </label>
        ))}
      </div>
      <div className="filter-block">
        <h5>Rating</h5>
        {[4, 3, 2].map(r => (
          <label key={r} className="check">
            <input type="radio" name="rate" checked={f.minRating === r} onChange={() => setF(s => ({ ...s, minRating: r }))} />
            <span className="cbox round"><Icon name="check" size={12} stroke={3} /></span>
            <span className="row" style={{ gap: 6 }}><Stars value={r} /> & up</span>
          </label>
        ))}
      </div>
      <div className="filter-block">
        <h5>Offers</h5>
        <label className="check">
          <input type="checkbox" checked={f.onSale} onChange={e => setF(s => ({ ...s, onSale: e.target.checked }))} />
          <span className="cbox"><Icon name="check" size={13} stroke={3} /></span>On sale only
        </label>
        <label className="check">
          <input type="checkbox" checked={f.inStock} onChange={e => setF(s => ({ ...s, inStock: e.target.checked }))} />
          <span className="cbox"><Icon name="check" size={13} stroke={3} /></span>In stock
        </label>
      </div>
    </div>
  );
}

function ShopShell({ baseList, title, eyebrow, crumbLabel }) {
  const { go } = useStore();
  const brands = useMemo(() => [...new Set(baseList.map(p => p.brand))].sort(), [baseList]);
  const priceCap = useMemo(() => Math.max(100000, Math.ceil(Math.max(...baseList.map(p => p.price), 0) / 100000) * 100000), [baseList]);
  const [f, setF] = useState({ maxPrice: null, brands: [], minRating: 0, onSale: false, inStock: false });
  const [sort, setSort] = useState('relevance');
  const [view, setView] = useState('grid');
  const [page, setPage] = useState(1);
  const [drawer, setDrawer] = useState(false);
  const perPage = 10;

  const filtered = useMemo(() => {
    let r = baseList.filter(p =>
      p.price <= (f.maxPrice ?? Infinity) &&
      (f.brands.length === 0 || f.brands.includes(p.brand)) &&
      p.rating >= f.minRating &&
      (!f.onSale || p.off > 0) &&
      (!f.inStock || p.stock > 0)
    );
    r = [...r].sort((a, b) => priceSort(a, b, sort));
    return r;
  }, [baseList, f, sort]);

  useEffect(() => setPage(1), [f, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const shown = filtered.slice((page - 1) * perPage, page * perPage);
  const activeCount = f.brands.length + (f.onSale ? 1 : 0) + (f.inStock ? 1 : 0) + (f.minRating ? 1 : 0) + (f.maxPrice != null ? 1 : 0);

  return (
    <div className="page page-fade">
      <div className="wrap">
        <Breadcrumbs items={[{ label: 'Home', to: ['home'] }, { label: crumbLabel }]} />
        <div className="shop-head">
          <div>
            {eyebrow && <div className="eyebrow">{eyebrow}</div>}
            <h1 style={{ fontSize: 30 }}>{title}</h1>
            <p className="muted" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginTop: 4 }}>{filtered.length} products</p>
          </div>
          <div className="shop-tools">
            <button className="btn btn-outline mobile-filter" onClick={() => setDrawer(true)}>
              <Icon name="filter" size={17} /> Filters {activeCount > 0 && <span className="fcount">{activeCount}</span>}
            </button>
            <Dropdown
              value={sort}
              onChange={setSort}
              icon="sort"
              width={196}
              options={SORTS.map(([v, l]) => ({ value: v, label: l }))} />

            <div className="view-toggle">
              <button className={view === 'grid' ? 'on' : ''} onClick={() => setView('grid')}><Icon name="grid" size={17} /></button>
              <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')}><Icon name="list" size={17} /></button>
            </div>
          </div>
        </div>

        <div className="shop-layout">
          <aside className="shop-side">
            <div className="row between" style={{ marginBottom: 4 }}>
              <h4 style={{ fontSize: 17 }}>Filters</h4>
              {activeCount > 0 && <button className="link-btn" onClick={() => setF({ maxPrice: null, brands: [], minRating: 0, onSale: false, inStock: false })}>Clear all</button>}
            </div>
            <FilterPanel f={f} setF={setF} brands={brands} priceCap={priceCap} />
          </aside>

          <div>
            {shown.length === 0 ? (
              <EmptyState icon="search" title="No products match your filters" body="Try widening your price range or clearing some filters." action="Clear filters" onAction={() => setF({ maxPrice: null, brands: [], minRating: 0, onSale: false, inStock: false })} />
            ) : view === 'grid' ? (
              <div className="shop-grid">{shown.map(p => <ProductCard key={p.id} product={p} />)}</div>
            ) : (
              <div className="list-grid">{shown.map(p => <ListCard key={p.id} product={p} />)}</div>
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

      <div className={'scrim' + (drawer ? ' on' : '')} onClick={() => setDrawer(false)} />
      <aside className={'drawer left' + (drawer ? ' on' : '')}>
        <div className="drawer-head"><h3>Filters</h3><button className="icon-btn" onClick={() => setDrawer(false)}><Icon name="close" size={18} /></button></div>
        <div className="drawer-body"><FilterPanel f={f} setF={setF} brands={brands} priceCap={priceCap} /></div>
        <div className="drawer-foot"><button className="btn btn-primary btn-block" onClick={() => setDrawer(false)}>Show {filtered.length} results</button></div>
      </aside>
    </div>
  );
}

export function ListCard({ product }) {
  const { go, addToCart, toggleWish, wish } = useStore();
  return (
    <article className="list-card" onClick={() => go('product', product.id)}>
      <div className="lc-thumb"><Thumb product={product} src={REAL_IMG[product.id]} /></div>
      <div className="lc-body">
        <span className="pc-brand">{product.brand}</span>
        <h4 style={{ fontSize: 17, margin: '4px 0 6px' }}>{product.name}</h4>
        <span className="pc-rate" style={{ marginBottom: 8 }}><Stars value={product.rating} /> {product.rating} · {product.reviews.toLocaleString()} reviews</span>
        <p className="muted" style={{ fontSize: 13.5, maxWidth: 520, textWrap: 'pretty' }}>{product.desc}</p>
      </div>
      <div className="lc-buy">
        <Price now={product.price} was={product.was} />
        {product.stock <= 5 && <span className="badge badge-soft" style={{ marginTop: 8 }}>Only {product.stock} left</span>}
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={e => { e.stopPropagation(); toggleWish(product.id); }}><Icon name="heart" size={15} fill={wish.includes(product.id) ? 'currentColor' : 'none'} /> Save</button>
        <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={e => { e.stopPropagation(); addToCart(product); }}><Icon name="cart" size={16} /> Add to cart</button>
      </div>
    </article>
  );
}

export function ShopPage({ cat, sub }) {
  const isDeals = cat === 'deals';
  const isNew = cat === 'new';
  const isTrending = cat === 'trending';
  const isAll = cat === 'all' || !cat;
  const isFashion = cat === 'fashion';
  const meta = CATEGORIES.find(c => c.slug === cat);
  let base = isDeals ? PRODUCTS.filter(p => p.off > 0) : isNew ? PRODUCTS.filter(p => (p.badges || []).includes('new')) : isTrending ? PRODUCTS.filter(p => p.bestseller) : isAll ? PRODUCTS : isFashion ? PRODUCTS.filter(p => p.category === 'womens' || p.category === 'mens') : byCat(cat);

  const subInfo = sub ? (SUBCAT_INDEX || {})[cat + '/' + sub] : null;
  if (subInfo) {
    const exact = base.filter(p => p.sub === sub);
    if (exact.length) base = exact;
    else {
      const kws = subInfo.label.toLowerCase().replace(/&/g, ' ').split(/[^a-z0-9]+/).filter(w => w.length > 3);
      const matched = base.filter(p => kws.some(w => (p.name + ' ' + p.shot).toLowerCase().includes(w)));
      if (matched.length) base = matched;
    }
  }

  const title = subInfo ? subInfo.label : isDeals ? 'Flash Deals & Offers' : isNew ? 'New Arrivals' : isTrending ? 'Trending This Week' : isAll ? 'All Products' : isFashion ? 'Fashion' : (meta?.name || 'Shop');
  const eyebrow = subInfo ? ((meta?.name) || (isFashion ? 'Fashion' : 'Category')) : isDeals ? 'Limited time' : isNew ? 'Just landed' : isTrending ? 'Best sellers' : (meta || isFashion) ? 'Category' : 'Catalog';

  return (
    <>
      {meta && !subInfo && <CategoryBanner meta={meta} />}
      <ShopShell baseList={base} title={title} eyebrow={eyebrow} crumbLabel={title} />
    </>
  );
}

export function CategoryBanner({ meta }) {
  const { go } = useStore();
  const subs = ((SUBCATS && SUBCATS[meta.slug]) || []).slice(0, 8);
  return (
    <div className="wrap" style={{ paddingTop: 22 }}>
      <div className={'cat-banner' + (meta.slug === 'adult' ? ' adult-pink' : '')} style={{ '--ph-b': meta.tint?.[1], '--ph-a': meta.tint?.[0] }}>
        <div>
          <span className="eyebrow">{meta.count.toLocaleString()} products</span>
          <h1 style={{ fontSize: 38 }}>{meta.name}</h1>
          <div className="sub-chips">
            {subs.map(s => <button key={s} className="chip" onClick={() => go('shop', meta.slug, subSlugify ? subSlugify(s) : undefined)}>{s}</button>)}
          </div>
        </div>
        <span className="cat-banner-ic"><Icon name={CAT_ICON[meta.slug]} size={64} stroke={1.4} /></span>
      </div>
    </div>
  );
}

export function SearchPage({ q }) {
  const { go, query } = useStore();
  const term = q || query || 'all';
  const clean = term.toLowerCase().trim();
  const isBlank = !clean || clean === 'all';
  const results = useMemo(() => {
    if (isBlank) return PRODUCTS;
    return PRODUCTS.filter(p => (p.name + ' ' + p.brand + ' ' + p.category + ' ' + p.shot).toLowerCase().includes(clean));
  }, [clean]);
  const history = ['gaming laptop', 'wireless earbuds', 'smartwatch'];
  const popular = ['Apex 14 Pro', 'Power bank', '4K Monitor', 'Drone', 'Mechanical keyboard'];

  if (results.length === 0) {
    return (
      <div className="page page-fade"><div className="wrap">
        <Breadcrumbs items={[{ label: 'Home', to: ['home'] }, { label: 'Search' }]} />
        <h1 style={{ fontSize: 28, margin: '10px 0 4px' }}>No results for “{term}”</h1>
        <p className="muted">We couldn’t find any products matching your search.</p>
        <div className="search-empty">
          <EmptyState icon="search" title="Try something else" body="Check your spelling or explore popular searches below." />
          <div style={{ textAlign: 'center', marginTop: -30 }}>
            <div className="muted" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, marginBottom: 10 }}>POPULAR SEARCHES</div>
            <div className="row" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {popular.map(p => <button key={p} className="chip" onClick={() => go('search', encodeURIComponent(p))}>{p}</button>)}
            </div>
          </div>
        </div>
      </div></div>
    );
  }

  return (
    <div className="page page-fade"><div className="wrap">
      <Breadcrumbs items={[{ label: 'Home', to: ['home'] }, { label: 'Search results' }]} />
      <h1 style={{ fontSize: 26, margin: '8px 0 2px' }}>{isBlank ? 'All products' : <>Results for “<span style={{ color: 'var(--primary)' }}>{term}</span>”</>}</h1>
      {!isBlank && (
        <div className="row" style={{ gap: 10, flexWrap: 'wrap', margin: '14px 0 4px' }}>
          <span className="muted" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12 }}>RECENT:</span>
          {history.map(h => <button key={h} className="chip" onClick={() => go('search', encodeURIComponent(h))}>{h}</button>)}
        </div>
      )}
    </div>
      <ShopShell baseList={results} title={(isBlank ? 'All products' : 'Search results')} crumbLabel="Search" />
    </div>
  );
}
