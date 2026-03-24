// ─── Toxin & Drug pure function tests (SR4A pp. 256–264) ──────────────────────

import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  toxinDamage,
  toxinResistPool,
  drugCrashDv,
  addictionTestPass,
  TOXIN_CATALOGUE,
  DRUG_CATALOGUE,
  lookupToxin,
  lookupDrug,
} from "../src/sr4/toxins.ts";

// ── toxinDamage() ─────────────────────────────────────────────────────────────

describe("toxinDamage()", () => {
  it("power 9, 0 hits → 9 damage",   () => assertEquals(toxinDamage(9, 0), 9));
  it("power 9, 5 hits → 4 damage",   () => assertEquals(toxinDamage(9, 5), 4));
  it("power 9, 9 hits → 0 damage",   () => assertEquals(toxinDamage(9, 9), 0));
  it("power 9, 12 hits → 0 (min 0)", () => assertEquals(toxinDamage(9, 12), 0));
  it("power 0, any hits → 0",        () => assertEquals(toxinDamage(0, 0), 0));
});

// ── toxinResistPool() ─────────────────────────────────────────────────────────

describe("toxinResistPool()", () => {
  it("Body attr → returns body",       () => assertEquals(toxinResistPool("Body",     4, 3), 4));
  it("Willpower attr → returns will",  () => assertEquals(toxinResistPool("Willpower", 4, 3), 3));
  it("Body 6, Will 2 → 6 for Body",   () => assertEquals(toxinResistPool("Body",     6, 2), 6));
});

// ── drugCrashDv() ─────────────────────────────────────────────────────────────

describe("drugCrashDv()", () => {
  it("addiction rating 4 → crash DV 4", () => assertEquals(drugCrashDv(4), 4));
  it("addiction rating 2 → crash DV 2", () => assertEquals(drugCrashDv(2), 2));
  it("addiction rating 0 → crash DV 0", () => assertEquals(drugCrashDv(0), 0));
});

// ── addictionTestPass() ───────────────────────────────────────────────────────

describe("addictionTestPass()", () => {
  it("hits ≥ threshold → pass",  () => assertEquals(addictionTestPass(4, 3, 3, 4), true));
  it("hits < threshold → fail",  () => assertEquals(addictionTestPass(4, 3, 3, 2), false));
  it("hits = threshold → pass",  () => assertEquals(addictionTestPass(4, 3, 3, 3), true));
});

// ── TOXIN_CATALOGUE ───────────────────────────────────────────────────────────

describe("TOXIN_CATALOGUE", () => {
  it("has at least 4 entries", () => assertEquals(TOXIN_CATALOGUE.length >= 4, true));

  it("no duplicate names", () => {
    const names = TOXIN_CATALOGUE.map((t) => t.name.toLowerCase());
    assertEquals(new Set(names).size, names.length);
  });

  it("all have valid vectors", () => {
    const valid = ["contact", "inhalation", "ingestion", "injection"];
    for (const t of TOXIN_CATALOGUE) {
      assertEquals(valid.includes(t.vector), true, `${t.name} has invalid vector`);
    }
  });

  it("all have valid resistance attributes", () => {
    const valid = ["Body", "Willpower"];
    for (const t of TOXIN_CATALOGUE) {
      assertEquals(valid.includes(t.resistAttr), true, `${t.name} bad resistAttr`);
    }
  });

  it("all have non-empty descriptions", () => {
    for (const t of TOXIN_CATALOGUE) {
      assertEquals(t.description.length > 0, true, `${t.name} has no description`);
    }
  });

  it("contains Narcoject",     () => assertEquals(lookupToxin("Narcoject")?.name, "Narcoject"));
  it("contains Pepper Punch",  () => assertEquals(lookupToxin("Pepper Punch")?.name, "Pepper Punch"));
});

// ── DRUG_CATALOGUE ────────────────────────────────────────────────────────────

describe("DRUG_CATALOGUE", () => {
  it("has at least 3 entries", () => assertEquals(DRUG_CATALOGUE.length >= 3, true));

  it("all have positive duration", () => {
    for (const d of DRUG_CATALOGUE) {
      assertEquals(d.duration > 0, true, `${d.name} has zero duration`);
    }
  });

  it("all have valid addiction values", () => {
    for (const d of DRUG_CATALOGUE) {
      assertEquals(d.addictionThreshold >= 1, true, `${d.name} bad addiction threshold`);
      assertEquals(d.addictionRating >= 1,    true, `${d.name} bad addiction rating`);
    }
  });

  it("contains Kamikaze",  () => assertEquals(lookupDrug("Kamikaze")?.name, "Kamikaze"));
  it("contains Jazz",      () => assertEquals(lookupDrug("Jazz")?.name, "Jazz"));
  it("Kamikaze has Body bonus", () => {
    const k = lookupDrug("Kamikaze");
    assertEquals((k?.bonus["Body"] ?? 0) > 0, true);
  });
});

// ── lookupToxin() / lookupDrug() ──────────────────────────────────────────────

describe("lookupToxin()", () => {
  it("case-insensitive",        () => assertEquals(lookupToxin("narcoject")?.name, "Narcoject"));
  it("unknown returns null",    () => assertEquals(lookupToxin("VoidToxin"), null));
});

describe("lookupDrug()", () => {
  it("case-insensitive",        () => assertEquals(lookupDrug("kamikaze")?.name, "Kamikaze"));
  it("unknown returns null",    () => assertEquals(lookupDrug("MegaDrug"), null));
});
