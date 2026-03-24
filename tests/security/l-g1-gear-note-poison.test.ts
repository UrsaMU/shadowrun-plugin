// ─── EXPLOIT TEST: L-G1 — Prototype-poison keys accepted in gear notes ────────
//
// EXPLOIT: +gear/note Knife=__proto__ sets note to the string "__proto__".
//   Notes are stored as item.note and are unlikely to become object keys today,
//   but the inconsistency is a defence-in-depth gap.
// FIX: validateGearNote() rejects prototype-poison keys, consistent with
//   all other string validators in the plugin.

import { assertNotEquals, assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { validateGearNote } from "../../src/sr4/gear.ts";

describe("[EXPLOIT L-G1] validateGearNote blocks prototype-poison keys", () => {
  // ── These must be REJECTED ──
  it("__proto__ note is rejected",
    () => assertNotEquals(validateGearNote("__proto__"),      null));
  it("constructor note is rejected",
    () => assertNotEquals(validateGearNote("constructor"),    null));
  it("__ prefix note is rejected",
    () => assertNotEquals(validateGearNote("__secret"),       null));

  // ── These must still be ACCEPTED ──
  it("normal note is accepted",
    () => assertEquals(validateGearNote("Smartlinked, silencer attached"), null));
  it("empty note is accepted (note is optional)",
    () => assertEquals(validateGearNote(""), null));
  it("note mentioning 'constructor kit' is NOT blocked",
    () => assertEquals(validateGearNote("has constructor kit attached"), null));
});
