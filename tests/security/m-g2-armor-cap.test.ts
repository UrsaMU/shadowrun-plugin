// ─── EXPLOIT TEST: M-G2 — Uncapped armor stacking via gear list ───────────────
//
// EXPLOIT: A player adds every armour item in the catalogue simultaneously.
//   recomputeArmorFromGear() sums all ballistic/impact values with no ceiling.
//   20 armour catalogue entries × avg ~6 ballistic = 120+ ballistic armour,
//   making the character effectively invulnerable in combat.
// FIX: recomputeArmorFromGear() must clamp output to MAX_ARMOR_BALLISTIC /
//   MAX_ARMOR_IMPACT. These caps sit above any single legitimate loadout
//   (Full Body Armor 10/8 + all accessories ≈ 18/15) but stop abuse.

import { assertEquals, assertLessOrEqual } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  recomputeArmorFromGear,
  MAX_ARMOR_BALLISTIC,
  MAX_ARMOR_IMPACT,
} from "../../src/sr4/gear.ts";
import type { IGearItem } from "../../src/types.ts";

// ── helper: build a gear list that adds up past any reasonable cap ─────────────
function stackedArmorGear(): IGearItem[] {
  // 30 items each with ballistic=10, impact=8 → raw sum = 300/240
  return Array.from({ length: 30 }, (_, i) => ({
    name:      `Fake Armor ${i}`,
    quantity:  1,
    ballistic: 10,
    impact:    8,
  }));
}

describe("[EXPLOIT M-G2] recomputeArmorFromGear caps totals", () => {
  it("MAX_ARMOR_BALLISTIC is exported and ≥ 20",
    () => assertEquals(MAX_ARMOR_BALLISTIC >= 20, true));

  it("MAX_ARMOR_IMPACT is exported and ≥ 15",
    () => assertEquals(MAX_ARMOR_IMPACT >= 15, true));

  it("stacking 30 × 10-ballistic items is capped at MAX_ARMOR_BALLISTIC", () => {
    const { ballistic } = recomputeArmorFromGear(stackedArmorGear());
    assertLessOrEqual(ballistic, MAX_ARMOR_BALLISTIC);
  });

  it("stacking 30 × 8-impact items is capped at MAX_ARMOR_IMPACT", () => {
    const { impact } = recomputeArmorFromGear(stackedArmorGear());
    assertLessOrEqual(impact, MAX_ARMOR_IMPACT);
  });

  it("raw stacked sum (300 / 240) is not returned — proves exploit is closed", () => {
    const { ballistic, impact } = recomputeArmorFromGear(stackedArmorGear());
    assertEquals(ballistic < 300, true);
    assertEquals(impact    < 240, true);
  });

  it("legitimate loadout (Armor Jacket 8/6 + Helmet 1/2) is unaffected", () => {
    const gear: IGearItem[] = [
      { name: "Armor Jacket", quantity: 1, ballistic: 8, impact: 6 },
      { name: "Helmet",       quantity: 1, ballistic: 1, impact: 2 },
    ];
    const { ballistic, impact } = recomputeArmorFromGear(gear);
    assertEquals(ballistic, 9);
    assertEquals(impact,    8);
  });

  it("empty gear list → 0/0", () => {
    const { ballistic, impact } = recomputeArmorFromGear([]);
    assertEquals(ballistic, 0);
    assertEquals(impact,    0);
  });
});
