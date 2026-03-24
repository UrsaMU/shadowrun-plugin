// ─── Gear tests ────────────────────────────────────────────────────────────────

import { assertEquals, assertNotEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  validateGearName, validateQuantity, validateGearNote,
  MAX_GEAR_NAME, MAX_GEAR_NOTE, MAX_GEAR_QUANTITY,
} from "../src/sr4/gear.ts";
import type { IGearItem } from "../src/types.ts";

// ── validateGearName() ────────────────────────────────────────────────────────

describe("validateGearName()", () => {
  it("valid name → null", () => assertEquals(validateGearName("Ares Predator IV"), null));
  it("empty name → error", () => assertNotEquals(validateGearName(""), null));
  it("exactly 80 chars → null", () => assertEquals(validateGearName("x".repeat(80)), null));
  it("81 chars → error", () => assertNotEquals(validateGearName("x".repeat(81)), null));
  it("MAX_GEAR_NAME is 80", () => assertEquals(MAX_GEAR_NAME, 80));
});

// ── validateQuantity() ────────────────────────────────────────────────────────

describe("validateQuantity()", () => {
  it("1 → null", () => assertEquals(validateQuantity(1), null));
  it("9999 → null", () => assertEquals(validateQuantity(MAX_GEAR_QUANTITY), null));
  it("0 → error", () => assertNotEquals(validateQuantity(0), null));
  it("-1 → error", () => assertNotEquals(validateQuantity(-1), null));
  it("float → error", () => assertNotEquals(validateQuantity(1.5), null));
  it("over max → error", () => assertNotEquals(validateQuantity(MAX_GEAR_QUANTITY + 1), null));
  it("NaN → error", () => assertNotEquals(validateQuantity(NaN), null));
});

// ── validateGearNote() ────────────────────────────────────────────────────────

describe("validateGearNote()", () => {
  it("empty string → null (note is optional)", () => assertEquals(validateGearNote(""), null));
  it("200 chars → null", () => assertEquals(validateGearNote("x".repeat(200)), null));
  it("201 chars → error", () => assertNotEquals(validateGearNote("x".repeat(201)), null));
  it("MAX_GEAR_NOTE is 200", () => assertEquals(MAX_GEAR_NOTE, 200));
});

// ── IGearItem shape ───────────────────────────────────────────────────────────

describe("IGearItem schema", () => {
  it("required fields only", () => {
    const item: IGearItem = { name: "Armor Jacket", quantity: 1 };
    assertEquals(item.name, "Armor Jacket");
    assertEquals(item.quantity, 1);
    assertEquals(item.note, undefined);
  });

  it("with optional note", () => {
    const item: IGearItem = { name: "Armor Jacket", quantity: 1, note: "Used" };
    assertEquals(item.note, "Used");
  });
});

// ── duplicate detection logic ─────────────────────────────────────────────────

describe("gear duplicate detection", () => {
  const gear: IGearItem[] = [
    { name: "Ares Predator IV", quantity: 1 },
    { name: "Armor Jacket", quantity: 1 },
  ];

  it("finds existing item case-insensitively", () => {
    const idx = gear.findIndex((g) => g.name.toLowerCase() === "ares predator iv".toLowerCase());
    assertNotEquals(idx, -1);
  });

  it("returns -1 for missing item", () => {
    const idx = gear.findIndex((g) => g.name.toLowerCase() === "grenade".toLowerCase());
    assertEquals(idx, -1);
  });
});

// ── mockChar gear field ───────────────────────────────────────────────────────

describe("mockChar gear defaults", () => {
  it("gear defaults to empty array", async () => {
    const { mockChar } = await import("./helpers/mockU.ts");
    const char = mockChar();
    assertEquals(char.gear, []);
  });

  it("gear can be overridden", async () => {
    const { mockChar } = await import("./helpers/mockU.ts");
    const char = mockChar({ gear: [{ name: "Knife", quantity: 2 }] });
    assertEquals(char.gear.length, 1);
    assertEquals(char.gear[0].name, "Knife");
  });
});
