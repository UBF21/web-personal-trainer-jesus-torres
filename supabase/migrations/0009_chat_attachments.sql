-- Personal Trainer Jesús Torres — adjuntos (fotos/archivos) en el chat.
-- Pegar y correr completo en: Supabase Dashboard > SQL Editor > New query

alter table messages alter column body drop not null;
alter table messages add column if not exists attachment_url text;
alter table messages add column if not exists attachment_name text;
alter table messages add column if not exists attachment_type text;

-- El bucket "chat-attachments" ya se crea aparte (vía script), pero la
-- política de subida va acá: cada cliente solo puede subir dentro de su
-- propia carpeta (chat/<client_id>/...), administrador/webmaster a
-- cualquiera. La lectura es pública (bucket público), no necesita política.
create policy "chat attachments insert own or staff" on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'chat-attachments'
    and (
      (auth.jwt() -> 'app_metadata' ->> 'role') in ('administrador', 'webmaster')
      or (storage.foldername(name))[2] in (select id::text from clients where email = (auth.jwt() ->> 'email'))
    )
  );
