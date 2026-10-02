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
  // No orders backend yet — real zeros across each period rather than sample figures.
  const sets = {
    week: { data: [0, 0, 0, 0, 0, 0, 0], labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    month: { data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], labels: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'] },
    year: { data: [0, 0, 0, 0, 0, 0], labels: ['2026', '2027', '2028', '2029', '2030', '2031'] }
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
  ['dollar', '#1F8A5B', 'Total Revenue', naira(revenue), '', true],
  ['truck', '#0438B6', 'Total Orders', ADMIN_ORDERS.length, '', true],
  ['user', '#7A5AE0', 'Total Customers', 0, '', true],
  ['bag', '#F67208', 'Total Products', PRODUCTS.length, '', true],
  ['clock', '#F5A623', 'Pending Orders', pending, '', false],
  ['check', '#1F8A5B', 'Completed Orders', completed, '', true],
  ['share', '#0E9BD6', 'Affiliate Sales', naira(0), '', true],
  ['headset', '#D6247C', 'Elo AI Chats', 0, '', true]];

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
          <Donut segments={[]} />
        </div>
      </div>
      <div className="adm-row c2">
        <div className="panel">
          <div className="panel-h"><h3>Recent orders</h3><a className="adm-btn ghost" data-go="orders" style={{ cursor: 'pointer' }}>View all</a></div>
          <div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Total</th></tr></thead>
            <tbody>{ADMIN_ORDERS.slice(0, 6).map((o) => <tr key={o.id}><td data-label="Order"><b style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5 }}>{o.id}</b></td><td data-label="Customer">{o.customer}</td><td data-label="Status"><span className={'adm-pill ' + (STATUS_CLS[o.status] || 'muted')}>{o.status}</span></td><td data-label="Total"><b>{naira(o.total)}</b></td></tr>)}</tbody>
          </table>{ADMIN_ORDERS.length === 0 && <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-faint)' }}>No orders yet.</div>}</div>
        </div>
        <div className="panel">
          <div className="panel-h"><h3>Top products</h3></div>
          <div className="adm-list">
            {PRODUCTS.filter((p) => p.bestseller).length === 0
              ? <div style={{ padding: '18px 4px', textAlign: 'center', color: 'var(--text-faint)' }}>No products yet.</div>
              : PRODUCTS.filter((p) => p.bestseller).slice(0, 5).map((p) =>
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
  // No analytics backend yet — real zeros across each granularity rather than sample figures.
  const CHART = {
    Daily: { data: [0, 0, 0, 0, 0, 0, 0], labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    Weekly: { data: [0, 0, 0, 0, 0, 0, 0, 0], labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'] },
    Monthly: { data: [0, 0, 0, 0, 0, 0], labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
  };
  const ch = CHART[gran];
  return (
    <>
      <div className="adm-h"><div><h1>Analytics</h1><p>Sales, customers, products and traffic insights.</p></div>
        <div className="adm-h-actions"><div className="seg" style={{ display: 'flex', gap: 4, background: 'var(--surface-2)', borderRadius: 'var(--r-pill)', padding: 3 }}>{['30 days', '90 days'].map(r => <button key={r} className={'adm-chip' + (range === r ? ' on' : '')} style={{ background: range === r ? '' : 'transparent', border: 'none' }} onClick={() => setRange(r)}>{r}</button>)}</div></div>
      </div>
      <div className="kpi-grid">
        <Kpi ic="dollar" tint="#1F8A5B" label="Avg order value" val={naira(0)} delta="" up />
        <Kpi ic="user" tint="#0438B6" label="New customers" val="0" delta="" up />
        <Kpi ic="refresh" tint="#7A5AE0" label="Returning rate" val="0%" delta="" up />
        <Kpi ic="eye" tint="#F67208" label="Conversion" val="0%" delta="" down />
      </div>
      <div className="adm-row c2">
        <div className="panel"><div className="panel-h"><h3>Sales over time</h3><div className="seg">{['Daily', 'Weekly', 'Monthly'].map(g => <button key={g} className={gran === g ? 'on' : ''} onClick={() => setGran(g)}>{g}</button>)}</div></div>
          <BarChart key={gran + range} data={ch.data} labels={ch.labels} alt /></div>
        <div className="panel"><div className="panel-h"><h3>Customers</h3></div>
          <Donut segments={[]} /></div>
      </div>
      <div className="adm-row c3">
        <div className="panel"><div className="panel-h"><h3>Best sellers</h3></div><div className="adm-list"><div style={{ padding: '18px 4px', textAlign: 'center', color: 'var(--text-faint)' }}>No sales data yet.</div></div></div>
        <div className="panel"><div className="panel-h"><h3>Most viewed</h3></div><div className="adm-list"><div style={{ padding: '18px 4px', textAlign: 'center', color: 'var(--text-faint)' }}>No view data yet.</div></div></div>
        <div className="panel"><div className="panel-h"><h3>Low performing</h3></div><div className="adm-list"><div style={{ padding: '18px 4px', textAlign: 'center', color: 'var(--text-faint)' }}>No sales data yet.</div></div></div>
      </div>
    </>);

}
