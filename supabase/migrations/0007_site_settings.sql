-- Personal Trainer Jesús Torres — modo mantenimiento real, controlado desde
-- el panel (antes era una variable de entorno fija que había que cambiar
-- en Netlify y volver a desplegar).
-- Pegar y correr completo en: Supabase Dashboard > SQL Editor > New query

create table if not exists site_settings (
  id text primary key default 'default',
  maintenance_mode boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into site_settings (id, maintenance_mode)
values ('default', false)
on conflict (id) do nothing;

alter table site_settings enable row level security;

-- Cualquier visitante necesita leer esto para saber si debe ver la página
-- de mantenimiento — no hay datos sensibles acá.
create policy "site settings publicly readable" on site_settings for select
  using (true);

-- Solo el webmaster puede prender/apagar el mantenimiento.
create policy "site settings webmaster update" on site_settings for update
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'webmaster')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'webmaster');
