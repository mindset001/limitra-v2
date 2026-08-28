/* LIMITRA, About Us */
const { useState: useAbState } = React;

function AboutPage() {
  const { go } = useStore();

  const stats = [
    ['package', '2M+', 'Products delivered'],
    ['user', '850k+', 'Happy customers'],
    ['store', '12k+', 'Verified sellers'],
    ['truck', '36', 'States covered'],
  ];

  const values = [
    ['shield', 'Trust & authenticity', 'Every seller is verified and products are quality-checked, so you only ever receive the real thing.'],
    ['truck', 'Reliable delivery', 'Fast, tracked nationwide delivery with clear timelines, no guessing where your order is.'],
    ['headset', 'Customer obsession', 'Real support across every channel, WhatsApp, app, email and more, whenever you need us.'],
    ['tag', 'Fair pricing', 'Competitive prices, members-only deals and rewards that put real value back in your pocket.'],
  ];

  const milestones = [
    ['2026', 'Limitra is founded', 'Started with a simple goal: make quality products accessible to every Nigerian, with shopping you can trust.'],
    ['2026', 'Marketplace launch', 'Opened our doors to verified sellers across phones, fashion, beauty and electronics.'],
    ['2027', 'Going nationwide', 'Expanding delivery to all 36 states, with Elo AI and the affiliate programme.'],
    ['Next', 'The road ahead', 'Building the most loved shopping experience in Africa, channel by channel, order by order.'],
  ];

  const team = [
    ['Saint John', 'Founder & CEO', 'SJ'],
    ['Chinedu Okeke', 'Chief Technology Officer', 'CO'],
    ['Fatima Yusuf', 'Head of Operations', 'FY'],
    ['Tomiwa Adeyemi', 'Head of Growth', 'TA'],
  ];

  return (
    <div className="page page-fade">
      {/* hero */}
      <section className="about-hero">
        <div className="wrap">
          <span className="badge badge-soft"><Icon name="spark" size={14} /> Our Story</span>
          <h1>Shopping you can trust,<br />delivered across Nigeria.</h1>
          <p>Limitra is a premium marketplace built to make quality products accessible, with verified sellers, secure shopping and reliable delivery, backed by people who genuinely care.</p>
          <div className="hero-cta">
            <button className="btn btn-primary btn-lg" onClick={() => go('shop', 'all')}>Start shopping <Icon name="arrowr" size={18} /></button>
            <button className="btn btn-outline btn-lg" onClick={() => go('careers')}>Join the team</button>
          </div>
        </div>
      </section>

      <div className="wrap">
        {/* stats */}
        <div className="about-stats">
          {stats.map(([ic, v, l]) => (
            <div key={l} className="about-stat">
              <span className="about-stat-ic"><Icon name={ic} size={20} /></span>
              <div><b>{v}</b><small className="muted">{l}</small></div>
            </div>
          ))}
        </div>

        {/* mission */}
        <section className="about-mission">
          <div className="am-copy">
            <span className="eyebrow">Our mission</span>
            <h2>Make quality products accessible to everyone</h2>
            <p className="muted">We believe shopping online should feel effortless and trustworthy. From the products we list to the riders who deliver them, every part of Limitra is designed to put you first, whether you shop from our app, the web, or straight from a chat with Elo on WhatsApp.</p>
            <p className="muted">No fakes. No inflated prices. No guesswork. Just a marketplace that works the way it should.</p>
          </div>
          <div className="am-art" aria-hidden="true"><span className="ph-label">brand / lifestyle image</span></div>
        </section>

        {/* values */}
        <section className="about-sec">
          <div className="about-head">
            <span className="eyebrow">What we stand for</span>
            <h2>Our values</h2>
          </div>
          <div className="about-values">
            {values.map(([ic, t, b]) => (
              <div key={t} className="about-value">
                <span className="av-ic"><Icon name={ic} size={22} /></span>
                <b>{t}</b>
                <p className="muted">{b}</p>
              </div>
            ))}
          </div>
        </section>

        {/* timeline */}
        <section className="about-sec">
          <div className="about-head">
            <span className="eyebrow">Our journey</span>
            <h2>How far we've come</h2>
          </div>
          <div className="about-timeline">
            {milestones.map(([yr, t, b]) => (
              <div key={yr} className="about-ms">
                <div className="ams-year">{yr}</div>
                <div className="ams-body"><b>{t}</b><p className="muted">{b}</p></div>
              </div>
            ))}
          </div>
        </section>

        {/* team */}
        <section className="about-sec">
          <div className="about-head">
            <span className="eyebrow">The people</span>
            <h2>Meet the team</h2>
          </div>
          <div className="about-team">
            {team.map(([n, role, initials]) => (
              <div key={n} className="about-member">
                <span className="am-avatar">{initials}</span>
                <b>{n}</b>
                <small className="muted">{role}</small>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="about-cta">
          <div>
            <b>Ready to experience Limitra?</b>
            <span className="muted">Join hundreds of thousands shopping smarter every day.</span>
          </div>
          <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => go('shop', 'all')}>Shop now <Icon name="arrowr" size={18} /></button>
            <button className="btn btn-outline btn-lg" onClick={() => go('help', 'contact')}>Contact us</button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AboutPage });
