-- Personal Trainer Jesús Torres — numeración y registro de las facturas
-- proforma que se mandan al aprobar una suscripción.
-- Pegar y correr completo en: Supabase Dashboard > SQL Editor > New query

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  number integer generated always as identity (start with 1),
  client_id uuid references clients(id) on delete set null,
  client_name text not null,
  client_email text not null,
  plan text not null,
  subtotal numeric(10,2) not null,
  iva numeric(10,2) not null,
  total numeric(10,2) not null,
  issued_at timestamptz not null default now()
);

alter table invoices enable row level security;

create policy "invoices admin select" on invoices for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('administrador', 'webmaster'));
