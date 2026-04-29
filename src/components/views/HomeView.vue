<template>
  <div class="view-container home-view">
    <!-- Hero Section -->
    <header class="hero-section">
      <h1 class="gradient-text">OS-Arena</h1>
      <h2>Dein lokales KI-Testlabor</h2>
      <p class="hero-subtext">
        Erlebe Open-Source-Modelle direkt in deinem Browser. 100% lokal, absolut privat und offline-fähig.
      </p>
      <div class="hero-actions">
        <button class="btn btn-primary" @click="$emit('navigate', 'arena')">⚔️ Zur Arena</button>
        <button class="btn btn-secondary" @click="$emit('navigate', 'models')">💾 Modelle laden</button>
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

    <!-- Developer & Support Section -->
    <section class="support-section glass-panel">
      <h3>Über das Projekt</h3>
      <div class="dev-info">
        <p><strong>Entwickler:</strong> @ogerly (Firma: DEVmatrose)</p>
        <p><strong>GitHub:</strong> <a href="https://github.com/DEVmatrose" target="_blank">DEVmatrose</a></p>
        <p><strong>Quellcode:</strong> <a href="https://github.com/DEVmatrose/os-arena" target="_blank">OS-Arena Repository</a></p>
      </div>
      
      <div class="donation-box">
        <h4>Support & Spenden ☕</h4>
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
    </section>
  </div>
</template>

<script setup>
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
  padding: 1.5rem;
  border: 1px solid rgba(255,255,255,0.05);
}

.donation-box h4 {
  font-size: 1.2rem;
  color: #00f2fe;
  margin-bottom: 0.5rem;
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
  background: rgba(255,255,255,0.2);
}
</style>
