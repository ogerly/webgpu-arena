# LTM: Secrets-Handling & Deployment-Zielpfade

**Datum:** 27. September 2026

## Kontext
Die WebGPU-Arena wird deployed (Hugging Face Space) und von KI-Agenten bearbeitet. Dabei wurden Tokens (HF, GitHub) über Befehle und Clone-URLs transportiert. Es gab zudem eine Fehlfunktion (unbeabsichtigtes Löschen von `.git`), bei der die saubere Trennung von Code, Konfiguration und Credentials die einzige sichere Wiederherstellung ermöglicht hat (alles war auf dem Remote).

## Regeln (verbindlich)
1. **Keine sicherheitsrelevanten Dinge im Code.** Kein Token, Key, Passwort oder Secret — weder in `src/`, noch in Config-Dateien, noch in Commits, noch im Space-Repository.
2. **Tokens leben ausschließlich in:**
   - `.env` im Projekt (ist in `.gitignore` — wird nie committet)
   - Betriebssystem-Credential-Store (`~/.git-credentials`) bzw. `~/.huggingface/token`
3. **Frontend bleibt key-frei** (siehe LTM-001): Alle sensiblen Zugriffe laufen über Supabase Edge Functions als Gatekeeper.
4. **Deploy-Credentials werden nie hartkodiert** — nur via Umgebungsvariable/`.env`/Credential-Helper, in Befehlen maskiert ausgeben.

## Deployment-Zielpfade (aktuelle Entscheidung)
- **Live-Deployment (einziges):** Hugging Face Space `https://huggingface.co/spaces/ogerl/webgpu-arena` (Docker/nginx, Build mit `VITE_BASE_URL=./`).
- **GitHub:** Source of Truth (Code, AAMS-Workspace, Tags/Releases). **GitHub Pages wird NICHT betrieben** (Entscheidung 2026-09-27, Details in WH-006-Addendum).
- **AAMS-Quellverweis:** `https://github.com/ogerly/AAMS` / Doku `https://ogerly.github.io/AAMS/` (devmatrose existiert nicht mehr).

## Fazit für zukünftige Sprints
Vor jedem Commit: `git status` + Secret-Scan. Vor jedem Space-Deploy: prüfen, dass keine Binärdateien/Secrets im dist-Ordner landen. Bei Wiederherstellungsszenarien gilt: Remote (GitHub) ist Source of Truth, nie der lokale `.git`.
