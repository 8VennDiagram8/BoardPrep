-- Allow questions typed manually in the UI in addition to seed/generated ones.

alter table public.questions drop constraint if exists questions_source_check;
alter table public.questions add constraint questions_source_check
  check (source in ('seed', 'generated', 'manual'));
