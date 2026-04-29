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
- `WORKING/WHITEPAPER/WP-001-ARCH-os-arena-konzept.md`: Grundlegendes Architekturkonzept.
- `WORKING/WHITEPAPER/WP-002-ARCH-frontend-navigation.md`: Dokumentation der SPA Router-Architektur & UI Design-Prinzipien.
- `WORKING/WORKPAPER/closed/`: Enthält abgeschlossene Aufgaben und Spezifikationen (z.B. Vue-Router, HomeView, Core-Review).

## Recent Updates (2026-04-29)
- AAMS Check: Closed old workpapers, consolidated knowledge into Whitepaper 002.
- Vue-Router Migration: App routes are now fully URL-driven with working Browser-History.
- HomeView: Created an introductory landing page with project info, offline promises, and donation options (collapsible details box).
- P0 Tasks completed: XSS fixed, Vote bug fixed, WebGPU check robust, Model Registry extracted.
- Current Focus: Streaming implementation (P1).
