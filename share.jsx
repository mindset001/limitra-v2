/* LIMITRA, product sharing (Web Share API + fallback modal + analytics) */
const { useState: useShState, useEffect: useShEffect } = React;

/* lightweight share analytics → localStorage */
function trackShare(productId, source, event) {
  try {
    const key = 'lim_share_analytics';
    const log = JSON.parse(localStorage.getItem(key) || '[]');
    log.push({ productId, source, event, at: Date.now() });
    localStorage.setItem(key, JSON.stringify(log.slice(-200)));
  } catch (e) {}
}

function productUrl(product) {
  // SEO-friendly, unique product URL
  const base = location.origin + location.pathname;
  return base + '#/product/' + product.slug;
}

function shareMessage(product) {
  const price = L.naira(product.price);
  return `Check out this product I found on Limitra!\n\n` +
    `Product: ${product.name}\n` +
    `Price: ${price}\n` +
    `Link: ${productUrl(product)}`;
}

function ShareModal({ product, onClose }) {
  const { toast } = useStore();
  const [copied, setCopied] = useShState(false);
  const url = productUrl(product);
  const msg = shareMessage(product);
  const enc = encodeURIComponent;

  useShEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  const channels = [
    { key: 'whatsapp', label: 'WhatsApp', cls: 'whatsapp', glyph: 'WhatsApp', href: `https://wa.me/?text=${enc(msg)}` },
    { key: 'facebook', label: 'Facebook', cls: 'facebook', glyph: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}&quote=${enc(msg)}` },
    { key: 'x', label: 'X', cls: 'x', glyph: 'X', href: `https://twitter.com/intent/tweet?text=${enc('Check out ' + product.name + ' on Limitra, ' + L.naira(product.price))}&url=${enc(url)}` },
    { key: 'telegram', label: 'Telegram', cls: 'telegram', icon: 'telegram', href: `https://t.me/share/url?url=${enc(url)}&text=${enc(msg)}` },
    { key: 'instagram', label: 'Instagram', cls: 'instagram', glyph: 'Instagram', copyFirst: true, href: 'https://www.instagram.com/' },
    { key: 'tiktok', label: 'TikTok', cls: 'tiktok', glyph: 'TikTok', copyFirst: true, href: 'https://www.tiktok.com/' },
  ];

  const openChannel = async (c) => {
    trackShare(product.id, c.key, 'share');
    if (c.copyFirst) {
      try { await navigator.clipboard.writeText(url); toast('Link copied, paste it in ' + c.label); } catch (e) { toast('Opening ' + c.label); }
    }
    window.open(c.href, '_blank', 'noopener,noreferrer');
  };

  const copyLink = async () => {
    trackShare(product.id, 'copy-link', 'share');
    try {
      await navigator.clipboard.writeText(url);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = url; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e2) {}
      document.body.removeChild(ta);
    }
    setCopied(true); toast('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="share-overlay" onMouseDown={onClose}>
      <div className="share-modal" role="dialog" aria-label={'Share ' + product.name} onMouseDown={e => e.stopPropagation()}>
        <div className="share-head">
          <h3>Share this product</h3>
          <button className="modal-x" onClick={onClose} aria-label="Close"><Icon name="close" size={20} /></button>
        </div>

        <div className="share-preview">
          <div className="share-thumb"><Thumb product={product} src={REAL_IMG[product.id]} /></div>
          <div className="share-pv-info">
            <span className="pc-brand" style={{ fontSize: 11 }}>{product.brand}</span>
            <b>{product.name}</b>
            <span className="share-price">{naira(product.price)}</span>
            <p className="muted share-desc">{product.desc}</p>
          </div>
        </div>

        <div className="share-grid">
          {channels.map(c => (
            <button key={c.key} className={'share-opt ' + c.cls} onClick={() => openChannel(c)}>
              <span className="share-opt-ic">{c.glyph ? <SocialMark name={c.glyph} size={22} /> : <Icon name={c.icon} size={22} />}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>

        <div className="share-link-row">
          <input readOnly value={url} onFocus={e => e.target.select()} aria-label="Product link" />
          <button className="btn btn-primary btn-sm" onClick={copyLink}>{copied ? 'Copied' : 'Copy'}</button>
        </div>
      </div>
    </div>
  );
}

/* Share button, uses native Web Share API where available, else opens the modal */
function ShareButton({ product, className, label = 'Share', compact }) {
  const [modal, setModal] = useShState(false);
  const onShare = async () => {
    const data = { title: product.name, text: shareMessage(product), url: productUrl(product) };
    if (navigator.share) {
      try {
        await navigator.share(data);
        trackShare(product.id, 'native', 'share');
        return;
      } catch (e) { if (e && e.name === 'AbortError') return; }
    }
    setModal(true);
  };
  return (
    <React.Fragment>
      <button className={className || 'btn btn-outline btn-lg share-btn'} onClick={onShare} aria-label={'Share ' + product.name} title="Share product">
        <Icon name="share" size={compact ? 20 : 18} />{!compact && <span>{label}</span>}
      </button>
      {modal && <ShareModal product={product} onClose={() => setModal(false)} />}
    </React.Fragment>
  );
}

/* SocialMark fallback if not already global (defined in pages-auth) */
if (typeof window.SocialMark === 'undefined') {
  window.SocialMark = function SocialMark({ name, size = 18 }) {
    const d = (window.LIMITRA.SOCIAL_GLYPHS || {})[name];
    if (!d) return null;
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={d} /></svg>;
  };
}

Object.assign(window, { ShareButton, ShareModal, trackShare });
