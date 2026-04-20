-- Agregar user_id a projects
alter table public.projects
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Agregar user_id a project_assets
alter table public.project_assets
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Activar RLS en projects
alter table public.projects enable row level security;

-- Policies para projects
create policy "usuarios ven sus proyectos"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "usuarios crean sus proyectos"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "usuarios editan sus proyectos"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "usuarios eliminan sus proyectos"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Activar RLS en project_assets
alter table public.project_assets enable row level security;

-- Policies para project_assets
create policy "usuarios ven sus assets"
  on public.project_assets for select
  using (auth.uid() = user_id);

create policy "usuarios crean sus assets"
  on public.project_assets for insert
  with check (auth.uid() = user_id);

create policy "usuarios editan sus assets"
  on public.project_assets for update
  using (auth.uid() = user_id);

create policy "usuarios eliminan sus assets"
  on public.project_assets for delete
  using (auth.uid() = user_id);
