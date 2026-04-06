alter table public.project_assets
  drop constraint if exists project_assets_source_type_check;

alter table public.project_assets
  add constraint project_assets_source_type_check
  check (
    source_type = any (
      array[
        'internal'::text,
        'external'::text,
        'storage'::text,
        'url'::text
      ]
    )
  );
