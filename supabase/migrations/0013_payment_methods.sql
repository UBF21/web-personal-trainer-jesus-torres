-- Personal Trainer Jesús Torres — el IBAN y el correo para comprobantes
-- estaban escritos a mano en training-plans.tsx. Esto los saca a una tabla
-- editable desde el panel (solo administrador/webmaster), igual que ya se
-- hizo con el modo mantenimiento en site_settings.
-- Pegar y correr completo en: Supabase Dashboard > SQL Editor > New query

create table if not exists payment_methods (
  method_key text primary key,
  enabled boolean not null default true,
  iban text not null default '',
  contact_email text not null default '',
  updated_at timestamptz not null default now()
);

insert into payment_methods (method_key, enabled, iban, contact_email)
values ('bacs', true, 'LT02 3130 0101 3018 4834', 'personaltrainerjesustorres@gmail.com')
on conflict (method_key) do nothing;

alter table payment_methods enable row level security;

-- Cualquier visitante necesita leer esto para ver a dónde transferir al
-- comprar un plan — no hay datos sensibles acá.
create policy "payment methods publicly readable" on payment_methods for select
  using (true);

create policy "payment methods admin update" on payment_methods for update
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('administrador', 'webmaster'))
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('administrador', 'webmaster'));
