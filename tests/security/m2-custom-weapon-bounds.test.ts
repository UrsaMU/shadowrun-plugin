// ─── EXPLOIT TEST: M2 — Unbounded custom weapon DV/AP in +attack ──────────────
// VULNERABILITY: parseWeapon() in attack-cmd.ts accepts custom weapon profiles
//   in the form "<dv>/<ap>/<P|S>" with no bounds on dv or ap.
//   "+attack Alice=9999/-9999/P" creates a weapon with DV=9999, AP=-9999.
//   rawDV = 9999 + netHits is then stored directly onto the defender's damage
//   track, corrupting their character sheet with an arbitrary large number.
// FIX: validateCustomWeapon(dv, ap) exported from sr4/combat.ts.
//   DV is capped to 1–30 (highest canonical SR4 weapon is ~16 DV).
//   AP is capped to -20..0 (most negative canonical AP is -6; giving generous room).

import { assertEquals, assertNotEquals, assert } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { validateCustomWeapon } from "../../src/sr4/combat.ts";

describe("M2 — custom weapon DV/AP bounds", () => {
  // ── DV bounds ────────────────────────────────────────────────────────────────
  it("DV 1 is valid",  () => assertEquals(validateCustomWeapon(1,  0), null));
  it("DV 16 is valid", () => assertEquals(validateCustomWeapon(16, 0), null));
  it("DV 30 is valid", () => assertEquals(validateCustomWeapon(30, 0), null));

  it("EXPLOIT: DV 9999 must be rejected", () => {
    const err = validateCustomWeapon(9999, 0);
    assertNotEquals(err, null, "DV 9999 must be rejected");
    assert(typeof err === "string" && err.length > 0);
  });

  it("EXPLOIT: DV 31 must be rejected", () => {
    assertNotEquals(validateCustomWeapon(31, 0), null);
  });

  it("DV 0 must be rejected (not a positive integer)", () => {
    assertNotEquals(validateCustomWeapon(0, 0), null);
  });

  it("negative DV must be rejected", () => {
    assertNotEquals(validateCustomWeapon(-1, 0), null);
  });

  it("non-integer DV must be rejected", () => {
    assertNotEquals(validateCustomWeapon(5.5, 0), null);
  });

  // ── AP bounds ────────────────────────────────────────────────────────────────
  it("AP 0 is valid",   () => assertEquals(validateCustomWeapon(5,  0),   null));
  it("AP -6 is valid",  () => assertEquals(validateCustomWeapon(5, -6),   null));
  it("AP -20 is valid", () => assertEquals(validateCustomWeapon(5, -20),  null));

  it("EXPLOIT: AP -9999 must be rejected", () => {
    const err = validateCustomWeapon(5, -9999);
    assertNotEquals(err, null, "AP -9999 must be rejected");
    assert(typeof err === "string" && err.length > 0);
  });

  it("EXPLOIT: AP -21 must be rejected", () => {
    assertNotEquals(validateCustomWeapon(5, -21), null);
  });

  it("positive AP must be rejected (SR4 AP is always ≤ 0)", () => {
    assertNotEquals(validateCustomWeapon(5, 1), null);
  });

  it("non-integer AP must be rejected", () => {
    assertNotEquals(validateCustomWeapon(5, -1.5), null);
  });
});
