import type { EditorTab } from '../types/machine';

export interface HelpEntry {
  title: string;
  description: string;
  tips: string[];
  workflowId?: string;
}

export const HELP_CONTENT: Partial<Record<EditorTab, HelpEntry>> = {
  config: {
    title: 'Machine Configuration',
    description: 'Set the fundamental structure of your fruit machine — how many reels (columns), rows (visible symbols per reel), and the length of each reel strip.',
    tips: [
      'A classic fruit machine is 3 reels × 3 rows.',
      'Vegas-style machines typically use 5 reels × 3 rows.',
      'Longer reel strips mean symbols appear less frequently, reducing hit frequency.',
      'Start credits define how much the player begins with.',
    ],
    workflowId: 'quickStart',
  },
  symbols: {
    title: 'Symbol Manager',
    description: 'Create and edit the symbols that appear on your reels. Each symbol needs a name and an image. You can mark one symbol as "Wild" — it substitutes for any other symbol on a payline.',
    tips: [
      'Use distinct, high-contrast images for easy recognition.',
      'Upload PNG images with transparent backgrounds for best results.',
      'Having 1 Wild symbol adds exciting near-miss potential.',
      'Click the image area to upload a custom symbol graphic.',
    ],
    workflowId: 'quickStart',
  },
  reels: {
    title: 'Reel Strip Designer',
    description: 'Design the actual reel strips — the ordered sequence of symbols on each reel. Drag symbols from the palette onto each reel. The order and frequency of symbols directly affects your RTP.',
    tips: [
      'More instances of a symbol on a reel = higher chance it appears.',
      'Place high-value symbols less frequently for balanced payouts.',
      'All reels must have at least as many symbols as visible rows.',
      'Use the RTP Statistics tab to verify your math after editing strips.',
    ],
  },
  paytable: {
    title: 'Paytable Editor',
    description: 'Define how much each symbol pays when matched. Set payout amounts for different match counts (e.g., 3-of-a-kind, 4-of-a-kind on 5-reel machines).',
    tips: [
      'Higher payouts for rare symbols keep the game exciting.',
      'Wild symbols typically don\'t need their own payout entry.',
      'The total expected RTP depends on symbol frequency × payout values.',
      'Gold-highlighted cells indicate non-zero payouts.',
    ],
  },
  paylines: {
    title: 'Payline Editor',
    description: 'Define the winning paths across your reels. A payline specifies which row to check on each reel. Matching symbols along a payline triggers a win.',
    tips: [
      'Start with simple horizontal lines (top, middle, bottom).',
      'Diagonal and V-shaped paylines add variety.',
      'More paylines = more chances to win per spin, but higher total bet.',
      'Use "Generate Standard" to auto-create common payline patterns.',
    ],
    workflowId: 'advancedPaylines',
  },
  animation: {
    title: 'Animation Settings',
    description: 'Customize how the reels spin and stop. Adjust speed, bounce, blur, and the overall feel of the slot machine animation.',
    tips: [
      'Higher spin speed creates a more exciting feel.',
      'Bounce adds a satisfying "landing" effect when reels stop.',
      'Blur simulates the motion of fast-spinning reels.',
      'Try different presets to find your preferred style.',
    ],
  },
  audio: {
    title: 'Audio Configuration',
    description: 'Map sounds to game events. Use the built-in synthesizer presets or upload your own MP3/WAV files. Configure background music for ambient gameplay audio.',
    tips: [
      'Click "Test Play" to preview each sound effect.',
      'The synthesizer works without any file uploads — great for quick prototyping.',
      'Background music loops continuously during gameplay.',
      'Lower the master volume without disabling individual sounds.',
    ],
  },
  simulator: {
    title: 'Live Simulator',
    description: 'Test your fruit machine in real-time! Spin the reels, see animations and sounds, track credits and wins. This is exactly how the player will experience your machine.',
    tips: [
      'Watch the win breakdown panel to verify payline logic.',
      'Adjust bet size to test different payout scenarios.',
      'Reset credits anytime to keep testing.',
      'Check the Statistics tab for mathematical accuracy over many spins.',
    ],
  },
  statistics: {
    title: 'RTP Statistics',
    description: 'Run millions of simulated spins in the background to calculate the actual Return to Player (RTP) and Hit Frequency of your machine. This runs on a separate thread so the UI stays responsive.',
    tips: [
      'RTP should typically be between 85% and 97% for a balanced game.',
      'Hit Frequency tells you how often any win occurs.',
      '100,000+ spins gives a reliable RTP estimate.',
      'Tweak reel strips and paytable, then re-run to see the impact.',
    ],
    workflowId: 'rtpTuning',
  },
};
