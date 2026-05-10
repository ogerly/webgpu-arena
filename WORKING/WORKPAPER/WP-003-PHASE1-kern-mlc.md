# Workpaper WP-003: Phase 1 – Kern stabilisieren (MLC-only)

**Projekt:** WebGPU-Arena  
**Stand:** 2026-04-29  
**Status:** Aktiv – In Bearbeitung  
**Bezug:** WP-002-MODELS-integration-arena-bewertung.md  
**Folgedokumente:** WP-004 (Phase 2 · Dual-Engine), WP-005 (Phase 3 · Sonder-Fähigkeiten)

---

## Ziel dieser Phase

Ein stabiler, auslieferbarer Prototyp. Alle Kernversprechen aus WP-001 sind erfüllt:
- Modelle lokal laden, cachen und offline nutzen
- Arena mit Blind-Test und ELO-Bewertung
- Läuft auf Handy und Laptop, direkt im Browser

Kein neues Framework. Kein Overhead. Alles auf Basis des bestehenden `@mlc-ai/web-llm` Stacks.

---

## 1. Modell-Erweiterung (MLC-only)

### Aktuelle Modelle in state.js

```
Llama 3.2   · 1B   · MLC ✅
Qwen 2      · 1.5B · MLC ✅
TinyLlama   · 1.1B · MLC ✅
Gemma 2B    · 2B   · MLC ✅
```

### Neu hinzuzufügende Modelle

Alle IDs gegen die offizielle MLC-Modelliste verifizieren:  
→ https://mlc.ai/mlc-llm/docs/prebuilt_models.html

| Name | Vorgeschlagene MLC-ID | Params | Begründung |
|---|---|---|---|
| **SmolLM2** | `SmolLM2-1.7B-Instruct-q4f16_1-MLC` | 1.7B | Von HuggingFace, stark für die Größe, bekannt |
| **Qwen3 Tiny** | `Qwen3-0.6B-q4f16_1-MLC` | 0.6B | Extrem schnell, gut für Mobile, neue Generation |

**Hinzufügen in state.js:**

```javascript
{ id: 'SmolLM2-1.7B-Instruct-q4f16_1-MLC', name: 'SmolLM2',    size: '1.7B Param', cached: false, loading: false, progress: 0, score: 1100 },
{ id: 'Qwen3-0.6B-q4f16_1-MLC',            name: 'Qwen3 Tiny', size: '0.6B Param', cached: false, loading: false, progress: 0, score: 1050 },
```

### Warum kein Modell über 2B?

Das 2B-Limit ist kein technisches Limit sondern ein UX-Versprechen: "Läuft auch auf normalen Computern." Modelle über 2B brauchen mehr RAM und eine stärkere GPU. Das Versprechen bricht für viele User. Ausnahme kann optional als "Experimentell"-Flag kommen – nicht in Phase 1.

---

## 2. WebCPU Fallback

Derzeit zeigt die App bei fehlendem WebGPU nur eine Fehlermeldung (`state.gpuError`). Das widerspricht dem Versprechen "läuft bei jedem".

### Lösung: Weichen-Logik in checkCacheStatus()

```javascript
export async function checkCacheStatus() {
  if (!navigator.gpu) {
    // Nicht sofort Fehler – erst Hinweis
    state.gpuWarning = true; // neues Flag
    // App läuft weiter, aber Modelle sind deaktiviert
    // UI zeigt Erklärung + Link zur WebGPU-Aktivierung
  }
  // ... rest der Cache-Prüfung
}
```

### Was der User sieht (kein GPU)

```
╔══════════════════════════════════════════╗
║  ⚠️  Dein Browser unterstützt kein WebGPU ║
║                                          ║
║  Die KI-Modelle brauchen WebGPU, um auf  ║
║  deiner Grafikkarte zu rechnen.          ║
║                                          ║
║  Was du tun kannst:                      ║
║  → Chrome oder Edge verwenden            ║
║  → chrome://flags → WebGPU aktivieren    ║
║                                          ║
║  [Mehr erfahren]                         ║
╚══════════════════════════════════════════╝
```

> Phase 3 bringt wllama als echten CPU-Fallback. In Phase 1 reicht der informative Hinweis.

---

## 3. Arena: Blind-Test & Bewertungssystem

### 3.1 Ablauf

```
1. User wählt Kategorie oder tippt eigenen Prompt
          ↓
2. Beide Modelle antworten (Modellnamen ausgeblendet)
   Seite A ░░░░░░  vs.  Seite B ░░░░░░
          ↓
3. User wählt: [A war besser] [Unentschieden] [B war besser]
          ↓
4. Reveal: Name von A und B wird sichtbar
          ↓
5. ELO-Update + Bewertungskarte
```

Der Blind-Test ist entscheidend für ehrliche Ergebnisse. Wer weiß, dass "das große Modell" antwortet, bewertet anders.

### 3.2 Prompt-Kategorien

```javascript
// arena-prompts.js (neue Datei)
export const promptCategories = [
  {
    id: 'math',
    label: 'Mathe 🔢',
    prompts: [
      'Was ist 17 × 24?',
      'Ein Zug fährt 120 km/h. Wie lange braucht er für 450 km?',
      'Was ist die Quadratwurzel aus 144?',
    ]
  },
  {
    id: 'language_de',
    label: 'Deutsch 🇩🇪',
    prompts: [
      'Schreibe einen kurzen Witz.',
      'Erkläre den Begriff „Weltanschauung" einfach.',
      'Verbessere diesen Satz: "Ich hat gestern viel gelernt."',
    ]
  },
  {
    id: 'language_en',
    label: 'English 🇬🇧',
    prompts: [
      'Explain quantum entanglement like I am five.',
      'Write a short poem about rain.',
      'What is the difference between affect and effect?',
    ]
  },
  {
    id: 'reasoning',
    label: 'Logik 🧩',
    prompts: [
      'Alle Katzen haben Fell. Luna ist eine Katze. Was folgt?',
      'Wenn A > B und B > C – was weißt du über A und C?',
    ]
  },
  {
    id: 'creative',
    label: 'Kreativ 🎨',
    prompts: [
      'Schreibe den Anfang einer Geschichte über eine KI, die träumt.',
      'Erfinde einen Namen für eine neue Farbe und beschreibe sie.',
    ]
  },
  {
    id: 'custom',
    label: 'Eigener Prompt ✍️',
    prompts: []
  }
];
```

### 3.3 ELO-Implementierung

```javascript
// elo.js (neue Datei)

export const ELO_START = 1200;
export const ELO_K     = 32;

export function calcEloWin(winnerScore, loserScore) {
  const expected = 1 / (1 + Math.pow(10, (loserScore - winnerScore) / 400));
  return {
    winner: Math.round(winnerScore + ELO_K * (1 - expected)),
    loser:  Math.round(loserScore  + ELO_K * (0 - (1 - expected))),
  };
}

export function calcEloDraw(scoreA, scoreB) {
  const expectedA = 1 / (1 + Math.pow(10, (scoreB - scoreA) / 400));
  return {
    a: Math.round(scoreA + ELO_K * (0.5 - expectedA)),
    b: Math.round(scoreB + ELO_K * (0.5 - (1 - expectedA))),
  };
}
```

ELO-Werte in `localStorage` persistieren, damit der Leaderboard über Sessions hinweg wächst.

### 3.4 Bewertungskarte (nach jeder Runde)

Kompakte Zusammenfassung direkt nach der Wahl:

```
┌──────────────────────────────────────────────┐
│  🏆 Gewinner: Gemma 2B                        │
│     vs. TinyLlama · Kategorie: Mathe 🔢       │
├───────────────┬──────────────────────────────┤
│  ⚡ Geschwind. │  Gemma: 23 tok/s  Tiny: 31    │
│  📏 Länge     │  Gemma: 128 tok   Tiny: 67    │
│  📊 ELO-Delta │  Gemma: 1250 → 1266  +16      │
│               │  TinyLlama: 1000 → 984  −16   │
└──────────────────────────────────────────────┘
```

---

## 4. PWA / Offline sicherstellen

Das Offline-Versprechen aus WP-001 steht: "Einmal laden, immer nutzen." Dafür braucht die App einen funktionierenden Service Worker.

### Prüfliste

- [ ] `vite-plugin-pwa` installiert und konfiguriert
- [ ] `manifest.json` vorhanden (Name, Icon, Farben)
- [ ] Service Worker cached App-Shell (HTML, JS, CSS)
- [ ] Modell-Dateien liegen im Browser Cache Storage (das macht MLC selbst)
- [ ] Offline-Test: Netzwerk trennen → App neu laden → funktioniert?

### Minimalconfig vite.config.js

```javascript
import { VitePWA } from 'vite-plugin-pwa'

VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'WebGPU-Arena',
    short_name: 'WebGPU-Arena',
    theme_color: '#0f172a',
    background_color: '#0f172a',
    display: 'standalone',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ]
  }
})
```

---

## 5. Fehlerbehandlung verbessern

Aktuell bleibt `state.gpuError` gesetzt und lässt sich nicht zurücksetzen. Kleine Verbesserungen:

```javascript
// state.js – Reset-Funktion ergänzen
export function clearErrors() {
  state.gpuError = null;
  state.gpuWarning = false;
}
```

Außerdem: Beim `downloadModel` Fehler den Fortschritt zurücksetzen:

```javascript
} catch (err) {
  model.progress = 0;           // ← neu
  model.loading = false;        // ← bereits vorhanden
  state.gpuError = '...';
}
```

---

## 6. Offene Punkte / To-Do Phase 1

| # | Aufgabe | Datei | Prio |
|---|---|---|---|
| 1 | SmolLM2 + Qwen3 Tiny MLC-IDs verifizieren und einbauen | `state.js` | Hoch |
| 2 | ELO-Logik als `elo.js` anlegen | neu | Hoch |
| 3 | Arena Blind-Test implementieren | `ArenaView.vue` | Hoch |
| 4 | Prompt-Kategorien als `arena-prompts.js` anlegen | neu | Hoch |
| 5 | ELO in localStorage persistieren | `state.js` | Mittel |
| 6 | PWA Service Worker prüfen / einrichten | `vite.config.js` | Mittel |
| 7 | WebCPU-Hinweis statt harter Fehlermeldung | `state.js` + UI | Mittel |
| 8 | Fehler-Reset-Funktion | `state.js` | Niedrig |

---

*Dieses Dokument beschreibt ausschließlich Phase 1. Für Phase 2 (transformers.js + weitere Modelle) → WP-004. Für Phase 3 (Sprache, Vision, Audio) → WP-005.*
