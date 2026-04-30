<template>
  <div class="chat-container">
    <div class="chat-header glass-panel">
      <!-- Kategorie-Wähler -->
      <div class="category-selector">
        <label>Prompt-Vorlage</label>
        <select @change="applyTemplate($event.target.value)">
          <option value="">-- Eigene Eingabe --</option>
          <optgroup v-for="cat in promptCategories" :key="cat.id" :label="cat.label">
            <option v-for="(p, i) in cat.prompts" :key="i" :value="p">{{ p }}</option>
          </optgroup>
        </select>
      </div>

      <div class="model-selection-status" v-if="!isBlind">
        <span class="badge">{{ modelA?.name }}</span>
        <span class="vs">VS</span>
        <span class="badge">{{ modelB?.name }}</span>
      </div>
      <div v-else class="blind-notice">
        🕵️ Blind-Test Aktiv (Namen ausgeblendet)
      </div>
    </div>

    <div class="chat-history" ref="chatHistoryRef">
      <div v-if="state.arenaHistory.length === 0" class="empty-state">
        <p>Stelle eine Frage, um den Vergleich zu starten! Die Namen der Modelle bleiben bis zur Wertung geheim.</p>
      </div>
      
      <div v-for="(msg, index) in state.arenaHistory" :key="index" class="message-group">
        <div class="user-message">
          <span class="avatar">👤</span>
          <div class="bubble">{{ msg.user }}</div>
        </div>
        
        <div class="models-response-container">
          <!-- Model A Card -->
          <div class="model-card glass-panel" :class="{'winner': msg.winner === 'A', 'loser': msg.winner === 'B', 'revealed': msg.winner}">
            <div class="model-header model-a-header">
              <div class="model-header-left">
                <span class="model-badge">A</span>
                <span class="model-name-display">{{ msg.winner ? msg.modelA.name : 'Modell A' }}</span>
              </div>
              <div v-if="msg.winner && msg.eloChange" class="reveal-info">
                <span class="elo-delta">{{ msg.winner === 'A' ? '+' : '−' }}{{ msg.eloChange }} ELO</span>
              </div>
            </div>
            <div class="model-content">{{ msg.modelA.content || (msg.modelA.generating ? 'Denkt nach...' : '') }}</div>
            
            <div v-if="!msg.winner && msg.modelA.content && !msg.modelA.generating && !msg.modelB.generating" class="vote-actions">
              <button class="btn btn-vote" @click="vote(index, 'A')">🏆 A war besser</button>
            </div>
            
            <div v-if="msg.modelA.stats && !msg.modelA.generating" class="performance-stats">
              <span class="stat-item">{{ msg.modelA.stats.tps }} tok/s</span>
              <span class="stat-item">{{ msg.modelA.stats.duration }}s</span>
              <button 
                v-if="consentGranted && !msg.modelA.uploaded" 
                class="btn-mini-upload" 
                @click="handleGlobalUpload(msg, 'A')"
                :disabled="msg.modelA.uploading"
              >
                {{ msg.modelA.uploading ? '...' : '🌍 Global' }}
              </button>
              <span v-if="msg.modelA.uploaded" class="stat-uploaded">✅</span>
            </div>
          </div>

          <!-- Model B Card -->
          <div class="model-card glass-panel" :class="{'winner': msg.winner === 'B', 'loser': msg.winner === 'A', 'revealed': msg.winner}">
            <div class="model-header model-b-header">
              <div class="model-header-left">
                <span class="model-badge">B</span>
                <span class="model-name-display">{{ msg.winner ? msg.modelB.name : 'Modell B' }}</span>
              </div>
              <div v-if="msg.winner && msg.eloChange" class="reveal-info">
                <span class="elo-delta">{{ msg.winner === 'B' ? '+' : '−' }}{{ msg.eloChange }} ELO</span>
              </div>
            </div>
            <div class="model-content">{{ msg.modelB.content || (msg.modelB.generating ? 'Denkt nach...' : '') }}</div>
            
            <div v-if="!msg.winner && msg.modelB.content && !msg.modelB.generating && !msg.modelA.generating" class="vote-actions">
              <button class="btn btn-vote" @click="vote(index, 'B')">🏆 B war besser</button>
            </div>

            <div v-if="msg.modelB.stats && !msg.modelB.generating" class="performance-stats">
              <span class="stat-item">{{ msg.modelB.stats.tps }} tok/s</span>
              <span class="stat-item">{{ msg.modelB.stats.duration }}s</span>
              <button 
                v-if="consentGranted && !msg.modelB.uploaded" 
                class="btn-mini-upload" 
                @click="handleGlobalUpload(msg, 'B')"
                :disabled="msg.modelB.uploading"
              >
                {{ msg.modelB.uploading ? '...' : '🌍 Global' }}
              </button>
              <span v-if="msg.modelB.uploaded" class="stat-uploaded">✅</span>
            </div>
          </div>
        </div>
        
        <div v-if="!msg.winner && msg.modelA.content && msg.modelB.content && !msg.modelA.generating && !msg.modelB.generating" class="draw-action">
          <button class="btn btn-secondary btn-sm" @click="vote(index, 'draw')">🤝 Unentschieden</button>
        </div>
      </div>
    </div>

    <div class="input-area glass-panel">
      <div v-if="state.loading" class="loading-status">
        <div class="spinner"></div>
        <span class="loading-text">{{ state.loadingStatus }}</span>
      </div>
      <div class="input-wrapper">
        <textarea 
          v-model="prompt" 
          placeholder="Stelle eine Frage an beide KIs..." 
          @keydown.enter.prevent="submitPrompt"
          :disabled="state.loading"
          rows="1"
        ></textarea>
        <button class="btn btn-send" @click="submitPrompt" :disabled="state.loading || !prompt.trim()">
          ➤
        </button>
      </div>
    </div>

    <RankingConsent @accept="onConsentAccept" />
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { state, getOrInitEngine, downloadModel, updateModelScore } from '../../state.js';
import { calcEloWin, calcEloDraw } from '../../elo.js';
import { promptCategories } from '../../arena-prompts.js';
import { saveLocalBenchmark } from '../../services/ranking/localRanking.js';
import { submitToGlobalRanking } from '../../services/ranking/globalRanking.js';
import RankingConsent from '../ranking/RankingConsent.vue';

const prompt = ref('');
const chatHistoryRef = ref(null);
const isBlind = ref(true); // Namen standardmäßig ausblenden
const consentGranted = ref(localStorage.getItem('os_arena_ranking_consent') === 'granted');

const modelA = computed(() => state.availableModels.find(m => m.id === state.selectedModelA));
const modelB = computed(() => state.availableModels.find(m => m.id === state.selectedModelB));

const onConsentAccept = () => {
  consentGranted.value = true;
};

const handleGlobalUpload = async (msg, modelType) => {
  const modelData = modelType === 'A' ? msg.modelA : msg.modelB;
  if (!modelData.stats || modelData.uploading) return;

  modelData.uploading = true;
  const result = await submitToGlobalRanking({
    modelId: modelData.id,
    modelName: modelData.name,
    tokensPerSecond: parseFloat(modelData.stats.tps),
    totalTimeMs: Math.round(parseFloat(modelData.stats.duration) * 1000)
  });

  if (!result.error) {
    modelData.uploaded = true;
  } else {
    alert("Upload fehlgeschlagen: " + result.error);
  }
  modelData.uploading = false;
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatHistoryRef.value) {
      chatHistoryRef.value.scrollTop = chatHistoryRef.value.scrollHeight;
    }
  });
};

const applyTemplate = (val) => {
  if (val) prompt.value = val;
};

const submitPrompt = async () => {
  if (!prompt.value.trim() || state.loading) return;
  
  const userText = prompt.value;
  prompt.value = '';
  
  const currentMsg = {
    user: userText,
    modelA: { id: state.selectedModelA, name: modelA.value.name, content: '', generating: true },
    modelB: { id: state.selectedModelB, name: modelB.value.name, content: '', generating: true },
    winner: null,
    eloChange: 0
  };
  
  state.arenaHistory.push(currentMsg);
  const msgIndex = state.arenaHistory.length - 1;
  scrollToBottom();
  
  state.loading = true;
  
  try {
    const engineA = await getOrInitEngine(state.selectedModelA);
    const engineB = await getOrInitEngine(state.selectedModelB);

    // Messung für Modell A
    state.loadingStatus = "Modell A antwortet...";
    const startA = performance.now();
    const replyA = await engineA.chat.completions.create({
      messages: [{ role: "user", content: userText }]
    });
    const endA = performance.now();
    const durationA = (endA - startA) / 1000; // Sekunden
    const textA = replyA.choices[0].message.content;
    const tokensA = Math.ceil(textA.length / 3); // Schätzung: 3 Zeichen pro Token
    const tpsA = (tokensA / durationA).toFixed(2);

    state.arenaHistory[msgIndex].modelA.content = textA;
    state.arenaHistory[msgIndex].modelA.generating = false;
    state.arenaHistory[msgIndex].modelA.stats = { tps: tpsA, duration: durationA.toFixed(2) };
    
    // Lokal speichern (anonymisiert)
    saveLocalBenchmark({
      modelId: state.selectedModelA,
      modelName: modelA.value.name,
      tokensPerSecond: parseFloat(tpsA),
      totalTimeMs: Math.round(endA - startA),
      timestamp: new Date().toISOString()
    });

    scrollToBottom();

    // Messung für Modell B
    state.loadingStatus = "Modell B antwortet...";
    const startB = performance.now();
    const replyB = await engineB.chat.completions.create({
      messages: [{ role: "user", content: userText }]
    });
    const endB = performance.now();
    const durationB = (endB - startB) / 1000;
    const textB = replyB.choices[0].message.content;
    const tokensB = Math.ceil(textB.length / 3);
    const tpsB = (tokensB / durationB).toFixed(2);

    state.arenaHistory[msgIndex].modelB.content = textB;
    state.arenaHistory[msgIndex].modelB.generating = false;
    state.arenaHistory[msgIndex].modelB.stats = { tps: tpsB, duration: durationB.toFixed(2) };

    saveLocalBenchmark({
      modelId: state.selectedModelB,
      modelName: modelB.value.name,
      tokensPerSecond: parseFloat(tpsB),
      totalTimeMs: Math.round(endB - startB),
      timestamp: new Date().toISOString()
    });

    scrollToBottom();
    
  } catch(err) {
    console.error("Generierungsfehler:", err);
    state.arenaHistory[msgIndex].modelA.content = "Fehler!";
    state.arenaHistory[msgIndex].modelB.content = "Fehler!";
  } finally {
    state.loading = false;
    state.loadingStatus = '';
  }
};

const vote = (index, winner) => {
  const msg = state.arenaHistory[index];
  if (msg.winner) return; // Bereits gewertet

  const mA = state.availableModels.find(m => m.id === msg.modelA.id);
  const mB = state.availableModels.find(m => m.id === msg.modelB.id);
  
  if (!mA || !mB) return;

  let eloRes;
  if (winner === 'A') {
    eloRes = calcEloWin(mA.score, mB.score);
    updateModelScore(mA.id, eloRes.winner);
    updateModelScore(mB.id, eloRes.loser);
    msg.eloChange = eloRes.change;
  } else if (winner === 'B') {
    eloRes = calcEloWin(mB.score, mA.score);
    updateModelScore(mB.id, eloRes.winner);
    updateModelScore(mA.id, eloRes.loser);
    msg.eloChange = eloRes.change;
  } else {
    eloRes = calcEloDraw(mA.score, mB.score);
    updateModelScore(mA.id, eloRes.a);
    updateModelScore(mB.id, eloRes.b);
    msg.eloChange = eloRes.change;
  }

  msg.winner = winner;
  isBlind.value = false; // Nach der ersten Wertung Transparenz
};
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
}

.model-select-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.model-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-top: 0.8rem;
}

.mini-badge {
  font-size: 0.55rem;
  font-weight: 900;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
}

.mini-badge.local {
  background: rgba(0, 242, 254, 0.1);
  color: #00f2fe;
}

.mini-badge.cloud {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
}

.mini-dl-btn {
  background: #00f2fe;
  color: #000;
  border: none;
  border-radius: 4px;
  font-size: 0.55rem;
  font-weight: 900;
  padding: 0.1rem 0.3rem;
  cursor: pointer;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  border-radius: 0 0 16px 16px;
  border-top: none;
  background: rgba(15, 23, 42, 0.9);
  z-index: 10;
}

.model-select-compact {
  display: flex;
  flex-direction: column;
  flex: 1;
  max-width: 45%;
}

.model-select-compact label {
  font-size: 0.65rem;
  font-weight: bold;
  margin-bottom: 0.2rem;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.model-select-compact select {
  width: 100%;
  padding: 0.4rem;
  border-radius: 8px;
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--glass-border);
  color: #fff;
  font-size: 0.8rem;
  appearance: none;
}

.vs-badge-small {
  font-weight: 900;
  color: rgba(255,255,255,0.2);
  font-style: italic;
  font-size: 1rem;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  padding-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.empty-state {
  text-align: center;
  color: var(--text-secondary);
  padding: 4rem 1rem;
  font-style: italic;
}

.user-message {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 1rem;
  justify-content: flex-end;
}

.avatar {
  font-size: 1.5rem;
  order: 2;
}

.bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0.8rem 1.2rem;
  border-radius: 20px 20px 0 20px;
  color: white;
  font-size: 1rem;
  line-height: 1.4;
  max-width: 85%;
  box-shadow: 0 4px 15px rgba(118, 75, 162, 0.3);
  order: 1;
}

.models-response-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .models-response-container {
    grid-template-columns: 1fr 1fr;
  }
}

.model-card {
  display: flex;
  flex-direction: column;
  padding: 1.2rem;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  height: 100%;
  border: 1px solid var(--glass-border);
  position: relative;
  overflow: hidden;
}

.model-card.revealed {
  border-color: rgba(255, 255, 255, 0.1);
}

.model-card.winner {
  background: rgba(0, 242, 254, 0.05);
  border-color: rgba(0, 242, 254, 0.4);
  box-shadow: 0 0 30px rgba(0, 242, 254, 0.1);
}

.model-card.loser {
  opacity: 0.5;
  filter: grayscale(0.5);
}

.model-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.model-header-left {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.model-badge {
  padding: 0.3rem 0.7rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.05em;
}

.model-a-header .model-badge {
  background: rgba(79, 172, 254, 0.2);
  color: #4facfe;
}

.model-b-header .model-badge {
  background: rgba(161, 140, 209, 0.2);
  color: #a18cd1;
}

.model-name-display {
  font-size: 0.9rem;
  font-weight: 700;
  color: #fff;
}

.model-content {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-primary);
  white-space: pre-wrap;
  flex: 1; /* Schiebt den Footer nach unten */
  margin-bottom: 1.5rem;
}

.vote-actions {
  margin-top: 1rem;
}

.btn-vote {
  width: 100%;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-vote:hover {
  background: var(--primary-gradient);
  color: #000;
  border-color: transparent;
  transform: translateY(-2px);
}

.input-area {
  padding: 1rem;
  border-radius: 20px 20px 0 0;
  background: rgba(15, 23, 42, 0.9);
}

.loading-status {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.5rem;
  font-size: 0.85rem;
  color: #4facfe;
}

.elo-delta {
  font-size: 0.75rem;
  font-weight: 800;
  color: #00f2fe;
  background: rgba(0, 242, 254, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  letter-spacing: 0.05em;
}

.performance-stats {
  margin-top: auto;
  padding-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.8rem;
  flex-wrap: wrap;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-item {
  font-size: 0.7rem;
  color: var(--text-secondary);
  font-weight: 500;
  letter-spacing: 0.02em;
}

.btn-mini-upload {
  background: rgba(0, 242, 254, 0.1);
  border: 1px solid rgba(0, 242, 254, 0.3);
  color: #00f2fe;
  font-size: 0.65rem;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 700;
  text-transform: uppercase;
}

.btn-mini-upload:hover {
  background: rgba(0, 242, 254, 0.2);
  transform: translateY(-1px);
}

.btn-mini-upload:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.stat-uploaded {
  font-size: 0.8rem;
  color: #00f2fe;
}

.message-group {
  animation: messageSlideIn 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
}

@keyframes messageSlideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(79, 172, 254, 0.3);
  border-top-color: #4facfe;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

textarea {
  flex: 1;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 0.8rem 1rem;
  color: white;
  font-family: inherit;
  font-size: 1rem;
  resize: none;
  max-height: 100px;
}

.btn-send {
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
  color: #000;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
}
</style>
