// ─── EXPLOIT TEST: C1 — Unbounded dice pool DoS ───────────────────────────────
// VULNERABILITY: roll-cmd.ts accepts any pool size. +roll 9999999 allocates a
// 10M-element array and stringifies it, exhausting memory in one tick.
// FIX: MAX_POOL constant + validatePoolSize() exported from sr4/dice.ts,
//      enforced in roll-cmd.ts before calling rollPool().

import { assertEquals, assertNotEquals, assert } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { MAX_POOL, validatePoolSize } from "../../src/sr4/dice.ts";

describe("C1 — dice pool DoS guard", () => {
  it("MAX_POOL is exported and is a reasonable cap (≤ 200)", () => {
    assertNotEquals((MAX_POOL as unknown), undefined, "MAX_POOL must be exported");
    assertEquals(MAX_POOL <= 200, true, `MAX_POOL should be ≤ 200, got ${MAX_POOL}`);
    assertEquals(MAX_POOL >= 50, true, `MAX_POOL should be ≥ 50 to allow large legit pools, got ${MAX_POOL}`);
  });

  it("validatePoolSize returns null for valid pool", () => {
    assertEquals(validatePoolSize(1), null);
    assertEquals(validatePoolSize(MAX_POOL), null);
  });

  it("validatePoolSize returns error for pool exceeding MAX_POOL", () => {
    const err = validatePoolSize(MAX_POOL + 1);
    assertNotEquals(err, null, `pool ${MAX_POOL + 1} must be rejected`);
    assert(typeof err === "string" && err.length > 0, "error must be a non-empty string");
  });

  it("validatePoolSize rejects obviously malicious pool sizes", () => {
    for (const evil of [9_999_999, 1_000_000, 10_000, MAX_POOL + 1]) {
      assertNotEquals(validatePoolSize(evil), null, `pool ${evil} must be rejected`);
    }
  });

  it("validatePoolSize allows all realistic SR4 pools (1 to MAX_POOL)", () => {
    for (let p = 1; p <= MAX_POOL; p++) {
      assertEquals(validatePoolSize(p), null, `pool ${p} should be valid`);
    }
  });
});
