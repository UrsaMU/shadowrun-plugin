// ─── Spell catalogue (SR4A pp. 157–182) ───────────────────────────────────────

import type { ISpell } from "../types.ts";

export type SpellCategory = "Combat" | "Detection" | "Health" | "Illusion" | "Manipulation";

export interface ISpellEntry extends ISpell {
  description: string;
}

export const SPELL_CATALOGUE: ISpellEntry[] = [
  // ── Combat Spells (p. 160–163) ─────────────────────────────────────────────
  { name: "Manaball",       category: "Combat", type: "mana",     range: "LOS(A)", damage: "P", dvBase: 0, dvPerForce: 1,   description: "Area mana blast; Physical damage" },
  { name: "Manabolt",       category: "Combat", type: "mana",     range: "LOS",    damage: "P", dvBase: 0, dvPerForce: 1,   description: "Direct mana strike; Physical damage" },
  { name: "Powerball",      category: "Combat", type: "physical", range: "LOS(A)", damage: "P", dvBase: 0, dvPerForce: 1,   description: "Area physical blast; Physical damage" },
  { name: "Powerbolt",      category: "Combat", type: "physical", range: "LOS",    damage: "P", dvBase: 0, dvPerForce: 1,   description: "Direct physical strike; Physical damage" },
  { name: "Lightning Bolt", category: "Combat", type: "physical", range: "LOS",    damage: "P", dvBase: 2, dvPerForce: 0.5, description: "Electrical bolt; Physical damage" },
  { name: "Flamethrower",   category: "Combat", type: "physical", range: "LOS",    damage: "P", dvBase: 2, dvPerForce: 0.5, description: "Cone of flame; Physical damage" },
  { name: "Stunball",       category: "Combat", type: "mana",     range: "LOS(A)", damage: "S", dvBase: 0, dvPerForce: 1,   description: "Area stun blast; Stun damage" },
  { name: "Stunbolt",       category: "Combat", type: "mana",     range: "LOS",    damage: "S", dvBase: 0, dvPerForce: 1,   description: "Direct stun strike; Stun damage" },
  { name: "Acid Stream",    category: "Combat", type: "physical", range: "LOS",    damage: "P", dvBase: 0, dvPerForce: 1,   description: "Corrosive spray; Physical damage" },
  { name: "Clout",          category: "Combat", type: "physical", range: "LOS",    damage: "P", dvBase: 0, dvPerForce: 1,   description: "Kinetic blow; Physical damage" },
  { name: "Shockwave",      category: "Combat", type: "physical", range: "LOS(A)", damage: "P", dvBase: 0, dvPerForce: 1,   description: "Sonic area burst; Physical damage" },
  // ── Detection Spells (p. 163–165) ──────────────────────────────────────────
  { name: "Analyze Magic",   category: "Detection", type: "mana",  range: "T",      dvBase: 1, dvPerForce: 0, description: "Read aura, determine magical properties" },
  { name: "Clairaudience",   category: "Detection", type: "mana",  range: "LOS",    dvBase: 1, dvPerForce: 0, description: "Remote audio perception" },
  { name: "Clairvoyance",    category: "Detection", type: "mana",  range: "LOS",    dvBase: 1, dvPerForce: 0, description: "Remote visual perception" },
  { name: "Combat Sense",    category: "Detection", type: "mana",  range: "T",      dvBase: 1, dvPerForce: 0, description: "Reaction bonus equal to hits" },
  { name: "Detect Enemies",  category: "Detection", type: "mana",  range: "T",      dvBase: 2, dvPerForce: 0, description: "Sense hostile intent (Extended)" },
  { name: "Detect Life",     category: "Detection", type: "mana",  range: "T",      dvBase: 2, dvPerForce: 0, description: "Detect all living auras in area" },
  { name: "Mind Probe",      category: "Detection", type: "mana",  range: "T",      dvBase: 2, dvPerForce: 0, description: "Read surface thoughts" },
  { name: "Spatial Sense",   category: "Detection", type: "physical", range: "T",   dvBase: 1, dvPerForce: 0, description: "Three-dimensional spatial awareness" },
  // ── Health Spells (p. 165–167) ─────────────────────────────────────────────
  { name: "Antidote",         category: "Health", type: "mana", range: "T",  dvBase: 2, dvPerForce: 0, description: "Remove toxin effects (one hit per box)" },
  { name: "Detox",            category: "Health", type: "mana", range: "T",  dvBase: 2, dvPerForce: 0, description: "Remove drug/alcohol effects" },
  { name: "Heal",             category: "Health", type: "mana", range: "T",  dvBase: 2, dvPerForce: 0, description: "Remove Physical damage (hits = boxes healed)" },
  { name: "Increase Attribute", category: "Health", type: "mana", range: "T", dvBase: 2, dvPerForce: 0.5, description: "Raise an attribute by hits for duration" },
  { name: "Decrease Attribute", category: "Health", type: "mana", range: "T", dvBase: 2, dvPerForce: 0.5, description: "Lower target's attribute by hits" },
  { name: "Regenerate",       category: "Health", type: "mana", range: "T",  dvBase: 3, dvPerForce: 0, description: "Continuous healing (hits per combat turn)" },
  { name: "Stabilize",        category: "Health", type: "mana", range: "T",  dvBase: 1, dvPerForce: 0, description: "Halt progression of Overflow damage" },
  // ── Illusion Spells (p. 167–170) ───────────────────────────────────────────
  { name: "Chaff",           category: "Illusion", type: "physical", range: "LOS(A)", dvBase: 1, dvPerForce: 0, description: "Confuse electronics and sensors in area" },
  { name: "Entertainment",   category: "Illusion", type: "mana",     range: "LOS",    dvBase: 1, dvPerForce: 0, description: "Multisensory illusion for one person" },
  { name: "Hush",            category: "Illusion", type: "physical", range: "LOS(A)", dvBase: 1, dvPerForce: 0, description: "Silence zone" },
  { name: "Invisibility",    category: "Illusion", type: "physical", range: "T",      dvBase: 1, dvPerForce: 0, description: "Render one target invisible (physical)" },
  { name: "Mass Confusion",  category: "Illusion", type: "mana",     range: "LOS(A)", dvBase: 2, dvPerForce: 0, description: "Area disorientation; penalty to actions" },
  { name: "Phantom",         category: "Illusion", type: "physical", range: "LOS",    dvBase: 2, dvPerForce: 0, description: "Create illusory entity (senses)" },
  { name: "Silence",         category: "Illusion", type: "physical", range: "LOS(A)", dvBase: 1, dvPerForce: 0, description: "Silence zone (same as Hush, different focus)" },
  // ── Manipulation Spells (p. 170–175) ───────────────────────────────────────
  { name: "Agony",           category: "Manipulation", type: "mana",     range: "LOS",    dvBase: 2, dvPerForce: 0, description: "Paralyzing pain; victim loses next action" },
  { name: "Chaos",           category: "Manipulation", type: "mana",     range: "LOS(A)", dvBase: 2, dvPerForce: 0, description: "Disrupts electronic systems in area" },
  { name: "Control Actions", category: "Manipulation", type: "mana",     range: "LOS",    dvBase: 2, dvPerForce: 0, description: "Directly control target's body" },
  { name: "Control Thoughts",category: "Manipulation", type: "mana",     range: "LOS",    dvBase: 3, dvPerForce: 0, description: "Plant suggestion or command in mind" },
  { name: "Levitate",        category: "Manipulation", type: "physical", range: "LOS",    dvBase: 2, dvPerForce: 0, description: "Levitate target (2 kg per hit)" },
  { name: "Mana Barrier",    category: "Manipulation", type: "mana",     range: "LOS",    dvBase: 2, dvPerForce: 0, description: "Magical barrier blocking mana spells" },
  { name: "Physical Barrier",category: "Manipulation", type: "physical", range: "LOS",    dvBase: 2, dvPerForce: 0, description: "Physical force wall" },
  { name: "Shapechange",     category: "Manipulation", type: "mana",     range: "T",      dvBase: 3, dvPerForce: 0, description: "Transform target into an animal" },
  { name: "Stunball (area)", category: "Manipulation", type: "mana",     range: "LOS(A)", dvBase: 1, dvPerForce: 0, description: "Area mental stun" },
  { name: "Wreck",           category: "Manipulation", type: "physical", range: "LOS",    dvBase: 2, dvPerForce: 0, description: "Destroy one inanimate object (hits = boxes damage)" },
];

/** Look up a spell by case-insensitive name. */
export function lookupSpell(name: string): ISpellEntry | null {
  const lower = name.toLowerCase();
  return SPELL_CATALOGUE.find((s) => s.name.toLowerCase() === lower) ?? null;
}
