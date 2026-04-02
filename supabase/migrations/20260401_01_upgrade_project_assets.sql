alter table public.project_assets
  add column if not exists storage_bucket text,
  add column if not exists storage_path text,
  add column if not exists original_filename text,
  add column if not exists mime_type text,
  add column if not exists file_size_bytes bigint,
  add column if not exists width integer,
  add column if not exists height integer,
  add column if not exists duration_seconds numeric,
  add column if not exists is_primary boolean not null default false,
  add column if not exists status text not null default 'ready',
  add column if not exists updated_at timestamp with time zone not null default now();

alter table public.project_assets
  drop constraint if exists project_assets_status_check;

alter table public.project_assets
  add constraint project_assets_status_check
  check (status in ('uploading', 'ready', 'error'));

create index if not exists idx_project_assets_project_sort
  on public.project_assets(project_id, sort_order);

create index if not exists idx_project_assets_project_type
  on public.project_assets(project_id, asset_type);

create unique index if not exists uniq_project_assets_primary_image_per_project
  on public.project_assets(project_id)
  where asset_type = 'image' and is_primary = true;

create or replace function public.set_project_assets_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_project_assets_updated_at on public.project_assets;

create trigger trg_project_assets_updated_at
before update on public.project_assets
for each row
execute function public.set_project_assets_updated_at();

update public.project_assets
set is_primary = false
where asset_type = 'image';

with ranked_images as (
  select
    id,
    row_number() over (
      partition by project_id
      order by
        case when is_selected then 0 else 1 end,
        sort_order asc,
        created_at asc,
        id asc
    ) as rn
  from public.project_assets
  where asset_type = 'image'
)
update public.project_assets pa
set is_primary = true
from ranked_images ri
where pa.id = ri.id
  and ri.rn = 1;
