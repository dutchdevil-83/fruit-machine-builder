import type { WorkflowDef } from '../components/WorkflowGuide';

export const quickStartWorkflow: WorkflowDef = {
  id: 'quickStart',
  title: 'Build Your First Machine',
  description: 'Follow these steps to create a fully playable fruit machine from scratch. Complete each step before moving to the next.',
  steps: [
    {
      id: 'set-grid',
      title: 'Set grid size (reels & rows)',
      description: 'Go to Machine Config and choose how many reels and rows your machine has. A classic setup is 3×3.',
      isComplete: (c) => c.reels >= 2 && c.rows >= 2,
      targetTab: 'config',
    },
    {
      id: 'add-symbols',
      title: 'Add at least 3 symbols',
      description: 'Go to Symbols and create at least 3 symbols with images. Consider making one a Wild symbol.',
      isComplete: (c) => c.symbols.length >= 3 && c.symbols.every(s => !!s.image),
      targetTab: 'symbols',
    },
    {
      id: 'fill-reels',
      title: 'Populate reel strips',
      description: 'Go to Reel Strips and drag symbols onto each reel. Each reel needs at least as many symbols as there are rows.',
      isComplete: (c) => c.reelStrips.length >= c.reels && c.reelStrips.every(s => s.length >= c.rows),
      targetTab: 'reels',
    },
    {
      id: 'set-payouts',
      title: 'Configure payouts',
      description: 'Go to Paytable and set payout values for your symbols. At least one symbol must have a payout greater than 0.',
      isComplete: (c) => c.paytable.length > 0 && c.paytable.some(e => Object.values(e.payouts).some(v => v > 0)),
      targetTab: 'paytable',
    },
    {
      id: 'add-paylines',
      title: 'Create at least 1 payline',
      description: 'Go to Paylines and define at least one winning path. Use "Generate Standard" for quick setup.',
      isComplete: (c) => c.paylines.length >= 1,
      targetTab: 'paylines',
    },
    {
      id: 'test-spin',
      title: 'Test in the Simulator',
      description: 'Head to the Simulator tab and try a few spins. Watch the reels, check the win panel, and verify everything works!',
      isComplete: () => true, // Can't detect actual spins, so always pass
      targetTab: 'simulator',
    },
    {
      id: 'check-rtp',
      title: 'Verify RTP with Statistics',
      description: 'Run a quick 10,000-spin simulation in the Statistics tab to check your RTP percentage. Aim for 85–97%.',
      isComplete: () => true,
      targetTab: 'statistics',
    },
  ],
};

export const advancedPaylinesWorkflow: WorkflowDef = {
  id: 'advancedPaylines',
  title: 'Create Complex Paylines',
  description: 'Learn to create advanced payline patterns like diagonals, V-shapes, and zigzags.',
  steps: [
    {
      id: 'open-paylines',
      title: 'Open the Payline Editor',
      description: 'Navigate to the Paylines tab to see your current payline configuration.',
      isComplete: () => true,
      targetTab: 'paylines',
    },
    {
      id: 'three-horizontal',
      title: 'Create 3 horizontal paylines',
      description: 'Click cells to create top, middle, and bottom horizontal lines across all reels.',
      isComplete: (c) => c.paylines.length >= 3,
      targetTab: 'paylines',
    },
    {
      id: 'add-diagonals',
      title: 'Add diagonal paylines',
      description: 'Create a top-left to bottom-right diagonal and its mirror. You should have at least 5 paylines now.',
      isComplete: (c) => c.paylines.length >= 5,
      targetTab: 'paylines',
    },
    {
      id: 'verify-rtp',
      title: 'Check impact on RTP',
      description: 'More paylines means more winning chances. Run a simulation to see how your RTP changed.',
      isComplete: () => true,
      targetTab: 'statistics',
    },
  ],
};

export const rtpTuningWorkflow: WorkflowDef = {
  id: 'rtpTuning',
  title: 'Tune Your RTP',
  description: 'Systematically adjust your machine to hit a target Return to Player percentage.',
  steps: [
    {
      id: 'baseline',
      title: 'Run a baseline simulation',
      description: 'Run 100,000+ spins in Statistics to establish your current RTP.',
      isComplete: () => true,
      targetTab: 'statistics',
    },
    {
      id: 'adjust-high',
      title: 'Adjust high-value symbol frequency',
      description: 'If RTP is too high, reduce copies of high-payout symbols on the reel strips. If too low, add more.',
      isComplete: () => true,
      targetTab: 'reels',
    },
    {
      id: 'adjust-payouts',
      title: 'Tweak paytable values',
      description: 'Fine-tune individual payout amounts. Small changes can have big RTP impact.',
      isComplete: (c) => c.paytable.some(e => Object.values(e.payouts).some(v => v > 0)),
      targetTab: 'paytable',
    },
    {
      id: 'retest',
      title: 'Re-run simulation',
      description: 'Run another 100,000+ spins to verify your changes moved the RTP in the right direction.',
      isComplete: () => true,
      targetTab: 'statistics',
    },
  ],
};

export const ALL_WORKFLOWS: WorkflowDef[] = [
  quickStartWorkflow,
  advancedPaylinesWorkflow,
  rtpTuningWorkflow,
];
