// ─── Extended & Teamwork test pure function tests (SR4A pp. 62–65) ────────────

import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  accumulateHits,
  extendedTestComplete,
  teamworkPool,
  maxAssistants,
  validateExtendedThreshold,
  validateAccumulated,
} from "../src/sr4/extended.ts";

// ── accumulateHits() ──────────────────────────────────────────────────────────

describe("accumulateHits()", () => {
  it("0 + 3 = 3",   () => assertEquals(accumulateHits(0, 3), 3));
  it("5 + 4 = 9",   () => assertEquals(accumulateHits(5, 4), 9));
  it("3 + 0 = 3",   () => assertEquals(accumulateHits(3, 0), 3));
  it("0 + 0 = 0",   () => assertEquals(accumulateHits(0, 0), 0));
  it("10 + 5 = 15", () => assertEquals(accumulateHits(10, 5), 15));
});

// ── extendedTestComplete() ────────────────────────────────────────────────────

describe("extendedTestComplete()", () => {
  it("exactly at threshold → complete",     () => assertEquals(extendedTestComplete(5, 5), true));
  it("exceeds threshold → complete",        () => assertEquals(extendedTestComplete(7, 5), true));
  it("below threshold → not complete",      () => assertEquals(extendedTestComplete(4, 5), false));
  it("0 hits, threshold 1 → not complete",  () => assertEquals(extendedTestComplete(0, 1), false));
  it("1 hit, threshold 1 → complete",       () => assertEquals(extendedTestComplete(1, 1), true));
});

// ── teamworkPool() ────────────────────────────────────────────────────────────

describe("teamworkPool()", () => {
  it("no assistants → primary pool",               () => assertEquals(teamworkPool(6, []), 6));
  it("one assistant 2 hits → 6+2=8",               () => assertEquals(teamworkPool(6, [2]), 8));
  it("two assistants 2+3 hits → 6+5=11",           () => assertEquals(teamworkPool(6, [2, 3]), 11));
  it("capped at primaryPool × 2",                   () => assertEquals(teamworkPool(4, [8]), 8)); // 4+8=12, cap=8
  it("exactly at cap → cap value",                  () => assertEquals(teamworkPool(5, [5]), 10));
  it("zero assistant hits → unchanged",             () => assertEquals(teamworkPool(6, [0, 0]), 6));
  it("large assistant sum clamped to cap",          () => assertEquals(teamworkPool(3, [10, 10]), 6)); // 3*2=6
});

// ── maxAssistants() ───────────────────────────────────────────────────────────

describe("maxAssistants()", () => {
  it("rating 0 → 1 (minimum)",  () => assertEquals(maxAssistants(0), 1));
  it("rating 1 → 1",            () => assertEquals(maxAssistants(1), 1));
  it("rating 4 → 4",            () => assertEquals(maxAssistants(4), 4));
  it("rating 6 → 6",            () => assertEquals(maxAssistants(6), 6));
});

// ── validateExtendedThreshold() ──────────────────────────────────────────────

describe("validateExtendedThreshold()", () => {
  it("1 → null",           () => assertEquals(validateExtendedThreshold(1), null));
  it("20 → null",          () => assertEquals(validateExtendedThreshold(20), null));
  it("50 → null",          () => assertEquals(validateExtendedThreshold(50), null));
  it("0 → error",          () => assertEquals(typeof validateExtendedThreshold(0), "string"));
  it("51 → error",         () => assertEquals(typeof validateExtendedThreshold(51), "string"));
  it("non-integer → error",() => assertEquals(typeof validateExtendedThreshold(5.5), "string"));
});

// ── validateAccumulated() ─────────────────────────────────────────────────────

describe("validateAccumulated()", () => {
  it("0 → null",           () => assertEquals(validateAccumulated(0), null));
  it("10 → null",          () => assertEquals(validateAccumulated(10), null));
  it("-1 → error",         () => assertEquals(typeof validateAccumulated(-1), "string"));
  it("non-integer → error",() => assertEquals(typeof validateAccumulated(2.5), "string"));
});
