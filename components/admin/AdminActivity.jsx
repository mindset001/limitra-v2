'use client';
/* Activity log — ported verbatim from legacy/admin-sections.jsx. No sidebar nav entry
   (reachable via the notification panel's "view all activity" link), but still a real route
   at /admin/activity. */
import { useState } from 'react';
import { Icon } from '@/components/icons/Icon';
import { AdmHead } from './AdminShared';

export function AdminActivity() {
  const [filter, setFilter] = useState('All');
  // No activity-log backend yet — stays genuinely empty rather than fake events.
  const ACT = [];
  const cats = ['All', 'Order', 'Inventory', 'Customer', 'Affiliate', 'Payout', 'Review', 'Refund', 'Rewards'];
  const list = ACT.filter(a => filter === 'All' || a[2] === filter);
  return (
    <>
      <AdmHead title="Activity log" sub="All notifications and recent store activity">
        <button className="adm-btn ghost"><Icon name="download" size={15} /> Export</button>
      </AdmHead>
      <div className="adm-filters">
        {cats.map(c => <button key={c} className={'adm-chip' + (filter === c ? ' on' : '')} onClick={() => setFilter(c)}>{c}</button>)}
      </div>
      <div className="panel">
        <div className="adm-activity">
          {list.length === 0
            ? <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-faint)' }}>No activity yet.</div>
            : list.map((a, i) => (
            <div className="adm-act-row" key={i}>
              <span className={'adm-notif-ic ' + a[1]}><Icon name={a[0]} size={16} /></span>
              <div className="adm-act-txt">
                <div className="adm-act-top"><b>{a[3]}</b><span className="adm-pill muted">{a[2]}</span></div>
                <small className="muted">{a[4]}</small>
              </div>
              <span className="adm-act-time muted">{a[5]}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
