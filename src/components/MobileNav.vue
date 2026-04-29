<template>
  <nav class="mobile-nav glass-panel">
    <router-link to="/" class="nav-item" exact-active-class="active">
      <span class="icon">🏠</span>
      <span class="label">Home</span>
    </router-link>
    <router-link to="/models" class="nav-item" active-class="active">
      <span class="icon">🧠</span>
      <span class="label">Modelle</span>
    </router-link>
    <router-link to="/arena" class="nav-item" active-class="active">
      <span class="icon">🏟️</span>
      <span class="label">Arena</span>
    </router-link>
    <router-link to="/chat" class="nav-item" active-class="active">
      <span class="icon">💬</span>
      <span class="label">Chat</span>
    </router-link>
    <router-link to="/leaderboard" class="nav-item" active-class="active">
      <span class="icon">🏆</span>
      <span class="label">Rangliste</span>
    </router-link>
    <router-link to="/profile" class="nav-item" active-class="active">
      <span class="icon">👤</span>
      <span class="label">Profil</span>
    </router-link>
    <router-link to="/settings" class="nav-item" active-class="active">
      <span class="icon">⚙️</span>
      <span class="label">Settings</span>
    </router-link>
  </nav>
</template>

<script setup>
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
  text-decoration: none;
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
