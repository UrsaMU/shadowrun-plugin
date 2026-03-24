// ─── Magic pure function tests (SR4A pp. 155–182) ─────────────────────────────

import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  isAwakened,
  traditionLinkedAttr,
  drainPool,
  calcDrainDv,
  spellBP,
  effectiveMagic,
  spellDvAtForce,
  BP_SPELL,
} from "../src/sr4/magic.ts";
import { lookupSpell, SPELL_CATALOGUE } from "../src/sr4/spells.ts";
import type { ISpell } from "../src/types.ts";
import { mockChar } from "./helpers/mockU.ts";

// ── helpers ───────────────────────────────────────────────────────────────────

function awakenedChar(tradition: "Hermetic" | "Shaman", overrides = {}) {
  return mockChar({
    qualities: [{ name: "Magician", bp: 15, type: "positive" }],
    tradition,
    attrs: { Body: 3, Agility: 3, Reaction: 3, Strength: 3, Charisma: 3,
             Intuition: 3, Logic: 4, Willpower: 4, Edge: 2, Magic: 5 },
    ...overrides,
  });
}

const sampleSpell: ISpell = {
  name: "Manabolt", category: "Combat", type: "mana",
  range: "LOS", damage: "P", dvBase: 0, dvPerForce: 1,
};

// ── isAwakened() ──────────────────────────────────────────────────────────────

describe("isAwakened()", () => {
  it("Magician quality → true",       () => assertEquals(isAwakened(awakenedChar("Hermetic")), true));
  it("Mystic Adept quality → true",   () => {
    const char = mockChar({ qualities: [{ name: "Mystic Adept", bp: 15, type: "positive" }] });
    assertEquals(isAwakened(char), true);
  });
  it("no awakened quality → false",   () => assertEquals(isAwakened(mockChar()), false));
  it("negative quality only → false", () => {
    const char = mockChar({ qualities: [{ name: "SINner", bp: 5, type: "negative" }] });
    assertEquals(isAwakened(char), false);
  });
});

// ── traditionLinkedAttr() ─────────────────────────────────────────────────────

describe("traditionLinkedAttr()", () => {
  it("Hermetic → Logic",  () => assertEquals(traditionLinkedAttr("Hermetic"), "Logic"));
  it("Shaman → Charisma", () => assertEquals(traditionLinkedAttr("Shaman"),   "Charisma"));
  it("null → null",       () => assertEquals(traditionLinkedAttr(null),  null));
  it("undefined → null",  () => assertEquals(traditionLinkedAttr(undefined), null));
});

// ── drainPool() ───────────────────────────────────────────────────────────────

describe("drainPool()", () => {
  it("Hermetic: Willpower + Logic", () => {
    // Willpower 4 + Logic 4 = 8
    assertEquals(drainPool(awakenedChar("Hermetic")), 8);
  });

  it("Shaman: Willpower + Charisma", () => {
    // Willpower 4 + Charisma 3 = 7
    assertEquals(drainPool(awakenedChar("Shaman")), 7);
  });

  it("non-awakened → 0", () => {
    assertEquals(drainPool(mockChar()), 0);
  });

  it("Awakened without tradition → 0", () => {
    const char = mockChar({
      qualities: [{ name: "Magician", bp: 15, type: "positive" }],
      attrs: { Body: 3, Agility: 3, Reaction: 3, Strength: 3, Charisma: 3,
               Intuition: 3, Logic: 4, Willpower: 4, Edge: 2, Magic: 5 },
    });
    assertEquals(drainPool(char), 0);
  });
});

// ── calcDrainDv() ─────────────────────────────────────────────────────────────

describe("calcDrainDv()", () => {
  it("Force 1 → DV 2 (minimum floor)", () => {
    assertEquals(calcDrainDv(1, 5).dv, 2);
  });
  it("Force 4 → DV 2", () =>
    assertEquals(calcDrainDv(4, 5).dv, 2));
  it("Force 5 → DV 3 (ceil(5/2) = 3)", () =>
    assertEquals(calcDrainDv(5, 5).dv, 3));
  it("Force 6 → DV 3", () =>
    assertEquals(calcDrainDv(6, 5).dv, 3));
  it("Force 7 → DV 4", () =>
    assertEquals(calcDrainDv(7, 5).dv, 4));
  it("Force 10 → DV 5", () =>
    assertEquals(calcDrainDv(10, 5).dv, 5));

  it("Force ≤ Magic → Stun", () => {
    assertEquals(calcDrainDv(5, 5).type, "stun");
    assertEquals(calcDrainDv(4, 5).type, "stun");
  });
  it("Force > Magic → Physical", () => {
    assertEquals(calcDrainDv(6, 5).type, "physical");
    assertEquals(calcDrainDv(10, 3).type, "physical");
  });
});

// ── spellBP() ─────────────────────────────────────────────────────────────────

describe("spellBP()", () => {
  it("0 spells → 0 BP", () => assertEquals(spellBP([]), 0));
  it("1 spell → 3 BP",  () => assertEquals(spellBP([sampleSpell]), BP_SPELL));
  it("4 spells → 12 BP",() => assertEquals(spellBP([sampleSpell, sampleSpell, sampleSpell, sampleSpell]), 12));
  it("BP_SPELL constant is 3", () => assertEquals(BP_SPELL, 3));
});

// ── effectiveMagic() ──────────────────────────────────────────────────────────

describe("effectiveMagic()", () => {
  it("full Essence → no penalty", () => {
    const char = awakenedChar("Hermetic");
    assertEquals(effectiveMagic(char), 5); // Magic 5, Essence 6 → penalty 0
  });

  it("Essence 5 → penalty 1", () => {
    const char = awakenedChar("Hermetic", { essence: 5.0 });
    assertEquals(effectiveMagic(char), 4); // Magic 5 - 1 = 4
  });

  it("Essence 4 → penalty 2", () => {
    const char = awakenedChar("Hermetic", { essence: 4.0 });
    assertEquals(effectiveMagic(char), 3); // Magic 5 - 2 = 3
  });

  it("magic loss floors at 0", () => {
    const char = awakenedChar("Hermetic", { essence: 0, attrs: {
      Body: 3, Agility: 3, Reaction: 3, Strength: 3, Charisma: 3,
      Intuition: 3, Logic: 4, Willpower: 4, Edge: 2, Magic: 1,
    }});
    assertEquals(effectiveMagic(char), 0); // Magic 1 - 6 = clamped to 0
  });
});

// ── spellDvAtForce() ──────────────────────────────────────────────────────────

describe("spellDvAtForce()", () => {
  it("Manabolt Force 6: DV = ceil(6×1)+0 = 6", () =>
    assertEquals(spellDvAtForce(sampleSpell, 6), 6));

  it("Lightning Bolt Force 6: DV = ceil(6×0.5)+2 = 5", () => {
    const lightning: ISpell = { name: "Lightning Bolt", category: "Combat", type: "physical",
      range: "LOS", damage: "P", dvBase: 2, dvPerForce: 0.5 };
    assertEquals(spellDvAtForce(lightning, 6), 5); // ceil(3)+2 = 5
  });

  it("Heal (dvPerForce=0): DV = 0+2 = 2 at any force", () => {
    const heal: ISpell = { name: "Heal", category: "Health", type: "mana",
      range: "T", dvBase: 2, dvPerForce: 0 };
    assertEquals(spellDvAtForce(heal, 10), 2);
  });

  it("ceil handles odd Force properly", () => {
    const spell: ISpell = { name: "Test", category: "Combat", type: "mana",
      range: "LOS", damage: "P", dvBase: 0, dvPerForce: 0.5 };
    assertEquals(spellDvAtForce(spell, 5), 3); // ceil(2.5) = 3
  });
});

// ── SPELL_CATALOGUE integrity ─────────────────────────────────────────────────

describe("SPELL_CATALOGUE", () => {
  it("has at least 30 spells", () => {
    assertEquals(SPELL_CATALOGUE.length >= 30, true);
  });

  it("all spells have valid category", () => {
    const valid = ["Combat", "Detection", "Health", "Illusion", "Manipulation"];
    for (const s of SPELL_CATALOGUE) {
      assertEquals(valid.includes(s.category), true, `${s.name} has invalid category: ${s.category}`);
    }
  });

  it("all spells have valid type", () => {
    for (const s of SPELL_CATALOGUE) {
      assertEquals(
        s.type === "mana" || s.type === "physical",
        true,
        `${s.name} has invalid type: ${s.type}`,
      );
    }
  });

  it("all spells have valid range", () => {
    const valid = ["LOS", "LOS(A)", "T", "Special"];
    for (const s of SPELL_CATALOGUE) {
      assertEquals(valid.includes(s.range), true, `${s.name} invalid range: ${s.range}`);
    }
  });

  it("no duplicate names", () => {
    const names = SPELL_CATALOGUE.map((s) => s.name.toLowerCase());
    const unique = new Set(names);
    assertEquals(unique.size, names.length);
  });

  it("dvPerForce is 0, 0.5, or 1", () => {
    for (const s of SPELL_CATALOGUE) {
      assertEquals([0, 0.5, 1].includes(s.dvPerForce), true,
        `${s.name} has invalid dvPerForce: ${s.dvPerForce}`);
    }
  });
});

// ── lookupSpell() ─────────────────────────────────────────────────────────────

describe("lookupSpell()", () => {
  it("finds exact name", () => {
    const s = lookupSpell("Manabolt");
    assertEquals(s?.name, "Manabolt");
    assertEquals(s?.category, "Combat");
  });

  it("case-insensitive", () => {
    assertEquals(lookupSpell("manabolt")?.name, "Manabolt");
    assertEquals(lookupSpell("HEAL")?.name, "Heal");
  });

  it("returns null for unknown spell", () => {
    assertEquals(lookupSpell("Fireball of Doom"), null);
  });

  it("finds Detection spell", () => {
    assertEquals(lookupSpell("Mind Probe")?.category, "Detection");
  });

  it("finds Manipulation spell", () => {
    assertEquals(lookupSpell("Levitate")?.category, "Manipulation");
  });
});

// ── ISpell schema + mockChar defaults ─────────────────────────────────────────

describe("ISpell schema + mockChar defaults", () => {
  it("mockChar has empty spells by default", () =>
    assertEquals(mockChar().spells, []));

  it("mockChar has magicLoss 0 by default", () =>
    assertEquals(mockChar().magicLoss, 0));

  it("ISpell required fields present", () => {
    const s: ISpell = {
      name: "Manabolt", category: "Combat", type: "mana",
      range: "LOS", damage: "P", dvBase: 0, dvPerForce: 1,
    };
    assertEquals(s.name, "Manabolt");
    assertEquals(s.dvPerForce, 1);
  });

  it("ISpell notes field is optional", () => {
    const s: ISpell = {
      name: "Manabolt", category: "Combat", type: "mana",
      range: "LOS", dvBase: 0, dvPerForce: 1,
      notes: "Staff note",
    };
    assertEquals(s.notes, "Staff note");
  });
});

// ── BP integration: spells count in calcBP ────────────────────────────────────

describe("spell BP integration", () => {
  it("spells add 3 BP each to calcBP", async () => {
    const { calcBP } = await import("../src/chargen/bp.ts");
    const { racialBaseAttrs } = await import("../src/sr4/metatypes.ts");
    // Use racial minimums so attrs contribute 0 BP — only spells add cost
    const char = mockChar({
      metatype: "Human",
      chargenState: "draft",
      attrs: racialBaseAttrs("Human"),
      spells: [
        { name: "Manabolt", category: "Combat", type: "mana", range: "LOS", dvBase: 0, dvPerForce: 1 },
        { name: "Heal",     category: "Health", type: "mana", range: "T",   dvBase: 2, dvPerForce: 0 },
      ],
    });
    assertEquals(calcBP(char), 6); // 2 spells × 3 BP = 6
  });
});
