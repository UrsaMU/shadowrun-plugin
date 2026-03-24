// ─── Cyberware / Bioware pure functions (SR4A pp. 329–358) ────────────────────

import type { IImplant } from "../types.ts";

// ── Grade cost multipliers ─────────────────────────────────────────────────

const GRADE_MULTIPLIER: Record<string, number> = {
  standard: 1.0,
  alpha:    0.9,
  beta:     0.8,
  delta:    0.7,
  cultured: 0.9,   // bioware cultured grade
};

export type ImplantGrade = "standard" | "alpha" | "beta" | "delta" | "cultured";

/**
 * Essence cost multiplier for a given implant grade.
 * Returns 1 for unknown grades (safe default).
 */
export function gradeCostMultiplier(grade: string): number {
  return GRADE_MULTIPLIER[grade.toLowerCase()] ?? 1.0;
}

// ── Essence calculation ────────────────────────────────────────────────────

/** Maximum natural Essence. */
export const MAX_ESSENCE = 6;

/** Cap at which a character dies from Essence loss. */
export const MIN_ESSENCE = 0;

/**
 * Calculate remaining Essence after all implants.
 * Essence = 6 − sum of essenceCost across all implants, clamped to [0, 6].
 */
export function calcEssence(implants: IImplant[]): number {
  const spent = implants.reduce((acc, i) => acc + i.essenceCost, 0);
  return Math.max(MIN_ESSENCE, Math.min(MAX_ESSENCE, +(MAX_ESSENCE - spent).toFixed(2)));
}

/**
 * Magic attribute penalty from Essence loss.
 * Per SR4A: floor(6 − currentEssence) deducted from Magic attribute.
 * Returns 0 for characters with no magic (or no penalty).
 */
export function magicPenalty(essence: number): number {
  return Math.max(0, Math.floor(MAX_ESSENCE - essence));
}

// ── Initiative dice from implants ──────────────────────────────────────────

/** SR4A p. 340: Wired Reflexes 1/2/3 → +1/+2/+3 initiative dice. */
const WIRED_REFLEXES: Record<string, number> = {
  "Wired Reflexes 1": 1,
  "Wired Reflexes 2": 2,
  "Wired Reflexes 3": 3,
};

/** SR4A p. 341: Synaptic Booster 1/2/3 → +1/+2/+3 initiative dice. */
const SYNAPTIC_BOOSTER: Record<string, number> = {
  "Synaptic Booster 1": 1,
  "Synaptic Booster 2": 2,
  "Synaptic Booster 3": 3,
};

/** SR4A maximum total augmented initiative dice (Wired + Synaptic combined). */
export const MAX_INIT_DICE_BONUS = 4;

/**
 * Sum of extra initiative dice granted by Wired Reflexes and Synaptic Booster
 * implants. Capped at MAX_INIT_DICE_BONUS (4).
 */
export function initDiceFromImplants(implants: IImplant[]): number {
  let total = 0;
  for (const imp of implants) {
    total += WIRED_REFLEXES[imp.name] ?? 0;
    total += SYNAPTIC_BOOSTER[imp.name] ?? 0;
  }
  return Math.min(total, MAX_INIT_DICE_BONUS);
}

// ── Catalogue of known implants with base Essence costs ───────────────────

export interface IImplantEntry {
  name: string;
  category: "cyberware" | "bioware";
  baseEssenceCost: number;
  description: string;
}

export const IMPLANT_CATALOGUE: IImplantEntry[] = [
  // ── Cyberware ─────────────────────────────────────────────────────────────
  { name: "Wired Reflexes 1",    category: "cyberware", baseEssenceCost: 2.0, description: "+1 initiative die, +1 Reaction" },
  { name: "Wired Reflexes 2",    category: "cyberware", baseEssenceCost: 3.0, description: "+2 initiative dice, +2 Reaction" },
  { name: "Wired Reflexes 3",    category: "cyberware", baseEssenceCost: 5.0, description: "+3 initiative dice, +3 Reaction" },
  { name: "Reflex Recorder",     category: "cyberware", baseEssenceCost: 0.1, description: "+1 to one active skill" },
  { name: "Muscle Replacement 1",category: "cyberware", baseEssenceCost: 1.0, description: "+1 Agility, +1 Strength" },
  { name: "Muscle Replacement 2",category: "cyberware", baseEssenceCost: 2.0, description: "+2 Agility, +2 Strength" },
  { name: "Muscle Replacement 3",category: "cyberware", baseEssenceCost: 3.0, description: "+3 Agility, +3 Strength" },
  { name: "Muscle Replacement 4",category: "cyberware", baseEssenceCost: 4.0, description: "+4 Agility, +4 Strength" },
  { name: "Bone Lacing (Plastic)",  category: "cyberware", baseEssenceCost: 0.5, description: "+1 Body, +1 Impact armour" },
  { name: "Bone Lacing (Aluminum)", category: "cyberware", baseEssenceCost: 1.0, description: "+1 Body, +2 Impact armour" },
  { name: "Bone Lacing (Titanium)", category: "cyberware", baseEssenceCost: 2.0, description: "+2 Body, +3 Impact armour" },
  { name: "Dermal Plating 1",    category: "cyberware", baseEssenceCost: 1.0, description: "+1 Ballistic armour" },
  { name: "Dermal Plating 2",    category: "cyberware", baseEssenceCost: 2.0, description: "+2 Ballistic armour" },
  { name: "Dermal Plating 3",    category: "cyberware", baseEssenceCost: 3.0, description: "+3 Ballistic armour" },
  { name: "Datajack",            category: "cyberware", baseEssenceCost: 0.1, description: "Allows direct neural interface" },
  { name: "Smartlink",           category: "cyberware", baseEssenceCost: 0.25, description: "+2 dice on linked weapon attacks" },
  { name: "Cybereyes 1",         category: "cyberware", baseEssenceCost: 0.2, description: "Cyberoptical replacement grade 1" },
  { name: "Cybereyes 2",         category: "cyberware", baseEssenceCost: 0.3, description: "Cyberoptical replacement grade 2" },
  { name: "Cybereyes 3",         category: "cyberware", baseEssenceCost: 0.4, description: "Cyberoptical replacement grade 3" },
  { name: "Cyberears 1",         category: "cyberware", baseEssenceCost: 0.2, description: "Audio replacement grade 1" },
  { name: "Cyberears 2",         category: "cyberware", baseEssenceCost: 0.3, description: "Audio replacement grade 2" },
  { name: "Cyberears 3",         category: "cyberware", baseEssenceCost: 0.4, description: "Audio replacement grade 3" },
  { name: "Control Rig",         category: "cyberware", baseEssenceCost: 3.0, description: "Allows vehicle jump-in; +2 dice on vehicle tests" },
  { name: "Reaction Enhancers 1",category: "cyberware", baseEssenceCost: 0.3, description: "+1 Reaction" },
  { name: "Reaction Enhancers 2",category: "cyberware", baseEssenceCost: 0.6, description: "+2 Reaction" },
  { name: "Reaction Enhancers 3",category: "cyberware", baseEssenceCost: 0.9, description: "+3 Reaction" },
  // ── Bioware ───────────────────────────────────────────────────────────────
  { name: "Synaptic Booster 1",  category: "bioware", baseEssenceCost: 1.0, description: "+1 initiative die" },
  { name: "Synaptic Booster 2",  category: "bioware", baseEssenceCost: 2.5, description: "+2 initiative dice" },
  { name: "Synaptic Booster 3",  category: "bioware", baseEssenceCost: 3.5, description: "+3 initiative dice" },
  { name: "Muscle Toner 1",      category: "bioware", baseEssenceCost: 0.2, description: "+1 Agility" },
  { name: "Muscle Toner 2",      category: "bioware", baseEssenceCost: 0.4, description: "+2 Agility" },
  { name: "Muscle Toner 3",      category: "bioware", baseEssenceCost: 0.6, description: "+3 Agility" },
  { name: "Muscle Toner 4",      category: "bioware", baseEssenceCost: 0.8, description: "+4 Agility" },
  { name: "Muscle Augmentation 1", category: "bioware", baseEssenceCost: 0.2, description: "+1 Strength" },
  { name: "Muscle Augmentation 2", category: "bioware", baseEssenceCost: 0.4, description: "+2 Strength" },
  { name: "Muscle Augmentation 3", category: "bioware", baseEssenceCost: 0.6, description: "+3 Strength" },
  { name: "Muscle Augmentation 4", category: "bioware", baseEssenceCost: 0.8, description: "+4 Strength" },
  { name: "Platelet Factories",  category: "bioware", baseEssenceCost: 0.2, description: "Reduce Physical overflow to Stun by 1 per hit" },
  { name: "Trauma Damper",       category: "bioware", baseEssenceCost: 0.3, description: "Add 1 Physical box to condition monitor" },
  { name: "Adrenal Pump",        category: "bioware", baseEssenceCost: 1.0, description: "Once per fight: +1d6 to all actions for (Body) combat turns" },
];

/** Look up a catalogue entry by case-insensitive name. */
export function lookupImplant(name: string): IImplantEntry | null {
  const lower = name.toLowerCase();
  return IMPLANT_CATALOGUE.find((e) => e.name.toLowerCase() === lower) ?? null;
}
