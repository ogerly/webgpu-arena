# Workpaper WP-018: Feature - Neue Modell-Generation (2025/2026)

**Projekt:** WebGPU-Arena  
**Typ:** Feature / Modell-Erweiterung  
**Status:** Abgeschlossen (2026-09-27)  
**Release:** v1.3.0

---

## 1. Ausgangslage & Ziel
Die Arena fuhr noch die komplette 2023/2024er-Modellreihe (Llama 3.2, Gemma 2, SmolLM2, Qwen 2.5, TinyLlama). Die Engine-Pipeline (`@mlc-ai/web-llm`) hat in der Zwischenzeit die Modell-Generationen 2025/2026 (Qwen3, Qwen3.5, Ministral 3, Phi-4, Hermes 3, Gemma 3) in den WebLLM-Zoo aufgenommen.

**Ziel:** Die Arena mit den aktuell besten browser-fähigen Modellen ausstatten, die überholte Modellreihe aus der aktiven Nutzung nehmen (ELO-Historie erhalten) und die Version auf v1.3.0 heben.

## 2. Modell-Analyse (Kurzform)
- **Qwen3.5 (2026):** Vision-fähig, 262k Kontext, 201 Sprachen. Qwen3.5-4B: GPQA Diamond 76.2 (über GPT-OSS-20B: 71.5).
- **Ministral 3 (12/2025):** Instruct + Reasoning-Variante (Chain-of-Thought) – ideal fürs Arena-Voting.
- **Phi-4 mini (3.8B):** Reasoning-Schwergewicht, leicht über dem 3B-Limit.
- **Qwen3 (04/2025):** Schaltbarer Thinking-Modus, klar stärker als Qwen2.5 in gleicher Größe.
- **Hermes 3 (Llama-3.2-3B-Base):** Direkt-Nachfolger des bisherigen Champions.
- **Gemma 3 1B:** Neuere Generation als Gemma 2 2B.

## 3. Umsetzung

### 3.1 Neue Arena-Modelle (`src/modelRegistry.js`)
| Modell | ID (WebLLM) | ELO-Seed |
|---|---|---|
| Qwen3.5 4B | `Qwen3.5-4B-q4f16_1-MLC` | 1340 |
| Phi-4 mini | `Phi-4-mini-instruct-q4f16_1-MLC` | 1330 |
| Ministral 3 3B | `Ministral-3-3B-Instruct-2512-BF16-q4f16_1-MLC` | 1325 |
| Hermes 3 3B | `Hermes-3-Llama-3.2-3B-q4f16_1-MLC` | 1315 |
| Qwen3.5 2B | `Qwen3.5-2B-q4f16_1-MLC` | 1305 |
| Ministral 3 3B Reasoning | `Ministral-3-3B-Reasoning-2512-q4f16_1-MLC` | 1300 |
| Qwen3 1.7B | `Qwen3-1.7B-q4f16_1-MLC` | 1290 |
| Qwen 2.5 3B | `Qwen2.5-3B-Instruct-q4f16_1-MLC` | 1280 |
| Gemma 3 1B | `gemma3-1b-it-q4f16_1-MLC` | 1240 |

### 3.2 Archiv der 2024er-Reihe
Alle sieben alten Text-Modelle: `status: 'retired'`, `arena: false`. Sie erscheinen nicht mehr in Chat-/Arena-Selektoren, Cache-Checks oder Diagnosen, bleiben aber in der Modell-Bibliothek (Sektion „Archiv") und in der lokalen ELO-Rangliste (mit „Retired"-Tag) sichtbar.

### 3.3 UI & State
- `state.js`: Defaults → Arena A = Qwen3.5 4B, Arena B = Qwen3 1.7B, Chat = Ministral 3 3B; `checkCacheStatus()` überspringt retired Modelle.
- `ChatView.vue`, `ArenaChatView.vue`: Selektoren filtern `status !== 'retired'` (ArenaChat: zusätzlich nur Text-Modelle – Bild-Modelle tauchten zuvor fälschlich in der Arena-Auswahl auf).
- `ModelsView.vue`: Neue Sektion „Archiv (ausgemustert)" + `Retired`-Pill + Badge-Styles (Flagship, Champion, Thinking).
- `LeaderboardView.vue`: Nur Text-Modelle mit Score (fixt NaN-Sort-Bug durch Image-Modelle), Retired-Tag.
- `utils/diagnostics.js`: Beide Diagnose-Loops überspringen retired Modelle.
- `HomeView.vue`: Modell-Showcase auf die neuen Champions umgestellt.

### 3.4 Abhängigkeiten
- `@mlc-ai/web-llm`: `^0.2.82` → `^0.2.85` (Qwen3.5, Phi-4-mini, Gemma 3 erst ab v0.2.83 im Modell-Zoo).
- `vite-plugin-pwa`: `^1.2.0` → `^1.3.0` (fixt Peer-Dependency-Konflikt mit Vite 8; `npm install` war zuvor gebrochen).

## 4. Verifikation
- [x] Alle 9 neuen Modell-IDs in installierter WebLLM 0.2.85 vorhanden (Check auf `lib/index.js`)
- [x] `npm install` läuft sauber durch (vorher: ERESOLVE)
- [x] `tests/models.test.js`: 5/5 bestanden (Namenskonvention, Metadaten)
- [x] `npm run build`: erfolgreich (PWA-Prebuild ok)
- [x] `tests/ranking.test.js`: 2 Fehlschläge (`navigator is not defined`) – **vorbestehend**, auf sauberem main reproduzierbar

## 5. Offene Punkte (Folgeworkpapers)
- T2I-Pipeline in `state.js` ist weiterhin **Mock** (Flux/Sana/SD1.5) – echte ONNX-Implementierung ausstehend.
- WP-016 (VRAM-Management) und WP-017 (TTS/STT/OCR) weiterhin „In Planung".
- `ranking.test.js`-Node-Umgebung: `navigator`-Mock für jsdom ergänzen.
- HomeView-Manifest enthält noch „OS-Arena"-Reste (Branding-Rest aus vor WP-014).
