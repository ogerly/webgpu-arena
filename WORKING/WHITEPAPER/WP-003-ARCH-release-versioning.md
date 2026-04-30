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

## 3. Release-Zyklus (Workflow)

1. **Entwicklung**: Features werden in Workpapern dokumentiert und umgesetzt.
2. **Version Bump**: Vor einem größeren Release wird die Version in `package.json` erhöht (z.B. `npm version patch`).
3. **Changelog**: Die Datei `CHANGELOG.md` wird mit den Verbesserungen des aktuellen Schritts aktualisiert.
4. **GitHub Release**: Ein Tag wird gepusht, der automatisch das Deployment auf GitHub Pages auslöst.

## 4. Changelog-Struktur
Der Changelog orientiert sich an den Workpapern und bündelt die technischen Verbesserungen:
- **Feat**: Neue Funktionen (z.B. WebGPU Monitoring).
- **Fix**: Fehlerbehebungen (z.B. Brave-Kompatibilität).
- **Style**: UI/UX Verbesserungen (z.B. Glassmorphism Refactor).

---
*Dokument gehört zur "Source of Truth" (Whitepapers) der OS-Arena.*
