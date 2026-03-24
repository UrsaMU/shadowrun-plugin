// ─── Critter pure function tests (SR4A pp. 293–326) ───────────────────────────

import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  CRITTER_CATALOGUE,
  lookupCritter,
  critterCmBoxes,
  critterInitiative,
} from "../src/sr4/critters.ts";

// ── critterCmBoxes() ──────────────────────────────────────────────────────────

describe("critterCmBoxes()", () => {
  it("Body 1 → 9",   () => assertEquals(critterCmBoxes(1), 9));
  it("Body 3 → 10",  () => assertEquals(critterCmBoxes(3), 10));
  it("Body 5 → 11",  () => assertEquals(critterCmBoxes(5), 11));
  it("Body 8 → 12",  () => assertEquals(critterCmBoxes(8), 12));
  it("Body 20 → 18", () => assertEquals(critterCmBoxes(20), 18));
});

// ── critterInitiative() ───────────────────────────────────────────────────────

describe("critterInitiative()", () => {
  it("Rea 3 + Int 2 = 5",  () => assertEquals(critterInitiative(3, 2), 5));
  it("Rea 4 + Int 4 = 8",  () => assertEquals(critterInitiative(4, 4), 8));
  it("Rea 7 + Int 8 = 15", () => assertEquals(critterInitiative(7, 8), 15));
});

// ── CRITTER_CATALOGUE ─────────────────────────────────────────────────────────

describe("CRITTER_CATALOGUE", () => {
  it("has at least 8 entries", () => assertEquals(CRITTER_CATALOGUE.length >= 8, true));

  it("no duplicate names", () => {
    const names = CRITTER_CATALOGUE.map((c) => c.name.toLowerCase());
    assertEquals(new Set(names).size, names.length);
  });

  it("all have valid categories", () => {
    const valid = ["mundane", "paranormal", "npc", "spirit"];
    for (const c of CRITTER_CATALOGUE) {
      assertEquals(valid.includes(c.category), true, `${c.name} has invalid category`);
    }
  });

  it("all have non-empty descriptions", () => {
    for (const c of CRITTER_CATALOGUE) {
      assertEquals(c.description.length > 0, true, `${c.name} has no description`);
    }
  });

  it("all have positive attributes", () => {
    for (const c of CRITTER_CATALOGUE) {
      for (const [attr, val] of Object.entries(c.attrs)) {
        assertEquals(val > 0, true, `${c.name}.${attr} is not positive`);
      }
    }
  });

  it("physicalCM matches critterCmBoxes(body)", () => {
    for (const c of CRITTER_CATALOGUE) {
      assertEquals(c.physicalCM, critterCmBoxes(c.attrs.Body), `${c.name} CM mismatch`);
    }
  });

  it("contains at least one npc entry", () =>
    assertEquals(CRITTER_CATALOGUE.some((c) => c.category === "npc"), true));

  it("contains at least one paranormal entry", () =>
    assertEquals(CRITTER_CATALOGUE.some((c) => c.category === "paranormal"), true));

  it("contains at least one spirit entry", () =>
    assertEquals(CRITTER_CATALOGUE.some((c) => c.category === "spirit"), true));
});

// ── lookupCritter() ───────────────────────────────────────────────────────────

describe("lookupCritter()", () => {
  it("finds Hellhound",              () => assertEquals(lookupCritter("Hellhound")?.name, "Hellhound"));
  it("case-insensitive",             () => assertEquals(lookupCritter("hellhound")?.name, "Hellhound"));
  it("returns null for unknown",     () => assertEquals(lookupCritter("ShadowDragon"), null));
  it("finds Ganger with stats",      () => {
    const c = lookupCritter("Ganger");
    assertEquals(c?.category, "npc");
    assertEquals(typeof c?.combatPool, "number");
  });
});
