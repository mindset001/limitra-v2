'use client';
/* LIMITRA, MicroStores directory — browse all MicroStore Partners. */
import { useState } from 'react';
import { Icon } from '@/components/icons/Icon';
import { useStore } from '@/components/store/StoreProvider';
import { Breadcrumbs } from '@/components/ui/Shared';
import { MICROSTORES } from '@/lib/microstoresData';

const DIR_CATS = ['All stores', 'Gaming', 'Beauty', 'Phones', 'Home & Living', "Men's Fashion", 'Bags'];
const SORTS = [['popular', 'Most popular'], ['rating', 'Top rated'], ['az', 'Name: A → Z']];

function StoreCard({ store }) {
  const { go, toast } = useStore();
  return (
    <div className="ms-dir-card card">
      <div className="ms-dir-cover" style={{ background: `linear-gradient(135deg, ${store.color}, ${store.color}99)` }} onClick={() => go('microstore', store.slug)} />
      <div className="ms-dir-body">
        <span className="ms-dir-avatar" style={{ background: store.color }}><Icon name="store" size={18} /></span>
        <b onClick={() => go('microstore', store.slug)}>{store.name}</b>
        <p className="muted">{store.tagline}</p>
        <div className="ms-dir-meta">
          <span><Icon name="star" size={13} fill="var(--gold)" /> {store.rating} <small>({store.reviews})</small></span>
          {store.verified && <span className="ms-dir-verified"><Icon name="shield" size={13} /> Verified</span>}
        </div>
        <div className="ms-dir-tags">
          {store.tags.map(tg => <span key={tg} className="chip">{tg}</span>)}
        </div>
        <button className="btn btn-primary btn-sm btn-block" onClick={() => toast('Following ' + store.name)}>Follow Store</button>
      </div>
    </div>
  );
}

export function MicroStoresDirectory() {
  const { go } = useStore();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All stores');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('popular');

  let list = MICROSTORES.filter(s =>
    (!q || s.name.toLowerCase().includes(q.toLowerCase())) &&
    (cat === 'All stores' || s.tags.includes(cat)) &&
    (status === 'all' || (status === 'verified' && s.verified) || (status === 'top' && s.rating >= 4.7))
  );
  list = [...list].sort((a, b) => {
    if (sort === 'rating') return b.rating - a.rating;
    if (sort === 'az') return a.name.localeCompare(b.name);
    return b.reviews - a.reviews;
  });

  return (
    <div className="page page-fade">
      <div className="wrap"><Breadcrumbs items={[{ label: 'Home', to: ['home'] }, { label: 'MicroStores', to: ['microstores'] }, { label: 'Explore' }]} /></div>

      <section className="sec" style={{ paddingTop: 10 }}>
        <div className="wrap">
          <div className="ms-explore-hero">
            <span className="eyebrow">Limitra MicroStores</span>
            <h1>Explore Amazing Stores <span className="hl">on Limitra</span></h1>
            <p className="muted">Discover MicroStore Partners, support independent sellers and find exactly what you need — all in one place.</p>
            <div className="ms-hero-trust" style={{ marginTop: 20, maxWidth: 600 }}>
              <span><Icon name="package" size={16} />No inventory required</span>
              <span><Icon name="truck" size={16} />Products, delivery &amp; returns handled by Limitra</span>
              <span><Icon name="dollar" size={16} />Earn on delivered sales</span>
              <span><Icon name="spark" size={16} />AI content tools for your store</span>
            </div>
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap ms-dir-layout">
          <aside className="ms-dir-side">
            <div className="ms-search">
              <Icon name="search" size={16} className="muted" />
              <input className="input" placeholder="Search stores…" value={q} onChange={e => setQ(e.target.value)} />
            </div>
            <div className="filter-block">
              <h5>Shop categories</h5>
              {DIR_CATS.map(c => (
                <label key={c} className="check">
                  <input type="radio" name="dircat" checked={cat === c} onChange={() => setCat(c)} />
                  <span className="cbox round"><Icon name="check" size={12} stroke={3} /></span>{c}
                </label>
              ))}
            </div>
            <div className="filter-block">
              <h5>Store status</h5>
              {[['all', 'All stores'], ['verified', 'Verified stores'], ['top', 'Top rated']].map(([v, l]) => (
                <label key={v} className="check">
                  <input type="radio" name="dirstatus" checked={status === v} onChange={() => setStatus(v)} />
                  <span className="cbox round"><Icon name="check" size={12} stroke={3} /></span>{l}
                </label>
              ))}
            </div>
            <div className="filter-block">
              <h5>Sort by</h5>
              <div className="sort-wrap" style={{ width: '100%', borderRadius: 'var(--r-sm)' }}>
                <select className="sort-sel" style={{ width: '100%' }} value={sort} onChange={e => setSort(e.target.value)}>
                  {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <Icon name="chevdown" size={15} className="muted sort-chev" />
              </div>
            </div>
          </aside>

          <div>
            {list.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-faint)' }}>No stores match your filters.</div>
            ) : (
              <div className="ms-dir-grid">
                {list.map(s => <StoreCard key={s.slug} store={s} />)}
              </div>
            )}
          </div>
        </div>
      </section>

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
