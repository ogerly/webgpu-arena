# 🏟️ OS-Arena

**OS-Arena** ist ein reiner Browser-Client, um schmale, offene KI-Modelle (Open-Weight Models) direkt lokal gegeneinander antreten zu lassen. Alles passiert **100% lokal** auf deinem Gerät – ohne Cloud-Zwang, ohne API-Kosten und mit maximaler Privatsphäre.

## ✨ Features
- **Direkter Modell-Vergleich**: Wähle zwei KIs und lass sie dieselbe Frage beantworten. Stimme ab, wer besser ist!
- **WebGPU-Powered**: Die KI läuft dank `@mlc-ai/web-llm` extrem performant direkt über deine lokale Grafikkarte. (Robuster Hardware-Check integriert).
- **Offline fähig**: Einmal heruntergeladene Modelle werden lokal im Cache (IndexedDB) deines Browsers zwischengespeichert. So kannst du die Arena – solange der Cache nicht geleert wird – auch ohne Internetverbindung nutzen.
- **Mobile-First Design**: Moderne, reaktionsschnelle Benutzeroberfläche (Glassmorphism), die auf jedem Endgerät optimal funktioniert.
- **PWA-Ready**: Installiere die OS-Arena als eigenständige App direkt auf deinen Desktop oder dein Smartphone.
- **Privacy First & Sicher**: Deine Prompts, Daten und Chats verlassen niemals dein Endgerät. Strikte Sanitization schützt vor XSS-Angriffen.

## 🚀 Integrierte Modelle
Die Arena nutzt für den Browser kompilierte Modelle (WebML-Community). Standardmäßig integriert sind kompakte und pfeilschnelle KIs:
- **Llama 3.2** (1B Parameter)
- **Qwen 2** (1.5B Parameter)
- **TinyLlama** (1.1B Parameter)
- **Gemma** (2B Parameter)



<img width="1532" height="1256" alt="image" src="https://github.com/user-attachments/assets/fc7e5f75-3a10-4786-8e7d-729a2968940c" />

## 🛠️ Lokales Setup für Entwickler

Da die App als reine Frontend-Applikation läuft, benötigst du kein Backend:

```bash
# 1. Repository klonen
git clone https://github.com/DEVmatrose/os-arena.git
cd os-arena

# 2. Abhängigkeiten installieren
npm install

# 3. Entwicklungsserver starten
npm run dev
```

## 🌐 GitHub Pages Deployment
Dieses Projekt ist "Serverless" und dafür ausgelegt, direkt via GitHub Pages gehostet zu werden.
Es gibt eine fertige GitHub Action (`.github/workflows/deploy.yml`). Sobald du diese in deinem Repo aktivierst, wird bei jedem Push auf den `main` Branch automatisch die App gebaut und auf GitHub Pages bereitgestellt.

## ⚠️ Systemanforderungen für Nutzer
Damit die KI im Browser läuft, wird Folgendes benötigt:
- Ein moderner Webbrowser (empfohlen: **Google Chrome** oder **Microsoft Edge**).
- **WebGPU** muss unterstützt und aktiviert sein (falls es standardmäßig nicht aktiv ist, im Browser `chrome://flags/#enable-unsafe-webgpu` auf Enabled setzen).
- Speicherplatz: Beim erstmaligen Laden werden die Modelldaten im Browser-Cache gespeichert (ca. 0.5 bis 2 GB pro Modell).

## 📄 Lizenz & Beitrag
Dieses Projekt ist Open Source. Fühle dich frei, die Arena zu forken, Pull Requests zu erstellen oder eigene Modelle (`q4f16_1-MLC`) hinzuzufügen!
