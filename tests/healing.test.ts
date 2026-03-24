// ─── Healing tests ─────────────────────────────────────────────────────────────

import { assertEquals, assert } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { stunRestTick, firstAidPool, longCarePool, applyHeal } from "../src/sr4/healing.ts";
import { mockChar } from "./helpers/mockU.ts";

// ── stunRestTick ──────────────────────────────────────────────────────────────

describe("stunRestTick()", () => {
  it("always heals 1 box", () => {
    assertEquals(stunRestTick(4).boxes, 1);
    assertEquals(stunRestTick(1).boxes, 1);
    assertEquals(stunRestTick(6).boxes, 1);
  });

  it("Body 4 → hoursPerBox = max(1, 6−4) = 2", () =>
    assertEquals(stunRestTick(4).hoursPerBox, 2));

  it("Body 6 → hoursPerBox = max(1, 6−6) = 1 (clamped from 0)", () =>
    assertEquals(stunRestTick(6).hoursPerBox, 1));

  it("Body 1 → hoursPerBox = max(1, 6−1) = 5", () =>
    assertEquals(stunRestTick(1).hoursPerBox, 5));

  it("Body 0 (edge case) treated as Body 1 → hoursPerBox 5", () =>
    assertEquals(stunRestTick(0).hoursPerBox, 5));

  it("very high Body (e.g. 10) → hoursPerBox still 1 (floor at max)", () =>
    assertEquals(stunRestTick(10).hoursPerBox, 1));
});

// ── firstAidPool ──────────────────────────────────────────────────────────────

describe("firstAidPool()", () => {
  it("First Aid 4 + Logic 4 → 8", () => {
    const char = mockChar({
      skills: { "First Aid": { rating: 4 } },
      attrs: { Body: 3, Agility: 3, Reaction: 3, Strength: 3, Charisma: 3, Intuition: 3, Logic: 4, Willpower: 3, Edge: 2 },
    });
    assertEquals(firstAidPool(char), 8);
  });

  it("no First Aid skill → pool = Logic only (wait, actually 0 + Logic)", () => {
    const char = mockChar({
      skills: {},
      attrs: { Body: 3, Agility: 3, Reaction: 3, Strength: 3, Charisma: 3, Intuition: 3, Logic: 5, Willpower: 3, Edge: 2 },
    });
    // No skill → rating 0; pool = 0 + 5 = 5
    assertEquals(firstAidPool(char), 5);
  });

  it("no First Aid, no Logic → 0 (no crash)", () => {
    const char = mockChar({ skills: {}, attrs: {} });
    assertEquals(firstAidPool(char), 0);
  });

  it("First Aid 6 + Logic 6 → 12", () => {
    const char = mockChar({
      skills: { "First Aid": { rating: 6 } },
      attrs: { Body: 3, Agility: 3, Reaction: 3, Strength: 3, Charisma: 3, Intuition: 3, Logic: 6, Willpower: 3, Edge: 2 },
    });
    assertEquals(firstAidPool(char), 12);
  });
});

// ── longCarePool ──────────────────────────────────────────────────────────────

describe("longCarePool()", () => {
  it("Medicine 5 + Logic 4 → 9", () => {
    const char = mockChar({
      skills: { "Medicine": { rating: 5 } },
      attrs: { Body: 3, Agility: 3, Reaction: 3, Strength: 3, Charisma: 3, Intuition: 3, Logic: 4, Willpower: 3, Edge: 2 },
    });
    assertEquals(longCarePool(char), 9);
  });

  it("no Medicine → pool = Logic", () => {
    const char = mockChar({
      skills: {},
      attrs: { Body: 3, Agility: 3, Reaction: 3, Strength: 3, Charisma: 3, Intuition: 3, Logic: 3, Willpower: 3, Edge: 2 },
    });
    assertEquals(longCarePool(char), 3);
  });

  it("no skills, no attrs → 0 (no crash)", () => {
    assertEquals(longCarePool(mockChar({ skills: {}, attrs: {} })), 0);
  });
});

// ── applyHeal ─────────────────────────────────────────────────────────────────

describe("applyHeal()", () => {
  it("heal 3 from 5 physical → 2 remaining", () => {
    const char = mockChar({ physicalDmg: 5, stunDmg: 0 });
    const { healed } = applyHeal(char, "physical", 3);
    assertEquals(healed, 3);
    assertEquals(char.physicalDmg, 2);
  });

  it("heal more than available physical → clamps to 0", () => {
    const char = mockChar({ physicalDmg: 2, stunDmg: 0 });
    const { healed } = applyHeal(char, "physical", 10);
    assertEquals(healed, 2);
    assertEquals(char.physicalDmg, 0);
  });

  it("heal 3 from 5 stun → 2 remaining", () => {
    const char = mockChar({ physicalDmg: 0, stunDmg: 5 });
    const { healed } = applyHeal(char, "stun", 3);
    assertEquals(healed, 3);
    assertEquals(char.stunDmg, 2);
  });

  it("heal stun more than available → clamps to 0", () => {
    const char = mockChar({ physicalDmg: 0, stunDmg: 1 });
    const { healed } = applyHeal(char, "stun", 99);
    assertEquals(healed, 1);
    assertEquals(char.stunDmg, 0);
  });

  it("heal 0 dmg → healed = 0, no change", () => {
    const char = mockChar({ physicalDmg: 0, stunDmg: 3 });
    const { healed } = applyHeal(char, "stun", 0);
    assertEquals(healed, 0);
    assertEquals(char.stunDmg, 3);
  });

  it("physical heal does not affect stun track", () => {
    const char = mockChar({ physicalDmg: 3, stunDmg: 5 });
    applyHeal(char, "physical", 3);
    assertEquals(char.stunDmg, 5);
  });

  it("stun heal does not affect physical track", () => {
    const char = mockChar({ physicalDmg: 4, stunDmg: 2 });
    applyHeal(char, "stun", 2);
    assertEquals(char.physicalDmg, 4);
  });
});

// ── firstAidApplied flag integration ─────────────────────────────────────────

describe("firstAidApplied flag", () => {
  it("defaults to false in mockChar", () => {
    const char = mockChar();
    assertEquals(char.firstAidApplied, false);
  });

  it("can be set to true", () => {
    const char = mockChar({ firstAidApplied: true });
    assert(char.firstAidApplied);
  });
});
