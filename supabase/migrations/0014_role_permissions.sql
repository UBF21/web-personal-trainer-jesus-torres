-- Personal Trainer Jesús Torres — permisos configurables para el rol
-- administrador, misma lógica que usa FitBlood (role_permissions +
-- has_permission()). Acá el rol vive en app_metadata del JWT (no en una
-- tabla "profiles"), así que has_permission lee auth.jwt() directo.
-- Pegar y correr completo en: Supabase Dashboard > SQL Editor > New query

create table if not exists role_permissions (
  permission_key text primary key,
  administrador boolean not null default false
);

insert into role_permissions (permission_key, administrador) values
  ('operations', true),
  ('site', false)
on conflict (permission_key) do nothing;

alter table role_permissions enable row level security;

create policy "staff can view permissions" on role_permissions for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('administrador', 'webmaster'));

create policy "webmaster can update permissions" on role_permissions for update
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'webmaster')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'webmaster');

-- webmaster siempre tiene todo; administrador depende de lo que el
-- webmaster configuró acá; cliente nunca.
create or replace function public.has_permission(key text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select case (auth.jwt() -> 'app_metadata' ->> 'role')
    when 'webmaster' then true
    when 'administrador' then coalesce(
      (select administrador from role_permissions where permission_key = key),
      false
    )
    else false
  end;
$$;

-- ================================
-- A partir de acá, las políticas que antes exigían
-- "role in ('administrador','webmaster')" para escribir pasan a depender
-- del permiso 'operations' (administrador puede perderlo; webmaster
-- siempre lo tiene por el case de arriba).
-- ================================

drop policy if exists "images admin insert" on images;
create policy "images admin insert" on images for insert
  to authenticated
  with check (public.has_permission('operations'));

drop policy if exists "images admin update" on images;
create policy "images admin update" on images for update
  to authenticated
  using (public.has_permission('operations'))
  with check (public.has_permission('operations'));

drop policy if exists "images admin delete" on images;
create policy "images admin delete" on images for delete
  to authenticated
  using (public.has_permission('operations'));

drop policy if exists "plans admin insert" on plans;
create policy "plans admin insert" on plans for insert
  to authenticated
  with check (public.has_permission('operations'));

drop policy if exists "plans admin update" on plans;
create policy "plans admin update" on plans for update
  to authenticated
  using (public.has_permission('operations'))
  with check (public.has_permission('operations'));

drop policy if exists "plans admin delete" on plans;
create policy "plans admin delete" on plans for delete
  to authenticated
  using (public.has_permission('operations'));

drop policy if exists "clients read own or admin" on clients;
create policy "clients read own or admin" on clients for select
  to authenticated
  using (
    public.has_permission('operations')
    or email = (auth.jwt() ->> 'email')
  );

drop policy if exists "clients admin insert" on clients;
create policy "clients admin insert" on clients for insert
  to authenticated
  with check (public.has_permission('operations'));

drop policy if exists "clients admin update" on clients;
create policy "clients admin update" on clients for update
  to authenticated
  using (public.has_permission('operations'))
  with check (public.has_permission('operations'));

drop policy if exists "clients admin delete" on clients;
create policy "clients admin delete" on clients for delete
  to authenticated
  using (public.has_permission('operations'));

drop policy if exists "pending subscriptions admin select" on pending_subscriptions;
create policy "pending subscriptions admin select" on pending_subscriptions for select
  to authenticated
  using (public.has_permission('operations'));

drop policy if exists "pending subscriptions admin delete" on pending_subscriptions;
create policy "pending subscriptions admin delete" on pending_subscriptions for delete
  to authenticated
  using (public.has_permission('operations'));

drop policy if exists "jt-images admin insert" on storage.objects;
create policy "jt-images admin insert" on storage.objects for insert
  to authenticated
  with check (bucket_id = 'jt-Images' and public.has_permission('operations'));

drop policy if exists "jt-images admin delete" on storage.objects;
create policy "jt-images admin delete" on storage.objects for delete
  to authenticated
  using (bucket_id = 'jt-Images' and public.has_permission('operations'));

-- site_settings (0007) exigía webmaster a secas — ahora puede delegarse
-- con el permiso 'site'.
drop policy if exists "site settings webmaster update" on site_settings;
create policy "site settings update" on site_settings for update
  to authenticated
  using (public.has_permission('site'))
  with check (public.has_permission('site'));

-- Nota: asignar/quitar el rol administrador, inactivar, eliminar cuentas y
-- restablecer contraseñas se quedan reservados solo al webmaster — no se
-- exponen como permisos delegables (misma regla que FitBlood).
