// ─── Knowledge & Language skill rules (SR4A pp. 115–116) ─────────────────────

import type { IKnowledgeSkill, ILanguageSkill } from "../types.ts";

export const KNOWLEDGE_CATEGORIES = ["academic", "street", "professional", "interest"] as const;
export type KnowledgeCategory = typeof KNOWLEDGE_CATEGORIES[number];

export const LANGUAGE_SKILL_BP = 2;  // per additional language
export const KNOWLEDGE_KARMA_FACTOR = 1; // new rating × 1 karma to advance
export const LANGUAGE_KARMA_FACTOR  = 1; // same rate as knowledge skills

/**
 * BP cost for all non-native language skills during chargen.
 * Native language is free. Each additional language costs 2 BP per point of rating.
 * SR4A p. 116.
 */
export function languagesBP(languages: Record<string, ILanguageSkill>): number {
  return Object.values(languages).reduce((sum, l) => {
    if (l.native) return sum;
    return sum + l.rating * LANGUAGE_SKILL_BP;
  }, 0);
}

/**
 * Karma cost to advance a knowledge or language skill.
 * SR4A p. 116: new rating × 1.
 */
export function knowledgeAdvanceCost(newRating: number): number {
  return newRating * KNOWLEDGE_KARMA_FACTOR;
}

import { isPrototypePoisonKey } from "./validation.ts";

/**
 * Validate a knowledge skill name (max 60 chars, non-empty).
 * H2 FIX: Rejects prototype-polluting keys and __ prefix.
 * Returns an error string on failure, or null on success.
 */
export function validateKnowledgeName(name: string): string | null {
  if (!name || name.trim().length === 0) return "Skill name cannot be empty.";
  if (name.length > 60) return "Skill name must be 60 characters or fewer.";
  if (isPrototypePoisonKey(name)) return "Invalid skill name.";
  return null;
}

/**
 * Validate a knowledge skill rating (1–12).
 */
export function validateKnowledgeRating(rating: number): string | null {
  if (!Number.isInteger(rating) || rating < 1 || rating > 12) {
    return "Rating must be an integer from 1 to 12.";
  }
  return null;
}

/**
 * Validate a knowledge skill category.
 */
export function validateKnowledgeCategory(category: string): string | null {
  if (!KNOWLEDGE_CATEGORIES.includes(category as KnowledgeCategory)) {
    return `Category must be one of: ${KNOWLEDGE_CATEGORIES.join(", ")}.`;
  }
  return null;
}
