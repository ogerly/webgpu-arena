# Whitepaper: WP-004 - Modell-Architektur & Auswahl (v1.2.0)

## Strategie (3B-Grenze)
Die WebGPU-Arena nutzt Modelle bis zu einer Größe von **3 Milliarden Parametern (3B)**. Dies stellt den idealen Kompromiss zwischen logischer Tiefe und Browser-Performance dar.

## Die Arena-Mischung (7 Kern-Modelle)

### 1. Reasoning & Logik (High-End Tier)
| Modell | ID | Größe | Fokus |
| :--- | :--- | :--- | :--- |
| **Llama 3.2 3B** | `Llama-3.2-3B-Instruct-q4f16_1-MLC` | 3B | **Der Champion**: Beste Logik im Browser |
| **Gemma 2 2B** | `gemma-2-2b-it-q4f16_1-MLC` | 2B | Reasoning & Präzisions-König |
| **SmolLM2** | `SmolLM2-1.7B-Instruct-q4f16_1-MLC` | 1.7B | Mathe- & Logik-Spezialist |

### 2. Allrounder (Balanced Tier)
| Modell | ID | Größe | Fokus |
| :--- | :--- | :--- | :--- |
| **Llama 3.2 1B** | `Llama-3.2-1B-Instruct-q4f16_1-MLC` | 1B | Ausgewogener Standard |
| **Qwen 2.5 1.5B** | `Qwen2.5-1.5B-Instruct-q4f16_1-MLC` | 1.5B | Instruction-Following & Multilingual |

### 3. Speed & Negativ-Benchmarks
| Modell | ID | Größe | Fokus |
| :--- | :--- | :--- | :--- |
| **Qwen 2.5 Tiny** | `Qwen2.5-0.5B-Instruct-q4f16_1-MLC` | 0.5B | Maximale Effizienz |
| **TinyLlama** | `TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC` | 1.1B | **Negativ-Beispiel**: Speed ohne Qualität |

---

## Bildgenerierung (Text-to-Image Tier)
Zusätzlich zum Text-Vergleich bietet die WebGPU-Arena spezialisierte T2I-Modelle an. Diese nutzen eine **ONNX-WebGPU-Pipeline** für maximale Performance.

| Modell | Typ | Backend | Min. VRAM |
| :--- | :--- | :--- | :--- |
| **Stable Diffusion 1.5** | Classic | WebGPU | 4 GB |
| **Sana 0.6B** | Speed | ONNX-WebGPU | 6 GB |
| **Flux.1 [dev] Klein** | Premium | ONNX-WebGPU | 12 GB+ |

### Multimodale Strategie
1. **Text**: MLC-Engine (WebLLM) für optimierte LLM-Inferenz.
2. **Bild**: Transformers.js / ONNX-Runtime für Diffusion-Pipelines.
3. **Hardware-Check**: Vor jedem Start erfolgt ein VRAM-Limit-Check.

---

## Audio & Vision (Neue Modalitäten)
Die Arena wird neben Text und Bild um Speech und optische Zeichenerkennung (ONNX-WebGPU) erweitert:

### 1. Audio (TTS & STT)
| Modell | Typ | Fokus | Backend |
| :--- | :--- | :--- | :--- |
| **Kokoro-82M (German-Martin)** | TTS | Text-to-Speech (Deutsche Stimme) | ONNX-WebGPU |
| **Whisper (Tiny/Base)** | STT | Speech-to-Text (Spracherkennung) | ONNX-WebGPU |

### 2. Vision (OCR)
| Modell | Typ | Fokus | Backend |
| :--- | :--- | :--- | :--- |
| **GLM-OCR** | Vision | Optische Zeichenerkennung | ONNX-WebGPU |

---

## ELO-Initialisierung (Benchmark-Startwerte)
* **Llama 3.2 3B**: 1300
* **Gemma 2 2B**: 1280
* **SmolLM2**: 1250
* **Llama 3.2 1B**: 1200
* **Qwen 2.5 1.5B**: 1180
* **Qwen 2.5 Tiny**: 1100
* **TinyLlama**: 1000
