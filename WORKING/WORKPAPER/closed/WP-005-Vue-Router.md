# Workpaper WP-005: Architektur-Refactoring auf Vue Router

**Projekt:** OS-Arena  
**Stand:** 2026-04-29  
**Status:** In Planung  

---

## 1. Problemstellung (Ist-Zustand)
Aktuell wird die Navigation der OS-Arena über eine lokale Variable (`currentTab` in der `App.vue`) gesteuert. Die verschiedenen Ansichten werden über ein dynamisches `<component :is="...">` gerendert. 

**Nachteile dieser Architektur:**
- **Keine Deep-Links:** Man kann keine direkten Links zu spezifischen Unterseiten (z. B. den Einstellungen oder dem Chat) teilen. Beim Neuladen landet man immer auf der Startseite.
- **Browser-Historie kaputt:** Die "Zurück"- und "Vor"-Tasten des Browsers funktionieren nicht. Drückt ein Nutzer am Handy auf "Zurück", verlässt er im schlimmsten Fall die gesamte App, anstatt auf die vorherige Seite zu wechseln.
- **Wachstum:** Je mehr Ansichten dazu kommen, desto unübersichtlicher wird der State in der `App.vue`.

## 2. Zielsetzung (Soll-Zustand)
Einführung von `vue-router` (Version 4), dem offiziellen Routing-Plugin für Vue.js. Jeder Bereich der App erhält eine eigene URL.

**Vorteile:**
- Native Unterstützung der Browser-Historie.
- Teilbare URLs (z.B. `os-arena.com/models`).
- Saubere Trennung von Layout (`App.vue` mit Navigation) und Inhalt (`<router-view>`).

## 3. Geplante Routen-Struktur

Die App wird als Single Page Application (SPA) mit `createWebHistory` konfiguriert. Folgende Routen werden angelegt:

| Pfad | Component | Bezeichnung |
| :--- | :--- | :--- |
| `/` | `HomeView.vue` | Startseite & Infos |
| `/models` | `ModelsView.vue` | Modell-Ordner & Downloads |
| `/arena` | `ArenaView.vue` | Arena Setup (Modellauswahl) |
| `/chat` | `ChatView.vue` | Aktives Arena-Battle |
| `/leaderboard` | `LeaderboardView.vue` | ELO-Rangliste |
| `/profile` | `ProfileView.vue` | Nutzer-Profil & Statistiken |
| `/settings` | `SettingsView.vue` | System- & Cache-Einstellungen |

## 4. Implementierungs-Schritte

### Schritt 1: Installation
```bash
npm install vue-router@4
```

### Schritt 2: Router Konfiguration anlegen
Eine neue Datei `src/router/index.js` wird erstellt:
- Import aller View-Komponenten.
- Definition des `routes`-Arrays.
- Initialisierung mittels `createRouter({ history: createWebHistory(), routes })`.

### Schritt 3: Registrierung in main.js
Die `src/main.js` (oder `main.ts`) wird angepasst, um den Router in die Vue-App zu injizieren:
```javascript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
```

### Schritt 4: Umbau der App.vue
- Entfernen der `currentTab`-Logik und des statischen View-Mappings.
- Ersetzen von `<component :is="...">` durch `<router-view v-slot="{ Component }">` (kombiniert mit `<keep-alive>`, damit Chats beim Navigieren nicht neu geladen werden).

### Schritt 5: Anpassung der Navigation (MobileNav.vue)
- Die `<button>`-Elemente in der Bottom-Bar werden durch `<router-link>`-Komponenten ersetzt.
- `vue-router` setzt automatisch eine `.router-link-active`-Klasse für die gerade offene Seite. Unsere manuelle `:class="{ active: ... }"` Logik entfällt und macht den Code deutlich schlanker.

### Schritt 6: Programmatische Navigation anpassen
Stellen, an denen wir direkt per Code wechseln (z. B. der Button "In die Arena" oder "Modelle laden" in der `HomeView`), werden auf `useRouter().push('/pfad')` umgestellt.

## 5. Besonderheiten (Keep-Alive)
Da das WebLLM im Hintergrund rechnet, ist es extrem wichtig, dass die `ChatView.vue` beim Verlassen nicht zerstört wird. Das bestehende `<keep-alive>` in der `App.vue` muss mit dem neuen Router korrekt verheiratet werden:

```html
<router-view v-slot="{ Component }">
  <keep-alive>
    <component :is="Component" />
  </keep-alive>
</router-view>
```
So bleibt der State der aktiven Modelle stabil im RAM/VRAM erhalten, auch wenn der Nutzer kurz in die Settings wechselt.
