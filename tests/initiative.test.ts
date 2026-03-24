// ─── Initiative tests ──────────────────────────────────────────────────────────

import { assertEquals, assertStringIncludes, assert } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  rollInitiative,
  rollInitiativeEdge,
  MAX_INIT_DICE,
  MAX_INIT_ATTR_SUM,
} from "../src/sr4/initiative.ts";

// ── rollInitiative ────────────────────────────────────────────────────────────

describe("rollInitiative()", () => {
  it("attrSum=8, die=4 → total 12", () => {
    const result = rollInitiative(8, 1, () => 4);
    assertEquals(result.attrSum, 8);
    assertEquals(result.dice, [4]);
    assertEquals(result.total, 12);
    assertEquals(result.edgeUsed, false);
  });

  it("attrSum=0 clamped to 1 — no panic", () => {
    const result = rollInitiative(0, 1, () => 3);
    assertEquals(result.attrSum, 1);
    assertEquals(result.total, 4);
  });

  it("negative attrSum clamped to 1", () => {
    const result = rollInitiative(-5, 1, () => 2);
    assertEquals(result.attrSum, 1);
    assertEquals(result.total, 3);
  });

  it("numDice=3 → sums all 3 dice", () => {
    let call = 0;
    const dice = [2, 5, 3];
    const result = rollInitiative(6, 3, () => dice[call++]);
    assertEquals(result.dice, [2, 5, 3]);
    assertEquals(result.total, 6 + 2 + 5 + 3);
  });

  it("deterministic with fixed rng", () => {
    const r1 = rollInitiative(7, 1, () => 6);
    const r2 = rollInitiative(7, 1, () => 6);
    assertEquals(r1.total, r2.total);
    assertEquals(r1.total, 13);
  });

  it("numDice clamped to MAX_INIT_DICE", () => {
    const result = rollInitiative(5, MAX_INIT_DICE + 10, () => 3);
    assertEquals(result.dice.length, MAX_INIT_DICE);
  });

  it("attrSum clamped to MAX_INIT_ATTR_SUM", () => {
    const result = rollInitiative(MAX_INIT_ATTR_SUM + 50, 1, () => 1);
    assertEquals(result.attrSum, MAX_INIT_ATTR_SUM);
    assertEquals(result.total, MAX_INIT_ATTR_SUM + 1);
  });

  it("typical SR4 character: Reaction 3 + Intuition 3 = 6, roll 4 → 10", () => {
    const result = rollInitiative(6, 1, () => 4);
    assertEquals(result.total, 10);
  });

  it("max natural init: Reaction 9 + Intuition 9 = 18, roll 6 → 24", () => {
    const result = rollInitiative(18, 1, () => 6);
    assertEquals(result.total, 24);
  });

  it("minimum possible result: attrSum=1, die=1 → 2", () => {
    const result = rollInitiative(1, 1, () => 1);
    assertEquals(result.total, 2);
  });
});

// ── rollInitiativeEdge ────────────────────────────────────────────────────────

describe("rollInitiativeEdge()", () => {
  it("edgeUsed is true", () => {
    const result = rollInitiativeEdge(8, 1, () => 6);
    assertEquals(result.edgeUsed, true);
  });

  it("dice showing 5–6 are kept (not rerolled)", () => {
    // rng always returns 5; no reroll should happen
    const result = rollInitiativeEdge(6, 1, () => 5);
    assertEquals(result.dice, [5]);
    assertEquals(result.total, 11);
  });

  it("dice showing 1–4 are rerolled once", () => {
    let call = 0;
    // First call: die shows 3 (gets rerolled); second call: shows 6
    const result = rollInitiativeEdge(8, 1, () => (call++ === 0 ? 3 : 6));
    assertEquals(result.dice, [6]);
    assertEquals(result.total, 14);
  });

  it("multiple dice: mix of kept and rerolled", () => {
    // Dice 1: initial=6 (kept), Dice 2: initial=2 (rerolled→5)
    const rolls = [6, 2, 5]; // initial 6, initial 2, reroll of die2
    let idx = 0;
    const result = rollInitiativeEdge(4, 2, () => rolls[idx++]);
    assertEquals(result.dice, [6, 5]);
    assertEquals(result.total, 4 + 6 + 5);
  });

  it("rerolled die may land on 1 (no guarantee of improvement)", () => {
    // Initial: 2; Reroll: 1
    let call = 0;
    const result = rollInitiativeEdge(5, 1, () => (call++ === 0 ? 2 : 1));
    assertEquals(result.dice, [1]);
    assertEquals(result.total, 6); // 5 + 1
  });
});

// ── constants sanity ──────────────────────────────────────────────────────────

describe("initiative constants", () => {
  it("MAX_INIT_DICE is at least 4 (Wired Reflexes 3)", () => {
    assert(MAX_INIT_DICE >= 4);
  });

  it("MAX_INIT_ATTR_SUM is reasonable (≤ 200)", () => {
    assert(MAX_INIT_ATTR_SUM >= 1 && MAX_INIT_ATTR_SUM <= 200);
  });
});

// ── display helper ────────────────────────────────────────────────────────────

describe("initiative output format", () => {
  it("result includes all expected fields", () => {
    const r = rollInitiative(8, 1, () => 4);
    assertStringIncludes(
      `Initiative: ${r.attrSum} + [${r.dice.join(", ")}] = ${r.total}`,
      "12",
    );
  });
});
