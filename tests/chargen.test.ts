// ─── Chargen BP calculation and validation tests ──────────────────────────────

import { assertEquals, assertStringIncludes } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  calcBP, validateSubmit, posQualBP, negQualBP, nuYenBP,
  attrCost, BP_TOTAL, MAX_POSITIVE_QUALITY_BP, MAX_NEGATIVE_QUALITY_BP,
} from "../src/chargen/bp.ts";
import { racialBaseAttrs } from "../src/sr4/metatypes.ts";
import type { IShadowrunChar } from "../src/types.ts";

// ── helpers ───────────────────────────────────────────────────────────────────

function makeHuman(overrides: Partial<IShadowrunChar> = {}): IShadowrunChar {
  return {
    id: "test",
    playerId: "1",
    playerName: "TestPlayer",
    metatype: "Human",
    attrs: racialBaseAttrs("Human"),
    skills: {},
    qualities: [],
    contacts: [],
    karmaAvailable: 0,
    karmaTotal: 0,
    karmaLog: [],
    firstAidApplied: false,
    gear: [],
    nuyenLog: [],
    armorRating: 0,
    armorImpact: 0,
    recoilComp: 0,
    recoilAccum: 0,
    implants: [],
    essence: 6,
    initDiceBonus: 0,
    spells: [],
    magicLoss: 0,
    astrally: false,
    spirits: [],
    adeptPowers: [],
    nuyen: 0,
    physicalDmg: 0,
    stunDmg: 0,
    chargenState: "draft",
    initiationGrade: 0,
    submersionGrade: 0,
    metamagics: [],
    streetCred: 0,
    notoriety: 0,
    publicAwareness: 0,
    lifestyle: "low" as const,
    knowledgeSkills: {},
    languages: {},
    ...overrides,
  };
}

// ── attrCost() ────────────────────────────────────────────────────────────────

describe("attrCost()", () => {
  it("Human Body at racial min (1) costs 0 BP", () =>
    assertEquals(attrCost("Human", "Body", 1), 0));

  it("Human Body 4 costs 30 BP ((4-1)*10)", () =>
    assertEquals(attrCost("Human", "Body", 4), 30));

  it("Troll Body at racial min (5) costs 0 BP", () =>
    assertEquals(attrCost("Troll", "Body", 5), 0));

  it("Troll Body 7 costs 20 BP ((7-5)*10)", () =>
    assertEquals(attrCost("Troll", "Body", 7), 20));

  it("unknown metatype returns 0", () =>
    assertEquals(attrCost("Alien", "Body", 3), 0));
});

// ── calcBP() ──────────────────────────────────────────────────────────────────

describe("calcBP()", () => {
  it("bare Human at racial mins costs 0 BP", () => {
    assertEquals(calcBP(makeHuman()), 0);
  });

  it("Elf metatype costs 30 BP at racial minimums", () => {
    const char = makeHuman({ metatype: "Elf", attrs: racialBaseAttrs("Elf") });
    assertEquals(calcBP(char), 30);
  });

  it("Troll metatype costs 40 BP at racial minimums", () => {
    const char = makeHuman({ metatype: "Troll", attrs: racialBaseAttrs("Troll") });
    assertEquals(calcBP(char), 40);
  });

  it("Human Body raised to 4 costs 30 BP", () => {
    const char = makeHuman({ attrs: { ...racialBaseAttrs("Human"), Body: 4 } });
    assertEquals(calcBP(char), 30);
  });

  it("Pistols 3 costs 12 BP", () => {
    const char = makeHuman({ skills: { Pistols: { rating: 3 } } });
    assertEquals(calcBP(char), 12);
  });

  it("Pistols 3 with specialization costs 14 BP", () => {
    const char = makeHuman({ skills: { Pistols: { rating: 3, spec: "Semi-Auto" } } });
    assertEquals(calcBP(char), 14);
  });

  it("positive quality adds BP", () => {
    const char = makeHuman({ qualities: [{ name: "Lucky", bp: 20, type: "positive" }] });
    assertEquals(calcBP(char), 20);
  });

  it("negative quality refunds BP", () => {
    const char = makeHuman({ qualities: [{ name: "Uncouth", bp: 20, type: "negative" }] });
    assertEquals(calcBP(char), -20);
  });

  it("negative quality refund is capped at 35 BP", () => {
    const char = makeHuman({
      qualities: [
        { name: "Combat Paralysis", bp: 20, type: "negative" },
        { name: "Uncouth", bp: 20, type: "negative" },  // total 40 → capped at 35
      ],
    });
    assertEquals(calcBP(char), -35);
  });

  it("nuyen costs 1 BP per 5,000¥", () => {
    const char = makeHuman({ nuyen: 50_000 });
    assertEquals(calcBP(char), 10);
  });

  it("nuyen cost rounds down (fractional ¥ below 5,000 threshold)", () => {
    const char = makeHuman({ nuyen: 4_999 });
    assertEquals(calcBP(char), 0);
  });

  it("combined: Elf + skills + qualities + nuyen", () => {
    const char: IShadowrunChar = {
      id: "t",
      playerId: "1",
      playerName: "T",
      metatype: "Elf",
      attrs: { ...racialBaseAttrs("Elf"), Agility: 5, Logic: 4 }, // +30 +30 = 60 attr BP
      skills: { Pistols: { rating: 4 }, Hacking: { rating: 3 } }, // 16 + 12 = 28 BP
      qualities: [
        { name: "Lucky", bp: 20, type: "positive" },
        { name: "SINner", bp: 5, type: "negative" },
      ],
      contacts: [],
      karmaAvailable: 0,
      karmaTotal: 0,
      karmaLog: [],
      firstAidApplied: false,
      gear: [],
      nuyenLog: [],
      armorRating: 0,
      armorImpact: 0,
      recoilComp: 0,
      recoilAccum: 0,
      implants: [],
      essence: 6,
      initDiceBonus: 0,
      spells: [],
      magicLoss: 0,
      astrally: false,
      spirits: [],
      adeptPowers: [],
      nuyen: 25_000,
      physicalDmg: 0,
      stunDmg: 0,
      chargenState: "draft",
      initiationGrade: 0,
      submersionGrade: 0,
      metamagics: [],
      streetCred: 0,
      notoriety: 0,
      publicAwareness: 0,
      lifestyle: "low" as const,
      knowledgeSkills: {},
      languages: {},
    };
    // 30 (meta) + 60 (attrs above min: Agi min=2→5=+30, Log min=1→4=+30)
    // + 28 (skills) + 20 (pos) - 5 (neg) + 5 (nuyen) = 138
    assertEquals(calcBP(char), 138);
  });

  it("returns 0 when metatype is not set", () => {
    const char = makeHuman({ metatype: "" });
    assertEquals(calcBP(char), 0);
  });
});

// ── quality BP helpers ────────────────────────────────────────────────────────

describe("posQualBP()", () => {
  it("sums positive quality costs", () => {
    const char = makeHuman({
      qualities: [
        { name: "Lucky", bp: 20, type: "positive" },
        { name: "Ambidextrous", bp: 5, type: "positive" },
      ],
    });
    assertEquals(posQualBP(char), 25);
  });

  it("ignores negative qualities", () => {
    const char = makeHuman({ qualities: [{ name: "Uncouth", bp: 20, type: "negative" }] });
    assertEquals(posQualBP(char), 0);
  });
});

describe("negQualBP()", () => {
  it("sums negative quality costs", () => {
    const char = makeHuman({
      qualities: [
        { name: "Uncouth", bp: 20, type: "negative" },
        { name: "Astral Beacon", bp: 5, type: "negative" },
      ],
    });
    assertEquals(negQualBP(char), 25);
  });
});

describe("nuYenBP()", () => {
  it("0 nuyen = 0 BP", () => assertEquals(nuYenBP(makeHuman()), 0));
  it("5,000¥ = 1 BP", () => assertEquals(nuYenBP(makeHuman({ nuyen: 5_000 })), 1));
  it("50,000¥ = 10 BP", () => assertEquals(nuYenBP(makeHuman({ nuyen: 50_000 })), 10));
  it("250,000¥ = 50 BP (max)", () => assertEquals(nuYenBP(makeHuman({ nuyen: 250_000 })), 50));
});

// ── validateSubmit() ──────────────────────────────────────────────────────────

describe("validateSubmit()", () => {
  it("valid minimal Human passes", () => {
    assertEquals(validateSubmit(makeHuman()), []);
  });

  it("missing metatype produces error", () => {
    const errors = validateSubmit(makeHuman({ metatype: "" }));
    assertEquals(errors.some((e) => e.includes("metatype")), true);
  });

  it("over 400 BP produces error", () => {
    // 400 BP in attrs: need 40 points above min, at 10 each = Body 41... let's use skills
    const skills: Record<string, { rating: number }> = {};
    for (let i = 0; i < 11; i++) skills[`Skill${i}`] = { rating: 6 }; // fake 66 BP each... no
    // Simpler: manually inflate nuyen
    const char = makeHuman({ nuyen: 250_000, skills: { Pistols: { rating: 6 }, Automatics: { rating: 6 }, Hacking: { rating: 6 }, Dodge: { rating: 6 }, Perception: { rating: 6 }, Infiltration: { rating: 6 }, Negotiation: { rating: 6 }, Gymnastics: { rating: 6 }, Computer: { rating: 6 }, Medicine: { rating: 6 }, Electronics: { rating: 6 }, Leadership: { rating: 6 }, Running: { rating: 6 }, Swimming: { rating: 6 }, Survival: { rating: 6 }, Tracking: { rating: 6 }, Climbing: { rating: 6 } } });
    const errors = validateSubmit(char);
    assertEquals(errors.some((e) => e.includes("BP limit")), true);
  });

  it("positive qualities exceeding 35 BP produces error", () => {
    const char = makeHuman({
      qualities: [
        { name: "Lucky", bp: 20, type: "positive" },
        { name: "Exceptional Attribute", bp: 20, type: "positive" }, // total 40 > 35
      ],
    });
    const errors = validateSubmit(char);
    assertEquals(errors.some((e) => e.includes("Positive qualities")), true);
  });

  it("negative qualities exceeding 35 BP produces error", () => {
    const char = makeHuman({
      qualities: [
        { name: "Combat Paralysis", bp: 20, type: "negative" },
        { name: "Uncouth", bp: 20, type: "negative" }, // total 40 > 35
      ],
    });
    const errors = validateSubmit(char);
    assertEquals(errors.some((e) => e.includes("Negative qualities")), true);
  });

  it("nuyen over max produces error", () => {
    const char = makeHuman({ nuyen: 300_000 });
    const errors = validateSubmit(char);
    assertEquals(errors.some((e) => e.includes("nuyen")), true);
  });

  it("exactly 400 BP passes", () => {
    // 400 BP in attrs: all 9 attrs raised as high as possible for Human
    // Human: all attrs [1,6], Edge [2,7]. Raise each to max.
    // Body/Agi/Rea/Str/Cha/Int/Log/Wil: 5 each × 10 = 50 BP × 8 = 400. Edge already 2.
    const attrs = {
      Body: 6, Agility: 6, Reaction: 6, Strength: 6,
      Charisma: 6, Intuition: 6, Logic: 6, Willpower: 6, Edge: 2,
    };
    // (6-1)*10 * 8 = 50*8 = 400
    const char = makeHuman({ attrs });
    assertEquals(calcBP(char), 400);
    assertEquals(validateSubmit(char), []);
  });
});

// ── metatype racial attribute ranges ─────────────────────────────────────────

describe("racialBaseAttrs()", () => {
  it("Troll starts at Body 5", () =>
    assertEquals(racialBaseAttrs("Troll").Body, 5));

  it("Elf starts at Agility 2", () =>
    assertEquals(racialBaseAttrs("Elf").Agility, 2));

  it("Human Edge starts at 2", () =>
    assertEquals(racialBaseAttrs("Human").Edge, 2));

  it("Dwarf Reaction starts at 1 (max 5)", () =>
    assertEquals(racialBaseAttrs("Dwarf").Reaction, 1));
});
