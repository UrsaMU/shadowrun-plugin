// ─── Critter & NPC stat blocks (SR4A pp. 293–326) ────────────────────────────

export interface ICritterEntry {
  name: string;
  category: "mundane" | "paranormal" | "npc" | "spirit";
  /** Core attributes. */
  attrs: {
    Body:      number;
    Agility:   number;
    Reaction:  number;
    Strength:  number;
    Charisma:  number;
    Intuition: number;
    Logic:     number;
    Willpower: number;
    Edge:      number;
  };
  /** Initiative = Reaction + Intuition. */
  initiative: number;
  /** Physical Condition Monitor = ceil(Body/2) + 8. */
  physicalCM: number;
  /** Natural armor. */
  armor: number;
  /** Skill pools relevant to combat (simplified). */
  combatPool: number;
  /** Brief description. */
  description: string;
}

/** Physical CM formula (same as characters). */
export function critterCmBoxes(body: number): number {
  return Math.ceil(body / 2) + 8;
}

/** Initiative for a critter/NPC = Reaction + Intuition. */
export function critterInitiative(reaction: number, intuition: number): number {
  return reaction + intuition;
}

// ── NPC / Critter Catalogue ───────────────────────────────────────────────────
// Representative selection from SR4A pp. 293–326

export const CRITTER_CATALOGUE: ICritterEntry[] = [
  // ── Street NPCs ──────────────────────────────────────────────────────────────
  {
    name: "Ganger",
    category: "npc",
    attrs: { Body:3, Agility:3, Reaction:3, Strength:3, Charisma:2, Intuition:2, Logic:2, Willpower:2, Edge:2 },
    initiative: 5,
    physicalCM: critterCmBoxes(3),
    armor: 0,
    combatPool: 5,
    description: "Low-level street gang member. Pistol or melee.",
  },
  {
    name: "Street Samurai",
    category: "npc",
    attrs: { Body:4, Agility:5, Reaction:4, Strength:4, Charisma:2, Intuition:4, Logic:2, Willpower:3, Edge:3 },
    initiative: 8,
    physicalCM: critterCmBoxes(4),
    armor: 6,
    combatPool: 9,
    description: "Mid-tier hired muscle with military-grade implants.",
  },
  {
    name: "Security Guard",
    category: "npc",
    attrs: { Body:3, Agility:3, Reaction:3, Strength:3, Charisma:2, Intuition:3, Logic:2, Willpower:2, Edge:2 },
    initiative: 6,
    physicalCM: critterCmBoxes(3),
    armor: 4,
    combatPool: 6,
    description: "Corporate or private security guard; light armor, SMG.",
  },
  {
    name: "Corporate Spider",
    category: "npc",
    attrs: { Body:2, Agility:3, Reaction:4, Strength:2, Charisma:3, Intuition:5, Logic:5, Willpower:4, Edge:4 },
    initiative: 9,
    physicalCM: critterCmBoxes(2),
    armor: 2,
    combatPool: 7,
    description: "Matrix security specialist; defends corp node, remotely runs IC.",
  },
  // ── Paranormal critters ───────────────────────────────────────────────────────
  {
    name: "Devil Rat",
    category: "paranormal",
    attrs: { Body:1, Agility:4, Reaction:3, Strength:1, Charisma:1, Intuition:3, Logic:1, Willpower:2, Edge:2 },
    initiative: 6,
    physicalCM: critterCmBoxes(1),
    armor: 0,
    combatPool: 5,
    description: "Small but vicious mutant rat. Travels in packs; toxic bite.",
  },
  {
    name: "Hellhound",
    category: "paranormal",
    attrs: { Body:5, Agility:4, Reaction:4, Strength:5, Charisma:1, Intuition:3, Logic:1, Willpower:3, Edge:2 },
    initiative: 7,
    physicalCM: critterCmBoxes(5),
    armor: 3,
    combatPool: 8,
    description: "Dog-sized paranormal predator; breathes fire, hardy in urban sprawl.",
  },
  {
    name: "Barghest",
    category: "paranormal",
    attrs: { Body:8, Agility:4, Reaction:4, Strength:8, Charisma:1, Intuition:3, Logic:1, Willpower:5, Edge:2 },
    initiative: 7,
    physicalCM: critterCmBoxes(8),
    armor: 4,
    combatPool: 9,
    description: "Large, wolf-like spirit-touched beast; toxic bite, fear aura.",
  },
  {
    name: "Great Dragon (young)",
    category: "paranormal",
    attrs: { Body:20, Agility:6, Reaction:7, Strength:22, Charisma:9, Intuition:8, Logic:9, Willpower:10, Edge:6 },
    initiative: 15,
    physicalCM: critterCmBoxes(20),
    armor: 16,
    combatPool: 12,
    description: "A juvenile Great Dragon — terrifyingly powerful, low end of the scale.",
  },
  // ── Spirits (generic statlines — see also spirits.ts for tradition specifics) ─
  {
    name: "Spirit of Man (F4)",
    category: "spirit",
    attrs: { Body:4, Agility:4, Reaction:4, Strength:4, Charisma:4, Intuition:4, Logic:4, Willpower:4, Edge:4 },
    initiative: 8,
    physicalCM: critterCmBoxes(4),
    armor: 4,
    combatPool: 8,
    description: "Force-4 spirit of man. Humanoid form; Materialization, Guard, Accident powers.",
  },
  {
    name: "Spirit of Earth (F6)",
    category: "spirit",
    attrs: { Body:9, Agility:3, Reaction:3, Strength:9, Charisma:6, Intuition:6, Logic:6, Willpower:6, Edge:6 },
    initiative: 9,
    physicalCM: critterCmBoxes(9),
    armor: 9,
    combatPool: 9,
    description: "Force-6 earth spirit. Massive body; Movement, Engulf, Guard powers.",
  },
];

/** Look up a critter/NPC by case-insensitive name. */
export function lookupCritter(name: string): ICritterEntry | null {
  const lower = name.toLowerCase();
  return CRITTER_CATALOGUE.find((c) => c.name.toLowerCase() === lower) ?? null;
}
