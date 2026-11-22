-- Personal Trainer Jesús Torres — agrega pago con tarjeta (SumUp) junto a
-- la transferencia bancaria que ya existía. El checkout se crea y se
-- confirma vía Edge Functions (create-sumup-checkout / sumup-webhook):
-- la clave secreta de SumUp no puede vivir en el navegador.
-- Pegar y correr completo en: Supabase Dashboard > SQL Editor > New query

insert into payment_methods (method_key, enabled, iban, contact_email)
values ('sumup', false, '', '')
on conflict (method_key) do nothing;

-- payment_method: cómo pagó esta solicitud ('bacs' | 'sumup'); las
-- existentes (transferencia, creadas antes de esto) se asumen 'bacs'.
-- sumup_checkout_id: el id del checkout en SumUp, para que el webhook
-- encuentre la solicitud cuando SumUp confirme el pago.
alter table pending_subscriptions
  add column if not exists payment_method text not null default 'bacs',
  add column if not exists sumup_checkout_id text;

create index if not exists pending_subscriptions_sumup_checkout_id_idx
  on pending_subscriptions (sumup_checkout_id);
