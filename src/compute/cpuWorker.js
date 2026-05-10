// Web Worker für CPU Benchmarks
// Läuft in einem separaten Thread, damit die Vue UI nicht einfriert.

self.onmessage = function(e) {
  const { type, size } = e.data;
  
  if (type === 'matmul') {
    const start = performance.now();
    
    // Mock-Daten
    const a = new Float32Array(size * size).fill(1.0);
    const b = new Float32Array(size * size).fill(1.0);
    const result = new Float32Array(size * size);
    
    // CPU Matrix-Multiplikation (Brute Force)
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        let sum = 0;
        for (let k = 0; k < size; k++) {
          sum += a[i * size + k] * b[k * size + j];
        }
        result[i * size + j] = sum;
      }
    }
    
    const timeMs = performance.now() - start;
    self.postMessage({ type: 'result', timeMs });
  }
};
