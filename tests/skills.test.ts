// ─── SR4 canonical skill list and quality resolution tests ────────────────────

import { assertEquals, assertNotEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { ACTIVE_SKILLS, resolveSkill } from "../src/sr4/skills.ts";
import { QUALITIES, resolveQuality } from "../src/sr4/qualities.ts";

// ── resolveSkill() ────────────────────────────────────────────────────────────

describe("resolveSkill()", () => {
  it("returns canonical name for exact match", () =>
    assertEquals(resolveSkill("Pistols"), "Pistols"));

  it("resolves case-insensitively", () =>
    assertEquals(resolveSkill("pistols"), "Pistols"));

  it("resolves mixed case", () =>
    assertEquals(resolveSkill("PISTOLS"), "Pistols"));

  it("resolves multi-word skill", () =>
    assertEquals(resolveSkill("pilot ground craft"), "Pilot Ground Craft"));

  it("resolves multi-word case-insensitively", () =>
    assertEquals(resolveSkill("PILOT GROUND CRAFT"), "Pilot Ground Craft"));

  it("returns null for unknown skill", () =>
    assertEquals(resolveSkill("FakeSkill"), null));

  it("returns null for empty string", () =>
    assertEquals(resolveSkill(""), null));

  it("all 62+ skills are present", () => {
    // Spot-check each category
    const must = [
      "Pistols", "Automatics", "Blades", "Unarmed Combat",    // combat
      "Perception", "Gymnastics", "Infiltration",              // physical
      "Con", "Etiquette", "Negotiation",                       // social
      "Hacking", "Computer", "First Aid",                      // technical
      "Pilot Ground Craft", "Gunnery",                         // vehicle
      "Spellcasting", "Summoning",                             // magical
      "Compiling", "Registering",                              // resonance
    ];
    for (const skill of must) {
      assertNotEquals(resolveSkill(skill), null, `Expected "${skill}" to be in skill list`);
    }
  });

  it("skill list has more than 60 entries", () => {
    assertEquals(ACTIVE_SKILLS.size > 60, true);
  });
});

// ── resolveQuality() ─────────────────────────────────────────────────────────

describe("resolveQuality()", () => {
  it("resolves exact name", () => {
    const q = resolveQuality("Lucky");
    assertEquals(q?.name, "Lucky");
    assertEquals(q?.bp, 20);
    assertEquals(q?.type, "positive");
  });

  it("resolves case-insensitively", () => {
    const q = resolveQuality("lucky");
    assertEquals(q?.name, "Lucky");
  });

  it("resolves negative quality", () => {
    const q = resolveQuality("Uncouth");
    assertEquals(q?.type, "negative");
    assertEquals(q?.bp, 20);
  });

  it("returns null for unknown quality", () =>
    assertEquals(resolveQuality("Flying"), null));

  it("returns null for empty string", () =>
    assertEquals(resolveQuality(""), null));

  it("all positive qualities have bp > 0", () => {
    for (const [, def] of QUALITIES) {
      if (def.type === "positive") {
        assertEquals(def.bp > 0, true, `"${def.name}" positive quality must have bp > 0`);
      }
    }
  });

  it("all negative qualities have bp > 0", () => {
    for (const [, def] of QUALITIES) {
      if (def.type === "negative") {
        assertEquals(def.bp > 0, true, `"${def.name}" negative quality must have bp > 0`);
      }
    }
  });

  it("quality list has both positive and negative entries", () => {
    const pos = [...QUALITIES.values()].filter((q) => q.type === "positive");
    const neg = [...QUALITIES.values()].filter((q) => q.type === "negative");
    assertEquals(pos.length > 10, true);
    assertEquals(neg.length > 10, true);
  });
});
