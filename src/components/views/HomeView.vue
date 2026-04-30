<template>
  <div class="view-container home-view">
    <!-- Hero Section -->
    <header class="hero-section">
      <div v-if="state.gpuInfo" class="status-indicator" :class="{ 'is-ready': state.gpuInfo.supported }">
        <span class="dot"></span>
        {{ state.gpuInfo.supported ? 'WebGPU bereit' : 'WebGPU nicht unterstützt' }}
      </div>
      <h1 class="gradient-text">OS-Arena</h1>
      <h2>Dein lokales KI-Testlabor</h2>
      <p class="hero-subtext">
        Erlebe WebGPU-beschleunigte Open-Source-Modelle direkt in deinem Browser. 100% lokal, absolut privat und offline-fähig.
      </p>
      <div class="hero-actions">
        <button class="btn btn-primary" @click="$router.push('/arena')">⚔️ Zur Arena</button>
        <button class="btn btn-secondary" @click="$router.push('/models')">💾 Modelle laden</button>
      </div>
    </header>

    <!-- Features Grid -->
    <section class="features-grid">
      <div class="feature-card glass-panel">
        <div class="feature-icon">🛡️</div>
        <h3>Absolute Privatsphäre</h3>
        <p>Deine Daten und Prompts verlassen niemals dein Gerät. Alles rechnet lokal.</p>
      </div>
      <div class="feature-card glass-panel">
        <div class="feature-icon">🔌</div>
        <h3>Offline & Autark</h3>
        <p>Geladene Modelle werden in der Datenbank deines Browsers gespeichert und funktionieren ohne Internet.</p>
      </div>
      <div class="feature-card glass-panel">
        <div class="feature-icon">💸</div>
        <h3>100% Kostenlos</h3>
        <p>Keine Anmeldung, keine monatlichen Abos, keine versteckten API-Keys erforderlich.</p>
      </div>
      <div class="feature-card glass-panel">
        <div class="feature-icon">🧪</div>
        <h3>Offener Prototyp</h3>
        <p>Ein Community-Testlabor, das Transparenz schafft und dir die Kontrolle zurückgibt.</p>
      </div>
    </section>

    <!-- Model Showcase -->
    <section class="models-showcase">
      <h3>Unterstützte Modelle</h3>
      <div class="models-mini-grid">
        <div class="model-mini-card">
          <span class="m-icon">🦙</span>
          <h4>Llama 3.2</h4>
          <p>Der Allrounder</p>
        </div>
        <div class="model-mini-card">
          <span class="m-icon">💎</span>
          <h4>Gemma</h4>
          <p>Logik-Profi</p>
        </div>
        <div class="model-mini-card">
          <span class="m-icon">🐉</span>
          <h4>Qwen 2.5</h4>
          <p>Effizienz-Wunder</p>
        </div>
        <div class="model-mini-card">
          <span class="m-icon">🔬</span>
          <h4>SmolLM2</h4>
          <p>STEM-Experte</p>
        </div>
      </div>
    </section>
    <section class="manifest-section glass-panel">
      <h3>Das Manifest</h3>
      <div class="manifest-content">
        <p class="highlight-text">
          Ich bin seit über 20 Jahren Entwickler und habe die Entwicklung von KI intensiv mitverfolgt. 
          Code ist für mich nicht nur Arbeit, sondern ein Werkzeug zur Selbstermächtigung.
        </p>
        <p>
          Mit der OS Arena möchte ich freie und lokale KI-Modelle einfacher zugänglich machen. 
          Nicht über zentrale Plattformen, nicht hinter Accounts, Abos oder Limits, sondern direkt im Browser, lokal auf deinem eigenen Gerät.
        </p>
        <p>
          Die Modelle sollen auf möglichst normaler Hardware laufen: Laptop, Desktop, teilweise auch Handy. 
          Genau darum geht es hier: herausfinden, welche kleinen Open-Source-Modelle im Alltag wirklich brauchbar sind und welche nicht.
        </p>
        <p>
          Du kannst die OS Arena als PWA installieren, Modelle herunterladen und lokal benutzen. 
          Wenn ein Modell geladen ist, kannst du das Internet trennen. Deine Eingaben bleiben auf deinem Gerät. 
          Nichts wird an einen Server geschickt.
        </p>
        <p>
          Optional kannst du Feedback für die Rangliste geben. Nur dafür wird Internet benötigt. 
          Dieses Feedback hilft, gemeinsam sichtbar zu machen, welche Modelle wirklich funktionieren.
        </p>
        <div class="manifest-footer">
          <p>OS Arena ist ein Experiment, ein Werkzeug und ein Spielplatz für freie KI.</p>
          <p class="slogan">Freie Modelle gehören auf freie Geräte.</p>
          <p class="slogan">KI muss nicht immer in der Cloud stattfinden.</p>
          <p class="slogan">Gute Werkzeuge sollten Menschen unabhängiger machen.</p>
        </div>
      </div>
    </section>
    <section class="support-section glass-panel">
      <h3>Über das Projekt</h3>
      <div class="dev-info">
        <p><strong>Entwickler:</strong> <a href="https://github.com/ogerly" target="_blank">ogerly</a></p>
        <p><strong>Quellcode:</strong> <a href="https://github.com/ogerly/os-arena" target="_blank">OS-Arena Repository</a></p>
      </div>

      <div class="project-disclaimer">
        <p>
          <strong>Wichtiger Hinweis:</strong> Dies ist ein privates Projekt. Es besteht kein Anspruch auf Funktionalität oder Support. 
          Die Nutzung erfolgt auf eigene Gefahr. Ich garantiere jedoch, dass bei Standardnutzung keine Daten dein Gerät verlassen – 
          die OS-Arena ist konsequent auf Autonomie und Datenschutz ausgelegt.
        </p>
        <p>
          Ich freue mich über Austausch, Bug-Reports, Feature-Ideen und inspirierende Gespräche! 💬
        </p>
      </div>
      
      <details class="donation-box">
        <summary class="donation-summary">
          <h4>Support & Spenden ☕</h4>
          <span class="chevron">▼</span>
        </summary>
        <div class="donation-content">
          <p class="donation-text">
            Damit die Entwicklung werbe- und kostenfrei bleibt, freue ich mich über Krypto-Spenden.
          </p>
          
          <div class="crypto-list">
            <div class="crypto-item" v-for="(address, name) in cryptoAddresses" :key="name">
              <span class="crypto-name">{{ name }}:</span>
              <div class="crypto-address-wrapper">
                <input type="text" readonly :value="address" class="crypto-input" />
                <button class="btn-copy" @click="copyToClipboard(address)" title="Kopieren">📋</button>
              </div>
            </div>
          </div>
        </div>
      </details>
    </section>
  </div>
</template>

<script setup>
import { state } from '../../state.js';
const cryptoAddresses = {
  'BTC': 'bc1q7m8l4zvx0htxx35cq3ur5pr2khlx9j5srw8flu',
  'ETH': '0x457A7CEbf4021f9D21a70d5Af6AcF2eA842f141F',
  'Cardano (ADA)': 'addr1q9eqsudv2scgggrarvzfufjqdz60mdu3ganjz3qazzzmd3gg8yj6n07p3c267hk0rgnpzklu52jh75w5j6ma30y53h2s74lskm',
  'Solana (SOL)': 'B2gdhFHrZNJUS6dzqL8pcAJZsRp6DiquHY7ADhEBaUy9'
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    alert('Adresse kopiert!');
  } catch (err) {
    console.error('Kopieren fehlgeschlagen', err);
  }
};
</script>

<style scoped>
.home-view {
  padding: 1.5rem;
  padding-bottom: 90px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
}

.hero-section {
  text-align: center;
  margin-top: 1rem;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid rgba(255, 71, 87, 0.2);
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #ff4757;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
}

.status-indicator.is-ready {
  background: rgba(0, 242, 254, 0.1);
  border-color: rgba(0, 242, 254, 0.2);
  color: #00f2fe;
}

.dot {
  width: 8px;
  height: 8px;
  background: #ff4757;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 8px #ff4757;
}

.is-ready .dot {
  background: #00f2fe;
  box-shadow: 0 0 8px #00f2fe;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}

.gradient-text {
  font-size: 3.5rem;
  font-weight: 900;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-section h2 {
  font-size: 1.5rem;
  color: #fff;
  margin-bottom: 1rem;
}

.hero-subtext {
  color: var(--text-secondary);
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary {
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
  color: #000;
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  font-weight: bold;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-primary:hover {
  transform: scale(1.05);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  width: 100%;
  max-width: 800px;
}

.feature-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  border-color: rgba(0, 242, 254, 0.4);
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.feature-card h3 {
  font-size: 1.1rem;
  color: #00f2fe;
}

.feature-card p {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.models-showcase {
  text-align: center;
  width: 100%;
  max-width: 800px;
}

.models-showcase h3 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.models-mini-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.model-mini-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1.5rem 1rem;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.model-mini-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-5px);
  border-color: rgba(79, 172, 254, 0.3);
}

.m-icon {
  font-size: 2rem;
  margin-bottom: 0.2rem;
}

.model-mini-card h4 {
  font-size: 0.9rem;
  margin: 0;
  color: #fff;
}

.model-mini-card p {
  font-size: 0.7rem;
  color: var(--text-secondary);
  margin: 0;
}

@media (max-width: 600px) {
  .models-mini-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.manifest-section {
  width: 100%;
  max-width: 800px;
  padding: 2.5rem;
}

.manifest-section h3 {
  font-size: 1.8rem;
  color: #fff;
  margin-bottom: 1.5rem;
  background: linear-gradient(to right, #4facfe, #00f2fe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

.manifest-content {
  color: var(--text-primary);
  line-height: 1.8;
  font-size: 1.05rem;
}

.manifest-content p {
  margin-bottom: 1.5rem;
}

.highlight-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
  border-left: 3px solid #00f2fe;
  padding-left: 1rem;
}

.manifest-footer {
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
}

.manifest-footer .slogan {
  font-weight: 800;
  color: #00f2fe;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.9rem;
}

.support-section {
  width: 100%;
  max-width: 800px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.support-section h3 {
  font-size: 1.5rem;
  color: #fff;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 0.5rem;
}

.dev-info p {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.dev-info a {
  color: #4facfe;
  text-decoration: none;
}

.dev-info a:hover {
  text-decoration: underline;
}

.donation-box {
  background: rgba(0,0,0,0.3);
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.05);
}

.donation-summary {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  list-style: none;
}

.donation-summary::-webkit-details-marker {
  display: none;
}

.donation-summary h4 {
  font-size: 1.2rem;
  color: #00f2fe;
  margin: 0;
}

.chevron {
  font-size: 1rem;
  color: #00f2fe;
  transition: transform 0.3s ease;
}

details[open] .chevron {
  transform: rotate(180deg);
}

.donation-content {
  padding: 0 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid rgba(255,255,255,0.05);
  margin-top: 0.5rem;
  padding-top: 1rem;
}

.donation-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.crypto-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.crypto-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.crypto-name {
  font-weight: 600;
  font-size: 0.85rem;
  color: #a18cd1;
}

.crypto-address-wrapper {
  display: flex;
  gap: 0.5rem;
}

.crypto-input {
  flex: 1;
  background: rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  padding: 0.5rem;
  color: var(--text-primary);
  font-family: monospace;
  font-size: 0.8rem;
}

.btn-copy {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 6px;
  padding: 0.5rem;
  cursor: pointer;
  color: #fff;
  transition: background 0.2s;
}

.btn-copy:hover {
  background: rgba(255, 255, 255, 0.2);
}

.project-disclaimer {
  background: rgba(255, 255, 255, 0.03);
  border-left: 3px solid rgba(79, 172, 254, 0.3);
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.project-disclaimer strong {
  color: #fff;
}
</style>
