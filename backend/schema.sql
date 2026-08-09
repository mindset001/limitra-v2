-- Limitra — sample PostgreSQL schema (starter, derived from HANDOFF.md Appendix A)
-- Money stored as integer Naira (no kobo). Adjust to your stack/conventions.

CREATE TYPE user_role     AS ENUM ('customer','affiliate','manager','customer_support','affiliate_manager','super_admin');
CREATE TYPE acct_status   AS ENUM ('active','suspended');
CREATE TYPE order_status  AS ENUM ('pending','processing','shipped','delivered','cancelled','refunded');
CREATE TYPE ref_status    AS ENUM ('pending','completed','cancelled');
CREATE TYPE aff_status    AS ENUM ('pending','approved','suspended');
CREATE TYPE wd_status     AS ENUM ('pending','approved','processing','paid','rejected');

CREATE TABLE users (
  id            BIGSERIAL PRIMARY KEY,
  full_name     TEXT NOT NULL,
  email         CITEXT UNIQUE NOT NULL,
  phone         TEXT,
  password_hash TEXT NOT NULL,
  role          user_role NOT NULL DEFAULT 'customer',
  status        acct_status NOT NULL DEFAULT 'active',
  lim_cash      INTEGER NOT NULL DEFAULT 0,          -- referral credit balance
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE addresses (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users ON DELETE CASCADE,
  label       TEXT, recipient_name TEXT NOT NULL, phone TEXT,
  street      TEXT NOT NULL, city TEXT NOT NULL, state TEXT NOT NULL,
  is_default  BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE cards (                                 -- store gateway token, never the PAN
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users ON DELETE CASCADE,
  brand TEXT, last4 CHAR(4), exp_mm_yy CHAR(5),
  gateway_token TEXT NOT NULL, is_default BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE categories (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_slug TEXT REFERENCES categories(slug),
  icon TEXT, sort_order INT DEFAULT 0,
  age_gated BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE products (
  id            BIGSERIAL PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  brand         TEXT,
  category_slug TEXT REFERENCES categories(slug),
  subcategory_slug TEXT REFERENCES categories(slug),
  price         INTEGER NOT NULL,
  compare_at    INTEGER,                              -- "was" price; sale when > price
  rating        NUMERIC(2,1) DEFAULT 0,
  review_count  INTEGER DEFAULT 0,
  badges        TEXT[] DEFAULT '{}',                  -- hot|sale|new
  is_bestseller BOOLEAN DEFAULT false,
  stock         INTEGER NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'active',       -- active|draft|out_of_stock
  description   TEXT,
  specs         JSONB DEFAULT '[]',                   -- [{key,value}]
  images        TEXT[] DEFAULT '{}',
  variants      JSONB DEFAULT '{}',                   -- {colors:[],sizes:[]}
  seo_meta      JSONB DEFAULT '{}',
  affiliate_pct NUMERIC(4,1) DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON products (category_slug);
CREATE INDEX ON products USING gin (to_tsvector('simple', name || ' ' || coalesce(brand,'')));

CREATE TABLE product_videos (
  id BIGSERIAL PRIMARY KEY, title TEXT, category TEXT,
  thumbnail TEXT, video_url TEXT, duration TEXT, views BIGINT DEFAULT 0,
  status TEXT DEFAULT 'active'
);
CREATE TABLE product_video_map (product_id BIGINT REFERENCES products, video_id BIGINT REFERENCES product_videos, PRIMARY KEY (product_id, video_id));

CREATE TABLE reviews (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products ON DELETE CASCADE,
  user_id BIGINT REFERENCES users, author_name TEXT,
  rating INT CHECK (rating BETWEEN 1 AND 5), title TEXT, body TEXT,
  verified_purchase BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE orders (
  id            TEXT PRIMARY KEY,                     -- e.g. LMT-90412
  user_id       BIGINT REFERENCES users,
  subtotal      INTEGER NOT NULL,
  discount      INTEGER NOT NULL DEFAULT 0,
  shipping_fee  INTEGER NOT NULL DEFAULT 0,
  total         INTEGER NOT NULL,
  status        order_status NOT NULL DEFAULT 'pending',
  shipping_address JSONB, delivery_method TEXT,
  payment_method TEXT, payment_ref TEXT,
  promo_code    TEXT, affiliate_id BIGINT,
  placed_at     TIMESTAMPTZ NOT NULL DEFAULT now(), eta TEXT
);
CREATE TABLE order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders ON DELETE CASCADE,
  product_id BIGINT REFERENCES products, name_snapshot TEXT,
  qty INT NOT NULL, unit_price INTEGER NOT NULL, variant JSONB
);

CREATE TABLE referrals (
  id BIGSERIAL PRIMARY KEY,
  referrer_id BIGINT NOT NULL REFERENCES users,
  referred_id BIGINT REFERENCES users, referred_name TEXT,
  signup_date DATE, purchase_date DATE, purchase_value INTEGER,
  reward_amount INTEGER NOT NULL DEFAULT 7000,
  status ref_status NOT NULL DEFAULT 'pending'
);

CREATE TABLE affiliates (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE NOT NULL REFERENCES users,
  handle TEXT, channel TEXT, audience_size INT,
  tier TEXT DEFAULT 'Starter', commission_pct NUMERIC(4,1) DEFAULT 5,
  status aff_status NOT NULL DEFAULT 'pending',
  total_earnings INTEGER DEFAULT 0, pending INTEGER DEFAULT 0, available_balance INTEGER DEFAULT 0,
  payout_bank JSONB, opted_into_leaderboard BOOLEAN DEFAULT true
);

CREATE TABLE affiliate_links (
  id BIGSERIAL PRIMARY KEY, affiliate_id BIGINT NOT NULL REFERENCES affiliates,
  product_slug TEXT, code TEXT UNIQUE NOT NULL, created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE affiliate_clicks (
  id BIGSERIAL PRIMARY KEY, link_id BIGINT REFERENCES affiliate_links,
  ts TIMESTAMPTZ DEFAULT now(), ip_hash TEXT, ua TEXT
);
CREATE TABLE affiliate_conversions (
  id BIGSERIAL PRIMARY KEY, order_id TEXT REFERENCES orders,
  affiliate_id BIGINT REFERENCES affiliates, commission_amount INTEGER, status TEXT DEFAULT 'pending'
);

CREATE TABLE affiliate_promo_codes (
  code TEXT PRIMARY KEY, affiliate_id BIGINT NOT NULL REFERENCES affiliates,
  affiliate_name TEXT, discount_pct NUMERIC(4,1) NOT NULL,
  active BOOLEAN DEFAULT true, uses INT DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE withdrawals (
  id BIGSERIAL PRIMARY KEY, affiliate_id BIGINT NOT NULL REFERENCES affiliates,
  amount INTEGER NOT NULL, method TEXT DEFAULT 'Bank Transfer',
  status wd_status NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT now(), paid_at TIMESTAMPTZ
);

CREATE TABLE coupons (
  code TEXT PRIMARY KEY, description TEXT,
  discount_pct NUMERIC(4,1), discount_amount INTEGER,
  starts_at TIMESTAMPTZ, expires_at TIMESTAMPTZ,
  usage_limit INT, uses INT DEFAULT 0, active BOOLEAN DEFAULT true
);

CREATE TABLE spin_rewards (
  id BIGSERIAL PRIMARY KEY, label TEXT, type TEXT,  -- pct|cash|shipping|points|gift
  value INTEGER, weight NUMERIC(5,2), active BOOLEAN DEFAULT true
);
CREATE TABLE spin_claims (
  user_id BIGINT PRIMARY KEY REFERENCES users,       -- one spin per account
  reward_id BIGINT REFERENCES spin_rewards, coupon_code TEXT,
  claimed_at TIMESTAMPTZ DEFAULT now(), redeemed BOOLEAN DEFAULT false
);

CREATE TABLE settings (key TEXT PRIMARY KEY, value JSONB);  -- e.g. aff_promo_max, free_ship_threshold

CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY, user_id BIGINT REFERENCES users,
  type TEXT, title TEXT, body TEXT, link TEXT,
  read BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE wishlist (user_id BIGINT REFERENCES users, product_id BIGINT REFERENCES products, PRIMARY KEY (user_id, product_id));
