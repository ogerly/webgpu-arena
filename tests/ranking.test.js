import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calcEloWin, calcEloDraw } from '../src/elo.js';
import { getOrCreateInstallId } from '../src/services/ranking/installId.js';
import { saveLocalBenchmark, getLocalBenchmarks, clearLocalBenchmarks } from '../src/services/ranking/localRanking.js';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('ELO Calculation', () => {
  it('should increase winner score and decrease loser score', () => {
    const res = calcEloWin(1200, 1000);
    expect(res.winner).toBeGreaterThan(1200);
    expect(res.loser).toBeLessThan(1000);
    expect(res.change).toBeGreaterThan(0);
  });

  it('should calculate draw correctly', () => {
    const res = calcEloDraw(1200, 1200);
    expect(res.a).toBe(1200); // Gleichstarke bleiben gleich bei Remis (je nach K-Faktor)
    expect(res.b).toBe(1200);
    expect(res.change).toBe(0);
  });
});

describe('Local Ranking Service', () => {
  beforeEach(() => {
    clearLocalBenchmarks();
  });

  it('should save and retrieve a benchmark result', () => {
    const mockResult = {
      modelId: 'test-model',
      modelName: 'Test Model',
      tokensPerSecond: 20.5,
      totalTimeMs: 1000,
      timestamp: new Date().toISOString()
    };

    saveLocalBenchmark(mockResult);
    const benchmarks = getLocalBenchmarks();
    
    expect(benchmarks.length).toBe(1);
    expect(benchmarks[0].modelId).toBe('test-model');
    expect(benchmarks[0].tokensPerSecond).toBe(20.5);
  });

  it('should limit to 50 results', () => {
    for (let i = 0; i < 60; i++) {
      saveLocalBenchmark({ modelId: `model-${i}`, tokensPerSecond: i });
    }
    const benchmarks = getLocalBenchmarks();
    expect(benchmarks.length).toBe(50);
    expect(benchmarks[0].modelId).toBe('model-59'); // Neueste zuerst
  });
});

describe('Install ID', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should generate a persistent ID', () => {
    const id1 = getOrCreateInstallId();
    const id2 = getOrCreateInstallId();
    expect(id1).toBe(id2);
    expect(id1.length).toBeGreaterThan(5);
  });
});

describe('Global Ranking Service (Mocked)', () => {
  it('should not submit without consent', async () => {
    localStorage.setItem('os_arena_ranking_consent', 'denied');
    const { submitToGlobalRanking } = await import('../src/services/ranking/globalRanking.js');
    
    const res = await submitToGlobalRanking({ modelId: 'test' });
    expect(res.error).toBe('No consent given');
  });
});
