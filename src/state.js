import { ref, reactive } from 'vue';
import { CreateMLCEngine, hasModelInCache } from '@mlc-ai/web-llm';
import { modelRegistry } from './modelRegistry.js';

export const state = reactive({
  gpuError: null,
  availableModels: modelRegistry,
  selectedModelA: 'Qwen2-1.5B-Instruct-q4f16_1-MLC',
  selectedModelB: 'TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC',
  chatHistory: [],
  loading: false,
  loadingStatus: '',
  loadingProgress: 0,
  globalLoading: false,
  globalLoadingStatus: '',
  globalLoadingProgress: 0,
});

const loadedEngines = {};

export async function checkCacheStatus() {
  if (!navigator.gpu) {
    state.gpuError = "Dein Browser unterstützt kein WebGPU.";
  } else {
    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) {
        state.gpuError = "WebGPU-Adapter konnte nicht initialisiert werden.";
      }
    } catch (err) {
      state.gpuError = "Fehler bei WebGPU-Adapter-Anfrage: " + err.message;
    }
  }

  for (let model of state.availableModels) {
    try {
      model.cached = await hasModelInCache(model.id);
    } catch(e) {
      console.warn("Cache check failed for", model.id);
    }
  }
}

export async function downloadModel(model) {
  if (state.gpuError) return;

  model.loading = true;
  model.progress = 0;
  state.globalLoading = true;
  state.globalLoadingStatus = `Lade Modell: ${model.name}...`;
  
  const initProgressCallback = (progress) => {
    if (progress.progress) {
      model.progress = Math.round(progress.progress * 100);
      state.globalLoadingProgress = model.progress;
      state.globalLoadingStatus = progress.text || `Lade Modell: ${model.name}...`;
    }
  };
  
  try {
    const engine = await CreateMLCEngine(model.id, { initProgressCallback });
    model.cached = true;
    model.progress = 100;
    loadedEngines[model.id] = engine;
  } catch (err) {
    console.error("Download Error:", err);
    state.gpuError = "Fehler beim Download: " + err.message;
  } finally {
    model.loading = false;
    state.globalLoading = false;
  }
}

export async function getOrInitEngine(modelId) {
  if (loadedEngines[modelId]) return loadedEngines[modelId];
  
  state.loadingStatus = `Bereite ${modelId} vor...`;
  state.loadingProgress = 0;
  state.globalLoading = true;
  state.globalLoadingStatus = `Lade in den Arbeitsspeicher: ${modelId}...`;
  
  const initProgressCallback = (progress) => {
    state.loadingStatus = progress.text;
    state.globalLoadingStatus = progress.text;
    if (progress.progress) {
      state.loadingProgress = Math.round(progress.progress * 100);
      state.globalLoadingProgress = state.loadingProgress;
    }
  };
  
  try {
    const engine = await CreateMLCEngine(modelId, { initProgressCallback });
    loadedEngines[modelId] = engine;
    
    const modelInfo = state.availableModels.find(m => m.id === modelId);
    if (modelInfo) modelInfo.cached = true;
    
    return engine;
  } finally {
    state.globalLoading = false;
  }
}
