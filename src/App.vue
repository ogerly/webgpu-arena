<template>
  <div class="app-layout">
    <!-- Global Loading Overlay -->
    <LoadingOverlay />

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
import LoadingOverlay from './components/ui/LoadingOverlay.vue';

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

.main-content {
  flex: 1;
  overflow-y: auto;
  height: 100vh;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
