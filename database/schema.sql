create extension if not exists pgcrypto;

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  gender text not null check (gender in ('female', 'male')),
  phone text,
  approved boolean not null default false,
  score integer,
  created_at timestamptz not null default now()
);

create index if not exists participants_leaderboard_idx
  on public.participants (approved, gender, score desc);

create index if not exists participants_created_at_idx
  on public.participants (created_at desc);
