# LTM Index (Long Term Memory)

## OS-Arena Core Architecture
- **Concept:** Local Open Source LLM Arena running fully in the browser via WebGPU.
- **Library:** `@mlc-ai/web-llm` (MLC-AI Engine).
- **Models:** Llama 3.2 1B, Qwen 2 1.5B, TinyLlama 1.1B, Gemma 2B. All are quantized to `q4f16_1`.
- **Offline Storage / Caching:** Models are temporarily cached offline in the browser's Cache Storage / IndexedDB.
- **WebGPU Requirement:** Robust check via `navigator.gpu.requestAdapter()`. A fallback error banner is shown to users lacking WebGPU.
- **Design System:** Glassmorphism UI with premium dark aesthetics (`#0f172a` base, `#00f2fe` accent). Mobile-first, fully responsive.

## File Map
- `src/App.vue`: Main layout mit `<router-view>` und `<keep-alive>`.
- `src/router/index.js`: Definiert URLs und Views.
- `src/modelRegistry.js`: Zentrale Definition aller LLMs und ihrer Metadaten.
- `WORKING/WHITEPAPER/WH-001-ARCH-webgpu-arena-konzept.md`: Grundlegendes Architekturkonzept.
- `WORKING/WHITEPAPER/WH-002-ARCH-frontend-navigation.md`: Dokumentation der SPA Router-Architektur & UI Design-Prinzipien.
- `WORKING/WHITEPAPER/WH-006-ARCH-dual-deployment.md`: Dokumentation des Dual-Deployments auf GitHub Pages und Hugging Face Spaces.
- `WORKING/WORKPAPER/closed/`: Enthält abgeschlossene Aufgaben und Spezifikationen (z.B. Vue-Router, HomeView, Core-Review).

## Recent Updates (2026-05)
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
- Testing and monitoring the live Supabase No-Key architecture.
- Streaming of token responses (P1).
