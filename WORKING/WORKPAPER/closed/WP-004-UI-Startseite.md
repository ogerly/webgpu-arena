# Workpaper WP-004: Konzeption & Design der Startseite (HomeView)

**Projekt:** OS-Arena  
**Stand:** 2026-04-29  
**Status:** In Planung  

---

## 1. Zielsetzung der Startseite
Aktuell landet der Nutzer direkt in der Arena oder bei den Modellen, ohne richtigen Kontext. Die App benötigt eine einladende Startseite ("Landing Page"), die kurz und prägnant erklärt, worum es geht. 
Die Kernbotschaft lautet: **OS-Arena ist ein Testlabor für jedermann – privat, kostenlos und 100% offline.**

## 2. Kerninhalte & Argumente

Die Startseite soll folgende Aspekte klar und laienverständlich kommunizieren:
- **Prototyp / Testlabor**: Es ist ein offenes Experimentierfeld, um kleine KI-Modelle auszuprobieren.
- **Offline-Fähigkeit**: Die App kann lokal installiert werden. Einmal geladene Modelle bleiben auf dem Gerät und funktionieren dauerhaft ohne Internet.
- **Keine Barrieren**: Keine Anmeldung, keine versteckten Kosten, keine API-Schlüssel notwendig.
- **Transparenz**: Alles passiert direkt im Browser auf dem eigenen Endgerät (Privacy by Design).

## 3. Struktur & Layout (Mobile-First Glassmorphism)

Die Startseite wird in `src/components/views/HomeView.vue` implementiert. Das Design nutzt den etablierten Premium-Dark-Mode mit Glassmorphism-Elementen.

### Sektion A: Hero-Bereich
- **Headline**: OS-Arena – Dein lokales KI-Testlabor
- **Sub-Headline**: Erlebe Open-Source-Modelle direkt in deinem Browser. 100% lokal, absolut privat und offline-fähig.
- **Call-to-Action (CTA)**: Zwei prominente Buttons: "⚔️ Zur Arena" und "💾 Modelle laden".

### Sektion B: Feature-Kacheln (Grid)
Vier kompakte Glassmorphism-Karten:
1. 🛡️ **Absolute Privatsphäre**: Deine Daten verlassen niemals dein Gerät.
2. 🔌 **Offline & Autark**: Modelle werden gespeichert und funktionieren immer, auch ohne WLAN.
3. 💸 **100% Kostenlos**: Keine Anmeldung, keine Abos, keine API-Keys erforderlich.
4. 🧪 **Offener Prototyp**: Ein Community-Testlabor, das Transparenz schafft.

### Sektion C: Über den Entwickler & Support
Am Ende der Seite wird ein Footer- oder Card-Element integriert, das den Entwickler vorstellt und Unterstützung für die Weiterentwicklung ermöglicht.

**Projekt & Entwickler:**
- **Entwickler:** @ogerly
- **Firma:** DEVmatrose
- **GitHub Profil:** [DEVmatrose](https://github.com/DEVmatrose)
- **Projekt-Code:** [OS-Arena Repository](https://github.com/DEVmatrose/os-arena)

**Support & Spenden (Krypto):**
Damit die Entwicklung werbe- und kostenfrei bleibt, gibt es Krypto-Spendenadressen:
- **BTC:** `bc1q7m8l4zvx0htxx35cq3ur5pr2khlx9j5srw8flu`
- **ETH:** `0x457A7CEbf4021f9D21a70d5Af6AcF2eA842f141F`
- **Cardano (ADA):** `addr1q9eqsudv2scgggrarvzfufjqdz60mdu3ganjz3qazzzmd3gg8yj6n07p3c267hk0rgnpzklu52jh75w5j6ma30y53h2s74lskm`
- **Solana (SOL):** `B2gdhFHrZNJUS6dzqL8pcAJZsRp6DiquHY7ADhEBaUy9`

## 4. Technische Implementierung
- **Datei**: Erstellung von `src/components/views/HomeView.vue`.
- **Routing/Navigation**: Hinzufügen der Home-Ansicht zur Hauptsteuerung in `App.vue` und einbinden in die `MobileNav.vue` (z.B. mit einem 🏠 Icon).
- **Styling**: Nutzung der bestehenden CSS-Variablen für eine konsistente Farbgebung. Die langen Krypto-Adressen sollten optimalerweise gut auf mobilen Geräten umbrechen oder mit einem kleinen "Kopieren"-Button (Copy to Clipboard) ausgestattet werden.
