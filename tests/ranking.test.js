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

describe('Global Ranking Service (Integration)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
    // Mock import.meta.env
    vi.stubGlobal('import.meta', {
      env: { VITE_SUPABASE_URL: 'https://test-project.supabase.co' }
    });
  });

  it('should not submit without consent', async () => {
    localStorage.setItem('os_arena_ranking_consent', 'denied');
    const { submitToGlobalRanking } = await import('../src/services/ranking/globalRanking.js');
    
    const res = await submitToGlobalRanking({ modelId: 'test' });
    expect(res.error).toBe('No consent given');
  });

  it('should call fetch with correct URL and payload', async () => {
    localStorage.setItem('os_arena_ranking_consent', 'granted');
    const { submitToGlobalRanking } = await import('../src/services/ranking/globalRanking.js');
    
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    const mockResult = {
      modelId: 'test-id',
      modelName: 'Test Model',
      tokensPerSecond: 15.5,
      totalTimeMs: 2000
    };

    const res = await submitToGlobalRanking(mockResult);

    expect(fetch).toHaveBeenCalledWith(
      'https://test-project.supabase.co/functions/v1/os-arena-ranking-handler',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' })
      })
    );

    const callBody = JSON.parse(fetch.mock.calls[0][1].body);
    expect(callBody.model_id).toBe('test-id');
    expect(callBody.tokens_per_second).toBe(15.5);
    expect(res.data.success).toBe(true);
  });

  it('should handle API errors gracefully', async () => {
    localStorage.setItem('os_arena_ranking_consent', 'granted');
    const { submitToGlobalRanking } = await import('../src/services/ranking/globalRanking.js');
    
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: 'Internal Server Error' })
    });

    const res = await submitToGlobalRanking({ modelId: 'test' });
    expect(res.error).toContain('Internal Server Error');
  });
});
