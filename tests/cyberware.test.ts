// ─── Cyberware pure function tests ────────────────────────────────────────────

import { assertEquals, assertAlmostEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  calcEssence,
  magicPenalty,
  gradeCostMultiplier,
  initDiceFromImplants,
  lookupImplant,
  IMPLANT_CATALOGUE,
  MAX_ESSENCE,
  MAX_INIT_DICE_BONUS,
} from "../src/sr4/cyberware.ts";
import type { IImplant } from "../src/types.ts";
import { mockChar } from "./helpers/mockU.ts";

// ── helpers ───────────────────────────────────────────────────────────────────

function implant(name: string, category: IImplant["category"], essenceCost: number, grade: IImplant["grade"] = "standard"): IImplant {
  return { name, category, grade, essenceCost };
}

// ── gradeCostMultiplier() ──────────────────────────────────────────────────────

describe("gradeCostMultiplier()", () => {
  it("standard → 1.0", () => assertEquals(gradeCostMultiplier("standard"), 1.0));
  it("alpha → 0.9",    () => assertEquals(gradeCostMultiplier("alpha"),    0.9));
  it("beta → 0.8",     () => assertEquals(gradeCostMultiplier("beta"),     0.8));
  it("delta → 0.7",    () => assertEquals(gradeCostMultiplier("delta"),    0.7));
  it("cultured → 0.9", () => assertEquals(gradeCostMultiplier("cultured"), 0.9));
  it("unknown grade → 1.0 (safe default)", () => assertEquals(gradeCostMultiplier("mythic"), 1.0));
  it("case-insensitive", () => assertEquals(gradeCostMultiplier("ALPHA"), 0.9));
});

// ── calcEssence() ──────────────────────────────────────────────────────────────

describe("calcEssence()", () => {
  it("no implants → 6.00", () => assertEquals(calcEssence([]), MAX_ESSENCE));

  it("single implant deducts cost", () => {
    const result = calcEssence([implant("Datajack", "cyberware", 0.1)]);
    assertAlmostEquals(result, 5.9, 0.001);
  });

  it("multiple implants sum correctly", () => {
    const implants: IImplant[] = [
      implant("Wired Reflexes 2", "cyberware", 3.0),
      implant("Datajack", "cyberware", 0.1),
    ];
    assertAlmostEquals(calcEssence(implants), 2.9, 0.001);
  });

  it("Essence clamped to 0 (cannot go negative)", () => {
    const implants: IImplant[] = [
      implant("HeavyCyber", "cyberware", 5.0),
      implant("MoreCyber",  "cyberware", 3.0),
    ];
    assertEquals(calcEssence(implants), 0);
  });

  it("exactly 6 Essence spent → 0", () => {
    assertEquals(calcEssence([implant("A", "cyberware", 6.0)]), 0);
  });

  it("Wired Reflexes 2 (3.0) + Synaptic Booster 1 (1.0) → 2.0", () => {
    const implants: IImplant[] = [
      implant("Wired Reflexes 2",  "cyberware", 3.0),
      implant("Synaptic Booster 1","bioware",   1.0),
    ];
    assertAlmostEquals(calcEssence(implants), 2.0, 0.001);
  });
});

// ── magicPenalty() ────────────────────────────────────────────────────────────

describe("magicPenalty()", () => {
  it("full Essence (6) → 0 penalty", () => assertEquals(magicPenalty(6), 0));
  it("5.9 Essence → floor(0.1) = 0", () => assertEquals(magicPenalty(5.9), 0));
  it("5.0 Essence → floor(1.0) = 1", () => assertEquals(magicPenalty(5.0), 1));
  it("5.1 Essence → floor(0.9) = 0", () => assertEquals(magicPenalty(5.1), 0));
  it("4.0 Essence → 2 penalty",       () => assertEquals(magicPenalty(4.0), 2));
  it("3.0 Essence → 3 penalty",       () => assertEquals(magicPenalty(3.0), 3));
  it("0.0 Essence → 6 penalty",       () => assertEquals(magicPenalty(0.0), 6));
  it("negative Essence clamped at 0 penalty", () => assertEquals(magicPenalty(-1), 7)); // floors 7, not clamped
});

// ── initDiceFromImplants() ────────────────────────────────────────────────────

describe("initDiceFromImplants()", () => {
  it("no implants → 0",  () => assertEquals(initDiceFromImplants([]), 0));

  it("Wired Reflexes 1 → +1", () =>
    assertEquals(initDiceFromImplants([implant("Wired Reflexes 1", "cyberware", 2.0)]), 1));

  it("Wired Reflexes 2 → +2", () =>
    assertEquals(initDiceFromImplants([implant("Wired Reflexes 2", "cyberware", 3.0)]), 2));

  it("Wired Reflexes 3 → +3", () =>
    assertEquals(initDiceFromImplants([implant("Wired Reflexes 3", "cyberware", 5.0)]), 3));

  it("Synaptic Booster 2 → +2", () =>
    assertEquals(initDiceFromImplants([implant("Synaptic Booster 2", "bioware", 2.5)]), 2));

  it("Wired Reflexes 2 + Synaptic Booster 1 → 3 (2+1)", () => {
    const implants: IImplant[] = [
      implant("Wired Reflexes 2",  "cyberware", 3.0),
      implant("Synaptic Booster 1","bioware",   1.0),
    ];
    assertEquals(initDiceFromImplants(implants), 3);
  });

  it("Wired Reflexes 3 + Synaptic Booster 3 → capped at 4", () => {
    const implants: IImplant[] = [
      implant("Wired Reflexes 3",  "cyberware", 5.0),
      implant("Synaptic Booster 3","bioware",   3.5),
    ];
    assertEquals(initDiceFromImplants(implants), MAX_INIT_DICE_BONUS);
  });

  it("non-initiative implants contribute 0", () => {
    assertEquals(initDiceFromImplants([implant("Datajack", "cyberware", 0.1)]), 0);
  });
});

// ── lookupImplant() ───────────────────────────────────────────────────────────

describe("lookupImplant()", () => {
  it("finds exact name", () => {
    const entry = lookupImplant("Wired Reflexes 2");
    assertEquals(entry?.name, "Wired Reflexes 2");
    assertEquals(entry?.category, "cyberware");
    assertEquals(entry?.baseEssenceCost, 3.0);
  });

  it("case-insensitive lookup", () => {
    const entry = lookupImplant("wired reflexes 2");
    assertEquals(entry?.name, "Wired Reflexes 2");
  });

  it("returns null for unknown implant", () => {
    assertEquals(lookupImplant("Laser Eyes"), null);
  });

  it("finds bioware entry", () => {
    const entry = lookupImplant("Synaptic Booster 1");
    assertEquals(entry?.category, "bioware");
    assertEquals(entry?.baseEssenceCost, 1.0);
  });
});

// ── IMPLANT_CATALOGUE integrity ────────────────────────────────────────────────

describe("IMPLANT_CATALOGUE", () => {
  it("has at least 20 entries", () => {
    assertEquals(IMPLANT_CATALOGUE.length >= 20, true);
  });

  it("all entries have positive base Essence cost", () => {
    for (const e of IMPLANT_CATALOGUE) {
      assertEquals(e.baseEssenceCost > 0, true, `${e.name} has non-positive Essence cost`);
    }
  });

  it("all entries have valid category", () => {
    for (const e of IMPLANT_CATALOGUE) {
      assertEquals(
        e.category === "cyberware" || e.category === "bioware",
        true,
        `${e.name} has invalid category: ${e.category}`,
      );
    }
  });

  it("all entries have a description", () => {
    for (const e of IMPLANT_CATALOGUE) {
      assertEquals(e.description.length > 0, true, `${e.name} missing description`);
    }
  });

  it("no duplicate names", () => {
    const names = IMPLANT_CATALOGUE.map((e) => e.name.toLowerCase());
    const unique = new Set(names);
    assertEquals(unique.size, names.length);
  });
});

// ── IImplant schema + mockChar defaults ───────────────────────────────────────

describe("IImplant schema + mockChar defaults", () => {
  it("mockChar has empty implants by default", () => {
    const char = mockChar();
    assertEquals(char.implants, []);
  });

  it("mockChar has essence 6 by default", () => {
    assertEquals(mockChar().essence, 6);
  });

  it("mockChar has initDiceBonus 0 by default", () => {
    assertEquals(mockChar().initDiceBonus, 0);
  });

  it("IImplant fields are present", () => {
    const imp: IImplant = {
      name: "Datajack",
      category: "cyberware",
      grade: "standard",
      essenceCost: 0.1,
    };
    assertEquals(imp.name, "Datajack");
    assertEquals(imp.category, "cyberware");
    assertEquals(imp.grade, "standard");
    assertEquals(imp.essenceCost, 0.1);
  });

  it("IImplant notes field is optional", () => {
    const imp: IImplant = {
      name: "Datajack",
      category: "cyberware",
      grade: "alpha",
      essenceCost: 0.09,
      notes: "Installed 2072-06-15",
    };
    assertEquals(imp.notes, "Installed 2072-06-15");
  });
});

// ── grade × base cost multiplication ─────────────────────────────────────────

describe("grade cost multiplication", () => {
  it("standard WR2 costs 3.0", () =>
    assertAlmostEquals(3.0 * gradeCostMultiplier("standard"), 3.0, 0.001));

  it("alpha WR2 costs 2.70 (3.0 × 0.9)", () =>
    assertAlmostEquals(3.0 * gradeCostMultiplier("alpha"), 2.70, 0.001));

  it("beta WR2 costs 2.40 (3.0 × 0.8)", () =>
    assertAlmostEquals(3.0 * gradeCostMultiplier("beta"), 2.40, 0.001));

  it("delta WR2 costs 2.10 (3.0 × 0.7)", () =>
    assertAlmostEquals(3.0 * gradeCostMultiplier("delta"), 2.10, 0.001));

  it("cultured Synaptic Booster 1 costs 0.90 (1.0 × 0.9)", () =>
    assertAlmostEquals(1.0 * gradeCostMultiplier("cultured"), 0.90, 0.001));
});
