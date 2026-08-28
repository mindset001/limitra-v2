/* LIMITRA icon set, feather-style line icons (24px grid) — ported from legacy/icons.jsx */
const I = {
  search:   'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-3.2-3.2',
  cart:     'M3 4h2l2.2 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.2L21 7H6M9 21a1 1 0 1 0 .01 0M18 21a1 1 0 1 0 .01 0',
  heart:    'M12 20s-7.5-4.7-9.5-9C1.1 8 2.5 5 5.5 5 7.5 5 9 6.2 12 9c3-2.8 4.5-4 6.5-4 3 0 4.4 3 3 6-2 4.3-9.5 9-9.5 9z',
  user:     'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 20a7 7 0 0 1 14 0',
  location: 'M12 21s-6.5-5.6-6.5-10.5A6.5 6.5 0 0 1 12 4a6.5 6.5 0 0 1 6.5 6.5C18.5 15.4 12 21 12 21zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  chevdown: 'M6 9l6 6 6-6',
  chevright:'M9 6l6 6-6 6',
  chevleft: 'M15 6l-6 6 6 6',
  chevup:   'M6 15l6-6 6 6',
  arrowr:   'M5 12h14M13 6l6 6-6 6',
  plus:     'M12 5v14M5 12h14',
  minus:    'M5 12h14',
  star:     'M12 3.5l2.6 5.3 5.9.8-4.3 4.1 1 5.8L12 17l-5.2 2.8 1-5.8L3.5 9.6l5.9-.8z',
  filter:   'M3 5h18M6 12h12M10 19h4',
  sort:     'M3 6h12M3 12h9M3 18h5M17 8V4m0 0l-3 3m3-3l3 3',
  grid:     'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  trash:    'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  check:    'M5 12l5 5L20 6',
  close:    'M6 6l12 12M18 6L6 18',
  menu:     'M4 7h16M4 12h16M4 17h16',
  sun:      'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 2v2M12 20v2M4 12H2M22 12h-2M5 5L3.5 3.5M20.5 20.5L19 19M19 5l1.5-1.5M3.5 20.5L5 19',
  moon:     'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  truck:    'M3 6h11v9H3zM14 9h4l3 3v3h-7M7 18a1.5 1.5 0 1 0 .01 0M18 18a1.5 1.5 0 1 0 .01 0',
  shield:   'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  refresh:  'M3 12a9 9 0 0 1 15-6.7L21 8M21 4v4h-4M21 12a9 9 0 0 1-15 6.7L3 16M3 20v-4h4',
  tag:      'M3 12V4h8l10 10-8 8L3 12zM7.5 7.5h.01',
  package:  'M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9',
  headset:  'M4 13v-1a8 8 0 0 1 16 0v1M4 13a2 2 0 0 1 2 2v2a2 2 0 0 1-4 0v-2a2 2 0 0 1 2-2zM20 13a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2zM18 19a3 3 0 0 1-3 3h-3',
  chat:     'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12z',
  gift:     'M4 11h16v9H4zM4 7h16v4H4zM12 7v13M12 7S11 3 8.5 3 6 6 6 7M12 7s1-4 3.5-4S18 6 18 7',
  flame:    'M12 22a6 6 0 0 0 6-6c0-4-3-5-3-9 0 0-4 2-4 6 0-2-2-3-2-3s-3 2-3 6a6 6 0 0 0 6 6z',
  eye:      'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  bag:      'M6 8h12l-1 12H7zM9 8V6a3 3 0 0 1 6 0v2',
  zoom:     'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-3.2-3.2M11 8v6M8 11h6',
  mail:     'M3 5h18v14H3zM3 6l9 7 9-7',
  lock:     'M6 11h12v9H6zM9 11V8a3 3 0 0 1 6 0v3',
  phone:    'M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
  pin:      'M12 21s-6.5-5.6-6.5-10.5A6.5 6.5 0 0 1 12 4a6.5 6.5 0 0 1 6.5 6.5C18.5 15.4 12 21 12 21zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  edit:     'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
  card:     'M3 6h18v12H3zM3 10h18M7 15h4',
  dollar:   'M12 2v20M16 6.5C16 4.5 14 4 12 4S8 4.5 8 6.5 10 9 12 9s4 .5 4 2.5S14 14 12 14s-4-.5-4-2.5',
  clock:    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  info:     'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01',
  spark:    'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2',
  store:    'M4 9l1-5h14l1 5M4 9h16v11H4zM4 9a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0M10 20v-5h4v5',
  shirt:    'M8.5 4L4 6.5l1.8 3.5L8 9v11h8V9l2.2 1L20 6.5 15.5 4a3.5 3.5 0 0 1-7 0z',
  makeup:   'M9.5 21h5v-9h-5zM10.5 12V8l3.2-4 1.3 1-2.5 3.4V12',
  hair:     'M7 4c-1.2 5-1.2 11 .6 16M12 4c-.2 5-.2 11 0 16M17 4c1.2 5 1.2 11-.6 16',
  list:     'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  download: 'M12 3v12M7 10l5 5 5-5M5 21h14',
  share:    'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.6 13.5l6.8 3.5M15.4 7l-6.8 3.5',
  copy:     'M9 9h11v11H9zM5 15H4V4h11v1',
  play:     'M7 4l13 8-13 8z',
  pause:    'M8 5h3v14H8zM13 5h3v14h-3z',
  video:    'M3 6h13v12H3zM16 10l5-3v10l-5-3',
  volume:   'M4 9h4l5-4v14l-5-4H4zM17 8a5 5 0 0 1 0 8',
  mute:     'M4 9h4l5-4v14l-5-4H4zM22 9l-6 6M16 9l6 6',
  telegram: 'M21.5 4.3L2.5 11.2c-.9.3-.9 1.5 0 1.8l4.8 1.6 1.9 5.7c.3.8 1.3 1 1.9.4l2.6-2.5 4.7 3.5c.7.5 1.7.1 1.9-.7L23 5.6c.2-1-.7-1.7-1.5-1.3zM9.5 14.5l8-5-6.5 6.2-.2 3z',
  paperclip: 'M21 11.5l-8.5 8.5a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4l7.8-7.8',
  bell:     'M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
};

export function Icon({ name, size = 20, stroke = 2, fill = 'none', className = '', style = {} }) {
  const d = I[name] || '';
  const solid = fill !== 'none';
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24"
      fill={solid ? fill : 'none'} stroke={solid ? 'none' : 'currentColor'}
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
      {d.split('M').filter(Boolean).map((seg, i) => <path key={i} d={'M' + seg} />)}
    </svg>
  );
}

export function Logo({ height = 30, color, white }) {
  const isWhite = white || color === '#fff' || color === '#FFFFFF' || color === 'white';
  return (
    <span className={'lim-logo' + (isWhite ? ' force-dark' : '')} style={{ display: 'inline-block', height: height, lineHeight: 0 }}>
      <img className="lim-logo-light" src="/assets/logo.png" alt="Limitra" style={{ height: height }} />
      <img className="lim-logo-dark" src="/assets/logo-dark.png" alt="Limitra" style={{ height: height }} />
    </span>
  );
}
