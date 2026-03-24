// ─── Combat resolution tests ───────────────────────────────────────────────────

import { assertEquals, assertStringIncludes } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  woundModifier, armorVsAP, damageType, resolveCombat,
  resistPool, formatCombatResult,
} from "../src/sr4/combat.ts";
import type { IWeaponProfile } from "../src/sr4/combat.ts";
import { mockChar } from "./helpers/mockU.ts";

// ── woundModifier() ───────────────────────────────────────────────────────────

describe("woundModifier()", () => {
  it("0 boxes → 0", () => assertEquals(woundModifier(mockChar({ physicalDmg: 0, stunDmg: 0 })), 0));
  it("3 boxes → -1", () => assertEquals(woundModifier(mockChar({ physicalDmg: 2, stunDmg: 1 })), -1));
  it("6 boxes → -2", () => assertEquals(woundModifier(mockChar({ physicalDmg: 3, stunDmg: 3 })), -2));
  it("9 boxes → -3", () => assertEquals(woundModifier(mockChar({ physicalDmg: 5, stunDmg: 4 })), -3));
  it("2 boxes → 0 (not yet 3)", () => assertEquals(woundModifier(mockChar({ physicalDmg: 2, stunDmg: 0 })), 0));
  it("counts both tracks together", () => {
    const char = mockChar({ physicalDmg: 1, stunDmg: 2 });
    assertEquals(woundModifier(char), -1);
  });
});

// ── armorVsAP() ───────────────────────────────────────────────────────────────

describe("armorVsAP()", () => {
  it("armour 9, AP 0 → 9", () => assertEquals(armorVsAP(9, 0), 9));
  it("armour 9, AP -4 → 5", () => assertEquals(armorVsAP(9, -4), 5));
  it("armour 3, AP -6 → 0 (clamped)", () => assertEquals(armorVsAP(3, -6), 0));
  it("armour 0, AP -2 → 0", () => assertEquals(armorVsAP(0, -2), 0));
  it("AP positive (unusual) adds to armour", () => assertEquals(armorVsAP(4, 2), 6));
});

// ── damageType() ──────────────────────────────────────────────────────────────

describe("damageType()", () => {
  it("S damage code always returns stun", () => {
    assertEquals(damageType(10, 2, "S"), "stun");
    assertEquals(damageType(1, 0, "S"), "stun");
  });
  it("P code: DV > armour → physical", () => assertEquals(damageType(8, 6, "P"), "physical"));
  it("P code: DV = armour → stun", () => assertEquals(damageType(6, 6, "P"), "stun"));
  it("P code: DV < armour → stun", () => assertEquals(damageType(4, 6, "P"), "stun"));
  it("P code: armour 0, any DV > 0 → physical", () => assertEquals(damageType(5, 0, "P"), "physical"));
});

// ── resistPool() ──────────────────────────────────────────────────────────────

describe("resistPool()", () => {
  it("physical: body + armour", () => assertEquals(resistPool(4, 5, "physical"), 9));
  it("stun: body only", () => assertEquals(resistPool(4, 5, "stun"), 4));
  it("physical with 0 armour: body only", () => assertEquals(resistPool(3, 0, "physical"), 3));
});

// ── resolveCombat() ───────────────────────────────────────────────────────────

const pistol: IWeaponProfile = { name: "Pistol", dv: 5, ap: -1, damageCode: "P" };

describe("resolveCombat()", () => {
  it("attacker wins: net hits add to DV", () => {
    const r = resolveCombat(5, 2, pistol, 6, 0);
    assertEquals(r.netHits, 3);
    assertEquals(r.rawDV, 8);     // 5 base + 3 net hits
  });

  it("defender wins: netHits clamped to 0", () => {
    const r = resolveCombat(2, 5, pistol, 6, 0);
    assertEquals(r.netHits, 0);
    assertEquals(r.rawDV, 5);     // base DV only
  });

  it("resistance reduces applied DV", () => {
    const r = resolveCombat(4, 2, pistol, 4, 3);
    // net hits = 2, rawDV = 7, resist = 3 → applied = 4
    assertEquals(r.rawDV, 7);
    assertEquals(r.appliedDV, 4);
  });

  it("full resist: appliedDV = 0", () => {
    const r = resolveCombat(3, 3, pistol, 9, 10);
    assertEquals(r.appliedDV, 0);
  });

  it("AP reduces effective armour for damage type", () => {
    // pistol AP -1 vs 6 armour → modified armour = 5; DV 5+2=7 > 5 → physical
    const r = resolveCombat(4, 2, pistol, 6, 0);
    assertEquals(r.modifiedArmour, 5);
    assertEquals(r.damageType, "physical");
  });

  it("low DV vs high armour → stun", () => {
    const lowDv: IWeaponProfile = { name: "Punch", dv: 2, ap: 0, damageCode: "P" };
    const r = resolveCombat(2, 0, lowDv, 9, 0);
    // rawDV = 4, modifiedArmour = 9, 4 ≤ 9 → stun
    assertEquals(r.damageType, "stun");
  });

  it("S weapon always stun regardless of DV vs armour", () => {
    const taser: IWeaponProfile = { name: "Taser", dv: 6, ap: -5, damageCode: "S" };
    const r = resolveCombat(5, 0, taser, 0, 0);
    assertEquals(r.damageType, "stun");
  });
});

// ── formatCombatResult() ──────────────────────────────────────────────────────

describe("formatCombatResult()", () => {
  it("includes attacker and defender names", () => {
    const r = resolveCombat(4, 2, pistol, 4, 1);
    const out = formatCombatResult("Alice", "Bob", pistol, r);
    assertStringIncludes(out, "Alice");
    assertStringIncludes(out, "Bob");
  });

  it("includes weapon name", () => {
    const r = resolveCombat(4, 2, pistol, 4, 1);
    const out = formatCombatResult("A", "B", pistol, r);
    assertStringIncludes(out, "Pistol");
  });

  it("shows applied DV", () => {
    const r = resolveCombat(4, 2, pistol, 4, 2);
    const out = formatCombatResult("A", "B", pistol, r);
    assertStringIncludes(out, String(r.appliedDV));
  });

  it("shows 'No damage applied' when appliedDV is 0", () => {
    const r = resolveCombat(2, 4, pistol, 9, 10);
    const out = formatCombatResult("A", "B", pistol, r);
    assertStringIncludes(out, "No damage");
  });

  it("net hits are shown with + prefix when positive", () => {
    const r = resolveCombat(5, 2, pistol, 4, 0);
    const out = formatCombatResult("A", "B", pistol, r);
    assertStringIncludes(out, "+3");
  });
});

// ── integration: wound modifier affects pool ──────────────────────────────────

describe("wound modifier integration", () => {
  it("character with 6 dmg has -2 wound mod", () => {
    const char = mockChar({ physicalDmg: 3, stunDmg: 3 });
    assertEquals(woundModifier(char), -2);
  });

  it("wound mod is subtracted from effective pool", () => {
    const char  = mockChar({ physicalDmg: 3, stunDmg: 3 });
    const agility = char.attrs["Agility"] ?? 3;
    const mod     = woundModifier(char);
    const pool    = Math.max(1, agility + mod);
    // Agility 3, wound -2 → pool 1
    assertEquals(pool, 1);
  });
});
