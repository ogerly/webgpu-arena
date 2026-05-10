# Workpaper WP-004: Phase 2 – Dual-Engine (MLC + transformers.js)

**Projekt:** WebGPU-Arena  
**Stand:** 2026-04-29  
**Status:** Geplant – startet nach Abschluss WP-003  
**Bezug:** WP-002-MODELS-integration-arena-bewertung.md  
**Vorbedingung:** WP-003 (Phase 1) vollständig abgeschlossen  
**Folgedokument:** WP-005 (Phase 3 · Sonder-Fähigkeiten)

---

## Ziel dieser Phase

Die Modellauswahl deutlich erweitern, ohne das Kern-Prinzip zu brechen. Durch das Hinzufügen von `@huggingface/transformers` (transformers.js) als zweite Engine werden alle webml-community Modelle zugänglich – das sind die aktuellsten und kleinsten Browser-optimierten Modelle der Community.

Das Ergebnis: Statt 6 Modellen stehen 12+ Modelle zur Auswahl.

---

## 1. Was ändert sich architektonisch?

### Aktuell (Phase 1): Eine Engine

```
User → state.js → MLC WebLLM → Modell-Antwort
```

### Phase 2: Zwei Engines, eine Schnittstelle

```
User → state.js → getEngine(model)
                    ├── model.engine === 'mlc'          → MLC WebLLM
                    └── model.engine === 'transformers'  → transformers.js
```

Die gesamte Komplexität liegt in einer einzigen neuen Funktion `getEngine()`. Der Rest der App – ArenaView, ChatView, alle UI-Komponenten – sieht keinen Unterschied. Die Engines geben beide Antworten zurück, egal welche darunter liegt.

---

## 2. Neue Modelle (transformers.js Engine)

Alle folgenden Modelle stammen aus der webml-community auf Hugging Face und laufen über transformers.js mit WebGPU.

### 2.1 Primäre LLM-Modelle (für Arena und Chat)

| Name | HF Space | Params | Besonderheit |
|---|---|---|---|
| **Qwen3.5 0.8B** | `webml-community/Qwen3.5-0.8B-WebGPU` | 0.8B | Sehr klein, aktuell, gut für Mobile |
| **Qwen3.5** | `webml-community/Qwen3.5-WebGPU` | ~1.7B | Aktuelle Generation, stark |
| **Nemotron 3 Nano** | `webml-community/Nemotron-3-Nano-WebGPU` | ~1B | NVIDIA-Modell, gut in Reasoning |
| **Bonsai** | `webml-community/bonsai-webgpu` | ~1B | Meta-Destillat, effizient |
| **Bonsai Ternary** | `webml-community/bonsai-ternary-webgpu` | ~1B | Neue Ternary-Quantisierung, Benchmark-interessant |
| **Falcon H1 Tiny** | *(kein Space, direkt HF)* | **90M** | Extrem schnell, Qualität begrenzt – "Speed-Modus" |

### 2.2 Modell-Objekte in state.js (Erweiterung)

```javascript
// Neue Felder: engine, hfRepo
{ 
  id: 'Qwen3.5-0.8B',
  name: 'Qwen3.5 Tiny',
  size: '0.8B Param',
  engine: 'transformers',          // ← neu
  hfRepo: 'onnx-community/Qwen3.5-0.6B-Instruct',  // ← zu verifizieren
  cached: false,
  loading: false,
  progress: 0,
  score: 1100
},
{
  id: 'Falcon-H1-Tiny-90M',
  name: 'Falcon Tiny ⚡',
  size: '90M Param',
  engine: 'transformers',
  hfRepo: 'onnx-community/Falcon-H1-Tiny-90M',      // ← zu verifizieren
  cached: false,
  loading: false,
  progress: 0,
  score: 950,
  note: 'Sehr schnell, begrenzte Qualität'           // ← neu: Hinweis-Feld
},
```

> **Alle `hfRepo` IDs müssen vor Integration verifiziert werden.**  
> ONNX-kompatible Versionen findest du auf: https://huggingface.co/onnx-community

---

## 3. Engine-Abstraktion: Implementierung

### 3.1 engine.js (neue Datei)

```javascript
// engine.js
import { CreateMLCEngine, hasModelInCache as mlcHasCache } from '@mlc-ai/web-llm';
import { pipeline, env } from '@huggingface/transformers';

// Transformer.js: Modelle nur im Browser-Cache, nicht vom CDN laden wenn gecacht
env.allowLocalModels = false;
env.useBrowserCache = true;

const loadedEngines = {};

export async function getEngine(model, onProgress) {
  const key = model.id;
  if (loadedEngines[key]) return loadedEngines[key];

  if (model.engine === 'mlc' || !model.engine) {
    // Bestehende MLC-Logik (unverändert aus state.js)
    const engine = await CreateMLCEngine(model.id, {
      initProgressCallback: onProgress
    });
    loadedEngines[key] = { type: 'mlc', instance: engine };

  } else if (model.engine === 'transformers') {
    // Neue transformers.js Logik
    const pipe = await pipeline('text-generation', model.hfRepo, {
      progress_callback: onProgress,
      device: 'webgpu',
    });
    loadedEngines[key] = { type: 'transformers', instance: pipe };
  }

  return loadedEngines[key];
}

// Einheitliche Chat-Funktion – gleiches Interface für beide Engines
export async function chat(engineRef, messages) {
  if (engineRef.type === 'mlc') {
    const reply = await engineRef.instance.chat.completions.create({ messages });
    return reply.choices[0].message.content;

  } else if (engineRef.type === 'transformers') {
    const result = await engineRef.instance(messages, { max_new_tokens: 512 });
    return result[0].generated_text.at(-1).content;
  }
}
```

### 3.2 state.js anpassen

`loadedEngines` und `getOrInitEngine` aus `state.js` entfernen und durch Import aus `engine.js` ersetzen:

```javascript
// state.js – statt eigener Engine-Logik:
import { getEngine, chat } from './engine.js';

export async function getOrInitEngine(modelId) {
  const model = state.availableModels.find(m => m.id === modelId);
  
  state.globalLoading = true;
  state.globalLoadingStatus = `Lade: ${model.name}...`;
  
  try {
    return await getEngine(model, (progress) => {
      if (progress.progress) {
        state.globalLoadingProgress = Math.round(progress.progress * 100);
        state.globalLoadingStatus = progress.text || state.globalLoadingStatus;
      }
    });
  } finally {
    state.globalLoading = false;
  }
}
```

---

## 4. Cache-Prüfung für transformers.js Modelle

MLC hat `hasModelInCache()`. Für transformers.js muss die Cache-Prüfung anders laufen:

```javascript
// Ergänzung in checkCacheStatus()
export async function checkCacheStatus() {
  for (let model of state.availableModels) {
    if (!model.engine || model.engine === 'mlc') {
      // Bestehende MLC-Logik
      model.cached = await hasModelInCache(model.id);

    } else if (model.engine === 'transformers') {
      // Cache Storage direkt prüfen
      try {
        const cache = await caches.open('transformers-cache');
        const keys = await cache.keys();
        // Prüfen ob mindestens eine Datei des Repos gecacht ist
        model.cached = keys.some(req => req.url.includes(model.hfRepo));
      } catch {
        model.cached = false;
      }
    }
  }
}
```

---

## 5. UI: Modell-Karten erweitern

Die bestehenden Modell-Karten in `ModelsView.vue` sollten anzeigen, mit welcher Engine ein Modell läuft. Das ist transparent für interessierte User:

```
┌─────────────────────────────────┐
│  Qwen3.5 Tiny        0.8B Param │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━ 0% │
│  🏷 transformers.js · WebGPU    │ ← neues Badge
│  [Laden]   ELO: 1100            │
└─────────────────────────────────┘
```

Alternativ: Engine-Info nur in der Detail-/Settings-Ansicht, für die Hauptansicht reicht ein simpler "WebGPU"-Badge.

---

## 6. Falcon H1 Tiny – Sonderfall

Mit 90M Parametern ist Falcon H1 Tiny kein vollwertiges Chat-Modell. Für den Arena-Einsatz braucht es einen ehrlichen Disclaimer in der UI:

```
⚡ Falcon Tiny – Speed-Modus
Dieses Modell hat nur 90 Millionen Parameter –
das ist sehr klein. Es antwortet extrem schnell,
aber die Antwortqualität ist deutlich begrenzt.
Gut geeignet um Geschwindigkeit zu vergleichen.
```

Im Modell-Objekt als `note`-Feld hinterlegen, das in der Karte angezeigt wird.

---

## 7. Offene Punkte / To-Do Phase 2

| # | Aufgabe | Datei | Prio |
|---|---|---|---|
| 1 | ONNX-kompatible Repo-IDs für alle Modelle verifizieren | Recherche | Hoch |
| 2 | `engine.js` implementieren | neu | Hoch |
| 3 | `state.js` auf neue Engine-Abstraktion umstellen | `state.js` | Hoch |
| 4 | `@huggingface/transformers` installieren + Vite-Config prüfen | `package.json` | Hoch |
| 5 | Cache-Prüfung für transformers.js Modelle | `state.js` | Mittel |
| 6 | Engine-Badge in Modell-Karten | `ModelsView.vue` | Niedrig |
| 7 | Falcon Tiny Disclaimer in UI | `ModelsView.vue` | Mittel |
| 8 | Regressions-Test: MLC-Modelle noch fehlerfrei? | Manual Test | Hoch |

---

## 8. Vorbedingungen aus WP-003

Diese Punkte müssen vor Beginn von Phase 2 abgeschlossen sein:

- [x] ELO-System läuft stabil (aus WP-003)
- [x] Arena Blind-Test implementiert (aus WP-003)
- [x] PWA / Offline funktioniert für MLC-Modelle (aus WP-003)
- [ ] → Erst dann: Phase 2 beginnen

---

*Dieses Dokument beschreibt ausschließlich Phase 2. Für Phase 1 (Kern/MLC) → WP-003. Für Phase 3 (Sprache, Vision, Audio) → WP-005.*
