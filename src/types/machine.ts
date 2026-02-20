/* ── Machine Configuration Types ── */

/** Symbol definition for a fruit machine */
export interface SymbolDef {
  id: string;
  name: string;
  image: string;       // base64 data URL or relative path  
  isWild: boolean;
}

/** A payline pattern — array of row indices per reel */
export interface PaylinePattern {
  id: number;
  /** Row index (0-based) for each reel column */
  cells: number[];
  color: string;
}

/** Paytable entry — payout for N matching symbols */
export interface PaytableEntry {
  symbolId: string;
  /** Keyed by match count, e.g. { 3: 40, 4: 100, 5: 500 } */
  payouts: Record<number, number>;
}

/** Full machine configuration */
export interface MachineConfig {
  name: string;
  reels: number;           // number of reel columns
  rows: number;            // visible rows per reel
  stripLength: number;     // symbols per reel strip
  symbols: SymbolDef[];
  /** Reel strips: reelStrips[reelIndex] = array of symbolIds, length = stripLength */
  reelStrips: string[][];
  paylines: PaylinePattern[];
  paytable: PaytableEntry[];
  settings: GameSettings;
}

export interface AnimationSettings {
  preset: string; // 'elastic', 'linear', 'ease-out', etc.
  durationMs: number;
  spinSpeed: number;
  bounceStrength: number;
  blurLevel: number;
}

export interface AudioEventSettings {
  enabled: boolean;
  type: 'synth' | 'file';
  fileUrl?: string;
  synthPreset?: string; 
  volume: number;
}

export interface AudioSettings {
  masterVolume: number;
  bgmEnabled: boolean;
  bgmFileUrl?: string;
  bgmVolume: number;
  events: {
    spinStart: AudioEventSettings;
    reelStop: AudioEventSettings;
    winNormal: AudioEventSettings;
    winBig: AudioEventSettings;
  };
}

export interface GameSettings {
  startCredits: number;
  betOptions: number[];
  defaultBet: number;
  animation: AnimationSettings;
  audio: AudioSettings;
}

/** Result of a single spin */
export interface SpinResult {
  stops: number[];
  grid: string[][];        // [row][reel] of symbolIds
  wins: WinResult[];
  totalWin: number;
}

export interface WinResult {
  paylineId: number;
  symbolId: string;
  matchCount: number;
  payout: number;
}

export type EditorTab =
  | 'config'
  | 'symbols'
  | 'reels'
  | 'paytable'
  | 'paylines'
  | 'animation'
  | 'audio'
  | 'simulator'
  | 'statistics';
