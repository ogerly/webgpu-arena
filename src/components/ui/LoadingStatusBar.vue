<script setup>
import { state } from '../../state';
import { computed } from 'vue';

const loadingModels = computed(() => {
  return state.availableModels.filter(m => m.loading);
});
</script>

<template>
  <div v-if="loadingModels.length > 0" class="status-bar-container">
    <div v-for="model in loadingModels" :key="model.id" class="model-status-card">
      <div class="model-info">
        <span class="model-name">{{ model.name }}</span>
        <span class="model-progress">{{ model.progress }}%</span>
      </div>
      <div class="progress-track">
        <div 
          class="progress-fill" 
          :style="{ width: model.progress + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.status-bar-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.model-status-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.75rem 1rem;
  border-radius: 12px;
}

.model-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
}

.model-name {
  color: #fff;
  font-weight: 500;
}

.model-progress {
  color: #4facfe;
  font-weight: 700;
}

.progress-track {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff9f1c, #ff4e50);
  transition: width 0.3s ease;
}
</style>
