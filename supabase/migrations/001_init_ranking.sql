-- supabase/migrations/001_init_ranking.sql
-- Führe diesen SQL-Block im Supabase SQL Editor aus.

-- 1. Tabelle für Benchmark-Ergebnisse erstellen
create table if not exists public.benchmark_results (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  benchmark_version text not null,
  app_version text,

  model_id text not null,
  model_name text not null,
  model_size text,

  tokens_per_second numeric not null,
  first_token_ms integer,
  total_time_ms integer not null,

  device_class text,
  browser text,
  os text,

  webgpu_supported boolean,
  webgpu_vendor text,
  webgpu_adapter text,

  install_id_hash text not null,
  valid boolean not null default true
);

-- 2. Index für schnelleres Aggregieren und Rate-Limiting hinzufügen
create index if not exists idx_benchmark_model_id on public.benchmark_results(model_id);
create index if not exists idx_benchmark_install_hash on public.benchmark_results(install_id_hash, created_at);

-- 3. Aggregierte View für das Leaderboard erstellen
create or replace view public.leaderboard_public as
select
  model_id,
  model_name,
  count(*) as sample_size,
  round(avg(tokens_per_second)::numeric, 2) as avg_tps,
  round(percentile_cont(0.5) within group (order by tokens_per_second)::numeric, 2) as median_tps,
  min(tokens_per_second) as min_tps,
  max(tokens_per_second) as max_tps
from public.benchmark_results
where valid = true
group by model_id, model_name;

-- 4. Sicherheit (RLS) konfigurieren
alter table public.benchmark_results enable row level security;

-- Policy: Niemand darf direkt in die Tabelle schreiben (nur über Service Role / Edge Function)
-- Policy: Niemand darf die Rohdaten direkt lesen
-- (Standardmäßig blockiert RLS alles, wenn keine Policy existiert)

-- Policy für den öffentlichen Lesezugriff auf die VIEW
-- Hinweis: In Supabase haben Views keine eigenen RLS-Policies, sondern erben sie von der Basistabelle.
-- Wir nutzen eine SECURITY DEFINER Funktion oder erlauben SELECT auf die View für 'anon'.
grant select on public.leaderboard_public to anon;
grant select on public.leaderboard_public to authenticated;
