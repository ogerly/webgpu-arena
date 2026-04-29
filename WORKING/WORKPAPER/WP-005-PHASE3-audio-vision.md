# Workpaper WP-005: Phase 3 – Sonder-Fähigkeiten (Audio, Vision, Voice)

**Projekt:** OS-Arena  
**Stand:** 2026-04-29  
**Status:** Geplant – startet nach Abschluss WP-004  
**Bezug:** WP-002-MODELS-integration-arena-bewertung.md  
**Vorbedingung:** WP-004 (Phase 2) vollständig abgeschlossen  
**Vorgänger:** WP-003 (Phase 1 · MLC-Kern), WP-004 (Phase 2 · Dual-Engine)

---

## Ziel dieser Phase

OS-Arena bekommt Fähigkeiten, die über reinen Text-Chat hinausgehen. Der User kann sprechen statt tippen, Antworten vorlesen lassen und Bilder in die Arena einbringen. Außerdem: echter WebCPU-Fallback für Geräte ohne WebGPU.

Alle Erweiterungen sind modular – sie ergänzen die bestehende Arena, ersetzen nichts.

---

## 1. WebCPU Fallback (wllama)

### Problem

Ohne WebGPU zeigt die App bislang nur einen Hinweis. Das Versprechen "läuft bei jedem" gilt dann nicht vollständig.

### Lösung: wllama als CPU-Engine

`wllama` ist llama.cpp als WebAssembly. Es läuft auf **jedem Gerät**, das einen Browser hat – ohne GPU, ohne besondere Voraussetzungen. Langsamer als WebGPU, aber funktional.

**Relevante Spaces als Referenz:**
- `smartdigitalnetworks/wllama-webcpu`
- `anokimchen/SmolLM2-1.7B-Instruct-WebCPU`

### Einbindung in engine.js (Erweiterung aus WP-004)

```javascript
import { Wllama } from '@wllama/wllama';

// Modell-Objekt bekommt engine: 'wllama'
// { id: 'SmolLM2-wllama', engine: 'wllama', ggufUrl: '...', ... }

if (model.engine === 'wllama') {
  const wllama = new Wllama('/wllama-worker.js');
  await wllama.loadModelFromUrl(model.ggufUrl, {
    progressCallback: onProgress
  });
  loadedEngines[key] = { type: 'wllama', instance: wllama };
}
```

### UX-Logik: Automatische Weiche

```javascript
// Beim App-Start:
if (!navigator.gpu) {
  // WebGPU-Modelle deaktivieren
  // Stattdessen: wllama-Modelle automatisch aktivieren
  state.cpuMode = true;
}
```

Was der User sieht wenn kein WebGPU:

```
ℹ️  Kein WebGPU erkannt – CPU-Modus aktiv
   Modelle laufen langsamer, aber alles funktioniert.
   [Was ist WebGPU?]
```

Keine Fehlermeldung. Kein roter Text. Einfach ein sachlicher Hinweis.

---

## 2. Spracheingabe (Whisper STT)

### Was es ist

Der User kann sprechen statt tippen. Whisper transkribiert die Sprache direkt im Browser, lokal, ohne Cloud.

**Referenz:** `smartdigitalnetworks/whisper-webcpu`

Whisper läuft über WebAssembly (CPU) – kein WebGPU nötig. Das bedeutet: funktioniert auch im CPU-Modus.

### Einbindung

```javascript
// whisper.js (neue Datei)
import { pipeline } from '@huggingface/transformers';

let whisperPipe = null;

export async function initWhisper() {
  whisperPipe = await pipeline(
    'automatic-speech-recognition',
    'onnx-community/whisper-tiny',  // ← klein, schnell
    { device: 'wasm' }              // ← CPU, kein GPU nötig
  );
}

export async function transcribe(audioBlob) {
  if (!whisperPipe) await initWhisper();
  const result = await whisperPipe(audioBlob);
  return result.text;
}
```

### UI-Integration

Mikrofon-Button im Chat und in der Arena:

```
[🎤 Sprechen]  →  Aufnahme läuft...  →  Text erscheint im Eingabefeld
```

Der transkribierte Text landet im normalen Eingabefeld. Der User kann ihn noch korrigieren bevor er abschickt.

---

## 3. Text-to-Speech (Kokoro TTS)

### Was es ist

Modell-Antworten werden vorgelesen. Gut für Accessibility, gut für Hands-free-Nutzung, gut für User die lieber hören als lesen.

**Referenz:** `webml-community/kokoro-webgpu`

Kokoro ist ein kleines, hochwertiges TTS-Modell. Es klingt deutlich besser als Browser-native TTS (`speechSynthesis`).

### Einbindung

```javascript
// tts.js (neue Datei)
import { pipeline } from '@huggingface/transformers';

let ttsPipe = null;

export async function initTTS() {
  ttsPipe = await pipeline(
    'text-to-speech',
    'onnx-community/kokoro-82M',
    { device: 'webgpu' }
  );
}

export async function speak(text) {
  if (!ttsPipe) await initTTS();
  const result = await ttsPipe(text);
  // result.audio ist ein Float32Array
  playAudio(result.audio, result.sampling_rate);
}

function playAudio(audioData, sampleRate) {
  const ctx = new AudioContext({ sampleRate });
  const buffer = ctx.createBuffer(1, audioData.length, sampleRate);
  buffer.copyToChannel(audioData, 0);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();
}
```

### UI-Integration

Lautsprecher-Button an jeder Modell-Antwort:

```
[Antwort von Gemma 2B]
"Die Quadratwurzel von 144 ist 12."  [🔊]
```

Optional: Auto-Vorlesen wenn Spracheingabe aktiv (Voice-Loop: sprechen → Antwort → vorlesen).

---

## 4. Vision: Bild in die Arena bringen (Moondream)

### Was es ist

Der User kann ein Bild hochladen und beide Arena-Modelle dazu befragen. "Was siehst du auf diesem Bild?" "Beschreibe das Foto." "Was steht auf dem Schild?"

**Referenz:** `Xenova/experimental-moondream-webgpu`

Moondream ist ein kleines Vision-Language-Model (VLM) – es versteht Bilder und antwortet auf Text-Fragen dazu.

### Einbindung

Moondream läuft separat von den Chat-Modellen. Es ist kein Ersatz, sondern ein zusätzlicher Modus in der Arena:

```javascript
// vision.js (neue Datei)
import { pipeline } from '@huggingface/transformers';

let visionPipe = null;

export async function initVision() {
  visionPipe = await pipeline(
    'image-to-text',
    'Xenova/moondream2',
    { device: 'webgpu' }
  );
}

export async function describeImage(imageUrl, question = 'Describe this image.') {
  if (!visionPipe) await initVision();
  const result = await visionPipe(imageUrl, { question });
  return result[0].generated_text;
}
```

### UX: Bild-Arena

```
[Bild hochladen 🖼️]

Frage: [Was siehst du auf diesem Bild?        ]

   Modell A                    Modell B
   ────────────────            ────────────────
   "Ich sehe einen            "Das Bild zeigt
    Hund auf einer             eine Wiese mit
    Wiese..."                  einem Hund..."

[A war besser] [Unentschieden] [B war besser]
```

Bild-Arena ist eine separate Kategorie im Arena-Modus, nicht der Standard.

---

## 5. Voice-Arena (Voxtral)

### Was es ist

Eine vollständig sprachbasierte Arena: User spricht eine Frage, beide Modelle antworten gesprochen. Vergleich auf Sprachebene.

**Referenz:** `mistralai/Voxtral-Realtime-WebGPU`

### Hinweis zur Komplexität

Voxtral ist ein Echtzeit-Voice-Modell von Mistral. Die Integration ist deutlich aufwändiger als die anderen Features und hängt von der API-Stabilität des Modells ab. Dieses Feature ist als letztes umzusetzen.

```
Voice-Arena Ablauf:
1. [🎤 Starten]
2. User spricht Frage
3. Whisper → Transkription
4. Beide Modelle antworten (Text)
5. Kokoro TTS → beide Antworten werden vorgelesen
6. User wählt durch Sprache: "A" oder "B"
```

---

## 6. Dokument-Analyse (SmolDocling)

### Was es ist

User kann ein PDF oder Bild eines Dokuments hochladen. Das Modell extrahiert Text, beantwortet Fragen dazu.

**Referenz:** `callbacked/smoldocling256M-webgpu`

SmolDocling ist ein 256M Modell speziell für Dokument-Verständnis – kein allgemeines Chat-Modell.

### Einbindung als Sonder-View

Kein Arena-Modus – eigener View "Dokumente" in der Navigation. User lädt Dokument hoch, stellt Fragen, bekommt Antworten. Kein Modell-Vergleich, kein ELO.

---

## 7. Übersicht: Was bringt Phase 3

| Feature | Modell | Framework | GPU nötig? | Aufwand |
|---|---|---|---|---|
| CPU-Fallback | SmolLM2 wllama | wllama | ❌ Nein | Mittel |
| Spracheingabe | Whisper Tiny | transformers.js | ❌ Nein (WASM) | Mittel |
| Vorlesen | Kokoro 82M | transformers.js | ✅ Ja | Mittel |
| Bild-Arena | Moondream2 | transformers.js | ✅ Ja | Hoch |
| Voice-Arena | Voxtral | transformers.js | ✅ Ja | Sehr hoch |
| Dokument-Analyse | SmolDocling 256M | transformers.js | ✅ Ja | Hoch |

---

## 8. Reihenfolge innerhalb Phase 3

Empfohlene Umsetzungsreihenfolge nach Aufwand/Nutzen:

```
1. CPU-Fallback (wllama)      → größter Nutzen, breitet Zielgruppe
2. Spracheingabe (Whisper)    → einfach, großer UX-Gewinn
3. Vorlesen (Kokoro)          → Accessibility, rundet Voice ab
4. Bild-Arena (Moondream)     → neues Arena-Format, spannend
5. Dokument-Analyse           → eigener Use-Case, separat
6. Voice-Arena (Voxtral)      → aufwändig, als Krönung
```

---

## 9. Offene Punkte / To-Do Phase 3

| # | Aufgabe | Datei | Prio |
|---|---|---|---|
| 1 | wllama installieren, SmolLM2 GGUF-URL recherchieren | `engine.js` | Hoch |
| 2 | CPU-Mode State-Flag + UI-Hinweis | `state.js` | Hoch |
| 3 | Whisper STT als `whisper.js` implementieren | neu | Mittel |
| 4 | Mikrofon-Button in Chat + Arena | `ChatView.vue`, `ArenaView.vue` | Mittel |
| 5 | Kokoro TTS als `tts.js` implementieren | neu | Mittel |
| 6 | 🔊-Button an Antworten | `ChatView.vue`, `ArenaView.vue` | Mittel |
| 7 | Moondream Vision als `vision.js` implementieren | neu | Hoch |
| 8 | Bild-Upload + Bild-Arena Modus | `ArenaView.vue` | Hoch |
| 9 | SmolDocling + Dokument-View | neu | Niedrig |
| 10 | Voice-Arena (Voxtral) | neu | Niedrig |

---

## 10. Vorbedingungen aus WP-003 und WP-004

- [x] Dual-Engine (MLC + transformers.js) läuft stabil (aus WP-004)
- [x] Arena mit Kategorien und ELO aktiv (aus WP-003)
- [x] PWA Offline stabil (aus WP-003)
- [ ] → Erst dann: Phase 3 beginnen

---

*Dieses Dokument beschreibt ausschließlich Phase 3. Für Phase 1 (Kern/MLC) → WP-003. Für Phase 2 (Dual-Engine) → WP-004. Überblick über alle Phasen → WP-002.*
