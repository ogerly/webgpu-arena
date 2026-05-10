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

  it('should follow naming conventions', () => {
    modelRegistry.forEach(model => {
      if (model.type === 'text') {
        // MLC IDs end with the quantization/format suffix
        expect(model.id).toMatch(/-q[0-9]f[0-9]+(_[0-9])?-MLC$/);
      } else {
        // T2I models follow HF repo/model or webgpu pattern
        expect(model.id).toMatch(/^[\w.-]+\/[\w.-]+|.*-webgpu.*$/);
      }
    });
  });

  it('should have a valid type', () => {
    modelRegistry.forEach(model => {
      expect(['text', 'image']).toContain(model.type);
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
