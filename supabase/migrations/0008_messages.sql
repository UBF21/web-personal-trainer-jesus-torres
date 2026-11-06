-- Personal Trainer Jesús Torres — chat directo entre cada cliente y el
-- entrenador. Cada cliente solo ve y escribe su propia conversación;
-- administrador/webmaster ven y escriben la de cualquier cliente.
-- Pegar y correr completo en: Supabase Dashboard > SQL Editor > New query

create extension if not exists "pgcrypto";

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  sender_role text not null check (sender_role in ('cliente', 'entrenador')),
  sender_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_client_id_idx on messages (client_id, created_at);

alter table messages enable row level security;

create policy "messages select own or staff" on messages for select
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('administrador', 'webmaster')
    or client_id in (select id from clients where email = (auth.jwt() ->> 'email'))
  );

create policy "messages insert own or staff" on messages for insert
  to authenticated
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('administrador', 'webmaster')
    or client_id in (select id from clients where email = (auth.jwt() ->> 'email'))
  );

-- Sin esto, el chat solo se actualizaría al recargar la página — con
-- Realtime, cada mensaje nuevo llega al instante a quien esté mirando.
alter publication supabase_realtime add table messages;
