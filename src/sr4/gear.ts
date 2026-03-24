// ─── Gear validation and helpers (pure, no I/O) ──────────────────────────────

import type { IGearItem } from "../types.ts";
import { lookupGear } from "./gear-catalogue.ts";
import { isPrototypePoisonKey } from "./validation.ts";
export { lookupGear } from "./gear-catalogue.ts";

export const MAX_GEAR_NAME     = 80;
export const MAX_GEAR_NOTE     = 200;
export const MAX_GEAR_QUANTITY = 9_999;

/**
 * Hard caps on computed armour totals.
 * SR4A p. 169 layering rule is not auto-enforced here, but these ceilings
 * prevent trivial stacking exploits (e.g. adding every armour item at once).
 * Full Body Armor (10/8) + all legitimate accessories ≈ 18/15 at most.
 */
export const MAX_ARMOR_BALLISTIC = 20;
export const MAX_ARMOR_IMPACT    = 20;

/**
 * Validate a gear item name.
 * Rejects empty, over-length, and prototype-polluting keys.
 * Returns an error string, or null if valid.
 */
export function validateGearName(name: string): string | null {
  if (!name) return "Gear name cannot be empty.";
  if (name.length > MAX_GEAR_NAME) return `Gear name exceeds ${MAX_GEAR_NAME} characters.`;
  if (isPrototypePoisonKey(name)) return "Invalid gear name.";
  return null;
}

/**
 * Validate a gear quantity.
 * Returns an error string, or null if valid.
 */
export function validateQuantity(qty: number): string | null {
  if (!Number.isInteger(qty) || qty < 1) return "Quantity must be a positive integer.";
  if (qty > MAX_GEAR_QUANTITY) return `Quantity cannot exceed ${MAX_GEAR_QUANTITY}.`;
  return null;
}

/**
 * Validate a gear note.
 * Rejects over-length notes and exact prototype-poison keys used as the
 * entire note string (defence-in-depth; notes are freeform, so substrings
 * are permitted — only bare dangerous identifiers are blocked).
 * Returns an error string, or null if valid.
 */
export function validateGearNote(note: string): string | null {
  if (note.length > MAX_GEAR_NOTE) return `Note exceeds ${MAX_GEAR_NOTE} characters.`;
  if (isPrototypePoisonKey(note))  return "Invalid note.";
  return null;
}

/**
 * Look up the catalogue entry for a gear item name and return any
 * character-affecting stats that should be stored on the IGearItem.
 */
export function catalogueStatsFor(name: string): Pick<IGearItem, "category" | "ballistic" | "impact" | "recoilComp"> {
  const entry = lookupGear(name);
  if (!entry) return {};
  const stats: Pick<IGearItem, "category" | "ballistic" | "impact" | "recoilComp"> = {
    category: entry.category,
  };
  if (entry.ballistic  !== undefined) stats.ballistic  = entry.ballistic;
  if (entry.impact     !== undefined) stats.impact     = entry.impact;
  if (entry.recoilComp !== undefined) stats.recoilComp = entry.recoilComp;
  return stats;
}

/**
 * Recompute total armor from all gear items.
 * Sums ballistic and impact across the whole gear list, then clamps to
 * MAX_ARMOR_BALLISTIC / MAX_ARMOR_IMPACT to prevent stacking exploits.
 */
export function recomputeArmorFromGear(gear: IGearItem[]): { ballistic: number; impact: number } {
  let ballistic = 0;
  let impact    = 0;
  for (const item of gear) {
    ballistic += item.ballistic ?? 0;
    impact    += item.impact    ?? 0;
  }
  return {
    ballistic: Math.min(ballistic, MAX_ARMOR_BALLISTIC),
    impact:    Math.min(impact,    MAX_ARMOR_IMPACT),
  };
}

/**
 * Recompute total recoil compensation bonus from all gear items.
 */
export function recomputeRecoilCompFromGear(gear: IGearItem[]): number {
  return gear.reduce((acc, item) => acc + (item.recoilComp ?? 0), 0);
}
