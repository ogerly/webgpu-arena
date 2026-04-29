# WORKPAPER WP-002 — Review OS-Arena WebGPU-Prototyp

**Datum:** 2026-04-29  
**Status:** Review / Arbeitsliste  
**Projekt:** OS-Arena / lokale Browser-KI über WebGPU  
**Ziel:** Prototyp hart auf Sinnhaftigkeit, Wahrheit, Logik, Sauberkeit, Effizienz und nächste technische Schritte prüfen.

---

## 1. Kurzfazit

Der Ansatz ist sinnvoll: Eine extrem einfache Browser-Anwendung, mit der Nutzer kleine lokale KI-Modelle laden, offline wiederverwenden und gegeneinander vergleichen können, passt technisch und kommunikativ gut zum Ziel „private, unabhängige KI ohne Cloud-Zwang“.

Der aktuelle Prototyp bildet bereits die Kernstruktur ab:

- Modellübersicht
- Arena-Auswahl Modell A gegen Modell B
- Chat-Vergleich
- einfache Rangliste
- Profilbereich
- Einstellungen mit WebGPU-Status und Modell-Speicherhinweis

Aber: Der Prototyp ist aktuell eher ein funktionaler Demonstrator als ein belastbares Produkt. Die wichtigsten Baustellen liegen bei Persistenz, Modell-Metadaten, sauberer Bewertung, UX für Einsteiger, Fehlerbehandlung, Streaming, Speichergrenzen und der Wahrheit der Aussagen gegenüber dem Nutzer.

---

## 2. Wahrheitsprüfung der Kernannahmen

### 2.1 „Alles läuft lokal“

**Bewertung:** Im Inferenzbetrieb ja, beim ersten Modellbezug nein.

Solange WebLLM/WebGPU im Browser läuft, findet die Generierung lokal auf dem Gerät statt. Der erste Download der Modelle erfolgt aber über externe Quellen, aktuell praktisch aus dem Web/Hugging-Face/MLC-Kontext.

**Kommunikation ändern:**

Nicht schreiben:

> Alles ist immer vollständig lokal.

Besser:

> Nach dem Herunterladen laufen die unterstützten Modelle lokal im Browser. Prompts und Antworten werden nicht an einen KI-Server gesendet. Für den ersten Download wird eine Internetverbindung benötigt.

### 2.2 „Für immer verfügbar“

**Bewertung:** Falsch beziehungsweise zu stark.

Browser-Cache, Cache Storage und IndexedDB sind keine garantierte dauerhafte Archivablage. Speicher kann durch Browser, Nutzer, Gerätedruck, private Modi, Site-Data-Löschung oder Browser-Updates verloren gehen.

**Änderung:**

- UI-Text `✓ Für immer verfügbar` ersetzen durch `✓ Lokal zwischengespeichert`.
- Erklärung ergänzen: „Kann durch Browserdaten-Löschung entfernt werden.“

### 2.3 „Bis 2B läuft auf normalen Computern reibungslos“

**Bewertung:** Zu pauschal.

2B-Modelle können auf Desktop-Systemen gut funktionieren, aber auf schwachen Laptops, Smartphones, älteren iGPUs oder Browsern mit schwacher WebGPU-Unterstützung langsam oder instabil sein.

**Änderung:**

- Modelle in Kompatibilitätsklassen einteilen:
  - Sehr leicht: < 500M
  - Leicht: 0.5B–1B
  - Mittel: 1B–2B
  - Experimentell: Spezialmodelle / multimodal / Audio / Vision

### 2.4 „Wenn WebGPU geht, geht auch der Rest“

**Bewertung:** Logisch zu hart.

WebGPU-Verfügbarkeit ist notwendig, aber nicht ausreichend. Zusätzlich relevant:

- verfügbarer VRAM / Unified Memory
- Browser-Version
- Treiber
- Quantisierung
- Modellformat
- Speicherquote des Browsers
- parallele Modell-Engines
- Smartphone-Thermal-Throttling
- iOS/Safari-Limits

**Änderung:**

WebGPU-Check um Hardware-/Speichercheck und Testlauf erweitern.

---

## 3. Review aktueller Code-Stand

### 3.1 State / Modellverwaltung

Aktuell liegen die Modelle hart in `state.availableModels`. Das ist für den Prototyp okay, aber nicht skalierbar.

**Problemstellen:**

- Keine Modell-Metadaten außer Name, Größe, Score.
- Keine Angabe zu Sprache, Lizenz, Quelle, Kategorie, Backend, Speicherbedarf, Kontextlänge, Status.
- Keine Prüfung, ob Modell-ID wirklich in WebLLM verfügbar ist.
- Keine getrennte Modellregistry.
- `ref` wird importiert, aber nicht benutzt.
- `loadedEngines` ist nur runtime-in-memory und wird nach Reload der Seite verworfen.

**Empfehlung:**

Eine eigene Registry-Datei einführen:

```js
// modelRegistry.js
export const modelRegistry = [
  {
    id: 'Qwen2-1.5B-Instruct-q4f16_1-MLC',
    label: 'Qwen 2 1.5B Instruct',
    family: 'Qwen',
    params: '1.5B',
    backend: 'webllm',
    modality: 'text',
    language: ['de', 'en', 'multi'],
    license: 'CHECK_REQUIRED',
    source: 'MLC/WebLLM',
    difficulty: 'medium',
    recommended: true,
    benchmarkTags: ['de_text', 'reasoning_basic', 'speed'],
  },
]
```

### 3.2 Download-Funktion

Aktuell bedeutet `downloadModel(model)` technisch nicht nur „Download“, sondern direkt Engine-Erstellung. Das ist verständlich, aber UX-seitig unsauber.

**Problem:**

Nutzer erwartet: Modell herunterladen.  
Code macht: Modell herunterladen + Engine initialisieren + in RAM laden.

**Empfehlung:**

Begriffe trennen:

- `cacheModel(modelId)` = Modell herunterladen/cache prüfen.
- `loadModel(modelId)` = Engine laden und Modell in Arbeitsspeicher initialisieren.
- `unloadModel(modelId)` = Engine entladen, RAM/GPU freigeben.

### 3.3 Engine-Lifecycle

Aktuell können zwei Engines parallel gehalten werden. Für Desktop ist das okay, für Mobile kann das kritisch sein.

**Problem:**

- Keine Speicherbegrenzung.
- Kein Entladen alter Engines.
- Keine LRU-Strategie.
- Keine Warnung bei zwei 2B-Modellen.

**Empfehlung:**

Für dunklen DAU-Modus:

- Standard: Immer nur 1 Engine im Chat-Modus.
- Arena-Modus: Sequentiell laden/generieren, optional Engine A entladen, dann Engine B laden.
- Fortgeschritten-Modus: Zwei Engines parallel erlauben.

### 3.4 Chat / Arena-Logik

Der aktuelle Chat stellt beiden Modellen dieselbe Frage und zeigt beide Antworten nebeneinander. Das ist als Arena-Grundlage richtig.

**Problemstellen:**

- Antworten werden nicht gestreamt.
- Es wird nur am Ende angezeigt.
- Keine Messung von Zeit bis erster Token.
- Keine Tokens/sec.
- Kein Prompt-Template / Systemprompt.
- Keine Antwortparameter wie temperature, max_tokens, top_p.
- Keine Gesprächshistorie pro Modell.
- Vote nutzt aktuelle `selectedModelA/B`, nicht die Modelle, die beim jeweiligen Chat-Eintrag tatsächlich gespeichert wurden.

**Kritischer Bug:**

Beim Voting wird über `state.selectedModelA` und `state.selectedModelB` bewertet. Wenn der Nutzer nach einer Antwort die Modellauswahl ändert und dann einen alten Eintrag bewertet, bekommt das falsche Modell Punkte.

**Fix:**

Im Chat-Eintrag die IDs speichern:

```js
const currentMsg = {
  user: userText,
  modelA: { id: modelAObj.id, name: modelAObj.name, content: '', generating: true },
  modelB: { id: modelBObj.id, name: modelBObj.name, content: '', generating: true },
  metrics: {
    modelA: {},
    modelB: {},
  },
  winner: null,
}
```

Und beim Vote:

```js
const modelA = state.availableModels.find(m => m.id === msg.modelA.id)
const modelB = state.availableModels.find(m => m.id === msg.modelB.id)
```

### 3.5 Score / Leaderboard

Aktuell ist der Score ein einfacher Punktestand. Das ist für Demo okay, aber keine echte Arena-Wertung.

**Problem:**

- Score ist nicht persistent.
- Keine Anzahl Battles.
- Keine Kategorien.
- Keine Qualitätsdimensionen.
- Kein Elo-System.
- Kein Draw.
- Kein „beide schlecht“.
- Kein „beide gut“.

**Empfehlung:**

Bewertung in zwei Ebenen aufteilen:

1. **Schnellbewertung**
   - A besser
   - B besser
   - Gleich gut
   - Beide schlecht

2. **Detailbewertung optional**
   - Geschwindigkeit
   - Verständlichkeit
   - Deutschqualität
   - Faktentreue
   - Mathe/Logik
   - Kreativität
   - Struktur
   - Hilfsbereitschaft

Leaderboard sollte nicht nur Gesamtpunkte zeigen, sondern:

- Battles gesamt
- Winrate
- Durchschnittliche Tokens/sec
- Durchschnittliche Latenz
- Kategorie-Scores
- Gerätetyp optional lokal

### 3.6 `v-html` in Modellantworten

Aktuell werden Modellantworten mit `v-html` ausgegeben.

**Bewertung:** Kritisch.

Auch wenn das Modell lokal läuft, kann Prompt-Injection HTML erzeugen. `v-html` kann XSS-Probleme erzeugen, besonders wenn später externe Inhalte, Imports, gespeicherte Chats oder geteilte Arena-Ergebnisse dazukommen.

**Empfehlung:**

Kurzfristig:

```vue
<div class="model-content">{{ msg.modelA.content }}</div>
```

Wenn Markdown gewünscht ist:

- Markdown parser verwenden
- HTML deaktivieren
- Ausgabe sanitizen

### 3.7 WebGPU-Status / Settings

Aktuell wird nur `navigator.gpu` geprüft.

**Problem:**

Das zeigt nur, ob WebGPU grundsätzlich vorhanden ist. Es sagt nicht, ob ein Modell wirklich läuft.

**Empfehlung:**

Status auf drei Ebenen bringen:

- WebGPU API verfügbar
- Adapter verfügbar
- Testmodell/Testlauf erfolgreich

Pseudo:

```js
const adapter = await navigator.gpu?.requestAdapter()
if (!adapter) state.gpuError = 'WebGPU vorhanden, aber kein Adapter verfügbar.'
```

### 3.8 Speicherort / Ordner öffnen

Der Button „Ordner öffnen“ ist UX-seitig irreführend, weil Browserdaten nicht als normaler Ordner geöffnet werden können.

**Änderung:**

Button umbenennen:

- `Speicher erklären`
- `Lokalen Browser-Speicher anzeigen`
- `Wo liegen die Modelle?`

Text:

> Die Modelle liegen im lokalen Browser-Speicher, nicht in einem frei wählbaren Dateiordner. Du kannst sie über Browserdaten löschen oder in den Entwicklertools sehen.

### 3.9 PWA / Offline

Das Whitepaper nennt PWA, aber im Code sind keine PWA-Dateien sichtbar.

**Offene technische Punkte:**

- `manifest.webmanifest`
- Service Worker
- Offline App Shell
- Cache-Strategie
- Update-Handling
- Fallback-Seite bei Offline-Start

**Wichtig:**

Offline-App und offline gespeicherte Modelle sind getrennte Themen. Beides muss separat umgesetzt und geprüft werden.

---

## 4. Modellliste Review

Die hochgeladene Liste enthält sehr unterschiedliche Dinge:

- echte Chat-/LLM-Modelle
- WebGPU Spaces
- WebCPU Spaces
- Audio-/Speech-Modelle
- Vision-/Depth-/Object-Detection-Demos
- multimodale Experimente
- Datasets
- doppelte Einträge

Für die OS-Arena sollten diese nicht alle in dieselbe Modellliste. Sonst versteht der Nutzer nicht, warum ein Chatmodell gegen eine Tiefenschätzung oder Transkription antreten soll.

### 4.1 Kategorien einführen

Empfohlene Kategorien:

| Kategorie | Zweck | Arena geeignet |
|---|---|---|
| Text Chat | klassischer Chat | ja |
| Mini Reasoning | Logik, Mathe, kleine Aufgaben | ja |
| Deutschtest | deutsche Texte, Korrektur, Zusammenfassung | ja |
| Privacy / Filter | Klassifikation, Filter | eingeschränkt |
| Audio STT | Transkription | eigene Arena nötig |
| TTS | Sprache erzeugen | eigene Arena nötig |
| Vision | Bildanalyse / Objekterkennung | eigene Arena nötig |
| Experimental | Spielwiese | nein, separat |
| Dataset | keine Inferenz | nein |

### 4.2 Sofort für Chat-Arena prüfen

Priorität A:

- Qwen 0.5B / 0.8B / 1.5B Varianten
- Llama 3.2 1B Instruct
- TinyLlama 1.1B Chat
- SmolLM2 1.7B Instruct, sofern WebLLM-kompatibel oder eigenes WebCPU-Backend
- Gemma 2B / Gemma 3/4 nur nach Format-/Lizenz-/WebLLM-Prüfung
- Bonsai, falls als echtes Chatmodell mit kompatiblem Runtime-Pfad verfügbar

Priorität B:

- Nemotron Nano, falls WebGPU-kompatibel und klein genug
- Falcon-H1-Tiny-90M, falls geeignete Browser-Runtime vorhanden

Nicht in die Chat-Arena aufnehmen, sondern eigene Module:

- Whisper WebCPU → Audio-Transkription
- wllama WebCPU → anderes Runtime-Modul
- Kokoro WebGPU → TTS
- Voxtral Realtime WebGPU → Audio/Voice-Modul
- Depth Estimation → Vision-Demo
- Video Object Detection → Vision-Demo
- Moondream → Vision/Multimodal
- FunctionGemma Physics Playground → Spezialdemo
- Datasets → Ressourcen, keine Modelle

---

## 5. UX-Prinzip für den dunkelsten anzunehmenden User

Der Nutzer darf nicht mit WebGPU, Cache, IndexedDB, Hugging Face, Quantisierung oder Modellformaten konfrontiert werden.

### 5.1 Empfohlener Startscreen

Statt direkt Arena:

1. „Kann dein Gerät lokale KI?“
2. Automatischer Test
3. Ergebnis:
   - Grün: „Ja, dein Gerät ist bereit.“
   - Gelb: „Es geht, aber nimm kleine Modelle.“
   - Rot: „Dieser Browser/Gerät ist nicht geeignet.“
4. Button: „Ein kleines Modell laden“
5. Danach: „Erste Frage stellen“

### 5.2 Modellauswahl vereinfachen

Nicht zuerst Modellnamen zeigen, sondern Einsatzzwecke:

- Schnell & klein
- Besseres Deutsch
- Besser für Logik
- Experimentell

Technische Modellnamen nur aufklappbar anzeigen.

### 5.3 Klare Ampel pro Modell

Jedes Modell bekommt:

- ✅ empfohlen
- ⚠️ kann langsam sein
- 🧪 experimentell
- 🔒 läuft lokal nach Download
- 🌐 braucht Download
- 💾 lokal gespeichert

---

## 6. Konkrete Bugfix-Liste

### P0 — Muss vor öffentlicher Demo

- [ ] `v-html` aus Modellantworten entfernen oder sanitizen.
- [ ] Vote-Bug fixen: Modell-IDs im Chat-Eintrag speichern und beim Voting diese IDs verwenden.
- [ ] Text `Für immer verfügbar` ändern zu `Lokal zwischengespeichert`.
- [ ] WebGPU-Check um `requestAdapter()` erweitern.
- [ ] Fehler pro Modell anzeigen, nicht global alles auf `gpuError` werfen.
- [ ] Unterscheiden zwischen Download/Cache und RAM/GPU-Laden.
- [ ] Modellliste aus `state.js` in `modelRegistry.js` auslagern.
- [ ] Modell-Metadaten ergänzen: backend, modality, params, source, licenseStatus, recommended, category.

### P1 — Sollte direkt danach

- [ ] Streaming-Ausgabe einbauen.
- [ ] Antwortzeit messen.
- [ ] Tokens/sec messen, wenn WebLLM Usage/Timing sauber verfügbar ist.
- [ ] `max_tokens`, `temperature`, `top_p` steuerbar machen.
- [ ] „Schnelltest“-Prompts für Arena einbauen.
- [ ] Bewertung in Dimensionen einführen.
- [ ] Ergebnisse in IndexedDB/localStorage persistieren.
- [ ] Chatverlauf lokal speichern/löschen können.
- [ ] Modell-Cache-Status beim App-Start robuster prüfen.
- [ ] Ladeabbrüche und Retry anbieten.

### P2 — Produktreife

- [ ] PWA Manifest ergänzen.
- [ ] Service Worker für App Shell ergänzen.
- [ ] Offline-Status sauber anzeigen.
- [ ] Speicherverbrauch pro Modell anzeigen.
- [ ] Modell löschen / Cache freigeben.
- [ ] Hardware-Profil lokal anonym erfassen: Browser, WebGPU ja/nein, Performanceklasse.
- [ ] Einsteiger-Modus / Experten-Modus trennen.
- [ ] Export/Import lokaler Arena-Ergebnisse als JSON.
- [ ] Leaderboard nach Kategorien aufteilen.
- [ ] Testmatrix für Chrome, Edge, Safari, Android, Desktop, schwache Laptops erstellen.

---

## 7. Vorgeschlagene Datenstruktur

```js
export const modelRegistry = [
  {
    id: 'Qwen2-1.5B-Instruct-q4f16_1-MLC',
    label: 'Qwen 2 1.5B Instruct',
    shortLabel: 'Qwen 1.5B',
    backend: 'webllm',
    runtime: 'webgpu',
    category: 'text-chat',
    modality: ['text'],
    params: 1.5,
    paramsLabel: '1.5B',
    quantization: 'q4f16_1',
    source: 'MLC/WebLLM',
    license: 'CHECK_REQUIRED',
    cacheStatus: 'unknown',
    performanceClass: 'medium',
    recommendedFor: ['deutsch', 'chat', 'reasoning-basic'],
    warning: null,
    enabled: true,
    experimental: false,
    score: {
      elo: 1000,
      battles: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      dimensions: {
        speed: null,
        german: null,
        logic: null,
        helpfulness: null,
        factuality: null,
      },
    },
  },
]
```

---

## 8. Arena-Bewertungssystem

### 8.1 Schnellwertung

```js
const voteTypes = [
  'A_BETTER',
  'B_BETTER',
  'DRAW_GOOD',
  'DRAW_BAD',
]
```

### 8.2 Detailwertung

Skala 1–5:

- Geschwindigkeit
- Verständlichkeit
- Deutsch
- Logik
- Faktentreue
- Struktur
- Nützlichkeit

### 8.3 Messwerte automatisch

Pro Antwort speichern:

```js
metrics: {
  startedAt,
  firstTokenAt,
  finishedAt,
  durationMs,
  outputChars,
  outputTokens,
  tokensPerSecond,
  error,
}
```

---

## 9. Empfohlene nächste Umsetzungsschritte

### Schritt 1 — Stabilisieren

- Security-Fix `v-html`
- Vote-Bug fixen
- Textwahrheit korrigieren
- Modellregistry auslagern

### Schritt 2 — DAU-fähig machen

- Start-Assistent
- Ampel-Check
- Modell-Empfehlungen
- einfache Sprache
- bessere Fehlertexte

### Schritt 3 — Arena ernsthaft machen

- Streaming
- Timing
- Detailbewertungen
- Kategorie-Leaderboard
- Persistenz

### Schritt 4 — Modellliste sauber kuratieren

- Liste bereinigen
- Doppelte entfernen
- Chat/Audio/Vision/Dataset trennen
- Nur tatsächlich lauffähige Modelle aktivieren
- Experimentelle Modelle als solche markieren

### Schritt 5 — PWA / Offline

- Manifest
- Service Worker
- App Shell Cache
- Offline-Hinweise
- Cache löschen / Speicher freigeben

---

## 10. Entscheidung: Projektlogik

Die OS-Arena sollte nicht als „KI-Spielzeug mit Modellliste“ positioniert werden, sondern als:

> Ein lokaler KI-Spielplatz für normale Menschen, der sichtbar macht, welche kleinen Open-Source-Modelle auf dem eigenen Gerät wirklich funktionieren.

Das ist stark, weil es drei Dinge verbindet:

1. Bildung: Nutzer verstehen Modelle durch Vergleich.
2. Souveränität: Prompts bleiben lokal.
3. Realitätstest: Nicht Marketing entscheidet, sondern das eigene Gerät und der eigene Test.

---

## 11. Klare Produktregel

Jedes Modell darf nur dann in die normale Modellliste, wenn diese Fragen beantwortet sind:

- Läuft es im Browser?
- Mit welchem Backend?
- WebGPU oder WebCPU?
- Ist es ein Chatmodell?
- Wie groß ist es real im Download?
- Welche Lizenz hat es?
- Für welche Sprache ist es sinnvoll?
- Welche Hardwareklasse braucht es?
- Ist es stabil genug für Anfänger?
- Kann es offline nach dem Download weiter genutzt werden?

Alles andere kommt in „Experimente“.

---

## 12. Abschlussbewertung

**Sinnhaftigkeit:** hoch  
**Technische Machbarkeit:** hoch für kleine Textmodelle, mittel für Audio/Vision/multimodal  
**Aktueller Codezustand:** guter Prototyp, noch nicht produktreif  
**Größtes Risiko:** falsche Nutzererwartung durch zu starke Aussagen zu Offline, Dauerhaftigkeit und Kompatibilität  
**Größter Hebel:** Modellregistry + ehrliche UX + echte Arena-Metriken  

