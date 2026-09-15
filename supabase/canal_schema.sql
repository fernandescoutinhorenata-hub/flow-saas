-- =============================================================
-- Módulo "Canal" — controle de conteúdo dark (Fase 1)
-- Rodar este script no Supabase: SQL Editor (dashboard)
-- =============================================================

-- Vídeos / conteúdo do canal
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  pauta text,
  description text,
  status text not null default 'ideia',
  priority text not null default 'medium',
  due_date date,
  publish_date date,
  youtube_url text,
  thumbnail_url text,
  assignee text,
  assignee_id uuid,
  assignee_initials text,
  project_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Métricas por vídeo (com snapshot por dia, para histórico/evolução)
create table if not exists public.video_metrics (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  snapshot_date date not null default current_date,
  views bigint not null default 0,
  likes bigint not null default 0,
  comments bigint not null default 0,
  watch_hours numeric not null default 0,
  subscribers_gained integer not null default 0,
  revenue numeric not null default 0,
  created_at timestamptz not null default now(),
  unique (video_id, snapshot_date)
);

-- Permissões de CRUD para o cliente (mesmo padrão das demais tabelas)
grant all on table public.videos to anon, authenticated;
grant all on table public.video_metrics to anon, authenticated;

-- Liberar acesso via RLS (permissivo, padrão do app)
alter table public.videos enable row level security;
alter table public.video_metrics enable row level security;

create policy "videos_anon_all" on public.videos for all to anon using (true) with check (true);
create policy "videos_auth_all" on public.videos for all to authenticated using (true) with check (true);
create policy "video_metrics_anon_all" on public.video_metrics for all to anon using (true) with check (true);
create policy "video_metrics_auth_all" on public.video_metrics for all to authenticated using (true) with check (true);

-- Índices
create index if not exists idx_videos_status on public.videos(status);
create index if not exists idx_videos_publish_date on public.videos(publish_date);
create index if not exists idx_video_metrics_video on public.video_metrics(video_id);
