# Procoffee

A mobile-first QR-menu website for a coffee shop. Customers scan a QR code at their
table and browse the menu on their phone. The owner manages categories, items, prices,
photos, sold-out status, and site settings from a protected admin panel — no coding.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** + custom Procoffee design tokens
- **Prisma 6** + **Neon Postgres** (free tier)
- **Auth.js v5** (Credentials provider, JWT sessions, bcrypt-hashed passwords)
- **Vercel Blob** for image uploads (free tier)
- **dnd-kit** for drag-to-reorder
- Deployed on **Vercel** (free Hobby plan)

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Neon Postgres project (free)

1. Go to [neon.tech](https://neon.tech) and sign up (free tier — no card).
2. Create a project named `procoffee`.
3. On the dashboard, copy two connection strings:
   - **Pooled connection** (has `-pooler` in the host) → `DATABASE_URL`
   - **Direct connection** → `DIRECT_URL`

### 3. Fill in `.env`

```bash
cp .env.example .env
```

Open `.env` and fill in:
- `DATABASE_URL` / `DIRECT_URL` — from Neon
- `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` — `http://localhost:3000`
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — your admin login (min 8 chars)
- `BLOB_READ_WRITE_TOKEN` — leave the placeholder for now; only required when you
  upload images from the admin. See the Vercel deploy section below.

### 4. Migrate the database + seed

```bash
npx prisma migrate dev --name init
npm run db:seed
```

The seed creates your admin user and 3 sample categories with items so you can see
the menu working immediately. Sample data is only seeded when the DB is empty, so
re-running seed later won't clobber real menu content — it will, however, re-hash
`ADMIN_PASSWORD` from `.env` into the admin row, which is how you reset the password.

### 5. Run

```bash
npm run dev
```

- Public menu → http://localhost:3000
- Admin login → http://localhost:3000/admin/login

## Deploy to Vercel

### 1. Push the repo to GitHub

The `.env` file is already in `.gitignore`. Never commit it.

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the GitHub repo.
2. **Environment Variables** — paste in every variable from `.env`:
   - `DATABASE_URL`, `DIRECT_URL` (same as local — Neon is remote either way)
   - `NEXTAUTH_SECRET` (same as local, or regenerate for prod)
   - `NEXTAUTH_URL` — start with the temporary `https://<project>.vercel.app` URL,
     then update to your custom domain once you have one.
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`
3. Click **Deploy**. Vercel runs `prisma generate && next build`.

### 3. Attach a Vercel Blob store (for image uploads)

1. In the Vercel dashboard for your project → **Storage** → **Create → Blob**.
2. Name it (e.g. `procoffee-images`) → **Connect** to this project.
3. Vercel injects `BLOB_READ_WRITE_TOKEN` automatically. No manual step needed.
4. Redeploy so the new env var is picked up.

### 4. Custom domain (optional — costs money)

1. In Vercel → your project → **Settings → Domains** → add your domain.
2. Add the DNS records Vercel shows you at your registrar.
3. Once live, update `NEXTAUTH_URL` in Vercel env vars to the real HTTPS URL and redeploy.

### 5. QR code

Generate a QR code (any free tool works) pointing at your site — e.g. `https://yourcafe.com`
or the `.vercel.app` URL. Test by scanning with a real phone.

## Admin guide

- **Login** — `/admin/login`. Session is a secure HttpOnly cookie, expires after 8 hours.
- **Menu** (`/admin`) — categories with drag-to-reorder, add/rename/delete inline.
- **Items** — click a category to add items. Each item has a photo, title, subtitle,
  optional description, price, and an **Available** toggle. Toggling Available off
  keeps the item on the menu but shows it dimmed with a "Sold out" tag.
- **Site settings** (`/admin/settings`) — shop name, tagline, about, logo, hero image,
  address, hours, phone, email, and social links. Everything on the homepage / menu is
  driven by these settings — no code changes needed.

**Changes are live instantly.** Edit a price at 8am and the next scan sees the new price.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server on :3000 |
| `npm run build` | Production build (runs Prisma generate first) |
| `npm run start` | Serve the production build |
| `npx prisma migrate dev --name <name>` | Create + apply a new DB migration locally |
| `npx prisma migrate deploy` | Apply pending migrations (used in CI/prod) |
| `npm run db:seed` | Insert/refresh admin user + defaults |
| `npm run db:studio` | Open Prisma Studio (visual DB inspector) |

## Security notes

- Admin passwords are bcrypt-hashed (cost 12), never stored in plaintext.
- Login rate-limited to 5 failed attempts per email per 15 min (in-memory).
- Every admin server action calls `requireAdmin()` before touching the DB — auth is
  never trusted from the client.
- Every input is Zod-validated on the server.
- Image uploads are MIME-checked (JPEG/PNG/WEBP) and capped at 5 MB.
- CSP + HSTS + `X-Frame-Options: DENY` + `X-Content-Type-Options: nosniff` set on
  every response via `next.config.ts`.

## License

Private — for the café's own use.
