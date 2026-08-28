'use client';
/* Shared chart/KPI primitives — extracted from legacy/admin.jsx so both the admin dashboard
   and the affiliate dashboard (which reached into admin.jsx's window globals for these) import
   from one real shared module instead of one app depending on the other's internals. */
import { Icon } from '@/components/icons/Icon';

export function Kpi({ ic, tint, label, val, delta, up }) {
  return (
    <div className="kpi">
      <div className="kpi-top">
        <span className="kpi-ic" style={{ background: tint + '22', color: tint }}><Icon name={ic} size={19} /></span>
        {delta && <span className={'kpi-delta ' + (up ? 'up' : 'down')}>{up ? '▲' : '▼'} {delta}</span>}
      </div>
      <div className="kpi-val">{val}</div>
      <div className="kpi-label">{label}</div>
    </div>);

}

export function BarChart({ data, labels, alt }) {
  const max = Math.max(...data);
  return (
    <div className="bars">
      {data.map((v, i) =>
      <div className="bar-col" key={i}>
          <div className={'bar' + (alt && i === data.length - 1 ? ' alt' : '')} style={{ height: v / max * 100 + '%' }} title={'' + v} />
          <small>{labels[i]}</small>
        </div>
      )}
    </div>);

}

export function Donut({ segments }) {
  const total = segments.reduce((s, x) => s + x.v, 0);
  let acc = 0;
  const stops = segments.map((s) => {const start = acc / total * 360;acc += s.v;const end = acc / total * 360;return `${s.c} ${start}deg ${end}deg`;}).join(', ');
  return (
    <div className="donut-wrap">
      <div className="donut" style={{ background: `conic-gradient(${stops})` }}>
        <div className="donut-c"><b>{(total / 1000).toFixed(1)}K</b><small>visits</small></div>
      </div>
      <div className="legend">
        {segments.map((s, i) => <div className="legend-row" key={i}><span className="legend-dot" style={{ background: s.c }} /><span>{s.label}</span><b>{s.v.toLocaleString()}</b><span className="legend-pct">{Math.round(s.v / total * 100)}%</span></div>)}
      </div>
    </div>);

}

export const STATUS_CLS = { Pending: 'warn', Processing: 'info', Shipped: 'info', Delivered: 'ok', 'In transit': 'info', Cancelled: 'bad', Refunded: 'muted' };
