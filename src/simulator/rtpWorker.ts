import { spin } from '../utils/spinEngine';
import type { MachineConfig } from '../types/machine';

export type WorkerMessage =
  | { type: 'START'; config: MachineConfig; iterations: number }
  | { type: 'STOP' };

export type WorkerResponse =
  | { type: 'PROGRESS'; progress: number; currentRtp: number }
  | { type: 'RESULT'; rtp: number; hitFrequency: number; maxWin: number; totalCost: number; totalWon: number };

let isRunning = false;

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { data } = e;

  if (data.type === 'START') {
    isRunning = true;
    runSimulation(data.config, data.iterations);
  } else if (data.type === 'STOP') {
    isRunning = false;
  }
};

function runSimulation(config: MachineConfig, iterations: number) {
  let totalCost = 0;
  let totalWon = 0;
  let hits = 0;
  let maxWin = 0;
  
  const bet = config.settings.defaultBet || 1;
  const costPerSpin = bet * config.paylines.length;

  const BATCH_SIZE = 10000;
  let i = 0;

  function doBatch() {
    if (!isRunning) return;

    let localCost = 0;
    let localWon = 0;
    let localHits = 0;
    let localMax = maxWin;

    const end = Math.min(i + BATCH_SIZE, iterations);
    
    for (; i < end; i++) {
       const res = spin(config, bet);
       localCost += costPerSpin;
       localWon += res.totalWin;
       if (res.totalWin > 0) {
          localHits++;
          if (res.totalWin > localMax) localMax = res.totalWin;
       }
    }

    totalCost += localCost;
    totalWon += localWon;
    hits += localHits;
    maxWin = localMax;

    // Report progress every batch
    const p = i / iterations;
    const currentRtp = totalCost > 0 ? (totalWon / totalCost) * 100 : 0;
    
    self.postMessage({ type: 'PROGRESS', progress: p, currentRtp } as WorkerResponse);

    if (i < iterations) {
      // Use setTimeout to yield back to event loop to accept STOP messages
      setTimeout(doBatch, 0);
    } else {
      // Finished
      const finalRtp = totalCost > 0 ? (totalWon / totalCost) * 100 : 0;
      const hitFrequency = (hits / iterations) * 100;

      self.postMessage({ 
         type: 'RESULT', 
         rtp: finalRtp, 
         hitFrequency, 
         maxWin,
         totalCost,
         totalWon
      } as WorkerResponse);
      isRunning = false;
    }
  }

  doBatch();
}
