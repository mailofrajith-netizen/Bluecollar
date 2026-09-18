# Bluecollar — Project Roadmap

**Project:** Bluecollar E-Commerce Platform (Wrinkle-Free Shirts)
**Stack:** React + Tailwind CSS (Frontend) · Custom PHP REST API (Backend) · MySQL
**Last Updated:** 2026-05-20

---

## Workflow Rules

- Each phase requires **explicit approval** before the next phase begins.
- New bugs or change requests discovered after development are added as **new tickets** (never modify completed tickets).
- Ticket statuses: `Open` · `In Progress` · `Completed`

---

## Dummy Config Values (Admin-Configurable — update via Admin > Settings)

| Setting | Dummy Value | Notes |
|---------|------------|-------|
| Shipping flat charge (below threshold) | ₹99 | Client to confirm exact amount |
| Shipping free threshold | ₹1999 | Confirmed |
| GST rate | 5% | Client to confirm |
| GSTIN | 29AABCU9603R1ZM | Dummy — client to replace |
| HSN code | 6205 | Typical for shirts — client to confirm |
| Company name | Bluecollar | Confirmed |
| Company address | 123 Business Park, Bangalore, Karnataka - 560001 | Dummy — client to provide |
| Company email | orders@bluecollar.in | Dummy |
| Company phone | +91 00000 00000 | Dummy |
| Announcement bar text | Premium Wrinkle-Free Shirts · Free Shipping Above ₹1999 · 7 Day Easy Returns | Default |

---

## Phase 1 — Foundation

**Status: COMPLETED ✓**

> Scaffolding: React project, PHP project, MySQL schema, environment config, routing bootstrap.

| Ticket | Subject | Assigned To | Status |
|--------|---------|-------------|--------|
| F-01 | Initialize React frontend with Vite + Tailwind CSS | fullstack-developer | Completed |
| F-02 | Initialize PHP backend project with folder structure + .htaccess routing | fullstack-developer | Completed |
| F-03 | Create MySQL database and execute full schema | fullstack-developer | Completed |
| F-04 | Create .env files for frontend and backend with all config keys | fullstack-developer | Completed |
| F-05 | Build PHP bootstrap: PDO singleton, CORS, JSON response helper, .env reader | fullstack-developer | Completed |
| F-06 | Build PHP router: METHOD+URI dispatch to controllers, 404 fallback | fullstack-developer | Completed |
| F-07 | Create base React layout components: RootLayout and AdminLayout | fullstack-developer | Completed |
| F-08 | Configure React Router v6 routes for all storefront and admin paths | fullstack-developer | Completed |
| F-09 | Set up Axios instance with base URL, headers, and error interceptor | fullstack-developer | Completed |
| F-10 | Add ZUNO → Bluecollar grep check (zero-tolerance brand audit) | fullstack-developer | Completed |

---

## Phase 2 — Backend Core

**Status: COMPLETED ✓**

> All PHP REST API endpoints for auth, products, cart/orders, invoice, email, and settings.

| Ticket | Subject | Assigned To | Status |
|--------|---------|-------------|--------|
| B-01 | Implement POST /api/auth/register | fullstack-developer | Completed |
| B-02 | Implement POST /api/auth/login (with 5-attempt lockout) | fullstack-developer | Completed |
| B-03 | Build JWT middleware: validate Bearer token, attach user context | fullstack-developer | Completed |
| B-04 | Implement GET /api/products (paginated, filterable, sortable) | fullstack-developer | Completed |
| B-05 | Implement GET /api/products/{id} (full product detail with variants) | fullstack-developer | Completed |
| B-06 | Implement POST /api/orders (order placement with DB-level stock locking) | fullstack-developer | Completed |
| B-07 | Implement GET /api/orders/{id} (order detail for authenticated user) | fullstack-developer | Completed |
| B-08 | Implement GET /api/orders (order list for authenticated user) | fullstack-developer | Completed |
| B-09 | Implement GET /api/orders/track (guest order lookup by Order ID + email) | fullstack-developer | Completed |
| B-10 | Implement GET /api/orders/{id}/invoice (stream PDF to customer) | fullstack-developer | Completed |
| B-11 | Build PdfInvoiceService (TCPDF-based, GST breakdown, Bluecollar branding) | fullstack-developer | Completed |
| B-12 | Build MailerService (PHPMailer SMTP, order confirmation email) | fullstack-developer | Completed |
| B-13 | Implement GET /api/user/profile | fullstack-developer | Completed |
| B-14 | Implement PUT /api/user/profile | fullstack-developer | Completed |
| B-15 | Implement POST /api/newsletter (subscribe with duplicate check) | fullstack-developer | Completed |
| B-16 | Implement GET + PUT /api/admin/settings (store configuration API) | fullstack-developer | Completed |

---

## Phase 3 — Backend Admin API

**Status: COMPLETED ✓**

> All admin-facing PHP REST API endpoints (product CRUD, order management, users, invoices).

| Ticket | Subject | Assigned To | Status |
|--------|---------|-------------|--------|
| A-01 | Implement POST /api/admin/auth/login (admin login, separate JWT) | fullstack-developer | Completed |
| A-02 | Build admin role guard middleware (reject non-admin JWT with 403) | fullstack-developer | Completed |
| A-03 | Implement GET /api/admin/products (admin product list) | fullstack-developer | Completed |
| A-04 | Implement POST /api/admin/products (create product with image upload) | fullstack-developer | Completed |
| A-05 | Implement PUT /api/admin/products/{id} (update product) | fullstack-developer | Completed |
| A-06 | Implement DELETE /api/admin/products/{id} (soft delete) | fullstack-developer | Completed |
| A-07 | Implement POST /api/admin/products/{id}/variants (add variant) | fullstack-developer | Completed |
| A-08 | Implement PUT /api/admin/products/{id}/variants/{vid} (update variant) | fullstack-developer | Completed |
| A-09 | Implement DELETE /api/admin/products/{id}/variants/{vid} | fullstack-developer | Completed |
| A-10 | Implement GET /api/admin/orders (paginated list with filters) | fullstack-developer | Completed |
| A-11 | Implement GET /api/admin/orders/{id} (full admin order detail) | fullstack-developer | Completed |
| A-12 | Implement PUT /api/admin/orders/{id}/status (status state machine) | fullstack-developer | Completed |
| A-13 | Implement GET /api/admin/users (registered users + guest submitters list) | fullstack-developer | Completed |
| A-14 | Implement GET /api/admin/invoices (all invoices list) | fullstack-developer | Completed |
| A-15 | Implement GET /api/admin/invoices/{order_id}/download (admin PDF download) | fullstack-developer | Completed |
| A-16 | Build ImageUploadService (MIME validation, 2MB limit, store to /uploads/products/) | fullstack-developer | Completed |

---

## Phase 4 — Frontend Storefront

**Status: COMPLETED ✓**

> All customer-facing React pages: Homepage, Product Listing, Product Detail, Cart, Checkout, Confirmation, Track Order, Auth, Account.

| Ticket | Subject | Assigned To | Status |
|--------|---------|-------------|--------|
| FE-01 | Build Navbar component (logo, nav links, cart badge, mobile hamburger) | fullstack-developer | Completed |
| FE-02 | Build Footer component (brand, links, newsletter signup) | fullstack-developer | Completed |
| FE-03 | Build HomePage (all sections from reference design, Bluecollar branded) | fullstack-developer | Completed |
| FE-04 | Build ProductListingPage (Myntra-style grid, filter panel, sort, search, pagination) | fullstack-developer | Completed |
| FE-05 | Build ProductDetailPage (gallery, variant selector, Add to Cart, Buy Now) | fullstack-developer | Completed |
| FE-06 | Build CartContext (React Context + localStorage: items, shipping logic, totals) | fullstack-developer | Completed |
| FE-07 | Build CartPage (item list, quantity stepper, remove, order summary sidebar) | fullstack-developer | Completed |
| FE-08 | Build CheckoutPage (address form, COD, guest + registered flow, order placement) | fullstack-developer | Completed |
| FE-09 | Build OrderConfirmationPage (order summary, Download Invoice, WhatsApp share) | fullstack-developer | Completed |
| FE-10 | Build TrackOrderPage (guest order lookup by Order ID + email) | fullstack-developer | Completed |
| FE-11 | Build RegisterPage and LoginPage (auth forms, JWT storage) | fullstack-developer | Completed |
| FE-12 | Build AuthContext (user state, token, login/logout, isAuthenticated) | fullstack-developer | Completed |
| FE-13 | Build AccountPage (My Profile + My Orders with invoice download) | fullstack-developer | Completed |
| FE-14 | Build SizeGuideModal (static size chart with measurements per size) | fullstack-developer | Completed |
| FE-15 | Build global toast notification system (success/error/info) | fullstack-developer | Completed |
| FE-16 | Build ProtectedRoute HOC (redirect unauthenticated users to /login) | fullstack-developer | Completed |

---

## Phase 5 — Frontend Admin Panel

**Status: COMPLETED ✓**

> Admin panel React pages: Login, Dashboard, Products, Orders, Users, Invoices, Store Settings.

| Ticket | Subject | Assigned To | Status |
|--------|---------|-------------|--------|
| AD-01 | Build AdminLoginPage (admin auth form, separate JWT storage) | fullstack-developer | Completed |
| AD-02 | Build AdminLayout (sidebar, top bar, admin route guard) | fullstack-developer | Completed |
| AD-03 | Build Admin Dashboard (summary stat cards) | fullstack-developer | Completed |
| AD-04 | Build AdminProductsPage (paginated product table, Add/Edit/Delete actions) | fullstack-developer | Completed |
| AD-05 | Build ProductFormModal (create + edit product with image upload and variants) | fullstack-developer | Completed |
| AD-06 | Build VariantManagementPanel (inline add/edit/delete variant rows in product form) | fullstack-developer | Completed |
| AD-07 | Build AdminOrdersPage (paginated order table, filter by status, search) | fullstack-developer | Completed |
| AD-08 | Build AdminOrderDetailPage (full order view + status update dropdown) | fullstack-developer | Completed |
| AD-09 | Build AdminUsersPage (registered users + guest order submitters table) | fullstack-developer | Completed |
| AD-10 | Build AdminInvoicesPage (invoice list with per-row PDF download) | fullstack-developer | Completed |
| AD-11 | Build Admin Store Settings page (configurable shipping, GST, company details) | fullstack-developer | Completed |

---

## Phase 6 — Integration & Polish

**Status: COMPLETED ✓**

> End-to-end testing, responsive audit, security hardening, brand audit.

| Ticket | Subject | Assigned To | Status |
|--------|---------|-------------|--------|
| I-01 | E2E smoke test: Guest flow (Browse → Cart → Checkout → Confirmation → Invoice → Track) | fullstack-developer | Completed |
| I-02 | E2E smoke test: Registered user flow (Register → Login → Cart → Checkout → My Orders) | fullstack-developer | Completed |
| I-03 | Validate stock enforcement (concurrent last-item-in-stock order) | fullstack-developer | Completed |
| I-04 | Validate shipping logic at boundary values (₹1998 vs ₹1999 vs ₹2000) | fullstack-developer | Completed |
| I-05 | Validate PDF invoice content (GST, totals, Bluecollar branding, no ZUNO) | fullstack-developer | Completed |
| I-06 | Validate order confirmation email (Mailtrap test, correct content) | fullstack-developer | Completed |
| I-07 | Responsive audit: test all storefront pages at 375px, 768px, 1280px | fullstack-developer | Completed |
| I-08 | Zero ZUNO audit: grep entire codebase for any ZUNO occurrences | fullstack-developer | Completed |
| I-09 | Input validation hardening (client-side + server-side, clear error messages) | fullstack-developer | Completed |
| I-10 | SQL injection prevention audit (confirm all DB queries use PDO prepared statements) | fullstack-developer | Completed |
| I-11 | CORS configuration: restrict allowed origins to frontend domain | fullstack-developer | Completed |
| I-12 | WhatsApp share URL: validate deep-link format and pre-filled message content | fullstack-developer | Completed |

---

## Change Log & Bug Fixes

> All post-development changes and bug fixes are tracked here as new tickets.
> Format: `[BUG-XX]` for bugs, `[CHG-XX]` for change requests.

| Ticket | Subject | Reported By | Phase Affected | Status |
|--------|---------|-------------|----------------|--------|
| CHG-01 | Redesign frontend home page to match new brand reference (dark hero, orange accent, cream bg) | Client | Phase 4 | Completed |
| CHG-02 | Apply new theme consistently across all inner pages (Products, Cart, Checkout, Auth, Account, Track Order) | Client | Phase 4 | Completed |
| CHG-03 | Seed product catalogue: copy product names/descriptions from Otto Store reference and enter via admin API | Client | Content | Completed |
| CHG-04 | QA loop: QA agent tests all frontend pages as user → Orchestrator reviews → Developer fixes → repeat until zero open bugs | Client | Phase 4+6 | Completed |
| BUG-01 | Product price/stock not saving on edit — PUT + multipart/form-data doesn't populate $_POST in PHP; stock field orphaned (products table has no stock column) | Client | Phase 3+5 | Completed |
| BUG-02 | Add loading overlay/spinner to admin product create, update, variants, and image upload operations | Client | Phase 5 | Completed |
| BUG-03 | Enable multiple image selection in ProductImagesPanel — currently forced to upload one-by-one | Client | Phase 5 | Completed |
| CHG-05 | Add "Our Franchise" page with route, navbar link, and static content | Client | Phase 4 | Completed |
| CHG-06 | Add "Our Stores" page with route, navbar link, and store location cards | Client | Phase 4 | Completed |
| CHG-07 | Redesign home page theme to match new reference: light hero, updated features strip, product card star ratings + discounts, promo banner, customer reviews section, trust badges strip, about section | Client | Phase 4 | Completed |
| CHG-08 | Add floating WhatsApp button on all storefront pages | Client | Phase 4 | Completed |
| CHG-09 | Replace "Our Promise" section with customer reviews section (quotations, stars, names) | Client | Phase 4 | Completed |
| CHG-10 | Add Return Policy link/text to footer | Client | Phase 4 | Completed |
| CHG-11 | Add contact number and address to announcement bar and footer | Client | Phase 4 | Completed |
| CHG-12 | Update navbar: add HOME, COLLECTIONS, NEW ARRIVALS links; update announcement bar to 2-column layout | Client | Phase 4 | Completed |
| BUG-04 | Enable multi-image selection in Add Product modal — currently only single image allowed at creation time | Client | Phase 5 | Completed |
| CHG-13 | Change favicon from generic SVG to logo.png for both site and admin (shared index.html) | Client | Phase 4 | Completed |
| CHG-14 | Add "Our Franchise" and "Our Stores" links to desktop navbar (were mobile-only) | Client | Phase 4 | Completed |
| CHG-15 | Create Return Policy page (/return-policy) — footer linked to it but page/route were missing | Client | Phase 4 | Completed |
| CHG-16 | Rebuild frontend to deploy theme + all existing features (WhatsApp, reviews, contact, address) | Client | Phase 4+5 | Completed |
| CHG-17 | Remove SHOP and NEW ARRIVALS from desktop + mobile navbar — keep only COLLECTIONS | Client | Phase 4 | Completed |
| CHG-18 | Add demo wrinkle-free shirt images to products via PHP seeder (seed_product_images.php) | Client | Phase 3+5 | Completed |
| CHG-19 | Homepage: add CollectionsGrid section + new AboutSection component (brand story, stats, CTA) | Client | Phase 4 | Completed |

---

## Summary

| Phase | Total Tickets | Open | In Progress | Completed |
|-------|--------------|------|-------------|-----------|
| Phase 1 — Foundation | 10 | 0 | 0 | 10 |
| Phase 2 — Backend Core | 16 | 0 | 0 | 16 |
| Phase 3 — Backend Admin API | 16 | 0 | 0 | 16 |
| Phase 4 — Frontend Storefront | 16 | 0 | 0 | 16 |
| Phase 5 — Frontend Admin Panel | 11 | 0 | 0 | 11 |
| Phase 6 — Integration & Polish | 12 | 0 | 0 | 12 |
| Change Log | 21 | 0 | 0 | 21 |
| **Total** | **102** | **0** | **0** | **102** |
