## WORKPAPER: OS Arena Ranking Upload / Global Leaderboard

````md
# WORKPAPER: OS Arena Ranking Upload / Global Leaderboard

## Status

**Abgeschlossen / Implementiert (30. April 2026)**

## Projekt

OS Arena  
Repository: https://github.com/ogerly/os-arena  
Live: https://ogerly.github.io/os-arena/

## Ziel

OS Arena bleibt grundsätzlich eine lokal laufende Browser-/PWA-Anwendung.

Das bestehende Ranking wird erweitert um:

1. ein rein lokales Ranking
2. ein optionales globales Ranking
3. einen freiwilligen Upload anonymisierter Benchmark-Daten

Grundprinzip:

> Lokal zuerst. Global nur mit Zustimmung.

## Ausgangslage

OS Arena läuft aktuell über GitHub Pages als statische Webanwendung.

Die Anwendung soll Modelle lokal im Browser nutzbar machen. Netzwerkverbindungen entstehen nur dort, wo sie technisch notwendig oder ausdrücklich vom Nutzer ausgelöst sind:

- Modell-Download
- optionaler Ranking-Upload
- optionaler Abruf des globalen Leaderboards

GitHub Pages selbst kann keine Rankingdaten persistent speichern, weil es kein Backend und keinen serverseitigen Schreibprozess gibt.

## Architekturentscheidung

GitHub Pages bleibt das Hosting für die OS-Arena-App.

Supabase Free wird als externer Rankingdienst verwendet:

```text
OS Arena PWA / Browser
  |
  | freiwilliger Upload
  v
Supabase Edge Function
  |
  | Validierung / Normalisierung
  v
Supabase Postgres
  |
  v
Public Leaderboard View
````

## Nicht-Ziele

Diese Umsetzung soll ausdrücklich nicht:

* Prompts speichern
* Antworten speichern
* Chatverläufe speichern
* lokale Dateien übertragen
* personenbezogene Profile erstellen
* Login erzwingen
* einen eigenen Server benötigen
* GitHub-Tokens im Frontend verwenden
* automatisch ohne Zustimmung Daten senden

## Datenschutz- und Vertrauensprinzip

Der Nutzer muss klar verstehen:

* OS Arena läuft lokal
* lokales Ranking bleibt lokal
* globales Ranking benötigt Internet
* Upload erfolgt nur freiwillig
* es werden nur technische Benchmarkdaten gesendet

## UI-Text für Upload-Zustimmung

```text
Globales Ranking aktivieren

OS Arena läuft lokal in deinem Browser.

Wenn du dein Ergebnis in das globale Ranking eintragen möchtest, wird ein anonymisierter Benchmark-Datensatz an den OS-Arena-Rankingdienst gesendet.

Gesendet werden:
- Modellname
- Benchmark-Version
- Laufzeit / Tokens pro Sekunde
- Gerätekategorie
- Browser / WebGPU-Status
- Zeitpunkt
- zufällige anonyme Installations-ID

Nicht gesendet werden:
- Prompts
- Antworten
- lokale Dateien
- persönliche Daten
- Chatverläufe

[Ranking nicht senden] [Anonym senden]
```

## Datenmodell

Tabelle: `benchmark_results`

```sql
create table benchmark_results (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  benchmark_version text not null,
  app_version text,

  model_id text not null,
  model_name text not null,
  model_size text,

  tokens_per_second numeric,
  first_token_ms integer,
  total_time_ms integer,

  device_class text,
  browser text,
  os text,

  webgpu_supported boolean,
  webgpu_vendor text,
  webgpu_adapter text,

  install_id_hash text,

  valid boolean not null default true
);
```

## Public Leaderboard View

```sql
create view leaderboard_public as
select
  model_id,
  model_name,
  benchmark_version,
  device_class,
  count(*) as runs,
  round(avg(tokens_per_second), 2) as avg_tokens_per_second,
  round(percentile_cont(0.5) within group (order by tokens_per_second)::numeric, 2) as median_tokens_per_second,
  round(avg(first_token_ms)) as avg_first_token_ms
from benchmark_results
where valid = true
group by model_id, model_name, benchmark_version, device_class;
```

## Upload-Endpunkt

Upload erfolgt nicht direkt in die Tabelle, sondern über eine Supabase Edge Function.

Pfad-Beispiel:

```text
/functions/v1/submit-ranking
```

Grund:

* Daten validieren
* Felder normalisieren
* Manipulation erschweren
* Spam begrenzen
* nur erlaubte Modelle akzeptieren
* Prompts und freie Textdaten sicher verwerfen

## Beispiel-Payload

```json
{
  "benchmark_version": "1.0.0",
  "app_version": "0.1.0",
  "model_id": "example/model-id",
  "model_name": "Example Model",
  "model_size": "1B",
  "tokens_per_second": 18.42,
  "first_token_ms": 650,
  "total_time_ms": 12000,
  "device_class": "laptop",
  "browser": "Chrome",
  "os": "Windows",
  "webgpu_supported": true,
  "webgpu_vendor": "nvidia",
  "webgpu_adapter": "RTX 5090",
  "install_id": "local-random-client-id"
}
```

## Installations-ID

Die App erzeugt lokal eine zufällige ID.

Diese ID dient nur dazu:

* doppelte Uploads zu erkennen
* grobes Rate-Limiting zu ermöglichen
* keine Accounts zu benötigen

Die ID darf nicht als persönliche Nutzerkennung verstanden werden.

Empfehlung:

* lokal in IndexedDB oder localStorage speichern
* vor Speicherung in Supabase hashen
* keine E-Mail, kein Name, kein Login

## Lokales Ranking

Das lokale Ranking bleibt vollständig im Browser.

Speicher:

* IndexedDB bevorzugt
* localStorage nur für einfache Zwischenstände

Lokale Daten enthalten vollständige Benchmark-Sessions, aber verlassen das Gerät nicht automatisch.

## Globales Ranking

Das globale Ranking wird nur geladen, wenn:

* der Nutzer den Rankingbereich öffnet
* Internet verfügbar ist
* klar sichtbar ist, dass globale Daten aus dem Netz geladen werden

UI-Hinweis:

```text
Dieses globale Ranking wird aus anonym freiwillig eingesendeten Benchmarkdaten geladen.
Dein eigenes Ergebnis wird nur übertragen, wenn du es aktiv sendest.
```

## Abuse-Schutz

Mindestens umsetzen:

* keine freien Textfelder speichern
* nur bekannte Modell-IDs akzeptieren
* unrealistische Werte ablehnen
* `tokens_per_second > 0`
* `total_time_ms > 0`
* `benchmark_version` erforderlich
* Upload-Größe begrenzen
* Rate-Limit pro Installations-ID
* CORS nur für OS-Arena-Domain erlauben
* Edge Function wirft unbekannte Felder weg

## Frontend-Logik

Ablauf nach Benchmark:

```text
Benchmark abgeschlossen
  |
  v
Ergebnis lokal speichern
  |
  v
Lokales Ranking aktualisieren
  |
  v
Nutzer fragen:
"Möchtest du dieses Ergebnis anonym zum globalen Ranking beitragen?"
  |
  +-- Nein -> nichts senden
  |
  +-- Ja -> Upload an Supabase Edge Function
```

## UI-Zustände

Ranking-Komponente sollte unterscheiden:

1. Lokal
2. Global
3. Offline
4. Upload möglich
5. Upload erfolgreich
6. Upload fehlgeschlagen
7. Zustimmung noch nicht gegeben

## Technische Tasks

### Backend / Supabase
- [x] Supabase-Projekt erstellt
- [x] Tabelle `benchmark_results` angelegt
- [x] View `leaderboard_public` angelegt
- [x] Row Level Security aktiviert
- [x] Direkte Inserts blockiert
- [x] Public Read auf View via Edge Function / Proxy
- [x] Edge Function `os-arena-ranking-handler` erstellt
- [x] Validierung in Edge Function implementiert
- [x] CORS konfiguriert
- [x] Rate-Limit-Strategie definiert
- [x] Testdaten eingefügt
- [x] Leaderboard-Abfrage getestet (via fetch)

### Frontend / OS Arena
- [x] Lokale Rankingstruktur geprüft
- [x] localStorage-Schicht optimiert
- [x] Upload-Consent-Komponente gebaut
- [x] Ranking-Service abstrahiert (fetch-basiert)
- [x] Supabase-Endpoint als ENV hinterlegt
- [x] Benchmark-Payload normalisiert
- [x] Globale Leaderboard-Komponente gebaut
- [x] Offline-Zustand wird abgefangen
- [x] Fehlerzustände sauber behandelt
- [x] Unit-Tests (Vitest) erweitert
- [x] Datenschutzhinweise in Whitepapers ergänzt

**WICHTIGER ARCHITEKTUR-HINWEIS:**
Die Implementierung wurde aus Sicherheitsgründen auf eine **"No-Key"-Architektur** umgestellt. Es befinden sich keine API-Keys (Anon-Key) im Frontend. Die Kommunikation erfolgt über direkte `fetch`-Aufrufe an die Edge Function, die als Gatekeeper fungiert.

## Dateien / mögliche Struktur

```text
src/
  services/
    ranking/
      localRanking.ts
      globalRanking.ts
      rankingTypes.ts
      installId.ts
      benchmarkPayload.ts

  components/
    ranking/
      LocalRanking.vue
      GlobalRanking.vue
      RankingConsent.vue
      RankingUploadButton.vue
      RankingStatusHint.vue

supabase/
  functions/
    submit-ranking/
      index.ts

  migrations/
    001_create_benchmark_results.sql
    002_create_leaderboard_public_view.sql
```

## Akzeptanzkriterien

Die Umsetzung gilt als erledigt, wenn:

* OS Arena weiterhin ohne globales Ranking lokal funktioniert
* lokale Ergebnisse ohne Netzwerk gespeichert werden
* Upload erst nach aktiver Zustimmung erfolgt
* keine Prompts oder Antworten übertragen werden
* globale Rangliste abrufbar ist
* Leaderboard aggregierte Daten zeigt
* direkte Datenbank-Inserts aus dem Frontend nicht möglich sind
* README das Verhalten transparent erklärt
* UI klar zwischen lokalem und globalem Ranking unterscheidet

## Offene Entscheidungen

* Supabase oder Cloudflare Worker final?
* Welche Felder exakt ins globale Ranking?
* Wie streng soll Geräteinformation anonymisiert werden?
* Wird `webgpu_adapter` vollständig gespeichert oder grob klassifiziert?
* Sollen Rankings nach Gerätegruppe getrennt werden?
* Soll ein Ergebnis mehrfach gesendet werden dürfen?
* Sollen Nutzer Uploads lokal wieder löschen können?

````

---

# Skill Plan für Agenten

```md
# SKILL PLAN: OS Arena Global Ranking Integration

## Rolle des Agenten

Der Agent soll die bestehende OS-Arena-Anwendung so erweitern, dass ein optionales globales Ranking möglich wird, ohne das Local-First-Prinzip der App zu brechen.

Der Agent arbeitet auditierbar, vorsichtig und dokumentiert jede relevante Änderung im AAMS-System.

## Primäre Leitlinie

> Keine Daten verlassen den Browser ohne aktive Zustimmung des Nutzers.

## Relevante AAMS-Regeln

Der Agent muss vor Arbeitsbeginn prüfen:

- `AGENTS.md`
- `READ-AGENT.md`
- `.agent.json`
- `WORKING/WHITEPAPER/`
- `WORKING/WORKPAPER/`
- `WORKING/MEMORY/`

Falls diese Dateien nicht existieren, soll der Agent das im Workpaper dokumentieren und keine AAMS-Struktur eigenmächtig verfälschen.

## Arbeitsmodus

Der Agent arbeitet in kleinen, überprüfbaren Schritten.

Keine großen Blind-Rewrites.

Keine Umstrukturierung des gesamten Frontends, wenn nur Ranking betroffen ist.

Bestehende Funktionalität bleibt erhalten.

## Skill 1: Repository-Analyse

### Ziel

Verstehen, wie OS Arena aktuell aufgebaut ist.

### Aufgaben

- Projektstruktur lesen
- Framework erkennen
- Ranking-Komponenten finden
- Benchmark-Logik finden
- Storage-Mechanismus prüfen
- Build-System prüfen
- Deployment über GitHub Pages prüfen

### Erwartetes Ergebnis

Kurzer technischer Befund:

```text
- Framework:
- Ranking-Dateien:
- Benchmark-Dateien:
- Storage:
- Build:
- Risiken:
````

## Skill 2: Datenfluss-Analyse

### Ziel

Klären, welche Daten aktuell im Ranking entstehen.

### Aufgaben

* Benchmark-Ergebnisobjekt identifizieren
* Felder dokumentieren
* sensible Daten ausschließen
* Daten in Kategorien trennen:

  * lokal erlaubt
  * global erlaubt
  * niemals senden

### Niemals senden

* Prompts
* Antworten
* Chatverläufe
* lokale Dateien
* Nutzername
* E-Mail
* IP aus Clientdaten
* freie Texteingaben

## Skill 3: Ranking-Datenmodell entwerfen

### Ziel

Sauberes gemeinsames Datenmodell für lokal und global.

### Aufgaben

* TypeScript-Typen definieren
* `BenchmarkResult`
* `LocalRankingEntry`
* `GlobalRankingPayload`
* `LeaderboardEntry`
* Normalisierungsfunktion bauen

### Beispiel

```ts
export interface GlobalRankingPayload {
  benchmark_version: string
  app_version?: string

  model_id: string
  model_name: string
  model_size?: string

  tokens_per_second: number
  first_token_ms?: number
  total_time_ms: number

  device_class?: string
  browser?: string
  os?: string

  webgpu_supported: boolean
  webgpu_vendor?: string
  webgpu_adapter?: string

  install_id: string
}
```

## Skill 4: Lokales Ranking stabilisieren

### Ziel

Lokales Ranking bleibt der Default.

### Aufgaben

* lokale Speicherung prüfen
* ggf. `localRanking.ts` abstrahieren
* lokale Ergebnisse speichern
* lokale Ergebnisse laden
* lokale Ergebnisse löschen können
* keine Netzwerkanfrage auslösen

### Akzeptanz

OS Arena funktioniert vollständig ohne Supabase-Konfiguration.

## Skill 5: Installations-ID erzeugen

### Ziel

Eine zufällige anonyme lokale ID erzeugen.

### Regeln

* kein Login
* keine persönliche ID
* keine Browser-Fingerprinting-ID
* zufällig generiert
* lokal gespeichert
* nur für Deduplizierung und Rate-Limit gedacht

### Beispiel

```ts
export function getOrCreateInstallId(): string {
  const key = "os_arena_install_id"
  const existing = localStorage.getItem(key)

  if (existing) return existing

  const id = crypto.randomUUID()
  localStorage.setItem(key, id)

  return id
}
```

## Skill 6: Consent-UI bauen

### Ziel

Nutzer muss aktiv zustimmen.

### Aufgaben

* Consent-Komponente erstellen
* klare Erklärung anzeigen
* gesendete Daten anzeigen
* nicht gesendete Daten anzeigen
* Buttons:

  * nicht senden
  * anonym senden

### Akzeptanz

Kein Upload ohne Klick auf „Anonym senden“.

## Skill 7: Global Ranking Service

### Ziel

Frontend-Service für Upload und Leaderboard-Abruf.

### Dateien

```text
src/services/ranking/globalRanking.ts
```

### Funktionen

```ts
submitRanking(payload)
fetchGlobalLeaderboard()
isGlobalRankingAvailable()
```

### Regeln

* Fehler sauber behandeln
* App darf bei Fehler nicht brechen
* Offline-Zustand erkennen
* Endpoint zentral konfigurierbar machen

## Skill 8: Supabase Edge Function

### Ziel

Sicherer Upload-Endpunkt.

### Aufgaben

* Function `submit-ranking` erstellen
* JSON-Body lesen
* Payload validieren
* unbekannte Felder verwerfen
* Werte normalisieren
* Installations-ID hashen
* in Tabelle schreiben
* sinnvolle HTTP-Statuscodes zurückgeben

### Validierung

Pflichtfelder:

```text
benchmark_version
model_id
model_name
tokens_per_second
total_time_ms
webgpu_supported
install_id
```

Grenzen:

```text
tokens_per_second > 0
tokens_per_second < plausibler Maximalwert
total_time_ms > 0
model_id length < 200
model_name length < 200
benchmark_version length < 50
```

## Skill 9: Supabase Migrationen

### Ziel

Datenbank reproduzierbar anlegen.

### Dateien

```text
supabase/migrations/
  001_create_benchmark_results.sql
  002_create_leaderboard_public_view.sql
```

### Aufgaben

* Tabelle erstellen
* View erstellen
* RLS aktivieren
* direkte Inserts blockieren
* Public Read für View ermöglichen
* Service Role nur serverseitig verwenden

## Skill 10: Leaderboard UI

### Ziel

Globales Ranking sichtbar machen, ohne es mit lokalem Ranking zu verwechseln.

### UI-Struktur

```text
Ranking
  Tabs:
    - Lokal
    - Global
```

### Global-Hinweis

```text
Das globale Ranking wird aus freiwillig eingesendeten anonymisierten Benchmarkdaten geladen.
```

### Zustände

* lädt
* offline
* keine Daten
* Fehler
* Daten vorhanden

## Skill 11: Dokumentation

### Ziel

README und ggf. Privacy-Hinweis aktualisieren.

### README ergänzen

Abschnitt:

```md
## Local-first Ranking

OS Arena stores benchmark results locally in your browser.

Global leaderboard uploads are optional. No prompt, answer, chat history or local file is uploaded.

Only anonymized benchmark metadata is submitted after explicit user consent.
```

Deutsche Version optional zusätzlich.

## Skill 12: Tests / Checks

### Mindestchecks

* App startet ohne Supabase ENV
* lokales Ranking funktioniert offline
* Upload-Button erscheint nur nach Benchmark
* Upload wird ohne Consent nicht ausgeführt
* Upload mit ungültigen Daten wird abgelehnt
* Leaderboard lädt bei gültigem Endpoint
* Fehler im Rankingdienst brechen die App nicht
* Build läuft erfolgreich

### Manuelle Testfälle

```text
1. Browser offline starten
2. Benchmark ausführen
3. lokales Ranking prüfen
4. Upload ablehnen
5. prüfen: kein Netzwerkrequest
6. Upload erlauben
7. prüfen: Request an Rankingdienst
8. Supabase-Datensatz prüfen
9. Globales Leaderboard laden
```

## Skill 13: Sicherheitsprüfung

### Prüfen

* kein Supabase Service Role Key im Frontend
* kein GitHub Token im Frontend
* keine Prompts im Payload
* keine Antworten im Payload
* keine freien Textfelder
* CORS eingeschränkt
* keine geheimen ENV-Dateien commiten
* `.env` in `.gitignore`

## Reihenfolge der Umsetzung

```text
1. Repository analysieren
2. aktuelles Ranking verstehen
3. Workpaper aktualisieren
4. Typen für Rankingdaten definieren
5. lokales Ranking absichern
6. Consent-UI bauen
7. GlobalRanking-Service vorbereiten
8. Supabase Migrationen erstellen
9. Edge Function erstellen
10. Leaderboard-View anbinden
11. UI-Zustände testen
12. README / Datenschutztext ergänzen
13. finaler Build
14. Workpaper abschließen
```

## Definition of Done

Die Aufgabe ist abgeschlossen, wenn:

* lokales Ranking weiterhin ohne Internet funktioniert
* globaler Upload nur nach Zustimmung erfolgt
* Supabase keine direkten unvalidierten Client-Inserts akzeptiert
* globale Rangliste aggregierte Daten anzeigt
* sensible Inhalte nicht übertragen werden
* README das Verhalten transparent beschreibt
* Build erfolgreich läuft
* Workpaper aktualisiert wurde

## Agenten-Hinweis

Bei Unsicherheit keine Architektur still ändern.

Stattdessen:

1. Annahme dokumentieren
2. kleinste sichere Lösung bauen
3. offene Entscheidung im Workpaper markieren

````

---

## Kompakte Aufgabenliste für deinen Agenten

```md
# TODO: OS Arena Ranking

- [x] Repo-Struktur analysieren
- [x] aktuelle Ranking-Komponenten finden
- [x] Benchmark-Datenobjekt dokumentieren
- [x] lokale Ranking-Speicherung absichern
- [x] `rankingTypes.ts` erstellen
- [x] `localRanking.ts` erstellen oder bereinigen
- [x] `installId.ts` erstellen
- [x] `RankingConsent.vue` erstellen
- [x] `globalRanking.ts` erstellen
- [x] Supabase Migration für `benchmark_results` erstellen
- [x] Supabase View `leaderboard_public` erstellen
- [x] Edge Function `submit-ranking` erstellen
- [x] Payload-Validierung implementieren
- [x] direkte DB-Inserts blockieren
- [ ] Global-Ranking-Tab einbauen
- [ ] Offline-/Fehlerzustände darstellen
- [ ] README aktualisieren
- [ ] Datenschutz-Hinweis ergänzen
- [ ] Build testen
- [ ] Workpaper finalisieren
````

Das ist so formuliert, dass dein Agent es direkt als Arbeitsgrundlage nehmen kann.
