# WP-013: UI Feature - Copy Funktion für Chat

## Ziel
Alle Fragen (User) und Antworten (Modell) im Chat sollen eine "Kopieren"-Funktion erhalten, damit der Textinhalt einfach in die Zwischenablage kopiert werden kann.

## Problembeschreibung
Aktuell müssen Nutzer den Text mühsam markieren, um Code oder Textabschnitte aus dem Chat zu extrahieren. Eine 1-Klick-Lösung verbessert die Usability (UX) enorm, besonders bei längeren Antworten oder Code-Snippets.

## Geplante Umsetzung

### 1. UI-Design (Chat Bubbles)
- Hinzufügen eines kleinen Copy-Buttons (📋 oder ein entsprechendes SVG-Icon) an jeder Chat-Bubble.
- Der Button könnte entweder permanent sichtbar sein (z.B. rechts unten in der Bubble) oder erst beim Hovern über die Nachricht erscheinen.

### 2. Logik (Clipboard API)
- Nutzung der `navigator.clipboard.writeText(text)` API, um den reinen Text der Nachricht zu kopieren.
- Visuelles Feedback nach dem Klick (z. B. Icon ändert sich kurzzeitig zu einem ✅ oder ein kleiner Tooltip "Kopiert!" erscheint).

### 3. Betroffene Komponenten
- Voraussichtlich `src/components/views/ChatView.vue` oder `ArenaChatView.vue` (bzw. die spezifische Komponente, welche die einzelnen Nachrichten rendert).
- Bei der Implementierung muss darauf geachtet werden, dass bei Markdown-Inhalten idealerweise der gerenderte Text oder der Raw-Markdown kopiert wird (meistens bevorzugen Nutzer den reinen Text oder Markdown, je nach Kontext).

## Checkliste
- [ ] Copy-Button in das HTML/Template der Chat-Bubbles integrieren.
- [ ] Klick-Event an eine `copyToClipboard(text)` Funktion binden.
- [ ] Visuelles Feedback für erfolgreiches Kopieren einbauen.
- [ ] Auf Mobile-Devices testen (Hover existiert nicht, daher permanent oder über Touch sichtbar).
