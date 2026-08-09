# Limitra — Developer Handoff Note

This is a **high-fidelity front-end prototype** built with React (via in-browser Babel), plain CSS, and `localStorage` for persistence. There is **no backend**. This note lists what's real, and exactly what needs server-side work to become a production store.

---

## 1. Architecture overview

- **Three apps, one shared data layer** (`data.js` → `window.LIMITRA`):
  - `index.html` — customer storefront (hash router in `app.jsx`).
  - `admin.html` — admin dashboard (`admin-app.jsx`, `admin.jsx`, `admin-sections.jsx`).
  - `aff-dashboard.html` — affiliate dashboard (`aff-dashboard.jsx`, `aff-sections.jsx`).
- **Rendering:** JSX is compiled in the browser by Babel standalone. For production, **precompile** the JSX in a build step (Vite/Next) — runtime Babel is slow and not production-grade.
- **Routing:** client-side hash routes (`#/shop`, `#/product/<slug>`, `#/account/...`). Unknown routes fall back to a `NotReady` screen.
- **State/persistence:** React state + `localStorage`. Keys are prefixed `lim_` (see §4).

## 2. What works (front-end only)

Browse/search, product detail, cart, multi-step checkout, wishlist, order tracking, account, referrals, rewards/spin-the-wheel, videos/reels, affiliate dashboard (links, QR, promo codes, withdrawals, leaderboard), admin dashboard (products, orders, customers, affiliates, CMS, coupons, inventory, roles). All flows connect and persist across reloads — but only in the browser.

## 3. What needs a backend (the real work)

**Auth & roles (highest priority / security)**
- Role routing currently keys off email **on the client**; `admin.html` and `aff-dashboard.html` are reachable by direct URL. Must be replaced with real authentication + **server-enforced** role-based access control (Customer / Affiliate / Super Admin). Seeded admin: `adefioyeemman@gmail.com`; seeded affiliate: `bjquyum@gmail.com`.
- Needs: signup/login/OTP, sessions/JWT, password reset, route guards on every `/admin/*` and `/affiliate/*` endpoint.

**Commerce**
- Products/inventory: replace the static array in `data.js` with a DB + admin CRUD (the admin UI exists; wire to endpoints).
- Cart → **Checkout/payments**: integrate a real gateway (Paystack noted in UI). Checkout currently always "succeeds."
- Orders: persistence, status lifecycle, tracking, invoices, refunds.

**Programs**
- Referrals: ₦7,000 "Lim Cash" credit on completed referral — needs server validation of genuine referred purchases.
- Affiliate: link attribution, click/conversion tracking, commission tiers (rolling 30-day, see `affiliate-policy.txt`), withdrawals, payouts.
- Affiliate promo codes: created client-side into `lim_aff_promos`; per-affiliate limit in `lim_aff_promo_max`. Must move to DB with uniqueness + redemption tracking at checkout.
- Spin & Win: prize/probability config and one-spin-per-account must be server-enforced (currently localStorage-gated).

**Content & media**
- Videos/reels use simulated players over poster images — wire real video hosting/CDN.
- CMS edits, image uploads, downloads currently just toast — need storage + endpoints.

## 4. localStorage keys (replace with API/DB)
`lim_cart`, `lim_wish`, `lim_addresses`, `lim_cards`, `lim_referral`, `lim_aff_promos`, `lim_aff_promo_max`, `lim_theme`, `lim_spin*`, plus assorted UI prefs. Treat all as mock persistence.

## 5. Known simulated/mock points
- Single mock user (Lucy Limitra); clearing localStorage resets everything.
- Card brand is detected from PAN prefix (`LIMITRA.cardBrand`) — display only, no vaulting.
- "Elo" AI assistant is a scripted/affiliate-data helper, not a live model integration.

## 5b. AI integration (Elo assistant)

The "Elo" assistant (`lucy.jsx`, `EloAI`) is a working chat widget wired to a **prototype-only** model shim — it calls `window.claude.complete(prompt)`, which exists in this preview environment but **not in production**. There's a graceful fallback: if `window.claude` is absent, Elo returns canned bestseller/deal picks, so it never hard-fails.

How it works today:
- Builds a text prompt = persona + a **catalog snapshot** (first 60 products as name/brand/category/price/rating) + last 6 turns of history + the customer message.
- **Image upload / visual search:** accepts up to 5 images (JPG/PNG/WEBP, ≤10MB), compresses each client-side to a ≤1024px data URL, and appends an instruction telling the model to act as a visual product-search assistant. Note: images are **not actually sent** to a vision model in the prompt — only a text note is. So "visual search" is simulated.
- Parses the reply text for product names and renders matched product cards inline; "add to cart" works from the chat.

To productionize:
1. Replace `window.claude.complete` with a call to **your own backend endpoint** (e.g. `POST /api/elo`) that holds the model API key server-side — never ship a key to the browser.
2. Use a **multimodal model** and actually pass the uploaded images for real visual search (today only text is sent).
3. Replace the inline catalog-in-prompt with **retrieval** (vector search over the product DB) so it scales past ~60 items and stays current.
4. Add server-side **rate limiting, abuse/cost controls, logging,** and grounding/guardrails so it only recommends real, in-stock products.
5. Optional: persist conversations per user; wire the affiliate-dashboard "ask Elo" queries to the same endpoint with affiliate data scope.

## 6. Suggested build order
1. Backend + DB schema (users w/ `role`, products, orders, referrals, affiliates, promo codes).
2. Real auth + server-side role guards; precompile the front-end.
3. Payments + order lifecycle.
4. Affiliate attribution/payouts + referral validation.
5. Media hosting + CMS persistence.
6. Analytics wired to real events (dashboards currently show sample data).

## 7. Files of note
`data.js` (all mock data + helpers), `app.jsx` (router), `store.jsx` (state/persistence), `pages-*.jsx` (storefront pages), `admin-*.jsx` (admin), `aff-*.jsx` (affiliate), `affiliate-policy.txt` (commission rules). CSS is per-area (`styles.css`, `chrome.css`, `pages.css`, `shop.css`, `flows.css`, etc.).

**Backend starter artifacts:** `backend/schema.sql` (PostgreSQL schema for all entities in Appendix A) and `backend/openapi.yaml` (OpenAPI 3.1 stub for the endpoints in Appendix B). Both are starting points — adjust to your stack.

---

# Appendix A — Data Model

Derived from the mock shapes in `data.js`/`store.jsx`. Field names are suggestions; types matter more than names. All money is **integer kobo or whole Naira** (pick one and be consistent — UI currently uses whole ₦).

**User**
`id, full_name, email (unique), phone, password_hash, role (Customer|Affiliate|Manager|CustomerSupport|AffiliateManager|SuperAdmin), account_status (active|suspended), initials, created_at, updated_at`

**Address** (belongs to User)
`id, user_id, label (Home|Office|…), recipient_name, phone, street, city, state, is_default`

**Card** (belongs to User — store a gateway token, NEVER the PAN)
`id, user_id, brand (Visa|Mastercard|Verve), last4, exp_mm_yy, gateway_token, is_default`

**Category / Subcategory**
`slug (unique), name, parent_slug (null for top-level), icon, sort_order, active`. Adult category has an age-gate flag.

**Product**
`id, slug (unique, SEO), name, brand, category_slug, subcategory_slug, price, compare_at_price (was), discount_pct (derived), rating, review_count, badges ([hot|sale|new|…]), is_bestseller, stock, status (active|draft|out_of_stock), description, specs (key/value[]), images ([url]), videos ([video_id]), variants (colors[], storage/sizes[]), seo_meta, affiliate_commission_pct, created_at`

**Review** (belongs to Product + User)
`id, product_id, user_id, author_name, rating, title, body, verified_purchase, created_at`

**Cart / CartItem** (per user or guest session)
`cart: id, user_id|session_id, updated_at` · `item: product_id, qty, variant {color, size/storage}, unit_price_snapshot`

**Order / OrderItem**
`order: id (LMT-####), user_id, items[], subtotal, discount, shipping_fee, total, status (Pending|Processing|Shipped|Delivered|Cancelled|Refunded), shipping_address, delivery_method, payment_method, payment_ref, promo_code, referral_attribution, placed_at, eta` · `item: product_id, name_snapshot, qty, unit_price, variant`

**Referral**
`id, referrer_user_id, referred_name|user_id, signup_date, purchase_date, purchase_value, reward_amount (₦7,000), status (Pending|Completed|Cancelled)`. Plus a per-user **LimCash** credit balance + ledger.

**Affiliate** (extends User)
`id, user_id, handle, channel, audience_size, tier (Starter|Builder|Growth|Pro|Elite), commission_pct, status (Pending|Approved|Suspended), total_earnings, pending, available_balance, payout_bank {bank, account_no, account_name}, opted_into_leaderboard`

**Affiliate link / click / conversion**
`link: id, affiliate_id, product_slug, code, created_at` · `click: link_id, ts, ip_hash, ua` · `conversion: order_id, affiliate_id, commission_amount, status`

**Affiliate promo code**
`code (unique), affiliate_id, affiliate_name, discount_pct, active, uses, created_at`. Limit per affiliate = admin setting (`lim_aff_promo_max`).

**Withdrawal**
`id, affiliate_id, amount, method (Bank Transfer), status (Pending|Approved|Processing|Paid|Rejected), requested_at, paid_at`

**Coupon** (platform-wide)
`code, description, discount_pct|amount, starts_at, expires_at, usage_limit, uses, active`

**Spin reward / claim**
`reward: id, label, type (pct|cash|shipping|points|gift), value, weight (probability), active` · `claim: user_id (one per account), reward_id, coupon_code, claimed_at, redeemed`

**Video**
`id, title, category, product_ids[], thumbnail, video_url, duration, views, status`

**Notification**
`id, user_id, type, title, body, link, read, created_at`

---

# Appendix B — Suggested REST API

Auth: `POST /auth/signup`, `POST /auth/login`, `POST /auth/otp/verify`, `POST /auth/forgot`, `POST /auth/reset`, `POST /auth/logout`, `GET /auth/me`. Login response returns role → client redirects (`/`, `/affiliate/dashboard`, `/admin/dashboard`), but **every protected endpoint must re-check role server-side.**

Catalog: `GET /products?cat=&sub=&q=&sort=&min=&max=&page=`, `GET /products/:slug`, `GET /categories`, `GET /products/:slug/reviews`, `POST /products/:slug/reviews`.

Cart/checkout: `GET/POST/PATCH/DELETE /cart/items`, `POST /checkout/quote` (totals, shipping, promo), `POST /checkout` (creates order + payment intent), `POST /payments/webhook` (gateway callback → mark paid).

Account: `GET/PATCH /me`, CRUD `/me/addresses`, `/me/cards`, `GET /me/orders`, `GET /orders/:id/track`, `GET/POST /me/wishlist`, `GET /me/rewards`, `GET /me/referrals`, `POST /me/referrals/invite`.

Affiliate: `GET /affiliate/overview`, `GET /affiliate/performance`, `POST /affiliate/links`, `GET /affiliate/links`, CRUD `/affiliate/promo-codes` (server enforces limit), `GET /affiliate/earnings`, `POST /affiliate/withdrawals`, `GET /affiliate/referrals`, `GET /affiliate/leaderboard`.

Admin (SuperAdmin/role-scoped): CRUD `/admin/products`, `/admin/orders` (+status), `/admin/customers` (+suspend/restore/reset-pwd), `/admin/affiliates` (+approve/suspend/pay), `/admin/coupons`, `/admin/spin`, `/admin/videos`, `/admin/cms`, `/admin/roles`, `/admin/inventory`, `GET /admin/analytics`, `POST /admin/settings` (e.g. affiliate promo limit).

AI: `POST /api/elo` (message + image refs → model server-side; see §5b).

---

# Appendix C — Business rules & constants

- **Free shipping** above a threshold (see `FREE_SHIP` in `pages-cart.jsx`); otherwise flat delivery fee. **Pickup** method is intentionally disabled ("temporarily unavailable"). Delivery promise copy is **10–14 days** everywhere.
- **Discount %** = round((compare_at − price) / compare_at). Sale badge shows when `compare_at > price`.
- **Referral reward** = ₦7,000 LimCash, credited only on a **delivered** referred order; spendable against future orders (redeem at checkout).
- **Affiliate tiers** (rolling 30-day **delivered** orders) — Starter 5% (1–500), Builder 7% (501–1,000), Growth 10% (1,001–1,500), Pro 12% (1,501–2,000), Elite 15% (2,001+). Full rules + which orders count in `affiliate-policy.txt`. Tiers auto-adjust up/down each period.
- **Affiliate promo codes**: per-affiliate limit set by admin (default 1); 5/10/15% options; unique codes; redeemable at checkout and attributed to the affiliate.
- **Spin & Win**: one spin per account; prize weights admin-configurable; cash prizes credit LimCash, % prizes issue a single-use coupon.
- **Roles**: Customer / Affiliate / Manager / Customer Support / Affiliate Manager / Super Admin. Seeded super-admin `adefioyeemman@gmail.com`, affiliate `bjquyum@gmail.com` — seeds only; real roles live in the DB.
- **Order statuses**: Pending → Processing → Shipped → Delivered, plus Cancelled / Refunded.
- **Currency**: Naira (₦), `en-NG` formatting (`LIMITRA.naira`).

---

# Appendix D — Non-functional / launch checklist

- **SEO/SSR (important):** storefront is hash-routed + client-rendered — poor for indexing. Move product/category pages to real URLs with server rendering + meta/OpenGraph/JSON-LD before launch.
- **Search:** currently in-memory string filter. Production needs real search (facets, typo tolerance) — e.g. a search service.
- **Analytics:** all dashboard numbers are mock. Define and emit real events (page views, add-to-cart, purchase, affiliate click/conversion, video view) and back the dashboards with them.
- **Notifications:** email/SMS/push triggers for order confirmation, shipping, delivery, withdrawal paid, referral completed — pick providers.
- **Inventory:** enforce stock decrements + oversell prevention at checkout.
- **Security:** server-side RBAC on all `/admin/*` and `/affiliate/*`; rate-limit auth + AI; never expose API keys client-side; PCI scope handled by the gateway (tokenize cards).
- **Privacy/compliance:** Nigeria NDPR (consent, data export/delete); cookie/consent handling.
- **Media:** images/videos via CDN; compress on upload; generate thumbnails.
- **Build:** precompile JSX (drop in-browser Babel); bundle/minify; cache-bust assets.
- **Accessibility:** audit keyboard nav, focus states, contrast, alt text.
