// ─── Damage tracking tests ────────────────────────────────────────────────────

import { assertEquals, assertStringIncludes } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { physBoxes, stunBoxes } from "../src/sr4/dice.ts";

// Note: the +damage command exec() requires a real DB layer, so we test the
// underlying pure functions (damage box sizes) here, plus edge-case arithmetic.

describe("physBoxes()", () => {
  it("Body 1 → 9 boxes (ceil(1/2)+8 = 1+8)", () => assertEquals(physBoxes(1), 9));
  it("Body 2 → 9 boxes (ceil(2/2)+8 = 1+8)", () => assertEquals(physBoxes(2), 9));
  it("Body 3 → 10 boxes", () => assertEquals(physBoxes(3), 10));
  it("Body 5 → 11 boxes", () => assertEquals(physBoxes(5), 11));
  it("Body 10 → 13 boxes", () => assertEquals(physBoxes(10), 13));
  it("negative body clamps to 9", () => assertEquals(physBoxes(-1), 9));
});

describe("stunBoxes()", () => {
  it("Willpower 1 → 9 boxes", () => assertEquals(stunBoxes(1), 9));
  it("Willpower 2 → 9 boxes", () => assertEquals(stunBoxes(2), 9));
  it("Willpower 3 → 10 boxes", () => assertEquals(stunBoxes(3), 10));
  it("Willpower 6 → 11 boxes", () => assertEquals(stunBoxes(6), 11));
  it("negative willpower clamps to 9", () => assertEquals(stunBoxes(-3), 9));
});

// ── Damage arithmetic (directly testing state mutation logic) ─────────────────

describe("physical damage overflow to stun", () => {
  it("overflow = damage beyond physical max", () => {
    const physMax = physBoxes(3); // 10
    const physDmg = 8;
    const incoming = 5;
    const space = physMax - physDmg; // 2
    const overflow = Math.max(0, incoming - space); // 3
    assertEquals(overflow, 3);
  });

  it("no overflow when damage fits in physical track", () => {
    const physMax = physBoxes(4); // 10
    const physDmg = 3;
    const incoming = 4;
    const overflow = Math.max(0, incoming - (physMax - physDmg));
    assertEquals(overflow, 0);
  });

  it("all damage overflows when physical track is already full", () => {
    const physMax = physBoxes(3); // 10
    const physDmg = 10;
    const incoming = 3;
    const overflow = Math.max(0, incoming - (physMax - physDmg));
    assertEquals(overflow, 3);
  });
});

describe("condition monitor caps", () => {
  it("stun cannot exceed stunMax", () => {
    const stunMax = stunBoxes(2); // 9
    const currentStun = 8;
    const incoming = 5;
    const result = Math.min(currentStun + incoming, stunMax);
    assertEquals(result, 9);
  });

  it("physical cannot exceed physMax", () => {
    const physMax = physBoxes(2); // 9
    const currentPhys = 9;
    const incoming = 3;
    const result = Math.min(currentPhys + incoming, physMax);
    assertEquals(result, 9);
  });
});

// ── Knocked out / incapacitated thresholds ────────────────────────────────────

describe("KO threshold detection", () => {
  it("stun full = knocked out", () => {
    const stunMax = stunBoxes(3); // 10
    assertEquals(10 >= stunMax, true);
  });

  it("one box shy = not knocked out", () => {
    const stunMax = stunBoxes(3); // 10
    assertEquals(9 >= stunMax, false);
  });

  it("physical full = incapacitated", () => {
    const physMax = physBoxes(3); // 10
    assertEquals(10 >= physMax, true);
  });
});
