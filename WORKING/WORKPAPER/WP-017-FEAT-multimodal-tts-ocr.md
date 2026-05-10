# Workpaper WP-017: Feature - Multimodale Erweiterung (TTS, STT & OCR)

**Projekt:** WebGPU-Arena  
**Typ:** Feature / Modell-Erweiterung  
**Status:** In Planung  

---

## 1. Ausgangslage & Ziel
Nach der erfolgreichen Implementierung der Text-LLMs (via WebLLM) und der Vorbereitung für Bild-Generierung (T2I), soll die WebGPU-Arena nun um weitere Modalitäten wachsen, um das volle Potenzial der lokalen WebGPU/ONNX-Beschleunigung im Browser zu demonstrieren.

**Ziel:** Integration von Modellen für Audio (Text-to-Speech & Speech-to-Text) sowie Vision (Optische Zeichenerkennung - OCR). Alle Modelle sollen lokal im Browser laufen.

## 2. Die neuen Modalitäten

### 2.1 Audio: Text-to-Speech (TTS)
- **Modell:** `huggingFresse/Kokoro-82M-ONNX-German-Martin`
- **Technologie:** ONNX Runtime Web
- **Use-Case:** Generierung von deutscher Sprache mit der Stimme "Martin". Perfekt als "Vorlese"-Funktion für Antworten aus dem Chat.

### 2.2 Audio: Speech-to-Text (STT)
- **Modell:** Whisper Modelle (z. B. `whisper-tiny` oder `whisper-base`)
- **Technologie:** Transformers.js / ONNX Runtime Web
- **Use-Case:** Spracheingabe vom Mikrofon direkt in den Chat transkribieren.

### 2.3 Vision: Optische Zeichenerkennung (OCR)
- **Modell:** `GLM-OCR`
- **Technologie:** WebGPU / Transformers.js
- **Use-Case:** Ein Bild im Chat hochladen und den Textinhalt nativ im Browser extrahieren, um ihn anschließend als Prompt für das LLM zu verwenden.

## 3. Architektur & Backend
Alle neuen Modalitäten setzen verstärkt auf die **ONNX-Runtime**.
Wir benötigen eine saubere Trennung der Backend-Engines in `src/compute/`:
- `engine_mlc.js` (Für Text-LLMs)
- `engine_onnx.js` (Für TTS, STT, OCR und Bildgenerierung)

## 4. UI-Integration (Meilensteine)
- [ ] **Sprach-Eingabe (Whisper):** Mikrofon-Button im Chat-Input (`ChatView.vue`).
- [ ] **Sprach-Ausgabe (Kokoro):** Lautsprecher-Icon an generierten Chat-Bubbles.
- [ ] **Bild-Upload (GLM-OCR):** Attachment-Button im Chat-Input zum Hochladen von Dokumenten.
- [ ] Update der `modelRegistry.js`, um die neuen Modelle zu tracken.
