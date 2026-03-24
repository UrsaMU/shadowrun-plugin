// ─── EXPLOIT TEST: L2 — +run/award missing upper karma cap ────────────────────
// VULNERABILITY: awardRun() in run-cmd.ts validates karma >= 1 but has no upper
//   bound. An admin could issue "+run/award 1 Alice=9999999 reason" and credit
//   9,999,999 karma to a player in one command, bypassing the consistent cap
//   enforced by +karma/award (MAX_KARMA_AWARD = 1000).
// FIX: validateRunBonusKarma(karma) exported from sr4/karma.ts:
//   rejects values < 1 or > MAX_KARMA_AWARD (1000).
//   run-cmd.ts calls it in awardRun() in place of the open-ended integer check.

import { assertEquals, assertNotEquals, assert } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { validateRunBonusKarma, MAX_KARMA_AWARD } from "../../src/sr4/karma.ts";

describe("L2 — +run/award karma cap", () => {
  it("karma 1 is valid", () => {
    assertEquals(validateRunBonusKarma(1), null);
  });

  it("karma MAX_KARMA_AWARD is valid", () => {
    assertEquals(validateRunBonusKarma(MAX_KARMA_AWARD), null);
  });

  it("EXPLOIT: karma 9999999 must be rejected", () => {
    const err = validateRunBonusKarma(9_999_999);
    assertNotEquals(err, null, "karma 9999999 must be rejected");
    assert(typeof err === "string" && err.length > 0);
  });

  it("EXPLOIT: karma MAX_KARMA_AWARD+1 must be rejected", () => {
    assertNotEquals(validateRunBonusKarma(MAX_KARMA_AWARD + 1), null);
  });

  it("karma 0 is invalid", () => {
    assertNotEquals(validateRunBonusKarma(0), null);
  });

  it("negative karma is invalid", () => {
    assertNotEquals(validateRunBonusKarma(-1), null);
  });

  it("non-integer karma is invalid", () => {
    assertNotEquals(validateRunBonusKarma(2.5), null);
  });

  it("NaN is invalid", () => {
    assertNotEquals(validateRunBonusKarma(NaN), null);
  });
});
