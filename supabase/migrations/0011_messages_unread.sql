-- Personal Trainer Jesús Torres — marca de "leído" del chat para el
-- staff. Guarda cuándo el administrador/webmaster vio por última vez la
-- conversación de cada cliente, para poder mostrar cuántos mensajes
-- (y cuántos clientes) quedan sin leer.
-- Pegar y correr completo en: Supabase Dashboard > SQL Editor > New query

alter table clients add column if not exists last_read_by_staff_at timestamptz;
