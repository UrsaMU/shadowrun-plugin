// ─── EXPLOIT TEST: L-G2 — +gear/catalog (no filter) dumps all 350+ items ─────
//
// EXPLOIT: +gear/catalog with no argument causes gear-cmd.ts to iterate the
//   entire GEAR_CATALOGUE (~350 entries) and send them all in one message.
//   In a MUSH environment this floods the player's terminal and can lock up
//   slow clients. An adversarial user can repeat it rapidly as a soft DoS.
// FIX: When no category filter is supplied, showCatalog() must require one.
//   We test this at the pure-logic level by checking GEAR_CATALOGUE size and
//   verifying the guard constant MAX_CATALOG_UNFILTERED_ROWS is exported and
//   honoured by the filter function.

import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { GEAR_CATALOGUE } from "../../src/sr4/gear-catalogue.ts";
import {
  MAX_CATALOG_UNFILTERED_ROWS,
  safeCatalogSlice,
} from "../../src/sr4/gear-catalogue.ts";

describe("[EXPLOIT L-G2] gear catalogue output is bounded", () => {
  it("GEAR_CATALOGUE has more than MAX_CATALOG_UNFILTERED_ROWS entries (proves guard is needed)", () => {
    assertEquals(GEAR_CATALOGUE.length > MAX_CATALOG_UNFILTERED_ROWS, true);
  });

  it("MAX_CATALOG_UNFILTERED_ROWS is exported and ≤ 50", () => {
    assertEquals(MAX_CATALOG_UNFILTERED_ROWS <= 50, true);
  });

  it("safeCatalogSlice(all) returns at most MAX_CATALOG_UNFILTERED_ROWS entries", () => {
    const slice = safeCatalogSlice(GEAR_CATALOGUE);
    assertEquals(slice.length <= MAX_CATALOG_UNFILTERED_ROWS, true);
  });

  it("safeCatalogSlice with a small list returns the full list", () => {
    const small = GEAR_CATALOGUE.slice(0, 5);
    const slice = safeCatalogSlice(small);
    assertEquals(slice.length, 5);
  });
});
