<template>
  <div class="app-layout">
    <!-- Main Content Area -->
    <main class="main-content">
      <keep-alive>
        <component :is="currentViewComponent" @start-battle="currentTab = 'chat'" />
      </keep-alive>
    </main>

    <!-- Mobile Bottom Navigation -->
    <MobileNav v-model:tab="currentTab" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { checkCacheStatus } from './state.js';

// Components
import MobileNav from './components/MobileNav.vue';
import ModelsView from './components/views/ModelsView.vue';
import ArenaView from './components/views/ArenaView.vue';
import ChatView from './components/views/ChatView.vue';
import LeaderboardView from './components/views/LeaderboardView.vue';
import ProfileView from './components/views/ProfileView.vue';
import SettingsView from './components/views/SettingsView.vue';

const currentTab = ref('arena');

const views = {
  models: ModelsView,
  arena: ArenaView,
  chat: ChatView,
  leaderboard: LeaderboardView,
  profile: ProfileView,
  settings: SettingsView
};

const currentViewComponent = computed(() => {
  return views[currentTab.value];
});

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
</style>
