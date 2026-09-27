# LTM Index (Long Term Memory)

## WebGPU-Arena Core Architecture
- **Concept:** Local Open Source LLM Arena running fully in the browser via WebGPU.
- **Library:** `@mlc-ai/web-llm` (MLC-AI Engine, v0.2.85) + `@huggingface/transformers` (ONNX-WebGPU, v4.2+).
- **Models (v1.3.0):** Qwen3.5 4B (Vision, Flagship), Phi-4 mini 3.8B, Ministral 3 3B (Instruct + Reasoning), Hermes 3 3B, Qwen3.5 2B, Qwen3 1.7B (Thinking), Qwen 2.5 3B, Gemma 3 1B. All quantized to `q4f16_1`. Retired (Archiv): Llama 3.2 1B/3B, Gemma 2 2B, SmolLM2 1.7B, Qwen 2.5 0.5B/1.5B, TinyLlama 1.1B – `status: 'retired'`, only kept for ELO history.
- **Offline Storage / Caching:** Models are temporarily cached offline in the browser's Cache Storage / IndexedDB.
- **WebGPU Requirement:** Robust check via `navigator.gpu.requestAdapter()`. A fallback error banner is shown to users lacking WebGPU.
- **Design System:** Glassmorphism UI with premium dark aesthetics (`#0f172a` base, `#00f2fe` accent). Mobile-first, fully responsive.
- **Deployment (Entscheidung 2026-09):** Hugging Face Space `https://huggingface.co/spaces/ogerl/webgpu-arena` ist das **einzige Live-Deployment** (Docker/nginx, Build `VITE_BASE_URL=./`). GitHub = Source of Truth (Code, AAMS, Releases) — **GitHub Pages wird nicht betrieben** (WH-006-Addendum).
- **Security:** Keine Secrets im Code (LTM-002). Tokens nur in `.env` / Credential-Store; Frontend key-frei (LTM-001).

## File Map
- `src/App.vue`: Main layout mit `<router-view>` und `<keep-alive>`.
- `src/router/index.js`: Definiert URLs und Views.
- `src/modelRegistry.js`: Zentrale Definition aller LLMs und ihrer Metadaten.
- `WORKING/WHITEPAPER/WH-001-ARCH-webgpu-arena-konzept.md`: Grundlegendes Architekturkonzept.
- `WORKING/WHITEPAPER/WH-002-ARCH-frontend-navigation.md`: Dokumentation der SPA Router-Architektur & UI Design-Prinzipien.
- `WORKING/WHITEPAPER/WH-006-ARCH-dual-deployment.md`: Dokumentation des Deployments (ursprünglich dual; Addendum 2026-09: nur noch HF Space).
- `WORKING/WORKPAPER/closed/`: Enthält abgeschlossene Aufgaben und Spezifikationen (z.B. Vue-Router, HomeView, Core-Review).
- `WORKING/WORKPAPER/WP-015-FEAT-webgpu-benchmark.md`: Spezifikation für isolierte WebGPU Hardware-Benchmarks.
- `WORKING/WORKPAPER/WP-016-FEAT-memory-management.md`: Spezifikation für VRAM-Management und das gezielte Entladen von Modellen.
- `WORKING/WORKPAPER/WP-017-FEAT-multimodal-tts-ocr.md`: Erweiterung der Modalitäten um GLM-OCR, Kokoro-TTS und Whisper.
- `WORKING/WORKPAPER/WP-018-FEAT-model-lineup-2026.md`: Neue Modell-Generation 2025/2026, Archiv-System für retired Modelle, Release v1.3.0 (abgeschlossen).
- `WORKING/MEMORY/LTM-001-security-architecture.md`: No-Key-Frontend (Supabase-Edge-Function-Gatekeeper).
- `WORKING/MEMORY/LTM-002-secrets-and-deployment.md`: Secrets-Regeln + Deployment-Zielpfade (HF Space = Live, kein GH Pages).

## Recent Updates (2026-09)
- Model Lineup v1.3.0: 2025/2026er-Generation aktiviert (Qwen3.5, Phi-4 mini, Ministral 3, Hermes 3, Qwen3, Gemma 3), 2023/2024er-Reihe auf `retired` (Archiv in Bibliothek + „Retired"-Tag in der Rangliste).
- New model status system: `status: 'active' | 'retired' | 'experimental'` steuert Selektoren, Cache-Checks, Diagnosen und UI-Archiv; ELO-Historie bleibt erhalten.
- Dependency fixes: `@mlc-ai/web-llm` 0.2.85 (Qwen3.5 erst ab 0.2.83 im Zoo), `vite-plugin-pwa` 1.3.0 (Vite-8-Peer-Konflikt behoben).
- UI fixes: Arena-Selektor ohne Bild-Modelle, Leaderboard nur Text-Modelle (NaN-Sort-Bug), ModelsView-Archiv-Sektion, HomeView-Showcase auf neue Champions.
- AAMS-Branding konsolidiert bei @ogerly: HomeView-Showcase (Bild + 2 Buttons) durch einen einzelnen Link ersetzt → `https://ogerly.github.io/AAMS/`; README + `.agent.json` auf `github.com/ogerly/AAMS` umgestellt (devmatrose existiert nicht mehr); ungenutzte `public/img`-JPG entfernt.
- **Deployment-Entscheidung:** Hugging Face Space ist das einzige Live-Deployment; GitHub Pages entfällt (WH-006-Addendum, LTM-002). Space-Deploy: Build `VITE_BASE_URL=./` → rsync nach Space-Clone → push; Binärdateien meidet (HF erzwingt Xet für neue Binary-Pushes).
- **Security:** LTM-002 (Secrets-Handling) angelegt — keine sicherheitsrelevanten Daten im Code; `.env` + `opencode.json` in `.gitignore`.
- **Incident 2026-09-27:** Lokales `.git` unbeabsichtigt gelöscht (Shell-Kettenfehler); vollständige Wiederherstellung aus GitHub-Remote (Commit, Tags, History intakt). Lehre: Remote = Source of Truth; Shell-Ketten mit `;`-Fallbacks auf Dateisystem-Operationen vermeiden.

## Previous Updates (2026-05)
- AAMS Check: Executed LTM update, created May Diary, closed WP-007 and WP-011.
- Supabase No-Key Architecture: Secured the Global Ranking by implementing an Edge Function proxy (`get-leaderboard`) for reading, removing any need for API keys in the frontend.
- Single Chat Refactor: Elevated the single-model chat with a ChatGPT-like bubble UI, markdown rendering, and local storage persistence.
- HomeView & AAMS Showcase: Integrated a section highlighting the "Single Source of Truth" and AAMS architecture on the landing page.
- Project Renamed & Dual-Deployment Configured: Changed project name from OS-Arena to WebGPU-Arena. Created migration path for localStorage state. Fixed HF Space config error via VITE_BASE_URL env override and wrote WH-006.

## Previous Updates (2026-04-29)
- Vue-Router Migration: App routes are now fully URL-driven with working Browser-History.
- HomeView: Created an introductory landing page with project info, offline promises, and donation options (collapsible details box).
- P0 Tasks completed: XSS fixed, Vote bug fixed, WebGPU check robust, Model Registry extracted.

## Current Focus
- **WP-016**: VRAM-Management / gezieltes Entladen von Modellen (In Planung).
- **WP-017**: Multimodale Erweiterung TTS (Kokoro), STT (Whisper), OCR (In Planung).
- **T2I-Pipeline**: `loadImageModelInternal` in `state.js` ist noch Mock – echte ONNX-WebGPU-Implementierung für Flux/Sana ausstehend.
- **Tests**: `ranking.test.js` braucht `navigator`-Mock (jsdom) für die Node-Testumgebung.
- **Kein GitHub Pages** (Entscheidung 2026-09) — Deploy-Ziele: HF Space (Live) + GitHub (Code/Releases). GitHub-Actions sind wegen Account-Billing gesperrt (relevant nur, wenn man Actions reaktivieren will).
