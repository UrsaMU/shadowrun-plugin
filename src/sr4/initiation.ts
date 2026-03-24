// ─── Initiation & Submersion rules (SR4A pp. 198–200, 268–270) ────────────────

/**
 * Karma cost to advance to the next initiation/submersion grade.
 * SR4A p. 199: cost = 10 × newGrade.
 */
export function initiationCost(newGrade: number): number {
  return 10 * newGrade;
}

/**
 * Maximum Magic attribute with a given initiation grade.
 * Base cap is 6; each grade adds 1 (SR4A p. 199).
 */
export function magicCap(initiationGrade: number): number {
  return 6 + initiationGrade;
}

/**
 * Maximum Resonance attribute with a given submersion grade.
 * Base cap is 6; each grade adds 1 (SR4A p. 268).
 */
export function resonanceCap(submersionGrade: number): number {
  return 6 + submersionGrade;
}

// ── Metamagic catalogue ───────────────────────────────────────────────────────
// SR4A pp. 198–200

export interface IMetamagicEntry {
  name: string;
  description: string;
}

export const METAMAGIC_LIST: IMetamagicEntry[] = [
  { name: "Centering",   description: "Reduce drain DV by grade; counters wound modifiers on magic tests." },
  { name: "Masking",     description: "Hide magical signature; grade added to conceal aura on astral." },
  { name: "Shielding",   description: "Add grade to Counterspelling dice against hostile spells." },
  { name: "Anchoring",   description: "Sustain spells without losing dice; attach spell to a focus or anchor." },
  { name: "Reflexion",   description: "Reflect offensive spells back at the caster (contested test)." },
  { name: "Assensing",   description: "Improve astral perception; grade added to assensing pool." },
  { name: "Cleansing",   description: "Reduce background count in a domain; requires lodge." },
  { name: "Divining",    description: "Contact mentor spirit for information (roleplay; GM adjudicates)." },
  { name: "Invoking",    description: "Bind spirits of greater Force than normal; adds grade to limit." },
  { name: "Sensing",     description: "Project senses without projecting aura (remote sensing)." },
  { name: "Channeling",  description: "Allow a spirit to inhabit your body, borrowing its powers." },
  { name: "Possession",  description: "Allow a spirit to possess another vessel entirely." },
];

/** Look up a metamagic by case-insensitive name. */
export function lookupMetamagic(name: string): IMetamagicEntry | null {
  const lower = name.toLowerCase();
  return METAMAGIC_LIST.find((m) => m.name.toLowerCase() === lower) ?? null;
}

// ── Echo catalogue ─────────────────────────────────────────────────────────────
// SR4A pp. 268–270

export interface IEchoEntry {
  name: string;
  description: string;
}

export const ECHO_LIST: IEchoEntry[] = [
  { name: "Amplification",    description: "Increase signal rating of commlink by submersion grade." },
  { name: "Compression",      description: "Reduce Matrix Condition Monitor damage taken by 1 per grade." },
  { name: "Diagnostics",      description: "Identify IC and node defenses before engaging (free action)." },
  { name: "Encryption",       description: "Add grade to system rating for purposes of IC detection." },
  { name: "Filtering",        description: "Reduce harmful Matrix attacks by grade before resistance roll." },
  { name: "Ghosting",         description: "Reduce Matrix signature by grade; harder to trace or detect." },
  { name: "Infusion",         description: "Bond a Complex Form to a sprite for extended duration." },
  { name: "Intuition",        description: "Add grade to Matrix Perception tests." },
  { name: "Resonance Channel",description: "Communicate with sprites across any distance via Resonance." },
  { name: "Stability",        description: "Reduce fading DV by grade (stacks with Resonance attribute)." },
  { name: "Threading",        description: "Compile complex forms faster; reduce interval by 1 per grade." },
];

/** Look up an echo by case-insensitive name. */
export function lookupEcho(name: string): IEchoEntry | null {
  const lower = name.toLowerCase();
  return ECHO_LIST.find((e) => e.name.toLowerCase() === lower) ?? null;
}
