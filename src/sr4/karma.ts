// ─── SR4 karma advancement costs and validation (pure, no I/O) ────────────────
// SR4A pp. 148–149: skill +1 = newRating×2; attr +1 = newRating×5; spec = 2.

import type { IShadowrunChar } from "../types.ts";
import { CHAR_ATTRS } from "../types.ts";
import { getMetatype } from "./metatypes.ts";

export const SKILL_MAX_RATING      = 6;
export const SPEC_COST             = 2;
export const MAX_KARMA_AWARD       = 1000;
export const MAX_KARMA_REASON_LEN  = 200;

// ── cost functions ────────────────────────────────────────────────────────────

/**
 * Karma to raise an active skill from `from` to `to`.
 * Cost per step = newRating × 2.
 */
export function skillAdvanceCost(from: number, to: number): number {
  if (to <= from || from < 0 || to > SKILL_MAX_RATING) return 0;
  let cost = 0;
  for (let r = from + 1; r <= to; r++) cost += r * 2;
  return cost;
}

/**
 * Karma to raise an attribute from `from` to `to`.
 * Cost per step = newRating × 5.
 */
export function attrAdvanceCost(from: number, to: number): number {
  if (to <= from || from < 0) return 0;
  let cost = 0;
  for (let r = from + 1; r <= to; r++) cost += r * 5;
  return cost;
}

/**
 * Karma to raise a skill group from `from` to `to`.
 * Cost per step = newRating × 5 × numSkills.
 */
export function skillGroupAdvanceCost(from: number, to: number, numSkills: number): number {
  if (to <= from || from < 0 || to > SKILL_MAX_RATING || numSkills < 1) return 0;
  let cost = 0;
  for (let r = from + 1; r <= to; r++) cost += r * 5 * numSkills;
  return cost;
}

// ── validation functions ──────────────────────────────────────────────────────

/** Returns null if valid, or an error string to show the player. */
export function validateKarmaAdvanceSkill(
  char: IShadowrunChar,
  skillName: string,
  newRating: number,
): string | null {
  const current = char.skills[skillName]?.rating ?? 0;
  if (!Number.isInteger(newRating) || newRating < 1) return "New rating must be a positive integer.";
  if (newRating <= current) return `${skillName} is already at rating ${current}.`;
  if (newRating > SKILL_MAX_RATING)  return `Skills cap at rating ${SKILL_MAX_RATING}.`;
  const cost = skillAdvanceCost(current, newRating);
  if (char.karmaAvailable < cost) {
    return `Need ${cost} karma for ${skillName} ${current}→${newRating}; you have ${char.karmaAvailable}.`;
  }
  return null;
}

/** Returns null if valid, or an error string to show the player. */
export function validateKarmaAdvanceAttr(
  char: IShadowrunChar,
  attrName: string,
  newRating: number,
): string | null {
  if (!(CHAR_ATTRS as readonly string[]).includes(attrName)) {
    return `"${attrName}" is not a valid attribute.`;
  }
  const current = char.attrs[attrName] ?? 0;
  const meta     = getMetatype(char.metatype);
  const attrMax  = meta?.attrs[attrName]?.[1] ?? 6;
  if (!Number.isInteger(newRating) || newRating < 1) return "New rating must be a positive integer.";
  if (newRating <= current) return `${attrName} is already at ${current}.`;
  if (newRating > attrMax)  return `${attrName} maximum for ${char.metatype} is ${attrMax}.`;
  const cost = attrAdvanceCost(current, newRating);
  if (char.karmaAvailable < cost) {
    return `Need ${cost} karma for ${attrName} ${current}→${newRating}; you have ${char.karmaAvailable}.`;
  }
  return null;
}

/** Returns null if valid, or an error string to show the player. */
export function validateKarmaAdvanceSpec(
  char: IShadowrunChar,
  skillName: string,
  specName: string,
): string | null {
  const skill = char.skills[skillName];
  if (!skill || skill.rating < 1) return `You have no skill named "${skillName}".`;
  if (skill.spec)                 return `${skillName} already has specialization "${skill.spec}".`;
  if (!specName.trim())           return "Specialization name cannot be empty.";
  if (char.karmaAvailable < SPEC_COST) {
    return `Need ${SPEC_COST} karma for a specialization; you have ${char.karmaAvailable}.`;
  }
  return null;
}

/**
 * Returns null if the skill group advance is valid, or an error string.
 * @param skills  Canonical list of skills in the group.
 */
export function validateKarmaAdvanceSkillGroup(
  char: IShadowrunChar,
  groupName: string,
  skills: string[],
  newRating: number,
): string | null {
  if (skills.length === 0) return `Unknown skill group "${groupName}".`;
  const ratings = skills.map((s) => char.skills[s]?.rating ?? 0);
  const current = ratings[0];
  if (ratings.some((r) => r !== current)) {
    return `${groupName} group is broken (mixed ratings). Advance each skill individually.`;
  }
  if (!Number.isInteger(newRating) || newRating < 1) return "New rating must be a positive integer.";
  if (newRating <= current) return `${groupName} group is already at rating ${current}.`;
  if (newRating > SKILL_MAX_RATING)  return `Skill groups cap at rating ${SKILL_MAX_RATING}.`;
  const cost = skillGroupAdvanceCost(current, newRating, skills.length);
  if (char.karmaAvailable < cost) {
    return `Need ${cost} karma for ${groupName} group ${current}→${newRating}; you have ${char.karmaAvailable}.`;
  }
  return null;
}
