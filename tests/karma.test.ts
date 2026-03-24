// ─── Karma tests ──────────────────────────────────────────────────────────────

import { assertEquals, assertNotEquals, assertStringIncludes } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  skillAdvanceCost, attrAdvanceCost, skillGroupAdvanceCost, SPEC_COST,
  SKILL_MAX_RATING, MAX_KARMA_AWARD,
  validateKarmaAdvanceSkill, validateKarmaAdvanceAttr,
  validateKarmaAdvanceSpec, validateKarmaAdvanceSkillGroup,
} from "../src/sr4/karma.ts";
import { resolveSkillGroup, skillsInGroup, SKILL_GROUPS } from "../src/sr4/skillgroups.ts";
import { formatKarmaEntry } from "../src/karma-cmd.ts";
import { mockChar } from "./helpers/mockU.ts";
import type { IKarmaLogEntry } from "../src/types.ts";

// ── skillAdvanceCost ──────────────────────────────────────────────────────────

describe("skillAdvanceCost()", () => {
  it("0→1 costs 2 (1×2)", () => assertEquals(skillAdvanceCost(0, 1), 2));
  it("1→2 costs 4 (2×2)", () => assertEquals(skillAdvanceCost(1, 2), 4));
  it("3→4 costs 8 (4×2)", () => assertEquals(skillAdvanceCost(3, 4), 8));
  it("5→6 costs 12 (6×2)", () => assertEquals(skillAdvanceCost(5, 6), 12));

  it("multi-step: 3→6 = 8+10+12 = 30", () =>
    assertEquals(skillAdvanceCost(3, 6), 8 + 10 + 12));

  it("returns 0 when to ≤ from", () => assertEquals(skillAdvanceCost(4, 4), 0));
  it("returns 0 when to > SKILL_MAX_RATING", () =>
    assertEquals(skillAdvanceCost(5, SKILL_MAX_RATING + 1), 0));
});

// ── attrAdvanceCost ───────────────────────────────────────────────────────────

describe("attrAdvanceCost()", () => {
  it("1→2 costs 10 (2×5)", () => assertEquals(attrAdvanceCost(1, 2), 10));
  it("4→5 costs 25 (5×5)", () => assertEquals(attrAdvanceCost(4, 5), 25));

  it("multi-step: 3→5 = 20+25 = 45", () =>
    assertEquals(attrAdvanceCost(3, 5), 20 + 25));

  it("returns 0 when to ≤ from", () => assertEquals(attrAdvanceCost(3, 3), 0));
});

// ── skillGroupAdvanceCost ─────────────────────────────────────────────────────

describe("skillGroupAdvanceCost()", () => {
  it("Firearms group (3 skills): 0→1 costs 1×5×3=15", () =>
    assertEquals(skillGroupAdvanceCost(0, 1, 3), 15));

  it("2→3 for 3-skill group: 3×5×3=45", () =>
    assertEquals(skillGroupAdvanceCost(2, 3, 3), 45));

  it("Electronics group (4 skills): 3→4 costs 4×5×4=80", () =>
    assertEquals(skillGroupAdvanceCost(3, 4, 4), 80));

  it("returns 0 when to ≤ from", () =>
    assertEquals(skillGroupAdvanceCost(3, 3, 3), 0));

  it("returns 0 when numSkills < 1", () =>
    assertEquals(skillGroupAdvanceCost(0, 1, 0), 0));
});

// ── SPEC_COST constant ────────────────────────────────────────────────────────

describe("SPEC_COST", () => {
  it("is 2 (SR4A p. 149)", () => assertEquals(SPEC_COST, 2));
});

// ── validateKarmaAdvanceSkill ─────────────────────────────────────────────────

describe("validateKarmaAdvanceSkill()", () => {
  it("valid upgrade → null", () => {
    const char = mockChar({ skills: { Pistols: { rating: 3 } }, karmaAvailable: 20 });
    assertEquals(validateKarmaAdvanceSkill(char, "Pistols", 4), null);
  });

  it("not enough karma → error", () => {
    const char = mockChar({ skills: { Pistols: { rating: 3 } }, karmaAvailable: 5 });
    assertNotEquals(validateKarmaAdvanceSkill(char, "Pistols", 4), null);
  });

  it("new rating ≤ current → error", () => {
    const char = mockChar({ skills: { Pistols: { rating: 4 } }, karmaAvailable: 50 });
    assertNotEquals(validateKarmaAdvanceSkill(char, "Pistols", 4), null);
  });

  it("new rating > SKILL_MAX_RATING → error", () => {
    const char = mockChar({ skills: { Pistols: { rating: 6 } }, karmaAvailable: 99 });
    assertNotEquals(validateKarmaAdvanceSkill(char, "Pistols", SKILL_MAX_RATING + 1), null);
  });

  it("buying skill from scratch (rating 0→1) costs 2 karma", () => {
    const char = mockChar({ skills: {}, karmaAvailable: 2 });
    assertEquals(validateKarmaAdvanceSkill(char, "Pistols", 1), null);
  });
});

// ── validateKarmaAdvanceAttr ──────────────────────────────────────────────────

describe("validateKarmaAdvanceAttr()", () => {
  it("valid Human Body 3→4 → null", () => {
    const char = mockChar({ attrs: { Body: 3, Agility: 3, Reaction: 3, Strength: 3, Charisma: 3, Intuition: 3, Logic: 3, Willpower: 3, Edge: 2 }, karmaAvailable: 30 });
    assertEquals(validateKarmaAdvanceAttr(char, "Body", 4), null);
  });

  it("invalid attr name → error", () => {
    const char = mockChar({ karmaAvailable: 99 });
    assertNotEquals(validateKarmaAdvanceAttr(char, "Foo", 4), null);
  });

  it("exceeds racial max for Human (Body max 6) → error", () => {
    const char = mockChar({ attrs: { Body: 6, Agility: 3, Reaction: 3, Strength: 3, Charisma: 3, Intuition: 3, Logic: 3, Willpower: 3, Edge: 2 }, karmaAvailable: 99 });
    assertNotEquals(validateKarmaAdvanceAttr(char, "Body", 7), null);
  });

  it("Troll Body can reach 10 (racial max)", () => {
    const char = mockChar({
      metatype: "Troll",
      attrs: { Body: 9, Agility: 1, Reaction: 1, Strength: 5, Charisma: 1, Intuition: 1, Logic: 1, Willpower: 1, Edge: 1 },
      karmaAvailable: 99,
    });
    assertEquals(validateKarmaAdvanceAttr(char, "Body", 10), null);
  });

  it("not enough karma → error", () => {
    const char = mockChar({ karmaAvailable: 1 });
    assertNotEquals(validateKarmaAdvanceAttr(char, "Body", 4), null);
  });
});

// ── validateKarmaAdvanceSpec ──────────────────────────────────────────────────

describe("validateKarmaAdvanceSpec()", () => {
  it("valid spec → null", () => {
    const char = mockChar({ skills: { Pistols: { rating: 3 } }, karmaAvailable: 2 });
    assertEquals(validateKarmaAdvanceSpec(char, "Pistols", "Semiautomatics"), null);
  });

  it("skill not in char → error", () => {
    const char = mockChar({ skills: {}, karmaAvailable: 5 });
    assertNotEquals(validateKarmaAdvanceSpec(char, "Pistols", "Semiautomatics"), null);
  });

  it("already has spec → error", () => {
    const char = mockChar({ skills: { Pistols: { rating: 3, spec: "Revolvers" } }, karmaAvailable: 10 });
    assertNotEquals(validateKarmaAdvanceSpec(char, "Pistols", "Semiautomatics"), null);
  });

  it("empty spec name → error", () => {
    const char = mockChar({ skills: { Pistols: { rating: 3 } }, karmaAvailable: 5 });
    assertNotEquals(validateKarmaAdvanceSpec(char, "Pistols", ""), null);
  });

  it("not enough karma → error", () => {
    const char = mockChar({ skills: { Pistols: { rating: 3 } }, karmaAvailable: 1 });
    assertNotEquals(validateKarmaAdvanceSpec(char, "Pistols", "Semiautomatics"), null);
  });
});

// ── validateKarmaAdvanceSkillGroup ────────────────────────────────────────────

describe("validateKarmaAdvanceSkillGroup()", () => {
  it("intact Firearms group 3→4 → null", () => {
    const char = mockChar({
      skills: { Automatics: { rating: 3 }, Longarms: { rating: 3 }, Pistols: { rating: 3 } },
      karmaAvailable: 99,
    });
    assertEquals(validateKarmaAdvanceSkillGroup(char, "Firearms", skillsInGroup("Firearms"), 4), null);
  });

  it("broken group (mixed ratings) → error", () => {
    const char = mockChar({
      skills: { Automatics: { rating: 4 }, Longarms: { rating: 3 }, Pistols: { rating: 3 } },
      karmaAvailable: 99,
    });
    assertNotEquals(validateKarmaAdvanceSkillGroup(char, "Firearms", skillsInGroup("Firearms"), 5), null);
  });

  it("empty skills array (unknown group) → error", () => {
    const char = mockChar({ karmaAvailable: 99 });
    assertNotEquals(validateKarmaAdvanceSkillGroup(char, "BadGroup", [], 1), null);
  });

  it("not enough karma → error", () => {
    const char = mockChar({
      skills: { Automatics: { rating: 3 }, Longarms: { rating: 3 }, Pistols: { rating: 3 } },
      karmaAvailable: 5,
    });
    assertNotEquals(validateKarmaAdvanceSkillGroup(char, "Firearms", skillsInGroup("Firearms"), 4), null);
  });

  it("all skills missing (unbroken at 0) can be bought as group", () => {
    const char = mockChar({ skills: {}, karmaAvailable: 99 });
    assertEquals(validateKarmaAdvanceSkillGroup(char, "Athletics", skillsInGroup("Athletics"), 1), null);
  });
});

// ── skillgroups ───────────────────────────────────────────────────────────────

describe("resolveSkillGroup()", () => {
  it("resolves exact name", () => assertEquals(resolveSkillGroup("Firearms"), "Firearms"));
  it("resolves case-insensitively", () => assertEquals(resolveSkillGroup("firearms"), "Firearms"));
  it("resolves mixed case", () => assertEquals(resolveSkillGroup("CLOSE COMBAT"), "Close Combat"));
  it("returns null for unknown group", () => assertEquals(resolveSkillGroup("Nonsense"), null));
});

describe("SKILL_GROUPS", () => {
  it("Firearms contains Pistols, Automatics, Longarms", () => {
    const skills = SKILL_GROUPS["Firearms"];
    assertEquals(skills.includes("Pistols"), true);
    assertEquals(skills.includes("Automatics"), true);
    assertEquals(skills.includes("Longarms"), true);
  });

  it("all groups have at least 2 skills", () => {
    for (const [group, skills] of Object.entries(SKILL_GROUPS)) {
      assertEquals(skills.length >= 2, true, `${group} has fewer than 2 skills`);
    }
  });
});

// ── formatKarmaEntry ──────────────────────────────────────────────────────────

describe("formatKarmaEntry()", () => {
  it("positive delta shows + sign", () => {
    const e: IKarmaLogEntry = { timestamp: 0, delta: 5, reason: "Run reward" };
    assertStringIncludes(formatKarmaEntry(e), "+5");
  });

  it("negative delta shows - sign", () => {
    const e: IKarmaLogEntry = { timestamp: 0, delta: -8, reason: "Raised Pistols" };
    assertStringIncludes(formatKarmaEntry(e), "-8");
  });

  it("includes reason", () => {
    const e: IKarmaLogEntry = { timestamp: 0, delta: 3, reason: "Fixer payment" };
    assertStringIncludes(formatKarmaEntry(e), "Fixer payment");
  });

  it("includes advancement detail when present", () => {
    const e: IKarmaLogEntry = {
      timestamp: 0, delta: -8, reason: "Raised Pistols",
      advancement: { type: "skill", target: "Pistols", fromRating: 3, toRating: 4 },
    };
    assertStringIncludes(formatKarmaEntry(e), "skill");
    assertStringIncludes(formatKarmaEntry(e), "Pistols");
  });

  it("includes awardedBy when present", () => {
    const e: IKarmaLogEntry = {
      timestamp: 0, delta: 5, reason: "Run reward", awardedBy: "Gamemaster",
    };
    assertStringIncludes(formatKarmaEntry(e), "Gamemaster");
  });

  it("MAX_KARMA_AWARD is reasonable (1–9999)", () => {
    assertEquals(MAX_KARMA_AWARD >= 1 && MAX_KARMA_AWARD <= 9999, true);
  });
});
