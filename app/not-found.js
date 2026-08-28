/* Ported from legacy/404.html */
export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)', padding: 24 }}>
      <div style={{ maxWidth: 480, textAlign: 'center' }}>
        <img src="/assets/logo.png" alt="Limitra" style={{ height: 30, margin: '0 auto 36px', display: 'block' }} />
        <div
          style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(96px, 22vw, 168px)', lineHeight: 0.9,
            letterSpacing: '-.04em', background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}
        >
          404
        </div>
        <h1 style={{ fontSize: 26, margin: '6px 0 10px' }}>We can’t find that page</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.6, marginBottom: 28, textWrap: 'pretty' }}>
          The page you’re looking for may have been moved, removed, or the link might be broken. Let’s get you back to shopping.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a className="btn btn-primary btn-lg" href="/">Back to store</a>
          <a className="btn btn-outline btn-lg" href="/shop/all">Browse products</a>
        </div>
        <div style={{ marginTop: 30, paddingTop: 24, borderTop: '1px solid var(--border)', display: 'flex', gap: '8px 20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--text-muted)', cursor: 'pointer' }} href="/shop/all">Shop</a>
          <a style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--text-muted)', cursor: 'pointer' }} href="/help">Help center</a>
          <a style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--text-muted)', cursor: 'pointer' }} href="/help/contact">Contact us</a>
          <a style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--text-muted)', cursor: 'pointer' }} href="/account">My account</a>
        </div>
      </div>
    </div>
  );
}
