// ─── SR4 dice pool mechanics (pure, no side effects) ─────────────────────────
// A hit is a 5 or 6. A glitch occurs when half or more of the dice show 1s.
// A critical glitch is a glitch with zero hits.

/**
 * Maximum allowed dice pool size.
 * SR4 pools above ~40 are practically impossible in the rules; 100 is generous.
 * Enforced by validatePoolSize() — prevents DoS via huge Array.from() calls.
 */
export const MAX_POOL = 100;

/**
 * Maximum accepted damage input per +damage command.
 * Any single hit in SR4 is bounded by the weapon's DV + hits, well under 100.
 * Rejecting values above 100 prevents garbled output and future regressions.
 */
export const MAX_DAMAGE_INPUT = 100;

/**
 * Validate a player-supplied damage amount.
 * Returns null if valid, or an error string to show the player.
 */
export function validateDamageInput(dmg: number): string | null {
  if (!Number.isInteger(dmg) || dmg < 1) {
    return "Damage must be a positive integer.";
  }
  if (dmg > MAX_DAMAGE_INPUT) {
    return `Damage cannot exceed ${MAX_DAMAGE_INPUT} boxes (you entered ${dmg}).`;
  }
  return null;
}

/**
 * Validate a player-supplied dice pool size.
 * Returns null if valid, or an error string to show the player.
 */
export function validatePoolSize(pool: number): string | null {
  if (!Number.isInteger(pool) || pool < 1) {
    return "Pool must be a positive integer.";
  }
  if (pool > MAX_POOL) {
    return `Dice pool cannot exceed ${MAX_POOL} dice (you entered ${pool}).`;
  }
  return null;
}

export interface DiceResult {
  /** Individual die face values (1–6). */
  dice: number[];
  /** Count of dice showing 5 or 6. */
  hits: number;
  /** Count of dice showing 1. */
  ones: number;
  /** True when ones >= ceil(pool / 2). */
  glitch: boolean;
  /** True when glitch AND hits === 0. */
  critGlitch: boolean;
}

export interface EdgeResult {
  initial: DiceResult;
  /** Second roll of all non-hit dice after Edge burn. */
  reroll: DiceResult;
  totalHits: number;
}

/**
 * Roll a Shadowrun dice pool of `pool` d6s.
 * Pool is clamped to a minimum of 1.
 *
 * @param pool  Number of dice to roll.
 * @param rng   Optional RNG (defaults to Math.random) — injectable for tests.
 */
export function rollPool(
  pool: number,
  rng: () => number = Math.random,
): DiceResult {
  const n = Math.max(1, Math.floor(pool));
  const dice = Array.from({ length: n }, () => Math.ceil(rng() * 6));
  return summarize(dice);
}

/**
 * Roll with Edge: roll the pool, then reroll all non-hit dice once.
 *
 * @param pool  Number of dice to roll.
 * @param rng   Optional RNG — injectable for tests.
 */
export function rollEdge(
  pool: number,
  rng: () => number = Math.random,
): EdgeResult {
  const initial = rollPool(pool, rng);
  const nonHits = initial.dice.filter((d) => d < 5).length;
  const reroll = rollPool(nonHits, rng);
  return { initial, reroll, totalHits: initial.hits + reroll.hits };
}

/** Compute hit/glitch stats from a set of die values. */
export function summarize(dice: number[]): DiceResult {
  const hits = dice.filter((d) => d >= 5).length;
  const ones = dice.filter((d) => d === 1).length;
  const glitch = dice.length > 0 && ones >= Math.ceil(dice.length / 2);
  const critGlitch = glitch && hits === 0;
  return { dice, hits, ones, glitch, critGlitch };
}

/** Physical damage track boxes: ceil(Body / 2) + 8. */
export function physBoxes(body: number): number {
  return Math.ceil(Math.max(1, body) / 2) + 8;
}

/** Stun damage track boxes: ceil(Willpower / 2) + 8. */
export function stunBoxes(willpower: number): number {
  return Math.ceil(Math.max(1, willpower) / 2) + 8;
}
