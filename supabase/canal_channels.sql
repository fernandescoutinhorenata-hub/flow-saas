-- =============================================================
-- Módulo "Canal" — suporte a múltiplos canais
-- Rodar este script no Supabase: SQL Editor (dashboard)
-- =============================================================

-- Canais (múltiplos canais de conteúdo)
create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Adiciona o vínculo do vídeo a um canal
alter table public.videos add column if not exists channel_id uuid references public.channels(id) on delete cascade;

-- Permissões
grant all on table public.channels to anon, authenticated;
alter table public.channels enable row level security;
create policy "channels_anon_all" on public.channels for all to anon using (true) with check (true);
create policy "channels_auth_all" on public.channels for all to authenticated using (true) with check (true);

-- Índice
create index if not exists idx_videos_channel on public.videos(channel_id);
