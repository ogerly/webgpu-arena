# Workpaper: Mobile-First UI & Navigation

## Zielsetzung
Die Anwendung soll für mobile Endgeräte optimiert werden (Mobile First). Die Vue-Komponenten müssen stark vereinfacht und auf ein hervorragendes mobiles Nutzungserlebnis zugeschnitten werden.

## Hauptaufgaben

### 1. Mobile First Architektur (Vue)
- **Super Simple UI:** Reduzierung der Komplexität in den Vue-Komponenten.
- **Responsive Design:** Sicherstellen, dass das Layout primär für mobile Bildschirme entworfen ist und sich bei Bedarf auf größeren Bildschirmen anpasst.

### 2. Hauptnavigation (Navbar / Bottom Navigation)
Eine neue, mobilfreundliche Navigation muss integriert werden. Diese enthält folgende Menüpunkte/Bereiche:
- **Avatar** (Benutzerprofil)
- **Einstellungen**
- **Modelle** (Übersicht / Verwaltung der LLMs)
- **Arena** (Der Hauptbereich für Vergleiche)
- **Chat** (Kommunikationsbereich)

*Hinweis:* Auf mobilen Geräten empfiehlt sich hierfür oft eine Bottom-Navigation (Tab-Bar) oder ein sehr aufgeräumtes Hamburger-Menü, wobei die wichtigsten Punkte (Arena, Chat, Modelle) schnell erreichbar sein sollten.

### 3. Rangliste (Leaderboard)
- Implementierung einer Ranglisten-Ansicht.
- Die Ansicht muss auf kleinen Bildschirmen gut lesbar sein (z.B. als kompakte Liste mit Platzierung, Modellname und Score).

## Nächste Schritte
1. Entwurf der neuen UI-Struktur (Wireframing/Komponentenschnitt).
2. Anpassung der globalen CSS/Tailwind-Klassen für Mobile First.
3. Implementierung der Navigation (Navbar).
4. Aufbau der "Rangliste" und Integration in das Routing.
5. Überprüfung und Optimierung der bestehenden Views (Arena, Chat, Modelle, Einstellungen) für mobile Geräte.
