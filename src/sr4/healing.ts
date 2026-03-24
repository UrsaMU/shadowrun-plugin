// ─── SR4 healing mechanics (pure, no side effects) ────────────────────────────
// SR4A pp. 166–168: stun heals via rest; physical via First Aid / Medicine rolls.

import type { IShadowrunChar } from "../types.ts";

/**
 * Boxes of stun healed per rest tick (always 1).
 * The hours-per-box value is cosmetic and shown in command output.
 *
 * @param bodyScore  Character's Body attribute.
 * @returns  Number of boxes healed (always 1) and hours it represents.
 */
export function stunRestTick(bodyScore: number): { boxes: number; hoursPerBox: number } {
  const body = Math.max(1, bodyScore);
  // SR4A p. 166: 1 box per max(1, 6 − Body) hours
  const hoursPerBox = Math.max(1, 6 - body);
  return { boxes: 1, hoursPerBox };
}

/**
 * Dice pool for a First Aid roll: First Aid skill + Logic attribute.
 * Returns 0 if the character has no First Aid skill (no crash).
 */
export function firstAidPool(char: IShadowrunChar): number {
  const skill = char.skills["First Aid"]?.rating ?? 0;
  const logic = char.attrs["Logic"] ?? 0;
  return skill + logic;
}

/**
 * Dice pool for a long-term Medicine roll: Medicine skill + Logic attribute.
 * Returns 0 if the character has no Medicine skill (no crash).
 */
export function longCarePool(char: IShadowrunChar): number {
  const skill = char.skills["Medicine"]?.rating ?? 0;
  const logic = char.attrs["Logic"] ?? 0;
  return skill + logic;
}

/**
 * Apply `boxes` of healing to the given track, clamped to actual damage.
 * Mutates `char` in place.
 *
 * @returns  Number of boxes actually healed.
 */
export function applyHeal(
  char: IShadowrunChar,
  type: "physical" | "stun",
  boxes: number,
): { healed: number } {
  if (type === "physical") {
    const healed = Math.min(boxes, char.physicalDmg);
    char.physicalDmg -= healed;
    return { healed };
  }
  const healed = Math.min(boxes, char.stunDmg);
  char.stunDmg -= healed;
  return { healed };
}
