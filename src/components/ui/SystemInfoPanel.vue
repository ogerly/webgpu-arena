<script setup>
import { state, checkCacheStatus } from '../../state';
import { onMounted } from 'vue';

onMounted(() => {
  checkCacheStatus();
});
</script>

<template>
  <div class="system-panel">
    <div class="panel-header">
      <h2 class="panel-title">System Status</h2>
      <button @click="checkCacheStatus" class="refresh-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 16h5v5"></path></svg>
      </button>
    </div>

    <div class="info-grid">
      <!-- GPU Info -->
      <div class="info-item" :class="{ 'error': !state.gpuInfo?.supported }">
        <div class="info-label">WebGPU Status</div>
        <div class="info-value">
          {{ state.gpuInfo?.supported ? 'Verfügbar' : 'Nicht unterstützt' }}
        </div>
        <div class="info-detail">{{ state.gpuInfo?.adapterInfo }}</div>
      </div>

      <!-- RAM Info -->
      <div v-if="state.ramInfo" class="info-item">
        <div class="info-label">Browser RAM</div>
        <div class="info-value">
          {{ state.ramInfo.usedMB }} / {{ state.ramInfo.totalMB }} MB
        </div>
        <div class="progress-mini">
          <div 
            class="progress-mini-fill" 
            :style="{ width: (state.ramInfo.usedMB / state.ramInfo.totalMB * 100) + '%' }"
          ></div>
        </div>
      </div>

      <!-- Model Cache -->
      <div class="info-item">
        <div class="info-label">Modell Cache</div>
        <div class="info-value">
          {{ state.availableModels.filter(m => m.cached).length }} Modelle
        </div>
        <div class="info-detail">lokal gespeichert</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.system-panel {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.panel-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.refresh-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.info-item {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 12px;
}

.info-item.error .info-value {
  color: #ff4e50;
}

.info-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 0.25rem;
}

.info-value {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
}

.info-detail {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.3);
  margin-top: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.progress-mini {
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1.5px;
  margin-top: 0.5rem;
  overflow: hidden;
}

.progress-mini-fill {
  height: 100%;
  background: #4facfe;
}
</style>
