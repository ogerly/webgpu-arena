<template>
  <div class="view-container">
    <header class="view-header">
      <h2>Profil</h2>
      <p>Deine lokale Arena-Identität</p>
    </header>

    <div class="profile-card glass-panel">
      <div class="avatar-large">👤</div>
      <h3 class="username">Lokaler Nutzer</h3>
      <p class="stats">Vergleiche: {{ state.chatHistory.length }}</p>
    </div>
  </div>
</template>

<script setup>
import { state } from '../../state.js';
</script>

<style scoped>
.view-container {
  padding: 1.5rem;
  padding-bottom: 80px;
}

.view-header {
  margin-bottom: 2rem;
  text-align: center;
}

.view-header h2 {
  font-size: 2.5rem;
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.view-header p {
  color: var(--text-secondary);
}

.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 2rem;
}

.avatar-large {
  font-size: 5rem;
  background: rgba(0, 242, 254, 0.1);
  border: 2px solid #00f2fe;
  border-radius: 50%;
  width: 120px;
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.5rem;
}

.username {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.stats {
  color: var(--text-secondary);
}
</style>
