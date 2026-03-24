// ─── Spirit rules (SR4A pp. 183–209) ──────────────────────────────────────────

export type Tradition = "Hermetic" | "Shaman";

export interface ISpiritType {
  name: string;
  traditions: Tradition[];
  skills: string[];
  powers: string[];
}

// SR4A pp. 191–209: spirit types and their tradition affinity
export const SPIRIT_TYPES: ISpiritType[] = [
  {
    name: "Air",
    traditions: ["Hermetic"],
    skills: ["Spellcasting", "Unarmed Combat", "Exotic Ranged Weapon"],
    powers: ["Accident", "Concealment", "Confusion", "Movement"],
  },
  {
    name: "Earth",
    traditions: ["Hermetic"],
    skills: ["Exotic Ranged Weapon", "Spellcasting", "Unarmed Combat"],
    powers: ["Armor", "Movement", "Engulf"],
  },
  {
    name: "Fire",
    traditions: ["Hermetic"],
    skills: ["Exotic Ranged Weapon", "Spellcasting", "Unarmed Combat"],
    powers: ["Accident", "Engulf", "Fear"],
  },
  {
    name: "Water",
    traditions: ["Hermetic"],
    skills: ["Exotic Ranged Weapon", "Spellcasting", "Unarmed Combat"],
    powers: ["Accident", "Engulf", "Movement"],
  },
  {
    name: "Man",
    traditions: ["Hermetic", "Shaman"],
    skills: ["Spellcasting", "Unarmed Combat"],
    powers: ["Alienation", "Confusion", "Fear", "Influence"],
  },
  {
    name: "Beasts",
    traditions: ["Shaman"],
    skills: ["Unarmed Combat", "Tracking"],
    powers: ["Animal Control", "Concealment", "Movement"],
  },
  {
    name: "Elements",
    traditions: ["Shaman"],
    skills: ["Exotic Ranged Weapon", "Spellcasting", "Unarmed Combat"],
    powers: ["Engulf", "Movement"],
  },
];

/** Return valid spirit types for a given tradition. */
export function spiritsForTradition(tradition: Tradition): ISpiritType[] {
  return SPIRIT_TYPES.filter((s) => s.traditions.includes(tradition));
}

/** Look up a spirit type by case-insensitive name. */
export function lookupSpiritType(name: string): ISpiritType | null {
  const lower = name.toLowerCase();
  return SPIRIT_TYPES.find((s) => s.name.toLowerCase() === lower) ?? null;
}

/** Check if a spirit type is valid for the given tradition. */
export function isSpiritValidForTradition(spiritName: string, tradition: Tradition): boolean {
  const spirit = lookupSpiritType(spiritName);
  if (!spirit) return false;
  return spirit.traditions.includes(tradition);
}

// ── Summoning mechanics (SR4A p. 183) ─────────────────────────────────────────

/**
 * Services owed = net hits on summoning test (attacker hits − spirit threshold).
 * Spirit threshold is equal to its Force.
 * @param hits     Summoner's hits on Summoning+Magic test
 * @param force    Spirit's Force
 */
export function summoningServices(hits: number, force: number): number {
  return Math.max(0, hits - force);
}

/**
 * Summoning drain: Force − hits boxes of Stun (minimum 0).
 * The drain is always Stun for summoning (SR4A p. 183).
 */
export function summoningDrain(force: number, hits: number): number {
  return Math.max(0, force - hits);
}

// ── Banishing mechanics (SR4A p. 189) ──────────────────────────────────────────

/**
 * Spirit's banishing resistance pool = Force × 2.
 */
export function spiritBanishPool(force: number): number {
  return force * 2;
}
