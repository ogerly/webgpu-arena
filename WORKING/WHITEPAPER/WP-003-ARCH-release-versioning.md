# Whitepaper WP-003: Release- & Versions-Management

**Projekt:** OS-Arena  
**Status:** In Implementierung  
**Source of Truth:** `package.json`

---

## 1. Philosophie der Versionierung
Um Konsistenz über alle Plattformen (lokal, GitHub, PWA) zu gewährleisten, folgt OS-Arena dem Prinzip der **"Single Source of Truth"**. Die Versionsnummer wird ausschließlich in der `package.json` gepflegt und von dort in die Anwendung injiziert.

## 2. Technischer Ablauf (Automation)

### 2.1 Injektion via Vite
In der `vite.config.js` wird die Version aus der `package.json` ausgelesen und über das `define`-Plugin global in der App verfügbar gemacht:
```javascript
define: {
  '__APP_VERSION__': JSON.stringify(process.env.npm_package_version),
}
```

### 2.2 Anzeige in der UI
Die Konstante `__APP_VERSION__` kann in jeder Vue-Komponente verwendet werden. Standardmäßig wird die Version an folgenden Stellen angezeigt:
- **Settings/Profil**: Detaillierte Versionsinfo inkl. Build-Status.
- **Footer/Sidebar**: Dezente Anzeige für technisches Feedback.

## 3. Release-Rhythmen & Zyklen

Um eine hohe Stabilität bei gleichzeitigem Fortschritt zu gewährleisten, definieren wir folgende Rhythmen:

### 3.1 Patch-Releases (x.x.Y) - "As needed"
- **Inhalt**: Bugfixes, kleine CSS-Korrekturen, Tippfehler, Sicherheitsupdates.
- **Frequenz**: Sofort nach Behebung und Test eines Problems. Kann mehrfach täglich vorkommen.
- **Ziel**: Fehlerfreie Nutzung des aktuellen Feature-Sets.

### 3.2 Minor-Releases (x.Y.0) - "Weekly / Bi-Weekly"
- **Inhalt**: Neue Funktionen (z.B. neue Chat-Modi, zusätzliche System-Metriken), neue Modelle in der Registry, größere Refactorings.
- **Frequenz**: Typischerweise wöchentlich oder alle zwei Wochen nach Abschluss eines Workpapers.
- **Ziel**: Kontinuierliche Erweiterung des Funktionsumfangs der Arena.

### 3.3 Major-Releases (X.0.0) - "Milestones"
- **Inhalt**: Grundlegende Architekturänderungen (z.B. Wechsel des Frameworks), komplettes Re-Design der UI, Einführung bahnbrechender neuer Technologien (z.B. Multimodalität).
- **Frequenz**: Selten (alle 3-6 Monate), markiert signifikante Meilensteine des Projekts.
- **Ziel**: Evolutionäre Sprünge in der Vision der OS-Arena.

## 4. Changelog-Struktur
Der Changelog orientiert sich an den Workpapern und bündelt die technischen Verbesserungen:
- **Feat**: Neue Funktionen (z.B. WebGPU Monitoring).
- **Fix**: Fehlerbehebungen (z.B. Brave-Kompatibilität).
- **Style**: UI/UX Verbesserungen (z.B. Glassmorphism Refactor).

---
*Dokument gehört zur "Source of Truth" (Whitepapers) der OS-Arena.*
