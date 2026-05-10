# WP-014: Projekt-Umbenennung von OS-Arena zu WebGPU-Arena

## 1. Ausgangslage & Motivation
Das Projekt trägt aktuell den Namen **OS-Arena** (Open Source Arena). Dieser Name ist jedoch nicht spezifisch genug und kommuniziert nicht das zentrale Alleinstellungsmerkmal der Anwendung. 

**Neue Namensgebung: WebGPU-Arena**
Der neue Name "WebGPU-Arena" bringt den technologischen Kern des Projekts exakt auf den Punkt: Es ist eine Arena für lokale LLMs, die vollständig im Browser via WebGPU-Beschleunigung läuft. Der Name ist prägnant, technisch aussagekräftig und verdeutlicht sofort den Mehrwert (kein Backend, pure lokale Rechenpower).

## 2. Zielsetzung
Vollständige und saubere Umbenennung des Projekts in der gesamten Codebase, den Konfigurationsdateien, der Dokumentation und den Metadaten.

## 3. Scope & Todos

### 3.1 Codebase & UI
- [x] `index.html`: `<title>` und `<meta name="description">` anpassen.
- [x] UI-Komponenten (Header, Navbar, Footer etc.): Alle Vorkommen von "OS-Arena" durch "WebGPU-Arena" ersetzen.
- [x] `manifest.webmanifest` / `vite.config.js` (PWA): `name` und `short_name` anpassen.

### 3.2 Projekt-Konfiguration
- [x] `package.json`: `name`-Feld ändern.
- [x] `vite.config.js`: Falls der `base`-Pfad (für GitHub Pages) `/os-arena/` lautet, muss dieser auf den neuen Repository-Namen (z.B. `/webgpu-arena/`) angepasst werden.
- [ ] Hugging Face: Space-Name und Konfiguration anpassen.

### 3.3 Dokumentation (AAMS)
- [x] `README.md`: Titel, Beschreibungen, Banner und Links anpassen.
- [x] Whitepapers (`WORKING/WHITEPAPER/`): Ersetzen von OS-Arena durch WebGPU-Arena.
- [x] Workpapers (`WORKING/WORKPAPER/`): Ggf. historische Erwähnungen korrigieren oder einfach für die Zukunft als WebGPU-Arena fortführen.

### 3.4 Infrastruktur (Manuell durch den User)
- [ ] **GitHub**: Repository-Name von `os-arena` zu `webgpu-arena` ändern (in den GitHub-Settings).
- [ ] **Lokaler Ordner**: Ggf. den lokalen Entwicklungsordner umbenennen.
- [ ] **Hugging Face**: Einen neuen Space namens `webgpu-arena` erstellen oder den bestehenden umbenennen.
- [ ] **Supabase**: Tabellen / RPCs prüfen (falls dort "os-arena" hardcodiert wurde).

## 4. Umsetzungsschritte
1. Wir beginnen mit einem globalen Suchen & Ersetzen in der Codebase (HTML, Vue-Dateien, Configs).
2. Anschließend passen wir die `README.md` und die zentralen Whitepapers an.
3. Danach klären wir die Infrastruktur-Anpassungen (GitHub / HF Spaces).
