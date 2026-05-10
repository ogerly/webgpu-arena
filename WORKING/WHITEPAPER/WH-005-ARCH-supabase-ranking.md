# Whitepaper WP-005: Supabase Ranking-Infrastruktur

**Status:** Aktiv / Implementierung  
**Version:** 1.0.0  
**Autor:** Antigravity (AI Architect)  

---

## 1. Architektur-Übersicht

Die WebGPU-Arena nutzt Supabase als Backend für das optionale globale Leaderboard. Da die Anwendung als statische PWA (GitHub Pages) läuft, dient Supabase als serverlose Brücke für die persistente Datenspeicherung.

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

## 5. Frontend-Integration (Sicherheits-Refactor)

Um maximale Sicherheit zu gewährleisten, wurde die Integration grundlegend überarbeitet:
1. **Kein Supabase-Key**: Die App enthält **keine API-Keys** (Anon-Key) im Frontend-Code.
2. **Direct Fetch**: Statt des Supabase-Clients nutzt die App die native `fetch` API.
3. **Endpoint**: Anfragen gehen direkt an den Edge Function Endpunkt: `https://[PROJECT_ID].supabase.co/functions/v1/submit-ranking`.

### 5.1 Vorteil
Selbst wenn der Quellcode der PWA analysiert wird, finden Angreifer keine Zugangsdaten. Die Edge Function übernimmt die volle Kontrolle über die Datenbank-Interaktion.

---

## 6. API & Rate Limiting (Gatekeeper)

### 6.1 Identitäts-Schutz
- Die `install_id` des Clients wird niemals im Klartext gespeichert.
- Die Edge Function verwendet einen serverseitigen **SALT** (Umgebungsvariable), um die ID zu hashen: `SHA256(install_id + SALT)`.

### 6.2 Zugriffskontrolle (CORS)
- Da kein Key verwendet wird, stützt sich die Sicherheit auf **CORS-Policies**.
- Die Edge Function akzeptiert nur Anfragen von validen Origins (Github Pages / Localhost).
- Zusätzlich validiert die Funktion die Payload-Struktur und die Plausibilität der Daten.

### 6.3 CORS & Herkunft
- Die API antwortet nur auf Anfragen von definierten Domains (z.B. `ogerly.github.io` und `localhost`).
- Anfragen von fremden Skripten oder anderen Webseiten werden auf Browser-Ebene blockiert.

---

## 7. Automatisierte Qualitätssicherung

Das Ranking-System wird durch automatisierte Unit-Tests (`tests/ranking.test.js`) abgesichert, um Fehlfunktionen und Datenschutz-Verletzungen zu verhindern.

### 7.1 Test-Szenarien
- **Consent-Validierung**: Verifikation, dass der Global-Service bei fehlender Zustimmung (`denied`) den API-Aufruf strikt verweigert.
- **Payload-Integrität**: Sicherstellung, dass nur die im Schema definierten Metadaten (TPS, Modell-ID, etc.) für den Upload vorbereitet werden.
- **Local Storage Management**: Test der korrekten Speicherung und Limitierung (max. 50 Einträge) der lokalen Benchmarks.

---
*Dieses Dokument wird bei jeder Änderung an der Backend-Infrastruktur aktualisiert.*
