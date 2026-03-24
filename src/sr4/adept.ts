// ─── Adept Power system (SR4A pp. 178–182) ────────────────────────────────────

import type { IAdeptPower, IShadowrunChar } from "../types.ts";
import { magicPenalty } from "./cyberware.ts";

export const ADEPT_QUALITIES = ["Adept", "Mystic Adept"];

// ── Power catalogue ────────────────────────────────────────────────────────────

export interface IAdeptPowerEntry {
  name: string;
  ppCost: number;       // base PP cost per level (or total for non-leveled powers)
  leveled: boolean;     // true = can be purchased multiple times (adds ppCost each time)
  maxRating?: number;   // maximum rating (for leveled powers)
  description: string;
}

export const ADEPT_POWER_LIST: IAdeptPowerEntry[] = [
  // Combat powers
  { name: "Astral Perception",        ppCost: 1.0,  leveled: false, description: "Perceive the astral plane without full projection" },
  { name: "Attribute Boost (Agility)",ppCost: 0.25, leveled: true,  maxRating: 4, description: "Boost Agility by rating for one action" },
  { name: "Attribute Boost (Body)",   ppCost: 0.25, leveled: true,  maxRating: 4, description: "Boost Body by rating for one action" },
  { name: "Attribute Boost (Reaction)",ppCost: 0.25,leveled: true,  maxRating: 4, description: "Boost Reaction by rating for one action" },
  { name: "Attribute Boost (Strength)",ppCost: 0.25,leveled: true,  maxRating: 4, description: "Boost Strength by rating for one action" },
  { name: "Combat Sense",             ppCost: 0.5,  leveled: true,  maxRating: 3, description: "+rating dice to defense tests; always active" },
  { name: "Critical Strike",          ppCost: 0.5,  leveled: true,  maxRating: 4, description: "+1 DV per rating to unarmed attacks" },
  { name: "Elemental Strike",         ppCost: 0.5,  leveled: false, description: "Add elemental damage type to unarmed strikes" },
  { name: "Killing Hands",            ppCost: 0.5,  leveled: false, description: "Unarmed attacks deal Physical damage instead of Stun" },
  { name: "Mystic Armor",             ppCost: 0.5,  leveled: true,  maxRating: 4, description: "+rating to armor rating (Ballistic and Impact)" },
  { name: "Nerve Strike",             ppCost: 0.5,  leveled: false, description: "Unarmed hits deal Stun equal to net hits (threshold 2)" },
  // Movement powers
  { name: "Catfall",                  ppCost: 0.5,  leveled: false, description: "Reduce falling damage; roll Body+Gymnastics threshold 1" },
  { name: "Hang Time",                ppCost: 0.5,  leveled: false, description: "Walk on walls and ceilings for short periods" },
  { name: "Rapid Draw",               ppCost: 0.5,  leveled: false, description: "Drawing a weapon is a free action" },
  { name: "Traceless Walk",           ppCost: 0.5,  leveled: false, description: "Leave no tracks; +2 dice to Sneaking" },
  { name: "Wall Running",             ppCost: 0.5,  leveled: false, description: "Run across walls and ceilings (Athletics tests required)" },
  // Enhancement powers
  { name: "Enhanced Perception",      ppCost: 0.5,  leveled: true,  maxRating: 3, description: "+rating dice to Perception tests" },
  { name: "Improved Ability",         ppCost: 0.5,  leveled: true,  maxRating: 3, description: "+rating to one active skill" },
  { name: "Improved Attribute (Agility)", ppCost: 1.0, leveled: true, maxRating: 4, description: "+rating to Agility (permanently)" },
  { name: "Improved Attribute (Body)", ppCost: 1.0,  leveled: true, maxRating: 4, description: "+rating to Body (permanently)" },
  { name: "Improved Attribute (Reaction)", ppCost: 1.0, leveled: true, maxRating: 4, description: "+rating to Reaction (permanently)" },
  { name: "Improved Attribute (Strength)", ppCost: 1.0, leveled: true, maxRating: 4, description: "+rating to Strength (permanently)" },
  { name: "Improved Initiative",      ppCost: 1.0,  leveled: true,  maxRating: 3, description: "+rating initiative dice (real d6s)" },
  { name: "Increase Reflexes",        ppCost: 1.5,  leveled: false, description: "+1d6 initiative die and +1 Reaction" },
  { name: "Smashing Blow",            ppCost: 0.5,  leveled: false, description: "Unarmed hits reduce object Structure by hits" },
  // Social/mental powers
  { name: "Commanding Voice",         ppCost: 0.5,  leveled: false, description: "Speak a one-word command; resisted by Charisma" },
  { name: "Cool Resolve",             ppCost: 0.5,  leveled: true,  maxRating: 3, description: "+rating to Social skill tests" },
  { name: "Facial Sculpt",            ppCost: 0.5,  leveled: false, description: "Change facial appearance at will (Disguise)" },
  { name: "Indomitable",             ppCost: 0.5,  leveled: true,  maxRating: 3, description: "+rating dice to resist fear/mind control" },
  { name: "Pain Resistance",          ppCost: 0.5,  leveled: true,  maxRating: 4, description: "Reduce wound modifier by rating (min −0)" },
  { name: "Supernatural Toughness",   ppCost: 1.0,  leveled: false, description: "+2 Physical condition monitor boxes" },
];

/** Look up a power entry by case-insensitive name. */
export function lookupAdeptPower(name: string): IAdeptPowerEntry | null {
  const lower = name.toLowerCase();
  return ADEPT_POWER_LIST.find((p) => p.name.toLowerCase() === lower) ?? null;
}

// ── Power point calculations ───────────────────────────────────────────────────

/**
 * Total power points spent on the given power array.
 * Each IAdeptPower stores its individual ppCost (already multiplied by rating).
 */
export function powerPointsUsed(powers: IAdeptPower[]): number {
  return +powers.reduce((sum, p) => sum + p.ppCost, 0).toFixed(2);
}

/**
 * Remaining power points available.
 * PP available = Magic rating − magicPenalty(essence) − powerPointsUsed
 * Cannot be negative.
 */
export function powerPointsAvailable(char: IShadowrunChar): number {
  const magic   = char.attrs["Magic"] ?? 0;
  const penalty = magicPenalty(char.essence ?? 6);
  const used    = powerPointsUsed(char.adeptPowers ?? []);
  return +Math.max(0, magic - penalty - used).toFixed(2);
}

/**
 * Returns an error string if the power cannot be added, or null if valid.
 */
export function validateAddPower(char: IShadowrunChar, power: IAdeptPowerEntry, rating = 1): string | null {
  const hasAdept = char.qualities.some((q) => ADEPT_QUALITIES.includes(q.name));
  if (!hasAdept) return "Only Adept or Mystic Adept characters can have adept powers.";

  const cost = +(power.ppCost * (power.leveled ? rating : 1)).toFixed(2);
  const available = powerPointsAvailable(char);

  if (cost > available) {
    return `Not enough power points (need ${cost}, have ${available.toFixed(2)}).`;
  }

  if (power.leveled) {
    if (rating < 1) return "Rating must be at least 1.";
    if (power.maxRating && rating > power.maxRating) {
      return `Maximum rating for ${power.name} is ${power.maxRating}.`;
    }
  }

  return null;
}

/** True if the character is a physical or mystic adept. */
export function isAdept(char: IShadowrunChar): boolean {
  return char.qualities.some((q) => ADEPT_QUALITIES.includes(q.name));
}
