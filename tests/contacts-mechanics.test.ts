// ─── Contact mechanics pure function tests (SR4A pp. 104–107) ─────────────────

import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  legworkPool,
  contactWilling,
  contactAcquisitionBonus,
  validateFavorRating,
  validateLegworkThreshold,
} from "../src/sr4/contacts.ts";
import type { ICharContact } from "../src/types.ts";

function makeContact(connection: number, loyalty: number): ICharContact {
  return { name: "Test Contact", connection, loyalty };
}

// ── legworkPool() ─────────────────────────────────────────────────────────────

describe("legworkPool()", () => {
  it("Charisma 3 + Connection 4 = 7",   () => assertEquals(legworkPool(3, makeContact(4, 3)), 7));
  it("Charisma 5 + Connection 6 = 11",  () => assertEquals(legworkPool(5, makeContact(6, 3)), 11));
  it("Charisma 1 + Connection 1 = 2",   () => assertEquals(legworkPool(1, makeContact(1, 1)), 2));
  it("Charisma 0 + Connection 3 = 3",   () => assertEquals(legworkPool(0, makeContact(3, 2)), 3));
});

// ── contactWilling() ──────────────────────────────────────────────────────────

describe("contactWilling()", () => {
  it("Loyalty 3 ≥ favor 3 → willing",     () => assertEquals(contactWilling(makeContact(4, 3), 3), true));
  it("Loyalty 4 ≥ favor 3 → willing",     () => assertEquals(contactWilling(makeContact(4, 4), 3), true));
  it("Loyalty 2 < favor 3 → not willing", () => assertEquals(contactWilling(makeContact(4, 2), 3), false));
  it("Loyalty 6 ≥ favor 6 → willing",     () => assertEquals(contactWilling(makeContact(4, 6), 6), true));
  it("Loyalty 5 < favor 6 → not willing", () => assertEquals(contactWilling(makeContact(4, 5), 6), false));
  it("Loyalty 1 ≥ favor 1 → willing",     () => assertEquals(contactWilling(makeContact(4, 1), 1), true));
});

// ── contactAcquisitionBonus() ─────────────────────────────────────────────────

describe("contactAcquisitionBonus()", () => {
  it("Connection 4 → 4 bonus dice",  () => assertEquals(contactAcquisitionBonus(makeContact(4, 3)), 4));
  it("Connection 1 → 1 bonus die",   () => assertEquals(contactAcquisitionBonus(makeContact(1, 3)), 1));
  it("Connection 12 → 12 bonus dice",() => assertEquals(contactAcquisitionBonus(makeContact(12, 3)), 12));
});

// ── validateFavorRating() ─────────────────────────────────────────────────────

describe("validateFavorRating()", () => {
  it("1 → null (valid)",         () => assertEquals(validateFavorRating(1), null));
  it("6 → null (valid)",         () => assertEquals(validateFavorRating(6), null));
  it("3 → null (valid)",         () => assertEquals(validateFavorRating(3), null));
  it("0 → error",                () => assertEquals(typeof validateFavorRating(0), "string"));
  it("7 → error",                () => assertEquals(typeof validateFavorRating(7), "string"));
  it("non-integer → error",      () => assertEquals(typeof validateFavorRating(2.5), "string"));
  it("negative → error",         () => assertEquals(typeof validateFavorRating(-1), "string"));
});

// ── validateLegworkThreshold() ───────────────────────────────────────────────

describe("validateLegworkThreshold()", () => {
  it("1 → null (valid)",   () => assertEquals(validateLegworkThreshold(1), null));
  it("10 → null (valid)",  () => assertEquals(validateLegworkThreshold(10), null));
  it("20 → null (valid)",  () => assertEquals(validateLegworkThreshold(20), null));
  it("0 → error",          () => assertEquals(typeof validateLegworkThreshold(0), "string"));
  it("21 → error",         () => assertEquals(typeof validateLegworkThreshold(21), "string"));
  it("non-integer → error",() => assertEquals(typeof validateLegworkThreshold(3.5), "string"));
});
