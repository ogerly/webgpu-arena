import { describe, it, expect } from 'vitest';
import { modelRegistry } from '../src/modelRegistry.js';

describe('Model Registry Validation', () => {
  it('should have a valid array of models', () => {
    expect(Array.isArray(modelRegistry)).toBe(true);
    expect(modelRegistry.length).toBeGreaterThan(0);
  });

  it('should have unique model IDs', () => {
    const ids = modelRegistry.map(m => m.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('should follow MLC naming convention for all IDs', () => {
    // MLC IDs end with the quantization/format suffix
    modelRegistry.forEach(model => {
      expect(model.id).toMatch(/-q[0-9]f[0-9]+(_[0-9])?-MLC$/);
    });
  });

  it('should have required UI metadata', () => {
    modelRegistry.forEach(model => {
      expect(model.name).toBeDefined();
      expect(model.size).toBeDefined();
      expect(model.category).toBeDefined();
    });
  });
});
