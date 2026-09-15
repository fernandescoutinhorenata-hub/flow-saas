-- =============================================================
-- UPGRADE: Planejador semanal + Esteira de produção
-- Rodar no Supabase: SQL Editor (dashboard)
-- =============================================================

-- -----------------------------------------------------------
-- METAS SEMANAIS
-- -----------------------------------------------------------
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  target numeric,
  current numeric default 0,
  unit text,
  channel_id uuid references public.channels(id) on delete set null,
  assignee text,
  assignee_id uuid,
  start_date date,
  end_date date,
  status text not null default 'pendente',
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------
-- CONTEÚDOS (esteira de produção)
-- -----------------------------------------------------------
create table if not exists public.contents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  channel_id uuid references public.channels(id) on delete set null,
  platform text default 'YouTube',
  format text default 'Short',
  niche text,
  stage text not null default 'ideias',
  assignee_id uuid,
  assignee text,
  priority text not null default 'media',
  publish_date date,
  publish_time text,
  description text,
  tags text,
  idea text,
  hook text,
  refs text,
  source_links text,
  research_notes text,
  audience text,
  objective text,
  script text,
  public_title text,
  narration text,
  cta text,
  caption text,
  hashtags text,
  duration text,
  image_links text,
  video_links text,
  prompts text,
  narration_link text,
  edit_link text,
  folder_link text,
  thumbnail_url text,
  checklist jsonb default '[]'::jsonb,
  published_url text,
  published_at timestamptz,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------
-- HISTÓRICO DE ETAPAS DA PRODUÇÃO
-- -----------------------------------------------------------
create table if not exists public.content_stage_history (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.contents(id) on delete cascade,
  stage text not null,
  entered_at timestamptz not null default now()
);

-- -----------------------------------------------------------
-- AJUSTES NA TABELA TASKS (planejador semanal)
-- -----------------------------------------------------------
alter table public.tasks add column if not exists date date;
alter table public.tasks add column if not exists done boolean not null default false;
alter table public.tasks add column if not exists recurrence text not null default 'none';
alter table public.tasks add column if not exists task_type text not null default 'tarefa';
alter table public.tasks add column if not exists tags text;
alter table public.tasks add column if not exists checklist jsonb default '[]'::jsonb;
alter table public.tasks add column if not exists channel_id uuid references public.channels(id) on delete set null;
alter table public.tasks add column if not exists content_id uuid references public.contents(id) on delete set null;

-- -----------------------------------------------------------
-- PERMISSÕES E RLS (mesmo padrão permissivo do app)
-- -----------------------------------------------------------
grant all on table public.goals to anon, authenticated;
grant all on table public.contents to anon, authenticated;
grant all on table public.content_stage_history to anon, authenticated;

alter table public.goals enable row level security;
alter table public.contents enable row level security;
alter table public.content_stage_history enable row level security;

create policy "goals_anon_all" on public.goals for all to anon using (true) with check (true);
create policy "goals_auth_all" on public.goals for all to authenticated using (true) with check (true);
create policy "contents_anon_all" on public.contents for all to anon using (true) with check (true);
create policy "contents_auth_all" on public.contents for all to authenticated using (true) with check (true);
create policy "content_stage_history_anon_all" on public.content_stage_history for all to anon using (true) with check (true);
create policy "content_stage_history_auth_all" on public.content_stage_history for all to authenticated using (true) with check (true);

-- -----------------------------------------------------------
-- ÍNDICES
-- -----------------------------------------------------------
create index if not exists idx_tasks_date on public.tasks(date);
create index if not exists idx_tasks_done on public.tasks(done);
create index if not exists idx_goals_end_date on public.goals(end_date);
create index if not exists idx_contents_stage on public.contents(stage);
create index if not exists idx_contents_channel on public.contents(channel_id);
create index if not exists idx_contents_publish_date on public.contents(publish_date);
create index if not exists idx_stage_history_content on public.content_stage_history(content_id);
