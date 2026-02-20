import type { MachineConfig, SpinResult, WinResult } from '../types/machine';

/** Generate cryptographically random stop indices for each reel */
export function getRandomStops(reelCount: number, stripLength: number): number[] {
  const values = new Uint32Array(reelCount);
  crypto.getRandomValues(values);
  return Array.from(values, (v) => v % stripLength);
}

/** Build the visible grid from stop positions */
export function buildGrid(config: MachineConfig, stops: number[]): string[][] {
  const grid: string[][] = [];
  for (let row = 0; row < config.rows; row++) {
    const rowSymbols: string[] = [];
    for (let reel = 0; reel < config.reels; reel++) {
      const strip = config.reelStrips[reel];
      if (!strip) { rowSymbols.push(''); continue; }
      const idx = (stops[reel]! + row) % strip.length;
      rowSymbols.push(strip[idx] ?? '');
    }
    grid.push(rowSymbols);
  }
  return grid;
}

/** Evaluate all paylines and return wins */
export function evaluatePaylines(config: MachineConfig, grid: string[][], bet: number): WinResult[] {
  const wins: WinResult[] = [];
  const wildIds = new Set(config.symbols.filter(s => s.isWild).map(s => s.id));

  for (const payline of config.paylines) {
    // Extract symbols along this payline
    const lineSymbols: string[] = [];
    for (let reel = 0; reel < config.reels; reel++) {
      const row = payline.cells[reel];
      if (row === undefined) continue;
      lineSymbols.push(grid[row]?.[reel] ?? '');
    }

    // Find the first non-wild, non-empty symbol
    const baseSymbol = lineSymbols.find(s => s !== '' && !wildIds.has(s));
    if (!baseSymbol) {
      // All wilds or empty — check if all are wilds
      if (lineSymbols.every(s => wildIds.has(s) && s !== '')) {
        // All wilds win — use the highest-paying wild
        const wildPayouts = config.paytable.find(pt => wildIds.has(pt.symbolId));
        if (wildPayouts) {
          const payout = wildPayouts.payouts[lineSymbols.length];
          if (payout) {
            wins.push({
              paylineId: payline.id,
              symbolId: wildPayouts.symbolId,
              matchCount: lineSymbols.length,
              payout: payout * bet,
            });
          }
        }
      }
      continue;
    }

    // Count matches from left (with wild substitution)
    let matchCount = 0;
    for (const sym of lineSymbols) {
      if (sym === baseSymbol || wildIds.has(sym)) {
        matchCount++;
      } else {
        break;
      }
    }

    // Look up payout
    const ptEntry = config.paytable.find(pt => pt.symbolId === baseSymbol);
    if (ptEntry) {
      const payout = ptEntry.payouts[matchCount];
      if (payout) {
        wins.push({
          paylineId: payline.id,
          symbolId: baseSymbol,
          matchCount,
          payout: payout * bet,
        });
      }
    }
  }

  return wins;
}

/** Perform a full spin: generate stops, build grid, evaluate wins */
export function spin(config: MachineConfig, bet: number): SpinResult {
  const stops = getRandomStops(config.reels, config.stripLength);
  const grid = buildGrid(config, stops);
  const wins = evaluatePaylines(config, grid, bet);
  const totalWin = wins.reduce((sum, w) => sum + w.payout, 0);
  return { stops, grid, wins, totalWin };
}
