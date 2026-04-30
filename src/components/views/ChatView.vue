<template>
  <div class="chat-container">
    <!-- Header with Single Model Selection -->
    <header class="chat-header glass-panel">
      <div class="model-selector">
        <label>Aktives Modell</label>
        <select v-model="state.selectedModelChat" :disabled="state.loading">
          <option v-for="m in state.availableModels" :key="m.id" :value="m.id">
            {{ m.cached ? '💾' : '☁️' }} {{ m.name }}
          </option>
        </select>
      </div>
      <button class="btn-clear" @click="clearChat" :disabled="state.loading || state.chatHistory.length === 0">
        🗑️ Verlauf leeren
      </button>
    </header>

    <!-- Chat History -->
    <div class="chat-scroll-area" ref="chatHistoryRef">
      <div v-if="state.chatHistory.length === 0" class="welcome-state">
        <div class="bot-icon">🤖</div>
        <h2>Bereit für deine Fragen</h2>
        <p>Wähle ein Modell aus und starte ein privates Gespräch.</p>
      </div>

      <div v-for="(msg, index) in state.chatHistory" :key="index" :class="['message-row', msg.role]">
        <div class="avatar-cell">
          <span v-if="msg.role === 'user'">👤</span>
          <span v-else>🤖</span>
        </div>
        <div class="message-content glass-panel">
          <div class="role-label">{{ msg.role === 'user' ? 'Du' : 'KI' }}</div>
          <div class="text">{{ msg.content }}</div>
          <div v-if="msg.generating" class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <footer class="input-section glass-panel">
      <div v-if="state.loading" class="status-bar">
        <div class="mini-spinner"></div>
        <span>{{ state.loadingStatus }}</span>
      </div>
      <div class="input-container">
        <textarea 
          v-model="prompt" 
          placeholder="Schreibe eine Nachricht..." 
          @keydown.enter.prevent="submitPrompt"
          :disabled="state.loading"
          rows="1"
        ></textarea>
        <button class="send-trigger" @click="submitPrompt" :disabled="state.loading || !prompt.trim()">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </div>
    </footer>
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

const clearChat = () => {
  if (confirm("Möchtest du den aktuellen Chat-Verlauf wirklich löschen?")) {
    state.chatHistory = [];
  }
};

const submitPrompt = async () => {
  if (!prompt.value.trim() || state.loading) return;
  
  const userText = prompt.value;
  prompt.value = '';
  
  // Add user message
  state.chatHistory.push({ role: 'user', content: userText });
  
  // Add placeholder for assistant
  state.chatHistory.push({ role: 'assistant', content: '', generating: true });
  const msgIndex = state.chatHistory.length - 1;
  
  scrollToBottom();
  state.loading = true;
  
  try {
    const engine = await getOrInitEngine(state.selectedModelChat);
    state.loadingStatus = "KI denkt nach...";
    
    const reply = await engine.chat.completions.create({
      messages: state.chatHistory.filter(m => !m.generating).map(m => ({ 
        role: m.role, 
        content: m.content 
      }))
    });
    
    state.chatHistory[msgIndex].content = reply.choices[0].message.content;
  } catch (err) {
    console.error("Chat Fehler:", err);
    state.chatHistory[msgIndex].content = "Entschuldigung, es gab einen Fehler bei der Inferenz: " + err.message;
  } finally {
    state.chatHistory[msgIndex].generating = false;
    state.loading = false;
    state.loadingStatus = '';
    scrollToBottom();
  }
};
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 70px);
  background: var(--bg-color);
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  border-radius: 0 0 20px 20px;
  border-top: none;
  background: rgba(15, 23, 42, 0.8);
  z-index: 10;
}

.model-selector {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.model-selector label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #4facfe;
}

.model-selector select {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 8px;
  padding: 0.4rem 0.6rem;
  font-size: 0.85rem;
  outline: none;
}

.btn-clear {
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid rgba(255, 71, 87, 0.2);
  color: #ff4757;
  padding: 0.5rem 0.8rem;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-clear:hover:not(:disabled) {
  background: rgba(255, 71, 87, 0.2);
}

.btn-clear:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.chat-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.welcome-state {
  margin: auto;
  text-align: center;
  max-width: 300px;
}

.bot-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.welcome-state h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.welcome-state p {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.message-row {
  display: flex;
  gap: 1rem;
  max-width: 85%;
}

.message-row.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.avatar-cell {
  font-size: 1.5rem;
  padding-top: 0.5rem;
}

.message-content {
  padding: 1rem 1.25rem;
  border-radius: 18px;
  position: relative;
}

.message-row.user .message-content {
  background: rgba(79, 172, 254, 0.15);
  border-color: rgba(79, 172, 254, 0.3);
  border-bottom-right-radius: 4px;
}

.message-row.assistant .message-content {
  background: rgba(255, 255, 255, 0.05);
  border-bottom-left-radius: 4px;
}

.role-label {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  margin-bottom: 0.4rem;
  opacity: 0.5;
}

.text {
  font-size: 1rem;
  line-height: 1.5;
  white-space: pre-wrap;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  margin-top: 0.5rem;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  background: #4facfe;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.input-section {
  padding: 1.25rem;
  border-radius: 24px 24px 0 0;
  background: rgba(15, 23, 42, 0.95);
  border-bottom: none;
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.75rem;
  font-size: 0.8rem;
  color: #4facfe;
  font-weight: 600;
}

.mini-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(79, 172, 254, 0.2);
  border-top-color: #4facfe;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.input-container {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
}

textarea {
  flex: 1;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 0.75rem 1rem;
  color: #fff;
  font-family: inherit;
  font-size: 1rem;
  resize: none;
  max-height: 150px;
  outline: none;
  transition: border-color 0.2s;
}

textarea:focus {
  border-color: #4facfe;
}

.send-trigger {
  width: 48px;
  height: 48px;
  background: var(--primary-gradient);
  border: none;
  border-radius: 14px;
  color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
}

.send-trigger:hover:not(:disabled) {
  transform: scale(1.05);
}

.send-trigger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
