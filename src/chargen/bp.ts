// ─── BP calculation and validation (pure, no I/O) ─────────────────────────────

import { CHAR_ATTRS } from "../types.ts";
import { METATYPES } from "../sr4/metatypes.ts";
import type { IShadowrunChar } from "../types.ts";
import { contactsBP } from "../sr4/contacts.ts";
import { spellBP } from "../sr4/magic.ts";

export const BP_TOTAL = 400;
export const BP_RESOURCES_PER_NUYEN = 5_000;
export const BP_SKILL_PER_RANK = 4;
export const BP_SPEC = 2;
export const BP_ATTR_PER_POINT = 10;
export const MAX_POSITIVE_QUALITY_BP = 35;
export const MAX_NEGATIVE_QUALITY_BP = 35;
export const MAX_NUYEN = 250_000; // 50 BP × 5,000¥

/** BP spent on a single attribute above its racial minimum. */
export function attrCost(metatype: string, attr: string, value: number): number {
  const meta = METATYPES[metatype];
  if (!meta) return 0;
  const [min] = meta.attrs[attr] ?? [1, 6];
  return Math.max(0, value - min) * BP_ATTR_PER_POINT;
}

/** Total BP cost for all attributes above racial minimums. */
function attrsBP(char: IShadowrunChar): number {
  const meta = METATYPES[char.metatype];
  if (!meta) return 0;
  return CHAR_ATTRS.reduce((sum, attr) => {
    const val = char.attrs[attr] ?? (meta.attrs[attr]?.[0] ?? 1);
    return sum + attrCost(char.metatype, attr, val);
  }, 0);
}

/** Total BP cost for all active skills (ratings + specializations). */
function skillsBP(char: IShadowrunChar): number {
  return Object.values(char.skills).reduce(
    (sum, s) => sum + s.rating * BP_SKILL_PER_RANK + (s.spec ? BP_SPEC : 0),
    0,
  );
}

/** BP spent on positive qualities (before cap). */
export function posQualBP(char: IShadowrunChar): number {
  return char.qualities
    .filter((q) => q.type === "positive")
    .reduce((s, q) => s + q.bp, 0);
}

/** BP returned by negative qualities (before cap). */
export function negQualBP(char: IShadowrunChar): number {
  return char.qualities
    .filter((q) => q.type === "negative")
    .reduce((s, q) => s + q.bp, 0);
}

/** BP spent on starting nuyen. */
export function nuYenBP(char: IShadowrunChar): number {
  return Math.floor(char.nuyen / BP_RESOURCES_PER_NUYEN);
}

/**
 * Total net BP spent on this character.
 * = metatype + attrs + skills + posQualities − min(negQualities, 35) + nuyen/5000
 */
export function calcBP(char: IShadowrunChar): number {
  if (!char.metatype) return 0;
  const meta = METATYPES[char.metatype];
  if (!meta) return 0;

  const neg = Math.min(negQualBP(char), MAX_NEGATIVE_QUALITY_BP);
  return (
    meta.bp +
    attrsBP(char) +
    skillsBP(char) +
    posQualBP(char) -
    neg +
    nuYenBP(char) +
    contactsBP(char.contacts ?? []) +
    spellBP(char.spells ?? [])
  );
}

/** Return an array of error strings; empty array = valid for submission. */
export function validateSubmit(char: IShadowrunChar): string[] {
  const errors: string[] = [];

  if (!char.metatype) errors.push("No metatype selected. Use +chargen/metatype.");

  const bp = calcBP(char);
  if (bp > BP_TOTAL) errors.push(`Over BP limit: ${bp}/${BP_TOTAL} spent.`);

  const pos = posQualBP(char);
  if (pos > MAX_POSITIVE_QUALITY_BP) {
    errors.push(`Positive qualities exceed ${MAX_POSITIVE_QUALITY_BP} BP (${pos} BP spent).`);
  }

  const neg = negQualBP(char);
  if (neg > MAX_NEGATIVE_QUALITY_BP) {
    errors.push(`Negative qualities exceed ${MAX_NEGATIVE_QUALITY_BP} BP refund cap (${neg} BP).`);
  }

  if (char.nuyen > MAX_NUYEN) {
    errors.push(`Starting nuyen exceeds maximum of ${MAX_NUYEN.toLocaleString()}¥.`);
  }

  return errors;
}
