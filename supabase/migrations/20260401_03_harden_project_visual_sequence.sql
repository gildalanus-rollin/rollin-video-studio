alter table public.project_visual_sequence
  add column if not exists updated_at timestamp with time zone not null default now();

create index if not exists idx_project_visual_sequence_project_order
  on public.project_visual_sequence(project_id, sequence_order);

create index if not exists idx_project_visual_sequence_asset_id
  on public.project_visual_sequence(asset_id);

create unique index if not exists uniq_project_visual_sequence_order
  on public.project_visual_sequence(project_id, sequence_order);

create or replace function public.set_project_visual_sequence_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_project_visual_sequence_updated_at on public.project_visual_sequence;

create trigger trg_project_visual_sequence_updated_at
before update on public.project_visual_sequence
for each row
execute function public.set_project_visual_sequence_updated_at();
