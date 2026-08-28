'use client';
/* LIMITRA, Channels: where you can shop & how to connect them — ported from legacy/pages-channels.jsx */
import { useState } from 'react';
import { Icon } from '@/components/icons/Icon';
import { useStore } from '@/components/store/StoreProvider';
import { SOCIAL_GLYPHS } from '@/lib/data';

/* brand glyph helper (reads paths from lib/data) */
function ChGlyph({ name, size = 22 }) {
  const d = (SOCIAL_GLYPHS || {})[name];
  if (!d) return <Icon name={name} size={size} />;
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={d} /></svg>;
}

/* channel definitions */
const CHANNELS = [
  {
    key: 'app', name: 'Limitra Mobile App', cls: 'app', glyph: false, icon: 'phone', tag: 'Does everything',
    blurb: 'The complete Limitra experience, browse, cart, wishlist, pay, track and get real-time notifications on drops, price alerts and order updates.',
    caps: ['browse', 'cart', 'wishlist', 'buy', 'support', 'notify'],
    how: 'Download the app and sign in with any channel. Once in, link your other channels under Profile → Connected channels.',
  },
  {
    key: 'WhatsApp', name: 'WhatsApp', cls: 'whatsapp', glyph: true, tag: 'Shop & support',
    blurb: 'Chat with Lucy AI on WhatsApp to discover products, add to cart or wishlist, and check out, plus reach a human for support any time.',
    caps: ['browse', 'cart', 'wishlist', 'buy', 'support', 'notify'],
    how: 'Send “Hi” to the Limitra WhatsApp line, then verify with the one-time code we send to link it to your account.',
  },
  {
    key: 'Facebook', name: 'Facebook', cls: 'facebook', glyph: true, tag: 'Shop & support',
    blurb: 'Message Limitra on Facebook and let Lucy AI help you cart, wishlist and buy products, or hand you to support when you need a person.',
    caps: ['browse', 'cart', 'wishlist', 'buy', 'support', 'notify'],
    how: 'Open Messenger with Limitra, tap “Get started”, and confirm the link code to connect it to your profile.',
  },
  {
    key: 'Instagram', name: 'Instagram', cls: 'instagram', glyph: true, tag: 'Shop & support',
    blurb: 'DM us on Instagram to shop straight from posts and stories with Lucy AI, add to cart, save to wishlist, and purchase without leaving the app.',
    caps: ['browse', 'cart', 'wishlist', 'buy', 'support', 'notify'],
    how: 'Send a DM to @limitra, then enter the verification code we reply with to link the handle to your account.',
  },
  {
    key: 'X', name: 'X (Twitter)', cls: 'x', glyph: true, tag: 'Shop & support',
    blurb: 'Reach Lucy AI in your X DMs to browse, cart, wishlist and buy, or get quick help from our support team.',
    caps: ['browse', 'cart', 'wishlist', 'buy', 'support', 'notify'],
    how: 'DM @limitra on X and reply with the one-time code to connect your handle.',
  },
  {
    key: 'email', name: 'Email', cls: 'email', glyph: false, icon: 'mail', tag: 'Support & alerts',
    blurb: 'Email is for customer support, questions, returns and order issues, plus order and delivery notifications. Shopping actions happen on the other channels.',
    caps: ['support', 'notify'],
    how: 'Email support@limitra.com.ng from your registered address, or add a new email under Profile → Connected channels.',
  },
];

const CAP_LABELS = {
  browse:   ['eye', 'Browse products'],
  cart:     ['cart', 'Add to cart'],
  wishlist: ['heart', 'Save to wishlist'],
  buy:      ['bag', 'Buy & check out'],
  support:  ['headset', 'Customer support'],
  notify:   ['spark', 'Notifications'],
};
const CAP_ORDER = ['browse', 'cart', 'wishlist', 'buy', 'support', 'notify'];

export function ChannelsPage() {
  const { go, toast } = useStore();
  const [active, setActive] = useState('WhatsApp');

  const steps = [
    ['user', 'Sign in on any channel', 'Start on whichever channel you like, app, WhatsApp, Facebook, Instagram or X. Each can sign you in with a one-time code.'],
    ['spark', 'Open Profile → Connected channels', 'From any signed-in channel, head to your profile settings to manage the channels tied to your account.'],
    ['share', 'Link the rest', 'Add your other handles and confirm each with a quick code. They all now point to one Limitra account.'],
    ['check', 'Shop seamlessly everywhere', 'Your cart, wishlist, orders and addresses stay in sync, start on Instagram, finish in the app.'],
  ];

  return (
    <div className="page page-fade">
      {/* hero */}
      <section className="ch-hero">
        <div className="wrap">
          <span className="badge badge-soft"><Icon name="share" size={14} /> One account · every channel</span>
          <h1>Shop Limitra wherever<br />you already are.</h1>
          <p>Discover, cart, wishlist and buy through Lucy AI on WhatsApp, Facebook, Instagram and X, or do it all in the app. Stay in the loop with notifications on every channel, and link them to one account to pick up right where you left off.</p>
          <div className="ch-hero-row">
            {CHANNELS.map(c => (
              <span key={c.key} className={'ch-chip ' + c.cls} title={c.name}>
                {c.glyph ? <ChGlyph name={c.key} size={18} /> : <Icon name={c.icon} size={18} />}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="wrap">
        {/* channel cards */}
        <div className="ch-grid">
          {CHANNELS.map(c => (
            <div key={c.key} className={'ch-card ' + c.cls}>
              <div className="ch-card-head">
                <span className="ch-ic">{c.glyph ? <ChGlyph name={c.key} size={24} /> : <Icon name={c.icon} size={24} />}</span>
                <div>
                  <b>{c.name}</b>
                  <span className={'ch-tag' + (c.key === 'email' ? ' muted-tag' : '')}>{c.tag}</span>
                </div>
              </div>
              <p className="ch-blurb">{c.blurb}</p>
              <ul className="ch-caps">
                {CAP_ORDER.filter(cap => c.caps.includes(cap)).map(cap => (
                  <li key={cap}><Icon name="check" size={14} stroke={3} /> {CAP_LABELS[cap][1]}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* capability matrix */}
        <section className="ch-matrix-sec">
          <div className="aff-sec-head">
            <span className="eyebrow">At a glance</span>
            <h2>What you can do on each channel</h2>
          </div>
          <div className="ch-matrix-wrap">
            <table className="ch-matrix">
              <thead>
                <tr>
                  <th className="cm-corner">Capability</th>
                  {CHANNELS.map(c => (
                    <th key={c.key}>
                      <span className={'cm-h ' + c.cls}>{c.glyph ? <ChGlyph name={c.key} size={18} /> : <Icon name={c.icon} size={18} />}</span>
                      <small>{c.name.replace(' (Twitter)', '').replace('Limitra ', '')}</small>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CAP_ORDER.map(cap => (
                  <tr key={cap}>
                    <td className="cm-cap"><span><Icon name={CAP_LABELS[cap][0]} size={16} /> {CAP_LABELS[cap][1]}</span></td>
                    {CHANNELS.map(c => (
                      <td key={c.key} className="cm-cell">
                        {c.caps.includes(cap)
                          ? <span className="cm-yes"><Icon name="check" size={15} stroke={3} /></span>
                          : <span className="cm-no">,</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="ch-matrix-note"><Icon name="info" size={14} /> Email is for customer support and notifications. Shopping actions happen on the app and social channels.</p>
        </section>

        {/* how to link */}
        <section className="ch-link-sec">
          <div className="aff-sec-head">
            <span className="eyebrow">Linking channels</span>
            <h2>One account, all your channels</h2>
            <p className="muted" style={{ marginTop: 10, textWrap: 'pretty' }}>Sign in once on any channel, then connect the others so your cart, wishlist and orders follow you everywhere.</p>
          </div>
          <div className="ch-steps">
            {steps.map(([ic, t, s], i) => (
              <div className="ch-step" key={t}>
                <span className="ch-step-num">{i + 1}</span>
                <span className="ch-step-ic"><Icon name={ic} size={20} /></span>
                <b>{t}</b>
                <p className="muted">{s}</p>
              </div>
            ))}
          </div>
        </section>

        {/* per-channel how-to */}
        <section className="ch-how-sec">
          <div className="ch-how-tabs">
            {CHANNELS.map(c => (
              <button key={c.key} className={'ch-how-tab ' + c.cls + (active === c.key ? ' on' : '')} onClick={() => setActive(c.key)}>
                {c.glyph ? <ChGlyph name={c.key} size={16} /> : <Icon name={c.icon} size={16} />}
                {c.name.replace(' (Twitter)', '')}
              </button>
            ))}
          </div>
          {CHANNELS.filter(c => c.key === active).map(c => (
            <div className="ch-how-body" key={c.key}>
              <div className="ch-how-icon"><span className={'ch-ic ' + c.cls}>{c.glyph ? <ChGlyph name={c.key} size={26} /> : <Icon name={c.icon} size={26} />}</span></div>
              <div>
                <h3>Connect {c.name}</h3>
                <p className="muted">{c.how}</p>
                <div className="ch-how-actions">
                  <button className="btn btn-primary" onClick={() => go('account', 'profile')}>Link in profile settings <Icon name="arrowr" size={16} /></button>
                  <button className="btn btn-ghost" onClick={() => toast('We’ll guide you through linking ' + c.name.replace(' (Twitter)', ''))}>Learn more</button>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* CTA */}
        <div className="ch-cta">
          <div>
            <b>Ready to connect everything?</b>
            <span className="muted">Manage every channel from one place in your profile settings.</span>
          </div>
          <button className="btn btn-accent btn-lg" onClick={() => go('account', 'profile')}><Icon name="share" size={18} /> Manage channels</button>
        </div>
      </div>
    </div>
  );
}
