# WP-009 Setup: Release & Versions-Management

## Zielsetzung
Implementierung eines zentralen Versions-Managements, das die Versionsnummer aus der `package.json` in die gesamte Anwendung (UI, PWA, GitHub) spiegelt.

---

## 1. Vorbereitung
- [x] `package.json` auf eine saubere Start-Version setzen (z.B. 1.1.0).
- [x] `vite.config.js` anpassen, um die Version via `define` zu exportieren.

## 2. UI-Integration
- [x] Anzeige der Version in `SettingsView.vue` hinzufügen.
- [ ] Version dezent in der `MobileNav.vue` oder `App.vue` einblenden (optional).

## 3. Dokumentation
- [x] `CHANGELOG.md` initialisieren und bisherige Meilensteine (WP-001 bis WP-008) zusammenfassen.
- [x] Dokumentation im Whitepaper WP-003 finalisieren.

---

## Ablauf-Log
- **Phase 1**: Technische Basis in Vite schaffen.
- **Phase 2**: UI-Anzeige implementieren.
- **Phase 3**: Historie aufarbeiten.

---
> **Status:** Gestartet (2026-04-30)
