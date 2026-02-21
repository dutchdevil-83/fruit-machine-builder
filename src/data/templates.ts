import type { MachineConfig } from '../types/machine';

const PAYLINE_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6',
  '#e67e22', '#1abc9c', '#e91e63', '#00bcd4', '#8bc34a',
  '#ff5722', '#607d8b', '#795548', '#cddc39', '#ff9800',
  '#9c27b0', '#03a9f4', '#4caf50', '#ffc107', '#f44336',
  '#673ab7', '#00bcd4', '#8bc34a', '#ff5722', '#607d8b',
  '#795548', '#cddc39', '#ff9800', '#9c27b0', '#03a9f4'];

const defaultAudio = {
  masterVolume: 1.0, bgmEnabled: false, bgmVolume: 0.5,
  events: {
    spinStart: { enabled: true, type: 'synth' as const, synthPreset: 'mechanical', volume: 0.8 },
    reelStop: { enabled: true, type: 'synth' as const, synthPreset: 'click', volume: 0.8 },
    winNormal: { enabled: true, type: 'synth' as const, synthPreset: 'coin', volume: 1.0 },
    winBig: { enabled: true, type: 'synth' as const, synthPreset: 'fanfare', volume: 1.0 },
  },
};

const defaultInterface = {
  backgroundType: 'color' as const,
  backgroundColor: '#1a1a2e',
  cabinetColor: '#111111',
  glassOverlay: false,
  buttonStyle: 'classic' as const,
};

const defaultAnimation = {
  preset: 'elastic', durationMs: 2000, spinSpeed: 30, bounceStrength: 0.5, blurLevel: 5,
};

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  reels: number;
  rows: number;
  paylineCount: number;
  config: MachineConfig;
}

function makeStrip(symIds: string[], length: number): string[] {
  const strip: string[] = [];
  for (let i = 0; i < length; i++) strip.push(symIds[i % symIds.length]!);
  return strip;
}

export const TEMPLATES: TemplateInfo[] = [
  {
    id: 'classic_3x3',
    name: 'Classic 3×3',
    description: 'Traditional 3-reel, 3-row fruit machine with 5 paylines. Simple and timeless.',
    reels: 3, rows: 3, paylineCount: 5,
    config: {
      name: 'Classic Fruit Machine',
      reels: 3, rows: 3, stripLength: 24, minMatchCount: 3,
      symbols: [
        { id: 'sym_star', name: 'Star', image: '/images/star.png', isWild: true },
        { id: 'sym_seven', name: 'Seven', image: '/images/seven.png', isWild: false },
        { id: 'sym_bell', name: 'Bell', image: '/images/bell.png', isWild: false },
        { id: 'sym_watermelon', name: 'Watermelon', image: '/images/watermelon.png', isWild: false },
        { id: 'sym_grapes', name: 'Grapes', image: '/images/grapes.png', isWild: false },
        { id: 'sym_strawberry', name: 'Strawberry', image: '/images/strawberry.png', isWild: false },
        { id: 'sym_pear', name: 'Pear', image: '/images/pear.png', isWild: false },
        { id: 'sym_plum', name: 'Plum', image: '/images/plum.png', isWild: false },
        { id: 'sym_orange', name: 'Orange', image: '/images/orange.png', isWild: false },
      ],
      reelStrips: Array.from({ length: 3 }, () =>
        makeStrip(['sym_star', 'sym_seven', 'sym_bell', 'sym_watermelon', 'sym_grapes', 'sym_strawberry', 'sym_pear', 'sym_plum', 'sym_orange'], 24)
      ),
      paylines: [
        { id: 1, cells: [1, 1, 1], color: PAYLINE_COLORS[0]! },
        { id: 2, cells: [0, 0, 0], color: PAYLINE_COLORS[1]! },
        { id: 3, cells: [2, 2, 2], color: PAYLINE_COLORS[2]! },
        { id: 4, cells: [0, 1, 2], color: PAYLINE_COLORS[3]! },
        { id: 5, cells: [2, 1, 0], color: PAYLINE_COLORS[4]! },
      ],
      paytable: [
        { symbolId: 'sym_star', payouts: { 3: 200 } },
        { symbolId: 'sym_seven', payouts: { 3: 80 } },
        { symbolId: 'sym_bell', payouts: { 3: 40 } },
        { symbolId: 'sym_watermelon', payouts: { 3: 80 } },
        { symbolId: 'sym_grapes', payouts: { 3: 80 } },
        { symbolId: 'sym_strawberry', payouts: { 3: 80 } },
        { symbolId: 'sym_pear', payouts: { 3: 40 } },
        { symbolId: 'sym_plum', payouts: { 3: 40 } },
        { symbolId: 'sym_orange', payouts: { 3: 40 } },
      ],
      settings: { startCredits: 1000, betOptions: [1, 2, 5, 10, 20], defaultBet: 1, animation: defaultAnimation, audio: defaultAudio, interface: defaultInterface },
    },
  },
  {
    id: 'vegas_5x3',
    name: 'Vegas 5×3',
    description: '5-reel, 3-row layout with 20 paylines. Modern video slot style with higher payouts.',
    reels: 5, rows: 3, paylineCount: 20,
    config: {
      name: 'Vegas Video Slot',
      reels: 5, rows: 3, stripLength: 30, minMatchCount: 3,
      symbols: [
        { id: 'sym_star', name: 'Star', image: '/images/star.png', isWild: true },
        { id: 'sym_seven', name: 'Seven', image: '/images/seven.png', isWild: false },
        { id: 'sym_bell', name: 'Bell', image: '/images/bell.png', isWild: false },
        { id: 'sym_watermelon', name: 'Watermelon', image: '/images/watermelon.png', isWild: false },
        { id: 'sym_grapes', name: 'Grapes', image: '/images/grapes.png', isWild: false },
        { id: 'sym_strawberry', name: 'Strawberry', image: '/images/strawberry.png', isWild: false },
        { id: 'sym_pear', name: 'Pear', image: '/images/pear.png', isWild: false },
        { id: 'sym_plum', name: 'Plum', image: '/images/plum.png', isWild: false },
        { id: 'sym_orange', name: 'Orange', image: '/images/orange.png', isWild: false },
      ],
      reelStrips: Array.from({ length: 5 }, () =>
        makeStrip(['sym_star', 'sym_seven', 'sym_bell', 'sym_watermelon', 'sym_grapes', 'sym_strawberry', 'sym_pear', 'sym_plum', 'sym_orange'], 30)
      ),
      paylines: Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        cells: Array.from({ length: 5 }, (_, r) => (i + r) % 3),
        color: PAYLINE_COLORS[i % PAYLINE_COLORS.length]!,
      })),
      paytable: [
        { symbolId: 'sym_star', payouts: { 3: 100, 4: 500, 5: 2000 } },
        { symbolId: 'sym_seven', payouts: { 3: 50, 4: 200, 5: 1000 } },
        { symbolId: 'sym_bell', payouts: { 3: 25, 4: 100, 5: 500 } },
        { symbolId: 'sym_watermelon', payouts: { 3: 25, 4: 100, 5: 500 } },
        { symbolId: 'sym_grapes', payouts: { 3: 25, 4: 100, 5: 500 } },
        { symbolId: 'sym_strawberry', payouts: { 3: 25, 4: 100, 5: 500 } },
        { symbolId: 'sym_pear', payouts: { 3: 10, 4: 40, 5: 150 } },
        { symbolId: 'sym_plum', payouts: { 3: 10, 4: 40, 5: 150 } },
        { symbolId: 'sym_orange', payouts: { 3: 10, 4: 40, 5: 150 } },
      ],
      settings: { startCredits: 5000, betOptions: [1, 5, 10, 25, 50], defaultBet: 1, animation: defaultAnimation, audio: defaultAudio, interface: defaultInterface },
    },
  },
  {
    id: 'mega_5x4',
    name: 'Mega 5×4',
    description: '5 reels × 4 rows with 30 paylines. Maximum action, maximum payouts.',
    reels: 5, rows: 4, paylineCount: 30,
    config: {
      name: 'Mega Slots',
      reels: 5, rows: 4, stripLength: 36, minMatchCount: 3,
      symbols: [
        { id: 'sym_star', name: 'Star', image: '/images/star.png', isWild: true },
        { id: 'sym_seven', name: 'Seven', image: '/images/seven.png', isWild: false },
        { id: 'sym_bell', name: 'Bell', image: '/images/bell.png', isWild: false },
        { id: 'sym_watermelon', name: 'Watermelon', image: '/images/watermelon.png', isWild: false },
        { id: 'sym_grapes', name: 'Grapes', image: '/images/grapes.png', isWild: false },
        { id: 'sym_strawberry', name: 'Strawberry', image: '/images/strawberry.png', isWild: false },
        { id: 'sym_pear', name: 'Pear', image: '/images/pear.png', isWild: false },
        { id: 'sym_plum', name: 'Plum', image: '/images/plum.png', isWild: false },
        { id: 'sym_orange', name: 'Orange', image: '/images/orange.png', isWild: false },
      ],
      reelStrips: Array.from({ length: 5 }, () =>
        makeStrip(['sym_star', 'sym_seven', 'sym_bell', 'sym_watermelon', 'sym_grapes', 'sym_strawberry', 'sym_pear', 'sym_plum', 'sym_orange'], 36)
      ),
      paylines: Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        cells: Array.from({ length: 5 }, (_, r) => (i + r) % 4),
        color: PAYLINE_COLORS[i % PAYLINE_COLORS.length]!,
      })),
      paytable: [
        { symbolId: 'sym_star', payouts: { 3: 150, 4: 750, 5: 5000 } },
        { symbolId: 'sym_seven', payouts: { 3: 75, 4: 300, 5: 2000 } },
        { symbolId: 'sym_bell', payouts: { 3: 40, 4: 150, 5: 750 } },
        { symbolId: 'sym_watermelon', payouts: { 3: 40, 4: 150, 5: 750 } },
        { symbolId: 'sym_grapes', payouts: { 3: 40, 4: 150, 5: 750 } },
        { symbolId: 'sym_strawberry', payouts: { 3: 40, 4: 150, 5: 750 } },
        { symbolId: 'sym_pear', payouts: { 3: 15, 4: 60, 5: 250 } },
        { symbolId: 'sym_plum', payouts: { 3: 15, 4: 60, 5: 250 } },
        { symbolId: 'sym_orange', payouts: { 3: 15, 4: 60, 5: 250 } },
      ],
      settings: { startCredits: 10000, betOptions: [1, 5, 10, 25, 50, 100], defaultBet: 1, animation: defaultAnimation, audio: defaultAudio, interface: defaultInterface },
    },
  },
];
