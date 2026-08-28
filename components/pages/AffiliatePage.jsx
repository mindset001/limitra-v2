'use client';
/* LIMITRA, Affiliate program (public marketing/landing page) — ported from legacy/pages-affiliate.jsx */
import { useState } from 'react';
import { Icon } from '@/components/icons/Icon';
import { useStore } from '@/components/store/StoreProvider';

function AffField({ label, value, onChange, err, placeholder, type = 'text', full }) {
  return (
    <div className="field" style={{ gridColumn: full ? '1 / -1' : 'auto' }}>
      <label>{label}</label>
      <input className={'input' + (err ? ' err' : '')} type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
      {err && <span className="err-msg">{err}</span>}
    </div>
  );
}

function ApplyForm() {
  const { toast } = useStore();
  const [f, setF] = useState({ name: '', email: '', channel: 'instagram', handle: '', audience: '10k–50k', about: '' });
  const [errs, setErrs] = useState({});
  const [done, setDone] = useState(false);
  const [code] = useState('LUCY' + Math.floor(100 + Math.random() * 900));

  const submit = e => {
    e.preventDefault();
    const er = {};
    if (!f.name.trim()) er.name = 'Enter your full name';
    if (!/^\S+@\S+\.\S+$/.test(f.email)) er.email = 'Enter a valid email';
    if (!f.handle.trim()) er.handle = 'Add your channel / page link';
    setErrs(er);
    if (Object.keys(er).length) return;
    setDone(true);
    toast('Application submitted!');
  };

  if (done) {
    const link = 'limitra.ng/r/' + code;
    return (
      <div className="aff-success card">
        <div className="success-check" style={{ width: 72, height: 72, marginBottom: 20 }}><Icon name="check" size={36} stroke={3} /></div>
        <h3 style={{ fontSize: 24 }}>You’re in, {f.name.split(' ')[0]}! 🎉</h3>
        <p className="muted" style={{ marginTop: 8 }}>Your application has been received. You’ll start at the <b>5% Starter</b> rate on your first valid delivered sale, and rise toward 15% as your 30-day performance grows.</p>
        <div className="aff-link">
          <span className="muted" style={{ fontSize: 12 }}>Your referral link</span>
          <div className="aff-link-row">
            <code>{link}</code>
            <button className="btn btn-primary btn-sm" onClick={() => toast('Link copied to clipboard')}><Icon name="share" size={15} /> Copy</button>
          </div>
        </div>
        <p className="muted" style={{ fontSize: 13, marginTop: 16 }}>We’ve emailed your dashboard login to <b>{f.email}</b>.</p>
      </div>
    );
  }

  return (
    <form className="aff-form card" onSubmit={submit}>
      <h3 style={{ fontSize: 22, marginBottom: 4 }}>Apply to the program</h3>
      <p className="muted" style={{ fontSize: 14, marginBottom: 20 }}>Free to join · start at 5% · climb to 15% on a rolling 30-day basis.</p>
      <div className="form-grid">
        <AffField label="Full name" value={f.name} onChange={v => setF(s => ({ ...s, name: v }))} err={errs.name} placeholder="Lucy Limitra" />
        <AffField label="Email address" type="email" value={f.email} onChange={v => setF(s => ({ ...s, email: v }))} err={errs.email} placeholder="you@email.com" />
        <div className="field">
          <label>Main channel</label>
          <div className="sort-wrap" style={{ height: 49, borderRadius: 'var(--r-sm)', width: '100%' }}>
            <select className="sort-sel" style={{ width: '100%' }} value={f.channel} onChange={e => setF(s => ({ ...s, channel: e.target.value }))}>
              {['Instagram', 'TikTok', 'YouTube', 'X / Twitter', 'Blog / Website', 'WhatsApp / Telegram'].map(c => <option key={c}>{c}</option>)}
            </select>
            <Icon name="chevdown" size={15} className="muted sort-chev" />
          </div>
        </div>
        <div className="field">
          <label>Audience size</label>
          <div className="sort-wrap" style={{ height: 49, borderRadius: 'var(--r-sm)', width: '100%' }}>
            <select className="sort-sel" style={{ width: '100%' }} value={f.audience} onChange={e => setF(s => ({ ...s, audience: e.target.value }))}>
              {['Under 10k', '10k–50k', '50k–250k', '250k+'].map(c => <option key={c}>{c}</option>)}
            </select>
            <Icon name="chevdown" size={15} className="muted sort-chev" />
          </div>
        </div>
        <AffField label="Channel / page link" full value={f.handle} onChange={v => setF(s => ({ ...s, handle: v }))} err={errs.handle} placeholder="instagram.com/yourhandle" />
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>Tell us about your audience <span className="muted" style={{ fontWeight: 400 }}>(optional)</span></label>
          <textarea className="input" rows={3} style={{ resize: 'vertical', fontFamily: 'inherit' }} value={f.about} placeholder="Who follows you and what do they love to shop for?" onChange={e => setF(s => ({ ...s, about: e.target.value }))} />
        </div>
      </div>
      <button className="btn btn-primary btn-block btn-lg" type="submit" style={{ marginTop: 18 }}>Submit application <Icon name="arrowr" size={18} /></button>
      <p className="muted" style={{ fontSize: 12, textAlign: 'center', marginTop: 12 }}>By applying you agree to the Affiliate <a className="link-btn" style={{ display: 'inline' }}>Terms</a>.</p>
    </form>
  );
}

export function AffiliatePage() {
  const { go } = useStore();
  const [openF, setOpenF] = useState(0);
  const scrollToApply = () => {
    const el = document.getElementById('apply');
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
  };

  const stats = [
    ['dollar', 'Up to 15%', 'commission rate'],
    ['refresh', 'Rolling 30 days', 'performance window'],
    ['check', 'Delivered orders', 'count toward your rank'],
    ['spark', 'From sale #1', 'start earning at 5%'],
  ];
  const steps = [
    ['user', 'Apply & get approved', 'Sign up free and get approved to start. Every affiliate begins at the 5% Starter rate and can earn from their first valid delivered sale.'],
    ['share', 'Share your links', 'Promote Limitra through your approved referral method, bio, posts, videos, newsletter or community.'],
    ['bag', 'Drive delivered orders', 'Only valid, successfully delivered orders from genuine customers count toward your commission and rank.'],
    ['refresh', 'Rank up automatically', 'Your tier is reviewed on a rolling 30-day basis and moves up, or down, automatically based on your delivered-order volume.'],
  ];
  const perks = [
    ['dollar', 'Up to 15% commission', 'Earn 5% from your first sale, rising to 15% as your rolling 30-day delivered orders grow.'],
    ['refresh', 'Rolling 30-day ranks', 'Your tier is recalculated continuously on the most recent 30 days, sustained selling keeps you climbing.'],
    ['grid', 'Real-time dashboard', 'Track clicks, delivered orders, current rank and earnings live, down to each link.'],
    ['shield', 'Valid orders protected', 'Commission is confirmed on valid delivered orders; cancelled, returned or fraudulent orders don’t count.'],
    ['gift', 'Approved creatives', 'Use Limitra-issued banners, product shots and campaign materials that stay on-brand.'],
    ['headset', 'Dedicated support', 'A partner team and clear program rules help you sell honestly and earn more.'],
  ];
  const tiers = [
    { name: 'Starter', rate: '5%', range: '1–500 orders', sub: 'Base earning level, a valid first sale qualifies.', accent: false },
    { name: 'Builder', rate: '7%', range: '501–1,000 orders', sub: 'For affiliates showing active, consistent selling.', accent: false },
    { name: 'Growth', rate: '10%', range: '1,001–1,500 orders', sub: 'High-performance level with strong 30-day output.', accent: true },
    { name: 'Pro', rate: '12%', range: '1,501–2,000 orders', sub: 'Advanced tier requiring substantial sales volume.', accent: false },
    { name: 'Elite', rate: '15%', range: '2,001+ orders', sub: 'Top tier for exceptional sustained performance.', accent: false },
  ];
  const countsYes = [
    'Delivered orders that are successfully completed',
    'Paid orders that pass Limitra review as valid',
    'Orders from genuine customers via your approved referral method',
  ];
  const countsNo = [
    'Cancelled, refunded, returned or failed-delivery orders',
    'Duplicate orders or self-referrals to inflate your tier',
    'Fraudulent, misleading or otherwise invalid transactions',
  ];
  const faqs = [
    ['How is my commission rate decided?', 'Your rate is based on the number of valid delivered orders you complete within a rolling 30-day period: 5% for 1–500, 7% for 501–1,000, 10% for 1,001–1,500, 12% for 1,501–2,000, and 15% for 2,001+ orders. Everyone starts at 5% and earns from their first valid delivered sale.'],
    ['What is the rolling 30-day window?', 'Rather than resetting monthly, your performance is recalculated continuously using your most recent 30 days. Your rank can move up when you hit the next threshold, or down if recent activity falls below your current tier.'],
    ['Which orders count toward my rank and earnings?', 'Only valid, successfully delivered orders from genuine customers obtained through your approved referral method. Cancelled, refunded, returned, failed, duplicate, self-referred or fraudulent orders do not count and may be reversed.'],
    ['When is my commission paid?', 'Commission is payable only on valid qualifying orders confirmed by Limitra. Payouts may be held for review, reconciliation, fraud screening or return checks, and Limitra sets the payout schedule, minimum threshold and approved payment channels.'],
    ['Can my rank go down or my account be removed?', 'Yes. Rank is not permanent, it adjusts automatically with your rolling 30-day results. Limitra may also pause or remove affiliates for fraud, coupon abuse, fake traffic, bots, impersonation or other policy violations.'],
    ['Does it cost anything to join?', 'No. The Limitra affiliate program is completely free to join, with no fees and no obligations.'],
  ];

  return (
    <div className="page page-fade">
      {/* hero */}
      <section className="aff-hero">
        <div className="wrap aff-hero-grid">
          <div className="aff-hero-copy">
            <span className="badge badge-soft"><Icon name="spark" size={14} /> Limitra Affiliate Program</span>
            <h1>Share what you love.<br /><span className="hl">Earn while you do.</span></h1>
            <p>Turn your audience into income. Recommend Nigeria’s favourite marketplace and earn <b>5% to 15% commission</b> on valid delivered orders, your rate grows with your performance over a rolling 30-day window.</p>
            <div className="hero-cta">
              <button className="btn btn-accent btn-lg" onClick={scrollToApply}>Become an affiliate <Icon name="arrowr" size={18} /></button>
              <button className="btn btn-ghost-light btn-lg" onClick={scrollToApply}>See how it works</button>
            </div>
            <div className="aff-hero-trust">
              <span><Icon name="check" size={15} stroke={3} /> Free to join</span>
              <span><Icon name="check" size={15} stroke={3} /> Earn from sale #1</span>
              <span><Icon name="check" size={15} stroke={3} /> Up to 15%</span>
            </div>
          </div>
          <div className="aff-hero-card">
            <div className="ahc-top">
              <span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>This month’s earnings</span>
              <span className="status-pill ok">+18%</span>
            </div>
            <div className="ahc-amount">₦ 248,500</div>
            <div className="ahc-bars">
              {[40, 62, 48, 75, 58, 88, 96].map((h, i) => <span key={i} style={{ height: h + '%' }} className={i === 6 ? 'on' : ''} />)}
            </div>
            <div className="ahc-rows">
              <div className="ahc-row"><span className="ahc-ic"><Icon name="bag" size={15} /></span><div><b>312 orders</b><small className="muted">via your links</small></div><b className="ahc-val">₦198k</b></div>
              <div className="ahc-row"><span className="ahc-ic"><Icon name="user" size={15} /></span><div><b>1,940 clicks</b><small className="muted">16% conversion</small></div><b className="ahc-val ok">₦50k</b></div>
            </div>
          </div>
        </div>
      </section>

      {/* stats */}
      <div className="wrap">
        <div className="aff-stats">
          {stats.map(([ic, v, l]) => (
            <div key={l} className="aff-stat">
              <span className="aff-stat-ic"><Icon name={ic} size={20} /></span>
              <div><b>{v}</b><small className="muted">{l}</small></div>
            </div>
          ))}
        </div>
      </div>

      {/* how it works */}
      <section className="sec">
        <div className="wrap">
          <div className="aff-sec-head">
            <span className="eyebrow">How it works</span>
            <h2>Start earning in four simple steps</h2>
          </div>
          <div className="aff-steps">
            {steps.map(([ic, t, b], i) => (
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

      {/* perks */}
      <section className="sec" style={{ paddingTop: 8 }}>
        <div className="wrap">
          <div className="aff-sec-head">
            <span className="eyebrow">Why join</span>
            <h2>Everything you need to earn more</h2>
          </div>
          <div className="aff-perks">
            {perks.map(([ic, t, b]) => (
              <div key={t} className="aff-perk card">
                <span className="aff-perk-ic"><Icon name={ic} size={20} /></span>
                <b>{t}</b>
                <p className="muted">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* commission tiers */}
      <section className="sec" style={{ paddingTop: 8 }}>
        <div className="wrap">
          <div className="aff-sec-head">
            <span className="eyebrow">Commission tiers</span>
            <h2>The more you deliver, the more you earn</h2>
            <p className="muted" style={{ marginTop: 10, textWrap: 'pretty' }}>Your rate is set by the number of valid delivered orders in your most recent 30 days. Ranks are reviewed continuously and adjust automatically.</p>
          </div>
          <div className="aff-tiers five">
            {tiers.map(tr => (
              <div key={tr.name} className={'aff-tier card' + (tr.accent ? ' featured' : '')}>
                {tr.accent && <span className="aff-tier-tag">Most common</span>}
                <span className="aff-tier-name">{tr.name}</span>
                <div className="aff-tier-rate">{tr.rate}<small>commission</small></div>
                <span className="aff-tier-range"><b>{tr.range.replace(' orders', '')}</b><small>orders / 30 days</small></span>
                <p className="muted aff-tier-sub">{tr.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* what counts */}
      <section className="sec" style={{ paddingTop: 8 }}>
        <div className="wrap">
          <div className="aff-sec-head">
            <span className="eyebrow">Fair & transparent</span>
            <h2>Which orders count</h2>
          </div>
          <div className="aff-counts">
            <div className="count-card card yes">
              <div className="count-head"><span className="count-ic ok"><Icon name="check" size={18} stroke={3} /></span><b>Orders that count</b></div>
              <ul>{countsYes.map(c => <li key={c}><Icon name="check" size={16} stroke={3} /> {c}</li>)}</ul>
            </div>
            <div className="count-card card no">
              <div className="count-head"><span className="count-ic bad"><Icon name="close" size={18} stroke={3} /></span><b>Orders that don’t count</b></div>
              <ul>{countsNo.map(c => <li key={c}><Icon name="close" size={16} stroke={2.5} /> {c}</li>)}</ul>
            </div>
          </div>
        </div>
      </section>

      {/* apply + faq */}
      <section className="sec" id="apply" style={{ paddingTop: 8 }}>
        <div className="wrap aff-apply-grid">
          <div>
            <span className="eyebrow">Join today</span>
            <h2 style={{ fontSize: 32, margin: '6px 0 16px' }}>Become a Limitra affiliate</h2>
            <p className="muted" style={{ fontSize: 16, marginBottom: 26, maxWidth: 440, textWrap: 'pretty' }}>Apply to join, start at 5% from your first valid delivered sale, and climb to 15% as your rolling 30-day performance grows. Fill in the form to get started.</p>
            <div className="faq-list" style={{ maxWidth: 480 }}>
              {faqs.map(([qq, a], i) => (
                <div key={i} className={'faq-item' + (openF === i ? ' open' : '')}>
                  <button className="faq-q" onClick={() => setOpenF(openF === i ? -1 : i)}><span>{qq}</span><Icon name={openF === i ? 'minus' : 'plus'} size={18} /></button>
                  <div className="faq-a"><p>{a}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className="aff-apply-form"><ApplyForm /></div>
        </div>
      </section>
    </div>
  );
}
