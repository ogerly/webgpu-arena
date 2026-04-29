import { createRouter, createWebHistory } from 'vue-router';

import HomeView from '../components/views/HomeView.vue';
import ModelsView from '../components/views/ModelsView.vue';
import ArenaView from '../components/views/ArenaView.vue';
import ChatView from '../components/views/ChatView.vue';
import LeaderboardView from '../components/views/LeaderboardView.vue';
import ProfileView from '../components/views/ProfileView.vue';
import SettingsView from '../components/views/SettingsView.vue';

const routes = [
  { path: '/', component: HomeView },
  { path: '/models', component: ModelsView },
  { path: '/arena', component: ArenaView },
  { path: '/chat', component: ChatView },
  { path: '/leaderboard', component: LeaderboardView },
  { path: '/profile', component: ProfileView },
  { path: '/settings', component: SettingsView }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
