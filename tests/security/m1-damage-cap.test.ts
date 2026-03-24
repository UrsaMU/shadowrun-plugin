// ─── EXPLOIT TEST: M1 — Unbounded damage input ─────────────────────────────
// VULNERABILITY: +damage accepted any positive integer. A value like 9999999
//   caused no stored harm (Math.min caps it) but produced garbled output
//   (overflow = 9999986 in the broadcast), wasted processing, and exposed a
//   lack of input sanitization that could mask future regressions.
// FIX: MAX_DAMAGE_INPUT constant exported from sr4/dice.ts;
//      damage-cmd.ts rejects inputs above that cap.

import { assertEquals, assertNotEquals, assert } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { MAX_DAMAGE_INPUT, validateDamageInput } from "../../src/sr4/dice.ts";

describe("M1 — damage input cap", () => {
  it("MAX_DAMAGE_INPUT is exported and reasonable (≤ 999)", () => {
    assertNotEquals((MAX_DAMAGE_INPUT as unknown), undefined, "MAX_DAMAGE_INPUT must be exported");
    assertEquals(MAX_DAMAGE_INPUT <= 999, true, `MAX_DAMAGE_INPUT should be ≤ 999, got ${MAX_DAMAGE_INPUT}`);
    assertEquals(MAX_DAMAGE_INPUT >= 10, true, `MAX_DAMAGE_INPUT should be ≥ 10, got ${MAX_DAMAGE_INPUT}`);
  });

  it("validateDamageInput returns null for valid amounts", () => {
    assertEquals(validateDamageInput(1), null);
    assertEquals(validateDamageInput(10), null);
    assertEquals(validateDamageInput(MAX_DAMAGE_INPUT), null);
  });

  it("validateDamageInput rejects zero and negative", () => {
    assertNotEquals(validateDamageInput(0), null, "0 must be rejected");
    assertNotEquals(validateDamageInput(-1), null, "-1 must be rejected");
  });

  it("EXPLOIT: validateDamageInput rejects absurdly large inputs", () => {
    for (const evil of [9_999_999, 1_000_000, MAX_DAMAGE_INPUT + 1]) {
      const err = validateDamageInput(evil);
      assertNotEquals(err, null, `damage ${evil} must be rejected`);
      assert(typeof err === "string" && err.length > 0, "error must be a non-empty string");
    }
  });

  it("validateDamageInput rejects non-integer", () => {
    assertNotEquals(validateDamageInput(NaN), null);
    assertNotEquals(validateDamageInput(3.5), null);
  });
});
