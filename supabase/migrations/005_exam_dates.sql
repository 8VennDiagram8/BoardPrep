-- User-entered board exam dates, private to each account.

create table if not exists public.exam_dates (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null,
  program_id text not null references public.programs(id) on delete cascade,
  label      text not null default '',
  exam_at    timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists exam_dates_user_id_idx on public.exam_dates (user_id, exam_at);

alter table public.exam_dates enable row level security;

create policy "exam dates readable by owner" on public.exam_dates
  for select using (auth.uid()::text = user_id);
create policy "exam dates insertable by owner" on public.exam_dates
  for insert with check (auth.uid()::text = user_id);
create policy "exam dates deletable by owner" on public.exam_dates
  for delete using (auth.uid()::text = user_id);
