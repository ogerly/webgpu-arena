<template>
  <div class="view-container">
    <header class="view-header">
      <h2>Arena Setup</h2>
      <p>Wähle zwei KIs für den Zweikampf</p>
    </header>

    <div class="arena-config glass-panel">
      <!-- Model A Selection -->
      <div class="selection-box">
        <div class="select-wrapper model-a-select">
          <label>Modell A (Blau)</label>
          <select v-model="state.selectedModelA">
            <option v-for="m in state.availableModels" :key="'a-'+m.id" :value="m.id">
              {{ m.cached ? '💾' : '☁️' }} {{ m.name }}
            </option>
          </select>
        </div>
        <div v-if="modelA" class="status-row">
          <span :class="['status-badge', modelA.cached ? 'local' : 'cloud']">
            {{ modelA.cached ? 'Lokal' : 'Cloud' }}
          </span>
          <button v-if="!modelA.cached" class="mini-dl" @click="downloadModel(modelA)" :disabled="modelA.loading">
            {{ modelA.loading ? '...' : 'Laden' }}
          </button>
        </div>
      </div>
      
      <div class="vs-badge">VS</div>
      
      <!-- Model B Selection -->
      <div class="selection-box">
        <div class="select-wrapper model-b-select">
          <label>Modell B (Lila)</label>
          <select v-model="state.selectedModelB">
            <option v-for="m in state.availableModels" :key="'b-'+m.id" :value="m.id">
              {{ m.cached ? '💾' : '☁️' }} {{ m.name }}
            </option>
          </select>
        </div>
        <div v-if="modelB" class="status-row">
          <span :class="['status-badge', modelB.cached ? 'local' : 'cloud']">
            {{ modelB.cached ? 'Lokal' : 'Cloud' }}
          </span>
          <button v-if="!modelB.cached" class="mini-dl" @click="downloadModel(modelB)" :disabled="modelB.loading">
            {{ modelB.loading ? '...' : 'Laden' }}
          </button>
        </div>
      </div>

      <button class="btn btn-primary start-btn" @click="$router.push('/arena/battle')">
        ⚔️ In die Arena (Chat)
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { state, downloadModel } from '../../state.js';

const modelA = computed(() => state.availableModels.find(m => m.id === state.selectedModelA));
const modelB = computed(() => state.availableModels.find(m => m.id === state.selectedModelB));
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

.arena-config {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
}

.selection-box {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-left: 0.5rem;
}

.status-badge {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 0.2rem 0.6rem;
  border-radius: 8px;
}

.status-badge.local {
  background: rgba(0, 242, 254, 0.1);
  color: #00f2fe;
  border: 1px solid rgba(0, 242, 254, 0.2);
}

.status-badge.cloud {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.mini-dl {
  background: #00f2fe;
  color: #000;
  border: none;
  border-radius: 6px;
  padding: 0.2rem 0.5rem;
  font-size: 0.7rem;
  font-weight: 800;
  cursor: pointer;
}

.select-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.select-wrapper label {
  font-size: 0.9rem;
  text-transform: uppercase;
  font-weight: bold;
  letter-spacing: 1px;
}

.model-a-select label { color: #4facfe; }
.model-b-select label { color: #a18cd1; }

select {
  width: 100%;
  padding: 1rem;
  border-radius: 12px;
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--glass-border);
  color: #fff;
  font-size: 1rem;
}

select:focus {
  outline: none;
  border-color: #00f2fe;
}

.vs-badge {
  font-size: 2rem;
  font-weight: 900;
  color: rgba(255,255,255,0.1);
  font-style: italic;
  margin: 0.5rem 0;
}

.start-btn {
  width: 100%;
  margin-top: 1rem;
  padding: 1.2rem;
  font-size: 1.1rem;
  font-weight: bold;
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
  color: #000;
  border-radius: 12px;
}
</style>
