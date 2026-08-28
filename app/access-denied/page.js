'use client';
/* Ported from legacy/access-denied.html */
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AccessDeniedBody() {
  const need = useSearchParams().get('need');
  const msg = need === 'admin'
    ? 'This area is restricted to administrators. Sign in with a Super Admin account to continue.'
    : need === 'affiliate'
    ? 'This area is for Limitra affiliates. Sign in with an approved affiliate account, or join the affiliate programme to get access.'
    : 'You don’t have permission to view this dashboard. Please sign in with an account that has the right access.';
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)', padding: 24 }}>
      <div style={{ maxWidth: 440, textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '44px 36px', boxShadow: 'var(--shadow-lg)' }}>
        <img src="/assets/logo.png" alt="Limitra" style={{ height: 30, margin: '0 auto 28px', display: 'block' }} />
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(229,72,77,.12)', color: 'var(--red)', display: 'grid', placeItems: 'center', margin: '0 auto 22px' }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 11h12v9H6zM9 11V8a3 3 0 0 1 6 0v3" /></svg>
        </div>
        <h1 style={{ fontSize: 26, marginBottom: 10 }}>Access denied</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.6, marginBottom: 26, textWrap: 'pretty' }}>{msg}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a className="btn btn-primary btn-lg" href="/auth/signin">Sign in</a>
          <a className="btn btn-outline btn-lg" href="/">Back to store</a>
        </div>
      </div>
    </div>
  );
}

export default function AccessDeniedPage() {
  return (
    <Suspense fallback={null}>
      <AccessDeniedBody />
    </Suspense>
  );
}
