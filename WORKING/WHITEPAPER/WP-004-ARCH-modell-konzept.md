# Whitepaper WP-004: Modell-Konzept & Integrations-Strategie

**Status:** Aktiv / Source of Truth  
**Version:** 1.1.0  
**Autor:** Antigravity (AI Architect)  

---

## 1. Vision & Philosophie

Das Modell-Konzept der OS-Arena folgt dem Prinzip der **demokratisierten KI**. Modelle sollen nicht auf massiven Server-Farmen laufen, sondern dort, wo der Nutzer ist: auf dem Laptop, dem Tablet oder dem Smartphone.

### 1.1 Kernprinzipien
- **Hardware-Agnostisch**: Lauffähig auf Standard-Consumer-Hardware.
- **Zero-Data-Leak**: 100% lokale Ausführung im Browser-Sandbox.
- **Autonomie**: Vollständige Offline-Funktionalität nach dem Erst-Download.

---

## 2. Auswahlkriterien (The 2B-Limit)

Um das Versprechen der universellen Lauffähigkeit zu halten, setzen wir eine bewusste Grenze für die Modellgröße:

- **Primär-Fokus: < 2B Parameter**: Diese Modelle (z.B. Llama 3.2 1B, SmolLM2, Qwen 2.5 Tiny) benötigen zwischen 500MB und 1.5GB VRAM/RAM. Dies garantiert eine flüssige Erfahrung auf fast allen Geräten mit WebGPU-Unterstützung.
- **Sekundär-Fokus (Optional): 3B - 4B**: Nur für High-End-Browser-Setups. Diese werden als "Experimentell" markiert.
- **Format**: Wir nutzen primär das **MLC-Format** (q4f16_1), da es die beste Balance zwischen Geschwindigkeit (WebGPU) und Qualität bietet.

---

## 3. Technische Architektur

### 3.1 Speicher-Logik (Persistence)
Die Modelle werden nicht bei jedem Start neu geladen, sondern dauerhaft im Browser gespeichert:
- **Speicherort**: Browser Cache Storage API (IndexedDB / Cache API).
- **Management**: Über das `@mlc-ai/web-llm` SDK wird der Cache-Status abgefragt und verwaltet.
- **Transparenz**: Der Nutzer sieht jederzeit in den Einstellungen, wie viel Platz die Modelle belegen.

### 3.2 Multi-Backend Strategie
1. **Engine A: MLC-LLM (Standard)**
   - Nutzt WebGPU für Hardware-Beschleunigung.
   - Ziel: Maximale Token-Generierung pro Sekunde (20-50 tok/s).
2. **Engine B: transformers.js / wllama (Fallback - in Planung)**
   - Nutzt WASM/SIMD für CPU-Ausführung.
   - Ziel: Lauffähigkeit auf Geräten ohne WebGPU-Support.

---

## 4. Metadaten-Standard (`modelRegistry.js`)

Jedes Modell in der Arena muss folgende Struktur erfüllen, um kompatibel mit UI und Ranking zu sein:

```javascript
{
  id: 'string',       // Eindeutige MLC- oder HF-ID
  name: 'string',     // Anzeigename
  size: 'string',     // z.B. "1B Param"
  backend: 'webgpu',  // Aktuell primär webgpu
  language: 'string', // Hauptsprache oder Multilingual
  score: 1200,        // Start-ELO für das Ranking
  status: 'active'    // 'active', 'experimental' oder 'deprecated'
}
```

---

## 5. Ranking & Evaluation

Die Qualität der Modelle wird durch den **Arena-Blind-Test** ermittelt:
- **Methodik**: ELO-Bewertungssystem (K-Faktor 32).
- **Unvoreingenommenheit**: Modellnamen werden erst nach der Stimmabgabe enthüllt.
- **Datenhoheit**: Rankings werden lokal gespeichert, können aber optional für eine globale Leaderboard-Synchronisation (Zukunftsprojekt) geteilt werden.

---

## 6. Modell-Portfolio & Charakteristik

Die folgende Liste stellt die aktuell integrierten Modelle und ihre spezifischen Einsatzgebiete dar:

### 6.1 Llama 3.2 (1B) - Meta
- **Stärken**: Sehr gut unterstützt, hohe Kontext-Stabilität (128k), solider Allrounder für Zusammenfassungen und Q&A.
- **Schwächen**: Teilweise geschwätzig, wird in Logik-Benchmarks von SmolLM2 übertroffen.
- **Einsatz**: Standard-Chat, einfache Textverarbeitung.

### 6.2 Gemma (2B) - Google
- **Stärken**: Höchste Antwortqualität im 2B-Bereich, überlegene Nuancen in der Sprache, starke Logik.
- **Schwächen**: Höchster RAM-Bedarf im Portfolio, etwas langsamer in der Generierung.
- **Einsatz**: Anspruchsvolle logische Aufgaben, kreatives Schreiben.

### 6.3 SmolLM2 (1.7B) - HuggingFace
- **Stärken**: Extrem starke Performance in Logik und Mathematik durch hochwertige Trainingsdaten. Sehr präzise.
- **Schwächen**: Fokus auf Englisch, weniger sprachliche Breite als Qwen oder Llama.
- **Einsatz**: Reasoning-Aufgaben, Code-Verständnis, STEM-Themen.

### 6.4 Qwen 2 / 2.5 (0.5B - 1.5B) - Alibaba
- **Stärken**: Unübertroffene Effizienz. Das 0.5B Modell läuft auf fast jedem Gerät flüssig. Exzellente Mehrsprachigkeit (29+ Sprachen).
- **Schwächen**: Geringeres Weltwissen durch kleine Parameterzahl, neigt bei komplexen Logikketten zu Fehlern.
- **Einsatz**: Multilinguale Chats, einfache Anweisungen, Mobile-Usage.

### 6.5 TinyLlama (1.1B) - Community
- **Stärken**: Pure Geschwindigkeit. Basiert auf der bewährten Llama-2 Architektur. Sehr stabil.
- **Schwächen**: Geringere Genauigkeit bei komplexen Prompts, neigt eher zu Halluzinationen als neuere Modelle.
- **Einsatz**: Schnelles Prototyping, einfachste Interaktionen.

---
*Dieses Dokument dient als Source of Truth für alle Modell-Integrationen in der OS-Arena.*
