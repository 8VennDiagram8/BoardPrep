-- Support AI-generated questions saved from the Question Generator.

alter table public.questions
  add column if not exists source text not null default 'seed'
    check (source in ('seed', 'generated')),
  add column if not exists generated_at timestamptz;

create index if not exists questions_source_idx on public.questions (source);

-- Signed-in reviewers may add new generated items to the shared bank.
-- Bundled/seed rows remain read-only to clients.
create policy "authenticated users can insert generated questions"
  on public.questions for insert
  to authenticated
  with check (source = 'generated');
