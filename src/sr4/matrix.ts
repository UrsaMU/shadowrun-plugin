// ─── Matrix / Hacking pure functions (SR4A pp. 212–285) ───────────────────────

import type { ICommlink } from "../types.ts";

// ── Condition Monitor ──────────────────────────────────────────────────────────

/**
 * Persona Condition Monitor boxes = 8 + ceil(System / 2).
 * SR4A p. 222.
 */
export function personaCmBoxes(systemRating: number): number {
  return 8 + Math.ceil(systemRating / 2);
}

// ── Programs ───────────────────────────────────────────────────────────────────

export interface IProgramEntry {
  name: string;
  category: "offensive" | "defensive" | "exploit" | "utility";
  effect: string;
}

export const PROGRAM_LIST: IProgramEntry[] = [
  { name: "Armor",         category: "defensive", effect: "+rating to Firewall vs. attack programs" },
  { name: "Attack",        category: "offensive", effect: "Deal Matrix damage; +rating to Cybercombat" },
  { name: "Stealth",       category: "defensive", effect: "+rating to avoid detection tests" },
  { name: "Exploit",       category: "exploit",   effect: "+rating to Hacking tests to gain access" },
  { name: "Spoof",         category: "exploit",   effect: "+rating to fake commands to devices" },
  { name: "Analyze",       category: "utility",   effect: "Analyze node/device; +rating to Analyze tests" },
  { name: "Browse",        category: "utility",   effect: "+rating to Matrix search tests" },
  { name: "Decrypt",       category: "utility",   effect: "+rating to decrypt encrypted data" },
  { name: "Encrypt",       category: "defensive", effect: "Encrypt data; Decrypt target = rating" },
  { name: "Track",         category: "utility",   effect: "+rating to trace signal to physical location" },
  { name: "Sniffer",       category: "utility",   effect: "Capture datastream passing through node" },
  { name: "Scan",          category: "utility",   effect: "+rating to detect other users on a node" },
  { name: "Defuse",        category: "defensive", effect: "+rating to resist hostile programs" },
  { name: "Evaluate",      category: "utility",   effect: "Assess IC/program rating before engaging" },
  { name: "ECCM",          category: "defensive", effect: "+rating to resist jamming on wireless links" },
  { name: "Biofeedback",   category: "offensive", effect: "Deals Physical (not Stun) damage to biologically connected user" },
  { name: "Blackout",      category: "offensive", effect: "Deals maximum Stun — ignores armor" },
  { name: "Blackhammer",   category: "offensive", effect: "Deals Physical damage to connected persona" },
  { name: "Medic",         category: "utility",   effect: "+rating to stabilize Matrix-damaged persona" },
];

/** Look up a program by case-insensitive name. */
export function lookupProgram(name: string): IProgramEntry | null {
  const lower = name.toLowerCase();
  return PROGRAM_LIST.find((p) => p.name.toLowerCase() === lower) ?? null;
}

// ── Hacking actions ────────────────────────────────────────────────────────────

export type HackAction =
  | "probe"        // detect node; Hacking+Logic vs Firewall
  | "access"       // gain account; Hacking+Logic vs Firewall (extended, threshold=Firewall)
  | "crash"        // crash program; Cybercombat+Logic vs program rating+Firewall
  | "attack"       // cybercombat; Cybercombat+Logic vs IC Pilot+Firewall
  | "spoof"        // send fake command; Spoof+Logic vs device Firewall
  | "trace"        // locate signal; Track+Logic vs Signal+Firewall
  | "edit"         // edit/insert/delete data; Computer+Logic vs node System+Firewall
  | "analyze"      // analyze node/IC; Analyze+Logic vs node System/2

export const HACK_ACTIONS: HackAction[] = [
  "probe", "access", "crash", "attack", "spoof", "trace", "edit", "analyze",
];

/**
 * Dice pool description for each hacking action.
 * Returns the dice pool components as a string.
 */
export function hackActionPool(action: HackAction): string {
  const pools: Record<HackAction, string> = {
    probe:   "Hacking + Logic vs. node Firewall",
    access:  "Hacking + Logic vs. node Firewall (extended, threshold = Firewall)",
    crash:   "Cybercombat + Logic vs. target program rating + Firewall",
    attack:  "Cybercombat + Logic vs. IC (Pilot + Firewall)",
    spoof:   "Computer + Logic vs. device Firewall",
    trace:   "Computer + Logic vs. Signal + Firewall",
    edit:    "Computer + Logic vs. System + Firewall",
    analyze: "Computer + Logic vs. System ÷ 2",
  };
  return pools[action];
}

// ── Commlink stats ─────────────────────────────────────────────────────────────

/**
 * Initiative score for a hacker in cold sim VR.
 * = Reaction + Intuition + 1d6 (standard), or 2d6 in hot sim.
 * This just returns the attribute sum; dice are rolled separately.
 */
export function matrixInitAttrSum(reaction: number, intuition: number): number {
  return reaction + intuition;
}

/**
 * Response cap for total active programs.
 * SR4A p. 228: total active programs cannot exceed Response rating.
 */
export function maxActivePrograms(responseRating: number): number {
  return responseRating;
}

/**
 * Validate commlink stats: each attribute must be 1–6.
 * Returns an error string or null.
 */
export function validateCommlink(cl: Partial<ICommlink>): string | null {
  const attrs: Array<keyof ICommlink> = ["firewall", "response", "signal", "system"];
  for (const attr of attrs) {
    const val = cl[attr] as number | undefined;
    if (val !== undefined && (typeof val !== "number" || val < 1 || val > 6 || !Number.isInteger(val))) {
      return `${attr} must be an integer 1–6 (got ${val}).`;
    }
  }
  return null;
}

// ── Technomancer ───────────────────────────────────────────────────────────────

export type SpriteType = "Courier" | "Crack" | "Data" | "Fault" | "Machine";

export const SPRITE_TYPES: SpriteType[] = ["Courier", "Crack", "Data", "Fault", "Machine"];

export const COMPLEX_FORM_LIST = [
  { name: "Resonance Spike",    description: "Deal Matrix damage to target node" },
  { name: "Static Veil",        description: "Hide presence on the Matrix" },
  { name: "Tattletale",         description: "Detect other users in target node" },
  { name: "Infusion of [Attribute]", description: "Boost one node attribute by Resonance" },
  { name: "Puppeteer",          description: "Control a device via Resonance" },
  { name: "Diffusion of [Attribute]", description: "Reduce one node attribute by Resonance" },
  { name: "Overwatch",          description: "Place persistent monitoring form on a node" },
  { name: "Binary Limit",       description: "Restrict Matrix actions from a node" },
  { name: "Interrupt",          description: "Interrupt data flow through a node" },
  { name: "Echos of Thunder",   description: "Resonate pulse; area Fault effect" },
];

/**
 * Fading (technomancer drain) DV and type.
 * Same formula as summoning drain: DV = max(ceil(Force/2), 2).
 * Type: Stun unless Force > Resonance → Physical.
 */
export function calcFadingDv(force: number, resonance: number): { dv: number; type: "physical" | "stun" } {
  const dv = Math.max(Math.ceil(force / 2), 2);
  return { dv, type: force > resonance ? "physical" : "stun" };
}

/**
 * Sprite Condition Monitor = 8 + ceil(Force / 2).
 */
export function spriteCmBoxes(force: number): number {
  return 8 + Math.ceil(force / 2);
}
