-- =============================================================
-- BANCO DE IDEIAS
-- Rodar no Supabase: SQL Editor (dashboard)
-- =============================================================

create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  channel_id uuid references public.channels(id) on delete set null,
  platform text,
  format text,
  ref_link text,
  tags text,
  status text not null default 'nova',
  author text,
  author_id uuid,
  content_id uuid references public.contents(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant all on table public.ideas to anon, authenticated;

alter table public.ideas enable row level security;

drop policy if exists "ideas_anon_all" on public.ideas;
create policy "ideas_anon_all" on public.ideas for all to anon using (true) with check (true);
drop policy if exists "ideas_auth_all" on public.ideas;
create policy "ideas_auth_all" on public.ideas for all to authenticated using (true) with check (true);

create index if not exists idx_ideas_status on public.ideas(status);
create index if not exists idx_ideas_channel on public.ideas(channel_id);
