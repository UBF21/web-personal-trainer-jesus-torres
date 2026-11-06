-- Personal Trainer Jesús Torres — analítica real del dashboard (visitas a
-- la web, nuevos clientes, plan más elegido), igual criterio que se armó
-- para FitBlood pero adaptado: sin backend propio, todo vía Supabase
-- directo desde el navegador.
-- Pegar y correr completo en: Supabase Dashboard > SQL Editor > New query

-- ========== VISITAS ==========
-- Una fila por página vista. Se inserta directo desde el navegador (sin
-- backend de por medio) — por eso sí hay policy de insert, a diferencia
-- de FitBlood donde lo escribía un endpoint con service_role. Nadie puede
-- leerlas directo; solo a través de admin_dashboard_stats() de abajo.

create table if not exists page_views (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  path text not null,
  visitor_id text not null,
  referrer text
);

create index if not exists page_views_created_at_idx on page_views (created_at desc);
create index if not exists page_views_visitor_idx on page_views (visitor_id, created_at desc);

alter table page_views enable row level security;

create policy "page views public insert" on page_views for insert
  to anon, authenticated
  with check (true);

-- ========== ESTADÍSTICAS DEL DASHBOARD ==========
-- Devuelve todo el dashboard en un solo JSON. security definer para poder
-- leer page_views/clients/plans/pending_subscriptions sin pasar por sus
-- políticas de RLS — y por eso valida el rol a mano al entrar, en vez de
-- confiar en esas políticas.
--
-- "Nuevos clientes" = clients.created_at (cuando se aprobó su suscripción).
-- "Ingresos" = precio del plan de cada cliente nuevo, cruzando por nombre
-- con la tabla plans (estimado — no es una tabla de pagos real).
-- Los días se cuentan en hora de Madrid.

create or replace function public.admin_dashboard_stats(p_days integer default 30)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_days         integer := least(greatest(coalesce(p_days, 30), 1), 365);
  v_tz           constant text := 'Europe/Madrid';
  v_today        date := (now() at time zone v_tz)::date;
  v_from         date := v_today - (v_days - 1);
  v_prev_from    date := v_from - v_days;
  v_from_ts      timestamptz := (v_from::timestamp at time zone v_tz);
  v_prev_from_ts timestamptz := (v_prev_from::timestamp at time zone v_tz);
  v_to_ts        timestamptz := ((v_today + 1)::timestamp at time zone v_tz);
  result         jsonb;
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') not in ('administrador', 'webmaster') then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  with
  days as (
    select d::date as day
    from generate_series(v_from, v_today, interval '1 day') d
  ),
  pv as (
    select (created_at at time zone v_tz)::date as day, visitor_id, path, referrer
    from page_views
    where created_at >= v_from_ts and created_at < v_to_ts
  ),
  pv_prev as (
    select visitor_id
    from page_views
    where created_at >= v_prev_from_ts and created_at < v_from_ts
  ),
  new_clients as (
    select c.id, c.plan, (c.created_at at time zone v_tz)::date as day
    from clients c
    where c.created_at >= v_from_ts and c.created_at < v_to_ts
  ),
  new_clients_prev as (
    select id from clients
    where created_at >= v_prev_from_ts and created_at < v_from_ts
  )
  select jsonb_build_object(
    'days', v_days,
    'from', v_from,
    'to', v_today,

    'visits',           (select count(*) from pv),
    'visitors',         (select count(distinct visitor_id) from pv),
    'visits_prev',      (select count(*) from pv_prev),
    'visitors_prev',    (select count(distinct visitor_id) from pv_prev),

    'new_clients',      (select count(*) from new_clients),
    'new_clients_prev', (select count(*) from new_clients_prev),
    'revenue', (
      select coalesce(sum(p.price), 0)
      from new_clients nc
      left join plans p on p.name = nc.plan
    ),
    'pending_now', (select count(*) from pending_subscriptions),

    'visits_series', (
      select jsonb_agg(
        jsonb_build_object('day', d.day, 'visits', coalesce(v.visits, 0), 'visitors', coalesce(v.visitors, 0))
        order by d.day)
      from days d
      left join (
        select day, count(*) as visits, count(distinct visitor_id) as visitors
        from pv group by day
      ) v on v.day = d.day
    ),

    'clients_series', (
      select jsonb_agg(jsonb_build_object('day', d.day, 'clients', coalesce(c.n, 0)) order by d.day)
      from days d
      left join (select day, count(*) as n from new_clients group by day) c on c.day = d.day
    ),

    'top_plans', (
      select coalesce(jsonb_agg(t order by t.n desc), '[]'::jsonb)
      from (
        select plan, count(*)::int as n
        from new_clients group by plan
        order by count(*) desc limit 5
      ) t
    ),

    'top_pages', (
      select coalesce(jsonb_agg(t order by t.views desc), '[]'::jsonb)
      from (
        select path, count(*)::int as views, count(distinct visitor_id)::int as visitors
        from pv group by path
        order by count(*) desc limit 8
      ) t
    ),

    'sources', (
      select coalesce(jsonb_agg(t order by t.visitors desc), '[]'::jsonb)
      from (
        select coalesce(
                 nullif(split_part(regexp_replace(referrer, '^https?://(www\.)?', ''), '/', 1), ''),
                 'Directo') as source,
               count(distinct visitor_id)::int as visitors
        from pv
        group by 1
        order by count(distinct visitor_id) desc
        limit 6
      ) t
    )
  )
  into result;

  return result;
end;
$$;

revoke all on function public.admin_dashboard_stats(integer) from public, anon;
grant execute on function public.admin_dashboard_stats(integer) to authenticated;
