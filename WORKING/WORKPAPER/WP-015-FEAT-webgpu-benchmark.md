# Workpaper WP-015: Feature - WebGPU Hardware Benchmark

**Projekt:** WebGPU-Arena  
**Typ:** Feature / Infrastruktur  
**Status:** In Planung  

---

## 1. Ausgangslage & Ziel
WebGPU-Arena ist aktuell fokussiert auf das Vergleichen von lokalen LLMs. Um jedoch zu beurteilen, **warum** ein Modell auf einem spezifischen Endgerät langsam oder schnell läuft, fehlt ein natives Werkzeug zur Messung der puren Hardware-Leistung (GPU vs. CPU).

**Ziel:** Integration einer eigenständigen `/benchmark` (oder `/compute-arena`) Route. 
Diese Route führt isolierte WebGPU-Compute-Shader (z. B. Matrix-Multiplikation, Vector-Addition) und CPU-Referenzberechnungen aus, um die nackte Rechenleistung des Systems grafisch darzustellen.

## 2. Strategie (Option B - Arena-fokussierter Benchmark)
Wir entscheiden uns für den **erweiterten Benchmark (Option B)**, da dieser direkt auf die Architektur von lokalen LLMs zugeschnitten ist:
- **MatMul (Matrix Multiplication):** Mit Tiling für optimale WebGPU-Auslastung.
- **SAXPY / Vector Addition:** Speicherbandbreiten-Test.
- **GEMM (General Matrix Multiply):** Simuliert LLM-ähnliche Tensor-Operationen.
- **Token-Generation Speed:** Theoretische Limit-Berechnung (Tokens/s) auf Basis der Hardware-Ergebnisse.

## 3. Architektur & Dateistruktur

Um den Hauptcode der WebGPU-Arena sauber zu halten, kapseln wir die Benchmark-Logik:

```text
src/
├── components/
│   └── benchmark/              # Neues Verzeichnis für UI
│       ├── BenchmarkView.vue     # Haupt-View für die Route /benchmark
│       ├── ComputeControls.vue   # UI zum Starten/Stoppen der Tests
│       └── ResultChart.vue       # Visuelle Ausgabe (Chart.js / vue-chartjs)
├── compute/                    # Neues Verzeichnis für die Engine
│   ├── wgsl/                   # Shader-Dateien
│   │   ├── MatMul.wgsl
│   │   └── Saxpy.wgsl
│   ├── cpuWorker.js            # Web Worker (damit die Vue-UI bei CPU-Tests nicht einfriert)
│   ├── gpuBenchmark.js         # WebGPU Device-Management & Shader-Dispatching
│   └── benchmarkRunner.js      # Orchestriert CPU vs. GPU und Timing (performance.now)
└── router/
    └── index.js                # Neue Route eintragen
```

## 4. Technische Meilensteine (Todos)

### Phase 1: Engine & Shader Basis (Reine Logik)
- [x] Erstellen der `wgsl` Shader für MatMul und SAXPY.
- [x] Implementierung der `gpuBenchmark.js` zur Kommunikation mit der WebGPU-API.
- [x] Erstellen des `cpuWorker.js` für die blockierungsfreie Referenzberechnung.
- [x] Implementierung des `benchmarkRunner.js` inkl. präzisem Timing (`performance.now()` & GPU Sync).

### Phase 2: Vue-Integration & UI
- [x] Neue View `BenchmarkView.vue` erstellen und im `vue-router` als `/benchmark` registrieren.
- [x] Erstellen der `ComputeControls.vue` (Start/Stop-Buttons, Fortschrittsanzeige). (Teil von BenchmarkView)
- [x] Einbindung einer leichtgewichtigen Chart-Library (z. B. `vue-chartjs`) in `ResultChart.vue`. (Vorübergehend als native HTML-Speedup-Card gelöst)

### Phase 3: Optimierung für LLM-Metriken
- [ ] GEMM-Operationen hinzufügen.
- [ ] Berechnung der theoretischen LLM-Performance auf Basis der gemessenen TFLOPS / Memory-Bandwidth.

---
*Die Umsetzung beginnt mit Phase 1 (Reine Logik). Bitte Anweisung geben, sobald der Code für `gpuBenchmark.js` und die WGSL-Shader generiert werden soll.*

---

## 5. System Check & Machbarkeitsanalyse (AAMS)

Vor dem Start der Implementierung wurde ein kurzer Check der bestehenden Architektur durchgeführt, um mögliche Konflikte zu identifizieren:

1. **Ressourcenkonflikte (VRAM & WebGPU Context):** 
   - Das bestehende `src/state.js` prüft die GPU beim Start.
   - Wenn WebLLM Modelle geladen hat, belegen diese massiv VRAM. Ein gleichzeitiger Ausführungs-Stresstest (GEMM/MatMul) könnte zu einem *Out-Of-Memory (OOM)* Absturz führen.
   - **Lösung:** Der Benchmark sollte prüfen, ob `loadedEngines` im `state.js` aktiv sind. Im Idealfall empfehlen wir dem Nutzer, den Benchmark auf einer "leeren" Arena auszuführen, oder wir erzwingen einen Unload der Modelle vor dem Test.
2. **Web Worker in Vite:** 
   - Die vorgeschlagene Architektur mit `cpuWorker.js` passt perfekt zu unserer Vite-Infrastruktur. Vite unterstützt das Importieren von Web Workern nativ über das `?worker` Suffix (z.B. `import CpuWorker from './cpuWorker.js?worker'`).
3. **Abhängigkeiten (Charts):** 
   - Wir haben aktuell keine Chart-Bibliothek. Die Einbindung von `vue-chartjs` (zusammen mit `chart.js`) erhöht die Bundle-Size leicht. Da es sich um eine SPA handelt, sollte die Bibliothek über ein dynamisches `import()` via Code-Splitting in der Router-Config (`src/router/index.js`) geladen werden, damit normale Arena-Nutzer die Chart-Library nicht unnötig herunterladen.
4. **Zusammenspiel mit `diagnostics.js`:** 
   - Die bestehende `src/utils/diagnostics.js` liefert rein statische/theoretische Daten. Der neue Benchmark wird reale Metriken (TFLOPS) ermitteln. Beide Systeme ergänzen sich hervorragend.

**Fazit des Checks:** Die Architektur (Option B) ist vollständig kompatibel mit der bestehenden WebGPU-Arena. Das einzige Risiko ist der VRAM, was durch UI-Hinweise abgefangen werden kann.
