// ─── EXPLOIT TEST: M-G1 — Prototype-poison keys accepted by validateGearName ──
//
// EXPLOIT: +gear/add __proto__=1 stores {name:"__proto__", quantity:1} in
//   char.gear. Any future code that indexes gear by name (e.g. building a map
//   via reduce) would pollute Object.prototype.
// FIX: validateGearName() must reject the same keys that validateKnowledgeName
//   already blocks: __proto__, constructor, prototype, toString, valueOf,
//   hasOwnProperty, and any name starting with __.

import { assertNotEquals, assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { validateGearName } from "../../src/sr4/gear.ts";

describe("[EXPLOIT M-G1] validateGearName blocks prototype-poison keys", () => {
  // ── These must be REJECTED (return non-null) ──
  it("__proto__ is rejected",       () => assertNotEquals(validateGearName("__proto__"),      null));
  it("constructor is rejected",     () => assertNotEquals(validateGearName("constructor"),    null));
  it("prototype is rejected",       () => assertNotEquals(validateGearName("prototype"),      null));
  it("toString is rejected",        () => assertNotEquals(validateGearName("toString"),       null));
  it("valueOf is rejected",         () => assertNotEquals(validateGearName("valueOf"),        null));
  it("hasOwnProperty is rejected",  () => assertNotEquals(validateGearName("hasOwnProperty"), null));
  it("__ prefix is rejected",       () => assertNotEquals(validateGearName("__anything"),     null));

  // ── These must still be ACCEPTED (return null) ──
  it("normal item name accepted",              () => assertEquals(validateGearName("Armor Jacket"),     null));
  it("item with spaces accepted",              () => assertEquals(validateGearName("Ares Predator IV"), null));
  it("'prototype studies' is NOT blocked",     () => assertEquals(validateGearName("prototype studies"), null)); // substring, not exact key
  it("'constructor kit' is NOT blocked",       () => assertEquals(validateGearName("constructor kit"),   null));
});
