-- Personal Trainer Jesús Torres — acceso directo desde el frontend, sin
-- backend Express de por medio (se eliminó junto con la integración de
-- KunfuPay). El rol del usuario autenticado vive en app_metadata.role
-- (solo lo puede fijar el servidor/dashboard de Supabase, nunca el
-- navegador) y estas políticas lo usan para decidir quién puede escribir.
-- Pegar y correr completo en: Supabase Dashboard > SQL Editor > New query

-- ================================
-- images — lectura ya es pública; agregamos escritura solo para
-- administrador/webmaster.
-- ================================
create policy "images admin insert" on images for insert
  to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('administrador', 'webmaster'));

create policy "images admin update" on images for update
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('administrador', 'webmaster'))
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('administrador', 'webmaster'));

create policy "images admin delete" on images for delete
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('administrador', 'webmaster'));

-- ================================
-- plans — misma idea.
-- ================================
create policy "plans admin insert" on plans for insert
  to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('administrador', 'webmaster'));

create policy "plans admin update" on plans for update
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('administrador', 'webmaster'))
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('administrador', 'webmaster'));

create policy "plans admin delete" on plans for delete
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('administrador', 'webmaster'));

-- ================================
-- clients — la política vieja de lectura pública ("clients are publicly
-- readable") exponía correos y progreso de todos los clientes a cualquiera
-- con la anon key (antes no importaba porque solo el backend, con
-- service_role, leía esta tabla). Ahora el frontend lee directo: cada
-- cliente solo ve su propia fila, el admin/webmaster ve todas.
-- ================================
drop policy if exists "clients are publicly readable" on clients;

create policy "clients read own or admin" on clients for select
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('administrador', 'webmaster')
    or email = (auth.jwt() ->> 'email')
  );

create policy "clients admin insert" on clients for insert
  to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('administrador', 'webmaster'));

create policy "clients admin update" on clients for update
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('administrador', 'webmaster'))
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('administrador', 'webmaster'));

create policy "clients admin delete" on clients for delete
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('administrador', 'webmaster'));

-- ================================
-- pending_subscriptions — mismo problema de exposición que "clients"
-- (nombre, correo, banco, comprobante visibles a cualquiera). Cualquier
-- visitante (sin sesión) puede CREAR una solicitud al elegir un plan, pero
-- solo el admin/webmaster puede verlas o borrarlas.
-- ================================
drop policy if exists "pending subscriptions are publicly readable" on pending_subscriptions;

create policy "pending subscriptions public insert" on pending_subscriptions for insert
  to anon, authenticated
  with check (true);

create policy "pending subscriptions admin select" on pending_subscriptions for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('administrador', 'webmaster'));

create policy "pending subscriptions admin delete" on pending_subscriptions for delete
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('administrador', 'webmaster'));

-- ================================
-- Aprobar una solicitud pendiente: la pasa a la tabla de clientes y borra
-- la solicitud, en un solo paso. "security invoker" (el default) hace que
-- esto respete las políticas de arriba — si quien llama no es admin, el
-- insert/delete de adentro falla igual que si lo intentara a mano.
-- ================================
create or replace function approve_pending_subscription(pending_id uuid)
returns clients
language plpgsql
security invoker
as $$
declare
  req pending_subscriptions;
  result clients;
begin
  select * into req from pending_subscriptions where id = pending_id;
  if req is null then
    raise exception 'Pending subscription not found';
  end if;

  insert into clients (name, email, plan, status, progress)
  values (req.name, req.email, req.plan, 'Activo', 0)
  on conflict (email) do update set plan = excluded.plan, status = 'Activo'
  returning * into result;

  delete from pending_subscriptions where id = pending_id;

  return result;
end;
$$;

grant execute on function approve_pending_subscription(uuid) to authenticated;

-- ================================
-- Storage: bucket "jt-Images" — la lectura pública ya funciona sola (es un
-- bucket público, las URL públicas no pasan por RLS). Solo hace falta
-- restringir quién puede subir/borrar archivos.
-- ================================
create policy "jt-images admin insert" on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'jt-Images'
    and (auth.jwt() -> 'app_metadata' ->> 'role') in ('administrador', 'webmaster')
  );

create policy "jt-images admin delete" on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'jt-Images'
    and (auth.jwt() -> 'app_metadata' ->> 'role') in ('administrador', 'webmaster')
  );
