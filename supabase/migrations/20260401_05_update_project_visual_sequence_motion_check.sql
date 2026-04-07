alter table public.project_visual_sequence
  alter column motion_preset set default 'static';

alter table public.project_visual_sequence
  drop constraint if exists project_visual_sequence_motion_preset_check;

alter table public.project_visual_sequence
  add constraint project_visual_sequence_motion_preset_check
  check (
    motion_preset = any (
      array[
        'static'::text,
        'pan'::text,
        'zoom-in'::text,
        'zoom-out'::text
      ]
    )
  );
