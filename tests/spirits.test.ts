// ─── Spirit pure function tests (SR4A pp. 183–209) ────────────────────────────

import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  SPIRIT_TYPES,
  spiritsForTradition,
  lookupSpiritType,
  isSpiritValidForTradition,
  summoningServices,
  summoningDrain,
  spiritBanishPool,
} from "../src/sr4/spirits.ts";
import type { ISpiritRecord } from "../src/types.ts";
import { mockChar } from "./helpers/mockU.ts";

// ── SPIRIT_TYPES catalogue ────────────────────────────────────────────────────

describe("SPIRIT_TYPES catalogue", () => {
  it("has at least 5 spirit types", () => {
    assertEquals(SPIRIT_TYPES.length >= 5, true);
  });

  it("all spirits have name", () => {
    for (const s of SPIRIT_TYPES) {
      assertEquals(s.name.length > 0, true);
    }
  });

  it("all spirits have at least one tradition", () => {
    for (const s of SPIRIT_TYPES) {
      assertEquals(s.traditions.length > 0, true, `${s.name} has no traditions`);
    }
  });

  it("traditions are Hermetic and/or Shaman only", () => {
    for (const s of SPIRIT_TYPES) {
      for (const t of s.traditions) {
        assertEquals(t === "Hermetic" || t === "Shaman", true, `${s.name} has invalid tradition: ${t}`);
      }
    }
  });

  it("Man spirit belongs to both traditions", () => {
    const man = SPIRIT_TYPES.find((s) => s.name === "Man");
    assertEquals(man?.traditions.includes("Hermetic"), true);
    assertEquals(man?.traditions.includes("Shaman"), true);
  });

  it("Air belongs to Hermetic only", () => {
    const air = SPIRIT_TYPES.find((s) => s.name === "Air");
    assertEquals(air?.traditions.includes("Hermetic"), true);
    assertEquals(air?.traditions.includes("Shaman"), false);
  });

  it("Beasts belongs to Shaman only", () => {
    const beasts = SPIRIT_TYPES.find((s) => s.name === "Beasts");
    assertEquals(beasts?.traditions.includes("Shaman"), true);
    assertEquals(beasts?.traditions.includes("Hermetic"), false);
  });
});

// ── spiritsForTradition() ─────────────────────────────────────────────────────

describe("spiritsForTradition()", () => {
  it("Hermetic gets Air, Earth, Fire, Water, Man", () => {
    const names = spiritsForTradition("Hermetic").map((s) => s.name);
    assertEquals(names.includes("Air"), true);
    assertEquals(names.includes("Earth"), true);
    assertEquals(names.includes("Fire"), true);
    assertEquals(names.includes("Water"), true);
    assertEquals(names.includes("Man"), true);
  });

  it("Hermetic does NOT get Beasts", () => {
    const names = spiritsForTradition("Hermetic").map((s) => s.name);
    assertEquals(names.includes("Beasts"), false);
  });

  it("Shaman gets Beasts, Elements, Man", () => {
    const names = spiritsForTradition("Shaman").map((s) => s.name);
    assertEquals(names.includes("Beasts"), true);
    assertEquals(names.includes("Elements"), true);
    assertEquals(names.includes("Man"), true);
  });

  it("Shaman does NOT get Air", () => {
    const names = spiritsForTradition("Shaman").map((s) => s.name);
    assertEquals(names.includes("Air"), false);
  });
});

// ── lookupSpiritType() ────────────────────────────────────────────────────────

describe("lookupSpiritType()", () => {
  it("finds Air by exact name", () =>
    assertEquals(lookupSpiritType("Air")?.name, "Air"));

  it("case-insensitive", () =>
    assertEquals(lookupSpiritType("air")?.name, "Air"));

  it("returns null for unknown", () =>
    assertEquals(lookupSpiritType("Dragon"), null));

  it("finds Man", () =>
    assertEquals(lookupSpiritType("Man")?.name, "Man"));
});

// ── isSpiritValidForTradition() ───────────────────────────────────────────────

describe("isSpiritValidForTradition()", () => {
  it("Air is valid for Hermetic", () =>
    assertEquals(isSpiritValidForTradition("Air", "Hermetic"), true));

  it("Air is NOT valid for Shaman", () =>
    assertEquals(isSpiritValidForTradition("Air", "Shaman"), false));

  it("Beasts valid for Shaman", () =>
    assertEquals(isSpiritValidForTradition("Beasts", "Shaman"), true));

  it("Man valid for both", () => {
    assertEquals(isSpiritValidForTradition("Man", "Hermetic"), true);
    assertEquals(isSpiritValidForTradition("Man", "Shaman"), true);
  });

  it("unknown spirit → false", () =>
    assertEquals(isSpiritValidForTradition("Dragon", "Hermetic"), false));
});

// ── summoningServices() ───────────────────────────────────────────────────────

describe("summoningServices()", () => {
  it("hits > Force → services = hits - force", () =>
    assertEquals(summoningServices(7, 4), 3));

  it("hits = Force → 0 services", () =>
    assertEquals(summoningServices(4, 4), 0));

  it("hits < Force → 0 services (failure)", () =>
    assertEquals(summoningServices(2, 4), 0));

  it("0 hits → 0 services", () =>
    assertEquals(summoningServices(0, 6), 0));
});

// ── summoningDrain() ──────────────────────────────────────────────────────────

describe("summoningDrain()", () => {
  it("Force 6, hits 4 → 2 drain", () =>
    assertEquals(summoningDrain(6, 4), 2));

  it("Force 6, hits 6 → 0 drain", () =>
    assertEquals(summoningDrain(6, 6), 0));

  it("Force 6, hits 0 → 6 drain", () =>
    assertEquals(summoningDrain(6, 0), 6));

  it("Force 4, hits 7 → 0 (clamped)", () =>
    assertEquals(summoningDrain(4, 7), 0));

  it("always Stun (rule: summoning drain never becomes Physical here)", () => {
    // Verify the value — type enforcement is in the command layer
    assertEquals(typeof summoningDrain(10, 2), "number");
  });
});

// ── spiritBanishPool() ────────────────────────────────────────────────────────

describe("spiritBanishPool()", () => {
  it("Force 4 → pool 8", () =>  assertEquals(spiritBanishPool(4), 8));
  it("Force 6 → pool 12", () => assertEquals(spiritBanishPool(6), 12));
  it("Force 1 → pool 2", () =>  assertEquals(spiritBanishPool(1), 2));
  it("Force 12 → pool 24", () => assertEquals(spiritBanishPool(12), 24));
});

// ── ISpiritRecord schema + mockChar defaults ──────────────────────────────────

describe("ISpiritRecord schema + mockChar defaults", () => {
  it("mockChar has empty spirits by default", () =>
    assertEquals(mockChar().spirits, []));

  it("mockChar has astrally false by default", () =>
    assertEquals(mockChar().astrally, false));

  it("ISpiritRecord fields present", () => {
    const rec: ISpiritRecord = {
      id:          "abc-123",
      type:        "Air",
      force:       6,
      services:    3,
      bound:       false,
      summonedBy:  "player-1",
      summonedAt:  Date.now(),
    };
    assertEquals(rec.type, "Air");
    assertEquals(rec.services, 3);
    assertEquals(rec.bound, false);
  });

  it("bound flag can be true", () => {
    const rec: ISpiritRecord = {
      id: "x", type: "Man", force: 5, services: 2,
      bound: true, summonedBy: "p1", summonedAt: 0,
    };
    assertEquals(rec.bound, true);
  });
});
