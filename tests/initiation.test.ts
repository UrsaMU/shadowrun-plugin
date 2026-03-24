// ─── Initiation & Submersion pure function tests (SR4A pp. 198–200, 268–270) ──

import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  initiationCost,
  magicCap,
  resonanceCap,
  METAMAGIC_LIST,
  ECHO_LIST,
  lookupMetamagic,
  lookupEcho,
} from "../src/sr4/initiation.ts";
import { mockChar } from "./helpers/mockU.ts";

// ── initiationCost() ──────────────────────────────────────────────────────────

describe("initiationCost()", () => {
  it("grade 1 → 10 karma",  () => assertEquals(initiationCost(1), 10));
  it("grade 2 → 20 karma",  () => assertEquals(initiationCost(2), 20));
  it("grade 5 → 50 karma",  () => assertEquals(initiationCost(5), 50));
  it("grade 10 → 100 karma",() => assertEquals(initiationCost(10), 100));
});

// ── magicCap() ────────────────────────────────────────────────────────────────

describe("magicCap()", () => {
  it("grade 0 → cap 6",  () => assertEquals(magicCap(0), 6));
  it("grade 1 → cap 7",  () => assertEquals(magicCap(1), 7));
  it("grade 3 → cap 9",  () => assertEquals(magicCap(3), 9));
  it("grade 6 → cap 12", () => assertEquals(magicCap(6), 12));
});

// ── resonanceCap() ────────────────────────────────────────────────────────────

describe("resonanceCap()", () => {
  it("grade 0 → cap 6",  () => assertEquals(resonanceCap(0), 6));
  it("grade 1 → cap 7",  () => assertEquals(resonanceCap(1), 7));
  it("grade 4 → cap 10", () => assertEquals(resonanceCap(4), 10));
});

// ── METAMAGIC_LIST ────────────────────────────────────────────────────────────

describe("METAMAGIC_LIST", () => {
  it("has at least 8 entries", () =>
    assertEquals(METAMAGIC_LIST.length >= 8, true));

  it("contains Centering, Masking, Shielding", () => {
    const names = METAMAGIC_LIST.map((m) => m.name);
    for (const required of ["Centering", "Masking", "Shielding"]) {
      assertEquals(names.includes(required), true, `Missing: ${required}`);
    }
  });

  it("no duplicate names", () => {
    const names = METAMAGIC_LIST.map((m) => m.name.toLowerCase());
    assertEquals(new Set(names).size, names.length);
  });

  it("all entries have non-empty descriptions", () => {
    for (const m of METAMAGIC_LIST) {
      assertEquals(m.description.length > 0, true, `${m.name} has no description`);
    }
  });
});

// ── ECHO_LIST ─────────────────────────────────────────────────────────────────

describe("ECHO_LIST", () => {
  it("has at least 6 entries", () =>
    assertEquals(ECHO_LIST.length >= 6, true));

  it("contains Stability and Filtering", () => {
    const names = ECHO_LIST.map((e) => e.name);
    for (const required of ["Stability", "Filtering"]) {
      assertEquals(names.includes(required), true, `Missing: ${required}`);
    }
  });

  it("no duplicate names", () => {
    const names = ECHO_LIST.map((e) => e.name.toLowerCase());
    assertEquals(new Set(names).size, names.length);
  });

  it("all entries have non-empty descriptions", () => {
    for (const e of ECHO_LIST) {
      assertEquals(e.description.length > 0, true, `${e.name} has no description`);
    }
  });
});

// ── lookupMetamagic() ─────────────────────────────────────────────────────────

describe("lookupMetamagic()", () => {
  it("finds Centering",                  () => assertEquals(lookupMetamagic("Centering")?.name, "Centering"));
  it("case-insensitive",                 () => assertEquals(lookupMetamagic("centering")?.name, "Centering"));
  it("returns null for unknown",         () => assertEquals(lookupMetamagic("MegaPower"), null));
  it("found entry has description",      () => {
    const m = lookupMetamagic("Masking");
    assertEquals(typeof m?.description, "string");
    assertEquals((m?.description.length ?? 0) > 0, true);
  });
});

// ── lookupEcho() ──────────────────────────────────────────────────────────────

describe("lookupEcho()", () => {
  it("finds Stability",           () => assertEquals(lookupEcho("Stability")?.name, "Stability"));
  it("case-insensitive",          () => assertEquals(lookupEcho("stability")?.name, "Stability"));
  it("returns null for unknown",  () => assertEquals(lookupEcho("MegaEcho"), null));
});

// ── IShadowrunChar schema ─────────────────────────────────────────────────────

describe("IShadowrunChar initiation fields", () => {
  it("mockChar has initiationGrade 0",  () => assertEquals(mockChar().initiationGrade, 0));
  it("mockChar has submersionGrade 0",  () => assertEquals(mockChar().submersionGrade, 0));
  it("mockChar has metamagics []",      () => assertEquals(mockChar().metamagics, []));

  it("can override initiationGrade",    () =>
    assertEquals(mockChar({ initiationGrade: 3 }).initiationGrade, 3));

  it("can override metamagics",         () =>
    assertEquals(mockChar({ metamagics: ["Centering"] }).metamagics, ["Centering"]));
});

// ── Cost progression ──────────────────────────────────────────────────────────

describe("initiation cost progression", () => {
  it("each grade is more expensive than the last", () => {
    for (let g = 2; g <= 10; g++) {
      assertEquals(initiationCost(g) > initiationCost(g - 1), true, `grade ${g}`);
    }
  });

  it("magicCap increases by 1 per grade", () => {
    for (let g = 1; g <= 6; g++) {
      assertEquals(magicCap(g), 6 + g);
    }
  });

  it("resonanceCap increases by 1 per grade", () => {
    for (let g = 1; g <= 6; g++) {
      assertEquals(resonanceCap(g), 6 + g);
    }
  });
});
