import type { MachineConfig } from '../types/machine';

export type ValidationStatus = 'valid' | 'warning' | 'error';

export interface CategoryValidation {
  status: ValidationStatus;
  messages: string[];
}

export interface ValidationResult {
  overall: ValidationStatus;
  categories: {
    symbols: CategoryValidation;
    reels: CategoryValidation;
    paylines: CategoryValidation;
    paytable: CategoryValidation;
    settings: CategoryValidation;
  };
}

function worstStatus(a: ValidationStatus, b: ValidationStatus): ValidationStatus {
  if (a === 'error' || b === 'error') return 'error';
  if (a === 'warning' || b === 'warning') return 'warning';
  return 'valid';
}

function validateSymbols(config: MachineConfig): CategoryValidation {
  const msgs: string[] = [];
  let status: ValidationStatus = 'valid';

  if (config.symbols.length < 2) {
    msgs.push('Need at least 2 symbols.');
    status = 'error';
  }

  const noImage = config.symbols.filter(s => !s.image);
  if (noImage.length > 0) {
    msgs.push(`${noImage.length} symbol(s) missing image: ${noImage.map(s => s.name).join(', ')}.`);
    status = 'error';
  }

  const nonWild = config.symbols.filter(s => !s.isWild);
  if (nonWild.length === 0 && config.symbols.length > 0) {
    msgs.push('All symbols are Wild — need at least 1 non-Wild symbol.');
    status = 'error';
  }

  const ids = config.symbols.map(s => s.id);
  const uniqueIds = new Set(ids);
  if (uniqueIds.size !== ids.length) {
    msgs.push('Duplicate symbol IDs detected.');
    status = 'error';
  }

  if (status === 'valid') msgs.push(`${config.symbols.length} symbols configured.`);
  return { status, messages: msgs };
}

function validateReels(config: MachineConfig): CategoryValidation {
  const msgs: string[] = [];
  let status: ValidationStatus = 'valid';
  const validSymIds = new Set(config.symbols.map(s => s.id));

  if (config.reelStrips.length < config.reels) {
    msgs.push(`Expected ${config.reels} reel strips, found ${config.reelStrips.length}.`);
    status = 'error';
  }

  for (let i = 0; i < config.reelStrips.length; i++) {
    const strip = config.reelStrips[i]!;

    if (strip.length < config.rows) {
      msgs.push(`Reel ${i + 1}: strip length (${strip.length}) is less than visible rows (${config.rows}).`);
      status = 'error';
    }

    if (strip.length === 0) {
      msgs.push(`Reel ${i + 1}: strip is empty.`);
      status = 'error';
      continue;
    }

    const invalid = strip.filter(id => !validSymIds.has(id));
    if (invalid.length > 0) {
      msgs.push(`Reel ${i + 1}: ${invalid.length} symbol(s) reference non-existent symbols.`);
      status = 'error';
    }
  }

  if (config.stripLength < config.rows) {
    msgs.push(`Strip length (${config.stripLength}) must be ≥ rows (${config.rows}).`);
    status = worstStatus(status, 'warning');
  }

  if (status === 'valid') msgs.push(`${config.reels} reels, ${config.stripLength} symbols per strip.`);
  return { status, messages: msgs };
}

function validatePaylines(config: MachineConfig): CategoryValidation {
  const msgs: string[] = [];
  let status: ValidationStatus = 'valid';

  if (config.paylines.length === 0) {
    msgs.push('No paylines defined. Add at least 1 payline.');
    status = 'error';
    return { status, messages: msgs };
  }

  for (const pl of config.paylines) {
    if (pl.cells.length !== config.reels) {
      msgs.push(`Payline ${pl.id}: has ${pl.cells.length} cells but machine has ${config.reels} reels.`);
      status = 'error';
    }

    const outOfBounds = pl.cells.filter(c => c < 0 || c >= config.rows);
    if (outOfBounds.length > 0) {
      msgs.push(`Payline ${pl.id}: cell(s) out of row bounds (0–${config.rows - 1}).`);
      status = 'error';
    }
  }

  if (status === 'valid') msgs.push(`${config.paylines.length} payline(s) configured.`);
  return { status, messages: msgs };
}

function validatePaytable(config: MachineConfig): CategoryValidation {
  const msgs: string[] = [];
  let status: ValidationStatus = 'valid';
  const validSymIds = new Set(config.symbols.map(s => s.id));

  if (config.paytable.length === 0) {
    msgs.push('No paytable entries. Add at least 1 payout.');
    status = 'error';
    return { status, messages: msgs };
  }

  const hasAnyPayout = config.paytable.some(e =>
    Object.values(e.payouts).some(v => v > 0)
  );
  if (!hasAnyPayout) {
    msgs.push('All payouts are 0. Set at least 1 payout > 0.');
    status = 'error';
  }

  const invalidRefs = config.paytable.filter(e => !validSymIds.has(e.symbolId));
  if (invalidRefs.length > 0) {
    msgs.push(`${invalidRefs.length} paytable entry/entries reference non-existent symbols.`);
    status = 'error';
  }

  // Check symbols without paytable entries
  const symbolsWithPayouts = new Set(config.paytable.map(e => e.symbolId));
  const nonWildWithout = config.symbols.filter(s => !s.isWild && !symbolsWithPayouts.has(s.id));
  if (nonWildWithout.length > 0) {
    msgs.push(`${nonWildWithout.length} non-Wild symbol(s) have no paytable entry: ${nonWildWithout.map(s => s.name).join(', ')}.`);
    status = worstStatus(status, 'warning');
  }

  if (status === 'valid') msgs.push(`${config.paytable.length} paytable entries configured.`);
  return { status, messages: msgs };
}

function validateSettings(config: MachineConfig): CategoryValidation {
  const msgs: string[] = [];
  let status: ValidationStatus = 'valid';

  if (config.settings.startCredits <= 0) {
    msgs.push('Start credits must be > 0.');
    status = 'error';
  }

  if (!config.settings.betOptions || config.settings.betOptions.length === 0) {
    msgs.push('No bet options defined.');
    status = 'error';
  }

  if (config.settings.defaultBet <= 0) {
    msgs.push('Default bet must be > 0.');
    status = worstStatus(status, 'warning');
  }

  if (status === 'valid') msgs.push('Settings OK.');
  return { status, messages: msgs };
}

export function validateConfig(config: MachineConfig): ValidationResult {
  const categories = {
    symbols: validateSymbols(config),
    reels: validateReels(config),
    paylines: validatePaylines(config),
    paytable: validatePaytable(config),
    settings: validateSettings(config),
  };

  let overall: ValidationStatus = 'valid';
  for (const cat of Object.values(categories)) {
    overall = worstStatus(overall, cat.status);
  }

  return { overall, categories };
}
