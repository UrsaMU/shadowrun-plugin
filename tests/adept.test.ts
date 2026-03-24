// ─── Adept Power pure function tests (SR4A pp. 178–182) ───────────────────────

import { assertEquals, assertAlmostEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  ADEPT_POWER_LIST,
  lookupAdeptPower,
  powerPointsUsed,
  powerPointsAvailable,
  validateAddPower,
  isAdept,
} from "../src/sr4/adept.ts";
import type { IAdeptPower } from "../src/types.ts";
import { mockChar } from "./helpers/mockU.ts";

// ── helpers ───────────────────────────────────────────────────────────────────

function adeptChar(magic = 5, essence = 6, extraPowers: IAdeptPower[] = []) {
  return mockChar({
    qualities: [{ name: "Adept", bp: 5, type: "positive" }],
    attrs: { Body: 3, Agility: 3, Reaction: 3, Strength: 3, Charisma: 3,
             Intuition: 3, Logic: 3, Willpower: 3, Edge: 2, Magic: magic },
    essence,
    adeptPowers: extraPowers,
  });
}

// ── ADEPT_POWER_LIST catalogue ────────────────────────────────────────────────

describe("ADEPT_POWER_LIST", () => {
  it("has at least 20 powers", () =>
    assertEquals(ADEPT_POWER_LIST.length >= 20, true));

  it("all entries have ppCost > 0", () => {
    for (const p of ADEPT_POWER_LIST) {
      assertEquals(p.ppCost > 0, true, `${p.name} has ppCost <= 0`);
    }
  });

  it("ppCost is a multiple of 0.25", () => {
    for (const p of ADEPT_POWER_LIST) {
      assertEquals((p.ppCost * 4) % 1, 0, `${p.name} ppCost not a multiple of 0.25`);
    }
  });

  it("no duplicate names", () => {
    const names = ADEPT_POWER_LIST.map((p) => p.name.toLowerCase());
    assertEquals(new Set(names).size, names.length);
  });

  it("all entries have description", () => {
    for (const p of ADEPT_POWER_LIST) {
      assertEquals(p.description.length > 0, true, `${p.name} has no description`);
    }
  });

  it("leveled powers have maxRating", () => {
    for (const p of ADEPT_POWER_LIST.filter((p) => p.leveled)) {
      assertEquals(typeof p.maxRating, "number", `${p.name} has no maxRating`);
    }
  });
});

// ── lookupAdeptPower() ────────────────────────────────────────────────────────

describe("lookupAdeptPower()", () => {
  it("finds by exact name", () => {
    const p = lookupAdeptPower("Killing Hands");
    assertEquals(p?.name, "Killing Hands");
    assertEquals(p?.leveled, false);
    assertEquals(p?.ppCost, 0.5);
  });

  it("case-insensitive", () =>
    assertEquals(lookupAdeptPower("killing hands")?.name, "Killing Hands"));

  it("returns null for unknown", () =>
    assertEquals(lookupAdeptPower("Laser Vision"), null));

  it("finds leveled power", () => {
    const p = lookupAdeptPower("Improved Initiative");
    assertEquals(p?.leveled, true);
    assertEquals(p?.ppCost, 1.0);
    assertEquals(p?.maxRating, 3);
  });
});

// ── powerPointsUsed() ─────────────────────────────────────────────────────────

describe("powerPointsUsed()", () => {
  it("empty array → 0", () => assertEquals(powerPointsUsed([]), 0));

  it("single power", () => {
    assertAlmostEquals(powerPointsUsed([{ name: "Killing Hands", ppCost: 0.5 }]), 0.5, 0.001);
  });

  it("multiple powers sum correctly", () => {
    const powers: IAdeptPower[] = [
      { name: "Killing Hands",     ppCost: 0.5 },
      { name: "Improved Initiative",ppCost: 1.0, rating: 1 },
      { name: "Combat Sense",      ppCost: 0.5, rating: 1 },
    ];
    assertAlmostEquals(powerPointsUsed(powers), 2.0, 0.001);
  });

  it("fractional costs accumulate correctly", () => {
    const powers: IAdeptPower[] = [
      { name: "A", ppCost: 0.25 },
      { name: "B", ppCost: 0.25 },
      { name: "C", ppCost: 0.25 },
      { name: "D", ppCost: 0.25 },
    ];
    assertAlmostEquals(powerPointsUsed(powers), 1.0, 0.001);
  });
});

// ── powerPointsAvailable() ────────────────────────────────────────────────────

describe("powerPointsAvailable()", () => {
  it("no powers, Magic 5, full Essence → 5 PP", () =>
    assertAlmostEquals(powerPointsAvailable(adeptChar(5)), 5.0, 0.001));

  it("Killing Hands (0.5 PP) → 4.5 remaining", () => {
    const char = adeptChar(5, 6, [{ name: "Killing Hands", ppCost: 0.5 }]);
    assertAlmostEquals(powerPointsAvailable(char), 4.5, 0.001);
  });

  it("Essence loss reduces available PP (via magic penalty)", () => {
    // Essence 4 → magicPenalty 2; Magic 5 − 2 = 3 effective
    const char = adeptChar(5, 4.0);
    assertAlmostEquals(powerPointsAvailable(char), 3.0, 0.001);
  });

  it("cannot go below 0", () => {
    // Overspent PP (should not happen in practice, but guard it)
    const char = adeptChar(1, 6, [{ name: "Killing Hands", ppCost: 2.0 }]);
    assertEquals(powerPointsAvailable(char), 0);
  });
});

// ── validateAddPower() ────────────────────────────────────────────────────────

describe("validateAddPower()", () => {
  it("valid addition → null", () => {
    const char  = adeptChar(5);
    const entry = lookupAdeptPower("Killing Hands")!;
    assertEquals(validateAddPower(char, entry), null);
  });

  it("not an adept → error", () => {
    const char  = mockChar();  // no Adept quality
    const entry = lookupAdeptPower("Killing Hands")!;
    const err   = validateAddPower(char, entry);
    assertEquals(typeof err, "string");
    assertEquals(err!.includes("Adept"), true);
  });

  it("insufficient PP → error", () => {
    // Magic 1, spending 2 PP
    const char  = adeptChar(1);
    const entry = lookupAdeptPower("Increase Reflexes")!; // 1.5 PP
    const err   = validateAddPower(char, entry);
    assertEquals(typeof err, "string");
    assertEquals(err!.includes("power points"), true);
  });

  it("leveled power with rating too high → error", () => {
    const char  = adeptChar(6);
    const entry = lookupAdeptPower("Combat Sense")!; // maxRating 3
    const err   = validateAddPower(char, entry, 10);
    assertEquals(typeof err, "string");
    assertEquals(err!.includes("Maximum"), true);
  });

  it("leveled power rating 0 → error", () => {
    const char  = adeptChar(5);
    const entry = lookupAdeptPower("Combat Sense")!;
    const err   = validateAddPower(char, entry, 0);
    assertEquals(typeof err, "string");
    assertEquals(err!.includes("Rating"), true);
  });

  it("leveled power valid rating → null", () => {
    const char  = adeptChar(5);
    const entry = lookupAdeptPower("Combat Sense")!; // 0.5 PP/level
    assertEquals(validateAddPower(char, entry, 2), null);
  });
});

// ── isAdept() ─────────────────────────────────────────────────────────────────

describe("isAdept()", () => {
  it("Adept quality → true",          () => assertEquals(isAdept(adeptChar()), true));
  it("no awakened quality → false",   () => assertEquals(isAdept(mockChar()),  false));
  it("Mystic Adept quality → true", () => {
    const char = mockChar({ qualities: [{ name: "Mystic Adept", bp: 15, type: "positive" }] });
    assertEquals(isAdept(char), true);
  });
  it("Magician quality only → false", () => {
    const char = mockChar({ qualities: [{ name: "Magician", bp: 15, type: "positive" }] });
    assertEquals(isAdept(char), false);
  });
});

// ── IAdeptPower schema + mockChar defaults ────────────────────────────────────

describe("IAdeptPower schema + mockChar defaults", () => {
  it("mockChar has empty adeptPowers by default", () =>
    assertEquals(mockChar().adeptPowers, []));

  it("IAdeptPower required fields", () => {
    const p: IAdeptPower = { name: "Killing Hands", ppCost: 0.5 };
    assertEquals(p.name, "Killing Hands");
    assertEquals(p.ppCost, 0.5);
  });

  it("IAdeptPower optional fields", () => {
    const p: IAdeptPower = { name: "Combat Sense", ppCost: 1.0, rating: 2, notes: "test" };
    assertEquals(p.rating, 2);
    assertEquals(p.notes, "test");
  });
});
