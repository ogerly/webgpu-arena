<template>
  <div class="chat-container">
    <div class="chat-header glass-panel">
      <div class="header-main">
        <div class="header-left">
          <div class="arena-selector-group">
            <div class="model-select-wrapper a">
              <span class="label">A</span>
              <select v-model="state.selectedModelA">
                <option v-for="m in state.availableModels" :key="'a-'+m.id" :value="m.id">
                  {{ m.name }}
                </option>
              </select>
            </div>
            <div class="vs-mini">VS</div>
            <div class="model-select-wrapper b">
              <span class="label">B</span>
              <select v-model="state.selectedModelB">
                <option v-for="m in state.availableModels" :key="'b-'+m.id" :value="m.id">
                  {{ m.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="header-right">
          <div class="category-selector">
            <select @change="applyTemplate($event.target.value)">
              <option value="">-- Prompt Vorlage --</option>
              <optgroup v-for="cat in promptCategories" :key="cat.id" :label="cat.label">
                <option v-for="(p, i) in cat.prompts" :key="i" :value="p">{{ p }}</option>
              </optgroup>
            </select>
          </div>

          <div class="blind-toggle" @click="isBlind = !isBlind" :class="{ active: isBlind }">
            <span class="icon">{{ isBlind ? '🔒' : '👁️' }}</span>
            <span class="text">Blind Test</span>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-history" ref="chatHistoryRef">
      <div v-if="state.arenaHistory.length === 0" class="empty-state animate-in">
        <div class="empty-icon">⚔️</div>
        <h3>Bereit für das Duell?</h3>
        <p>Stelle eine Frage, um den Vergleich zu starten! Die Namen der Modelle bleiben bis zur Wertung geheim.</p>
      </div>
      
      <div v-for="(msg, index) in state.arenaHistory" :key="index" class="message-group">
        <div class="user-message">
          <button class="btn-copy-bubble user-copy" @click="copyText(msg.user, $event)" title="Text kopieren">📋</button>
          <div class="bubble">{{ msg.user }}</div>
          <span class="avatar">👤</span>
        </div>
        
        <div class="models-response-container">
          <!-- Model A Card -->
          <div class="model-card glass-panel" :class="{'winner': msg.winner === 'A', 'loser': msg.winner === 'B', 'revealed': msg.winner}">
            <div class="model-header model-a-header">
              <div class="model-header-left">
                <span class="model-badge">A</span>
                <span class="model-name-display">{{ (!isBlind || msg.winner) ? msg.modelA.name : 'Modell A' }}</span>
                <span v-if="(!isBlind || msg.winner) && msg.modelA.badge" class="type-badge-mini" :class="msg.modelA.badge.toLowerCase()">{{ msg.modelA.badge }}</span>
              </div>
              <div class="model-header-right">
                <button class="btn-copy-bubble" @click="copyText(msg.modelA.content, $event)" title="Text kopieren" v-if="msg.modelA.content && !msg.modelA.generating">📋</button>
                <div v-if="msg.winner && msg.eloChange" class="reveal-info">
                  <span class="elo-delta">{{ msg.winner === 'A' ? '+' : '−' }}{{ msg.eloChange }} ELO</span>
                </div>
              </div>
            </div>

            <!-- Traits Display -->
            <div v-if="!isBlind || msg.winner" class="model-traits-mini">
              <span v-for="s in msg.modelA.strengths?.slice(0, 2)" :key="s" class="trait-mini strength">{{ s }}</span>
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
                <span class="model-name-display">{{ (!isBlind || msg.winner) ? msg.modelB.name : 'Modell B' }}</span>
                <span v-if="(!isBlind || msg.winner) && msg.modelB.badge" class="type-badge-mini" :class="msg.modelB.badge.toLowerCase()">{{ msg.modelB.badge }}</span>
              </div>
              <div class="model-header-right">
                <button class="btn-copy-bubble" @click="copyText(msg.modelB.content, $event)" title="Text kopieren" v-if="msg.modelB.content && !msg.modelB.generating">📋</button>
                <div v-if="msg.winner && msg.eloChange" class="reveal-info">
                  <span class="elo-delta">{{ msg.winner === 'B' ? '+' : '−' }}{{ msg.eloChange }} ELO</span>
                </div>
              </div>
            </div>

            <!-- Traits Display -->
            <div v-if="!isBlind || msg.winner" class="model-traits-mini">
              <span v-for="s in msg.modelB.strengths?.slice(0, 2)" :key="s" class="trait-mini strength">{{ s }}</span>
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

    <div class="input-area">
      <div v-if="state.loading" class="loading-status">
        <div class="spinner"></div>
        <span class="loading-text">{{ state.loadingStatus }}</span>
      </div>
      <StandardChatInput 
        v-model="prompt" 
        placeholder="Stelle eine Frage an beide KIs..." 
        :disabled="state.loading"
        @submit="submitPrompt"
      />
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
import StandardChatInput from '../chat/ChatInput.vue';

const prompt = ref('');
const chatHistoryRef = ref(null);
const isBlind = ref(true); // Namen standardmäßig ausblenden
const consentGranted = ref(localStorage.getItem('os_arena_ranking_consent') === 'granted');

const modelA = computed(() => state.availableModels.find(m => m.id === state.selectedModelA));
const modelB = computed(() => state.availableModels.find(m => m.id === state.selectedModelB));

const onConsentAccept = () => {
  consentGranted.value = true;
};

const copyText = async (text, event) => {
  try {
    await navigator.clipboard.writeText(text);
    const btn = event.currentTarget;
    btn.innerHTML = '✅';
    setTimeout(() => {
      btn.innerHTML = '📋';
    }, 2000);
  } catch (err) {
    console.error("Kopieren fehlgeschlagen:", err);
  }
};

const handleGlobalUpload = async (msg, modelType) => {
  const modelData = modelType === 'A' ? msg.modelA : msg.modelB;
  if (!modelData.stats || modelData.uploading) return;

  console.log("Starte Global Upload für:", modelData.name);
  console.log("Consent Status:", localStorage.getItem('os_arena_ranking_consent'));

  modelData.uploading = true;
  try {
    const result = await submitToGlobalRanking({
      modelId: modelData.id,
      modelName: modelData.name,
      tokensPerSecond: parseFloat(modelData.stats.tps),
      totalTimeMs: Math.round(parseFloat(modelData.stats.duration) * 1000)
    });

    if (!result.error) {
      console.log("Upload erfolgreich!", result.data);
      modelData.uploaded = true;
    } else {
      console.error("Upload fehlgeschlagen:", result.error);
      alert("Upload fehlgeschlagen: " + result.error);
    }
  } catch (err) {
    console.error("Unerwarteter Upload-Fehler:", err);
  } finally {
    modelData.uploading = false;
  }
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
    const durationA = (endA - startA) / 1000;
    const textA = replyA.choices[0].message.content;
    const tokensA = Math.ceil(textA.length / 3);
    const tpsA = (tokensA / durationA).toFixed(2);

    state.arenaHistory[msgIndex].modelA.content = textA;
    state.arenaHistory[msgIndex].modelA.generating = false;
    state.arenaHistory[msgIndex].modelA.stats = { tps: tpsA, duration: durationA.toFixed(2) };
    
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
  if (msg.winner) return;

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
  isBlind.value = false;
};
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  max-width: 1200px;
  margin: 0 auto;
}

.chat-header {
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  border-radius: 16px;
}

.header-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.arena-selector-group {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: rgba(255, 255, 255, 0.03);
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  border: 1px solid var(--glass-border);
}

.model-select-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.model-select-wrapper .label {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--text-secondary);
}

.model-select-wrapper select {
  background: #1e293b;
  border: none;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
}

.vs-mini {
  font-size: 0.6rem;
  font-weight: 900;
  opacity: 0.3;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.category-selector select {
  background: #1e293b;
  border: 1px solid var(--glass-border);
  color: #fff;
  padding: 0.5rem 0.8rem;
  border-radius: 10px;
  font-size: 0.85rem;
  outline: none;
  cursor: pointer;
}

.blind-toggle {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.5rem 1rem;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.blind-toggle.active {
  background: rgba(0, 242, 254, 0.1);
  border-color: rgba(0, 242, 254, 0.3);
  color: #00f2fe;
}

.blind-toggle .text {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.type-badge-mini {
  font-size: 0.6rem;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 800;
  text-transform: uppercase;
  margin-left: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.type-badge-mini.reasoning { background: rgba(168, 85, 247, 0.2); color: #a855f7; }
.type-badge-mini.speed { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
.type-badge-mini.balanced { background: rgba(20, 184, 166, 0.2); color: #14b8a6; }
.type-badge-mini.negative { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

.type-badge-mini.negative { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

.model-traits-mini {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0 1rem;
}

.trait-mini {
  font-size: 0.65rem;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.trait-mini.strength {
  color: #00f2fe;
  border-color: rgba(0, 242, 254, 0.2);
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}

.user-message {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  justify-content: flex-end;
}

.avatar {
  font-size: 1.5rem;
  margin-top: 0.5rem;
}

.bubble {
  background: rgba(79, 172, 254, 0.15);
  padding: 0.8rem 1.5rem;
  border-radius: 20px 20px 4px 20px;
  color: white;
  font-size: 1.1rem;
  line-height: 1.5;
  max-width: 80%;
  border: 1px solid rgba(79, 172, 254, 0.3);
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
  padding: 1.5rem;
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
  margin-bottom: 1.2rem;
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
}

.model-header-right {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.btn-copy-bubble {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  opacity: 0.5;
  transition: opacity 0.2s, transform 0.2s;
  padding: 0;
}

.btn-copy-bubble:hover {
  opacity: 1;
  transform: scale(1.1);
}

.user-copy {
  margin-top: 1rem;
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
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
}

.elo-delta {
  font-size: 0.75rem;
  font-weight: 800;
  color: #00f2fe;
  background: rgba(0, 242, 254, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
}

.model-content {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-primary);
  white-space: pre-wrap;
  flex: 1;
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
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-vote:hover {
  background: var(--primary-gradient);
  color: #000;
  border-color: transparent;
  transform: translateY(-2px);
}

.draw-action {
  text-align: center;
  margin-top: 1rem;
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

.input-area {
  margin-top: 1.5rem;
  position: relative;
}

.loading-status {
  position: absolute;
  top: -45px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: rgba(15, 23, 42, 0.9);
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 10;
}

.loading-text {
  font-size: 0.85rem;
  color: #4facfe;
  font-weight: 600;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 242, 254, 0.2);
  border-top-color: #00f2fe;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-group {
  animation: messageSlideIn 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
}

@keyframes messageSlideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
