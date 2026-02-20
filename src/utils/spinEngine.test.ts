import { describe, it, expect } from 'vitest';
import { getRandomStops, buildGrid, evaluatePaylines } from './spinEngine';
import type { MachineConfig, SymbolDef } from '../types/machine';

const defaultSymbols: SymbolDef[] = [
  { id: 'sym_cherry', name: 'Cherry', image: '', isWild: false },
  { id: 'sym_bar', name: 'Bar', image: '', isWild: false },
  { id: 'sym_wild', name: 'Wild', image: '', isWild: true },
];

const mockConfig: MachineConfig = {
  name: 'Test Machine',
  reels: 3,
  rows: 3,
  stripLength: 10,
  symbols: defaultSymbols,
  reelStrips: [
    ['sym_cherry', 'sym_bar', 'sym_wild', 'sym_cherry', 'sym_bar', 'sym_cherry', 'sym_bar', 'sym_wild', 'sym_cherry', 'sym_bar'],
    ['sym_bar', 'sym_cherry', 'sym_wild', 'sym_bar', 'sym_cherry', 'sym_bar', 'sym_cherry', 'sym_wild', 'sym_bar', 'sym_cherry'],
    ['sym_wild', 'sym_bar', 'sym_cherry', 'sym_wild', 'sym_bar', 'sym_wild', 'sym_bar', 'sym_cherry', 'sym_wild', 'sym_bar'],
  ],
  paylines: [
    { id: 1, cells: [1, 1, 1], color: '#fff' }, // Middle row
    { id: 2, cells: [0, 0, 0], color: '#fff' }, // Top row
  ],
  paytable: [
    { symbolId: 'sym_cherry', payouts: { 3: 10, 2: 2 } },
    { symbolId: 'sym_bar', payouts: { 3: 20 } },
    { symbolId: 'sym_wild', payouts: { 3: 100 } },
  ],
  settings: { 
    startCredits: 100, 
    betOptions: [1], 
    defaultBet: 1,
    animation: {
      preset: 'elastic',
      durationMs: 2000,
      spinSpeed: 30,
      bounceStrength: 0.5,
      blurLevel: 5
    },
    audio: {
      masterVolume: 1.0,
      bgmEnabled: false,
      bgmVolume: 0.5,
      events: {
         spinStart: { enabled: true, type: 'synth', synthPreset: 'mechanical', volume: 0.8 },
         reelStop: { enabled: true, type: 'synth', synthPreset: 'click', volume: 0.8 },
         winNormal: { enabled: true, type: 'synth', synthPreset: 'coin', volume: 1.0 },
         winBig: { enabled: true, type: 'synth', synthPreset: 'fanfare', volume: 1.0 }
      }
    }
  },
};

describe('spinEngine', () => {
  describe('getRandomStops', () => {
    it('returns an array of the correct length based on reel count', () => {
      const stops = getRandomStops(5, 50);
      expect(stops).toHaveLength(5);
    });

    it('returns values bounded by strip length', () => {
      const stripLength = 12;
      for (let i = 0; i < 100; i++) {
        const stops = getRandomStops(3, stripLength);
        stops.forEach(stop => {
          expect(stop).toBeGreaterThanOrEqual(0);
          expect(stop).toBeLessThan(stripLength);
        });
      }
    });
  });

  describe('buildGrid', () => {
    it('constructs a grid accurately based on reel strips and stops', () => {
      // stops: [0, 1, 2] means:
      // Reel 0 starts at index 0: cherry, bar, wild
      // Reel 1 starts at index 1: cherry, wild, bar
      // Reel 2 starts at index 2: cherry, wild, bar
      const stops = [0, 1, 2];
      const grid = buildGrid(mockConfig, stops);
      
      expect(grid).toHaveLength(3); // 3 rows
      expect(grid[0]?.[0]).toBe('sym_cherry');
      expect(grid[0]?.[1]).toBe('sym_cherry');
      expect(grid[0]?.[2]).toBe('sym_cherry');

      expect(grid[1]?.[0]).toBe('sym_bar');
      expect(grid[1]?.[1]).toBe('sym_wild');
      expect(grid[1]?.[2]).toBe('sym_wild');

      expect(grid[2]?.[0]).toBe('sym_wild');
      expect(grid[2]?.[1]).toBe('sym_bar');
      expect(grid[2]?.[2]).toBe('sym_bar');
    });
  });

  describe('evaluatePaylines', () => {
    it('evaluates a winning payline correctly', () => {
      const stops = [0, 1, 2]; // Top row is all cherry
      const grid = buildGrid(mockConfig, stops);
      
      const wins = evaluatePaylines(mockConfig, grid, 1);
      
      // Payline 2 is top row [0,0,0], which is 3 cherries
      expect(wins).toContainEqual({
        paylineId: 2,
        symbolId: 'sym_cherry',
        matchCount: 3,
        payout: 10,
      });
    });

    it('substitutes wild symbols to complete a win', () => {
      const stops = [8, 1, 8]; 
      // Top row (row 0):
      // Reel 0 (stop 8): cherry
      // Reel 1 (stop 1): cherry
      // Reel 2 (stop 8): wild
      // This is cherry, cherry, wild => pays 3 cherries
      const grid = buildGrid(mockConfig, stops);
      const wins = evaluatePaylines(mockConfig, grid, 1);
      
      expect(wins).toContainEqual({
        paylineId: 2,
        symbolId: 'sym_cherry',
        matchCount: 3,
        payout: 10,
      });
    });

    it('multiplier scales payout linearly with bet', () => {
      const stops = [0, 1, 2]; // 3 cherries
      const grid = buildGrid(mockConfig, stops);
      
      const wins = evaluatePaylines(mockConfig, grid, 5); // Bet 5
      
      expect(wins).toContainEqual({
        paylineId: 2,
        symbolId: 'sym_cherry',
        matchCount: 3,
        payout: 50, // 10 * 5
      });
    });
    
    it('returns empty array if no wins', () => {
      // Let's force a loss. We need Cherry, Bar, Cherry.
      // Reel 0: wild
      // Reel 1: bar
      // Reel 2: bar
      // Wait, Wild, bar, bar => 3 bars! That's a win.
      // Let's force a loss. We need Cherry, Bar, Cherry.
      // Reel 0 stop 0 -> Cherry
      // Reel 1 stop 0 -> Bar
      // Reel 2 stop 0 -> Wild -> pays Cherry, Bar, Wild -> matchCount 1. No paytable entry for 1 match.
      const grid = buildGrid(mockConfig, [0, 0, 0]);
      // Let's check:
      // Payline 2 (Top row): Cherry, Bar, Wild => 1 Cherry. Payouts for cherry: 3, 2. No win.
      // Payline 1 (Middle row): Bar, Cherry, Bar => 1 Bar. Payouts for bar: 3. No win.
      // Payline is evaluated left to right.
      
      const wins = evaluatePaylines(mockConfig, grid, 1);
      expect(wins).toHaveLength(0);
    });
  });
});
