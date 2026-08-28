/* LIMITRA, Authentication (sign in / sign up / forgot / OTP) */
const { useState, useRef, useEffect } = React;

function AuthField({ label, type = 'text', value, onChange, err, placeholder, icon, leading, prefix, right, onRight }) {
  return (
    <div className="field">
      <div className={'auth-input' + (err ? ' err' : '')}>
        {leading ? <span className="ai-ic" style={{ display: 'grid', placeItems: 'center' }}>{leading}</span> : icon && <Icon name={icon} size={18} className="ai-ic" />}
        {prefix && <span className="ai-prefix">{prefix}</span>}
        <input type={type} value={value} placeholder={label} aria-label={label} onChange={(e) => onChange(e.target.value)} style={prefix ? { paddingLeft: 0 } : null} />
        {right && <button type="button" className="ai-right" onClick={onRight}>{right}</button>}
      </div>
      {err && <span className="err-msg">{err}</span>}
    </div>);

}

function SocialMark({ name, size = 18 }) {
  const d = (window.LIMITRA.SOCIAL_GLYPHS || {})[name];
  if (!d) return null;
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={d} /></svg>;
}

/* identifier methods, email plus four social handles */
const ID_METHODS = {
  email: { label: 'Email address', icon: 'mail', type: 'email', ph: 'you@email.com' },
  WhatsApp: { label: 'WhatsApp number', glyph: true, type: 'tel', ph: '+234 800 000 0000' },
  Facebook: { label: 'Facebook username', glyph: true, ph: 'your.username' },
  Instagram: { label: 'Instagram handle', glyph: true, prefix: '@', ph: 'yourhandle' },
  X: { label: 'X (Twitter) handle', glyph: true, prefix: '@', ph: 'yourhandle' }
};
const SOCIAL_KEYS = ['WhatsApp', 'Facebook', 'Instagram', 'X'];

function OtpInput({ onComplete }) {
  const [vals, setVals] = useState(['', '', '', '', '', '']);
  const refs = useRef([]);
  const set = (i, v) => {
    v = v.replace(/\D/g, '').slice(-1);
    setVals((prev) => {const n = [...prev];n[i] = v;if (v && i < 5) refs.current[i + 1]?.focus();if (n.every((x) => x)) onComplete?.(n.join(''));return n;});
  };
  const key = (i, e) => {if (e.key === 'Backspace' && !vals[i] && i > 0) refs.current[i - 1]?.focus();};
  return (
    <div className="otp-row">
      {vals.map((v, i) =>
      <input key={i} ref={(el) => refs.current[i] = el} className={'otp-box' + (v ? ' filled' : '')} inputMode="numeric" maxLength={1} value={v} onChange={(e) => set(i, e.target.value)} onKeyDown={(e) => key(i, e)} autoFocus={i === 0} />
      )}
    </div>);

}

function AuthPage({ mode = 'signin' }) {
  const { go, toast } = useStore();
  const [m, setM] = useState(mode);
  const otpFrom = useRef('signup');
  const [idm, setIdm] = useState('email'); // identifier method
  const [f, setF] = useState({ name: '', id: '', pass: '', confirm: '' });
  const [errs, setErrs] = useState({});
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resend, setResend] = useState(28);

  useEffect(() => {setM(mode);setErrs({});setIdm('email');}, [mode]);
  useEffect(() => {if (m === 'signup' || m === 'forgot') setIdm('email');}, [m]);
  useEffect(() => {
    if (m !== 'otp') return;
    setResend(28);
    const id = setInterval(() => setResend((r) => r > 0 ? r - 1 : 0), 1000);
    return () => clearInterval(id);
  }, [m]);

  const isSocial = idm !== 'email';
  const meta = ID_METHODS[idm];
  const switchMethod = (k) => {setIdm((cur) => cur === k ? 'email' : k);setF((s) => ({ ...s, id: '', pass: '', confirm: '' }));setErrs({});};

  const otpDest = idm === 'email' ? f.id || 'your email' :
  idm === 'WhatsApp' ? f.id || 'your WhatsApp' :
  '@' + (f.id.replace(/^@/, '') || 'your handle') + ' on ' + idm;

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (m === 'signup' && !f.name.trim()) er.name = 'Enter your name';
    if (m !== 'otp') {
      const v = f.id.trim();
      if (idm === 'email') {if (!/^\S+@\S+\.\S+$/.test(v)) er.id = 'Enter a valid email';} else
      if (idm === 'WhatsApp') {if (v.replace(/\D/g, '').length < 10) er.id = 'Enter a valid WhatsApp number';} else
      {if (v.replace(/^@/, '').length < 2) er.id = `Enter your ${idm} ${idm === 'Facebook' ? 'username' : 'handle'}`;}
    }
    // password only applies to the email method
    if (!isSocial && (m === 'signin' || m === 'signup') && f.pass.length < 6) er.pass = 'At least 6 characters';
    if (!isSocial && m === 'signup' && f.confirm !== f.pass) er.confirm = 'Passwords don’t match';
    setErrs(er);
    if (Object.keys(er).length) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (m === 'forgot') {toast('Reset link sent');otpFrom.current = 'forgot';setM('otp');return;}
      // social sign-in / sign-up always confirms with a one-time code
      if (isSocial) {toast(`Code sent via ${idm}`);otpFrom.current = m;setM('otp');return;}
      if (m === 'signin') {
        const email = (f.id || '').trim().toLowerCase();
        const r = (window.LIMITRA.roleFor ? window.LIMITRA.roleFor(email) : { role: 'Customer', dest: 'account' });
        if (!isSocial && r.role === 'Super Admin') { try { localStorage.setItem('lim_admin', JSON.stringify({ ...r, email })); } catch (e) {} toast('Welcome, Super Admin'); setTimeout(() => { window.location.href = r.dest; }, 400); return; }
        if (!isSocial && r.role === 'Affiliate') { try { localStorage.setItem('lim_affiliate', JSON.stringify({ ...r, email })); } catch (e) {} toast('Welcome back!'); setTimeout(() => { window.location.href = r.dest; }, 400); return; }
        toast('Welcome back!'); go('account');
      } else
      if (m === 'signup') {otpFrom.current = 'signup';setM('otp');}
    }, 900);
  };

  const titles = {
    signin: ['Welcome back', 'Sign in to continue to your Limitra account.'],
    signup: ['Create your account', 'Join Limitra for verified tech and exclusive deals.'],
    forgot: ['Reset password', 'Enter your email and we’ll send you a reset link.'],
    otp: ['Verify it’s you', `We sent a 6-digit code to ${otpDest}.`]
  };

  const submitLabel = isSocial ?
  <>Continue with {idm} <Icon name="arrowr" size={17} /></> :
  m === 'signin' ? 'Sign in' : m === 'signup' ? 'Create account' : 'Send reset link';

  return (
    <div className="auth-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) go('home'); }}>
    <div className="auth-screen">
      <button className="auth-modal-x" onClick={() => go('home')} aria-label="Close"><Icon name="close" size={20} /></button>
      <div className="auth-aside">
        <div className="auth-aside-photo" />
      </div>

      <div className="auth-panel">
        <div className="auth-form-wrap">
          <button className="auth-back mobile" onClick={() => go('home')}><Icon name="chevleft" size={16} /> Back</button>
          <div className="auth-brand-right"><Logo height={34} /></div>

          <h1>{titles[m][0]}</h1>
          <p className="muted auth-sub">{titles[m][1]}</p>

          {m === 'signin' &&
          <>
              <div className="auth-social-switch">
                <span className="ass-label">Sign in with</span>
                <div className="auth-methods">
                  <button type="button" title="Use Email" aria-pressed={idm === 'email'}
                className={'auth-method email' + (idm === 'email' ? ' on' : '')}
                onClick={() => switchMethod('email')}>
                    <Icon name="mail" size={18} />
                  </button>
                  {SOCIAL_KEYS.map((k) =>
                <button key={k} type="button" title={`Use ${k}`} aria-pressed={idm === k}
                className={'auth-method ' + k.toLowerCase() + (idm === k ? ' on' : '')}
                onClick={() => switchMethod(k)}>
                      <SocialMark name={k} size={18} />
                    </button>
                )}
                </div>
              </div>
              <div className="auth-divider"><span>{isSocial ? `or use ${idm}` : 'or continue with email'}</span></div>
            </>
          }

          {m === 'signup' &&
          <p className="auth-social-note" style={{ marginBottom: 18 }}>
              <Icon name="info" size={14} />
              <span>Sign up with your email, we’ll send a verification code on the next screen.</span>
            </p>
          }

          {m === 'otp' ?
          <form onSubmit={submit}>
              <OtpInput onComplete={() => {toast('Verified!');if (otpFrom.current === 'signup') {try {window.dispatchEvent(new Event('lim:signup'));} catch (e) {}}go('account');}} />
              <button className="btn btn-primary btn-block btn-lg" type="submit" style={{ marginTop: 22 }}>Verify &amp; continue</button>
              <p className="muted" style={{ textAlign: 'center', marginTop: 16, fontSize: 13.5 }}>
                Didn’t get the code? {resend > 0 ? <span>Resend in {resend}s</span> : <a className="link-btn" onClick={() => {setResend(28);toast('Code resent');}}>Resend code</a>}
              </p>
            </form> :

          <form onSubmit={submit} className="auth-form">
              {m === 'signup' && <AuthField label="Full name" icon="user" value={f.name} onChange={(v) => setF((s) => ({ ...s, name: v }))} err={errs.name} placeholder="Lucy Limitra" />}

              <AuthField
              label={meta.label}
              type={meta.type || 'text'}
              icon={meta.icon}
              leading={meta.glyph ? <span className={'ai-soc ' + idm.toLowerCase()}><SocialMark name={idm} size={15} /></span> : null}
              prefix={meta.prefix}
              value={f.id}
              onChange={(v) => setF((s) => ({ ...s, id: v }))}
              err={errs.id}
              placeholder={meta.ph} />

              {isSocial &&
            <p className="auth-social-note">
                  <Icon name="info" size={14} />
                  <span>We’ll send a one-time code to your {idm} to confirm it’s you, no password needed.</span>
                </p>
            }

              {!isSocial && (m === 'signin' || m === 'signup') &&
            <AuthField label="Password" type={show ? 'text' : 'password'} icon="lock" value={f.pass} onChange={(v) => setF((s) => ({ ...s, pass: v }))} err={errs.pass} placeholder="••••••••" right={show ? 'Hide' : 'Show'} onRight={() => setShow((s) => !s)} />
            }
              {!isSocial && m === 'signup' && <AuthField label="Confirm password" type={show ? 'text' : 'password'} icon="lock" value={f.confirm} onChange={(v) => setF((s) => ({ ...s, confirm: v }))} err={errs.confirm} placeholder="••••••••" />}

              {!isSocial && m === 'signin' &&
            <div className="row between" style={{ margin: '2px 0 4px' }}>
                  <label className="check" style={{ fontSize: 13 }}><input type="checkbox" /><span className="cbox"><Icon name="check" size={12} stroke={3} /></span>Remember me</label>
                  <a className="link-btn" onClick={() => setM('forgot')}>Forgot password?</a>
                </div>
            }

              <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading} style={{ marginTop: 8 }}>
                {loading ? <span className="auth-spin" /> : submitLabel}
              </button>
            </form>
          }

          <p className="auth-switch">
            {m === 'signin' && <>New to Limitra? <a className="link-btn" onClick={() => setM('signup')}>Create an account</a></>}
            {m === 'signup' && <>Already have an account? <a className="link-btn" onClick={() => setM('signin')}>Sign in</a></>}
            {(m === 'forgot' || m === 'otp') && <><a className="link-btn" onClick={() => setM('signin')}>← Back to sign in</a></>}
          </p>

          {m === 'signup' && <p className="auth-terms">By creating an account you agree to Limitra’s <a>Terms</a> and <a>Privacy Policy</a>.</p>}
        </div>
      </div>
    </div>
    </div>);

}

Object.assign(window, { AuthPage });