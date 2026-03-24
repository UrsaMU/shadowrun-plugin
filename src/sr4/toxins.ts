// ─── Toxin & Drug rules (SR4A pp. 256–264) ───────────────────────────────────

/**
 * Toxin vector — how the substance enters the body.
 */
export type ToxinVector = "contact" | "inhalation" | "ingestion" | "injection";

/**
 * Toxin effect type.
 */
export type ToxinEffect = "stun" | "physical" | "disorientation" | "nausea" | "knockout";

export interface IToxinEntry {
  name: string;
  /** Speed at which the toxin takes effect. */
  speed: "immediate" | "1 combat turn" | "1 minute" | "10 minutes";
  /** How the toxin enters the body. */
  vector: ToxinVector;
  /** Power rating — determines DV. */
  power: number;
  /**
   * Resistance attribute.
   * Most toxins resist with Body; some (neuro) use Willpower.
   */
  resistAttr: "Body" | "Willpower";
  effect: ToxinEffect;
  description: string;
}

/**
 * Toxin damage = max(0, power − resistHits).
 * SR4A p. 257.
 */
export function toxinDamage(power: number, resistHits: number): number {
  return Math.max(0, power - resistHits);
}

/**
 * Resistance pool for a toxin: Body or Willpower as specified.
 */
export function toxinResistPool(
  resistAttr: IToxinEntry["resistAttr"],
  body: number,
  willpower: number,
): number {
  return resistAttr === "Body" ? body : willpower;
}

/**
 * H1 FIX: Resistance pool derived from character sheet attributes, not user input.
 * Accepts a character object and reads the correct attr directly — no override possible.
 */
export function toxinResistPoolFromChar(
  toxin: IToxinEntry,
  char: { attrs: Record<string, number> },
): number {
  const val = char.attrs[toxin.resistAttr] ?? 1;
  return val;
}

// ── Drug tolerance & addiction ────────────────────────────────────────────────

export interface IDrugEntry extends IToxinEntry {
  /** Attribute bonus while active. */
  bonus: Partial<Record<string, number>>;
  /** Duration in combat turns. */
  duration: number;
  /** Addiction threshold — rolls ≤ this trigger addiction test. */
  addictionThreshold: number;
  /** Addiction rating — difficulty of beating the addiction. */
  addictionRating: number;
}

/**
 * Crash DV after drug wears off = addictionRating as stun damage.
 * SR4A p. 260.
 */
export function drugCrashDv(addictionRating: number): number {
  return addictionRating;
}

/**
 * Determine if a character passes the addiction test.
 * Test: Body + Willpower ≥ addictionThreshold.
 * SR4A p. 261.
 */
export function addictionTestPass(
  body: number,
  willpower: number,
  addictionThreshold: number,
  hits: number,
): boolean {
  return hits >= addictionThreshold;
}

// ── Toxin catalogue ───────────────────────────────────────────────────────────
// SR4A pp. 257–264

export const TOXIN_CATALOGUE: IToxinEntry[] = [
  { name: "Gamma-Scopolamine",   speed: "1 combat turn", vector: "injection",   power: 9,  resistAttr: "Body",     effect: "knockout",      description: "Truth serum; causes unconsciousness on failed resistance." },
  { name: "Neuro-Stun VIII",     speed: "immediate",     vector: "contact",     power: 10, resistAttr: "Body",     effect: "stun",          description: "Nerve agent; stun damage on contact." },
  { name: "Pepper Punch",        speed: "immediate",     vector: "inhalation",  power: 6,  resistAttr: "Body",     effect: "disorientation", description: "Capsaicin spray; penalties to actions for several turns." },
  { name: "Narcoject",           speed: "1 combat turn", vector: "injection",   power: 10, resistAttr: "Body",     effect: "knockout",      description: "Dart gun tranquilizer; nonlethal takedown agent." },
  { name: "Atropine",            speed: "1 minute",      vector: "ingestion",   power: 8,  resistAttr: "Body",     effect: "physical",      description: "Nerve toxin; physical damage on exposure." },
  { name: "Kamikaze",            speed: "immediate",     vector: "ingestion",   power: 0,  resistAttr: "Body",     effect: "stun",          description: "Combat stimulant. Stat boosts, crash, addiction." },
];

// ── Drug catalogue ────────────────────────────────────────────────────────────

export const DRUG_CATALOGUE: IDrugEntry[] = [
  {
    name: "Kamikaze",
    speed: "immediate",
    vector: "ingestion",
    power: 0,
    resistAttr: "Body",
    effect: "stun",
    bonus: { Body: 3, Agility: 1, Reaction: 1, Strength: 3 },
    duration: 10,
    addictionThreshold: 3,
    addictionRating: 4,
    description: "Combat stim; heavy stat boosts, crash DV 4 stun, addictive.",
  },
  {
    name: "Jazz",
    speed: "immediate",
    vector: "ingestion",
    power: 0,
    resistAttr: "Body",
    effect: "stun",
    bonus: { Reaction: 2, Agility: 2 },
    duration: 5,
    addictionThreshold: 2,
    addictionRating: 3,
    description: "Speed stim; minor crash, addictive.",
  },
  {
    name: "Cram",
    speed: "immediate",
    vector: "ingestion",
    power: 0,
    resistAttr: "Body",
    effect: "stun",
    bonus: { Reaction: 1, Willpower: 1 },
    duration: 8,
    addictionThreshold: 2,
    addictionRating: 2,
    description: "Focus stimulant; moderate crash, mildly addictive.",
  },
];

/** Look up a toxin by case-insensitive name. */
export function lookupToxin(name: string): IToxinEntry | null {
  const lower = name.toLowerCase();
  return TOXIN_CATALOGUE.find((t) => t.name.toLowerCase() === lower) ?? null;
}

/** Look up a drug by case-insensitive name. */
export function lookupDrug(name: string): IDrugEntry | null {
  const lower = name.toLowerCase();
  return DRUG_CATALOGUE.find((d) => d.name.toLowerCase() === lower) ?? null;
}
