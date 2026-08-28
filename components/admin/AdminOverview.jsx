'use client';
/* Overview nav group — ported verbatim from legacy/admin.jsx */
import { useState } from 'react';
import { Icon } from '@/components/icons/Icon';
import { Thumb, REAL_IMG } from '@/components/ui/Shared';
import { naira, PRODUCTS } from '@/lib/data';
import { Kpi, BarChart, Donut, STATUS_CLS } from '@/components/charts/Charts';
import { ADMIN_ORDERS } from './AdminShared';

function RevenueChart() {
  const [range, setRange] = useState('month');
  const sets = {
    week: { data: [12, 18, 15, 22, 19, 27, 24], labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    month: { data: [42, 55, 48, 67, 71, 63, 88, 79, 94, 86, 102, 118], labels: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'] },
    year: { data: [1240, 1480, 1760, 2090, 2480, 2920], labels: ['2026', '2027', '2028', '2029', '2030', '2031'] }
  };
  const cur = sets[range];
  return (
    <div className="panel">
      <div className="panel-h"><h3>Revenue</h3>
        <div className="seg">
          {['week', 'month', 'year'].map((r) => <button key={r} className={range === r ? 'on' : ''} onClick={() => setRange(r)}>{r[0].toUpperCase() + r.slice(1)}</button>)}
        </div>
      </div>
      <BarChart data={cur.data} labels={cur.labels} alt />
    </div>);

}

export function AdminOverview() {
  const revenue = ADMIN_ORDERS.filter((o) => o.status !== 'Cancelled' && o.status !== 'Refunded').reduce((s, o) => s + o.total, 0);
  const pending = ADMIN_ORDERS.filter((o) => o.status === 'Pending' || o.status === 'Processing').length;
  const completed = ADMIN_ORDERS.filter((o) => o.status === 'Delivered').length;
  const kpis = [
  ['dollar', '#1F8A5B', 'Total Revenue', naira(revenue), '12.4%', true],
  ['truck', '#0438B6', 'Total Orders', ADMIN_ORDERS.length, '8.1%', true],
  ['user', '#7A5AE0', 'Total Customers', '4,820', '5.6%', true],
  ['bag', '#F67208', 'Total Products', PRODUCTS.length, '2.0%', true],
  ['clock', '#F5A623', 'Pending Orders', pending, '3.2%', false],
  ['check', '#1F8A5B', 'Completed Orders', completed, '9.7%', true],
  ['share', '#0E9BD6', 'Affiliate Sales', naira(2840000), '18.0%', true],
  ['headset', '#D6247C', 'Elo AI Chats', '1,932', '24.5%', true]];

  return (
    <>
      <div className="adm-h"><div><h1>Dashboard</h1><p>Welcome back, here’s how Limitra is performing today.</p></div>
        <div className="adm-h-actions"><button className="adm-btn ghost" data-go="reports"><Icon name="download" size={15} /> Export</button><button className="adm-btn primary" data-go="products"><Icon name="plus" size={15} /> Add product</button></div>
      </div>
      <div className="kpi-grid">{kpis.map((k, i) => <Kpi key={i} ic={k[0]} tint={k[1]} label={k[2]} val={k[3]} delta={k[4]} up={k[5]} />)}</div>
      <div className="adm-row c2">
        <RevenueChart />
        <div className="panel">
          <div className="panel-h"><h3>Traffic sources</h3></div>
          <Donut segments={[{ label: 'Direct', v: 4200, c: '#0438B6' }, { label: 'Affiliate', v: 2840, c: '#F67208' }, { label: 'Video', v: 1610, c: '#1F8A5B' }, { label: 'Referral', v: 980, c: '#7A5AE0' }]} />
        </div>
      </div>
      <div className="adm-row c2">
        <div className="panel">
          <div className="panel-h"><h3>Recent orders</h3><a className="adm-btn ghost" data-go="orders" style={{ cursor: 'pointer' }}>View all</a></div>
          <div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Total</th></tr></thead>
            <tbody>{ADMIN_ORDERS.slice(0, 6).map((o) => <tr key={o.id}><td data-label="Order"><b style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5 }}>{o.id}</b></td><td data-label="Customer">{o.customer}</td><td data-label="Status"><span className={'adm-pill ' + (STATUS_CLS[o.status] || 'muted')}>{o.status}</span></td><td data-label="Total"><b>{naira(o.total)}</b></td></tr>)}</tbody>
          </table></div>
        </div>
        <div className="panel">
          <div className="panel-h"><h3>Top products</h3></div>
          <div className="adm-list">
            {PRODUCTS.filter((p) => p.bestseller).slice(0, 5).map((p) =>
            <div className="adm-li" key={p.id}>
                <span className="adm-prod-thumb"><Thumb product={p} src={REAL_IMG[p.id]} /></span>
                <div className="adm-li-main"><b style={{ fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</b><small>{(p.reviews || 0).toLocaleString()} reviews · {p.rating}★</small></div>
                <b style={{ fontFamily: 'var(--font-display)' }}>{naira(p.price)}</b>
              </div>
            )}
          </div>
        </div>
      </div>
    </>);

}

export function AdminAnalytics() {
  const [range, setRange] = useState('30 days');
  const [gran, setGran] = useState('Weekly');
  const CHART = {
    Daily: { data: [12, 18, 14, 22, 19, 25, 21], labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    Weekly: { data: [58, 72, 64, 80, 76, 91, 104, 98], labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'] },
    Monthly: { data: [220, 265, 248, 310, 290, 356], labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
  };
  const mult = range === '90 days' ? 3 : 1;
  const ch = CHART[gran];
  return (
    <>
      <div className="adm-h"><div><h1>Analytics</h1><p>Sales, customers, products and traffic insights.</p></div>
        <div className="adm-h-actions"><div className="seg" style={{ display: 'flex', gap: 4, background: 'var(--surface-2)', borderRadius: 'var(--r-pill)', padding: 3 }}>{['30 days', '90 days'].map(r => <button key={r} className={'adm-chip' + (range === r ? ' on' : '')} style={{ background: range === r ? '' : 'transparent', border: 'none' }} onClick={() => setRange(r)}>{r}</button>)}</div></div>
      </div>
      <div className="kpi-grid">
        <Kpi ic="dollar" tint="#1F8A5B" label="Avg order value" val={naira(184000)} delta="6.2%" up />
        <Kpi ic="user" tint="#0438B6" label="New customers" val={String(612 * mult)} delta="14%" up />
        <Kpi ic="refresh" tint="#7A5AE0" label="Returning rate" val="38%" delta="2.1%" up />
        <Kpi ic="eye" tint="#F67208" label="Conversion" val="3.4%" delta="0.4%" down />
      </div>
      <div className="adm-row c2">
        <div className="panel"><div className="panel-h"><h3>Sales over time</h3><div className="seg">{['Daily', 'Weekly', 'Monthly'].map(g => <button key={g} className={gran === g ? 'on' : ''} onClick={() => setGran(g)}>{g}</button>)}</div></div>
          <BarChart key={gran + range} data={ch.data.map(v => Math.round(v * mult))} labels={ch.labels} alt /></div>
        <div className="panel"><div className="panel-h"><h3>Customers</h3></div>
          <Donut segments={[{ label: 'New', v: 612, c: '#F67208' }, { label: 'Returning', v: 1840, c: '#0438B6' }, { label: 'Dormant', v: 420, c: '#94A0B8' }]} /></div>
      </div>
      <div className="adm-row c3">
        <div className="panel"><div className="panel-h"><h3>Best sellers</h3></div><div className="adm-list">{PRODUCTS.filter((p) => p.bestseller).slice(0, 4).map((p) => <div className="adm-li" key={p.id}><span className="adm-li-av">{p.rating}</span><div className="adm-li-main"><b style={{ fontSize: 13 }}>{p.name.split(',')[0]}</b><small>{(p.reviews || 0).toLocaleString()} sold</small></div></div>)}</div></div>
        <div className="panel"><div className="panel-h"><h3>Most viewed</h3></div><div className="adm-list">{PRODUCTS.slice(2, 6).map((p) => <div className="adm-li" key={p.id}><span className="adm-li-av" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}><Icon name="eye" size={15} /></span><div className="adm-li-main"><b style={{ fontSize: 13 }}>{p.name.split(',')[0]}</b><small>{(2 + Math.random() * 8).toFixed(1)}K views</small></div></div>)}</div></div>
        <div className="panel"><div className="panel-h"><h3>Low performing</h3></div><div className="adm-list">{PRODUCTS.slice(-4).map((p) => <div className="adm-li" key={p.id}><span className="adm-li-av" style={{ background: 'rgba(229,72,77,.13)', color: 'var(--red)' }}><Icon name="chevdown" size={15} /></span><div className="adm-li-main"><b style={{ fontSize: 13 }}>{p.name.split(',')[0]}</b><small>{Math.floor(Math.random() * 20)} sold</small></div></div>)}</div></div>
      </div>
    </>);

}
