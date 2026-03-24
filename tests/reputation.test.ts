// ─── Reputation & Lifestyle pure function tests (SR4A pp. 276–278) ────────────

import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  lifestyleCost,
  validateLifestyle,
  LIFESTYLE_TIERS,
  LIFESTYLE_COSTS,
  clampRep,
  MAX_REP,
} from "../src/sr4/reputation.ts";
import { mockChar } from "./helpers/mockU.ts";

// ── lifestyleCost() ───────────────────────────────────────────────────────────

describe("lifestyleCost()", () => {
  it("street → 40",    () => assertEquals(lifestyleCost("street"),   40));
  it("squatter → 100", () => assertEquals(lifestyleCost("squatter"), 100));
  it("low → 500",      () => assertEquals(lifestyleCost("low"),      500));
  it("middle → 2000",  () => assertEquals(lifestyleCost("middle"),   2_000));
  it("high → 5000",    () => assertEquals(lifestyleCost("high"),     5_000));
  it("luxury → 10000", () => assertEquals(lifestyleCost("luxury"),   10_000));
});

// ── LIFESTYLE_TIERS ───────────────────────────────────────────────────────────

describe("LIFESTYLE_TIERS", () => {
  it("has exactly 6 tiers", () => assertEquals(LIFESTYLE_TIERS.length, 6));

  it("contains all expected tiers", () => {
    for (const t of ["street", "squatter", "low", "middle", "high", "luxury"]) {
      assertEquals(LIFESTYLE_TIERS.includes(t as never), true, `Missing tier: ${t}`);
    }
  });

  it("costs are strictly increasing", () => {
    for (let i = 1; i < LIFESTYLE_TIERS.length; i++) {
      const prev = LIFESTYLE_COSTS[LIFESTYLE_TIERS[i - 1]];
      const curr = LIFESTYLE_COSTS[LIFESTYLE_TIERS[i]];
      assertEquals(curr > prev, true, `${LIFESTYLE_TIERS[i]} not > ${LIFESTYLE_TIERS[i-1]}`);
    }
  });
});

// ── validateLifestyle() ───────────────────────────────────────────────────────

describe("validateLifestyle()", () => {
  it("valid tier → null",      () => assertEquals(validateLifestyle("low"), null));
  it("all valid tiers → null", () => {
    for (const t of LIFESTYLE_TIERS) {
      assertEquals(validateLifestyle(t), null, `${t} should be valid`);
    }
  });
  it("unknown tier → error string",  () => assertEquals(typeof validateLifestyle("penthouse"), "string"));
  it("empty string → error string",  () => assertEquals(typeof validateLifestyle(""), "string"));
  it("uppercase is invalid",         () => assertEquals(typeof validateLifestyle("Low"), "string"));
});

// ── clampRep() ────────────────────────────────────────────────────────────────

describe("clampRep()", () => {
  it("normal value passes through",   () => assertEquals(clampRep(5), 5));
  it("0 is valid",                    () => assertEquals(clampRep(0), 0));
  it("negative clamped to 0",         () => assertEquals(clampRep(-1), 0));
  it("max value is MAX_REP",          () => assertEquals(clampRep(MAX_REP), MAX_REP));
  it("above max clamped to MAX_REP",  () => assertEquals(clampRep(MAX_REP + 1), MAX_REP));
  it("rounds fractional",             () => assertEquals(clampRep(2.7), 3));
});

// ── IShadowrunChar reputation defaults ───────────────────────────────────────

describe("IShadowrunChar reputation defaults", () => {
  it("streetCred defaults to 0",       () => assertEquals(mockChar().streetCred, 0));
  it("notoriety defaults to 0",        () => assertEquals(mockChar().notoriety, 0));
  it("publicAwareness defaults to 0",  () => assertEquals(mockChar().publicAwareness, 0));
  it("lifestyle defaults to low",      () => assertEquals(mockChar().lifestyle, "low"));

  it("can override streetCred",        () =>
    assertEquals(mockChar({ streetCred: 5 }).streetCred, 5));
  it("can override lifestyle",         () =>
    assertEquals(mockChar({ lifestyle: "high" }).lifestyle, "high"));
});
