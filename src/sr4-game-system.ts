// ─── SR4 Game System Definition ──────────────────────────────────────────────
//
// Registers Shadowrun 4E as an ai-gm IGameSystem by writing to the shared
// `server.gm.custom_systems` DBO collection that ai-gm's loadCustomSystems()
// reads on startup.  A `gm:system:register` event is also emitted so
// ai-gm can register the system immediately if already running.
//
// No import from @ursamu/ai-gm is needed — we match the IStoredGameSystem
// shape by convention (structural typing) and the shared DBO collection name.

import { DBO, gameHooks } from "@ursamu/ursamu";

// ─── IStoredGameSystem shape (mirrors ai-gm/systems/store.ts) ────────────────
// Kept local so this plugin has zero dependency on @ursamu/ai-gm.

interface IStoredGameSystem {
  id: string;
  name: string;
  version: string;
  source: "ingested";
  ingestedFrom: string[];
  confidence: Record<string, "high" | "uncertain">;
  coreRulesPrompt: string;
  moveThresholds: { fullSuccess: number; partialSuccess: number };
  stats: string[];
  adjudicationHint: string;
  hardMoves: string[];
  softMoves: string[];
  missConsequenceHint: string;
  categories: string[];
  statsByCategory: Record<string, string[]>;
}

// ─── Shared DBO — same namespace ai-gm reads on startup ──────────────────────

const gmCustomSystems = new DBO<IStoredGameSystem>("server.gm.custom_systems");

// ─── Stat lists ───────────────────────────────────────────────────────────────

const CORE_ATTRS = [
  "Body", "Agility", "Reaction", "Strength",
  "Charisma", "Intuition", "Logic", "Willpower", "Edge", "Essence",
];
const SPECIAL_ATTRS = ["Magic", "Resonance"];
const ALL_STATS = [...CORE_ATTRS, ...SPECIAL_ATTRS];

// ─── System definition ────────────────────────────────────────────────────────

const sr4System: IStoredGameSystem = {
  id: "shadowrun-4e",
  name: "Shadowrun 4th Edition (20th Anniversary)",
  version: "0.2.0",
  source: "ingested",
  ingestedFrom: ["@ursamu/shadowrun-plugin"],
  confidence: {
    dicePool: "high",
    glitchRules: "high",
    combatTracks: "high",
    moveThresholds: "high",
    karma: "high",
    matrixRules: "high",
    magicRules: "high",
  },

  coreRulesPrompt: `
SHADOWRUN 4TH EDITION (20th Anniversary) — GM RULES REFERENCE

DICE POOL TESTS
  Roll a pool of d6s (Attribute + Skill, or as specified by the situation).
  Each die showing 5 or 6 = one Hit.
  Most tests have a Threshold — the number of Hits needed to succeed.
  Net Hits = Hits − Threshold (extra margin of success).

GLITCH RULES
  Glitch: half or more of the dice show 1s. Succeed with complications.
  Critical Glitch: Glitch WITH zero Hits. Catastrophic, immediate consequence.
  Both types should be narrated dramatically — they shift the story hard.

ADJUDICATION THRESHOLDS (for this GM system)
  4+ Hits  = Full Success    — task done cleanly, possibly with advantage
  1–3 Hits = Partial Success — succeed with cost, reduced effect, or complication
  0 Hits   = Failure         — GM makes a hard move; Glitch = severe move

CONDITION MONITORS
  Physical track: ceil(Body/2) + 8 boxes. Filled = dying (then dead).
  Stun track:     ceil(Willpower/2) + 8 boxes. Filled = unconscious.
  Physical overflow spills into Stun box-for-box.
  Wound Modifiers: −1 die per 3 boxes filled (cumulative across both tracks).

EDGE
  Edge can be burned to reroll all non-hits once per test.
  A Critical Glitch on an Edge roll is even more catastrophic.

MATRIX & ASTRAL
  Matrix: Hacker or Technomancer tests are dice pool tests vs system ratings.
  Astral: Magic users project or cast using Magic + skill dice pools.
  Both domains have their own Condition Monitors (Matrix Damage, Drain).

FICTION FIRST
  The dice tell us WHAT happened mechanically. You narrate WHY and HOW.
  This is a world of corporate shadows, moral grey areas, and hired danger.
  Competent runners fail in interesting ways. Stakes always escalate.
`.trim(),

  moveThresholds: { fullSuccess: 4, partialSuccess: 1 },
  stats: ALL_STATS,

  adjudicationHint:
    "SR4 is corporate-noir: professionals in a dangerous world where even " +
    "success has a cost. Narrate outcomes with tension and consequence. " +
    "Glitches are story pivots, not just mechanical penalties. " +
    "Keep the world cynical, tactile, and alive.",

  hardMoves: [
    "A contact goes dark — someone is listening on the line",
    "The security response arrives faster than the plan accounted for",
    "The weapon jams, misfires, or runs dry at the worst moment",
    "The ICE traces the intrusion back to the team's location",
    "The target wasn't alone; backup has been called",
    "The critical glitch: cyberware misfires mid-run",
    "The spirit breaks free of control and turns hostile",
    "The team's safe house or vehicle is compromised",
    "A bystander captures footage and it is already uploading",
    "The Johnson moves the goalposts — the job just got harder",
  ],

  softMoves: [
    "You get what you want, but it takes longer and leaves evidence",
    "The shot connects, but not cleanly — the fight continues",
    "You get in, but your cover is blown one layer deep",
    "The matrix run succeeds, but your persona is flagged for review",
    "The negotiation works — but now they want a favor in return",
    "You find what you're looking for, but someone else already knows it",
    "The escape route is clear, but the team is now separated",
    "The damage is done, but the complication will surface later",
  ],

  missConsequenceHint:
    "In Shadowrun, failure means the run turns bad — raise the stakes, " +
    "bring in complications, make the world push back. " +
    "Critical glitch = catastrophic and immediate, no saving throws. " +
    "Never narrate 'nothing happens' on a failure.",

  categories: ["Attributes", "Special"],
  statsByCategory: {
    "Attributes": CORE_ATTRS,
    "Special": SPECIAL_ATTRS,
  },
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Upserts the SR4 game system record into the shared ai-gm DBO collection
 * so it is loaded by ai-gm's loadCustomSystems() on next startup.
 * Also emits `gm:system:register` so a running ai-gm instance registers
 * the system immediately without requiring a restart.
 */
export async function seedSr4GameSystem(): Promise<void> {
  const existing = await gmCustomSystems.findOne({ id: sr4System.id });
  if (existing) {
    await gmCustomSystems.update({ id: sr4System.id }, sr4System);
  } else {
    await gmCustomSystems.create(sr4System);
  }

  // In-process event: ai-gm can pick this up immediately if already running.
  await gameHooks.emit(
    "gm:system:register" as never,
    { system: sr4System } as never,
  );

  console.log("[shadowrun] SR4 game system seeded into server.gm.custom_systems.");
}
