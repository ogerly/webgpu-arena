# Whitepaper WP-005: Supabase Ranking-Infrastruktur

**Status:** Aktiv / Implementierung  
**Version:** 1.0.0  
**Autor:** Antigravity (AI Architect)  

---

## 1. Architektur-Übersicht

Die OS-Arena nutzt Supabase als Backend für das optionale globale Leaderboard. Da die Anwendung als statische PWA (GitHub Pages) läuft, dient Supabase als serverlose Brücke für die persistente Datenspeicherung.

### 1.1 Sicherheits-Prinzip
Es gibt **keinen direkten Schreibzugriff** vom Frontend auf die Datenbank. Alle Daten fließen durch eine **Supabase Edge Function**, die den Payload validiert, filtert und normalisiert.

---

## 2. Datenbank-Schema

### 2.1 Tabelle: `benchmark_results`
Diese Tabelle speichert die anonymisierten Performance-Daten der lokalen Modelle.

```sql
create table benchmark_results (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Versionierung
  benchmark_version text not null, -- Aktuell "1.0.0"
  app_version text,

  -- Modell-Info
  model_id text not null,
  model_name text not null,
  model_size text,

  -- Performance-Metriken
  tokens_per_second numeric not null,
  first_token_ms integer,
  total_time_ms integer not null,

  -- System-Info (Anonymisiert)
  device_class text, -- 'mobile', 'desktop', 'tablet'
  browser text,
  os text,

  -- WebGPU Details
  webgpu_supported boolean,
  webgpu_vendor text,
  webgpu_adapter text,

  -- Identifikation (Anonymisiert)
  install_id_hash text not null, -- Gehashter Wert der lokalen Install-ID

  valid boolean not null default true
);
```

### 2.2 View: `leaderboard_public`
Stellt aggregierte Daten für das Frontend bereit, um einzelne Uploads zu verschleiern und Trends zu zeigen.

```sql
create view leaderboard_public as
select
  model_id,
  model_name,
  count(*) as sample_size,
  round(avg(tokens_per_second), 2) as avg_tps,
  round(percentile_cont(0.5) within group (order by tokens_per_second)::numeric, 2) as median_tps,
  min(tokens_per_second) as min_tps,
  max(tokens_per_second) as max_tps
from benchmark_results
where valid = true
group by model_id, model_name;
```

---

## 3. Sicherheits-Konfiguration (RLS)

- **Authentifizierung**: Es ist kein Login erforderlich (Anonyme Benchmarks).
- **Tabellen-Zugriff**: 
  - `SELECT`: Deaktiviert für die Tabelle `benchmark_results`.
  - `INSERT`: Deaktiviert für alle Rollen.
  - `UPDATE/DELETE`: Deaktiviert.
- **View-Zugriff**:
  - `SELECT`: Erlaubt für die Rolle `anon` (öffentlich lesbar).

---

## 4. Edge Function: `submit-ranking`

Die Edge Function übernimmt die Rolle des Gatekeepers.

### 4.1 Aufgaben
1. **Validierung**: Prüft, ob `tokens_per_second` im plausiblen Bereich liegen (z.B. 0.1 bis 500).
2. **Sanitization**: Entfernt alle Felder, die nicht im Schema definiert sind (Schutz gegen Injektion von Metadaten).
3. **Anonymisierung**: Hashet die übergebene `install_id` mit einem serverseitigen Salt, bevor sie in `install_id_hash` gespeichert wird.
4. **Rate Limiting**: Begrenzt die Uploads pro `install_id_hash` (z.B. max. 10 pro Stunde), um Spam zu verhindern.

---

## 5. Frontend-Integration

Die App nutzt den Supabase Client nur für:
1. Den Aufruf der Edge Function (`supabase.functions.invoke('submit-ranking', ...)`).
2. Den Abruf der aggregierten Daten aus der View `leaderboard_public`.

Die API-Keys (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) werden in der `.env` verwaltet und zur Build-Zeit injiziert.

---
*Dieses Dokument wird bei jeder Änderung an der Backend-Infrastruktur aktualisiert.*
