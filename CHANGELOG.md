# Changelog: WebGPU-Arena

Alle relevanten Änderungen und Meilensteine dieses Projekts.

## [1.3.0] - 2026-09-27
### Added
- **Neue Modell-Generation (2025/2026)**: Qwen3.5 4B (Vision), Phi-4 mini 3.8B, Ministral 3 3B (Instruct + Reasoning), Hermes 3 3B, Qwen3.5 2B, Qwen3 1.7B (Thinking-Modus), Qwen 2.5 3B, Gemma 3 1B.
- **WebGPU Benchmark** (`/benchmark`): Isolierte Hardware-Messung mit MatMul, SAXPY und GEMM – GPU vs. CPU im direkten Vergleich (WP-015).
- **Archiv-System**: Ausgemusterte Modelle werden in der Modell-Bibliothek als „Archiv" und in der Rangliste mit „Retired"-Tag geführt – ELO-Historie bleibt erhalten.
- **Badge-System**: Neue Modell-Klassen (Flagship, Champion, Thinking) mit eigenen Badges in der Bibliothek.

### Changed
- **Arena-Besetzung komplett neu**: 2023/2024er-Modellreihe (Llama 3.2, Gemma 2, SmolLM2, Qwen 2.5 0.5B/1.5B, TinyLlama) ist ausgemustert (`status: 'retired'`) und aus allen Selektoren entfernt.
- **Default-Auswahl**: Arena = Qwen3.5 4B vs. Qwen3 1.7B, Chat = Ministral 3 3B.
- **`@mlc-ai/web-llm`**: 0.2.82 → 0.2.85 (Qwen3.5, Ministral 3, Phi-4-mini, Gemma 3 erst ab 0.2.83 verfügbar).

### Fixed
- **Install-Konflikt**: `vite-plugin-pwa` 1.2.0 → 1.3.0 (Peer-Dependencies-Problem mit Vite 8 behoben, `npm install` lief wieder sauber durch).
- **Arena-Selektor**: Bild-Modelle tauchten fälschlich in der Modell-Auswahl der Arena auf.
- **Leaderboard-Sortierung**: Image-Modelle ohne Score führten zu NaN-Vergleichen – Rangliste listet nun nur Text-Modelle.

## [1.2.0] - 2026-04-30
### Added
- **3B Model Limit**: Neue Modellklasse mit Llama 3.2 3B, Gemma 2 2B und SmolLM2 1.7B als Champions.
- **No-Key Security**: Globales Ranking ohne API-Keys im Frontend – Supabase Edge Function als Lese-Proxy (`get-leaderboard`).
- **Single-Chat Refactor**: ChatGPT-ähnliche Bubble-UI mit Markdown-Support und lokaler Historie.
- **Copy-Icons**: Roher Nachrichten-Text in Single-Chat und Arena per Klick kopierbar (📋 → ✅).
- **Modell-Stärken & -Schwächen**: Anzeige im Modell-Registrierungs-View.
- **AAMS-Showcase**: Architektur-Präsentation auf der Landing Page.
- **WebGPU-Shader-Debugger**: Kompilierungs-Warnungen/Fehler mit Quellcode-Ansicht (WP-012).

### Changed
- **Branding**: Projekt von „OS-Arena" zu „WebGPU-Arena" umbenannt (Code, PWA, Doku), inkl. Storage-Migration (WP-014).
- **Dual-Deployment**: Paralleler Betrieb auf GitHub Pages und Hugging Face Space (WH-006), `VITE_BASE_URL`-Override für HF.

### Fixed
- **GitHub Pages 404s**: Asset-Pfade und Manifest-Icons korrigiert.
- **Navbar-Transparenz** und AAMS-Image-404 behoben.

## [1.1.0] - 2026-04-30
### Added
- **Zentrales Versions-Management**: Versionierung wird nun global über `package.json` gesteuert und in die UI (Settings) injiziert.
- **Single-Chat Mode**: Refactor der `ChatView.vue` für eine fokussierte Einzelmodell-Interaktion.
- **Modell-Status-Indikatoren**: Auswahl-Dropdowns zeigen nun direkt an, ob ein Modell lokal (💾) oder in der Cloud (☁️) liegt, inkl. Direkt-Download.
- **WebGPU Status-Badge**: Auf der Startseite wird nun sofort angezeigt, ob der Browser WebGPU-kompatibel ist.

### Fixed
- **GitHub Actions Build**: Fehlende `package-lock.json` hinzugefügt, um Caching-Probleme im CI/CD-Flow zu beheben.
- **Base-Path Navigation**: Automatisches Umschalten der Basis-URL zwischen lokalem Dev-Server (`/`) und GitHub Pages (`/os-arena/`).

## [1.0.0] - 2026-04-29
### Added
- **Initiales Release**: Basis-Arena mit Modell-Vergleich (Llama 3.2, Qwen 2, Gemma, TinyLlama).
- **Glassmorphism Design**: Premium Dark-Mode UI mit Vue 3.
- **System-Info Panel**: Anzeige von GPU-Details und RAM-Verbrauch.
- **PWA-Support**: App als Progressive Web App installierbar.
- **Offline-Fähigkeit**: Lokales Caching der Modelle via IndexedDB.

---
*Die Versionierung folgt dem Semantic Versioning Prinzip.*
