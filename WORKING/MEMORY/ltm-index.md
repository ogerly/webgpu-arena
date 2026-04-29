# LTM Index (Long Term Memory)

## OS-Arena Core Architecture
- **Concept:** Local Open Source LLM Arena running fully in the browser via WebGPU.
- **Library:** `@mlc-ai/web-llm` (MLC-AI Engine).
- **Models:** Llama 3.2 1B, Qwen 2 1.5B, TinyLlama 1.1B, Gemma 2B. All are quantized to `q4f16_1`.
- **Offline Storage / Caching:** Models are temporarily cached offline in the browser's Cache Storage / IndexedDB.
- **WebGPU Requirement:** Robust check via `navigator.gpu.requestAdapter()`. A fallback error banner is shown to users lacking WebGPU.
- **Design System:** Glassmorphism UI with premium dark aesthetics (`#0f172a` base, `#00f2fe` accent). Mobile-first, fully responsive.

## File Map
- `src/App.vue`: Main layout (Sidebar for caching models, Arena for comparing them).
- `src/style.css`: Global design tokens.
- `index.html`: Contains SEO optimized tags.
- `WORKING/WHITEPAPER/WP-001-ARCH-os-arena-konzept.md`: Architecture concept.
- `WORKING/WORKPAPER/2026-04MLC-Core`: Current P0-P2 task list and review results.

## Recent Updates (2026-04-29)
- Fixed vote bug by storing model IDs in the chat history.
- Addressed XSS risks by removing `v-html` from chat rendering.
- Replaced misleading "Für immer verfügbar" with accurate wording ("Lokal zwischengespeichert").
- Current Focus: Model Registry extraction and Streaming implementation.
