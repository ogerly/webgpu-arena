# WP-006: Integration von Text-to-Image (T2I) Modellen

## Status
- **Status:** In Progress
- **Priorität:** Hoch
- **Erstellt am:** 2026-05-03
- **Typ:** Feature / Architektur

## 1. Zielsetzung
Erweiterung der WebGPU-Arena um Text-to-Image (T2I) Fähigkeiten. Nutzer sollen in der Lage sein, hochwertige Bilder direkt im Browser mittels WebGPU zu generieren.

### Kernpunkte:
- **100% Offline**: Die Bildgenerierung muss ausschließlich lokal auf der GPU des Nutzers erfolgen. Keine externen APIs oder Cloud-Dienste (wie Pollinations, Unsplash etc.).
- Integration von spezialisierten T2I Modellen (Flux, Sana, SD-1.5) via ONNX/WebGPU.
- Ausschluss dieser Modelle von der Arena (kein Vergleich möglich/sinnvoll).
- Nahtlose Integration in den Einzel-Chat mit Bildausgabe.

## 2. Ausgewählte Modelle
| Modell | Typ | Backend | Besonderheit |
|--------|-----|---------|--------------|
| **Flux2 Klein 4B** | T2I | ONNX/WebGPU | Hohe Qualität, kompakt |
| **Sana 0.6B** | T2I | ONNX/WebGPU | Extrem schnell, effizient |
| **Stable Diffusion 1.5** | T2I | WebGPU | Klassiker, bewährt |

## 3. Architektur-Änderungen

### 3.1 Model Registry (`src/modelRegistry.js`)
Einführung eines `type` oder `task` Feldes, um zwischen LLM (Text-to-Text) und T2I (Text-to-Image) zu unterscheiden.
- LLMs: `task: 'chat'` (Default)
- T2I: `task: 'image'`

### 3.2 State Management (`src/state.js`)
Anpassung der `getOrInitEngine` Logik. T2I Modelle benötigen eine andere Pipeline (z.B. Transformers.js v3 oder spezialisierte ONNX Runtime Wrapper) als die MLC-Engine für LLMs.

### 3.3 UI Komponenten

#### ModelsView (`src/components/views/ModelsView.vue`)
- Gruppierung der Modelle nach Typ (Text vs. Bild).
- Anzeige von T2I-spezifischen Metadaten.

#### ChatView (`src/components/views/ChatView.vue`)
- Erkennung, ob das aktive Modell ein T2I Modell ist.
- Anpassung der UI (z.B. "Generiere Bild..." statt "KI berechnet Antwort...").
- Rendering von Bildern in den Chat-Bubbles.

#### ChatInput (`src/components/chat/ChatInput.vue`)
- Dynamische Platzhalter ("Beschreibe ein Bild..." vs "Frag mich etwas...").

## 4. Implementierungsschritte
1. [x] **Model Registry Update**: Neue Modelle hinzugefügt und Kategorisierung eingeführt.
2. [x] **UI-Anpassung ModelsView**: Modelle nach Text/Bild gruppiert und dedizierte Buttons hinzugefügt.
3. [x] **Chat-Logik**: Dynamische Umschaltung zwischen Text-Chat und Bild-Generierung (Mock implementiert).
4. [x] **Bild-Rendering**: Bild-Bubbles mit Download-Option in ChatView integriert.
5. [x] **Testing**: `tests/models.test.js` erfolgreich aktualisiert und validiert.

## 5. Ausschlusskriterien
- **Keine Arena**: T2I Modelle erscheinen nicht in der Auswahl für Arena A/B.
- **Nur WebGPU**: Es werden ausschließlich WebGPU-fähige Modelle unterstützt, um die Performance-Vorgaben zu halten.
