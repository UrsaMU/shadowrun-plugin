// ─── Weapon & Armor database tests (SR4A pp. 310–342) ────────────────────────

import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  WEAPON_CATALOGUE,
  ARMOR_CATALOGUE,
  lookupWeapon,
  lookupArmor,
} from "../src/sr4/weapons.ts";

// ── WEAPON_CATALOGUE ──────────────────────────────────────────────────────────

describe("WEAPON_CATALOGUE", () => {
  it("has at least 15 weapons", () => assertEquals(WEAPON_CATALOGUE.length >= 15, true));

  it("no duplicate names", () => {
    const names = WEAPON_CATALOGUE.map((w) => w.name.toLowerCase());
    assertEquals(new Set(names).size, names.length);
  });

  it("all have valid damage types", () => {
    for (const w of WEAPON_CATALOGUE) {
      assertEquals(["P", "S"].includes(w.damageType), true, `${w.name} bad damage type`);
    }
  });

  it("all have positive DV", () => {
    for (const w of WEAPON_CATALOGUE) {
      assertEquals(w.dv > 0, true, `${w.name} DV is not positive`);
    }
  });

  it("all have positive accuracy", () => {
    for (const w of WEAPON_CATALOGUE) {
      assertEquals(w.accuracy > 0, true, `${w.name} accuracy is not positive`);
    }
  });

  it("all have non-negative cost", () => {
    for (const w of WEAPON_CATALOGUE) {
      assertEquals(w.cost >= 0, true, `${w.name} cost is negative`);
    }
  });

  it("all have non-empty descriptions", () => {
    for (const w of WEAPON_CATALOGUE) {
      assertEquals(w.description.length > 0, true, `${w.name} has no description`);
    }
  });

  it("melee weapons have ammo 0", () => {
    const melee = WEAPON_CATALOGUE.filter((w) => w.category === "melee");
    for (const w of melee) {
      assertEquals(w.ammo, 0, `${w.name} melee weapon should have ammo 0`);
    }
  });

  it("contains Ares Predator IV (iconic pistol)", () =>
    assertEquals(lookupWeapon("Ares Predator IV")?.category, "heavy pistol"));

  it("contains Ares Alpha (iconic assault rifle)", () =>
    assertEquals(lookupWeapon("Ares Alpha")?.category, "assault rifle"));

  it("contains at least one melee weapon", () =>
    assertEquals(WEAPON_CATALOGUE.some((w) => w.category === "melee"), true));

  it("contains at least one sniper rifle", () =>
    assertEquals(WEAPON_CATALOGUE.some((w) => w.category === "sniper rifle"), true));
});

// ── lookupWeapon() ────────────────────────────────────────────────────────────

describe("lookupWeapon()", () => {
  it("finds by exact name",         () => assertEquals(lookupWeapon("Ares Predator IV")?.name, "Ares Predator IV"));
  it("case-insensitive",            () => assertEquals(lookupWeapon("ares predator iv")?.name, "Ares Predator IV"));
  it("returns null for unknown",    () => assertEquals(lookupWeapon("MegaBlaster 3000"), null));
  it("found entry has valid stats", () => {
    const w = lookupWeapon("Ares Alpha");
    assertEquals(typeof w?.dv, "number");
    assertEquals(typeof w?.accuracy, "number");
    assertEquals(w?.availability, 14);
  });
});

// ── ARMOR_CATALOGUE ───────────────────────────────────────────────────────────

describe("ARMOR_CATALOGUE", () => {
  it("has at least 8 entries", () => assertEquals(ARMOR_CATALOGUE.length >= 8, true));

  it("no duplicate names", () => {
    const names = ARMOR_CATALOGUE.map((a) => a.name.toLowerCase());
    assertEquals(new Set(names).size, names.length);
  });

  it("all have non-negative ballistic and impact ratings", () => {
    for (const a of ARMOR_CATALOGUE) {
      assertEquals(a.ballistic >= 0, true, `${a.name} ballistic < 0`);
      assertEquals(a.impact    >= 0, true, `${a.name} impact < 0`);
    }
  });

  it("contains Armor Jacket",    () => assertEquals(lookupArmor("Armor Jacket")?.ballistic, 8));
  it("contains Lined Coat",      () => assertEquals(lookupArmor("Lined Coat")?.name, "Lined Coat"));
});

// ── lookupArmor() ─────────────────────────────────────────────────────────────

describe("lookupArmor()", () => {
  it("finds by exact name",      () => assertEquals(lookupArmor("Armor Jacket")?.name, "Armor Jacket"));
  it("case-insensitive",         () => assertEquals(lookupArmor("armor jacket")?.name, "Armor Jacket"));
  it("returns null for unknown", () => assertEquals(lookupArmor("Mythril Plate"), null));
});
