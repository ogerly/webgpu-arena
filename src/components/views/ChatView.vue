<template>
  <div class="chat-container">
    <div class="chat-header glass-panel">
      <div class="model-select-compact">
        <label>Modell A (Blau)</label>
        <select v-model="state.selectedModelA" :disabled="state.loading">
          <option v-for="m in state.availableModels" :key="'ca-'+m.id" :value="m.id">
            {{ m.cached ? '💾' : '☁️' }} {{ m.name }}
          </option>
        </select>
      </div>
      <div class="vs-badge-small">VS</div>
      <div class="model-select-compact">
        <label>Modell B (Lila)</label>
        <select v-model="state.selectedModelB" :disabled="state.loading">
          <option v-for="m in state.availableModels" :key="'cb-'+m.id" :value="m.id">
            {{ m.cached ? '💾' : '☁️' }} {{ m.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="chat-history" ref="chatHistoryRef">
      <div v-if="state.chatHistory.length === 0" class="empty-state">
        <p>Stelle eine Frage, um den Vergleich zu starten!</p>
      </div>
      
      <div v-for="(msg, index) in state.chatHistory" :key="index" class="message-group">
        <div class="user-message">
          <span class="avatar">👤</span>
          <div class="bubble">{{ msg.user }}</div>
        </div>
        
        <div class="models-response-container">
          <!-- Model A -->
          <div class="model-card glass-panel" :class="{'winner': msg.winner === 'A', 'loser': msg.winner === 'B'}">
            <div class="model-header model-a-header">
              <span class="model-badge">A</span>
              <span class="model-name-display">{{ msg.modelA.name }}</span>
            </div>
            <div class="model-content">{{ msg.modelA.content || (msg.modelA.generating ? 'Lade...' : '') }}</div>
            <div v-if="!msg.winner && msg.modelA.content && !msg.modelA.generating" class="vote-actions">
              <button class="btn btn-vote" @click="vote(index, 'A')">🏆 Besser</button>
            </div>
          </div>

          <!-- Model B -->
          <div class="model-card glass-panel" :class="{'winner': msg.winner === 'B', 'loser': msg.winner === 'A'}">
            <div class="model-header model-b-header">
              <span class="model-badge">B</span>
              <span class="model-name-display">{{ msg.modelB.name }}</span>
            </div>
            <div class="model-content">{{ msg.modelB.content || (msg.modelB.generating ? 'Lade...' : '') }}</div>
            <div v-if="!msg.winner && msg.modelB.content && !msg.modelB.generating" class="vote-actions">
              <button class="btn btn-vote" @click="vote(index, 'B')">🏆 Besser</button>
            </div>
          </div>
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
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { state, getOrInitEngine } from '../../state.js';

const prompt = ref('');
const chatHistoryRef = ref(null);

const scrollToBottom = () => {
  nextTick(() => {
    if (chatHistoryRef.value) {
      chatHistoryRef.value.scrollTop = chatHistoryRef.value.scrollHeight;
    }
  });
};

const submitPrompt = async () => {
  if (!prompt.value.trim() || state.loading) return;
  
  if (state.selectedModelA === state.selectedModelB) {
    alert("Bitte wähle zwei unterschiedliche Modelle im Arena Setup.");
    return;
  }
  
  const userText = prompt.value;
  prompt.value = '';
  
  const modelAObj = state.availableModels.find(m => m.id === state.selectedModelA);
  const modelBObj = state.availableModels.find(m => m.id === state.selectedModelB);
  
  const currentMsg = {
    user: userText,
    modelA: { id: state.selectedModelA, name: modelAObj.name, content: '', generating: true },
    modelB: { id: state.selectedModelB, name: modelBObj.name, content: '', generating: true },
    winner: null
  };
  
  state.chatHistory.push(currentMsg);
  const msgIndex = state.chatHistory.length - 1;
  scrollToBottom();
  
  state.loading = true;
  
  try {
    const engineA = await getOrInitEngine(state.selectedModelA);
    const engineB = await getOrInitEngine(state.selectedModelB);

    state.loadingStatus = "Generiere Antworten...";
    
    // Sequentielle Generierung ist sicherer für Mobile WebGPU
    const replyA = await engineA.chat.completions.create({
      messages: [{ role: "user", content: userText }]
    });
    state.chatHistory[msgIndex].modelA.content = replyA.choices[0].message.content;
    state.chatHistory[msgIndex].modelA.generating = false;
    scrollToBottom();

    const replyB = await engineB.chat.completions.create({
      messages: [{ role: "user", content: userText }]
    });
    state.chatHistory[msgIndex].modelB.content = replyB.choices[0].message.content;
    state.chatHistory[msgIndex].modelB.generating = false;
    scrollToBottom();
    
  } catch(err) {
    console.error("Generierungsfehler:", err);
    state.chatHistory[msgIndex].modelA.content = "Fehler bei der Generierung.";
    state.chatHistory[msgIndex].modelA.generating = false;
    state.chatHistory[msgIndex].modelB.content = "Fehler bei der Generierung.";
    state.chatHistory[msgIndex].modelB.generating = false;
  } finally {
    state.loading = false;
    state.loadingStatus = '';
  }
};

const vote = (index, winner) => {
  const msg = state.chatHistory[index];
  msg.winner = winner;
  
  // Update Elo/Score
  const modelA = state.availableModels.find(m => m.id === msg.modelA.id);
  const modelB = state.availableModels.find(m => m.id === msg.modelB.id);
  
  if (modelA && modelB) {
    if (winner === 'A') {
      modelA.score += 15;
      modelB.score -= 10;
    } else {
      modelB.score += 15;
      modelA.score -= 10;
    }
  }
};
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px); /* Leave space for bottom nav */
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
  appearance: none; /* remove default arrow for compact look */
}

.model-select-compact select:disabled {
  opacity: 0.5;
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
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* On slightly larger screens, show side by side */
@media (min-width: 768px) {
  .models-response-container {
    flex-direction: row;
  }
  .model-card {
    flex: 1;
  }
}

.model-card {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  transition: all 0.3s ease;
}

.model-card.loser {
  opacity: 0.6;
}

.model-card.winner {
  box-shadow: 0 0 15px rgba(0, 242, 254, 0.3);
  border-color: #00f2fe;
}

.model-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--glass-border);
}

.model-badge {
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: bold;
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
  font-size: 0.85rem;
  font-weight: 600;
}

.model-content {
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--text-primary);
  white-space: pre-wrap;
}

.vote-actions {
  margin-top: 1rem;
}

.btn-vote {
  width: 100%;
  padding: 0.6rem;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}

.input-area {
  padding: 1rem;
  border-radius: 20px 20px 0 0;
  border-bottom: none;
  border-left: none;
  border-right: none;
  background: rgba(15, 23, 42, 0.9);
}

.loading-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #00f2fe;
  font-size: 0.8rem;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 242, 254, 0.3);
  border-top-color: #00f2fe;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.input-wrapper {
  display: flex;
  gap: 0.5rem;
  align-items: center;
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

textarea:focus {
  outline: none;
  border-color: #4facfe;
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
