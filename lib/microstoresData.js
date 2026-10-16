/* Demo content for the MicroStores directory + individual storefront pages.
   There is no stores/microstores backend yet (confirmed: /stores, /microstores,
   /admin/stores and /admin/microstores all 404 live) — same situation the
   Affiliate dashboard shipped in before it had a backend. This is illustrative
   content only, not real sellers or real purchasable products: product tiles
   built from this data don't add to cart or link to a real product page (see
   MsProductTile/MsListTile in MicroStorePage.jsx) — only real catalog items
   (lib/data.js) do that. The shape (price/was/off/rating/reviews/stock/brand)
   deliberately matches lib/data.js products so MicroStorePage can reuse
   ShopPage's real FilterPanel/pagerList/priceSort instead of rebuilding them. */

const TINTS = [
  ['rgba(4,56,182,.12)', 'rgba(4,56,182,.04)'],
  ['rgba(246,114,8,.14)', 'rgba(246,114,8,.05)'],
  ['rgba(16,122,69,.12)', 'rgba(16,122,69,.04)'],
  ['rgba(142,85,230,.12)', 'rgba(142,85,230,.04)'],
  ['rgba(229,72,77,.12)', 'rgba(229,72,77,.04)'],
  ['rgba(201,137,10,.12)', 'rgba(201,137,10,.04)'],
];
const tint = (i) => TINTS[i % TINTS.length];

const MICROSTORES = [
  {
    slug: 'megagaming', name: 'Mega Gaming Essentials', color: '#14181F',
    tagline: 'Trendy. Affordable. Available.',
    description: 'Your one true shop to get gaming gadgets of your choice.',
    location: 'Lagos', rating: 4.8, reviews: 124, verified: true,
    tags: ['Gaming', 'Digital'],
    products: [
      { id: 1, name: 'Classic Gaming Headset', brand: 'HyperX', price: 64900, was: 108000, off: 40, rating: 4.8, reviews: 34, stock: 18, badge: 'best', category: 'electronics', desc: 'Comfortable over-ear design built for long gaming sessions.' },
      { id: 2, name: 'Mechanical Keyboard RGB', brand: 'SteelSeries', price: 48500, was: 0, off: 0, rating: 4.6, reviews: 21, stock: 12, badge: 'new', category: 'electronics', desc: 'Clicky switches with per-key RGB lighting.' },
      { id: 3, name: 'Pro Gaming Mouse', brand: 'Logitech', price: 22000, was: 29000, off: 24, rating: 4.7, reviews: 58, stock: 30, badge: null, category: 'electronics', desc: 'Lightweight shell with a high-precision sensor.' },
      { id: 4, name: 'Streaming Webcam 1080p', brand: 'Logitech', price: 35500, was: 0, off: 0, rating: 4.5, reviews: 12, stock: 4, badge: 'new', category: 'electronics', desc: 'Crisp 1080p video for streaming and calls.' },
      { id: 5, name: 'Console Controller', brand: 'HyperX', price: 29900, was: 36000, off: 17, rating: 4.9, reviews: 90, stock: 22, badge: 'best', category: 'electronics', desc: 'Responsive triggers with a textured grip.' },
      { id: 6, name: 'Gaming Laptop Sleeve', brand: 'SteelSeries', price: 12000, was: 0, off: 0, rating: 4.3, reviews: 8, stock: 0, badge: null, category: 'electronics', desc: 'Padded protection for 15-inch laptops.' },
    ],
  },
  {
    slug: 'glowbeauty', name: 'Glow Beauty Hub', color: '#E0457B',
    tagline: 'Skincare & glow essentials.',
    description: 'Authentic beauty picks curated for every skin tone and budget.',
    location: 'Abuja', rating: 4.9, reviews: 212, verified: true,
    tags: ['Beauty', 'Skincare'],
    products: [
      { id: 7, name: 'Vitamin C Serum', brand: 'GlowLab', price: 18500, was: 24000, off: 23, rating: 4.8, reviews: 140, stock: 40, badge: 'best', category: 'beauty', desc: 'Brightening serum for an even, radiant tone.' },
      { id: 8, name: 'Matte Lipstick Set', brand: 'PureSkin', price: 15000, was: 0, off: 0, rating: 4.6, reviews: 67, stock: 25, badge: 'new', category: 'beauty', desc: 'Four long-wear shades for everyday looks.' },
      { id: 9, name: 'Eyeshadow Palette', brand: 'GlowLab', price: 21000, was: 27500, off: 24, rating: 4.7, reviews: 52, stock: 15, badge: null, category: 'beauty', desc: 'Twelve blendable shades, matte and shimmer.' },
      { id: 10, name: 'Hydrating Face Mist', brand: 'PureSkin', price: 9500, was: 0, off: 0, rating: 4.4, reviews: 19, stock: 0, badge: null, category: 'beauty', desc: 'A light mist for an instant refresh.' },
      { id: 11, name: 'Perfume Oil — Amber', brand: 'GlowLab', price: 26000, was: 32000, off: 19, rating: 4.9, reviews: 88, stock: 10, badge: 'best', category: 'beauty', desc: 'A warm, long-lasting amber fragrance.' },
    ],
  },
  {
    slug: 'chinedustore', name: "Chinedu's Tech Store", color: '#0438B6',
    tagline: 'Phones, accessories & more.',
    description: 'Verified phones and accessories, sourced and checked before listing.',
    location: 'Lagos', rating: 4.7, reviews: 96, verified: true,
    tags: ['Phones', 'Accessories'],
    products: [
      { id: 12, name: 'Fast Wireless Charger', brand: 'Anker', price: 14500, was: 0, off: 0, rating: 4.5, reviews: 30, stock: 20, badge: 'new', category: 'phones', desc: '15W fast charging, case-friendly design.' },
      { id: 13, name: 'Tempered Glass Screen Protector', brand: 'Baseus', price: 3500, was: 5000, off: 30, rating: 4.6, reviews: 110, stock: 60, badge: null, category: 'phones', desc: '9H hardness, edge-to-edge coverage.' },
      { id: 14, name: 'Phone Case — Clear Armor', brand: 'Baseus', price: 6500, was: 0, off: 0, rating: 4.4, reviews: 44, stock: 35, badge: null, category: 'phones', desc: 'Shockproof corners, stays crystal clear.' },
      { id: 15, name: '20000mAh Power Bank', brand: 'Anker', price: 23000, was: 29000, off: 21, rating: 4.8, reviews: 76, stock: 5, badge: 'best', category: 'phones', desc: 'Dual-port fast charging for multi-day trips.' },
    ],
  },
  {
    slug: 'adahome', name: "Ada's Home Essentials", color: '#C9890A',
    tagline: 'For a cozier home.',
    description: 'Curated kitchen, living and decor pieces that just work.',
    location: 'Port Harcourt', rating: 4.6, reviews: 58, verified: false,
    tags: ['Home & Living'],
    products: [
      { id: 16, name: '3-Seater Sofa Cover', brand: 'HomeCraft', price: 32000, was: 0, off: 0, rating: 4.3, reviews: 14, stock: 9, badge: null, category: 'home', desc: 'Stretch-fit cover, machine washable.' },
      { id: 17, name: 'Non-Stick Cookware Set', brand: 'KitchenPro', price: 45000, was: 58000, off: 22, rating: 4.7, reviews: 41, stock: 14, badge: 'best', category: 'home', desc: 'Five-piece set built for everyday cooking.' },
      { id: 18, name: 'Blender & Grinder Combo', brand: 'KitchenPro', price: 27500, was: 0, off: 0, rating: 4.5, reviews: 22, stock: 0, badge: 'new', category: 'home', desc: 'Two jars, one motor, kitchen-counter friendly.' },
      { id: 19, name: 'Table Lamp — Warm White', brand: 'HomeCraft', price: 11000, was: 14500, off: 24, rating: 4.4, reviews: 9, stock: 17, badge: null, category: 'home', desc: 'Soft warm light for reading corners.' },
    ],
  },
  {
    slug: 'amara', name: "Amara's MicroStore", color: '#F67208',
    tagline: 'Phones, beauty & bags, curated.',
    description: 'My personal picks across phones, beauty and bags — all from Limitra.',
    location: 'Lagos', rating: 4.8, reviews: 73, verified: true,
    tags: ['Phones', 'Beauty', 'Bags'],
    products: [
      { id: 20, name: 'iPhone 15 (128GB)', brand: 'Apple', price: 680000, was: 0, off: 0, rating: 4.9, reviews: 54, stock: 6, badge: 'best', category: 'phones', desc: 'The latest iPhone, sealed and verified.' },
      { id: 21, name: 'Signature Perfume 50ml', brand: 'Amara Picks', price: 72000, was: 0, off: 0, rating: 4.7, reviews: 38, stock: 11, badge: null, category: 'beauty', desc: 'My go-to everyday fragrance.' },
      { id: 22, name: 'Leather Tote Bag', brand: 'Amara Picks', price: 48000, was: 60000, off: 20, rating: 4.6, reviews: 27, stock: 8, badge: 'new', category: 'fashion', desc: 'Roomy, durable, goes with everything.' },
      { id: 23, name: 'Ankle Strap Heels', brand: 'Amara Picks', price: 35000, was: 0, off: 0, rating: 4.5, reviews: 16, stock: 0, badge: null, category: 'fashion', desc: 'Comfortable heel height for all-day wear.' },
    ],
  },
  {
    slug: 'tundefashion', name: "Tunde's Fashion House", color: '#107A45',
    tagline: 'Menswear with an edge.',
    description: 'Shirts, trousers and accessories for the modern man.',
    location: 'Ibadan', rating: 4.5, reviews: 39, verified: false,
    tags: ["Men's Fashion"],
    products: [
      { id: 24, name: 'Slim Fit Oxford Shirt', brand: 'Tunde Signature', price: 16500, was: 21000, off: 21, rating: 4.4, reviews: 20, stock: 13, badge: null, category: 'fashion', desc: 'Breathable cotton, tailored slim fit.' },
      { id: 25, name: 'Chino Trousers', brand: 'Tunde Signature', price: 19000, was: 0, off: 0, rating: 4.3, reviews: 11, stock: 10, badge: 'new', category: 'fashion', desc: 'Versatile fit for work or weekend.' },
      { id: 26, name: 'Leather Belt', brand: 'Tunde Signature', price: 9500, was: 0, off: 0, rating: 4.6, reviews: 15, stock: 19, badge: null, category: 'fashion', desc: 'Genuine leather with a brushed buckle.' },
    ],
  },
];

MICROSTORES.forEach(s => { s.products.forEach((p, i) => { p.tint = tint(i); }); });

const storeBySlug = (slug) => MICROSTORES.find(s => s.slug === slug);

export { MICROSTORES, storeBySlug };
