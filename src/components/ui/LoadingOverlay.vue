<script setup>
import { state } from '../../state';
</script>

<template>
  <Transition name="fade">
    <div v-if="state.globalLoading" class="loading-overlay">
      <div class="glass-panel">
        <div class="spinner-container">
          <svg class="spinner" viewBox="0 0 50 50">
            <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
          </svg>
          <div class="progress-text">{{ state.globalLoadingProgress }}%</div>
        </div>
        <h3 class="status-title">System Status</h3>
        <p class="status-text">{{ state.globalLoadingStatus }}</p>
        
        <div class="progress-bar-container">
          <div 
            class="progress-bar-fill" 
            :style="{ width: state.globalLoadingProgress + '%' }"
          ></div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  padding: 2.5rem;
  border-radius: 24px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  transform: scale(1);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.spinner-container {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 1.5rem;
}

.spinner {
  animation: rotate 2s linear infinite;
  width: 100%;
  height: 100%;
}

.path {
  stroke: #4facfe;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.2rem;
  font-weight: 700;
  color: #fff;
}

.status-title {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  background: linear-gradient(90deg, #4facfe, #00f2fe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.status-text {
  margin: 0 0 1.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  height: 2.4em;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-bar-container {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #4facfe, #00f2fe);
  box-shadow: 0 0 10px rgba(79, 172, 254, 0.5);
  transition: width 0.3s ease;
}

@keyframes rotate {
  100% { transform: rotate(360deg); }
}

@keyframes dash {
  0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
  100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
