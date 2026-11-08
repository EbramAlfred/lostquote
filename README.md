# LostQuote – The Follow-up Assistant

## Run it on your computer
1. Install Node.js (nodejs.org, the "LTS" version).
2. Copy `.env.example` to `.env.local` and paste your two Supabase values.
3. In a terminal inside this folder: `npm install`, then `npm run dev`.
4. Open http://localhost:3000

## Database
Run `supabase/migrations/0001_init.sql` once in Supabase (SQL Editor).

## Status
Phase 1 done: register, login, password reset, business setup, protected dashboard.
See ARCHITECTURE.md for the full plan.
