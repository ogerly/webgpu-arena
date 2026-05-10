<template>
  <div class="view-container">
    <header class="view-header">
      <h2>Modell-Bibliothek</h2>
      <p>Verwalte deine lokalen KIs für maximale Privatsphäre</p>
    </header>

    <div class="model-sections">
      <!-- Text Modelle -->
      <section class="model-section">
        <h3 class="section-title">Text-Modelle (LLMs)</h3>
        <div class="model-grid">
          <div 
            v-for="model in textModels" 
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
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </div>
            </div>

            <div class="card-body">
              <p class="model-description">{{ model.description }}</p>
              <div class="model-traits" v-if="model.strengths || model.weaknesses">
                <div class="trait-group strengths" v-if="model.strengths">
                  <span class="trait-label">Stärken:</span>
                  <ul><li v-for="s in model.strengths" :key="s">{{ s }}</li></ul>
                </div>
              </div>
            </div>
            
            <div class="card-actions">
              <template v-if="!model.cached">
                <button v-if="!model.loading" @click="downloadModel(model)" class="btn-download-action">
                  <span>Modell laden</span>
                </button>
                <div v-else class="download-ui">
                  <div class="progress-info"><span>{{ model.progress }}%</span></div>
                  <div class="progress-track"><div class="progress-fill" :style="{width: model.progress + '%'}"></div></div>
                </div>
              </template>
              <div v-else class="ready-display">
                <button class="btn-chat-link" @click="$router.push('/arena')">Arena starten</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Bild Modelle -->
      <section class="model-section">
        <h3 class="section-title">Bild-Modelle (Text-to-Image)</h3>
        <div class="model-grid">
          <div 
            v-for="model in imageModels" 
            :key="model.id" 
            class="model-card glass-panel" 
            :class="{'is-cached': model.cached, 'is-loading': model.loading, 'image-model-card': true}"
          >
            <div class="card-glow"></div>
            
            <div class="card-header">
              <div class="model-meta">
                <span class="model-name">{{ model.name }}</span>
                <div class="badge-group">
                  <span class="size-badge">{{ model.size }}</span>
                  <span v-if="model.badge" class="type-badge" :class="model.badge.toLowerCase()">{{ model.badge }}</span>
                  <span v-if="model.status === 'experimental'" class="status-pill experimental">Experimental</span>
                  <span v-if="model.cached" class="status-pill cached">Lokal</span>
                  <span v-else class="status-pill cloud">Cloud</span>
                </div>
              </div>
              <div class="model-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              </div>
            </div>

            <div class="card-body">
              <p class="model-description">{{ model.description }}</p>
            </div>
            
            <div class="card-actions">
              <template v-if="!model.cached">
                <button v-if="!model.loading" @click="downloadModel(model)" class="btn-download-action image-btn">
                  <span>Modell laden</span>
                </button>
                <div v-else class="download-ui">
                  <div class="progress-info"><span>{{ model.progress }}%</span></div>
                  <div class="progress-track"><div class="progress-fill" :style="{width: model.progress + '%'}"></div></div>
                </div>
              </template>
              <div v-else class="ready-display">
                <button class="btn-chat-link image-chat-btn" @click="startImageChat(model.id)">Bild-Chat öffnen</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { state, downloadModel } from '../../state.js';

const router = useRouter();

const textModels = computed(() => state.availableModels.filter(m => m.type === 'text'));
const imageModels = computed(() => state.availableModels.filter(m => m.type === 'image'));

const startImageChat = (modelId) => {
  state.selectedModelChat = modelId;
  router.push('/chat');
};
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

.model-sections {
  display: flex;
  flex-direction: column;
  gap: 4rem;
}

.model-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  padding-left: 0.5rem;
  border-left: 4px solid var(--accent-color, #00f2fe);
}

.model-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.image-model-card {
  border-color: rgba(168, 85, 247, 0.2);
}

.image-model-card:hover {
  border-color: rgba(168, 85, 247, 0.5);
}

.image-btn:hover {
  background: linear-gradient(135deg, #a855f7, #06b6d4) !important;
}

.image-chat-btn {
  background: rgba(168, 85, 247, 0.1) !important;
  border-color: rgba(168, 85, 247, 0.3) !important;
  color: #a855f7 !important;
}

.image-chat-btn:hover {
  background: rgba(168, 85, 247, 0.2) !important;
  border-color: #a855f7 !important;
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

.status-pill.experimental {
  background: rgba(168, 85, 247, 0.15);
  color: #a855f7;
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
