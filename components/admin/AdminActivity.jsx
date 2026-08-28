'use client';
/* Activity log — ported verbatim from legacy/admin-sections.jsx. No sidebar nav entry
   (reachable via the notification panel's "view all activity" link), but still a real route
   at /admin/activity. */
import { useState } from 'react';
import { Icon } from '@/components/icons/Icon';
import { AdmHead } from './AdminShared';

export function AdminActivity() {
  const [filter, setFilter] = useState('All');
  const ACT = [
    ['truck', 'info', 'Order', 'New order LMT-92481', '₦641,000 · 2 items, needs processing', '5 min ago'],
    ['package', 'warn', 'Inventory', 'Low stock alert', 'Aura Pro ANC Headphones, 4 left', '40 min ago'],
    ['user', 'ok', 'Customer', 'New signup', 'zainab.m@email.com created an account', '1 hr ago'],
    ['dollar', 'ok', 'Payout', 'Affiliate payout processed', '₦320,000 sent to Bella Styles', '2 hr ago'],
    ['share', 'info', 'Affiliate', 'New affiliate application', 'Kunle Tech, YouTube · 65k', '3 hr ago'],
    ['star', 'warn', 'Review', 'New 2★ review flagged', 'CoreByte Mini Desktop PC', '4 hr ago'],
    ['refresh', 'bad', 'Refund', 'Refund requested', 'LMT-85220 · ₦42,000', '5 hr ago'],
    ['gift', 'ok', 'Rewards', 'Spin reward claimed', 'Femi Alabi won ₦5,000 Lim Cash', '6 hr ago'],
    ['truck', 'info', 'Order', 'Order LMT-92470 delivered', '₦128,500 · Lagos', '8 hr ago'],
    ['package', 'bad', 'Inventory', 'Out of stock', 'Velvet Matte Lipstick, Ruby', '10 hr ago'],
    ['user', 'ok', 'Customer', 'New signup', 'david.o@email.com created an account', '12 hr ago'],
    ['dollar', 'ok', 'Order', 'Payment received', 'LMT-92455 · ₦96,000 via card', 'Yesterday'],
  ];
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
          {list.map((a, i) => (
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
