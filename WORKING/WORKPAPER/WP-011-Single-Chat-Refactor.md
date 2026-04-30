# WORKPAPER: WP-011 - Single-Chat Refactoring & UX-Polishing

## Status
**Abgeschlossen (30. April 2026)**

## Ausgangslage
Aktuell wird die OS-Arena primär als "Kampfplatz" für zwei Modelle wahrgenommen. Der Einzel-Chat ist zwar technisch vorhanden (via `ChatView.vue`), fühlt sich aber im Vergleich zur Arena weniger "poliert" an. Nutzer wünschen sich eine vollwertige ChatGPT-ähnliche Erfahrung für Einzelmodelle.

## Zielsetzung
OS-Arena soll nicht nur die beste Arena sein, sondern auch ein erstklassiger, privater Daily-Driver für den Einzel-Chat mit Open-Source Modellen.

## Aufgaben

### 1. UI/UX Redesign (Single Chat)
- [x] **Bubble-Design**: Moderne Chat-Bubbles (User vs. KI) implementiert.
- [x] **Modell-Selektor**: Eleganter Wechsler im Header integriert.
- [x] **Full-Width Layout**: Optimiert für Einzel-Chat-Fokus.

### 2. Feature-Erweiterungen
- [x] **Chat-Historie**: Persistenz via `localStorage` in `state.js` integriert.
- [x] **Markdown-Support**: Basis-Parsing für Code-Blöcke und Umbrüche aktiv.
- [x] **Download-Integration**: Button für Cloud-Modelle direkt im Chat-Header.

### 3. Navigation & Messaging
- [x] **Klarere Trennung**: Navigation priorisiert "Arena" und "Einzel-Chat".
- [x] **Vorschläge (Suggestions)**: Interaktive Start-Chips für neue Nutzer.

---

## Durchführung

### Task 1.1: Analyse der aktuellen ChatView.vue
Ich werde die `src/components/views/ChatView.vue` untersuchen und die Architektur für das Redesign vorbereiten.
