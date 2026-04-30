# Whitepaper: WP-004 - Modell-Architektur & Auswahl (v1.1.0)

## Strategie (3B-Grenze)
Die OS-Arena nutzt Modelle bis zu einer Größe von **3 Milliarden Parametern (3B)**. Dies stellt den idealen Kompromiss zwischen logischer Tiefe und Browser-Performance dar.

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

## ELO-Initialisierung (Benchmark-Startwerte)
* **Llama 3.2 3B**: 1300
* **Gemma 2 2B**: 1280
* **SmolLM2**: 1250
* **Llama 3.2 1B**: 1200
* **Qwen 2.5 1.5B**: 1180
* **Qwen 2.5 Tiny**: 1100
* **TinyLlama**: 1000
