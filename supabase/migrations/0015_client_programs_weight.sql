-- Personal Trainer Jesús Torres — conecta a Supabase lo que en "Mi plan"
-- era maqueta: el peso (antes se fabricaba con un hash del id del
-- cliente, siempre el mismo número falso) y el programa de entrenamiento
-- + guía de nutrición que el admin arma para cada cliente (antes solo
-- vivían en memoria del navegador y se perdían al recargar).
-- Pegar y correr completo en: Supabase Dashboard > SQL Editor > New query

alter table clients
  add column if not exists start_weight numeric,
  add column if not exists goal_weight numeric;

create table if not exists weight_logs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  weight numeric not null,
  logged_at timestamptz not null default now()
);

create table if not exists training_programs (
  client_id uuid primary key references clients(id) on delete cascade,
  goal text not null,
  level text not null,
  per_week integer not null,
  phase text not null,
  phase_number integer not null,
  notes text not null default '',
  routine jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

create table if not exists nutrition_guides (
  client_id uuid primary key references clients(id) on delete cascade,
  calories integer not null,
  protein integer not null,
  carbs integer not null,
  fats integer not null,
  water text not null default '',
  meals jsonb not null default '[]',
  supplements jsonb not null default '[]',
  notes text not null default '',
  updated_at timestamptz not null default now()
);

alter table weight_logs enable row level security;
alter table training_programs enable row level security;
alter table nutrition_guides enable row level security;

-- Mismo criterio en las tres: el cliente ve solo lo suyo (vía su correo
-- en el JWT, join contra "clients"); administrador/webmaster con el
-- permiso 'operations' ven y editan todo (ver 0014_role_permissions.sql).

create policy "weight logs read own or admin" on weight_logs for select
  to authenticated
  using (
    public.has_permission('operations')
    or exists (select 1 from clients c where c.id = weight_logs.client_id and c.email = (auth.jwt() ->> 'email'))
  );
create policy "weight logs admin insert" on weight_logs for insert
  to authenticated
  with check (public.has_permission('operations'));
create policy "weight logs admin delete" on weight_logs for delete
  to authenticated
  using (public.has_permission('operations'));

create policy "training programs read own or admin" on training_programs for select
  to authenticated
  using (
    public.has_permission('operations')
    or exists (select 1 from clients c where c.id = training_programs.client_id and c.email = (auth.jwt() ->> 'email'))
  );
create policy "training programs admin insert" on training_programs for insert
  to authenticated
  with check (public.has_permission('operations'));
create policy "training programs admin update" on training_programs for update
  to authenticated
  using (public.has_permission('operations'))
  with check (public.has_permission('operations'));

create policy "nutrition guides read own or admin" on nutrition_guides for select
  to authenticated
  using (
    public.has_permission('operations')
    or exists (select 1 from clients c where c.id = nutrition_guides.client_id and c.email = (auth.jwt() ->> 'email'))
  );
create policy "nutrition guides admin insert" on nutrition_guides for insert
  to authenticated
  with check (public.has_permission('operations'));
create policy "nutrition guides admin update" on nutrition_guides for update
  to authenticated
  using (public.has_permission('operations'))
  with check (public.has_permission('operations'));
