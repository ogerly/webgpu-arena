# 2026-04-28-IMPL-AAMS-modelle-laden.md

## session_goal
Implementierung eines Sidebar-UI-Konzepts zur Verwaltung von lokalen KIs und Etablierung eines persistenten, offline-fähigen Modell-Speichers im Browser.

## repository_inventory
- Vite + Vue + PWA Basis-Setup vorhanden.
- WebLLM integriert.

## key_findings
- **Lokaler Speicher im Browser:** Aus Sicherheitsgründen können Web-Apps (auch PWAs) nicht beliebig auf den Windows/Mac-Dateibaum zugreifen. Wir nutzen daher die **Cache API / IndexedDB** des Browsers. Dies agiert als unser "Modell-Ordner".
- **Offline-Fähigkeit:** WebLLM speichert heruntergeladene Modelle automatisch im Cache Storage. Sobald sie zu 100% geladen sind, sind sie dauerhaft offline verfügbar.
- **Überprüfung beim Start:** Die Funktion `hasModelInCache(modelId)` aus der WebLLM-Bibliothek erlaubt es uns, beim Start der Seite zu prüfen, welche Modelle bereits vollständig in unserem lokalen "Ordner" (Cache) liegen.
- **WebGPU ist zwingend:** Die lokale Ausführung von LLMs im Browser erfordert Zugriff auf die Grafikkarte (WebGPU). Ohne WebGPU bricht der Vorgang ab. Ein Graceful Degradation / Error-Handling Banner wurde in die App eingebaut, welches den Nutzer bei fehlernder WebGPU anweist (`chrome://flags/#enable-unsafe-webgpu`).

## file_protocol
- `WORKING/WORKPAPER/2026-04-28-IMPL-AAMS-modelle-laden.md` angelegt und aktualisiert.
- `src/App.vue` wurde um eine Sidebar und die Speicher-Prüflogik erweitert, inkl. WebGPU Fehlerbehandlung.
- `WORKING/WHITEPAPER/WP-001-ARCH-os-arena-konzept.md` aktualisiert mit Hinweisen auf WebGPU und Cache Storage.

## next_steps
- Diese Session ist abgeschlossen. Workpaper wird nach `/closed/` verschoben.
- Memory/LTM (`ltm-index.md`) wird aktualisiert, um die Architektur-Entscheidungen (Cache API, WebGPU, Modelle) dauerhaft festzuhalten.
