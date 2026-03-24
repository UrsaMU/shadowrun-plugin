// ─── Matrix pure function tests (SR4A pp. 212–285) ────────────────────────────

import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  personaCmBoxes,
  PROGRAM_LIST,
  lookupProgram,
  hackActionPool,
  HACK_ACTIONS,
  maxActivePrograms,
  validateCommlink,
  SPRITE_TYPES,
  COMPLEX_FORM_LIST,
  calcFadingDv,
  spriteCmBoxes,
} from "../src/sr4/matrix.ts";
import type { ICommlink, IComplexForm } from "../src/types.ts";
import { mockChar } from "./helpers/mockU.ts";

// ── personaCmBoxes() ──────────────────────────────────────────────────────────

describe("personaCmBoxes()", () => {
  it("System 1 → 8 + ceil(0.5) = 9", () => assertEquals(personaCmBoxes(1), 9));
  it("System 2 → 8 + 1 = 9",         () => assertEquals(personaCmBoxes(2), 9));
  it("System 3 → 8 + 2 = 10",        () => assertEquals(personaCmBoxes(3), 10));
  it("System 4 → 8 + 2 = 10",        () => assertEquals(personaCmBoxes(4), 10));
  it("System 5 → 8 + 3 = 11",        () => assertEquals(personaCmBoxes(5), 11));
  it("System 6 → 8 + 3 = 11",        () => assertEquals(personaCmBoxes(6), 11));
});

// ── PROGRAM_LIST catalogue ────────────────────────────────────────────────────

describe("PROGRAM_LIST", () => {
  it("has at least 15 programs", () => assertEquals(PROGRAM_LIST.length >= 15, true));

  it("all entries have valid category", () => {
    const valid = ["offensive", "defensive", "exploit", "utility"];
    for (const p of PROGRAM_LIST) {
      assertEquals(valid.includes(p.category), true, `${p.name} has invalid category`);
    }
  });

  it("no duplicate names", () => {
    const names = PROGRAM_LIST.map((p) => p.name.toLowerCase());
    assertEquals(new Set(names).size, names.length);
  });

  it("all have descriptions", () => {
    for (const p of PROGRAM_LIST) {
      assertEquals(p.effect.length > 0, true, `${p.name} has no effect`);
    }
  });
});

// ── lookupProgram() ───────────────────────────────────────────────────────────

describe("lookupProgram()", () => {
  it("finds Attack program", () => {
    const p = lookupProgram("Attack");
    assertEquals(p?.name, "Attack");
    assertEquals(p?.category, "offensive");
  });

  it("case-insensitive", () => assertEquals(lookupProgram("stealth")?.name, "Stealth"));
  it("returns null for unknown", () => assertEquals(lookupProgram("MegaVirus"), null));
});

// ── HACK_ACTIONS ──────────────────────────────────────────────────────────────

describe("HACK_ACTIONS", () => {
  it("contains probe, access, crash, attack, spoof, trace, edit, analyze", () => {
    for (const a of ["probe", "access", "crash", "attack", "spoof", "trace", "edit", "analyze"]) {
      assertEquals(HACK_ACTIONS.includes(a as typeof HACK_ACTIONS[number]), true, `Missing action: ${a}`);
    }
  });

  it("hackActionPool returns a string for each action", () => {
    for (const a of HACK_ACTIONS) {
      const desc = hackActionPool(a);
      assertEquals(typeof desc, "string");
      assertEquals(desc.length > 0, true);
    }
  });
});

// ── maxActivePrograms() ───────────────────────────────────────────────────────

describe("maxActivePrograms()", () => {
  it("Response 4 → 4",  () => assertEquals(maxActivePrograms(4), 4));
  it("Response 1 → 1",  () => assertEquals(maxActivePrograms(1), 1));
  it("Response 6 → 6",  () => assertEquals(maxActivePrograms(6), 6));
});

// ── validateCommlink() ────────────────────────────────────────────────────────

describe("validateCommlink()", () => {
  it("valid commlink → null", () => {
    const cl: ICommlink = { model: "Renraku", firewall: 4, response: 4, signal: 4, system: 4, programs: [] };
    assertEquals(validateCommlink(cl), null);
  });

  it("firewall 0 → error", () => {
    assertEquals(typeof validateCommlink({ firewall: 0 }), "string");
  });

  it("firewall 7 → error", () => {
    assertEquals(typeof validateCommlink({ firewall: 7 }), "string");
  });

  it("non-integer → error", () => {
    assertEquals(typeof validateCommlink({ response: 3.5 }), "string");
  });

  it("all attributes at max (6) → null", () => {
    assertEquals(validateCommlink({ firewall: 6, response: 6, signal: 6, system: 6 }), null);
  });
});

// ── Technomancer: calcFadingDv() ──────────────────────────────────────────────

describe("calcFadingDv()", () => {
  it("Force 1 → DV 2 (minimum)",      () => assertEquals(calcFadingDv(1, 5).dv, 2));
  it("Force 4 → DV 2",                () => assertEquals(calcFadingDv(4, 5).dv, 2));
  it("Force 5 → DV 3",                () => assertEquals(calcFadingDv(5, 5).dv, 3));
  it("Force 6 → DV 3",                () => assertEquals(calcFadingDv(6, 5).dv, 3));
  it("Force 10 → DV 5",               () => assertEquals(calcFadingDv(10, 5).dv, 5));
  it("Force ≤ Resonance → Stun",      () => assertEquals(calcFadingDv(5, 5).type, "stun"));
  it("Force > Resonance → Physical",  () => assertEquals(calcFadingDv(6, 5).type, "physical"));
});

// ── Technomancer: spriteCmBoxes() ────────────────────────────────────────────

describe("spriteCmBoxes()", () => {
  it("Force 1 → 8 + 1 = 9",  () => assertEquals(spriteCmBoxes(1), 9));
  it("Force 4 → 8 + 2 = 10", () => assertEquals(spriteCmBoxes(4), 10));
  it("Force 6 → 8 + 3 = 11", () => assertEquals(spriteCmBoxes(6), 11));
});

// ── SPRITE_TYPES ──────────────────────────────────────────────────────────────

describe("SPRITE_TYPES", () => {
  it("contains Courier, Crack, Data, Fault, Machine", () => {
    for (const s of ["Courier", "Crack", "Data", "Fault", "Machine"]) {
      assertEquals(SPRITE_TYPES.includes(s as typeof SPRITE_TYPES[number]), true);
    }
  });
});

// ── COMPLEX_FORM_LIST ─────────────────────────────────────────────────────────

describe("COMPLEX_FORM_LIST", () => {
  it("has at least 8 forms", () => assertEquals(COMPLEX_FORM_LIST.length >= 8, true));
  it("all have descriptions", () => {
    for (const f of COMPLEX_FORM_LIST) {
      assertEquals(f.description.length > 0, true, `${f.name} has no description`);
    }
  });
});

// ── ICommlink + IComplexForm schema ───────────────────────────────────────────

describe("ICommlink schema", () => {
  it("commlink fields present", () => {
    const cl: ICommlink = {
      model: "Renraku Kraftwerk",
      firewall: 4, response: 4, signal: 4, system: 4,
      programs: ["Exploit", "Stealth"],
    };
    assertEquals(cl.model, "Renraku Kraftwerk");
    assertEquals(cl.programs.length, 2);
  });

  it("commlink is optional on mockChar", () => {
    const char = mockChar();
    assertEquals(char.commlink, undefined);
  });
});

describe("IComplexForm schema", () => {
  it("fields present", () => {
    const cf: IComplexForm = { name: "Resonance Spike", rating: 4 };
    assertEquals(cf.name, "Resonance Spike");
    assertEquals(cf.rating, 4);
  });

  it("complexForms is an optional field (undefined without normalizeChar)", () => {
    const char = mockChar();
    // Optional field — undefined until normalizeChar runs in DB layer
    assertEquals(char.complexForms === undefined || Array.isArray(char.complexForms), true);
  });

  it("matrixDmg is an optional field", () => {
    // Optional field — undefined until normalizeChar runs in DB layer
    const char = mockChar();
    assertEquals(char.matrixDmg === undefined || typeof char.matrixDmg === "number", true);
  });
});
