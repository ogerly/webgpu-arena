# WP-008 Refactor: Single-Chat Mode

## Zielsetzung
Umwandlung der `ChatView.vue` von einem Arena-Vergleich (Modell A vs B) in einen fokussierten Single-Chat. Der Nutzer wählt ein lokales Modell aus und interagiert direkt damit, ohne Arena-Charakter oder Voting-Logik.

---

## 1. UI-Änderungen (`ChatView.vue`)

| Element | Änderung |
|---------|----------|
| **Header** | Entfernen der VS-Badges und des zweiten Modell-Selects. Ein einziger, prominenter Select für das aktive Modell. |
| **Message-Bubbles** | Umstellung von der nebeneinanderliegenden "Model A / Model B" Ansicht auf einen vertikalen Chat-Flow (User -> Model). |
| **Arena-Logik** | Entfernen der "Besser"-Buttons und der Gewinner/Verlierer-Hervorhebung. |
| **Styling** | Optimierung der Chat-Bubbles für bessere Lesbarkeit in der Einzelansicht. |

---

## 2. Logik-Anpassungen

- **State (`src/state.js`)**: 
  - Einführung von `selectedModelSingle` (optional, oder einfach `selectedModelA` weiterverwenden und B ignorieren).
  - `chatHistory` Struktur vereinfachen: `{ role: 'user' | 'assistant', content: string }`.
- **Generation**:
  - Nur noch eine Engine initialisieren/aufrufen.
  - Integration von Streaming-Antworten (optional, aber für Single-Chat premium).
- **Session-Management**:
  - Reset-Funktion hinzufügen, um den Chat-Verlauf für die aktuelle Sitzung zu leeren.

---

## 3. Ablauf-Plan

1. **Komponente entkernen**: Arena-spezifische HTML-Blöcke und CSS-Klassen entfernen.
2. **Script-Logik vereinfachen**: `submitPrompt` so anpassen, dass nur ein Modell angesprochen wird.
3. **State-Handling**: Sicherstellen, dass die `chatHistory` korrekt befüllt wird.
4. **UI-Polishing**: Responsive Design für die Single-Ansicht optimieren (breitere Bubbles).

---

## 4. To-Do-Liste

- [x] `ChatView.vue` Template bereinigen (Single Model Select).
- [x] `submitPrompt` Logik auf ein Modell reduzieren.
- [x] Voting-Funktion und Arena-Styles entfernen.
- [x] Reset-Button für Chat-Session hinzufügen.
- [x] Testen der WebGPU-Inferenz im Single-Modus.

---

> **Hinweis:** Das Arena-Konzept bleibt in der `ArenaView.vue` erhalten, falls der Nutzer gezielt vergleichen möchte. Die `ChatView.vue` dient nun als "Direkt-Chat" mit einer gewählten KI.
