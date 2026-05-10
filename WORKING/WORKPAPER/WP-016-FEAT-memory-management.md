# Workpaper WP-016: Feature - Memory Management & VRAM Unloading

**Projekt:** WebGPU-Arena  
**Typ:** Feature / Stabilität  
**Status:** In Planung  
**Verknüpft mit:** WP-015 (WebGPU Benchmark)

---

## 1. Ausgangslage & Ziel
Große Sprachmodelle (LLMs) benötigen signifikante Mengen an Video-RAM (VRAM). Wenn Nutzer zwischen mehreren Modellen wechseln oder leistungsintensive System-Tests (wie in WP-015) durchführen möchten, kann der verfügbare VRAM schnell erschöpft sein. Dies führt zu *Out of Memory (OOM)* Abstürzen des Browsers.
Aktuell lädt WebLLM die Modelle in den Arbeitsspeicher, bietet aber keine explizite UI-Funktion, um den Speicher wieder freizugeben, ohne die gesamte Seite neu zu laden.

**Ziel:** Implementierung einer sauberen Memory-Management-Lösung.
Nutzer sollen Modelle gezielt aus dem VRAM entladen können. Zusätzlich soll ein "Clear All" (Panic Button) den gesamten belegten GPU-Speicher leeren, was besonders als Voraussetzung für den WebGPU Benchmark (WP-015) essenziell ist.

## 2. Technische Implementierung

### 2.1 State & Engine Management (`src/state.js`)
Die WebLLM-Engine liefert die Methode `engine.unload()`, welche den VRAM freigibt.
- Implementierung der Funktion `unloadModel(modelId)`: Ruft `engine.unload()` auf und löscht die Instanz aus `loadedEngines`.
- Implementierung der Funktion `unloadAllModels()`: Iteriert über alle `loadedEngines` und entlädt sie.
- Setzen von `model.cached` oder einem neuen Zustand `model.loaded` im State, damit die UI den Status korrekt widerspiegelt.

### 2.2 UI-Anpassungen
- **Model Registry (Settings oder ModelsView):** Ein "Entladen"-Button (🗑️) neben jedem aktuell geladenen Modell.
- **Top-Navigation / Header:** Ein kleiner Indikator (z. B. "RAM: 85%"), der rot wird, wenn der Speicher kritisch ist. Ein Klick darauf bietet die Option "VRAM leeren".
- **Benchmark-Integration (WP-015):** Bevor der Benchmark startet, prüft das System, ob Modelle geladen sind. Falls ja, wird ein Warnhinweis mit einem "Speicher jetzt entladen"-Button angezeigt.

## 3. Todos & Meilensteine

- [ ] `state.js` um `unloadModel(modelId)` und `unloadAllModels()` erweitern.
- [ ] UI in `SettingsView.vue` oder Header anpassen, um die Unload-Befehle auszulösen.
- [ ] BenchmarkView (WP-015) so konfigurieren, dass sie vor dem Start `loadedEngines` prüft.
- [ ] Testen des VRAM-Abbaus mithilfe der Browser-Entwicklertools (Memory Tab).
