// ─── EXPLOIT TEST: C2 — +attack pool override DoS ─────────────────────────────
// VULNERABILITY: attack-cmd.ts accepts an optional pool override from the
//   user: "+attack Alice=predator/99999" sets poolOverride=99999, then calls
//   rollPool(99999) which allocates a 99,999-element array in one tick.
//   The validatePoolSize() guard that closed C1 was never wired into the
//   attack command's pool-override code path.
// FIX: validateAttackPool(pool: number | null) exported from sr4/dice.ts;
//   returns null for null (no override), otherwise delegates to validatePoolSize().
//   attack-cmd.ts calls it on maybePool before assigning poolOverride.

import { assertEquals, assertNotEquals, assert } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { validateAttackPool, MAX_POOL } from "../../src/sr4/dice.ts";

describe("C2 — +attack pool override DoS guard", () => {
  it("null override (char-sheet pool) is always valid", () => {
    assertEquals(validateAttackPool(null), null);
  });

  it("override of 1 is valid", () => {
    assertEquals(validateAttackPool(1), null);
  });

  it("override of MAX_POOL is valid", () => {
    assertEquals(validateAttackPool(MAX_POOL), null);
  });

  it("EXPLOIT: override of 99999 must be rejected", () => {
    const err = validateAttackPool(99999);
    assertNotEquals(err, null, "pool 99999 must be rejected");
    assert(typeof err === "string" && err.length > 0, "error must be a non-empty string");
  });

  it("EXPLOIT: override of MAX_POOL+1 must be rejected", () => {
    assertNotEquals(validateAttackPool(MAX_POOL + 1), null);
  });

  it("EXPLOIT: canonical DoS values are all rejected", () => {
    for (const evil of [9_999_999, 1_000_000, 10_000, MAX_POOL + 1]) {
      assertNotEquals(
        validateAttackPool(evil),
        null,
        `pool override ${evil} must be rejected`,
      );
    }
  });

  it("zero override is invalid", () => {
    assertNotEquals(validateAttackPool(0), null);
  });

  it("negative override is invalid", () => {
    assertNotEquals(validateAttackPool(-1), null);
  });

  it("non-integer override is invalid", () => {
    assertNotEquals(validateAttackPool(5.5), null);
  });

  it("all valid overrides 1..MAX_POOL pass", () => {
    for (let p = 1; p <= MAX_POOL; p++) {
      assertEquals(validateAttackPool(p), null, `override ${p} should be valid`);
    }
  });
});
