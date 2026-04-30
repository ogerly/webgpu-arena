# Changelog: OS-Arena

Alle relevanten Änderungen und Meilensteine dieses Projekts.

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
