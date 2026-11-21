-- BoardPrep initial schema
-- Run in the Supabase SQL editor (or with the Supabase CLI) before loading seed.sql.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Catalog (read-only for clients; managed by the app owner)
-- ---------------------------------------------------------------------------
create table if not exists public.programs (
  id          text primary key,
  code        text not null unique,
  name        text not null,
  short_name  text not null,
  description text not null default '',
  accent      text not null default 'indigo' check (accent in ('indigo', 'cyan')),
  glyph       text not null default '📘'
);

create table if not exists public.subjects (
  id          text primary key,
  program_id  text not null references public.programs(id) on delete cascade,
  name        text not null,
  code        text not null,
  description text not null default '',
  glyph       text not null default '📗'
);

create table if not exists public.topics (
  id          text primary key,
  subject_id  text not null references public.subjects(id) on delete cascade,
  program_id  text not null references public.programs(id) on delete cascade,
  name        text not null,
  description text not null default ''
);

create table if not exists public.questions (
  id           text primary key,
  program_id   text not null references public.programs(id) on delete cascade,
  subject_id   text not null references public.subjects(id) on delete cascade,
  topic_id     text not null references public.topics(id) on delete cascade,
  prompt       text not null,
  options      jsonb not null,
  answer_index integer not null check (answer_index between 0 and 5),
  explanation  text not null default '',
  difficulty   text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard'))
);

create table if not exists public.flashcards (
  id         text primary key,
  program_id text not null references public.programs(id) on delete cascade,
  subject_id text not null references public.subjects(id) on delete cascade,
  topic_id   text not null references public.topics(id) on delete cascade,
  front      text not null,
  back       text not null
);

-- ---------------------------------------------------------------------------
-- User data
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id           text primary key,
  display_name text not null default 'Engineer',
  created_at   timestamptz not null default now()
);

create table if not exists public.attempts (
  id               uuid primary key default gen_random_uuid(),
  user_id          text not null,
  program_id       text not null references public.programs(id) on delete cascade,
  mode             text not null check (mode in ('practice', 'mock')),
  topic_id         text,
  subject_id       text,
  started_at       timestamptz not null,
  completed_at     timestamptz not null,
  duration_seconds integer not null default 0,
  score            integer not null default 0,
  total            integer not null default 0,
  answers          jsonb not null default '[]'::jsonb,
  created_at       timestamptz not null default now()
);

create index if not exists attempts_user_id_idx on public.attempts (user_id, completed_at desc);
create index if not exists questions_program_idx on public.questions (program_id);
create index if not exists questions_topic_idx on public.questions (topic_id);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.programs   enable row level security;
alter table public.subjects   enable row level security;
alter table public.topics     enable row level security;
alter table public.questions  enable row level security;
alter table public.flashcards enable row level security;
alter table public.profiles   enable row level security;
alter table public.attempts   enable row level security;

-- Catalog is public read-only.
create policy "catalog readable by everyone" on public.programs
  for select using (true);
create policy "subjects readable by everyone" on public.subjects
  for select using (true);
create policy "topics readable by everyone" on public.topics
  for select using (true);
create policy "questions readable by everyone" on public.questions
  for select using (true);
create policy "flashcards readable by everyone" on public.flashcards
  for select using (true);

-- Profiles: users may read/update only their own row.
create policy "profiles are readable by owner" on public.profiles
  for select using (auth.uid()::text = id);
create policy "profiles are insertable by owner" on public.profiles
  for insert with check (auth.uid()::text = id);
create policy "profiles are updatable by owner" on public.profiles
  for update using (auth.uid()::text = id) with check (auth.uid()::text = id);

-- Attempts: users may read/insert/update/delete only their own rows.
create policy "attempts readable by owner" on public.attempts
  for select using (auth.uid()::text = user_id);
create policy "attempts insertable by owner" on public.attempts
  for insert with check (auth.uid()::text = user_id);
create policy "attempts updatable by owner" on public.attempts
  for update using (auth.uid()::text = user_id) with check (auth.uid()::text = user_id);
create policy "attempts deletable by owner" on public.attempts
  for delete using (auth.uid()::text = user_id);

-- Create a profile row automatically when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id::text,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
