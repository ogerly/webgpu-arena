# WORKPAPER: WP-009 - Refactor Arena UI

## Status
**Aktiv - Phase 2 (Polishing)**

## Meilensteine & Fortschritt

### Phase 1: Komponenten-Zentralisierung (100% erledigt)
- [x] **ChatInput.vue**: Erstellung einer universellen Eingabekomponente mit Glassmorphism-Design und Auto-Resize.
- [x] **Migration**: Erfolgreiche Einbindung in `ArenaChatView.vue` und `ChatView.vue` (Redundanz entfernt).

### Phase 2: Arena-Setup & Battle (80% erledigt)
- [x] **ArenaView.vue**: Kompletter Overhaul des Setups. Modernes Karten-Grid mit VS-Divider.
- [x] **ArenaChatView.vue**: Header-Refactoring (Prompt-Vorlagen, Blind-Test-Badge).
- [x] **ELO-Feedback**: Visuelle Anzeige der ELO-Veränderungen in den Modell-Karten nach einem Vote.
- [ ] **Animationen**: Übergang zwischen Setup und Battle weiter verfeinern.

## Technische Details
- **Design-System**: Konsequente Nutzung von CSS-Grid und Glassmorphism für maximale visuelle Wertigkeit.
- **Responsiveness**: Alle neuen Komponenten wurden Mobile-First optimiert.

## Problemstellung
Durch die Integration der Performance-Metriken (tok/s), der ELO-Winner-Anzeige und der globalen Upload-Buttons ist das Layout der `ArenaChatView.vue` instabil geworden. 
- **Layout-Bruch**: Karten verschieben sich bei unterschiedlichen Textlängen.
- **Mobile UX**: Die neuen Buttons und Stats nehmen zu viel Platz ein oder überlappen.
- **Hierarchie**: Die visuelle Trennung zwischen Antwort-Text und Metadaten ist nicht mehr klar genug.

## Ziele
1. **Stabiles Grid**: Ein robustes Layout für den Modell-Vergleich (Desktop: Side-by-Side, Mobile: Stacked).
2. **Dezente Metriken**: Performance-Daten sollen informativ, aber nicht ablenkend sein.
3. **Optimierte Buttons**: Die "Winner"-Buttons und "Global Upload"-Buttons müssen klarer voneinander getrennt sein.
4. **Clean Code**: Bereinigung veralteter CSS-Regeln in der Komponente.

## Geplante Maßnahmen

### 1. CSS-Refactoring (Grid & Flex)
- Umstellung auf ein CSS-Grid für die `models-response-container`, um sicherzustellen, dass beide Modell-Karten immer die gleiche Höhe haben (unabhängig von der Antwortlänge).
- Nutzung von `min-height` für die Antwort-Bereiche.

### 2. Metriken-Leiste (Footer)
- Zusammenfassung der Performance-Daten und des Upload-Buttons in einem dedizierten "Card-Footer".
- Nutzung von Tooltips oder kleineren Icons für mobile Geräte.

### 3. Winner-Status Visualisierung
- Klarere farbliche Markierung der Gewinner-Karte (Subtle Glow statt harter Rahmen).
- Optimierung der ELO-Zahl-Darstellung.

## TODOs
- [x] Grundlayout in `ArenaChatView.vue` auf Grid umstellen
- [x] Card-Struktur vereinheitlichen (Header, Body, Footer)
- [x] Styles für Performance-Stats optimieren (Schriftgröße, Abstände)
- [x] Mobile Breakpoints prüfen
- [x] Finaler visueller Check

---
*Dokumentation des Source of Truth gemäß AAMS.*
