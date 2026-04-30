<template>
  <div class="view-container">
    <header class="view-header">
      <h2>Einstellungen</h2>
      <p>System und WebGPU Konfiguration</p>
    </header>

    <div class="settings-content">
      <SystemInfoPanel />

      <div class="downloads-section glass-panel" v-if="state.availableModels.some(m => m.loading)">
        <h3 class="section-title">Aktive Downloads</h3>
        <LoadingStatusBar />
      </div>

      <div class="settings-list glass-panel">
        <div class="setting-item" v-if="state.gpuError">
          <div class="gpu-help">
            <strong>So löst du das Problem:</strong>
            <ul>
              <li>Nutze die neueste Version von Chrome oder Edge.</li>
              <li>Tippe <code>chrome://flags/#enable-unsafe-webgpu</code> in die Adresszeile und aktiviere es.</li>
              <li>Starte den Browser danach neu.</li>
            </ul>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h4>Speicherort der Modelle</h4>
            <p class="status-text">Browser Cache (IndexedDB)</p>
            <p class="description">Die KIs werden sicher im lokalen Cache des Browsers abgelegt.</p>
            <button class="btn btn-secondary mt-2" @click="openFolder">
              📁 Ordner öffnen
            </button>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h4>App Information</h4>
            <p class="description">OS-Arena Version: <span class="version-tag">v{{ appVersion }}</span></p>
            <p class="description">Entwickelt von @ogerly (DEVmatrose)</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { state } from '../../state.js';
import SystemInfoPanel from '../ui/SystemInfoPanel.vue';
import LoadingStatusBar from '../ui/LoadingStatusBar.vue';

const appVersion = __APP_VERSION__;

const openFolder = () => {
  alert("Da OS-Arena im Browser läuft, werden die Modelle in der IndexedDB deines Browsers gespeichert.\n\nDu findest sie in den Entwicklertools (F12) unter:\nApplication -> Storage -> IndexedDB -> webllm");
};
</script>

<style scoped>
.view-container {
  padding: 1.5rem;
  padding-bottom: 80px;
}

.view-header {
  margin-bottom: 2rem;
  text-align: center;
}

.view-header h2 {
  font-size: 2.5rem;
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.view-header p {
  color: var(--text-secondary);
}

.downloads-section {
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.7);
}

.settings-list {
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.setting-item {
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info h4 {
  font-size: 1.1rem;
  margin-bottom: 0.2rem;
}

.status-text {
  color: #00f2fe;
  font-weight: 600;
  font-size: 0.9rem;
}

.status-text.error {
  color: #ff4757;
}

.gpu-help {
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid rgba(255, 71, 87, 0.3);
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
}

.gpu-help ul {
  margin-top: 0.5rem;
  padding-left: 1.5rem;
}

.description {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 0.3rem;
  margin-bottom: 1rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

.version-tag {
  color: #00f2fe;
  font-weight: 700;
  font-family: monospace;
}
</style>
