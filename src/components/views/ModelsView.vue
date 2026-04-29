<template>
  <div class="view-container">
    <header class="view-header">
      <h2>Modell-Ordner</h2>
      <p>KIs für die Offline-Nutzung verwalten</p>
    </header>

    <div class="model-list">
      <div v-for="model in state.availableModels" :key="model.id" class="model-item glass-panel" :class="{'is-cached': model.cached}">
        <div class="model-info">
          <span class="model-name">{{ model.name }}</span>
          <span class="model-size">{{ model.size }}</span>
        </div>
        
        <div class="model-status">
          <span v-if="model.cached" class="status-badge cached">💾 Lokal bereit</span>
          <span v-else class="status-badge cloud">☁️ Cloud</span>
        </div>
        
        <div class="model-actions">
          <template v-if="!model.cached">
            <button v-if="!model.loading" @click="downloadModel(model)" class="btn btn-download">
              ⬇️ Herunterladen
            </button>
            <div v-else class="download-progress">
              <div class="progress-track">
                <div class="progress-fill" :style="{width: model.progress + '%'}"></div>
              </div>
              <span class="progress-text">{{ model.progress }}%</span>
            </div>
          </template>
          <template v-else>
            <span class="ready-text">✓ Für immer verfügbar</span>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { state, downloadModel } from '../../state.js';
</script>

<style scoped>
.view-container {
  padding: 1.5rem;
  padding-bottom: 80px; /* Space for nav */
}

.view-header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.view-header h2 {
  font-size: 2rem;
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.view-header p {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.model-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.model-item {
  padding: 1rem;
  transition: all 0.3s ease;
}

.model-item.is-cached {
  border-color: rgba(0, 242, 254, 0.3);
  background: rgba(0, 242, 254, 0.05);
}

.model-info {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.5rem;
}

.model-name {
  font-weight: 600;
  font-size: 1.2rem;
}

.model-size {
  font-size: 0.8rem;
  color: var(--text-secondary);
  background: rgba(0,0,0,0.3);
  padding: 2px 6px;
  border-radius: 4px;
}

.model-status {
  margin-bottom: 1rem;
}

.status-badge {
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 20px;
  font-weight: bold;
}

.status-badge.cached {
  background: rgba(0, 242, 254, 0.2);
  color: #00f2fe;
}

.status-badge.cloud {
  background: rgba(148, 163, 184, 0.2);
  color: #94a3b8;
}

.btn-download {
  width: 100%;
  padding: 0.8rem;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.ready-text {
  display: block;
  text-align: center;
  font-size: 0.9rem;
  color: #00f2fe;
  font-weight: 600;
  padding: 0.6rem 0;
}

.download-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-track {
  flex: 1;
  height: 8px;
  background: rgba(0,0,0,0.3);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #00f2fe;
  transition: width 0.2s ease;
}

.progress-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  width: 45px;
  text-align: right;
}
</style>
