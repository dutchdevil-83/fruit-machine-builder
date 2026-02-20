import { describe, it, expect } from 'vitest';
import { validateConfig } from './configValidator';
import type { MachineConfig } from '../types/machine';

function createValidConfig(): MachineConfig {
  return {
    name: 'Test',
    reels: 3,
    rows: 3,
    stripLength: 12,
    symbols: [
      { id: 'a', name: 'A', image: '/a.png', isWild: false },
      { id: 'b', name: 'B', image: '/b.png', isWild: false },
      { id: 'w', name: 'W', image: '/w.png', isWild: true },
    ],
    reelStrips: [
      ['a', 'b', 'w', 'a', 'b', 'w', 'a', 'b', 'w', 'a', 'b', 'w'],
      ['a', 'b', 'w', 'a', 'b', 'w', 'a', 'b', 'w', 'a', 'b', 'w'],
      ['a', 'b', 'w', 'a', 'b', 'w', 'a', 'b', 'w', 'a', 'b', 'w'],
    ],
    paylines: [
      { id: 1, cells: [1, 1, 1], color: '#ff0000' },
    ],
    paytable: [
      { symbolId: 'a', payouts: { 3: 50 } },
      { symbolId: 'b', payouts: { 3: 20 } },
    ],
    settings: {
      startCredits: 1000,
      betOptions: [1, 5, 10],
      defaultBet: 1,
      animation: { preset: 'elastic', durationMs: 2000, spinSpeed: 30, bounceStrength: 0.5, blurLevel: 5 },
      audio: {
        masterVolume: 1, bgmEnabled: false, bgmVolume: 0.5,
        events: {
          spinStart: { enabled: true, type: 'synth', synthPreset: 'mechanical', volume: 0.8 },
          reelStop: { enabled: true, type: 'synth', synthPreset: 'click', volume: 0.8 },
          winNormal: { enabled: true, type: 'synth', synthPreset: 'coin', volume: 1.0 },
          winBig: { enabled: true, type: 'synth', synthPreset: 'fanfare', volume: 1.0 },
        },
      },
    },
  };
}

describe('configValidator', () => {
  it('returns valid for a complete config', () => {
    const r = validateConfig(createValidConfig());
    expect(r.overall).toBe('valid');
    expect(r.categories.symbols.status).toBe('valid');
    expect(r.categories.reels.status).toBe('valid');
    expect(r.categories.paylines.status).toBe('valid');
    expect(r.categories.paytable.status).toBe('valid');
    expect(r.categories.settings.status).toBe('valid');
  });

  it('errors when fewer than 2 symbols', () => {
    const cfg = createValidConfig();
    cfg.symbols = [{ id: 'a', name: 'A', image: '/a.png', isWild: false }];
    const r = validateConfig(cfg);
    expect(r.categories.symbols.status).toBe('error');
  });

  it('errors when symbol has no image', () => {
    const cfg = createValidConfig();
    cfg.symbols[0]!.image = '';
    const r = validateConfig(cfg);
    expect(r.categories.symbols.status).toBe('error');
  });

  it('errors when all symbols are wild', () => {
    const cfg = createValidConfig();
    cfg.symbols.forEach(s => s.isWild = true);
    const r = validateConfig(cfg);
    expect(r.categories.symbols.status).toBe('error');
  });

  it('errors when reel strip references invalid symbol', () => {
    const cfg = createValidConfig();
    cfg.reelStrips[0] = ['nonexistent', 'a', 'b'];
    const r = validateConfig(cfg);
    expect(r.categories.reels.status).toBe('error');
  });

  it('errors when no paylines', () => {
    const cfg = createValidConfig();
    cfg.paylines = [];
    const r = validateConfig(cfg);
    expect(r.categories.paylines.status).toBe('error');
  });

  it('errors when payline cells out of bounds', () => {
    const cfg = createValidConfig();
    cfg.paylines = [{ id: 1, cells: [0, 99, 0], color: '#f00' }];
    const r = validateConfig(cfg);
    expect(r.categories.paylines.status).toBe('error');
  });

  it('errors when all payouts are 0', () => {
    const cfg = createValidConfig();
    cfg.paytable = [{ symbolId: 'a', payouts: { 3: 0 } }];
    const r = validateConfig(cfg);
    expect(r.categories.paytable.status).toBe('error');
  });

  it('warns when non-wild symbol has no paytable entry', () => {
    const cfg = createValidConfig();
    cfg.paytable = [{ symbolId: 'a', payouts: { 3: 50 } }];
    // 'b' is non-wild but has no paytable entry
    const r = validateConfig(cfg);
    expect(r.categories.paytable.status).toBe('warning');
  });

  it('errors when startCredits is 0', () => {
    const cfg = createValidConfig();
    cfg.settings.startCredits = 0;
    const r = validateConfig(cfg);
    expect(r.categories.settings.status).toBe('error');
  });
});
