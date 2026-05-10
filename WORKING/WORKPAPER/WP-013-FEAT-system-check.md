# Workpaper: WP-013 - System-Check & Warninfosystem (v1.0.0)

## 1. Problemstellung
Nutzer versuchen oft, große KI-Modelle (insb. Text-to-Image) auf Hardware zu laden, die nicht über ausreichend VRAM verfügt. Dies führt zu Browser-Abstürzen ("Out of Memory") und einer schlechten UX.

## 2. Zielsetzung
Ein automatisiertes System, das die Hardware des Nutzers erkennt und Modelle als "Empfohlen", "Riskant" oder "Nicht unterstützt" markiert.

## 3. Technische Umsetzung
### A. Hardware-Erkennung (state.js)
- Abfrage `navigator.gpu.requestAdapter()`
- Analyse von `adapter.limits` (insb. `maxStorageBufferBindingSize` als Proxy für VRAM-Klasse).
- Speicherung der Daten im globalen `systemInfo` State.

### B. Modell-Anforderungen (modelRegistry.js)
- Jedes Modell erhält ein Attribut `vram_required` (in GB).
- LLMs (1B-3B): ca. 2-4 GB.
- T2I (Sana/SD): ca. 4-8 GB.
- T2I (Flux): 12 GB+.

### C. UI-Komponenten (ModelsView.vue)
- **Status-Dashboard**: Kurze Info über erkannte GPU.
- **Hardware-Badges**: "VRAM OK" oder "⚠️ VRAM Limit" auf den Modellkarten.
- **Interaktive Warnung**: Modal-Dialog beim Versuch, ein zu schweres Modell zu laden.

## 4. Akzeptanzkriterien
- [ ] App erkennt beim Start, ob WebGPU verfügbar ist.
- [ ] VRAM-Klasse wird grob geschätzt (Low/Mid/High).
- [ ] Modelle, die das geschätzte Limit überschreiten, zeigen eine visuelle Warnung.
- [ ] Download von "High-Risk" Modellen erfordert Bestätigung.

---
**Status**: In Bearbeitung
**Priorität**: Hoch
