<template>
  <div class="view-container">
    <header class="view-header">
      <h2>Arena Setup</h2>
      <p>Wähle zwei KIs für den Zweikampf</p>
    </header>

    <div class="arena-config animate-in">
      <div class="selection-grid">
        <!-- Model A Selection -->
        <div class="selection-card glass-panel model-a-border" :class="{ selected: state.selectedModelA }">
          <div class="card-header">
            <span class="badge-a">A</span>
            <h3>KI Blau</h3>
          </div>
          
          <div class="select-field">
            <select v-model="state.selectedModelA">
              <option v-for="m in arenaModels" :key="'a-'+m.id" :value="m.id">
                {{ m.cached ? '💾' : '☁️' }} {{ m.name }}
              </option>
            </select>
          </div>

          <div v-if="modelA" class="model-meta">
            <span :class="['status-tag', modelA.cached ? 'local' : 'cloud']">
              {{ modelA.cached ? 'Lokal verfügbar' : 'Cloud' }}
            </span>
            <button v-if="!modelA.cached" class="btn-mini-dl" @click="downloadModel(modelA)" :disabled="modelA.loading">
              {{ modelA.loading ? '...' : 'Laden' }}
            </button>
          </div>
        </div>
        
        <div class="vs-divider">
          <div class="vs-circle">VS</div>
        </div>
        
        <!-- Model B Selection -->
        <div class="selection-card glass-panel model-b-border" :class="{ selected: state.selectedModelB }">
          <div class="card-header">
            <span class="badge-b">B</span>
            <h3>KI Lila</h3>
          </div>
          
          <div class="select-field">
            <select v-model="state.selectedModelB">
              <option v-for="m in arenaModels" :key="'b-'+m.id" :value="m.id">
                {{ m.cached ? '💾' : '☁️' }} {{ m.name }}
              </option>
            </select>
          </div>

          <div v-if="modelB" class="model-meta">
            <span :class="['status-tag', modelB.cached ? 'local' : 'cloud']">
              {{ modelB.cached ? 'Lokal verfügbar' : 'Cloud' }}
            </span>
            <button v-if="!modelB.cached" class="btn-mini-dl" @click="downloadModel(modelB)" :disabled="modelB.loading">
              {{ modelB.loading ? '...' : 'Laden' }}
            </button>
          </div>
        </div>
      </div>

      <button 
        class="btn-start-arena" 
        :disabled="!state.selectedModelA || !state.selectedModelB"
        @click="$router.push('/arena/battle')"
      >
        <span>⚔️</span> Kampf starten
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { state, downloadModel } from '../../state.js';

const arenaModels = computed(() => state.availableModels.filter(m => m.arena));
const modelA = computed(() => state.availableModels.find(m => m.id === state.selectedModelA));
const modelB = computed(() => state.availableModels.find(m => m.id === state.selectedModelB));
</script>

<style scoped>
.view-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.view-header {
  text-align: center;
  margin-bottom: 3rem;
}

.view-header h2 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.arena-config {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.selection-grid {
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  gap: 1.5rem;
  position: relative;
}

@media (min-width: 850px) {
  .selection-grid {
    grid-template-columns: 1fr auto 1fr;
    gap: 2rem;
  }
}

.selection-card {
  padding: 1.5rem;
  border-radius: 20px;
  border: 1px solid var(--glass-border);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  background: rgba(15, 23, 42, 0.3);
}

.selection-card.selected {
  background: rgba(15, 23, 42, 0.6);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.model-a-border.selected { border-color: rgba(79, 172, 254, 0.5); }
.model-b-border.selected { border-color: rgba(161, 140, 209, 0.5); }

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.badge-a, .badge-b {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: 800;
  font-size: 0.9rem;
}

.badge-a { background: rgba(79, 172, 254, 0.2); color: #4facfe; }
.badge-b { background: rgba(161, 140, 209, 0.2); color: #a18cd1; }

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #fff;
}

.select-field select {
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--glass-border);
  color: #fff;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  font-size: 1rem;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;
}

.select-field select:hover {
  background: rgba(255, 255, 255, 0.05);
}

.model-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.status-tag {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
}

.status-tag.local { background: rgba(0, 242, 254, 0.1); color: #00f2fe; }
.status-tag.cloud { background: rgba(255, 255, 255, 0.05); color: var(--text-secondary); }

.btn-mini-dl {
  background: #00f2fe;
  color: #000;
  border: none;
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 800;
  cursor: pointer;
}

.vs-divider {
  display: flex;
  justify-content: center;
  z-index: 5;
}

.vs-circle {
  width: 50px;
  height: 50px;
  background: var(--bg-color);
  border: 1px solid var(--glass-border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-style: italic;
  color: rgba(255,255,255,0.2);
  box-shadow: 0 0 20px rgba(0,0,0,0.3);
}

.btn-start-arena {
  width: 100%;
  max-width: 400px;
  margin: 1rem auto;
  padding: 1.2rem;
  border-radius: 16px;
  border: none;
  background: var(--primary-gradient);
  color: #000;
  font-size: 1.1rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.btn-start-arena:hover:not(:disabled) {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 10px 30px rgba(0, 242, 254, 0.4);
}

.btn-start-arena:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.2);
  cursor: not-allowed;
}

.animate-in {
  animation: slideUp 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
