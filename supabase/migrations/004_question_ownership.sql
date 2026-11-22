-- Keep user-added questions private to the account that created them.
-- Bundled (seed) questions remain readable by everyone.

alter table public.questions
  add column if not exists user_id text;

create index if not exists questions_user_id_idx on public.questions (user_id);

-- Seed questions are public; generated/manual questions are visible only to their owner.
drop policy if exists "questions readable by everyone" on public.questions;
create policy "seed questions readable by everyone" on public.questions
  for select using (source = 'seed' or source is null);
create policy "users read own added questions" on public.questions
  for select using (auth.uid()::text = user_id);

-- Only authenticated users may add questions, and only under their own id.
drop policy if exists "authenticated users can insert generated questions" on public.questions;
create policy "users insert own questions" on public.questions
  for insert to authenticated
  with check (source in ('generated', 'manual') and auth.uid()::text = user_id);
