<template>
  <div class="view-container">
    <header class="view-header">
      <h2>Arena Setup</h2>
      <p>Wähle zwei KIs für den Zweikampf</p>
    </header>

    <div class="arena-config glass-panel">
      <div class="select-wrapper model-a-select">
        <label>Modell A (Blau)</label>
        <select v-model="state.selectedModelA">
          <option v-for="m in state.availableModels" :key="'a-'+m.id" :value="m.id">
            {{ m.name }} {{ m.cached ? '(Lokal)' : '' }}
          </option>
        </select>
      </div>
      
      <div class="vs-badge">VS</div>
      
      <div class="select-wrapper model-b-select">
        <label>Modell B (Lila)</label>
        <select v-model="state.selectedModelB">
          <option v-for="m in state.availableModels" :key="'b-'+m.id" :value="m.id">
            {{ m.name }} {{ m.cached ? '(Lokal)' : '' }}
          </option>
        </select>
      </div>

      <button class="btn btn-primary start-btn" @click="$router.push('/chat')">
        ⚔️ In die Arena (Chat)
      </button>
    </div>
  </div>
</template>

<script setup>
import { state } from '../../state.js';
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
