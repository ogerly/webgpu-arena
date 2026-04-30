# Whitepaper WP-002: Frontend-Architektur, UI & Navigation

**Projekt:** OS-Arena  
**Stand:** 2026-04-30  
**Status:** Implementiert & Aktiv  

---

## 1. Die "Single Page Application" (SPA) Architektur
OS-Arena ist eine reine Browser-Applikation ohne klassisches Backend. Um ein reibungsloses Nutzererlebnis (UX) zu gewährleisten, wurde das Frontend auf Basis von **Vue 3** mit dem offiziellen **Vue-Router** (`vue-router@4`) strukturiert.

### 1.1 Warum Vue-Router?
- **Spezifische URLs:** Jeder Bereich (Startseite, Modelle, Chat, Einstellungen) hat eine eigene URL (Deep-Links).
- **Historie:** Die native Browser-Navigation (Vor/Zurück) funktioniert fehlerfrei, was insbesondere auf mobilen Endgeräten kritisch ist.
- **Sauberkeit:** Die Hauptkomponente (`App.vue`) und die mobile Navigationsleiste (`MobileNav.vue`) sind völlig entkoppelt von der manuellen State-Verwaltung (`<router-view>` und `<router-link>` übernehmen die Arbeit).

### 1.2 Die Keep-Alive-Magie
Das Laden von Large Language Models in den VRAM via WebGPU ist ein aufwändiger und ressourcenintensiver Prozess. 
Wenn Nutzer vom aktiven Chat in den Einstellungs-Tab und wieder zurück wechseln, darf der Chat (und vor allem die laufende MLC-Engine) nicht neu geladen werden. 
Dies wird durch den `<keep-alive>`-Wrapper um den `<router-view>` realisiert. Die `ChatView.vue` und die WebLLM-Engine-Zustände bleiben dauerhaft im RAM erhalten, solange der Browser-Tab nicht geschlossen wird.

## 2. Benutzeroberfläche & Design-Prinzipien

### 2.1 Mobile-First Ansatz
Die Arena wurde vorrangig für die Nutzung auf Smartphones und Tablets optimiert:
- Kompakte untere Navigationsleiste (`MobileNav.vue`), die leicht mit dem Daumen erreichbar ist.
- Bedienelemente wie die Modellauswahl und das Voting-System (`ChatView.vue`) sind touch-freundlich und platzsparend direkt im Verlauf angeordnet.

### 2.2 Glassmorphism & Premium Dark-Mode
Um den Prototyp-Charakter abzulegen und "State of the Art" zu wirken, nutzt die App ein tiefes, sattes Dark-Mode-Design (`#0f172a` als Basis). 
Darauf aufbauend werden semitransparente Panels mit leichten Rändern (`rgba(255,255,255,0.05)`) und Blur-Effekten verwendet (**Glassmorphism**).
Dies schafft eine subtile Tiefenwirkung und lässt den Inhalt über dem Hintergrund schweben.

### 2.3 Die Home-Ansicht (`HomeView.vue`)
Die App verfügt über eine Startseite, die als primäre Landing-Page dient. Sie klärt neue Nutzer direkt über den Charakter des Projekts (Offenes Testlabor) auf und kommuniziert transparent die Kernwerte:
- 100% Kostenlos und Offline-fähig (IndexedDB Caching).
- Keine Accounts, keine APIs, totale Privatsphäre.
- Direkte Integration der Entwickler-Credits (@ogerly / DEVmatrose) und Spendenmöglichkeiten zur Finanzierung der Weiterentwicklung.
  - Die Spendenbox wurde extrem platzsparend und ressourcenschonend mittels des nativen HTML5 `<details>`-Elements als Accordion umgesetzt.

## 3. System-Monitoring & Globales Feedback

Um die technische Komplexität des lokalen KI-Betriebs für den Nutzer greifbar und transparent zu machen, wurde ein dediziertes Feedback-System implementiert:

### 3.1 Loading Overlay (`LoadingOverlay.vue`)
Ein globales, gläsernes Overlay, das bei ressourcenintensiven Operationen (wie dem Initialisieren einer Engine) erscheint. Es bietet einen zentralen Fortschrittsring und Statusmeldungen, ohne die Navigation vollständig zu blockieren (da es via Vue-State gesteuert wird).

### 3.2 System Info Panel (`SystemInfoPanel.vue`)
Dieses Modul in den Einstellungen dient der technischen Transparenz. Es nutzt die WebGPU-API und die Performance-API des Browsers, um:
- Den Namen der aktiven Grafikkarte (GPU) anzuzeigen.
- Den aktuellen RAM-Verbrauch des Browser-Tabs zu visualisieren.
- Den Status des lokalen Modell-Caches zu prüfen.

### 3.3 Download-Tracking (`LoadingStatusBar.vue`)
Ermöglicht das Mitverfolgen von Hintergrund-Downloads. Während Modelle geladen werden, zeigt diese Komponente in der Einstellungs-Ansicht detaillierte Fortschrittsbalken für jedes einzelne Modell, was besonders bei Arena-Vergleichen (Zwei Modelle gleichzeitig) die Übersichtlichkeit erhöht.
