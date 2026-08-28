/* LIMITRA, Video content system: hub, featured, reels feed, player, product videos */
const { useState: useVState, useEffect: useVEffect, useRef: useVRef } = React;

/* ---- video catalog (poster images reuse existing assets; no real mp4 needed) ----
   Each: id, title, desc, cat, poster, duration, views, likes, vertical?, productIds[] */
const VID_POSTER = {
  v1: 'assets/img/hero-tech.jpg', v2: 'assets/img/hero-audio.jpg', v3: 'assets/img/hero-fashion.jpg',
  v4: 'assets/img/hero-cosmetics.jpg', v5: 'assets/img/cat-01.jpg', v6: 'assets/img/cat-02.jpg',
  v7: 'assets/img/cat-03.jpg', v8: 'assets/img/hero-editorial.jpg', v9: 'assets/img/hero-shop3d.png',
};

const VIDEOS = [
  { id: 'v1', title: 'Apex 14 Pro, Full Demo', desc: 'Everything the new flagship can do, in 90 seconds.', cat: 'Demos', dur: '1:32', views: 48200, likes: 3120, vertical: false, products: ['p1', 'p12'] },
  { id: 'v2', title: 'Aura Pro ANC, Unboxing', desc: 'First look at our best-selling noise-cancelling headphones.', cat: 'Unboxing', dur: '2:08', views: 31900, likes: 2740, vertical: true, products: ['p10'] },
  { id: 'v3', title: 'Styling the New Season Drop', desc: 'Three looks, three ways, fresh fashion picks.', cat: 'Lookbook', dur: '0:48', views: 64500, likes: 5210, vertical: true, products: [] },
  { id: 'v4', title: 'Glow Routine with Lumière', desc: 'A simple 4-step skincare routine our customers love.', cat: 'How-to', dur: '1:15', views: 27300, likes: 1980, vertical: true, products: [] },
  { id: 'v5', title: 'Why Shoppers Love Limitra', desc: 'Real customers share their delivery experience.', cat: 'Reviews', dur: '1:54', views: 18400, likes: 1450, vertical: false, products: [] },
  { id: 'v6', title: 'BoomBox Speaker, Sound Test', desc: 'Hear it before you buy it. Bass you can feel.', cat: 'Demos', dur: '1:02', views: 22100, likes: 1670, vertical: true, products: [] },
  { id: 'v7', title: 'Power Up, Laptop Setup Guide', desc: 'Set up your new workstation in minutes.', cat: 'How-to', dur: '3:21', views: 14800, likes: 980, vertical: false, products: [] },
  { id: 'v8', title: 'The Limitra Story', desc: 'How we became Nigeria’s premium marketplace.', cat: 'Brand', dur: '2:40', views: 39600, likes: 4100, vertical: false, products: [] },
  { id: 'v9', title: 'Flash Sale, Don’t Miss Out', desc: 'Up to 40% off this week only.', cat: 'Promo', dur: '0:30', views: 71200, likes: 6240, vertical: true, products: [] },
];

const VID_CATS = ['All', 'Demos', 'Unboxing', 'Reviews', 'How-to', 'Lookbook', 'Brand', 'Promo'];
const fmtViews = (n) => n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'K' : '' + n;
window.LIMITRA_VIDEOS = VIDEOS;

/* ---- simulated player: poster + animated progress (no real media files) ---- */
function VideoStage({ video, vertical, autoplay }) {
  const [playing, setPlaying] = useVState(!!autoplay);
  const [progress, setProgress] = useVState(0);
  useVEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setProgress(p => (p >= 100 ? 0 : p + 0.6)), 80);
    return () => clearInterval(id);
  }, [playing]);
  return (
    <div className={'vstage' + (vertical ? ' vertical' : '')} onClick={() => setPlaying(p => !p)}>
      <img src={VID_POSTER[video.id]} alt={video.title} className={'vstage-poster' + (playing ? ' playing' : '')} />
      <div className="vstage-scrim" />
      {!playing && <button className="vstage-play" aria-label="Play"><Icon name="play" size={30} fill="currentColor" /></button>}
      {playing && <span className="vstage-live"><Icon name="pause" size={13} fill="currentColor" /> Playing</span>}
      <div className="vstage-bar"><span style={{ width: progress + '%' }} /></div>
    </div>
  );
}

/* ---- product tag chips shown over a video ---- */
function VideoProductTags({ ids, onShop }) {
  const { addToCart, toast } = useStore();
  const prods = (ids || []).map(id => L.byId(id)).filter(Boolean);
  if (!prods.length) return null;
  return (
    <div className="vtags">
      {prods.map(p => (
        <div className="vtag" key={p.id}>
          <span className="vtag-thumb"><Thumb product={p} src={REAL_IMG[p.id]} /></span>
          <div className="vtag-info"><b>{p.name}</b><span>{naira(p.price)}</span></div>
          <button className="vtag-cta" onClick={() => { addToCart(p, {}, 1); toast('Added to cart'); }}><Icon name="cart" size={14} /> Shop</button>
        </div>
      ))}
    </div>
  );
}

/* ---- lightbox player for hub/featured ---- */
function VideoModal({ video, onClose }) {
  const { go } = useStore();
  useVEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey); document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);
  return (
    <div className="vmodal-overlay" onMouseDown={onClose}>
      <div className="vmodal" onMouseDown={e => e.stopPropagation()}>
        <button className="vmodal-x" onClick={onClose} aria-label="Close"><Icon name="close" size={20} /></button>
        <VideoStage video={video} />
        <div className="vmodal-info">
          <span className="vcat-pill">{video.cat}</span>
          <h3>{video.title}</h3>
          <p className="muted">{video.desc}</p>
          <div className="vmodal-meta"><span><Icon name="eye" size={14} /> {fmtViews(video.views)} views</span><span><Icon name="heart" size={14} /> {fmtViews(video.likes)}</span><span>{video.dur}</span></div>
          <VideoProductTags ids={video.products} />
          <div className="vmodal-actions">
            <VideoShare video={video} />
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoShare({ video, compact }) {
  const { toast } = useStore();
  const url = location.origin + location.pathname + '#/videos';
  const msg = `Watch "${video.title}" on Limitra, ${url}`;
  const enc = encodeURIComponent;
  const opts = [
    ['whatsapp', 'WhatsApp', `https://wa.me/?text=${enc(msg)}`],
    ['facebook', 'Facebook', `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`],
    ['x', 'X', `https://twitter.com/intent/tweet?text=${enc(msg)}`],
    ['instagram', 'Instagram', 'https://www.instagram.com/', true],
    ['tiktok', 'TikTok', 'https://www.tiktok.com/', true],
  ];
  return (
    <div className="vshare">
      {opts.map(([k, label, href, copyFirst]) => (
        <button key={k} className={'vshare-btn ' + k} title={'Share on ' + label} onClick={async () => { if (copyFirst) { try { await navigator.clipboard.writeText(url); toast('Link copied, paste it in ' + label); } catch (e) {} } window.open(href, '_blank', 'noopener'); window.trackShare && window.trackShare(video.id, k, 'video-share'); }}>
          <SocialMark name={label === 'X' ? 'X' : label} size={16} />
        </button>
      ))}
      <button className="vshare-btn copy" title="Copy link" onClick={async () => { try { await navigator.clipboard.writeText(url); } catch (e) {} toast('Video link copied'); }}><Icon name="copy" size={16} /></button>
    </div>
  );
}

/* ---- video card (hub grid) ---- */
function VideoCard({ video, onOpen }) {
  return (
    <button className="vcard" onClick={() => onOpen(video)}>
      <div className="vcard-thumb">
        <img src={VID_POSTER[video.id]} alt={video.title} />
        <span className="vcard-play"><Icon name="play" size={20} fill="currentColor" /></span>
        <span className="vcard-dur">{video.dur}</span>
        {video.products.length > 0 && <span className="vcard-shop"><Icon name="bag" size={11} /> Shoppable</span>}
      </div>
      <div className="vcard-body">
        <span className="vcat-pill sm">{video.cat}</span>
        <b>{video.title}</b>
        <small className="muted"><Icon name="eye" size={12} /> {fmtViews(video.views)} views</small>
      </div>
    </button>
  );
}

/* ---- short-form vertical reels feed ---- */
function Reel({ video, liked, onLike }) {
  const ref = useVRef(null);
  const [inView, setInView] = useVState(false);
  useVEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((es) => es.forEach(e => setInView(e.isIntersecting && e.intersectionRatio > 0.6)), { threshold: [0, 0.6, 1] });
    io.observe(el); return () => io.disconnect();
  }, []);
  return (
    <div className="reel" ref={ref}>
      <VideoStage video={video} vertical autoplay={inView} key={video.id + (inView ? '-on' : '-off')} />
      <div className="reel-overlay">
        <div className="reel-info">
          <span className="vcat-pill">{video.cat}</span>
          <b>{video.title}</b>
          <p>{video.desc}</p>
          <VideoProductTags ids={video.products} />
        </div>
        <div className="reel-rail">
          <button className={'reel-act' + (liked ? ' on' : '')} onClick={() => onLike(video.id)}>
            <Icon name="heart" size={24} fill={liked ? 'currentColor' : 'none'} /><small>{fmtViews(video.likes + (liked ? 1 : 0))}</small>
          </button>
          <VideoShare video={video} />
        </div>
      </div>
    </div>
  );
}

function ReelsFeed({ onClose, startId }) {
  const reels = VIDEOS.filter(v => v.vertical);
  const [liked, setLiked] = useVState({});
  const scrollRef = useVRef(null);
  useVEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey); document.body.style.overflow = 'hidden';
    // scroll to the starting reel
    const el = scrollRef.current;
    if (el && startId) {
      const i = reels.findIndex(v => v.id === startId);
      if (i > 0) el.scrollTop = el.clientHeight * i;
    }
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);
  return (
    <div className="reels-overlay">
      <button className="reels-x" onClick={onClose} aria-label="Close"><Icon name="close" size={22} /></button>
      <div className="reels-scroll" ref={scrollRef}>
        {reels.map(v => (
          <Reel key={v.id} video={v} liked={!!liked[v.id]} onLike={(id) => setLiked(l => ({ ...l, [id]: !l[id] }))} />
        ))}
      </div>
    </div>
  );
}

/* ---- Videos hub page ---- */
function VideosPage() {
  const [cat, setCat] = useVState('All');
  const [modal, setModal] = useVState(null);
  const [reels, setReels] = useVState(null);
  const list = cat === 'All' ? VIDEOS : VIDEOS.filter(v => v.cat === cat);
  const reelCount = VIDEOS.filter(v => v.vertical).length;
  return (
    <div className="page page-fade">
      <section className="vhub-hero">
        <div className="wrap">
          <span className="badge badge-soft" style={{ marginBottom: 14 }}><Icon name="video" size={14} /> Limitra Videos</span>
          <h1>See it. Love it. Shop it.</h1>
          <p className="muted">Product demos, unboxings, reviews and how-to guides, tap any product tag to shop while you watch.</p>
          <div className="vhub-cta">
            <button className="btn btn-primary btn-lg" onClick={() => setReels({ start: null })}><Icon name="play" size={18} fill="currentColor" /> Watch Reels</button>
            <span className="vhub-reelcount">{reelCount} short videos</span>
          </div>
        </div>
      </section>
      <div className="wrap">
        <div className="vcat-tabs">
          {VID_CATS.map(c => <button key={c} className={'vcat-tab' + (cat === c ? ' on' : '')} onClick={() => setCat(c)}>{c}</button>)}
        </div>
        <div className="vgrid">
          {list.map(v => <VideoCard key={v.id} video={v} onOpen={v.vertical ? () => setReels({ start: v.id }) : setModal} />)}
        </div>
      </div>
      {modal && <VideoModal video={modal} onClose={() => setModal(null)} />}
      {reels && <ReelsFeed startId={reels.start} onClose={() => setReels(null)} />}
    </div>
  );
}

/* ---- homepage featured video ---- */
function HighlightCard({ video, onOpen }) {
  const [hover, setHover] = useVState(false);
  const [prog, setProg] = useVState(0);
  useVEffect(() => {
    if (!hover) { setProg(0); return; }
    const id = setInterval(() => setProg(p => (p >= 100 ? 0 : p + 1.2)), 80);
    return () => clearInterval(id);
  }, [hover]);
  return (
    <button className={'vhl' + (hover ? ' playing' : '')} onClick={onOpen} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="vhl-media">
        <img src={VID_POSTER[video.id]} alt={video.title} className="vhl-img" />
        <span className="vhl-scrim" />
        <span className="vhl-play">{hover ? <Icon name="pause" size={16} fill="currentColor" /> : <Icon name="play" size={18} fill="currentColor" />}</span>
        <span className="vcat-pill sm vhl-cat">{video.cat}</span>
        <span className="vcard-dur">{video.dur}</span>
        {hover && <span className="vhl-bar"><span style={{ width: prog + '%' }} /></span>}
      </div>
      <div className="vhl-body">
        <b>{video.title}</b>
        <small className="muted"><Icon name="eye" size={12} /> {fmtViews(video.views)} views · <Icon name="heart" size={12} /> {fmtViews(video.likes)}</small>
      </div>
    </button>
  );
}

function FeaturedVideo() {
  const { go } = useStore();
  const [modal, setModal] = useVState(null);
  const v = VIDEOS.find(x => x.id === 'v8');
  return (
    <section className="sec" style={{ paddingTop: 40 }}>
      <div className="wrap">
        <div className="fvideo">
          <div className="fvideo-media" onClick={() => setModal(v)}>
            <img src={VID_POSTER[v.id]} alt={v.title} />
            <span className="fvideo-scrim" />
            <button className="fvideo-play" aria-label="Play video"><Icon name="play" size={34} fill="currentColor" /></button>
            <span className="vcard-dur">{v.dur}</span>
          </div>
          <div className="fvideo-body">
            <span className="eyebrow">Featured · {v.cat}</span>
            <h2>{v.title}</h2>
            <p className="muted">{v.desc} Get to know the people and promise behind every order.</p>
            <div className="fvideo-actions">
              <button className="btn btn-primary btn-lg" onClick={() => setModal(v)}><Icon name="play" size={18} fill="currentColor" /> Watch now</button>
              <button className="btn btn-outline btn-lg" onClick={() => go('videos')}>Browse all videos</button>
            </div>
          </div>
        </div>
        <div className="vhighlights">
          {VIDEOS.filter(x => x.id !== 'v8').slice(0, 3).map(hv => (
            <HighlightCard key={hv.id} video={hv} onOpen={() => setModal(hv)} />
          ))}
        </div>
      </div>
      {modal && <VideoModal video={modal} onClose={() => setModal(null)} />}
    </section>
  );
}

Object.assign(window, { VideosPage, FeaturedVideo, VideoModal, ReelsFeed, VIDEOS, VID_POSTER, fmtViews });
