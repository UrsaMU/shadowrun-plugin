// ─── SR4 combat resolution (pure, no I/O) ─────────────────────────────────────
//
// Implements the SR4A attack chain (pp. 136–152):
//   1. Attacker rolls attack pool → hits
//   2. Defender rolls defence pool → hits
//   3. Net hits (attacker − defender) added to weapon base DV
//   4. Damage type: if finalDV > modifiedArmour → Physical; else Stun
//   5. Resistance test: Body + modifiedArmour (physical) or Body (stun) → hits reduce DV
//   6. Applied DV fills condition monitor boxes
//
// Wound modifier: −1 to ALL dice pools per 3 boxes filled across both tracks.

import type { IShadowrunChar } from "../types.ts";

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface ICombatResult {
  attackHits: number;
  defenceHits: number;
  netHits: number;
  /** Base DV + netHits */
  rawDV: number;
  /** Armour rating after AP modifier */
  modifiedArmour: number;
  damageType: "physical" | "stun";
  resistHits: number;
  /** DV after resistance — the boxes actually applied to the track */
  appliedDV: number;
}

export interface IWeaponProfile {
  name: string;
  /** Base Damage Value */
  dv: number;
  /** Armour Penetration — negative reduces effective armour, e.g. AP −4 */
  ap: number;
  /** "P" = Physical, "S" = Stun (some weapons always deal stun regardless of armour) */
  damageCode: "P" | "S";
}

// ── Pure functions ────────────────────────────────────────────────────────────

/**
 * Current wound modifier for a character.
 * SR4A p. 163: −1 per 3 boxes filled across both condition monitors.
 */
export function woundModifier(char: IShadowrunChar): number {
  const total = (char.physicalDmg ?? 0) + (char.stunDmg ?? 0);
  return -Math.floor(total / 3);
}

/**
 * Effective armour rating after applying Armour Penetration.
 * Result is clamped to a minimum of 0.
 * SR4A p. 149: modified armour = armourRating + AP (AP is typically negative).
 */
export function armorVsAP(armourRating: number, ap: number): number {
  return Math.max(0, armourRating + ap);
}

/**
 * Determine damage type.
 * SR4A p. 149: if the weapon has a "S" damage code it always deals Stun.
 * Otherwise: finalDV > modifiedArmour → Physical; else Stun.
 */
export function damageType(
  finalDV: number,
  modifiedArmour: number,
  damageCode: "P" | "S",
): "physical" | "stun" {
  if (damageCode === "S") return "stun";
  return finalDV > modifiedArmour ? "physical" : "stun";
}

/**
 * Full combat resolution given pre-rolled hit counts.
 *
 * @param attackHits   Hits rolled on the attack test.
 * @param defenceHits  Hits rolled on the defence test.
 * @param weapon       Weapon profile (DV, AP, damage code).
 * @param armourRating Defender's relevant armour value (ballistic or impact).
 * @param resistHits   Hits rolled on the damage resistance test.
 */
export function resolveCombat(
  attackHits: number,
  defenceHits: number,
  weapon: IWeaponProfile,
  armourRating: number,
  resistHits: number,
): ICombatResult {
  const netHits       = Math.max(0, attackHits - defenceHits);
  const rawDV         = weapon.dv + netHits;
  const modifiedArmour = armorVsAP(armourRating, weapon.ap);
  const type          = damageType(rawDV, modifiedArmour, weapon.damageCode);
  const appliedDV     = Math.max(0, rawDV - resistHits);

  return {
    attackHits,
    defenceHits,
    netHits,
    rawDV,
    modifiedArmour,
    damageType: type,
    resistHits,
    appliedDV,
  };
}

/**
 * Size of the damage resistance pool.
 * Physical hits: Body + modified armour.
 * Stun hits:     Body only (armour does not help against stun in SR4A).
 */
export function resistPool(
  body: number,
  modifiedArmour: number,
  type: "physical" | "stun",
): number {
  return type === "physical" ? body + modifiedArmour : body;
}

/** Maximum DV for a custom weapon profile (generous ceiling; highest canonical SR4 weapon is ~16). */
export const MAX_CUSTOM_DV = 30;
/** Most negative AP allowed (most aggressive canonical AP is −6; −20 leaves room for houserules). */
export const MIN_CUSTOM_AP = -20;

/**
 * Validate a user-supplied custom weapon profile (DV and AP).
 * M2 FIX: prevents +attack Alice=9999/-9999/P from storing an arbitrary large
 * appliedDV directly onto the defender's damage track.
 * Returns an error string, or null if valid.
 */
export function validateCustomWeapon(dv: number, ap: number): string | null {
  if (!Number.isInteger(dv) || dv < 1) return "Custom weapon DV must be a positive integer.";
  if (dv > MAX_CUSTOM_DV) return `Custom weapon DV cannot exceed ${MAX_CUSTOM_DV}.`;
  if (!Number.isInteger(ap) || ap > 0) return "Custom weapon AP must be 0 or a negative integer.";
  if (ap < MIN_CUSTOM_AP) return `Custom weapon AP cannot be less than ${MIN_CUSTOM_AP}.`;
  return null;
}

/**
 * Format a combat result into a readable output string.
 */
export function formatCombatResult(
  attackerName: string,
  defenderName: string,
  weapon: IWeaponProfile,
  result: ICombatResult,
): string {
  const netTag  = result.netHits > 0 ? `+${result.netHits}` : `${result.netHits}`;
  const typeTag = result.damageType === "physical" ? "%crP%cn" : "%cyS%cn";
  const parts: string[] = [
    `%ch${attackerName}%cn attacks %ch${defenderName}%cn with ${weapon.name}:`,
    `  Attack %ch${result.attackHits}%cn  Defence %ch${result.defenceHits}%cn  → net %ch${netTag}%cn hits`,
    `  DV: %ch${weapon.dv}%cn + ${result.netHits} = %ch${result.rawDV}%cn   Armour: ${result.modifiedArmour}   Type: ${typeTag}`,
    `  Resist: %ch${result.resistHits}%cn hits → %ch${result.appliedDV}%cn box${result.appliedDV !== 1 ? "es" : ""} ${result.damageType}`,
  ];
  if (result.appliedDV === 0) parts.push("  %cgNo damage applied.%cn");
  return parts.join("%r");
}
