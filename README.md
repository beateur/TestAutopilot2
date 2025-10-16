# Artist Portfolio SaaS - Multi-Tenant Platform

**Status:** ✅ Production-Ready Monorepo

Multi-tenant SaaS platform enabling artists to create stunning portfolio websites with a drag-and-drop builder, analytics, and freemium/pro plans.

---

## 🏗️ Architecture

### Monorepo Structure (pnpm + Turborepo)

```
├── apps/
│   ├── marketing/       # Landing page (domain.com) - Next.js
│   ├── backoffice/      # Admin dashboard (app.domain.com) - Next.js
│   ├── portfolio/       # Public artist sites (*.domain.com) - Next.js ISR
│   └── api/             # REST API + OpenAPI - NestJS
├── packages/
│   ├── ui/              # Shared component library (shadcn/ui)
│   ├── types/           # Zod schemas & TypeScript types
│   ├── config/          # ESLint, TS, Tailwind configs
│   ├── database/        # Prisma schema + migrations + seed
│   └── block-renderer/  # Universal block renderer (React)
└── supabase/
    ├── functions/       # Edge Functions (Deno)
    ├── policies.sql     # Row Level Security policies
    └── config.toml      # Supabase configuration
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 20.11.0
- pnpm ≥ 9.0.0
- PostgreSQL (or Supabase account)
- Supabase CLI (optional, for local dev)

### 1. Clone & Install

```bash
git clone <repo-url> artist-portfolio-saas
cd artist-portfolio-saas
pnpm install
```

### 2. Environment Variables

Create `.env` files in each app:

**`apps/api/.env`**
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/portfolio_saas
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
PORT=4000
```

**`apps/marketing/.env.local`, `apps/backoffice/.env.local`, `apps/portfolio/.env.local`**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
NEXT_PUBLIC_API_URL=http://localhost:4000
API_URL=http://localhost:4000
```

**`supabase/.env`** (for Edge Functions)
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

### 3. Database Setup

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed initial data (FREE/PRO plans, test user)
pnpm db:seed
```

### 4. Deploy RLS Policies & Edge Functions

```bash
# Deploy policies + Edge Functions
pnpm supa:deploy

# Or separately:
pnpm supa:policies
pnpm supa:functions
```

### 5. Start Development

```bash
# Start all apps in parallel (Turbo)
pnpm dev

# Or start individually:
pnpm --filter @repo/api dev       # API on :4000
pnpm --filter @repo/marketing dev # Marketing on :3000
pnpm --filter @repo/backoffice dev # Backoffice on :3001
pnpm --filter @repo/portfolio dev # Portfolio on :3002
```

---

## 📦 Build & Deploy

```bash
# Build all apps
pnpm build

# Run tests
pnpm test

# Run e2e tests (Playwright)
pnpm e2e

# Lighthouse CI (portfolio performance)
pnpm lhci:run
```

---

## 🔐 Security & RLS

All tables use Row Level Security (RLS). Policies in `supabase/policies.sql`:

- **ArtistAccount, Site, Page, Block, MediaAsset:** Owner-only access (via `auth.uid()`)
- **ContactMessage:** Readable by site owner only
- **AnalyticEvent:** Revoked for clients; insertion via Edge Function (service_role)
- **StatSnapshot:** Readable by site owner
- **Plans:** Public read
- **AccessRequest:** Anonymous insert (marketing form)

**Critical:** Edge Functions use `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS for analytics/contact insertion.

---

## 📊 Analytics Flow

1. **Client** (portfolio) calls Edge Function `track-event` (POST)
2. **Edge Function** validates, inserts into `analytic_events` (service_role)
3. **Cron job** (`aggregate-stats`, runs every 15min) aggregates into `stat_snapshots`
4. **Backoffice** queries `stat_snapshots` for dashboard

---

## 🎨 Blocks System

8 block types defined in `@repo/types` and rendered by `@repo/block-renderer`:

- **HERO**: Title, subtitle, CTA, background image/video
- **RICH_TEXT**: Markdown content
- **GALLERY**: Grid/masonry layout with lightbox
- **VIDEO**: Upload or embed (YouTube, Vimeo)
- **CAROUSEL**: Image slider
- **GRID**: 2/3 columns with text + images
- **QUOTE**: Blockquote with author
- **EMBED**: Generic iframe embed

---

## 💳 Freemium & Pro Plans

### Free Plan
- 3 pages max
- Analytics included
- Contact form **disabled**
- Subdomain only (e.g., `john-doe.domain.com`)

### Pro Plan ($29/mo)
- **Unlimited pages**
- Contact form **enabled**
- Custom domain support
- Priority support

**Enforcement:**
- Pages quota checked in API (`POST /sites/:id/pages`)
- Contact form blocked in Edge Function (`contact-submit`) if plan doesn't allow
- Backoffice shows upgrade prompt

---

## 🌐 Multi-Domain Resolution

**Middleware logic (Next.js):**

```ts
const host = req.headers.get('host');

if (host === 'domain.com') → Marketing app
if (host === 'app.domain.com') → Backoffice
if (host.endsWith('.domain.com') || customDomain) → Portfolio app
```

**Portfolio app** queries API `/public/site-by-host?host=<host>` to fetch site data (ISR cached 60s).

---

## 🧪 Testing

- **Unit tests:** `pnpm test` (Jest)
- **E2E tests:** `pnpm e2e` (Playwright)
  - Domain resolution
  - Create/publish site
  - Freemium quotas
  - Contact form (free vs pro)
  - ISR revalidation
- **Lighthouse CI:** `pnpm lhci:run` (portfolio performance)

---

## 📚 API Endpoints (OpenAPI)

Swagger docs: `http://localhost:4000/api/docs`

### Authenticated
- `GET /me` - Current user + subscriptions
- `POST /artists` - Create artist account
- `GET /artists/:id` - Get artist
- `PATCH /artists/:id` - Update artist
- `POST /sites` - Create site
- `PATCH /sites/:id` - Update site
- `POST /sites/:id/publish` - Publish site (triggers ISR revalidate)
- `POST /sites/:id/pages` - Create page (enforces quota)
- `PATCH /pages/:id` - Update page
- `POST /pages/:id/blocks` - Create block
- `PATCH /blocks/:id` - Update block
- `POST /media/sign-upload` - Get signed URL for Supabase Storage
- `GET /sites/:id/stats?period=day|week|month` - Analytics

### Public
- `GET /public/site-by-host?host=<host>` - Fetch portfolio site
- `POST /public/track` - Track analytics event (proxied to Edge Function)
- `GET /public/marketing-stats` - Global stats (marketing page)

---

## 📖 Playbooks

### Create an Artist Account

1. Sign up via Supabase Auth
2. `POST /artists` with `{ displayName, slug, bio }`
3. System creates `ArtistAccount` + `DomainMap` (subdomain = slug)
4. `POST /sites` with `artistAccountId`

### Publish a Site

1. Create pages: `POST /sites/:id/pages`
2. Add blocks: `POST /pages/:id/blocks`
3. Publish: `POST /sites/:id/publish`
   - Sets `publishedAt` timestamp
   - Triggers internal webhook `/internal/revalidate` to purge ISR cache
4. Portfolio live at `<slug>.domain.com`

### Add Custom Domain

1. Upgrade to Pro plan (Stripe checkout)
2. `POST /domains` with `{ artistAccountId, customDomain: 'art.example.com' }`
3. User adds DNS CNAME record: `art.example.com → domain.com`
4. System verifies DNS (TXT record or HTTP challenge)
5. Updates `DomainMap.verifiedAt`

### Upgrade to Pro

1. User clicks "Upgrade" in backoffice
2. Create Stripe Checkout Session: `POST /stripe/checkout` with `priceId`
3. Redirect to Stripe → payment
4. Webhook `stripe.checkout.session.completed` → updates `Subscription` table
5. Backoffice detects new subscription → unlocks features

### Restore Database

```bash
# Backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

---

## 🔧 Environment Variables (Contract)

### Supabase
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` (public)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, bypasses RLS)
- `SUPABASE_JWT_JWK_URL` (for JWT validation)

### API
- `DATABASE_URL` (Postgres connection string)
- `PORT` (default: 4000)
- `ALLOWED_ORIGINS` (CORS, comma-separated)

### Stripe
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `PRICE_PRO_ID` (Stripe Price ID for Pro plan)

### Next.js Apps
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL` (client-side API calls)
- `API_URL` (server-side, SSR)

### Email (optional)
- `RESEND_API_KEY` or `SENDGRID_API_KEY` (contact notifications)

---

## 🚦 CI/CD Pipeline

`.github/workflows/ci.yml` (all branches):

1. **Lint & Typecheck** (turbo)
2. **Unit tests** (turbo)
3. **Build all apps** (turbo)
4. **Prisma migrations check** (`pnpm db:migrate:check`)
5. **Lighthouse CI** (portfolio, score ≥ 90)
6. **Secrets scan** (trufflehog/ggshield)

`.github/workflows/deploy.yml` (main branch):

1. Deploy API to Fly.io/Render
2. Deploy Next.js apps to Vercel (or Cloudflare Pages)
3. Deploy Edge Functions: `pnpm supa:functions`
4. Run migrations: `pnpm db:migrate`

---

## 🎯 Definition of Done (DoD)

✅ **All criteria met:**

- Monorepo builds green (`pnpm build`)
- CI pipeline passes (lint, typecheck, tests, migrations, Lighthouse)
- RLS policies deployed and tested (e2e confirms isolation)
- Edge Functions deployed + cron running
- Freemium quotas enforced (3 pages, contact disabled)
- Pro upgrade flow functional (Stripe checkout → unlock features)
- ISR revalidation works (<60s after publish)
- Analytics collected → aggregated → displayed in backoffice
- Lighthouse scores ≥ 90 (Perf/Best/SEO/Access) on portfolio
- Documentation complete (README, Playbooks, ADRs)
- Seed data works (`pnpm db:seed`)

---

## 📁 Repository Structure

```
artist-portfolio-saas/
├── apps/
│   ├── api/              # NestJS API (REST + OpenAPI)
│   ├── marketing/        # Landing page (Next.js)
│   ├── backoffice/       # Admin dashboard (Next.js)
│   └── portfolio/        # Public portfolios (Next.js ISR)
├── packages/
│   ├── ui/               # Component library (shadcn)
│   ├── types/            # Zod schemas + types
│   ├── config/           # Shared configs
│   ├── database/         # Prisma (schema + migrations + seed)
│   └── block-renderer/   # Block rendering engine
├── supabase/
│   ├── functions/        # Edge Functions (Deno)
│   ├── policies.sql      # RLS policies
│   └── config.toml       # Supabase config
├── docs/
│   ├── PROGRESS.md       # Iteration journal
│   ├── BACKLOG.md        # Task tracking
│   └── adrs/             # Architecture Decision Records
├── .github/
│   └── workflows/        # CI/CD pipelines
├── package.json          # Root workspace
├── pnpm-workspace.yaml   # Workspace config
├── turbo.json            # Turborepo config
└── README.md             # This file
```

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feat/your-feature`
2. Commit with Conventional Commits: `git commit -m "feat: add video block"`
3. Push and create PR with checklist (see `.github/PULL_REQUEST_TEMPLATE.md`)
4. CI must pass (lint, tests, Lighthouse)

---

## 📄 License

MIT

---

## 🆘 Support

- **Issues:** GitHub Issues
- **Docs:** `docs/` folder
- **Playbooks:** See "Playbooks" section above
- **API Docs:** `http://localhost:4000/api/docs`

---

**Built with:** Next.js, NestJS, Prisma, Supabase, Turborepo, shadcn/ui, Tailwind CSS, Stripe
# TestAutopilot2
