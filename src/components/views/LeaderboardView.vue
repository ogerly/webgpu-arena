<template>
  <div class="view-container">
    <header class="view-header">
      <h2>Rangliste</h2>
      <p>Wer ist der König der lokalen KIs?</p>
    </header>

    <!-- Tab Navigation -->
    <div class="tab-nav">
      <button 
        :class="['tab-btn', { active: activeTab === 'local' }]" 
        @click="activeTab = 'local'"
      >
        🏆 Lokal (ELO)
      </button>
      <button 
        :class="['tab-btn', { active: activeTab === 'global' }]" 
        @click="activeTab = 'global'"
      >
        🌍 Global (Speed)
      </button>
    </div>

    <!-- Lokal Leaderboard -->
    <div v-if="activeTab === 'local'" class="leaderboard-list glass-panel animate-in">
      <div class="leaderboard-header">
        <span>#</span>
        <span class="flex-1">Modell</span>
        <span>ELO Score</span>
      </div>
      
      <div v-for="(model, index) in sortedLocalModels" :key="model.id" class="leaderboard-item">
        <div class="rank">
          <span v-if="index === 0">🥇</span>
          <span v-else-if="index === 1">🥈</span>
          <span v-else-if="index === 2">🥉</span>
          <span v-else>{{ index + 1 }}</span>
        </div>
        <div class="model-info flex-1">
          <div class="model-name">{{ model.name }}</div>
          <div class="model-size">{{ model.size }} Parameter</div>
        </div>
        <div class="score">
          {{ model.score }}
        </div>
      </div>
    </div>

    <!-- Global Leaderboard -->
    <div v-else class="leaderboard-list glass-panel animate-in">
      <div v-if="loadingGlobal" class="loading-state">
        <div class="spinner"></div>
        <p>Lade globale Daten...</p>
      </div>

      <template v-else-if="globalData.length > 0">
        <div class="leaderboard-header">
          <span>#</span>
          <span class="flex-1">Modell</span>
          <span class="text-right">Avg. TPS</span>
          <span class="text-right d-none-mobile">Tests</span>
        </div>
        
        <div v-for="(item, index) in globalData" :key="item.model_id" class="leaderboard-item">
          <div class="rank">
            <span v-if="index === 0">🏆</span>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <div class="model-info flex-1">
            <div class="model-name">{{ item.model_name }}</div>
            <div class="model-meta">ID: {{ item.model_id }}</div>
          </div>
          <div class="score text-right">
            {{ item.avg_tps }} <small>tok/s</small>
          </div>
          <div class="sample-size text-right d-none-mobile">
            {{ item.sample_size }}
          </div>
        </div>
      </template>

      <div v-else class="empty-state">
        <p>Noch keine globalen Daten verfügbar oder API nicht erreichbar.</p>
        <button class="btn-retry" @click="loadGlobal">Erneut versuchen</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { state } from '../../state.js';
import { fetchGlobalLeaderboard } from '../../services/ranking/globalRanking.js';

const activeTab = ref('local');
const globalData = ref([]);
const loadingGlobal = ref(false);

const sortedLocalModels = computed(() => {
  return [...state.availableModels].sort((a, b) => b.score - a.score);
});

const loadGlobal = async () => {
  loadingGlobal.value = true;
  try {
    globalData.value = await fetchGlobalLeaderboard();
  } catch (e) {
    console.error(e);
  } finally {
    loadingGlobal.value = false;
  }
};

onMounted(() => {
  if (activeTab.value === 'global') loadGlobal();
});

watch(activeTab, (newTab) => {
  if (newTab === 'global' && globalData.value.length === 0) {
    loadGlobal();
  }
});
</script>

<style scoped>
.view-container {
  padding: 1.5rem;
  padding-bottom: 80px;
  max-width: 900px;
  margin: 0 auto;
}

.view-header {
  margin-bottom: 2rem;
  text-align: center;
}

.view-header h2 {
  font-size: 2.5rem;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.view-header p {
  color: var(--text-secondary);
}

.tab-nav {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.3rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  gap: 0.3rem;
}

.tab-btn {
  flex: 1;
  padding: 0.8rem;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
}

.leaderboard-header {
  display: flex;
  font-weight: bold;
  color: var(--text-secondary);
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--glass-border);
  margin-bottom: 1rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.flex-1 { flex: 1; margin-left: 1rem; }
.text-right { text-align: right; min-width: 80px; }

.leaderboard-item {
  display: flex;
  align-items: center;
  padding: 1.2rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.03);
}

.rank {
  width: 40px;
  text-align: center;
  font-size: 1.1rem;
  font-weight: bold;
}

.model-name {
  font-weight: 600;
  font-size: 1rem;
  color: #fff;
}

.model-size, .model-meta {
  font-size: 0.7rem;
  color: var(--text-secondary);
  margin-top: 0.2rem;
}

.score {
  font-weight: 800;
  color: #00f2fe;
  font-size: 1.2rem;
}

.score small {
  font-size: 0.7rem;
  opacity: 0.7;
  font-weight: normal;
}

.sample-size {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.loading-state, .empty-state {
  padding: 4rem 1rem;
  text-align: center;
  color: var(--text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 242, 254, 0.1);
  border-top-color: #00f2fe;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

.animate-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 600px) {
  .d-none-mobile { display: none; }
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  border-radius: 8px;
  cursor: pointer;
}
</style>
