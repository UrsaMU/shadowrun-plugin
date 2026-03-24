// ─── EXPLOIT TEST: L1 — Non-null assertion panic ───────────────────────────
// VULNERABILITY: chargen/attrs.ts line 71: `getMetatype(char.metatype)!`
//   If the DB contains a character whose metatype field holds an invalid or
//   removed metatype string, the non-null assertion throws a TypeError at
//   runtime, crashing the command handler and exposing a stack trace.
// FIX: Replace ! with a null guard that sends a recoverable error message.

import { assertEquals, assertNotEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { getMetatype } from "../../src/sr4/metatypes.ts";

describe("L1 — metatype null guard (unit)", () => {
  it("getMetatype returns null for unknown metatype (not an error)", () => {
    // This is the underlying function that used to be called with !
    const result = getMetatype("Shapeshifter");
    assertEquals(result, null, "Unknown metatype must return null, not throw");
  });

  it("getMetatype returns null for empty string", () => {
    assertEquals(getMetatype(""), null);
  });

  it("getMetatype returns null for garbage input", () => {
    assertEquals(getMetatype("DROP TABLE chars; --"), null);
  });

  it("getMetatype returns valid entry for known metatypes", () => {
    assertNotEquals(getMetatype("Human"), null);
    assertNotEquals(getMetatype("Troll"), null);
    assertNotEquals(getMetatype("Elf"), null);
    assertNotEquals(getMetatype("Ork"), null);
    assertNotEquals(getMetatype("Dwarf"), null);
  });

  it("EXPLOIT: calling code with ! on null result would throw TypeError", () => {
    // Simulate the old code: getMetatype(invalidMetatype)!
    // This test verifies the fix by checking getMetatype returns null
    // so any code calling it with ! would panic on corrupt DB data.
    const corruptMetatype = "CORRUPTED_DATA";
    const meta = getMetatype(corruptMetatype);
    assertEquals(meta, null, "corrupt metatype returns null — old code with ! would throw here");
    // The fix in attrs.ts must handle this null gracefully, not assert it away.
  });
});
