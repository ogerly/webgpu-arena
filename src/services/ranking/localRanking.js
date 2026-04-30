// localRanking.js
// Verwaltet die lokal auf dem Gerät gespeicherten Benchmark-Ergebnisse.

const LOCAL_BENCHMARKS_KEY = 'os_arena_local_benchmarks';

/**
 * Speichert ein neues Benchmark-Ergebnis lokal.
 * @param {import('./rankingTypes').BenchmarkResult} result 
 */
export function saveLocalBenchmark(result) {
  const existing = getLocalBenchmarks();
  existing.unshift(result); // Neueste zuerst
  
  // Wir behalten nur die letzten 50 Ergebnisse lokal
  const limited = existing.slice(0, 50);
  localStorage.setItem(LOCAL_BENCHMARKS_KEY, JSON.stringify(limited));
}

/**
 * Holt alle lokalen Benchmarks.
 * @returns {Array<import('./rankingTypes').BenchmarkResult>}
 */
export function getLocalBenchmarks() {
  const saved = localStorage.getItem(LOCAL_BENCHMARKS_KEY);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch (e) {
    console.error("Fehler beim Laden der Benchmarks:", e);
    return [];
  }
}

/**
 * Löscht alle lokalen Benchmarks.
 */
export function clearLocalBenchmarks() {
  localStorage.removeItem(LOCAL_BENCHMARKS_KEY);
}
