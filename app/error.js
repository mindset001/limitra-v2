'use client';
/* Ported from legacy/500.html */
export default function GlobalError({ reset }) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)', padding: 24 }}>
      <div style={{ maxWidth: 480, textAlign: 'center' }}>
        <img src="/assets/logo.png" alt="Limitra" style={{ height: 30, margin: '0 auto 36px', display: 'block' }} />
        <div
          style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(80px, 18vw, 132px)', lineHeight: 0.9,
            letterSpacing: '-.04em', background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}
        >
          500
        </div>
        <h1 style={{ fontSize: 26, margin: '6px 0 10px' }}>Something went wrong</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.6, marginBottom: 28, textWrap: 'pretty' }}>
          We hit an unexpected error on our end. It’s not you, it’s us. Our team has been notified. Please try again in a moment.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={() => reset()}>Try again</button>
          <a className="btn btn-outline btn-lg" href="/">Back to store</a>
        </div>
        <div style={{ marginTop: 30, paddingTop: 24, borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--text-faint)' }}>
          Still stuck? <a style={{ color: 'var(--primary)', cursor: 'pointer' }} href="/help/contact">Contact our support team</a> and we’ll help right away.
        </div>
      </div>
    </div>
  );
}
