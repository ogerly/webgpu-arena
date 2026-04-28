# LTM Index (Long Term Memory)

## OS-Arena Core Architecture
- **Concept:** Local Open Source LLM Arena running fully in the browser via WebGPU.
- **Library:** `@mlc-ai/web-llm` (MLC-AI Engine).
- **Models:** Llama 3.2 1B, Qwen 2 1.5B, TinyLlama 1.1B, Gemma 2B. All are quantized to `q4f16_1`.
- **Offline Storage / Caching:** Models are permanently cached offline in the browser's Cache Storage via WebLLM's `hasModelInCache` and initialization logic.
- **WebGPU Requirement:** The app fundamentally relies on `navigator.gpu`. A fallback error banner is shown to users lacking WebGPU to help them enable it via `chrome://flags/#enable-unsafe-webgpu`.
- **Design System:** Glassmorphism UI with premium dark aesthetics (`#0f172a` base, `#00f2fe` accent). Fully responsive, no Tailwind (pure CSS).

## File Map
- `src/App.vue`: Main layout (Sidebar for caching models, Arena for comparing them).
- `src/style.css`: Global design tokens.
- `index.html`: Contains SEO optimized tags.
- `WORKING/WHITEPAPER/WP-001-ARCH-os-arena-konzept.md`: Easy-to-understand architecture concept for end-users.
