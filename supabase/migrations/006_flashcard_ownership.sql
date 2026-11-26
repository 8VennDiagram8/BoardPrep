-- User-generated/typed flashcards are private to their account; seed cards stay public.

alter table public.flashcards
  add column if not exists source text not null default 'seed'
    check (source in ('seed', 'generated', 'manual')),
  add column if not exists generated_at timestamptz,
  add column if not exists user_id text;

create index if not exists flashcards_user_id_idx on public.flashcards (user_id);

drop policy if exists "flashcards readable by everyone" on public.flashcards;
create policy "seed flashcards readable by everyone" on public.flashcards
  for select using (source = 'seed' or source is null);
create policy "users read own flashcards" on public.flashcards
  for select using (auth.uid()::text = user_id);
create policy "users insert own flashcards" on public.flashcards
  for insert to authenticated
  with check (source in ('generated', 'manual') and auth.uid()::text = user_id);
