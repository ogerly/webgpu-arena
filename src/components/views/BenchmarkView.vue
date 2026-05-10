<template>
  <div class="benchmark-view page-container">
    <header class="page-header">
      <h1>⚡ Hardware Benchmark</h1>
      <p class="subtitle">Messe die rohe WebGPU-Leistung deines Geräts</p>
    </header>

    <div v-if="warningAccepted" class="benchmark-content">
      <div class="control-panel glass-panel">
        <h3>Matrix Multiplikation (MatMul)</h3>
        <p class="description">Testet die reine Rechenleistung (TFLOPS) der Grafikkarte im Vergleich zum Prozessor.</p>
        
        <div class="input-group">
          <label>Matrix Größe (NxN):</label>
          <select v-model.number="matrixSize" :disabled="isRunning">
            <option value="256">256 (Sehr schnell)</option>
            <option value="512">512 (Standard)</option>
            <option value="1024">1024 (Intensiv)</option>
            <option value="2048">2048 (Extrem - VRAM Warnung!)</option>
          </select>
        </div>

        <button class="primary-btn run-btn" @click="startBenchmark" :disabled="isRunning">
          {{ isRunning ? 'Test läuft...' : 'Benchmark Starten' }}
        </button>

        <div v-if="status" class="status-indicator">
          <div class="spinner" v-if="isRunning"></div>
          <span>{{ status }}</span>
        </div>
      </div>

      <div v-if="results" class="results-panel glass-panel">
        <h3>Ergebnisse</h3>
        <div class="result-cards">
          <div class="result-card cpu">
            <span class="label">CPU Zeit (Web Worker)</span>
            <span class="value">{{ results.cpuMs.toFixed(2) }} ms</span>
          </div>
          <div class="result-card gpu">
            <span class="label">GPU Zeit (WebGPU)</span>
            <span class="value">{{ results.gpuMs.toFixed(2) }} ms</span>
          </div>
        </div>
        <div class="speedup" v-if="results.cpuMs > 0">
          <span class="highlight">{{ (results.cpuMs / results.gpuMs).toFixed(1) }}x</span> schneller auf der GPU
        </div>
      </div>
    </div>

    <!-- OOM Warning Modal -->
    <div v-else class="warning-panel glass-panel">
      <div class="warning-icon">⚠️</div>
      <h3>Wichtiger Sicherheitshinweis</h3>
      <p>Dieser Benchmark testet die Grenzen deiner Hardware. Wenn du im Arena-Tab oder im Chat-Tab bereits ein KI-Modell geladen hast, ist dein <strong>Grafikspeicher (VRAM)</strong> möglicherweise bereits voll.</p>
      <p>Das Starten des Benchmarks bei geladenen Modellen führt oft zu einem <strong>Absturz des Browsers (Out of Memory)</strong>.</p>
      
      <div class="actions">
        <button class="secondary-btn" @click="reloadPage">Seite sicher neu laden</button>
        <button class="primary-btn warning-btn" @click="warningAccepted = true">Ich habe verstanden, weiter</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { runMatMulBenchmark } from '../../compute/benchmarkRunner.js';

const warningAccepted = ref(false);
const isRunning = ref(false);
const status = ref('');
const matrixSize = ref(512);
const results = ref(null);

const reloadPage = () => {
  window.location.reload();
};

const startBenchmark = async () => {
  if (isRunning.value) return;
  
  isRunning.value = true;
  results.value = null;
  status.value = "Initialisiere...";

  try {
    const res = await runMatMulBenchmark(matrixSize.value, (msg) => {
      status.value = msg;
    });
    results.value = res;
  } catch (err) {
    status.value = "Fehler: " + err.message;
  } finally {
    isRunning.value = false;
  }
};
</script>

<style scoped>
.benchmark-view {
  padding: max(env(safe-area-inset-top), 2rem) 1rem 6rem;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  color: var(--text-secondary);
}

.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.description {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.input-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group select {
  padding: 0.75rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  color: white;
  font-size: 1rem;
}

.run-btn {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.status-indicator {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--accent-color);
  font-weight: 500;
  justify-content: center;
}

.spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(0, 242, 254, 0.2);
  border-top-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.result-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.result-card {
  background: rgba(255, 255, 255, 0.03);
  padding: 1.5rem;
  border-radius: 16px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.result-card .label {
  display: block;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.result-card .value {
  display: block;
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
}

.result-card.gpu .value {
  color: #00f2fe;
}

.speedup {
  text-align: center;
  font-size: 1.1rem;
  padding: 1rem;
  background: rgba(0, 242, 254, 0.1);
  border-radius: 12px;
  color: var(--text-primary);
}

.highlight {
  font-weight: 800;
  color: var(--accent-color);
  font-size: 1.5rem;
}

.warning-panel {
  text-align: center;
  border: 1px solid rgba(255, 68, 68, 0.3);
  background: rgba(255, 68, 68, 0.05);
}

.warning-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.warning-panel h3 {
  color: #ff4444;
  margin-bottom: 1rem;
}

.warning-panel p {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.6;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.warning-btn {
  background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
  border: none;
}

.warning-btn:hover {
  background: linear-gradient(135deg, #ff6666 0%, #ee0000 100%);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 600px) {
  .result-cards {
    grid-template-columns: 1fr;
  }
}
</style>
