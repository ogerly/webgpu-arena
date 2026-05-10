import { runMatMulGPU } from './gpuBenchmark.js';
import CpuWorker from './cpuWorker.js?worker';

/**
 * Startet den MatMul Benchmark für GPU und CPU.
 * @param {number} size - Matrix Größe (NxN)
 * @param {Function} onProgress - Callback für Status-Updates
 * @returns {Promise<{cpuMs: number, gpuMs: number}>}
 */
export async function runMatMulBenchmark(size = 512, onProgress) {
  const results = { cpuMs: 0, gpuMs: 0 };
  
  // 1. GPU Benchmark
  if (onProgress) onProgress("Starte WebGPU MatMul (Shader Compilation)...");
  try {
    results.gpuMs = await runMatMulGPU(size);
  } catch (err) {
    if (onProgress) onProgress(`WebGPU Fehler: ${err.message}`);
    console.error(err);
  }
  
  // 2. CPU Benchmark (via Worker um Blockierung zu vermeiden)
  if (onProgress) onProgress("Starte CPU Referenz-Test (Web Worker)...");
  
  return new Promise((resolve) => {
    const worker = new CpuWorker();
    
    worker.onmessage = (e) => {
      if (e.data.type === 'result') {
        results.cpuMs = e.data.timeMs;
        worker.terminate();
        if (onProgress) onProgress("Benchmark abgeschlossen!");
        resolve(results);
      }
    };
    
    worker.postMessage({ type: 'matmul', size });
  });
}
