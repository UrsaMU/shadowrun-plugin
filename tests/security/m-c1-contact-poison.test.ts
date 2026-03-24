// ─── EXPLOIT TEST: M-C1 — Prototype-poison keys accepted in contact names ─────
//
// EXPLOIT: +contact/add __proto__=6/4 stores {name:"__proto__", connection:6,
//   loyalty:4} in char.contacts. Any future code that builds a contact lookup
//   map (e.g. contacts.reduce((map, c) => ({...map, [c.name]: c}), {})) would
//   pollute Object.prototype.
// FIX: validateContact() must call isPrototypePoisonKey() on the name arg,
//   matching the defence already in validateKnowledgeName() and validateGearName().

import { assertNotEquals, assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { validateContact } from "../../src/sr4/contacts.ts";

describe("[EXPLOIT M-C1] validateContact blocks prototype-poison contact names", () => {
  // ── These must be REJECTED ──
  it("__proto__ contact name is rejected",
    () => assertNotEquals(validateContact("__proto__",   6, 4), null));
  it("constructor contact name is rejected",
    () => assertNotEquals(validateContact("constructor", 6, 4), null));
  it("prototype contact name is rejected",
    () => assertNotEquals(validateContact("prototype",   6, 4), null));
  it("toString contact name is rejected",
    () => assertNotEquals(validateContact("toString",    6, 4), null));
  it("__ prefix contact name is rejected",
    () => assertNotEquals(validateContact("__fixer",     6, 4), null));

  // ── These must still be ACCEPTED ──
  it("normal contact name accepted",
    () => assertEquals(validateContact("Mr. Johnson", 4, 3), null));
  it("name 'Prototype Jones' is NOT blocked (substring, not exact key)",
    () => assertEquals(validateContact("Prototype Jones", 3, 2), null));
  it("name 'The Constructor' is NOT blocked",
    () => assertEquals(validateContact("The Constructor", 5, 1), null));
});
