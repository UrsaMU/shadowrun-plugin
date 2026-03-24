// ─── Magic pure functions (SR4A pp. 155–182) ──────────────────────────────────

import type { IShadowrunChar, ISpell } from "../types.ts";
import { magicPenalty } from "./cyberware.ts";

export const BP_SPELL = 3;
export const AWAKENED_QUALITIES = ["Magician", "Mystic Adept"];

// ── Tradition helpers ──────────────────────────────────────────────────────

export type Tradition = "Hermetic" | "Shaman";

/**
 * Returns the secondary drain-resistance attribute for the character's tradition.
 * Hermetic: Logic. Shaman: Charisma.
 * Willpower is always the first drain attribute (SR4A p. 181).
 */
export function traditionLinkedAttr(tradition: Tradition | undefined | null): "Logic" | "Charisma" | null {
  if (!tradition) return null;
  return tradition === "Hermetic" ? "Logic" : "Charisma";
}

// ── Awakened status ────────────────────────────────────────────────────────

/** True if the character has the Magician or Mystic Adept quality. */
export function isAwakened(char: IShadowrunChar): boolean {
  return char.qualities.some((q) => AWAKENED_QUALITIES.includes(q.name));
}

// ── Drain ──────────────────────────────────────────────────────────────────

/**
 * Drain resistance pool: Willpower + linked tradition attribute (Logic or Charisma).
 * Returns 0 for non-awakened characters.
 * Magic penalty from cyberware does NOT affect drain resistance.
 */
export function drainPool(char: IShadowrunChar): number {
  if (!isAwakened(char)) return 0;
  const linked = traditionLinkedAttr(char.tradition ?? null);
  if (!linked) return 0;
  const willpower = char.attrs["Willpower"] ?? 1;
  const secondary = char.attrs[linked] ?? 1;
  return willpower + secondary;
}

/**
 * Calculate the Drain Value and whether it is Physical or Stun.
 * - DV = max(ceil(Force/2), 2)
 * - Type: if Force > magic attribute → Physical; else Stun
 *
 * @param force     Spell Force (1–N)
 * @param magicAttr Caster's effective Magic attribute (after penalty)
 */
export function calcDrainDv(force: number, magicAttr: number): { dv: number; type: "physical" | "stun" } {
  const dv = Math.max(Math.ceil(force / 2), 2);
  const type: "physical" | "stun" = force > magicAttr ? "physical" : "stun";
  return { dv, type };
}

// ── Spell BP ───────────────────────────────────────────────────────────────

/**
 * Total BP spent on spells: 3 BP each (SR4A p. 159).
 * Counts all spells regardless of category.
 */
export function spellBP(spells: ISpell[]): number {
  return spells.length * BP_SPELL;
}

// ── Effective Magic attribute ──────────────────────────────────────────────

/**
 * Effective Magic attribute after cyberware Essence penalty.
 * = max(0, natural Magic − magicPenalty(essence))
 */
export function effectiveMagic(char: IShadowrunChar): number {
  const naturalMagic = char.attrs["Magic"] ?? 0;
  const penalty = magicPenalty(char.essence ?? 6);
  return Math.max(0, naturalMagic - penalty);
}

// ── Spell DV calculation ───────────────────────────────────────────────────

/**
 * Calculate the raw DV of a spell at a given force.
 * DV = ceil(Force × dvPerForce) + dvBase
 */
export function spellDvAtForce(spell: ISpell, force: number): number {
  return Math.ceil(force * spell.dvPerForce) + spell.dvBase;
}
