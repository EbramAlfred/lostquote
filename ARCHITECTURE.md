# LostQuote – Architecture (Phase 0)

> The Follow-up Assistant. Never lose another customer because you forgot to follow up.

Status: design only. No application code exists yet. Companion file: `0001_init.sql`.

---

## 1. Architecture

```
Browser (Next.js App Router, React, Tailwind, Recharts)
   │  Supabase JS (anon key + user JWT)         │  fetch
   ▼                                            ▼
Supabase                              Next.js Route Handlers (server only)
 ├─ Auth (email/password, recovery)      ├─ POST /api/messages/generate  → AI provider (server-side key)
 ├─ PostgreSQL + RLS (tenant isolation)  │       └─ template fallback if AI errors / key missing
 └─ RPC: create_business()               └─ GET  /api/cron/digest        → daily reminder job (Vercel Cron)
```

Key decisions

| Decision | Reasoning |
|---|---|
| **Tenant isolation lives in the database (RLS)**, not in app code | A bug in a React component cannot leak another business's data. Every tenant table carries `business_id`; policies call `is_member()` / `has_role()`. |
| **Browser talks to Supabase directly** for CRUD | Fewer moving parts for an MVP; RLS makes this safe. |
| **Server routes only where secrets are needed** | AI key and service-role key never reach the browser. |
| **Overdue is derived**, never stored | `state = 'pending' and due_date < current_date`; no cron job needed to keep it correct. |
| **Estimated vs. collected revenue are separate columns** | `quotations.amount` vs `quotations.collected_amount`, as the brief requires. |
| **Status `kind`** (`draft/open/won/lost/cancelled`) | Users can rename or add statuses; analytics still work because they read `kind`. |
| **Multi-currency**: each quotation keeps its own currency | Analytics are grouped per currency. No FX conversion in the MVP (avoids showing wrong totals). |
| **Plan limits enforced in a DB trigger** | The Free-plan limit of 5 quotations/month cannot be bypassed from the client. |
| **No automatic sending** | The app produces drafts, `wa.me` deep links and `mailto:` drafts. Users send manually, per the brief. |
| **Payments excluded** | `subscription_plans` + `businesses.plan_id` only; Stripe or similar can be added later without schema changes. |

### Roles
`owner` (everything, deletes business) · `admin` (manage members, settings, delete records) · `member` (create/edit data) · `viewer` (read-only).

### Schema summary (see `0001_init.sql`)
Required tables: `users`, `businesses`, `business_members`, `customers`, `quotations`, `quotation_items`, `follow_up_tasks`, `activity_logs`, `notification_preferences`, `subscription_plans`.
Added because the brief needs them: `quotation_categories` and `quotation_statuses` (user-customisable), `message_templates` (AI fallback), and the view `follow_up_tasks_v` (exposes `is_overdue`).

---

## 2. Application structure

```
lostquote/
├─ app/
│  ├─ (auth)/login, register, forgot-password, reset-password
│  ├─ onboarding/                 # business setup wizard → create_business()
│  ├─ (app)/
│  │  ├─ layout.tsx               # sidebar (desktop) + bottom nav (mobile)
│  │  ├─ dashboard/
│  │  ├─ customers/ [id]/
│  │  ├─ quotations/ new/ [id]/   # detail: items, status, follow-ups, message generator
│  │  ├─ follow-ups/              # tabs: Overdue · Today · Upcoming · Completed
│  │  ├─ analytics/
│  │  ├─ team/                    # Pro+
│  │  └─ settings/                # business, statuses, categories, sequence, notifications
│  └─ api/
│     ├─ messages/generate/route.ts
│     └─ cron/digest/route.ts
├─ components/ui/                 # Button, Input, Select, Dialog, Badge, Table, Toast, EmptyState, Skeleton
├─ components/features/           # QuotationForm, FollowUpCard, MessageGenerator, StatCard, charts
├─ lib/
│  ├─ supabase/ client.ts, server.ts, middleware.ts
│  ├─ queries/                    # typed data-access functions (one file per entity)
│  ├─ messages/ templates.ts, generate.ts, whatsapp.ts
│  ├─ analytics/ metrics.ts       # pure functions → unit-testable
│  └─ i18n/ en.json, ar.json, index.ts
├─ supabase/migrations/0001_init.sql
├─ tests/ unit (metrics, templates) · e2e (Playwright) · rls (SQL tests)
└─ middleware.ts                  # session refresh + route protection
```

Conventions: TypeScript strict; Zod validation on every form and API route; all user-facing strings go through i18n keys from day one; logical CSS properties (`ms-*`, `ps-*`, `text-start`) so RTL works without rewrites.

---

## 3. Design system

**Colour tokens**

| Token | Value | Use |
|---|---|---|
| `navy` | `#14213D` | Sidebar, headings |
| `primary` | `#2563EB` | Buttons, links, active nav |
| `background` | `#F8FAFC` | App background |
| `success` | green `#16A34A` | Won |
| `warning` | orange `#F97316` | Pending / due follow-ups |
| `danger` | red `#DC2626` | Overdue, Lost, destructive actions |
| `neutral` | slate `#64748B` | Draft, Cancelled, secondary text |

**Typography:** Inter (Latin) + IBM Plex Sans Arabic (Arabic) via `next/font`. Scale: 12 / 14 / 16 / 20 / 24 / 32.
**Spacing / shape:** 4-px grid, 8-px radius on inputs and buttons, 12-px on cards, light shadow only on elevated surfaces.
**States every screen must have:** loading (skeleton), empty (illustration + one action), error (message + retry), success (toast), destructive confirmation (dialog).
**Accessibility:** colour is never the only status signal (badges carry text); focus rings visible; minimum 44-px touch targets on mobile.
**Mobile-first:** tables collapse to cards below `md`; bottom tab bar with Dashboard · Quotations · Follow-ups · Customers · More.

---

## 4. Free-tier dependencies and their limits

Figures from vendors' public pages as checked on 8 Nov 2026; these change, so re-verify before launch.

| Service | Free-tier limits relevant to LostQuote | Impact |
|---|---|---|
| **Supabase Free** | 500 MB database, 50,000 auth MAU, 5 GB egress, 1 GB file storage, 2 active projects; **projects pause after 1 week of inactivity** | Fine for development and a validation pilot. Pausing makes it unsuitable for real paying customers; plan for Pro ($25/month) before launch. |
| **Vercel Hobby** | **Personal, non-commercial use only**; cron limited to once per day | Fine for building and demoing. Once the product is sold or used by customers, Vercel Pro is required. Daily cron is enough for a morning reminder digest. |
| **Recharts, Next.js, React, Tailwind** | Open source, no limits | None |
| **AI provider** (for message generation) | Needs a server-side API key; usage is billed per request unless a provider's free allowance applies | **Your decision.** The feature is built so that if no key is set or the call fails, the template fallback is used. Add per-business daily rate limits to control cost. |
| **Email (reminder digest)** | Not chosen yet | MVP delivers in-app reminders first; email digest is optional and needs a provider (e.g. Resend) — decide in Phase 6. |

Estimated storage: a quotation with items and follow-ups is roughly a few KB, so 500 MB holds on the order of tens of thousands of quotations; the database size is not the first constraint, the pausing is.

---

## 5. Build phases (each ends with tested, working behaviour)

| Phase | Scope | Verified by |
|---|---|---|
| 1 | Scaffold, Tailwind tokens, Supabase client, auth (register, login, recovery), route protection | Manual + Playwright: register → login → logout → reset |
| 2 | Onboarding → `create_business()`; settings (profile, currency, timezone, language) | Business row, owner membership, default statuses/categories exist |
| 3 | Customers CRUD + search | CRUD, validation, RLS isolation test with 2 accounts |
| 4 | Quotations CRUD, items, statuses, categories, multi-currency | Totals, per-currency display, plan-limit error at 6th quotation on Free |
| 5 | Follow-ups: create, sequence generation (2/5/7 customisable), complete, reschedule, overdue | Overdue boundary tests (due today vs yesterday) |
| 6 | Dashboard + analytics (pure metric functions + charts) | Unit tests against hand-computed fixtures |
| 7 | Message generator: templates (EN/AR), AI route, copy/edit/regenerate, WhatsApp link, email draft | Fallback works with the key removed |
| 8 | Team and roles, RTL pass, mobile pass, empty/error states, final QA | Role permission matrix tests, viewport checks |

Out of scope for the MVP: payments, automatic message sending, accounting/inventory/ERP, FX conversion.

---

## 6. Open decisions for you

1. **AI provider** and whether you have a key now (otherwise Phase 7 ships with templates only, clearly labelled).
2. **Team features in MVP?** Your brief lists them under Pro, but the schema already supports them. I suggest building roles in Phase 8, after the single-user flow is solid.
3. **Hosting for early customers:** Vercel Pro and Supabase Pro, or an alternative host.
