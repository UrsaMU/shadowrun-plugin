// ─── Knowledge & Language skill pure function tests (SR4A pp. 115–116) ────────

import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  languagesBP,
  knowledgeAdvanceCost,
  validateKnowledgeName,
  validateKnowledgeRating,
  validateKnowledgeCategory,
  KNOWLEDGE_CATEGORIES,
  LANGUAGE_SKILL_BP,
} from "../src/sr4/knowledge.ts";
import type { IKnowledgeSkill, ILanguageSkill } from "../src/types.ts";
import { mockChar } from "./helpers/mockU.ts";

// ── KNOWLEDGE_CATEGORIES ──────────────────────────────────────────────────────

describe("KNOWLEDGE_CATEGORIES", () => {
  it("contains academic, street, professional, interest", () => {
    for (const c of ["academic", "street", "professional", "interest"]) {
      assertEquals(KNOWLEDGE_CATEGORIES.includes(c as never), true);
    }
  });
  it("has exactly 4 categories", () => assertEquals(KNOWLEDGE_CATEGORIES.length, 4));
});

// ── languagesBP() ─────────────────────────────────────────────────────────────

describe("languagesBP()", () => {
  it("empty → 0",                        () => assertEquals(languagesBP({}), 0));
  it("native only → 0",                  () => assertEquals(languagesBP({ English: { rating: 6, native: true } }), 0));
  it("rating 3 non-native → 6 BP",       () => assertEquals(languagesBP({ Japanese: { rating: 3 } }), 6));
  it("rating 1 non-native → 2 BP",       () => assertEquals(languagesBP({ Spanish: { rating: 1 } }), 2));
  it("native + rating 2 → 4 BP",         () =>
    assertEquals(languagesBP({ English: { rating: 6, native: true }, Japanese: { rating: 2 } }), 4));
  it("two non-native → sum of costs",    () =>
    assertEquals(languagesBP({ Japanese: { rating: 3 }, Spanish: { rating: 2 } }), 10));
  it("LANGUAGE_SKILL_BP constant is 2",  () => assertEquals(LANGUAGE_SKILL_BP, 2));
});

// ── knowledgeAdvanceCost() ────────────────────────────────────────────────────

describe("knowledgeAdvanceCost()", () => {
  it("new rating 1 → 1 karma",   () => assertEquals(knowledgeAdvanceCost(1), 1));
  it("new rating 2 → 2 karma",   () => assertEquals(knowledgeAdvanceCost(2), 2));
  it("new rating 5 → 5 karma",   () => assertEquals(knowledgeAdvanceCost(5), 5));
  it("new rating 12 → 12 karma", () => assertEquals(knowledgeAdvanceCost(12), 12));
});

// ── validateKnowledgeName() ───────────────────────────────────────────────────

describe("validateKnowledgeName()", () => {
  it("normal name → null",          () => assertEquals(validateKnowledgeName("Corporate Law"), null));
  it("empty → error",               () => assertEquals(typeof validateKnowledgeName(""), "string"));
  it("whitespace → error",          () => assertEquals(typeof validateKnowledgeName("   "), "string"));
  it("61 chars → error",            () => assertEquals(typeof validateKnowledgeName("a".repeat(61)), "string"));
  it("60 chars → null",             () => assertEquals(validateKnowledgeName("a".repeat(60)), null));
});

// ── validateKnowledgeRating() ─────────────────────────────────────────────────

describe("validateKnowledgeRating()", () => {
  it("1 → null",              () => assertEquals(validateKnowledgeRating(1), null));
  it("12 → null",             () => assertEquals(validateKnowledgeRating(12), null));
  it("6 → null",              () => assertEquals(validateKnowledgeRating(6), null));
  it("0 → error",             () => assertEquals(typeof validateKnowledgeRating(0), "string"));
  it("13 → error",            () => assertEquals(typeof validateKnowledgeRating(13), "string"));
  it("non-integer → error",   () => assertEquals(typeof validateKnowledgeRating(3.5), "string"));
  it("negative → error",      () => assertEquals(typeof validateKnowledgeRating(-1), "string"));
});

// ── validateKnowledgeCategory() ──────────────────────────────────────────────

describe("validateKnowledgeCategory()", () => {
  it("academic → null",       () => assertEquals(validateKnowledgeCategory("academic"), null));
  it("street → null",         () => assertEquals(validateKnowledgeCategory("street"), null));
  it("professional → null",   () => assertEquals(validateKnowledgeCategory("professional"), null));
  it("interest → null",       () => assertEquals(validateKnowledgeCategory("interest"), null));
  it("unknown → error",       () => assertEquals(typeof validateKnowledgeCategory("illegal"), "string"));
  it("empty → error",         () => assertEquals(typeof validateKnowledgeCategory(""), "string"));
  it("uppercase → error",     () => assertEquals(typeof validateKnowledgeCategory("Academic"), "string"));
});

// ── IShadowrunChar knowledge/language defaults ────────────────────────────────

describe("IShadowrunChar knowledge & language defaults", () => {
  it("knowledgeSkills defaults to {}",  () => assertEquals(mockChar().knowledgeSkills, {}));
  it("languages defaults to {}",        () => assertEquals(mockChar().languages, {}));

  it("can set knowledge skills", () => {
    const ks: Record<string, IKnowledgeSkill> = {
      "Corporate Law": { rating: 4, category: "academic" },
    };
    assertEquals(mockChar({ knowledgeSkills: ks }).knowledgeSkills, ks);
  });

  it("can set languages", () => {
    const langs: Record<string, ILanguageSkill> = {
      English: { rating: 6, native: true },
    };
    assertEquals(mockChar({ languages: langs }).languages, langs);
  });
});
