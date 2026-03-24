// ─── EXPLOIT TESTS: P6 Security Vulnerabilities ──────────────────────────────
//
// H1 — +toxin/resist uses char-sheet attrs, not user-provided values.
//   EXPLOIT: user passes body=100/willpower=100 in args to guarantee full resist.
//   FIX: toxinResistPoolFromChar() reads char.attrs; command drops the arg split.
//
// H2 — Prototype pollution via user-controlled object keys in +knowledge/+language.
//   EXPLOIT: +knowledge/add __proto__=4/academic pollutes Object.prototype.
//   FIX: validateKnowledgeName() rejects __proto__, constructor, and __ prefix keys.
//
// M1 — Unbounded pool in +extend and +teamwork enables computational DoS.
//   EXPLOIT: +extend 99999/1 passes pool=99999 to rollPool() every keystroke.
//   FIX: validatePoolSize() caps pool at MAX_POOL (30).
//
// L1 — +pilot, +gunnery, +vehicle/damage accept out-of-range numeric inputs.
//   EXPLOIT: +pilot 9999 silently accepted; +vehicle/damage Name=-99999 is odd UX.
//   FIX: validatePilotThreshold() caps 1–20; validateVehicleDamage() caps -50..50.

import { assertEquals, assertNotEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

// ── H1: toxinResistPoolFromChar reads from character sheet ────────────────────

import {
  toxinResistPoolFromChar,  // NEW FUNCTION — does not exist yet → test fails (Red)
  lookupToxin,
} from "../../src/sr4/toxins.ts";
import { mockChar } from "../helpers/mockU.ts";

describe("[EXPLOIT H1] toxinResistPoolFromChar uses char attrs", () => {
  it("Body toxin uses char.attrs.Body, not an arbitrary number", () => {
    const toxin = lookupToxin("Narcoject")!;  // resistAttr: "Body", power: 10
    const char  = mockChar({ attrs: { Body:3, Agility:3, Reaction:3, Strength:3, Charisma:3, Intuition:3, Logic:3, Willpower:3, Edge:2 } });
    const pool  = toxinResistPoolFromChar(toxin, char);
    assertEquals(pool, 3);  // char Body=3, NOT user-supplied 100
  });

  it("Willpower toxin uses char.attrs.Willpower", () => {
    const toxin = { name: "Test", speed: "immediate" as const, vector: "ingestion" as const, power: 6, resistAttr: "Willpower" as const, effect: "stun" as const, description: "" };
    const char  = mockChar({ attrs: { Body:3, Agility:3, Reaction:3, Strength:3, Charisma:3, Intuition:3, Logic:3, Willpower:5, Edge:2 } });
    const pool  = toxinResistPoolFromChar(toxin, char);
    assertEquals(pool, 5);  // char Willpower=5
  });

  it("exploit attempt: cannot override to 100 — pool is always from char sheet", () => {
    const toxin = lookupToxin("Narcoject")!;
    const char  = mockChar({ attrs: { Body:3, Agility:3, Reaction:3, Strength:3, Charisma:3, Intuition:3, Logic:3, Willpower:3, Edge:2 } });
    const pool  = toxinResistPoolFromChar(toxin, char);
    assertNotEquals(pool, 100);  // exploit attempt must produce non-100
    assertEquals(pool <= 10, true);  // realistic cap for char sheet attrs
  });
});

// ── H2: validateKnowledgeName rejects dangerous prototype keys ────────────────

import { validateKnowledgeName } from "../../src/sr4/knowledge.ts";

describe("[EXPLOIT H2] prototype pollution blocked in validateKnowledgeName", () => {
  it("__proto__ is rejected",         () => assertNotEquals(validateKnowledgeName("__proto__"), null));
  it("constructor is rejected",       () => assertNotEquals(validateKnowledgeName("constructor"), null));
  it("prototype is rejected",         () => assertNotEquals(validateKnowledgeName("prototype"), null));
  it("toString is rejected",          () => assertNotEquals(validateKnowledgeName("toString"), null));
  it("valueOf is rejected",           () => assertNotEquals(validateKnowledgeName("valueOf"), null));
  it("hasOwnProperty is rejected",    () => assertNotEquals(validateKnowledgeName("hasOwnProperty"), null));
  it("__ prefix is rejected",         () => assertNotEquals(validateKnowledgeName("__anything"), null));
  it("normal name still accepted",    () => assertEquals(validateKnowledgeName("Corporate Law"), null));
  it("'prototype studies' accepted",  () => assertEquals(validateKnowledgeName("prototype studies"), null)); // not exact "prototype"
});

// ── M1: validatePoolSize caps at MAX_POOL ─────────────────────────────────────

import {
  validatePoolSize,  // NEW FUNCTION — does not exist yet → test fails (Red)
  MAX_POOL,
} from "../../src/sr4/extended.ts";

describe("[EXPLOIT M1] pool size capped at MAX_POOL", () => {
  it("MAX_POOL is exported and ≤ 30",            () => assertEquals(MAX_POOL <= 30, true));
  it("pool 1 → null (valid)",                    () => assertEquals(validatePoolSize(1), null));
  it("pool MAX_POOL → null (valid)",             () => assertEquals(validatePoolSize(MAX_POOL), null));
  it("pool MAX_POOL+1 → error (blocked)",        () => assertNotEquals(validatePoolSize(MAX_POOL + 1), null));
  it("pool 99999 → error (DoS attempt blocked)", () => assertNotEquals(validatePoolSize(99999), null));
  it("pool 0 → error (must be positive)",        () => assertNotEquals(validatePoolSize(0), null));
  it("non-integer → error",                      () => assertNotEquals(validatePoolSize(5.5), null));
});

// ── L1: pilot/gunnery threshold and vehicle damage input bounds ───────────────

import {
  validatePilotThreshold,  // NEW FUNCTION — does not exist yet → test fails (Red)
  validateVehicleDamage,   // NEW FUNCTION — does not exist yet → test fails (Red)
} from "../../src/sr4/vehicles.ts";

describe("[EXPLOIT L1] pilot threshold and vehicle damage bounded", () => {
  it("threshold 1 → null (valid)",   () => assertEquals(validatePilotThreshold(1), null));
  it("threshold 20 → null (valid)",  () => assertEquals(validatePilotThreshold(20), null));
  it("threshold 0 → error",          () => assertNotEquals(validatePilotThreshold(0), null));
  it("threshold 21 → error (blocked)", () => assertNotEquals(validatePilotThreshold(21), null));
  it("threshold 9999 → error (blocked)", () => assertNotEquals(validatePilotThreshold(9999), null));
  it("non-integer threshold → error", () => assertNotEquals(validatePilotThreshold(5.5), null));

  it("damage 1 → null (valid)",      () => assertEquals(validateVehicleDamage(1), null));
  it("damage -50 → null (valid)",    () => assertEquals(validateVehicleDamage(-50), null));
  it("damage 50 → null (valid)",     () => assertEquals(validateVehicleDamage(50), null));
  it("damage 51 → error",            () => assertNotEquals(validateVehicleDamage(51), null));
  it("damage -51 → error",           () => assertNotEquals(validateVehicleDamage(-51), null));
  it("damage 9999 → error (blocked)",() => assertNotEquals(validateVehicleDamage(9999), null));
  it("non-integer damage → error",   () => assertNotEquals(validateVehicleDamage(1.5), null));
});
