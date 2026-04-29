<template>
  <div class="app-layout">
    <!-- Global Loading Overlay -->
    <div v-if="state.globalLoading" class="global-loading-overlay glass-panel">
      <div class="spinner-large"></div>
      <h3>{{ state.globalLoadingStatus }}</h3>
      <div class="progress-container">
        <div class="progress-bar" :style="{ width: state.globalLoadingProgress + '%' }"></div>
      </div>
      <p class="progress-text">{{ state.globalLoadingProgress }}%</p>
    </div>

    <!-- Main Content Area -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </main>

    <!-- Mobile Bottom Navigation -->
    <MobileNav />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { checkCacheStatus, state } from './state.js';

// Components
import MobileNav from './components/MobileNav.vue';

onMounted(() => {
  checkCacheStatus();
});
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 100%;
  margin: 0;
  position: relative;
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  height: 100vh;
}

.global-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(15, 23, 42, 0.95) !important;
  border-radius: 0 !important;
  text-align: center;
  padding: 2rem;
}

.spinner-large {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(0, 242, 254, 0.3);
  border-top-color: #00f2fe;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 2rem;
}

.global-loading-overlay h3 {
  color: #fff;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.progress-container {
  width: 80%;
  max-width: 400px;
  height: 10px;
  background: rgba(255,255,255,0.1);
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 100%;
  background: #00f2fe;
  transition: width 0.3s ease;
}

.progress-text {
  color: var(--text-secondary);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
