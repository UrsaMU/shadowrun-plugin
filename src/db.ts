// ─── Shadowrun database layer ─────────────────────────────────────────────────

import { DBO } from "@ursamu/ursamu";
import type { IShadowrunChar } from "./types.ts";

/** All character records, keyed by playerId. */
export const chars = new DBO<IShadowrunChar>("shadowrun.chars");

/**
 * Fill in default values for fields added after the initial schema.
 * Called on every record retrieved from the DB so command code never
 * needs to defensively guard against missing new fields.
 */
function normalizeChar(raw: IShadowrunChar): IShadowrunChar {
  // deno-lint-ignore no-explicit-any
  const r = raw as any;
  r.contacts        ??= [];
  r.karmaAvailable  ??= 0;
  r.karmaTotal      ??= 0;
  r.karmaLog        ??= [];
  r.firstAidApplied ??= false;
  r.gear            ??= [];
  r.nuyenLog        ??= [];
  r.armorRating     ??= 0;
  r.armorImpact     ??= 0;
  r.recoilComp      ??= 0;
  r.recoilAccum     ??= 0;
  r.implants        ??= [];
  r.essence         ??= 6;
  r.initDiceBonus   ??= 0;
  r.spells          ??= [];
  r.magicLoss       ??= 0;
  r.astrally        ??= false;
  r.spirits         ??= [];
  r.adeptPowers     ??= [];
  r.complexForms    ??= [];
  r.matrixDmg       ??= 0;
  r.vehicles        ??= [];
  r.initiationGrade  ??= 0;
  r.submersionGrade  ??= 0;
  r.metamagics       ??= [];
  r.streetCred       ??= 0;
  r.notoriety        ??= 0;
  r.publicAwareness  ??= 0;
  r.lifestyle        ??= "low";
  r.knowledgeSkills  ??= {};
  r.languages        ??= {};
  return raw;
}

/**
 * Fetch the character record for a given player ID.
 * Returns null if the player has no character yet.
 */
export async function getChar(playerId: string): Promise<IShadowrunChar | null> {
  const results = await chars.find({ playerId });
  const char = results[0];
  return char ? normalizeChar(char) : null;
}

/**
 * Create or update a character record.
 * Keyed on playerId — a player can only have one character.
 */
export async function saveChar(char: IShadowrunChar): Promise<void> {
  const existing = await chars.find({ playerId: char.playerId });
  if (existing[0]) {
    await chars.update({ id: existing[0].id }, char);
  } else {
    await chars.create(char);
  }
}
