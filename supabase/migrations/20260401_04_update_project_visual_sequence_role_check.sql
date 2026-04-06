alter table public.project_visual_sequence
  alter column role set default 'support';

alter table public.project_visual_sequence
  drop constraint if exists project_visual_sequence_role_check;

alter table public.project_visual_sequence
  add constraint project_visual_sequence_role_check
  check (
    role = any (
      array[
        'cover'::text,
        'support'::text,
        'closing'::text
      ]
    )
  );
