<template>
  <div class="view-container">
    <header class="view-header">
      <h2>Rangliste</h2>
      <p>Die besten KIs in der Arena</p>
    </header>

    <div class="leaderboard-list glass-panel">
      <div class="leaderboard-header">
        <span>#</span>
        <span class="flex-1">Modell</span>
        <span>Score</span>
      </div>
      
      <div v-for="(model, index) in sortedModels" :key="model.id" class="leaderboard-item">
        <div class="rank">
          <span v-if="index === 0">🥇</span>
          <span v-else-if="index === 1">🥈</span>
          <span v-else-if="index === 2">🥉</span>
          <span v-else>{{ index + 1 }}</span>
        </div>
        <div class="model-info flex-1">
          <div class="model-name">{{ model.name }}</div>
          <div class="model-size">{{ model.size }}</div>
        </div>
        <div class="score">
          {{ model.score }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { state } from '../../state.js';

const sortedModels = computed(() => {
  // Sort models descending by score
  return [...state.availableModels].sort((a, b) => b.score - a.score);
});
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

.leaderboard-list {
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.leaderboard-header {
  display: flex;
  font-weight: bold;
  color: var(--text-secondary);
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--glass-border);
  margin-bottom: 1rem;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.flex-1 {
  flex: 1;
  margin-left: 1rem;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.leaderboard-item:last-child {
  border-bottom: none;
}

.rank {
  width: 30px;
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: #fff;
}

.model-name {
  font-weight: 600;
  font-size: 1.1rem;
}

.model-size {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.score {
  font-weight: 800;
  color: #00f2fe;
  font-size: 1.2rem;
}
</style>
