-- Pilot logbook schema (Phase 1)
-- Single-user app for now: no auth/RLS-per-user yet, just a public table
-- gated by the anon key. Lock down with Supabase Auth + RLS in Phase 3.

create table if not exists public.flights (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  flight_date date not null default current_date,

  aircraft_type text not null,
  tail_number text,

  dep_airport text not null,
  arr_airport text not null,

  out_time time,
  in_time time,

  -- All durations stored in decimal hours (e.g. 1.5 = 1h30m)
  block_time numeric(5,2) not null default 0,
  pic_time numeric(5,2) not null default 0,
  sic_time numeric(5,2) not null default 0,
  night_time numeric(5,2) not null default 0,
  multi_engine_time numeric(5,2) not null default 0,
  cross_country_time numeric(5,2) not null default 0,
  instrument_time numeric(5,2) not null default 0,

  day_landings smallint not null default 0,
  night_landings smallint not null default 0,
  approaches smallint not null default 0,

  remarks text
);

create index if not exists flights_flight_date_idx on public.flights (flight_date desc, created_at desc);

alter table public.flights enable row level security;

-- Phase 1 is single-user with no login: allow the anon key full access.
-- Replace with per-user policies once Supabase Auth is added (Phase 3).
create policy "anon full access" on public.flights
  for all
  using (true)
  with check (true);
