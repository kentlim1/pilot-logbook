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

-- Phase 3: Supabase Auth + per-user RLS. Re-running this whole file is safe.

alter table public.flights add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists flights_user_id_idx on public.flights (user_id);

drop policy if exists "anon full access" on public.flights;
drop policy if exists "select own flights" on public.flights;
drop policy if exists "insert own flights" on public.flights;
drop policy if exists "update own flights" on public.flights;
drop policy if exists "delete own flights" on public.flights;

create policy "select own flights" on public.flights
  for select using (auth.uid() = user_id);

create policy "insert own flights" on public.flights
  for insert with check (auth.uid() = user_id);

create policy "update own flights" on public.flights
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "delete own flights" on public.flights
  for delete using (auth.uid() = user_id);

-- Flights logged in Phase 1/2 (before auth existed) have no owner yet, so RLS
-- hides them from everyone until claimed. After creating your account, find
-- your user id with `select id, email from auth.users;`, then run:
--   update public.flights set user_id = '<your-user-id>' where user_id is null;

-- Phase 3: milestone tracking needs to tell turbine time apart from piston time.
alter table public.flights add column if not exists is_turbine boolean not null default false;
