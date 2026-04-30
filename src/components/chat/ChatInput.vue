<template>
  <div class="chat-input-container glass-panel">
    <div class="input-wrapper">
      <textarea 
        ref="textareaRef"
        v-model="internalValue" 
        :placeholder="placeholder" 
        :disabled="disabled"
        rows="1"
        @keydown.enter.prevent="handleEnter"
        @input="adjustHeight"
      ></textarea>
      
      <button 
        class="btn-send" 
        :disabled="disabled || !internalValue.trim()" 
        @click="submit"
      >
        <span v-if="!disabled">➤</span>
        <div v-else class="mini-spinner"></div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue';

const props = defineProps({
  modelValue: String,
  placeholder: { type: String, default: 'Schreibe eine Nachricht...' },
  disabled: Boolean
});

const emit = defineEmits(['update:modelValue', 'submit']);

const internalValue = ref(props.modelValue);
const textareaRef = ref(null);

// Sync mit externem Model
watch(() => props.modelValue, (newVal) => {
  internalValue.value = newVal;
});

watch(internalValue, (newVal) => {
  emit('update:modelValue', newVal);
});

const adjustHeight = () => {
  const textarea = textareaRef.value;
  if (!textarea) return;
  
  textarea.style.height = 'auto';
  textarea.style.height = (textarea.scrollHeight) + 'px';
};

const handleEnter = (e) => {
  if (window.innerWidth > 768) { // Auf Desktop: Senden. Auf Mobile: Neue Zeile (Standard)
    submit();
  }
};

const submit = () => {
  if (internalValue.value.trim() && !props.disabled) {
    emit('submit', internalValue.value);
    internalValue.value = '';
    nextTick(() => adjustHeight());
  }
};

onMounted(() => {
  adjustHeight();
});
</script>

<style scoped>
.chat-input-container {
  padding: 0.8rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  margin: 0.5rem;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 0.8rem;
  max-width: 1000px;
  margin: 0 auto;
}

textarea {
  flex: 1;
  background: transparent;
  border: none;
  color: #fff;
  font-family: inherit;
  font-size: 1rem;
  padding: 0.5rem;
  resize: none;
  max-height: 200px;
  outline: none;
  line-height: 1.5;
}

textarea::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.btn-send {
  width: 42px;
  height: 42px;
  min-width: 42px;
  border-radius: 50%;
  border: none;
  background: var(--primary-gradient);
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  font-size: 1.2rem;
  margin-bottom: 2px;
}

.btn-send:hover:not(:disabled) {
  transform: scale(1.1) rotate(-10deg);
  box-shadow: 0 0 15px rgba(0, 242, 254, 0.4);
}

.btn-send:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
}

.mini-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
