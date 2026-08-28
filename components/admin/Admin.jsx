'use client';
/* Barrel re-export for the admin section — mirrors the export shape that legacy/admin.jsx +
   legacy/admin-sections.jsx used to hang off `window` via `Object.assign(window, {...})`.
   Actual implementations live in the sibling files, organized by ADMIN_NAV group:
   - AdminShared.jsx     shared primitives (AdmHead, Pager, usePager, Toggle, AdmSelect,
                          AdmDate, useHighlight) + ADMIN_NAV + ADMIN_ORDERS
   - AdminOverview.jsx    Dashboard, Analytics
   - AdminCatalog.jsx     Products, Inventory, Orders, Coupons & Promos
   - AdminPeople.jsx      Customers, Affiliates, Referrals
   - AdminEngagement.jsx  Spin & Win, Videos, Elo AI
   - AdminSystem.jsx      Content (CMS), Roles & Access, Reports
   - AdminActivity.jsx    Activity log (no sidebar entry, still routable)
   Note: Kpi/BarChart/Donut/STATUS_CLS live in @/components/charts/Charts — import from there
   directly, they are intentionally not re-exported here. */

export { AdminOverview, AdminAnalytics } from './AdminOverview';
export { AdminProducts, AdminOrders, AdminCoupons, AdminInventory } from './AdminCatalog';
export { AdminCustomers, AdminAffiliates, AdminReferrals } from './AdminPeople';
export { AdminSpin, AdminVideos, AdminElo } from './AdminEngagement';
export { AdminCMS, AdminRoles, AdminReports } from './AdminSystem';
export { AdminActivity } from './AdminActivity';

export { Toggle, AdmSelect, AdmDate, ADMIN_NAV, ADMIN_ORDERS } from './AdminShared';
