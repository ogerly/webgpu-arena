<template>
  <nav class="mobile-nav glass-panel">
    <button class="nav-item" :class="{ active: currentTab === 'models' }" @click="$emit('update:tab', 'models')">
      <span class="icon">🧠</span>
      <span class="label">Modelle</span>
    </button>
    <button class="nav-item" :class="{ active: currentTab === 'arena' }" @click="$emit('update:tab', 'arena')">
      <span class="icon">🏟️</span>
      <span class="label">Arena</span>
    </button>
    <button class="nav-item" :class="{ active: currentTab === 'chat' }" @click="$emit('update:tab', 'chat')">
      <span class="icon">💬</span>
      <span class="label">Chat</span>
    </button>
    <button class="nav-item" :class="{ active: currentTab === 'leaderboard' }" @click="$emit('update:tab', 'leaderboard')">
      <span class="icon">🏆</span>
      <span class="label">Rangliste</span>
    </button>
    <button class="nav-item" :class="{ active: currentTab === 'profile' }" @click="$emit('update:tab', 'profile')">
      <span class="icon">👤</span>
      <span class="label">Profil</span>
    </button>
    <button class="nav-item" :class="{ active: currentTab === 'settings' }" @click="$emit('update:tab', 'settings')">
      <span class="icon">⚙️</span>
      <span class="label">Settings</span>
    </button>
  </nav>
</template>

<script setup>
defineProps({
  currentTab: {
    type: String,
    required: true
  }
});
defineEmits(['update:tab']);
</script>

<style scoped>
.mobile-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-radius: 20px 20px 0 0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  border-bottom: none;
  border-left: none;
  border-right: none;
  overflow-x: auto;
  gap: 0.5rem;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.5);
}

.mobile-nav::-webkit-scrollbar {
  display: none;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 0.5rem;
  min-width: 60px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
}

.nav-item.active {
  color: var(--accent-color);
  background: rgba(0, 242, 254, 0.1);
}

.icon {
  font-size: 1.25rem;
  margin-bottom: 2px;
}

.label {
  font-size: 0.65rem;
  font-weight: 600;
}
</style>
