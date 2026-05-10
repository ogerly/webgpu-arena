import { ref, reactive } from 'vue';
import { CreateMLCEngine, hasModelInCache } from '@mlc-ai/web-llm';
import { modelRegistry } from './modelRegistry.js';

export const state = reactive({
  gpuError: null,
  availableModels: modelRegistry,
  selectedModelA: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
  selectedModelB: 'TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC',
  selectedModelChat: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
  arenaHistory: [],
  chatHistory: [],
  loading: false,
  loadingStatus: '',
  loadingProgress: 0,
  globalLoading: false,
  globalLoadingStatus: '',
  globalLoadingProgress: 0,
  // neue Props für System-Info
  gpuInfo: null,                      // {supported: bool, adapterInfo: string}
  ramInfo: null,                      // {totalMB: number, usedMB: number}
});

const loadedEngines = {};

export async function checkCacheStatus() {
  // RAM Info (falls unterstützt)
  if (performance.memory) {
    state.ramInfo = {
      totalMB: Math.round(performance.memory.jsHeapSizeLimit / (1024 * 1024)),
      usedMB: Math.round(performance.memory.usedJSHeapSize / (1024 * 1024))
    };
  }

  if (!navigator.gpu) {
    state.gpuError = "Dein Browser unterstützt kein WebGPU.";
    state.gpuInfo = { supported: false, adapterInfo: "WebGPU nicht unterstützt" };
  } else {
    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) {
        state.gpuError = "WebGPU-Adapter konnte nicht initialisiert werden.";
        state.gpuInfo = { supported: false, adapterInfo: "Kein Adapter gefunden" };
      } else {
        // Erfolgreich initialisiert
        state.gpuError = null;
        let gpuName = "Unbekannte GPU";
        
        try {
          if (typeof adapter.requestAdapterInfo === 'function') {
            const info = await adapter.requestAdapterInfo();
            gpuName = info.description || info.vendor || gpuName;
          } else if (adapter.info) {
            gpuName = adapter.info.description || adapter.info.vendor || gpuName;
          }
        } catch (e) {
          console.warn("Konnte GPU-Details nicht abrufen:", e);
        }

        state.gpuInfo = { 
          supported: true, 
          adapterInfo: gpuName
        };
      }
    } catch (err) {
      state.gpuError = "Fehler bei WebGPU-Adapter-Anfrage: " + err.message;
      state.gpuInfo = { supported: false, adapterInfo: err.message };
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

async function loadTextModelInternal(model, progressCallback) {
  return await CreateMLCEngine(model.id, { initProgressCallback: progressCallback });
}

async function loadImageModelInternal(model, progressCallback) {
  // TODO: Hier die ONNX/Transformers.js Pipeline für Bildmodelle implementieren
  // Ziel: 100% Offline-Fähigkeit via WebGPU
  console.log(`🖼️ Initialisiere lokale Image-Pipeline für: ${model.name}`);
  
  // Simuliere Ladevorgang
  for (let i = 0; i <= 100; i += 20) {
    if (progressCallback) progressCallback({ progress: i / 100, text: `Lade Pipeline Gewichte... ${i}%` });
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Mock Engine für T2I (Lokal)
  return {
    type: 'image',
    generate: async (prompt) => {
      console.log("Generiere Bild lokal (WebGPU Simulation) für:", prompt);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Lokale Generierung eines Platzhalters (Offline-beweis)
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      
      // Noise Background
      const imageData = ctx.createImageData(512, 512);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const val = Math.random() * 255;
        imageData.data[i] = val;
        imageData.data[i+1] = val;
        imageData.data[i+2] = val + 50; // Blau-Stich
        imageData.data[i+3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);
      
      // Overlay Info
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(0, 400, 512, 112);
      ctx.fillStyle = "#00f2fe";
      ctx.font = "bold 18px Inter, sans-serif";
      ctx.fillText("LOKALE WEBGPU GENERIERUNG", 20, 440);
      ctx.fillStyle = "white";
      ctx.font = "14px Inter, sans-serif";
      ctx.fillText(`Modell: ${model.name}`, 20, 465);
      ctx.fillText(`Prompt: ${prompt.substring(0, 50)}...`, 20, 490);
      
      return canvas.toDataURL();
    }
  };
}

export async function downloadModel(model) {
  if (state.gpuInfo && !state.gpuInfo.supported) {
    console.error("Download abgebrochen: WebGPU nicht unterstützt.");
    return;
  }

  model.loading = true;
  model.progress = 0;
  model.error = null;
  state.globalLoading = true;
  state.globalLoadingStatus = `Lade Modell: ${model.name}...`;
  
  const initProgressCallback = (progress) => {
    if (progress.progress !== undefined) {
      model.progress = Math.round(progress.progress * 100);
      state.globalLoadingProgress = model.progress;
      state.globalLoadingStatus = progress.text || `Lade Modell: ${model.name}...`;
    }
  };
  
  try {
    let engine;
    if (model.type === 'image') {
      engine = await loadImageModelInternal(model, initProgressCallback);
    } else {
      engine = await loadTextModelInternal(model, initProgressCallback);
    }
    
    model.cached = true;
    model.progress = 100;
    loadedEngines[model.id] = engine;
    console.log(`✅ ${model.name} erfolgreich geladen.`);
  } catch (err) {
    console.error(`❌ Download-Fehler für ${model.name}:`, err);
    model.error = err.message;
    alert(`Fehler beim Laden von ${model.name}: ${err.message}`);
  } finally {
    model.loading = false;
    state.globalLoading = false;
  }
}

export async function getOrInitEngine(modelId) {
  if (loadedEngines[modelId]) return loadedEngines[modelId];
  
  const modelInfo = state.availableModels.find(m => m.id === modelId);
  console.log(`🤖 Initialisiere Engine für: ${modelId} (Typ: ${modelInfo?.type})`);
  
  state.loadingStatus = `Bereite ${modelInfo?.name || modelId} vor...`;
  state.loadingProgress = 0;
  state.globalLoading = true;
  state.globalLoadingStatus = `Lade in den Arbeitsspeicher: ${modelInfo?.name || modelId}...`;
  
  const initProgressCallback = (progress) => {
    state.loadingStatus = progress.text;
    state.globalLoadingStatus = progress.text;
    if (progress.progress) {
      state.loadingProgress = Math.round(progress.progress * 100);
      state.globalLoadingProgress = state.loadingProgress;
    }
  };
  
  try {
    let engine;
    if (modelInfo?.type === 'image') {
      engine = await loadImageModelInternal(modelInfo, initProgressCallback);
    } else {
      engine = await loadTextModelInternal(modelInfo || {id: modelId}, initProgressCallback);
    }
    
    loadedEngines[modelId] = engine;
    if (modelInfo) modelInfo.cached = true;
    
    return engine;
  } finally {
    state.globalLoading = false;
  }
}

// Score Management
export function loadScores() {
  try {
    let saved = localStorage.getItem('webgpu-arena-scores');
    if (!saved) {
      saved = localStorage.getItem('os-arena-scores');
      if (saved) localStorage.setItem('webgpu-arena-scores', saved);
    }
    if (saved) {
      const scores = JSON.parse(saved);
      state.availableModels.forEach(m => {
        if (scores[m.id] !== undefined) {
          m.score = scores[m.id];
        }
      });
      console.log("Scores geladen:", scores);
    }
  } catch (e) {
    console.warn("Fehler beim Laden der Scores:", e);
  }
}

export function saveScores() {
  const scores = {};
  state.availableModels.forEach(m => {
    scores[m.id] = m.score;
  });
  localStorage.setItem('webgpu-arena-scores', JSON.stringify(scores));
}

export function updateModelScore(modelId, newScore) {
  const model = state.availableModels.find(m => m.id === modelId);
  if (model) {
    console.log(`ELO Update für ${modelId}: ${model.score} -> ${newScore}`);
    model.score = newScore;
    saveScores();
  } else {
    console.warn(`Modell ${modelId} nicht im State gefunden für Score-Update!`);
  }
}

// Chat Persistence
export function saveHistory() {
  localStorage.setItem('webgpu-arena-chat-history', JSON.stringify(state.chatHistory));
  localStorage.setItem('webgpu-arena-arena-history', JSON.stringify(state.arenaHistory));
}

export function loadHistory() {
  try {
    let chat = localStorage.getItem('webgpu-arena-chat-history');
    if (!chat) {
      chat = localStorage.getItem('os-arena-chat-history');
      if (chat) localStorage.setItem('webgpu-arena-chat-history', chat);
    }
    if (chat) state.chatHistory = JSON.parse(chat);
    
    let arena = localStorage.getItem('webgpu-arena-arena-history');
    if (!arena) {
      arena = localStorage.getItem('os-arena-arena-history');
      if (arena) localStorage.setItem('webgpu-arena-arena-history', arena);
    }
    if (arena) state.arenaHistory = JSON.parse(arena);
  } catch (e) {
    console.warn("Fehler beim Laden der Historie:", e);
  }
}

// Initialer Check & Score-Load
export async function initAppState() {
  console.log("🛠️ Initialisiere WebGPU-Arena State...");
  try {
    loadScores();
    loadHistory();
    await checkCacheStatus();
    console.log("✅ State erfolgreich initialisiert.");
  } catch (err) {
    console.error("❌ Fehler bei der State-Initialisierung:", err);
  }
}

// Sofortiger Aufruf, aber als Task
initAppState();
