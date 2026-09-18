# Bluecollar — Hostinger Deployment Guide

**Target:** Hostinger Shared Hosting (hPanel)
**Domain:** `bluecollar.in`
**Structure:** Frontend at `public_html/`, API at `public_html/api/`

---

## Overview

```
public_html/
  ├── index.html           ← React build output
  ├── assets/              ← Vite build assets (JS/CSS)
  ├── favicon.svg
  ├── icons.svg
  ├── .htaccess            ← SPA routing + /storage/ rewrite
  └── api/
      ├── index.php        ← PHP entry point (adaptive ROOT_PATH)
      ├── .htaccess        ← API routing (routes all to index.php)
      ├── src/             ← PHP source
      ├── vendor/          ← Composer packages (production only)
      ├── .env             ← Production environment config
      └── storage/
          └── uploads/
              └── products/  ← Product images (must be writable)
```

---

## Step 1 — Build the React Frontend

On your local machine, in the `bluecollar-frontend/` folder:

```bash
cd bluecollar-frontend
npm run build
```

This produces a `dist/` folder. Contents to upload:
- `dist/index.html`
- `dist/assets/`
- `dist/favicon.svg`
- `dist/icons.svg`
- `dist/.htaccess`  ← Vite copies from `public/.htaccess`

---

## Step 2 — Prepare the Backend

### 2a. Install Composer dependencies (production)

On your local machine, in the `bluecollar-backend/` folder:

```bash
cd bluecollar-backend
composer install --no-dev --optimize-autoloader
```

This creates/updates `vendor/` with production-only packages.

### 2b. Create production `.env`

Copy `.env.production` to `.env` and fill in the real values:

```bash
cp .env.production .env
```

Then edit `.env`:

| Key | Where to find it |
|-----|-----------------|
| `DB_HOST` | Hostinger hPanel → Databases → MySQL Databases → Host (usually `localhost`) |
| `DB_NAME` | The database name you create in hPanel |
| `DB_USER` | The database user you create in hPanel |
| `DB_PASS` | The database user password |
| `JWT_SECRET` | Generate: `openssl rand -hex 32` |
| `ADMIN_JWT_SECRET` | Generate: `openssl rand -hex 32` (different value) |
| `MAIL_USERNAME` | Your `orders@bluecollar.in` email address |
| `MAIL_PASSWORD` | Email account password from hPanel → Emails |

**Important:** Keep `.env` out of version control (it is already in `.gitignore`).

---

## Step 3 — Create the MySQL Database

In Hostinger hPanel:
1. Go to **Databases → MySQL Databases**
2. Create a new database (e.g., `u123456789_bluecollar`)
3. Create a new database user with a strong password
4. Assign that user to the database (grant All Privileges)
5. Note the **Database Host** (usually `localhost`)

### 3a. Import the schema

In hPanel → **phpMyAdmin**:
1. Select your new database
2. Click **Import**
3. Upload `bluecollar-backend/schema.sql`
4. Click **Go**

---

## Step 4 — Upload Files

Use hPanel **File Manager** or an FTP client (FileZilla).

### Upload frontend files

Upload the contents of `bluecollar-frontend/dist/` to `public_html/`:

```
dist/index.html      → public_html/index.html
dist/assets/         → public_html/assets/
dist/favicon.svg     → public_html/favicon.svg
dist/icons.svg       → public_html/icons.svg
dist/.htaccess       → public_html/.htaccess
```

### Upload backend files

Create the folder `public_html/api/` and upload the following from `bluecollar-backend/`:

```
bluecollar-backend/public/index.php   → public_html/api/index.php
bluecollar-backend/public/.htaccess   → public_html/api/.htaccess
bluecollar-backend/src/               → public_html/api/src/
bluecollar-backend/vendor/            → public_html/api/vendor/
bluecollar-backend/.env               → public_html/api/.env   (with production values)
```

**Do NOT upload:** `bluecollar-backend/public/` folder itself — only the *contents* of it go into `public_html/api/`.

### Create the uploads folder

In File Manager, create this directory and set permissions to **755**:

```
public_html/api/storage/uploads/products/
```

---

## Step 5 — Verify File Permissions

In hPanel File Manager, right-click each item and set permissions:

| Path | Permission |
|------|-----------|
| `public_html/api/storage/` | 755 |
| `public_html/api/storage/uploads/` | 755 |
| `public_html/api/storage/uploads/products/` | 755 |
| `public_html/api/.env` | 640 (owner read/write, group read) |
| `public_html/api/vendor/` | 755 |

---

## Step 6 — Configure Email in hPanel

1. hPanel → **Emails → Email Accounts**
2. Create `orders@bluecollar.in`
3. Note the SMTP settings (usually `smtp.hostinger.com`, port `465` SSL)
4. Update your backend `.env`:
   ```
   MAIL_HOST=smtp.hostinger.com
   MAIL_PORT=465
   MAIL_USERNAME=orders@bluecollar.in
   MAIL_PASSWORD=your_email_password
   ```

---

## Step 7 — Test the Deployment

### Test API health
Open in browser: `https://bluecollar.in/api/products`

Expected response:
```json
{"status":"success","data":{"products":[],"pagination":{...}}}
```

### Test frontend
Open: `https://bluecollar.in`

The homepage should load. If you get a 404 on page refresh, the `public_html/.htaccess` is not in place.

### Test image serving
Upload a product with an image via admin panel, then check the image URL resolves at:
`https://bluecollar.in/storage/uploads/products/{id}/{filename}`

The `.htaccess` rewrite maps this to `public_html/api/storage/...` automatically.

### Test admin panel
Open: `https://bluecollar.in/admin`
Log in with admin credentials (you'll need to INSERT an admin user into the `admins` table directly via phpMyAdmin — see Step 8).

---

## Step 8 — Create the Admin User

In hPanel → phpMyAdmin, run this SQL (replace values):

```sql
INSERT INTO admins (name, email, password_hash, created_at)
VALUES (
  'Admin',
  'admin@bluecollar.in',
  '$2y$12$HASH_GOES_HERE',
  NOW()
);
```

To generate the bcrypt hash, run this PHP snippet locally:

```php
<?php echo password_hash('your_admin_password', PASSWORD_BCRYPT, ['cost' => 12]);
```

Or use an online bcrypt generator (cost 12).

---

## Step 9 — Seed the Store Settings

In phpMyAdmin, verify the `store_settings` table has at least these keys. If the table is empty, run:

```sql
INSERT INTO store_settings (setting_key, setting_value) VALUES
  ('shipping_flat_charge',   '99'),
  ('shipping_free_threshold','1999'),
  ('gst_rate',               '5'),
  ('gstin',                  '29AABCU9603R1ZM'),
  ('hsn_code',               '6205'),
  ('company_name',           'Bluecollar'),
  ('company_address',        '123 Business Park, Bangalore, Karnataka - 560001'),
  ('company_email',          'orders@bluecollar.in'),
  ('company_phone',          '+91 00000 00000'),
  ('announcement_text',      'Premium Wrinkle-Free Shirts · Free Shipping Above ₹1999 · 7 Day Easy Returns'),
  ('announcement_active',    '1');
```

These can also be updated via the Admin → Store Settings UI after login.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `https://bluecollar.in/api/products` returns 500 | Check `public_html/api/.env` — DB credentials wrong, or `vendor/` missing |
| React routes return 404 on refresh | `public_html/.htaccess` missing or `mod_rewrite` not enabled |
| Product images 404 | `public_html/.htaccess` storage rewrite rule not active, or `storage/uploads/products/` doesn't exist |
| "CORS error" in browser console | Check `FRONTEND_URL` in backend `.env` matches exactly `https://bluecollar.in` |
| Email not sending | Verify SMTP settings in `.env`; test from hPanel → Email → Webmail first |
| Admin login fails | Admin user not in `admins` table, or wrong password hash |

---

## Quick Checklist

- [ ] `npm run build` completed without errors
- [ ] `composer install --no-dev --optimize-autoloader` completed
- [ ] Database created in hPanel
- [ ] `schema.sql` imported successfully
- [ ] `public_html/.htaccess` uploaded (SPA + storage rewrite)
- [ ] `public_html/api/index.php` uploaded
- [ ] `public_html/api/.htaccess` uploaded
- [ ] `public_html/api/src/` uploaded
- [ ] `public_html/api/vendor/` uploaded
- [ ] `public_html/api/.env` uploaded with real credentials
- [ ] `public_html/api/storage/uploads/products/` created, permissions 755
- [ ] Admin user inserted into `admins` table
- [ ] Store settings seeded
- [ ] `https://bluecollar.in` loads homepage
- [ ] `https://bluecollar.in/api/products` returns JSON
- [ ] Admin panel login works
