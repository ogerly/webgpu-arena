# Whitepaper: OS-Arena Konzept

## Was ist die OS-Arena?
Die OS-Arena ist eine Plattform, auf der du verschiedene Künstliche Intelligenzen (Large Language Models, kurz LLMs) direkt miteinander vergleichen kannst. Das Besondere: Alles passiert **rein lokal** auf deinem eigenen Gerät.

## Super Simpel: Wie funktioniert das?
1. **Kein Cloud-Zwang**: Deine Daten verlassen niemals deinen PC. Alles, was du eingibst, bleibt privat.
2. **Modelle aus der Community**: Wir nutzen Modelle von der WebML-Community auf Hugging Face (https://huggingface.co/webml-community). Diese Modelle sind speziell dafür gemacht, direkt in Web-Umgebungen effizient zu laufen.
3. **Einfacher Vergleich**: Du stellst eine Frage, und zwei verschiedene lokale KI-Modelle geben dir eine Antwort. Du wählst aus, welche besser war.

## Warum das Ganze?
- **100% Privatsphäre**: Niemand liest mit.
- **Kostenlos** nutzbar, da keine teuren Server-Kosten anfallen.
- Fördert **Open Source** Entwicklungen und macht KI für alle zugänglich.

## Technische Basis (ganz einfach erklärt)
Wir nutzen moderne Web-Technologien, um die Modelle direkt über deinen Browser laufen zu lassen. Du musst keine komplizierte Software installieren oder einrichten. Die KI läuft über deinen Webbrowser, nutzt die Leistung deiner lokalen Hardware und alles bleibt sicher bei dir. **Wichtig:** Dafür nutzt dein Browser die Technologie **WebGPU**, welche es der Website erlaubt, auf die Rechenkraft deiner Grafikkarte zuzugreifen. Ohne diese Freigabe können die rechenintensiven KIs nicht gestartet werden.

**Zusätzliche smarte Funktionen:**
- **Kompakte und starke KIs**: Wir setzen auf Modelle bis zu einer Größe von **3 Milliarden Parametern** (z. B. Llama 3.2 3B oder Gemma 2 2B). Das ist der ideale Kompromiss aus Intelligenz und Geschwindigkeit im Browser.
- **Zentrale Modell-Auswahl**: Alle verfügbaren KIs werden in einer übersichtlichen Registry verwaltet. Die Auswahl erfolgt direkt in der Chat-Arena oder im Modell-Ordner, wo du siehst, welche Modelle lokal bereitstehen.
- **Lokal zwischengespeichert (Offline-Fähigkeit)**: Wenn du ein KI-Modell einmal geladen hast, wird es lokal **in der Datenbank deines Browsers (IndexedDB / Cache Storage) abgelegt**. Das spart Bandbreite bei späteren Aufrufen und ermöglicht eine Nutzung bereits gelieferter Modelle ohne aktive Internetverbindung.
- **Globales Community-Ranking (Optional & Anonym)**: Nutzer können freiwillig ihre Performance-Metriken (Geschwindigkeit in Tokens/Sekunde) in eine globale Bestenliste hochladen. Dies hilft der Community zu verstehen, welche Modelle auf welcher Hardware am besten performen. 
- **Sicherheits-Architektur (No-Key)**: Der Datenschutz steht an erster Stelle. Unsere Anwendung enthält keine geheimen API-Keys im Quellcode. Die Kommunikation mit der Datenbank erfolgt über gesicherte "Gatekeeper" (Supabase Edge Functions), die Daten anonymisieren und vor Missbrauch schützen. Es werden keine Chat-Inhalte übertragen.
- **Direkt als App installierbar**: Die OS-Arena funktioniert als "Progressive Web App" (PWA). Du kannst sie mit einem Klick auf deinem Startbildschirm speichern und wie eine echte App nutzen – ganz ohne App-Store-Zwang.
- **Transparentes System-Monitoring**: Über ein Technik-Panel in den Einstellungen hast du jederzeit volle Transparenz über deine Hardware. Du siehst den WebGPU-Status deiner Grafikkarte, die RAM-Auslastung deines Browsers und den Fortschritt laufender Modell-Downloads in Echtzeit.

---

## Qualitätssicherung & Testing (Automatisierte Validierung)

Um sicherzustellen, dass die OS-Arena stabil bleibt und mathematische Berechnungen (wie das ELO-Ranking) präzise sind, nutzen wir automatisierte Unit-Tests.

- **Framework**: Vitest (speziell für moderne Web-Projekte).
- **Abgedeckte Bereiche**:
  - **ELO-Ranking**: Korrekte Punktevergabe nach Siegen oder Remis.
  - **Daten-Persistenz**: Sicherer Umgang mit dem lokalen Benchmark-Speicher.
  - **Datenschutz (Consent)**: Überprüfung, dass Daten nur bei ausdrücklicher Zustimmung gesendet werden.

Diese Tests garantieren, dass die Kern-Logik der App auch bei Updates fehlerfrei bleibt.
