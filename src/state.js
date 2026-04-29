import { ref, reactive } from 'vue';
import { CreateMLCEngine, hasModelInCache } from '@mlc-ai/web-llm';

export const state = reactive({
  gpuError: null,
  availableModels: [
    { id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC', name: 'Llama 3.2', size: '1B Param', cached: false, loading: false, progress: 0, score: 1200 },
    { id: 'Qwen2-1.5B-Instruct-q4f16_1-MLC', name: 'Qwen 2', size: '1.5B Param', cached: false, loading: false, progress: 0, score: 1150 },
    { id: 'TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC', name: 'TinyLlama', size: '1.1B Param', cached: false, loading: false, progress: 0, score: 1000 },
    { id: 'Gemma-2B-it-q4f16_1-MLC', name: 'Gemma', size: '2B Param', cached: false, loading: false, progress: 0, score: 1250 }
  ],
  selectedModelA: 'Qwen2-1.5B-Instruct-q4f16_1-MLC',
  selectedModelB: 'TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC',
  chatHistory: [],
  loading: false,
  loadingStatus: '',
  loadingProgress: 0,
});

const loadedEngines = {};

export async function checkCacheStatus() {
  if (!navigator.gpu) {
    state.gpuError = "Dein Browser unterstützt kein WebGPU.";
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
  
  const initProgressCallback = (progress) => {
    if (progress.progress) {
      model.progress = Math.round(progress.progress * 100);
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
  }
}

export async function getOrInitEngine(modelId) {
  if (loadedEngines[modelId]) return loadedEngines[modelId];
  
  state.loadingStatus = `Bereite ${modelId} vor...`;
  state.loadingProgress = 0;
  
  const initProgressCallback = (progress) => {
    state.loadingStatus = progress.text;
    if (progress.progress) {
      state.loadingProgress = Math.round(progress.progress * 100);
    }
  };
  
  const engine = await CreateMLCEngine(modelId, { initProgressCallback });
  loadedEngines[modelId] = engine;
  
  const modelInfo = state.availableModels.find(m => m.id === modelId);
  if (modelInfo) modelInfo.cached = true;
  
  return engine;
}
