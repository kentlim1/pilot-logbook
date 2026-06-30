# Pilot Logbook

A simple flight logbook app built with Next.js and Supabase. Log flights, track totals (time, PIC/SIC, night, landings), and review flight history.

## Features

- Log flights with aircraft type, tail number, route, times, and landings/approaches
- Auto-suggested aircraft types, tail numbers, and airports based on recent entries
- Running totals for block time, PIC, SIC, night time, and landings
- Flight list with a detail view per flight

## Tech Stack

- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com) (Postgres + client SDK)
- Tailwind CSS

## Getting Started

### 1. Set up Supabase

Create a Supabase project, then run [supabase/schema.sql](supabase/schema.sql) in the SQL editor to create the `flights` table.

> Note: the current schema grants the anon key full access to the `flights` table (no auth yet). This is intended for single-user/local use only — see the comments in `schema.sql` before deploying anywhere public.

### 2. Configure environment variables

Copy the example env file and fill in your Supabase project values:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

## Project Structure

- [src/app/page.tsx](src/app/page.tsx) — home page: flight form, totals, and flight list
- [src/app/flights/[id]/page.tsx](src/app/flights/[id]/page.tsx) — single flight detail/edit view
- [src/components/](src/components/) — UI components (`FlightForm`, `FlightList`, `TotalsPanel`, etc.)
- [src/lib/flights.ts](src/lib/flights.ts) — Supabase CRUD calls for flights
- [src/lib/supabase.ts](src/lib/supabase.ts) — Supabase client setup
- [src/types/database.ts](src/types/database.ts) — flight row/database types
- [supabase/schema.sql](supabase/schema.sql) — database schema

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — build for production
- `npm run start` — run the production build
- `npm run lint` — run ESLint
