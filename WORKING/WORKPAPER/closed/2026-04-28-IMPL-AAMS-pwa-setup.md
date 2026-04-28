# 2026-04-28-IMPL-AAMS-pwa-setup.md

## session_goal
Aufsetzen der Vite+Vue Projektstruktur und Implementierung der in WP-001 definierten Anforderungen (PWA, lokale Speicherung, kompakte KIs).

## repository_inventory
- Vite und Vue Basis-Setup (ohne Tailwind, reines CSS mit Glassmorphism-Ästhetik)
- `vite-plugin-pwa` installiert für die Offline-Fähigkeit und Installierbarkeit.
- `@mlc-ai/web-llm` Engine integriert, um die Modelle lokal über WebGPU auszuführen.

## key_findings
- Die WebLLM Engine von MLC-AI ist ideal, um die kompilierten KIs direkt im Browser auszuführen. Wir haben uns für zwei verlässliche und kleine Modelle aus der WebML-Community entschieden: `Qwen2-1.5B-Instruct-q4f16_1-MLC` und `TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC`.
- Die App.vue wurde mit einem modernen, "Premium Dark Mode" und Glassmorphism ausgestattet, sodass sie bei Erstaufruf hochwertig wirkt.
- SEO-Tags (Title, Meta-Description, Google Fonts) wurden konform der Best Practices eingefügt.

## file_protocol
- `package.json` erweitert (Vite PWA, WebLLM).
- `vite.config.js` für PWA konfiguriert.
- `index.html` für SEO optimiert.
- `src/style.css` mit Global Design Tokens versehen.
- `src/App.vue` mit Arena-Logik (Chat + Voting) implementiert.

## next_steps
- Lokales Starten der Anwendung via `npm run dev` durch den Nutzer, um das User Interface live zu sehen.
- Verifizieren der WebGPU-Kompatibilität beim Ausführen im Browser.
