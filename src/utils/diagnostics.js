// src/utils/diagnostics.js
import { hasModelInCache } from '@mlc-ai/web-llm';
import { state } from '../state.js';

export async function runModelDiagnostics() {
  console.log("🚀 Starte OS-Arena Modell-Diagnose...");
  console.log("------------------------------------");
  
  const results = [];
  
  for (const model of state.availableModels) {
    console.log(`Prüfe ${model.name} (${model.id})...`);
    try {
      const cached = await hasModelInCache(model.id);
      console.log(`  - Status: ${cached ? '✅ Im Cache' : '☁️ Nicht im Cache (muss geladen werden)'}`);
      results.push({ name: model.name, id: model.id, status: 'OK', cached });
    } catch (err) {
      console.error(`  - ❌ FEHLER bei ${model.name}:`, err.message);
      results.push({ name: model.name, id: model.id, status: 'ERROR', error: err.message });
    }
  }
  
  console.log("------------------------------------");
  console.log("Diagnose abgeschlossen.");
  console.table(results);
  return results;
}

export async function checkModelConnectivity() {
  console.log("🌐 Prüfe Netzwerk-Erreichbarkeit der Modelle...");
  const results = [];
  
  for (const model of state.availableModels) {
    // MLC Standard Pfad auf HuggingFace
    const baseUrl = `https://huggingface.co/mlc-ai/${model.id}/resolve/main/config.json`;
    
    try {
      const response = await fetch(baseUrl, { method: 'HEAD' });
      const status = response.ok ? '✅ Erreichbar' : `❌ Fehler (${response.status})`;
      console.log(`${model.name}: ${status}`);
      results.push({ name: model.name, status });
    } catch (err) {
      console.error(`${model.name}: ❌ Netzwerkfehler`, err.message);
      results.push({ name: model.name, status: '❌ Netzwerkfehler' });
    }
  }
  return results;
}

// Global verfügbar machen
if (typeof window !== 'undefined') {
  window.runArenaDiagnostics = runModelDiagnostics;
  window.testModelNetwork = checkModelConnectivity;
}
