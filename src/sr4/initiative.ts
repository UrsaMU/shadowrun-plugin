// ─── SR4 initiative mechanics (pure, no side effects) ─────────────────────────
// Initiative Score = Reaction + Intuition + Nd6 (sum of face values, not hits).
// Additional dice from cyberware/magic tracked via +init/manual until gear added.

/** Maximum dice count for initiative (4 = Wired Reflexes 3 + synaptic booster). */
export const MAX_INIT_DICE = 4;

/** Cap on the attribute-sum input to prevent absurdly large output strings. */
export const MAX_INIT_ATTR_SUM = 100;

export interface InitResult {
  /** Reaction + Intuition (or manual override). */
  attrSum: number;
  /** Final d6 face values (after any Edge reroll). */
  dice: number[];
  /** attrSum + sum(dice). */
  total: number;
  /** Whether Edge was burned on this roll. */
  edgeUsed: boolean;
}

/**
 * Roll initiative: sum attrSum + Nd6 face values.
 *
 * @param attrSum  Reaction + Intuition. Clamped to [1, MAX_INIT_ATTR_SUM].
 * @param numDice  Number of d6s (default 1). Clamped to [1, MAX_INIT_DICE].
 * @param rng      Optional d6 RNG — injectable for tests.
 */
export function rollInitiative(
  attrSum: number,
  numDice = 1,
  rng: () => number = () => Math.ceil(Math.random() * 6),
): InitResult {
  const a = Math.max(1, Math.min(Math.floor(attrSum), MAX_INIT_ATTR_SUM));
  const n = Math.max(1, Math.min(Math.floor(numDice), MAX_INIT_DICE));
  const dice = Array.from({ length: n }, () => rng());
  return { attrSum: a, dice, total: a + dice.reduce((s, d) => s + d, 0), edgeUsed: false };
}

/**
 * Edge variant: roll initiative, then reroll each die showing 1–4 once.
 * Dice showing 5–6 are kept; the rerolled die may come up any value (no guarantee).
 *
 * @param attrSum  Reaction + Intuition. Clamped to [1, MAX_INIT_ATTR_SUM].
 * @param numDice  Number of d6s (default 1). Clamped to [1, MAX_INIT_DICE].
 * @param rng      Optional d6 RNG — injectable for tests.
 */
export function rollInitiativeEdge(
  attrSum: number,
  numDice = 1,
  rng: () => number = () => Math.ceil(Math.random() * 6),
): InitResult {
  const a = Math.max(1, Math.min(Math.floor(attrSum), MAX_INIT_ATTR_SUM));
  const n = Math.max(1, Math.min(Math.floor(numDice), MAX_INIT_DICE));
  const initial = Array.from({ length: n }, () => rng());
  // Reroll each die showing 1–4; keep 5–6 ("hits" on d6)
  const dice = initial.map((d) => (d < 5 ? rng() : d));
  return { attrSum: a, dice, total: a + dice.reduce((s, d) => s + d, 0), edgeUsed: true };
}
