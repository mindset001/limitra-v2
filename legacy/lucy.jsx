/* LIMITRA, Elo AI shopping assistant (text + image upload / visual search) */
const { useState: useLState, useRef: useLRef, useEffect: useLEffect } = React;

const ELO_MAX_IMAGES = 5;
const ELO_MAX_BYTES = 10 * 1024 * 1024; // 10MB
const ELO_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/* compress an image File to a capped-size data URL (max 1024px long edge) */
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const max = 1024;
      let { width, height } = img;
      if (width > max || height > max) {
        const r = Math.min(max / width, max / height);
        width = Math.round(width * r); height = Math.round(height * r);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode failed')); };
    img.src = url;
  });
}

function EloAI() {
  const { go, addToCart } = useStore();
  const [open, setOpen] = useLState(false);
  const [msgs, setMsgs] = useLState([{ role: 'assistant', text: "Hi, I'm Elo 👋 your Limitra shopping assistant. Ask me anything, or tap the 📎 to upload a photo and I'll find similar products in our store." }]);
  const [input, setInput] = useLState('');
  const [pending, setPending] = useLState([]); // staged images (data URLs) before send
  const [busy, setBusy] = useLState(false);
  const [dragOver, setDragOver] = useLState(false);
  const [err, setErr] = useLState('');
  const bodyRef = useLRef(null);
  const fileRef = useLRef(null);

  useLEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [msgs, open, busy, pending]);

  const suggestions = ['Recommend a phone under ₦400k', 'Best laptop for students', 'Find wireless earbuds', 'Where is my order?'];

  const addFiles = async (fileList) => {
    setErr('');
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const slots = ELO_MAX_IMAGES - pending.length;
    if (slots <= 0) { setErr(`You can attach up to ${ELO_MAX_IMAGES} images.`); return; }
    const next = [];
    for (const f of files.slice(0, slots)) {
      if (!ELO_TYPES.includes(f.type)) { setErr('Unsupported file, use JPG, PNG or WEBP.'); continue; }
      if (f.size > ELO_MAX_BYTES) { setErr('Image too large, max 10MB.'); continue; }
      try { next.push({ src: await compressImage(f), name: f.name }); }
      catch (e) { setErr('Could not read that image, please try another.'); }
    }
    if (next.length) setPending(p => [...p, ...next].slice(0, ELO_MAX_IMAGES));
  };

  const onDrop = (e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files); };

  const onPaste = (e) => {
    const items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    const imgs = [];
    for (const it of items) { if (it.kind === 'file' && it.type.startsWith('image/')) { const f = it.getAsFile(); if (f) imgs.push(f); } }
    if (imgs.length) { e.preventDefault(); addFiles(imgs); }
  };

  const send = async (text) => {
    const q = (text != null ? text : input).trim();
    const imgs = pending;
    if ((!q && imgs.length === 0) || busy) return;
    setInput(''); setPending([]); setErr('');
    setMsgs(m => [...m, { role: 'user', text: q, images: imgs.map(i => i.src) }]);
    setBusy(true);
    try {
      if (window.claude && window.claude.complete) {
        const catalog = L.PRODUCTS.slice(0, 60).map(p => `${p.name}, ${p.brand}, ${(L.CATEGORIES.find(c => c.slug === p.category) || {}).name || p.category}, ${L.naira(p.price)}${p.rating ? `, ${p.rating}★` : ''}`).join('\n');
        const history = msgs.slice(-6).map(m => (m.role === 'user' ? 'Customer' : 'Elo') + ': ' + (m.text || (m.images ? '[shared an image]' : ''))).join('\n');
        const imgNote = imgs.length
          ? `\nThe customer just uploaded ${imgs.length} product image(s). Act as a visual product-search assistant: infer the product type/category, then recommend 2–4 visually-similar items FROM THE CATALOG ONLY, each as "• Name – ₦price". End by offering to show more similar products. Do not describe the raw image in detail; focus on matching store products.`
          : '';
        const prompt = `You are Elo, the warm, knowledgeable shopping assistant for Limitra, a premium Nigerian marketplace. Prices are in Naira (₦). Keep replies short and friendly (2–4 sentences). When recommending, name specific catalog products with prices. For orders/delivery, point to Track Order. Never invent products outside the catalog.${imgNote}

CATALOG:
${catalog}

CONVERSATION SO FAR:
${history}
Customer: ${q || '(image only)'}
Elo:`;
        const res = await window.claude.complete(prompt);
        const out = (typeof res === 'string' ? res : String(res || '')).trim();
        const matched = L.PRODUCTS.filter(p => out.includes(p.name.split(',')[0])).slice(0, 3);
        setMsgs(m => [...m, { role: 'assistant', text: out || "I'm here to help, tell me a little more about what you're looking for.", products: matched.map(p => p.id) }]);
      } else {
        await new Promise(r => setTimeout(r, 700));
        const picks = (imgs.length ? L.PRODUCTS.filter(p => p.bestseller) : L.PRODUCTS.filter(p => p.off > 0)).slice(0, 3);
        const reply = imgs.length
          ? "I found products similar to your photo. Here are the closest matches in our store:"
          : "I'd love to help! Here are a few popular picks you might like:";
        setMsgs(m => [...m, { role: 'assistant', text: reply, products: picks.map(p => p.id) }]);
      }
    } catch (e) {
      setMsgs(m => [...m, { role: 'assistant', text: "Sorry, I had trouble responding just then. Please try again in a moment." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button className={'lucy-fab' + (open ? ' open' : '')} onClick={() => setOpen(o => !o)} aria-label={open ? 'Close Elo' : 'Ask Elo assistant'}>
        {open ? <Icon name="close" size={24} /> : <><span className="lucy-fab-badge"><img src="assets/elo-face.png" alt="" /></span><span className="lucy-fab-text">Ask Elo</span></>}
        {!open && <span className="lucy-pulse" />}
      </button>

      {open && (
        <div className="lucy-panel" role="dialog" aria-label="Elo"
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={e => { if (e.currentTarget === e.target) setDragOver(false); }}
          onPaste={onPaste}
          onDrop={onDrop}>
          <div className="lucy-head">
            <button className="lucy-head-btn" onClick={() => { setMsgs([{ role: 'assistant', text: "Hi, I'm Elo 👋 your Limitra shopping assistant. Ask me anything, or tap the + to upload a photo and I'll find similar products in our store." }]); setPending([]); setErr(''); }} aria-label="Clear chat" title="Clear chat"><Icon name="trash" size={19} /></button>
            <div className="lucy-head-center">
              <span className="lucy-avatar"><span className="lucy-av-text">Elo</span></span>
              <b>Shop with Elo</b>
            </div>
            <button className="lucy-head-btn" onClick={() => setOpen(false)} aria-label="Close"><Icon name="close" size={20} /></button>
          </div>

          <div className="lucy-body" ref={bodyRef}>
            {msgs.map((m, i) => (
              <div key={i} className={'lucy-msg ' + m.role}>
                {m.role === 'assistant' && <span className="lucy-msg-av"><span className="lucy-av-text sm">Elo</span></span>}
                {m.role === 'user' && <span className="lucy-msg-av user"><span className="lucy-av-text sm">{L.USER.initials}</span></span>}
                <div className="lucy-bubble">
                  {m.images && m.images.length > 0 && (
                    <div className={'lucy-msg-imgs n' + Math.min(m.images.length, 3)}>
                      {m.images.map((src, j) => <img key={j} src={src} alt="shared" />)}
                    </div>
                  )}
                  {m.text && <span>{m.text}</span>}
                  {m.products && m.products.length > 0 && (
                    <div className="lucy-cards">
                      {m.products.map(pid => { const p = L.byId(pid); if (!p) return null; return (
                        <div className="lucy-card" key={pid}>
                          <div className="lucy-card-thumb" onClick={() => { go('product', p.slug || p.id); setOpen(false); }}><Thumb product={p} src={REAL_IMG[p.id]} /></div>
                          <div className="lucy-card-info">
                            <b>{p.name}</b>
                            <span className="lucy-card-price">{naira(p.price)}</span>
                          </div>
                          <button className="lucy-card-cta" onClick={() => { addToCart(p, {}, 1); }}><Icon name="cart" size={15} /> Add to cart</button>
                        </div>
                      ); })}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <div className="lucy-msg assistant">
                <span className="lucy-msg-av"><span className="lucy-av-text sm">Elo</span></span>
                <div className="lucy-bubble typing">{pending.length || msgs[msgs.length - 1]?.images ? <span className="lucy-analyzing"><span className="lucy-spin" /> Analysing image…</span> : <><i /><i /><i /></>}</div>
              </div>
            )}
          </div>

          {dragOver && <div className="lucy-dropzone"><Icon name="download" size={28} /> Drop image to upload</div>}

          {msgs.length <= 1 && pending.length === 0 && (
            <div className="lucy-sugg">
              {suggestions.map(s => <button key={s} onClick={() => send(s)}>{s}</button>)}
            </div>
          )}

          {pending.length > 0 && (
            <div className="lucy-previews">
              {pending.map((p, i) => (
                <div className="lucy-prev" key={i}>
                  <img src={p.src} alt={p.name} />
                  <button className="lucy-prev-x" onClick={() => setPending(arr => arr.filter((_, j) => j !== i))} aria-label="Remove image"><Icon name="close" size={12} stroke={3} /></button>
                </div>
              ))}
            </div>
          )}
          {err && <div className="lucy-err">{err}</div>}

          <form className="lucy-input" onSubmit={e => { e.preventDefault(); send(); }}>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple capture="environment" hidden onChange={e => { addFiles(e.target.files); e.target.value = ''; }} />
            <button type="button" className="lucy-attach" onClick={() => fileRef.current && fileRef.current.click()} aria-label="Upload image" title="Upload image"><Icon name="plus" size={22} /></button>
            <input className="lucy-text" placeholder="Ask Elo, or upload a photo…" value={input} onChange={e => setInput(e.target.value)} />
            <button type="submit" className="lucy-send" disabled={(!input.trim() && pending.length === 0) || busy} aria-label="Send"><Icon name="arrowr" size={18} /></button>
          </form>
        </div>
      )}
    </>
  );
}

Object.assign(window, { EloAI, LucyAI: EloAI });
