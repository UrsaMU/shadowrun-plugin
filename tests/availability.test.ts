// ─── Availability & acquisition pure function tests (SR4A pp. 314–315) ────────

import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  availabilityTier,
  acquisitionThreshold,
  acquisitionPool,
  fencingValue,
  validateAvailability,
} from "../src/sr4/availability.ts";

// ── availabilityTier() ────────────────────────────────────────────────────────

describe("availabilityTier()", () => {
  it("1 → standard",    () => assertEquals(availabilityTier(1), "standard"));
  it("8 → standard",    () => assertEquals(availabilityTier(8), "standard"));
  it("9 → restricted",  () => assertEquals(availabilityTier(9), "restricted"));
  it("12 → restricted", () => assertEquals(availabilityTier(12), "restricted"));
  it("13 → forbidden",  () => assertEquals(availabilityTier(13), "forbidden"));
  it("20 → forbidden",  () => assertEquals(availabilityTier(20), "forbidden"));
  it("24 → forbidden",  () => assertEquals(availabilityTier(24), "forbidden"));
});

// ── acquisitionThreshold() ────────────────────────────────────────────────────

describe("acquisitionThreshold()", () => {
  it("avail 1 → threshold 1",   () => assertEquals(acquisitionThreshold(1), 1));
  it("avail 2 → threshold 1",   () => assertEquals(acquisitionThreshold(2), 1));
  it("avail 6 → threshold 3",   () => assertEquals(acquisitionThreshold(6), 3));
  it("avail 7 → threshold 4",   () => assertEquals(acquisitionThreshold(7), 4));
  it("avail 12 → threshold 6",  () => assertEquals(acquisitionThreshold(12), 6));
  it("avail 14 → threshold 7",  () => assertEquals(acquisitionThreshold(14), 7));
  it("avail 24 → threshold 12", () => assertEquals(acquisitionThreshold(24), 12));
});

// ── acquisitionPool() ─────────────────────────────────────────────────────────

describe("acquisitionPool()", () => {
  it("Neg 3 + Cha 3 + 0 contact = 6",   () => assertEquals(acquisitionPool(3, 3, 0), 6));
  it("Neg 3 + Cha 3 + 4 contact = 10",  () => assertEquals(acquisitionPool(3, 3, 4), 10));
  it("Neg 0 + Cha 4 + 0 contact = 4",   () => assertEquals(acquisitionPool(0, 4, 0), 4));
  it("Neg 5 + Cha 5 + 5 contact = 15",  () => assertEquals(acquisitionPool(5, 5, 5), 15));
});

// ── fencingValue() ────────────────────────────────────────────────────────────

describe("fencingValue()", () => {
  it("1000 at 30% → 300",   () => assertEquals(fencingValue(1000), 300));
  it("1000 at 20% → 200",   () => assertEquals(fencingValue(1000, 0.2), 200));
  it("1000 at 40% → 400",   () => assertEquals(fencingValue(1000, 0.4), 400));
  it("999 at 30% → 299",    () => assertEquals(fencingValue(999), 299));  // floor
  it("0 → 0",               () => assertEquals(fencingValue(0), 0));
});

// ── validateAvailability() ────────────────────────────────────────────────────

describe("validateAvailability()", () => {
  it("1 → null",             () => assertEquals(validateAvailability(1), null));
  it("8 → null",             () => assertEquals(validateAvailability(8), null));
  it("24 → null",            () => assertEquals(validateAvailability(24), null));
  it("0 → error",            () => assertEquals(typeof validateAvailability(0), "string"));
  it("25 → error",           () => assertEquals(typeof validateAvailability(25), "string"));
  it("non-integer → error",  () => assertEquals(typeof validateAvailability(5.5), "string"));
  it("negative → error",     () => assertEquals(typeof validateAvailability(-1), "string"));
});
