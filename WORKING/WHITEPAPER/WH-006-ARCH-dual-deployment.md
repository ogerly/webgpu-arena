# Whitepaper WH-006: Dual-Deployment (GitHub & Hugging Face)

**Projekt:** WebGPU-Arena  
**Stand:** 2026-05-10  
**Status:** Implementiert & Aktiv  

---

## 1. Architektur des Dual-Deployments

Die WebGPU-Arena wird parallel auf zwei Plattformen gehostet, um maximale Verfügbarkeit zu gewährleisten und die Sichtbarkeit in der KI-Community (Hugging Face) zu erhöhen. 
Da beide Plattformen statische Dateien unterschiedlich ausliefern, erfordert dies eine getrennte Build-Strategie für das Frontend.

### 1.1 GitHub (Source of Truth & Pages)
- **Repo:** `https://github.com/ogerly/webgpu-arena`
- **Hosting:** GitHub Pages
- **URL-Struktur:** `https://ogerly.github.io/webgpu-arena/`
- **Vite Base-Path:** `/webgpu-arena/`
- **Zweck:** Dient als primäres Repository für den Quellcode, die AAMS-Dokumentation und als Haupt-Anlaufstelle für die PWA.

### 1.2 Hugging Face Spaces (Docker SDK)
- **Space:** `https://huggingface.co/spaces/ogerl/webgpu-arena`
- **Hosting:** Hugging Face Spaces (als Docker-Container)
- **URL-Struktur:** Wird nativ auf einer Root-Domain via Iframe gehostet (z.B. `ogerl-webgpu-arena.hf.space/`).
- **Vite Base-Path:** `./` (Relativer Pfad)
- **Zweck:** Community-Sichtbarkeit und direkter Einstieg aus dem Hugging Face Ökosystem.

---

## 2. Das Base-Path Problem (404 White Screen)

Ein zentrales Problem beim Dual-Deployment ist der **Vite Base-Path**. 

Wenn die Anwendung für GitHub Pages kompiliert wird, steht in der `vite.config.js`:
```js
base: mode === 'production' ? '/webgpu-arena/' : '/'
```
Dies führt dazu, dass die `index.html` Assets wie folgt anfragt:
`<script src="/webgpu-arena/assets/index.js"></script>`

**Das Problem auf Hugging Face:**
Hugging Face Spaces haben kein Unterverzeichnis `/webgpu-arena/`. Wenn der Hugging Face Container gestartet wird, sucht der Browser die Dateien im falschen Ordner, was zu einem **Weißen Bildschirm (White Screen of Death)** und diversen **404 Not Found** Fehlern in der Konsole führt.

**Die Lösung:**
Für Hugging Face muss die Anwendung zwingend mit **relativen Pfaden** (`./`) gebaut werden. Dies wurde in der `vite.config.js` über eine Umgebungsvariable gelöst:
```js
base: process.env.VITE_BASE_URL || (mode === 'production' ? '/webgpu-arena/' : '/')
```

---

## 3. Deployment-Prozesse

### 3.1 Deployment zu GitHub (Standard)
Das Deployment zu GitHub ist simpel. Änderungen werden im Hauptverzeichnis (Root) committet und gepusht:
```bash
git add .
git commit -m "feat: Neue Funktion"
git push origin main
```

### 3.2 Deployment zu Hugging Face (Spezial-Build)
Hugging Face lädt nicht den Quellcode, sondern den **fertig kompilierten Build** aus dem Ordner `dist/`. Um Build-Minuten auf Hugging Face zu sparen (die kostenpflichtig sein können), pushen wir direkt in einen schlanken Nginx-Docker-Container.

**Schritt-für-Schritt:**
1. **Speziellen Build erstellen:**  
   In der Konsole (PowerShell) den Build mit relativen Pfaden erzwingen:
   ```powershell
   $env:VITE_BASE_URL="./"; npm run build; Remove-Item Env:\VITE_BASE_URL
   ```

2. **Hugging Face Infrastruktur-Dateien erzeugen:**  
   Im neu generierten `dist/` Ordner müssen zwei Dateien liegen (diese gehen beim Build oft verloren und müssen aus einem Backup oder manuell neu erstellt werden):
   
   **`dist/Dockerfile`:**
   ```dockerfile
   FROM nginx:alpine
   COPY . /usr/share/nginx/html
   RUN sed -i 's/listen  *80;/listen 7860;/g' /etc/nginx/conf.d/default.conf
   EXPOSE 7860
   CMD ["nginx", "-g", "daemon off;"]
   ```
   *Wichtig: HF Spaces laufen immer auf Port 7860!*

   **`dist/README.md` (Metadaten für HF):**
   ```yaml
   ---
   title: WebGPU-Arena
   emoji: 🏟️
   colorFrom: gray
   colorTo: blue
   sdk: docker
   pinned: false
   ---
   ```

3. **Push zu Hugging Face (aus dem `dist`-Ordner!):**
   Wechsle in den `dist/` Ordner und pushe von dort. Hugging Face limitiert große Binärdateien (z.B. Bilder, Fonts), weshalb **Git LFS** installiert sein muss.
   ```bash
   cd dist
   git init
   git lfs install
   git lfs track "*.png" "*.jpg" "*.jpeg" "*.gif" "*.svg" "*.ico"
   git add .
   git commit -m "Deploy WebGPU-Arena Build"
   git push -f https://USERNAME:HF_TOKEN@huggingface.co/spaces/USERNAME/webgpu-arena main
   ```

---

## 4. Bekannte Warnungen & Fehler (FAQ)

- **`ERR_BLOCKED_BY_CLIENT` bei `challenge.js`:**
  Tritt nur auf Hugging Face auf. Dies ist die AWS WAF (Web Application Firewall) von Hugging Face, die Bot-Schutz und Telemetrie lädt. Adblocker (uBlock Origin etc.) blockieren dies. **Kann komplett ignoriert werden.**
  
- **`Unrecognized feature: 'ambient-light-sensor', 'battery'` etc.:**
  Stammt oft von Iframe-Restriktionen oder Berechtigungs-Richtlinien des Browsers. Hat keinen Einfluss auf die Funktionalität der LLMs.
  
- **Push zu HF schlägt fehl (LFS Error):**
  Wenn Hugging Face den Push ablehnt ("pre-receive hook declined"), liegt das meistens an Binärdateien im Ordner. Die Lösung ist, `git lfs track "*.xyz"` für den betroffenen Dateityp auszuführen.
