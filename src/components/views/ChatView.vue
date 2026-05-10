<template>
  <div class="chat-container">
    <!-- Modern Header -->
    <header class="chat-header glass-panel">
      <div class="model-info-top">
        <div class="active-label">Aktives Modell</div>
        <div class="selector-wrapper">
          <select v-model="state.selectedModelChat" :disabled="state.loading" class="modern-select">
            <optgroup label="Text-Modelle">
              <option v-for="m in textModels" :key="m.id" :value="m.id">
                {{ m.cached ? '💾' : '☁️' }} {{ m.name }}
              </option>
            </optgroup>
            <optgroup label="Bild-Modelle">
              <option v-for="m in imageModels" :key="m.id" :value="m.id">
                {{ m.cached ? '🖼️' : '☁️' }} {{ m.name }}
              </option>
            </optgroup>
          </select>
          <div v-if="selectedModel" class="status-badges">
            <span v-if="selectedModel.cached" class="badge-dot" :class="{ 'image-dot': selectedModel.type === 'image' }" title="Lokal geladen"></span>
            <button v-if="!selectedModel.cached" class="btn-download-action" @click="downloadModel(selectedModel)" :disabled="state.loading || selectedModel.loading">
              {{ selectedModel.loading ? 'Lädt...' : 'Modell laden' }}
            </button>
          </div>
        </div>
      </div>
      
      <button class="btn-icon-clear" @click="clearChat" title="Chat löschen" :disabled="state.loading || state.chatHistory.length === 0">
        🗑️
      </button>
    </header>

    <!-- Enhanced Chat Scroll Area -->
    <div class="chat-scroll-area" ref="chatHistoryRef">
      <div v-if="state.chatHistory.length === 0" class="welcome-container">
        <div class="welcome-hero">
          <div class="welcome-icon">{{ selectedModel?.type === 'image' ? '🎨' : '💬' }}</div>
          <h1>{{ selectedModel?.type === 'image' ? 'Bild-Generator' : 'Einzel-Chat' }}</h1>
          <p v-if="selectedModel?.type === 'image'">
            Beschreibe das Bild, das <strong>{{ selectedModel?.name }}</strong> für dich generieren soll.
          </p>
          <p v-else>
            Nutze die volle Power von <strong>{{ selectedModel?.name }}</strong> für deine Fragen. 100% lokal und privat.
          </p>
        </div>
        <div class="suggestions">
          <div v-for="s in currentSuggestions" :key="s" class="suggestion-chip" @click="applySuggestion(s)">
            {{ s }}
          </div>
        </div>
      </div>

      <div v-for="(msg, index) in state.chatHistory" :key="index" :class="['message-bubble-row', msg.role]">
        <div class="bubble-wrapper">
          <div class="bubble-header">
            <span class="bubble-role">{{ msg.role === 'user' ? 'Du' : selectedModel?.name }}</span>
            <button class="btn-copy-bubble" @click="copyText(msg.content, $event)" title="Text kopieren" v-if="msg.content && !msg.generating && msg.type !== 'image'">📋</button>
          </div>
          <div class="bubble-content" :class="{ 'generating': msg.generating, 'image-bubble': msg.type === 'image' }">
            <div v-if="msg.type === 'image'" class="image-message">
              <img :src="msg.content" :alt="msg.prompt" class="generated-image" @load="scrollToBottom" />
              <div class="image-actions">
                <a :href="msg.content" download="generated-image.png" class="btn-download-img">Speichern</a>
              </div>
            </div>
            <div v-else class="message-text" v-html="formatMessage(msg.content)"></div>
            <div v-if="msg.generating" class="typing-loader">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modern Input Section -->
    <footer class="input-container">
      <div v-if="state.loading" class="loading-status-bar" :class="{ 'image-loading': selectedModel?.type === 'image' }">
        <span class="pulse-dot"></span>
        {{ state.loadingStatus }}
      </div>
      <div class="input-wrapper glass-panel" :class="{ 'image-input-border': selectedModel?.type === 'image' }">
        <ChatInput 
          v-model="prompt" 
          :placeholder="selectedModel?.type === 'image' ? 'Beschreibe dein Bild (z.B. Ein Cyberpunk-Astronaut)...' : 'Frag mich etwas...'" 
          :disabled="state.loading"
          @submit="submitPrompt"
        />
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue';
import { state, getOrInitEngine, downloadModel, saveHistory } from '../../state.js';
import ChatInput from '../chat/ChatInput.vue';

const prompt = ref('');
const chatHistoryRef = ref(null);

const textModels = computed(() => state.availableModels.filter(m => m.type === 'text'));
const imageModels = computed(() => state.availableModels.filter(m => m.type === 'image'));

const suggestions = [
  "Erkläre mir Quantenphysik für Anfänger.",
  "Schreibe ein kurzes Gedicht über das Meer.",
  "Wie optimiere ich meinen JavaScript Code?",
  "Was sind die Vorteile von lokalem LLM?"
];

const imageSuggestions = [
  "Ein futuristisches Berlin im Jahr 2080, Cyberpunk-Stil",
  "Ein süßer kleiner Roboter, der eine Blume gießt, 3D Render",
  "Eine epische Berglandschaft bei Sonnenuntergang, Ölmalerei",
  "Ein Porträt eines weisen alten Mannes in einer Bibliothek"
];

const currentSuggestions = computed(() => {
  return selectedModel.value?.type === 'image' ? imageSuggestions : suggestions;
});

const selectedModel = computed(() => {
  return state.availableModels.find(m => m.id === state.selectedModelChat);
});

const scrollToBottom = () => {
  nextTick(() => {
    if (chatHistoryRef.value) {
      chatHistoryRef.value.scrollTo({
        top: chatHistoryRef.value.scrollHeight,
        behavior: 'smooth'
      });
    }
  });
};

const applySuggestion = (text) => {
  prompt.value = text;
};

const clearChat = () => {
  if (confirm("Möchtest du den aktuellen Chat-Verlauf wirklich löschen?")) {
    state.chatHistory = [];
    saveHistory();
  }
};

const copyText = async (text, event) => {
  try {
    await navigator.clipboard.writeText(text);
    const btn = event.currentTarget;
    btn.innerHTML = '✅';
    
    const hint = document.createElement('span');
    hint.textContent = 'Kopiert!';
    hint.className = 'copy-hint-float';
    btn.parentNode.appendChild(hint);
    
    setTimeout(() => {
      btn.innerHTML = '📋';
      if (hint.parentNode) hint.remove();
    }, 2000);
  } catch (err) {
    console.error("Kopieren fehlgeschlagen:", err);
  }
};

const formatMessage = (text) => {
  if (!text) return "";
  let formatted = text
    .replace(/```([\s\S]*?)```/g, '<pre class="code-block"><code>$1</code></pre>')
    .replace(/\n/g, '<br>');
  return formatted;
};

const submitPrompt = async () => {
  if (!prompt.value.trim() || state.loading) return;
  
  const userText = prompt.value;
  prompt.value = '';
  
  const isImageMode = selectedModel.value?.type === 'image';
  
  state.chatHistory.push({ role: 'user', content: userText });
  saveHistory();
  
  state.chatHistory.push({ 
    role: 'assistant', 
    content: '', 
    generating: true, 
    type: isImageMode ? 'image' : 'text',
    prompt: isImageMode ? userText : null
  });
  const msgIndex = state.chatHistory.length - 1;
  
  scrollToBottom();
  state.loading = true;
  
  try {
    const engine = await getOrInitEngine(state.selectedModelChat);
    state.loadingStatus = isImageMode ? "Generiere Bild..." : "KI berechnet Antwort...";
    
    if (isImageMode && engine.generate) {
      const imageUrl = await engine.generate(userText);
      state.chatHistory[msgIndex].content = imageUrl;
    } else {
      const messages = state.chatHistory
        .filter(m => !m.generating && m.type !== 'image')
        .map(m => ({ role: m.role, content: m.content }));

      const reply = await engine.chat.completions.create({ messages });
      state.chatHistory[msgIndex].content = reply.choices[0].message.content;
    }
    
    saveHistory();
  } catch (err) {
    console.error("Chat Fehler:", err);
    state.chatHistory[msgIndex].content = "⚠️ Fehler: " + err.message;
  } finally {
    state.chatHistory[msgIndex].generating = false;
    state.loading = false;
    state.loadingStatus = '';
    scrollToBottom();
  }
};

onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  max-width: 900px;
  margin: 0 auto;
  position: relative;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-radius: 0 0 24px 24px;
  background: rgba(15, 23, 42, 0.9);
  border-top: none;
  z-index: 100;
  margin: 0 1rem;
}

.model-info-top {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.active-label {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-secondary);
  font-weight: 800;
}

.selector-wrapper {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.modern-select {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  outline: none;
  cursor: pointer;
  padding-left: 0;
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: #00f2fe;
  border-radius: 50%;
  box-shadow: 0 0 10px #00f2fe;
}

.badge-dot.image-dot {
  background: #a855f7;
  box-shadow: 0 0 10px #a855f7;
}

.image-bubble {
  padding: 0.5rem !important;
  background: rgba(168, 85, 247, 0.05) !important;
  border-color: rgba(168, 85, 247, 0.2) !important;
}

.image-message {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.generated-image {
  width: 100%;
  max-width: 512px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  display: block;
}

.image-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-download-img {
  font-size: 0.8rem;
  font-weight: 700;
  color: #a855f7;
  text-decoration: none;
  padding: 0.4rem 0.8rem;
  background: rgba(168, 85, 247, 0.1);
  border-radius: 8px;
  transition: all 0.2s;
}

.btn-download-img:hover {
  background: rgba(168, 85, 247, 0.2);
}

.image-loading {
  color: #a855f7;
}

.image-loading .pulse-dot {
  background: #a855f7;
  box-shadow: 0 0 10px #a855f7;
}

.image-input-border {
  border-color: rgba(168, 85, 247, 0.3) !important;
}

.btn-download-action {
  background: rgba(0, 242, 254, 0.1);
  color: #00f2fe;
  border: 1px solid rgba(0, 242, 254, 0.3);
  border-radius: 8px;
  padding: 0.3rem 0.8rem;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-icon-clear {
  background: rgba(255, 255, 255, 0.05);
  border: none;
  font-size: 1.2rem;
  padding: 0.5rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon-clear:hover:not(:disabled) {
  background: rgba(255, 71, 87, 0.2);
}

.chat-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.welcome-container {
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 2rem;
}

.welcome-hero h1 {
  font-size: 2.5rem;
  margin: 1rem 0;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.welcome-hero p {
  color: var(--text-secondary);
  max-width: 400px;
  line-height: 1.6;
}

.welcome-icon {
  font-size: 4rem;
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  justify-content: center;
  max-width: 500px;
}

.suggestion-chip {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.6rem 1.2rem;
  border-radius: 100px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-chip:hover {
  background: rgba(0, 242, 254, 0.1);
  border-color: rgba(0, 242, 254, 0.3);
  transform: translateY(-2px);
}

.message-bubble-row {
  display: flex;
  width: 100%;
}

.message-bubble-row.user {
  justify-content: flex-end;
}

.bubble-wrapper {
  max-width: 85%;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.bubble-header {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin-left: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.user .bubble-header {
  margin-left: 0;
  margin-right: 1rem;
  text-align: right;
  justify-content: flex-end;
}

.btn-copy-bubble {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  opacity: 0.5;
  transition: opacity 0.2s, transform 0.2s;
  padding: 0;
}

.btn-copy-bubble:hover {
  opacity: 1;
  transform: scale(1.1);
}

/* Floating Tooltip für Copy */
:deep(.copy-hint-float) {
  position: absolute;
  right: -10px;
  top: -20px;
  background: #00f2fe;
  color: #000;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: bold;
  pointer-events: none;
  animation: floatUpFade 2s ease-out forwards;
  white-space: nowrap;
  box-shadow: 0 4px 10px rgba(0, 242, 254, 0.4);
}

@keyframes floatUpFade {
  0% { opacity: 0; transform: translateY(10px) scale(0.8); }
  15% { opacity: 1; transform: translateY(0) scale(1); }
  80% { opacity: 1; transform: translateY(-15px) scale(1); }
  100% { opacity: 0; transform: translateY(-25px) scale(0.9); }
}

.bubble-content {
  padding: 1.2rem 1.5rem;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  line-height: 1.6;
  font-size: 1.05rem;
}

.user .bubble-content {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.15), rgba(0, 242, 254, 0.05));
  border-color: rgba(0, 242, 254, 0.2);
  border-bottom-right-radius: 4px;
}

.assistant .bubble-content {
  border-bottom-left-radius: 4px;
  background: rgba(30, 41, 59, 0.4);
}

.code-block {
  background: #020617;
  padding: 1rem;
  border-radius: 12px;
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
  overflow-x: auto;
  margin: 1rem 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.input-container {
  padding: 1.5rem;
  padding-bottom: 2rem;
  background: linear-gradient(to top, var(--bg-color) 80%, transparent);
}

.input-wrapper {
  max-width: 100%;
  border-radius: 20px;
}

.loading-status-bar {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.8rem;
  margin-left: 1rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: #00f2fe;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  background: #00f2fe;
  border-radius: 50%;
  animation: pulse-ring 1.5s infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(0.8); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(0.8); opacity: 0.5; }
}

.typing-loader {
  display: flex;
  gap: 5px;
  margin-top: 1rem;
}

.typing-loader span {
  width: 8px;
  height: 8px;
  background: #00f2fe;
  border-radius: 50%;
  animation: loader-bounce 1.4s infinite ease-in-out;
}

.typing-loader span:nth-child(1) { animation-delay: -0.32s; }
.typing-loader span:nth-child(2) { animation-delay: -0.16s; }

@keyframes loader-bounce {
  0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
  40% { transform: scale(1); opacity: 1; }
}

@media (max-width: 600px) {
  .chat-container {
    height: calc(100vh - 140px);
    margin: 0;
  }
  .chat-header {
    margin: 0;
    border-radius: 0;
  }
}
</style>
