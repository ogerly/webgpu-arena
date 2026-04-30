<template>
  <div v-if="show" class="consent-overlay">
    <div class="consent-modal glass-panel">
      <header class="consent-header">
        <span class="icon">🌍</span>
        <h3>Globales Leaderboard</h3>
      </header>
      
      <div class="consent-body">
        <p>Möchtest du dein Benchmark-Ergebnis anonym zum globalen Ranking beitragen?</p>
        
        <div class="data-info-box">
          <div class="info-group">
            <span class="label">Gesendet werden:</span>
            <ul>
              <li>Modell-Name & ID</li>
              <li>Tokens pro Sekunde (TPS)</li>
              <li>Anonyme Installations-ID</li>
              <li>Grobe Hardware-Info (GPU/Browser)</li>
            </ul>
          </div>
          
          <div class="info-group secure">
            <span class="label">NICHT gesendet werden:</span>
            <ul>
              <li>Deine Prompts</li>
              <li>Antworten der KI</li>
              <li>Persönliche Daten / IP</li>
            </ul>
          </div>
        </div>
        
        <p class="privacy-note">
          Deine Daten helfen der Community, die besten Modelle für lokale Hardware zu finden. 
          OS Arena bleibt im Kern 100% lokal.
        </p>
      </div>
      
      <footer class="consent-footer">
        <button class="btn btn-secondary" @click="decline">Nein, danke</button>
        <button class="btn btn-primary" @click="accept">Anonym beitragen</button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  modelValue: Boolean
});

const emit = defineEmits(['update:modelValue', 'accept', 'decline']);

const show = ref(false);

onMounted(() => {
  // Prüfen, ob bereits eine Entscheidung getroffen wurde
  const consent = localStorage.getItem('os_arena_ranking_consent');
  if (consent === null) {
    show.value = true;
  }
});

const accept = () => {
  localStorage.setItem('os_arena_ranking_consent', 'granted');
  show.value = false;
  emit('accept');
};

const decline = () => {
  localStorage.setItem('os_arena_ranking_consent', 'denied');
  show.value = false;
  emit('decline');
};

// Expose für manuelle Trigger
defineExpose({
  trigger: () => show.value = true
});
</script>

<style scoped>
.consent-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.consent-modal {
  max-width: 500px;
  width: 100%;
  padding: 2rem;
  border: 1px solid rgba(0, 242, 254, 0.3);
  animation: modalIn 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

@keyframes modalIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.consent-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.consent-header .icon {
  font-size: 2rem;
}

.consent-header h3 {
  margin: 0;
  font-size: 1.5rem;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.consent-body p {
  color: #fff;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.data-info-box {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-group .label {
  display: block;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.info-group ul {
  margin: 0;
  padding-left: 1.2rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.info-group.secure .label {
  color: #00f2fe;
}

.privacy-note {
  font-size: 0.8rem;
  color: var(--text-secondary) !important;
  font-style: italic;
}

.consent-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
}

.btn-primary {
  background: var(--primary-gradient);
  border: none;
  color: #000;
}

.btn-primary:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(0, 242, 254, 0.4);
}
</style>
