<template>
  <div class="view-container">
    <header class="view-header">
      <h2>Modell-Bibliothek</h2>
      <p>Verwalte deine lokalen KIs für maximale Privatsphäre</p>
    </header>

    <div class="model-grid">
      <div 
        v-for="model in state.availableModels" 
        :key="model.id" 
        class="model-card glass-panel" 
        :class="{'is-cached': model.cached, 'is-loading': model.loading}"
      >
        <div class="card-glow"></div>
        
        <div class="card-header">
          <div class="model-meta">
            <span class="model-name">{{ model.name }}</span>
            <div class="badge-group">
              <span class="size-badge">{{ model.size }}</span>
              <span v-if="model.badge" class="type-badge" :class="model.badge.toLowerCase()">{{ model.badge }}</span>
              <span v-if="model.cached" class="status-pill cached">Lokal</span>
              <span v-else class="status-pill cloud">Cloud</span>
            </div>
          </div>
          <div class="model-icon">
            <svg v-if="model.cached" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-success"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="7.5 10.5 10.5 13.5 16.5 7.5"></polyline></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-cloud"><path d="M17.5 19c3.037 0 5.5-2.463 5.5-5.5 0-2.77-2.053-5.06-4.73-5.44A6.002 6.002 0 0 0 7 6c-3.314 0-6 2.686-6 6a6 6 0 0 0 6 6h10.5Z"></path><path d="M12 12v6"></path><path d="M9 15l3 3 3-3"></path></svg>
          </div>
        </div>

        <div class="card-body">
          <p class="model-description">
            {{ model.description || 'Ein leistungsstarkes Sprachmodell optimiert für lokale Ausführung.' }}
          </p>
          
          <div class="model-traits" v-if="model.strengths || model.weaknesses">
            <div class="trait-group strengths" v-if="model.strengths">
              <span class="trait-label">Stärken:</span>
              <ul>
                <li v-for="s in model.strengths" :key="s">{{ s }}</li>
              </ul>
            </div>
            <div class="trait-group weaknesses" v-if="model.weaknesses">
              <span class="trait-label">Schwächen:</span>
              <ul>
                <li v-for="w in model.weaknesses" :key="w">{{ w }}</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="card-actions">
          <template v-if="!model.cached">
            <button v-if="!model.loading" @click="downloadModel(model)" class="btn-download-action">
              <span>Jetzt Herunterladen</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </button>
            <div v-else class="download-ui">
              <div class="progress-info">
                <span>Herunterladen...</span>
                <span>{{ model.progress }}%</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" :style="{width: model.progress + '%'}"></div>
              </div>
            </div>
          </template>
          <div v-else class="ready-display">
            <span class="ready-text">Einsatzbereit</span>
            <button class="btn-chat-link" @click="$router.push('/arena')">Zweikampf starten</button>
          </div>
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
  padding-bottom: 100px;
}

.view-header {
  margin-bottom: 2.5rem;
  text-align: center;
}

.view-header h2 {
  font-size: 2.25rem;
  font-weight: 800;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.view-header p {
  color: var(--text-secondary);
  font-size: 1rem;
}

.model-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.model-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  overflow: hidden;
}

.model-card:hover {
  transform: translateY(-5px);
  border-color: rgba(79, 172, 254, 0.4);
  box-shadow: 0 20px 40px -20px rgba(0, 0, 0, 0.5);
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(79, 172, 254, 0.1) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.model-card:hover .card-glow {
  opacity: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

.model-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.model-name {
  font-weight: 700;
  font-size: 1.3rem;
  color: #fff;
}

.badge-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.size-badge {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.status-pill {
  font-size: 0.7rem;
  padding: 2px 10px;
  border-radius: 20px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-pill.cached {
  background: rgba(0, 242, 254, 0.15);
  color: #00f2fe;
}

.status-pill.cloud {
  background: rgba(255, 159, 28, 0.15);
  color: #ff9f1c;
}

.type-badge {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.type-badge.reasoning {
  background: rgba(168, 85, 247, 0.2);
  color: #a855f7;
  border-color: rgba(168, 85, 247, 0.3);
}

.type-badge.speed {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.3);
}

.type-badge.balanced {
  background: rgba(20, 184, 166, 0.2);
  color: #14b8a6;
  border-color: rgba(20, 184, 166, 0.3);
}

.type-badge.negative {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

.model-icon {
  color: rgba(255, 255, 255, 0.2);
  transition: color 0.3s ease;
}

.model-card:hover .model-icon {
  color: #4facfe;
}

.card-body {
  margin-bottom: 1.5rem;
  flex-grow: 1;
}

.model-description {
  font-size: 0.9rem;
  color: #fff;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.model-traits {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.trait-group {
  font-size: 0.8rem;
}

.trait-label {
  display: block;
  font-weight: 700;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 0.05em;
}

.strengths .trait-label {
  color: #00f2fe;
}

.weaknesses .trait-label {
  color: #ff9f1c;
}

.trait-group ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.trait-group li {
  position: relative;
  padding-left: 1rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: 0.2rem;
}

.trait-group li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: inherit;
  opacity: 0.5;
}

.card-actions {
  margin-top: auto;
}

.btn-download-action {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-download-action:hover {
  background: var(--primary-gradient);
  color: #000;
  border-color: transparent;
  transform: scale(1.02);
}

.download-ui {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #4facfe;
  font-weight: 600;
}

.progress-track {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary-gradient);
  box-shadow: 0 0 10px rgba(79, 172, 254, 0.5);
  transition: width 0.3s ease;
}

.ready-display {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ready-text {
  text-align: center;
  font-size: 0.9rem;
  color: #00f2fe;
  font-weight: 700;
}

.btn-chat-link {
  width: 100%;
  padding: 0.8rem;
  background: rgba(0, 242, 254, 0.1);
  border: 1px solid rgba(0, 242, 254, 0.3);
  border-radius: 10px;
  color: #00f2fe;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-chat-link:hover {
  background: rgba(0, 242, 254, 0.2);
  border-color: #00f2fe;
}

.icon-success { color: #00f2fe; }
.icon-cloud { color: #ff9f1c; }

@media (max-width: 640px) {
  .model-grid {
    grid-template-columns: 1fr;
  }
}
</style>
