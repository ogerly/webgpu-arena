<template>
  <div class="app-layout">
    <!-- WebGPU Error Banner -->
    <div v-if="gpuError" class="gpu-error-banner">
      <h3>⚠️ WebGPU wird nicht unterstützt</h3>
      <p>{{ gpuError }}</p>
      <div class="gpu-help">
        <strong>So löst du das Problem:</strong>
        <ul>
          <li>Nutze die neueste Version von <strong>Google Chrome</strong> oder <strong>Microsoft Edge</strong>.</li>
          <li>Falls du bereits Chrome/Edge nutzt, tippe <code>chrome://flags/#enable-unsafe-webgpu</code> in die Adresszeile und aktiviere es.</li>
          <li>Starte den Browser danach neu.</li>
        </ul>
      </div>
      <button class="btn btn-close-error" @click="gpuError = null">Verstanden</button>
    </div>

    <!-- Sidebar: Modell-Ordner -->
    <aside class="sidebar glass-panel">
      <div class="sidebar-header">
        <span class="logo-icon">🏟️</span>
        <h2>Modell-Ordner</h2>
      </div>
      <p class="sidebar-desc">KIs für die Offline-Nutzung verwalten.</p>
      
      <div class="model-list">
        <div v-for="model in availableModels" :key="model.id" class="model-item" :class="{'is-cached': model.cached}">
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
    </aside>

    <!-- Main Arena -->
    <main class="arena-main">
      <header class="glass-header">
        <h1>OS-Arena</h1>
        <p class="subtitle">Wähle zwei Modelle und lass sie lokal gegeneinander antreten.</p>
        
        <div class="arena-config">
          <div class="select-wrapper model-a-select">
            <label>Modell A</label>
            <select v-model="selectedModelA">
              <option v-for="m in availableModels" :key="'a-'+m.id" :value="m.id">
                {{ m.name }} {{ m.cached ? '(Lokal)' : '' }}
              </option>
            </select>
          </div>
          <div class="vs-badge">VS</div>
          <div class="select-wrapper model-b-select">
            <label>Modell B</label>
            <select v-model="selectedModelB">
              <option v-for="m in availableModels" :key="'b-'+m.id" :value="m.id">
                {{ m.name }} {{ m.cached ? '(Lokal)' : '' }}
              </option>
            </select>
          </div>
        </div>
      </header>

      <div class="chat-section">
        <div class="chat-history">
          <div v-if="chatHistory.length === 0" class="empty-state">
            <p>Schreibe eine Nachricht, um den Vergleich zu starten!</p>
          </div>
          
          <div v-for="(msg, index) in chatHistory" :key="index" class="message-group">
            <div class="user-message">
              <span class="avatar">👤</span>
              <div class="bubble">{{ msg.user }}</div>
            </div>
            
            <div class="models-response-container">
              <!-- Model A -->
              <div class="model-card glass-panel" :class="{'winner': msg.winner === 'A'}">
                <div class="model-header model-a-header">
                  <span class="model-badge">Modell A</span>
                  <span class="model-name-display">{{ msg.modelA.name }}</span>
                </div>
                <div class="model-content" v-html="msg.modelA.content"></div>
                <div v-if="!msg.winner && msg.modelA.content && !msg.modelA.generating" class="vote-actions">
                  <button class="btn btn-vote" @click="vote(index, 'A')">🏆 A ist besser</button>
                </div>
              </div>

              <!-- Model B -->
              <div class="model-card glass-panel" :class="{'winner': msg.winner === 'B'}">
                <div class="model-header model-b-header">
                  <span class="model-badge">Modell B</span>
                  <span class="model-name-display">{{ msg.modelB.name }}</span>
                </div>
                <div class="model-content" v-html="msg.modelB.content"></div>
                <div v-if="!msg.winner && msg.modelB.content && !msg.modelB.generating" class="vote-actions">
                  <button class="btn btn-vote" @click="vote(index, 'B')">🏆 B ist besser</button>
                </div>
              </div>
            </div>
            
            <div v-if="msg.winner" class="winner-announcement">
              <span v-if="msg.winner === 'A'">🎉 Du hast für Modell A ({{ msg.modelA.name }}) gestimmt!</span>
              <span v-else>🎉 Du hast für Modell B ({{ msg.modelB.name }}) gestimmt!</span>
            </div>
          </div>
        </div>

        <div class="input-area glass-panel">
          <div v-if="loading" class="loading-status">
            <div class="spinner"></div>
            <span>{{ loadingStatus }}</span>
            <div class="progress-bar-container" v-if="loadingProgress > 0">
              <div class="progress-bar" :style="{ width: loadingProgress + '%' }"></div>
            </div>
          </div>
          <div class="input-wrapper">
            <textarea 
              v-model="prompt" 
              placeholder="Stelle eine Frage an beide KIs..." 
              @keydown.enter.prevent="submitPrompt"
              :disabled="loading"
              rows="2"
            ></textarea>
            <button class="btn btn-primary" @click="submitPrompt" :disabled="loading || !prompt.trim()">
              <span>Senden</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { CreateMLCEngine, hasModelInCache } from '@mlc-ai/web-llm';

// Globale Modelle für den Cache-"Ordner"
const availableModels = ref([
  { id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC', name: 'Llama 3.2', size: '1B Param', cached: false, loading: false, progress: 0 },
  { id: 'Qwen2-1.5B-Instruct-q4f16_1-MLC', name: 'Qwen 2', size: '1.5B Param', cached: false, loading: false, progress: 0 },
  { id: 'TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC', name: 'TinyLlama', size: '1.1B Param', cached: false, loading: false, progress: 0 },
  { id: 'Gemma-2B-it-q4f16_1-MLC', name: 'Gemma', size: '2B Param', cached: false, loading: false, progress: 0 }
]);

const selectedModelA = ref(availableModels.value[1].id); // Qwen
const selectedModelB = ref(availableModels.value[2].id); // TinyLlama

const prompt = ref('');
const chatHistory = ref([]);
const loading = ref(false);
const loadingStatus = ref('');
const loadingProgress = ref(0);
const gpuError = ref(null);

// Laufende Engines im Speicher halten, um mehrfaches Laden zu vermeiden
const loadedEngines = {};

const checkCacheStatus = async () => {
  if (!navigator.gpu) {
    gpuError.value = "Dein Browser oder Gerät unterstützt kein WebGPU. Dies ist zwingend erforderlich, um die Modelle lokal auszuführen.";
  }

  for (let model of availableModels.value) {
    try {
      model.cached = await hasModelInCache(model.id);
    } catch(e) {
      console.warn("Cache check failed for", model.id);
    }
  }
};

onMounted(() => {
  checkCacheStatus();
});

const downloadModel = async (model) => {
  if (gpuError.value) return; // Verhindere Download, wenn GPU fehlt

  model.loading = true;
  model.progress = 0;
  
  const initProgressCallback = (progress) => {
    if (progress.progress) {
      model.progress = Math.round(progress.progress * 100);
    }
  };
  
  try {
    // Initialisieren lädt das Modell in den IndexedDB/Cache Storage herunter
    const engine = await CreateMLCEngine(model.id, { initProgressCallback });
    model.cached = true;
    model.progress = 100;
    // Engine für später aufbewahren
    loadedEngines[model.id] = engine;
  } catch (err) {
    console.error("Fehler beim Herunterladen:", err);
    if (err.toString().includes('compatible GPU') || err.toString().includes('WebGPU')) {
      gpuError.value = "Keine kompatible Grafikkarte gefunden oder WebGPU nicht aktiviert. Bitte überprüfe deine Browser-Einstellungen.";
    } else {
      gpuError.value = "Fehler beim Download: " + err.message;
    }
  } finally {
    model.loading = false;
  }
};

const getOrInitEngine = async (modelId) => {
  if (loadedEngines[modelId]) return loadedEngines[modelId];
  
  loadingStatus.value = `Bereite ${modelId} vor...`;
  loadingProgress.value = 0;
  
  const initProgressCallback = (progress) => {
    loadingStatus.value = progress.text;
    if (progress.progress) {
      loadingProgress.value = Math.round(progress.progress * 100);
    }
  };
  
  const engine = await CreateMLCEngine(modelId, { initProgressCallback });
  loadedEngines[modelId] = engine;
  
  // Update UI Cache Status
  const modelInfo = availableModels.value.find(m => m.id === modelId);
  if (modelInfo) modelInfo.cached = true;
  
  return engine;
};

const submitPrompt = async () => {
  if (!prompt.value.trim() || loading.value) return;
  
  if (selectedModelA.value === selectedModelB.value) {
    alert("Bitte wähle zwei unterschiedliche Modelle für den Vergleich.");
    return;
  }
  
  const userText = prompt.value;
  prompt.value = '';
  
  const currentMsg = {
    user: userText,
    modelA: { name: availableModels.value.find(m=>m.id===selectedModelA.value).name, content: '', generating: true },
    modelB: { name: availableModels.value.find(m=>m.id===selectedModelB.value).name, content: '', generating: true },
    winner: null
  };
  
  chatHistory.value.push(currentMsg);
  const msgIndex = chatHistory.value.length - 1;
  
  loading.value = true;
  
  try {
    const engineA = await getOrInitEngine(selectedModelA.value);
    const engineB = await getOrInitEngine(selectedModelB.value);

    loadingStatus.value = "Modelle generieren Antworten...";
    loadingProgress.value = 0;
    
    // Beide generieren lassen (hier sequentiell wegen WebGPU Limitierungen auf manchen Geräten besser als parallel)
    const replyA = await engineA.chat.completions.create({
      messages: [{ role: "user", content: userText }]
    });
    chatHistory.value[msgIndex].modelA.content = replyA.choices[0].message.content;
    chatHistory.value[msgIndex].modelA.generating = false;

    const replyB = await engineB.chat.completions.create({
      messages: [{ role: "user", content: userText }]
    });
    chatHistory.value[msgIndex].modelB.content = replyB.choices[0].message.content;
    chatHistory.value[msgIndex].modelB.generating = false;
    
  } catch(err) {
    console.error("Generierungsfehler:", err);
    chatHistory.value[msgIndex].modelA.content = "Fehler bei der Generierung.";
    chatHistory.value[msgIndex].modelA.generating = false;
    chatHistory.value[msgIndex].modelB.content = "Fehler bei der Generierung.";
    chatHistory.value[msgIndex].modelB.generating = false;
  } finally {
    loading.value = false;
  }
};

const vote = (index, winner) => {
  chatHistory.value[index].winner = winner;
};
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  max-width: 1600px;
  margin: 0 auto;
}

/* Sidebar Styles */
.sidebar {
  width: 320px;
  margin: 1.5rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.8);
  border-right: 1px solid var(--glass-border);
  overflow-y: auto;
  position: sticky;
  top: 1.5rem;
  height: calc(100vh - 3rem);
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.sidebar h2 {
  font-size: 1.5rem;
  color: var(--accent-color);
  margin: 0;
}

.sidebar-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--glass-border);
}

.model-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.model-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.model-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
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
  font-size: 1.1rem;
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
  padding: 0.6rem;
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.btn-download:hover {
  background: rgba(255, 255, 255, 0.2);
}

.ready-text {
  display: block;
  text-align: center;
  font-size: 0.85rem;
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
  height: 6px;
  background: rgba(0,0,0,0.3);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #00f2fe;
  transition: width 0.2s ease;
}

.progress-text {
  font-size: 0.8rem;
  color: var(--text-secondary);
  width: 40px;
  text-align: right;
}

/* Main Arena Styles */
.arena-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1.5rem 1.5rem 0;
  height: 100vh;
  overflow-y: auto;
}

.glass-header {
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
}

h1 {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin-top: 0.5rem;
  margin-bottom: 2rem;
}

.arena-config {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  background: rgba(0,0,0,0.2);
  padding: 1.5rem;
  border-radius: 16px;
}

.select-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.select-wrapper label {
  font-size: 0.85rem;
  text-transform: uppercase;
  font-weight: bold;
  letter-spacing: 1px;
}

.model-a-select label { color: #4facfe; }
.model-b-select label { color: #a18cd1; }

select {
  padding: 0.8rem 1rem;
  border-radius: 8px;
  background: rgba(255,255,255,0.1);
  border: 1px solid var(--glass-border);
  color: #fff;
  font-family: inherit;
  font-size: 1rem;
  width: 250px;
  cursor: pointer;
}

select:focus {
  outline: none;
  border-color: #00f2fe;
}

select option {
  background: var(--bg-color);
  color: #fff;
}

.vs-badge {
  font-size: 1.5rem;
  font-weight: 900;
  color: rgba(255,255,255,0.2);
  font-style: italic;
}

.chat-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.chat-history {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.empty-state {
  text-align: center;
  color: var(--text-secondary);
  padding: 4rem 0;
  font-style: italic;
}

.user-message {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 2rem;
}

.avatar {
  font-size: 2rem;
  background: var(--glass-bg);
  padding: 0.5rem;
  border-radius: 50%;
  border: 1px solid var(--glass-border);
}

.bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1.2rem 1.5rem;
  border-radius: 0 20px 20px 20px;
  color: white;
  font-size: 1.1rem;
  line-height: 1.5;
  box-shadow: 0 4px 15px rgba(118, 75, 162, 0.3);
}

.models-response-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.model-card {
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.model-card.winner {
  box-shadow: 0 0 20px rgba(0, 242, 254, 0.2);
  transform: translateY(-5px);
}

.model-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--glass-border);
}

.model-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
}

.model-a-header .model-badge {
  background: rgba(79, 172, 254, 0.2);
  color: #4facfe;
  border: 1px solid #4facfe;
}

.model-b-header .model-badge {
  background: rgba(161, 140, 209, 0.2);
  color: #a18cd1;
  border: 1px solid #a18cd1;
}

.model-card.winner .model-a-header .model-badge,
.model-card.winner .model-b-header .model-badge {
  background: rgba(0, 242, 254, 0.8);
  color: #000;
  border-color: #00f2fe;
}

.model-name-display {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.model-content {
  flex: 1;
  line-height: 1.6;
  color: var(--text-primary);
  white-space: pre-wrap;
}

.vote-actions {
  margin-top: 1.5rem;
  text-align: center;
}

.btn-vote {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  width: 100%;
  padding: 0.8rem;
  font-size: 1rem;
}

.btn-vote:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.winner-announcement {
  text-align: center;
  margin-top: 2rem;
  padding: 1rem;
  background: rgba(0, 242, 254, 0.1);
  border-radius: 12px;
  color: #00f2fe;
  font-weight: bold;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.input-area {
  position: sticky;
  bottom: 0;
  margin-bottom: 1.5rem;
}

.loading-status {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  color: #00f2fe;
  font-size: 0.9rem;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 242, 254, 0.3);
  border-top-color: #00f2fe;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.progress-bar-container {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #00f2fe;
  transition: width 0.3s ease;
}

.input-wrapper {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

textarea {
  flex: 1;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 1rem;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 1rem;
  resize: none;
  transition: all 0.3s ease;
}

textarea:focus {
  outline: none;
  border-color: #4facfe;
  background: rgba(0, 0, 0, 0.4);
}

.btn-primary {
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
  color: #000;
  font-weight: bold;
  padding: 1rem 2rem;
  height: 56px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 242, 254, 0.4);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 1024px) {
  .app-layout {
    flex-direction: column;
  }
  
  .sidebar {
    width: auto;
    position: static;
    height: auto;
    margin-bottom: 0;
  }
  
  .arena-main {
    padding: 1.5rem;
  }
  
  .models-response-container {
    grid-template-columns: 1fr;
  }
  
  .arena-config {
    flex-direction: column;
    gap: 1rem;
  }
  
  select {
    width: 100%;
  }
}

.gpu-error-banner {
  background: rgba(220, 38, 38, 0.2);
  border: 1px solid rgba(220, 38, 38, 0.4);
  padding: 1.5rem;
  border-radius: 12px;
  margin: 1.5rem 1.5rem 0 1.5rem;
  color: #fca5a5;
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.1);
}

.gpu-error-banner h3 {
  color: #f87171;
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.gpu-help {
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(0,0,0,0.3);
  border-radius: 8px;
}

.gpu-help ul {
  margin-top: 0.5rem;
  padding-left: 1.5rem;
}

.gpu-help li {
  margin-bottom: 0.5rem;
}

.gpu-help code {
  background: rgba(255,255,255,0.1);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  color: #00f2fe;
}

.btn-close-error {
  background: rgba(220, 38, 38, 0.3);
  color: white;
  padding: 0.5rem 1rem;
  font-weight: bold;
}

.btn-close-error:hover {
  background: rgba(220, 38, 38, 0.5);
}
</style>
