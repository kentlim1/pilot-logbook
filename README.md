# Pilot Logbook

A mobile-first flight logbook PWA built with Next.js and Supabase. Sign in, log flights fast, track totals and milestones, and export your logbook.

## Features

**Logging**
- Log flights with aircraft type, tail number, route, times, landings/approaches, and turbine flag
- "Log similar" — duplicate a past flight and just tweak what changed
- Aircraft/tail defaults auto-filled from your most-flown values
- Quick-pick chips for aircraft, airports, and tail numbers, ranked by frequency/recency
- Route-aware suggestions: picking a departure surfaces the arrivals you usually pair with it

**Accounts & data**
- Email/password and Google sign-in via Supabase Auth
- Each pilot's flights are private, enforced by Postgres row-level security

**Offline & installable**
- Installable as a home-screen PWA (manifest + service worker, works full-screen on iPhone)
- Logging a flight while offline queues it locally and syncs automatically once back online

**Stats & export**
- Cumulative hours chart (Total/PIC/SIC) over time
- Configurable progress bars toward career milestones (total time, PIC, turbine PIC, multi-engine, instrument)
- CSV export and a print-formatted view for exporting to PDF

## Tech Stack

- [Next.js](https://nextjs.org) (App Router)
- [Supabase](https://supabase.com) (Postgres, Auth, RLS)
- Tailwind CSS
- Hand-rolled SVG chart and service worker — no charting, PDF, or offline-sync libraries

## Getting Started

### 1. Set up Supabase

Create a Supabase project, then run [supabase/schema.sql](supabase/schema.sql) in the SQL editor. It's idempotent — safe to re-run as the file evolves.

This sets up the `flights` table with per-user row-level security. If you have flights logged from before auth existed, see the comments at the bottom of `schema.sql` for how to claim them after creating your account.

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. (Optional) Enable Google sign-in

In the Supabase dashboard under **Authentication → Providers → Google**, add an OAuth Client ID/Secret from Google Cloud Console, with the redirect URI `https://<your-project-ref>.supabase.co/auth/v1/callback`. Without this, email/password sign-in still works.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app. Note: service workers (offline support, install prompt) require HTTPS — `localhost` is exempt, but testing from another device on your LAN is not.

## Project Structure

- [src/app/page.tsx](src/app/page.tsx) — home page: flight form, totals, flight list
- [src/app/flights/[id]/page.tsx](src/app/flights/[id]/page.tsx) — flight detail/edit view
- [src/app/stats/page.tsx](src/app/stats/page.tsx) — hours chart, milestones, CSV/PDF export
- [src/components/](src/components/) — UI components (`FlightForm`, `FlightList`, `AuthScreen`, `HoursChart`, `MilestonesPanel`, etc.)
- [src/lib/flights.ts](src/lib/flights.ts) — Supabase CRUD + offline-aware `createFlight`
- [src/lib/offlineQueue.ts](src/lib/offlineQueue.ts) — localStorage queue for flights logged offline
- [src/lib/useSession.ts](src/lib/useSession.ts) / [src/components/AuthGate.tsx](src/components/AuthGate.tsx) — auth state and the signed-out gate
- [src/lib/milestones.ts](src/lib/milestones.ts) / [src/lib/csvExport.ts](src/lib/csvExport.ts) — stats/export logic
- [public/sw.js](public/sw.js) — service worker (network-first, cache-fallback for the app shell)
- [supabase/schema.sql](supabase/schema.sql) — database schema, RLS policies, and migration notes

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — build for production
- `npm run start` — run the production build
- `npm run lint` — run ESLint
