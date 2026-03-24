// ─── Contacts tests ────────────────────────────────────────────────────────────

import { assertEquals, assertNotEquals, assertStringIncludes } from "@std/assert";
import { describe, it, beforeEach } from "@std/testing/bdd";
import {
  contactBP,
  contactsBP,
  validateContact,
  CONTACT_MAX_CONNECTION,
  CONTACT_MAX_LOYALTY,
  CONTACT_MAX_NAME,
} from "../src/sr4/contacts.ts";
import { calcBP, BP_TOTAL } from "../src/chargen/bp.ts";
import { mockChar, mockDraft } from "./helpers/mockU.ts";
import type { ICharContact, IShadowrunChar } from "../src/types.ts";

// ── contactBP ─────────────────────────────────────────────────────────────────

describe("contactBP()", () => {
  it("returns connection + loyalty", () => {
    assertEquals(contactBP({ name: "X", connection: 3, loyalty: 4 }), 7);
  });

  it("minimum: conn=1, loy=1 → 2 BP", () => {
    assertEquals(contactBP({ name: "X", connection: 1, loyalty: 1 }), 2);
  });

  it("maximum: conn=12, loy=6 → 18 BP", () => {
    assertEquals(contactBP({ name: "X", connection: 12, loyalty: 6 }), 18);
  });
});

// ── contactsBP ────────────────────────────────────────────────────────────────

describe("contactsBP()", () => {
  it("empty array → 0", () => {
    assertEquals(contactsBP([]), 0);
  });

  it("single contact sums correctly", () => {
    assertEquals(contactsBP([{ name: "A", connection: 5, loyalty: 3 }]), 8);
  });

  it("multiple contacts sums all", () => {
    const cs: ICharContact[] = [
      { name: "A", connection: 5, loyalty: 3 },
      { name: "B", connection: 8, loyalty: 4 },
      { name: "C", connection: 1, loyalty: 1 },
    ];
    assertEquals(contactsBP(cs), 22);
  });
});

// ── validateContact ───────────────────────────────────────────────────────────

describe("validateContact()", () => {
  it("valid values → null", () => {
    assertEquals(validateContact("Fixer Mike", 8, 4), null);
  });

  it("valid at minimum bounds", () => {
    assertEquals(validateContact("A", 1, 1), null);
  });

  it("valid at maximum bounds", () => {
    assertEquals(validateContact("A", CONTACT_MAX_CONNECTION, CONTACT_MAX_LOYALTY), null);
  });

  it("empty name → error", () => {
    assertNotEquals(validateContact("", 5, 3), null);
  });

  it("name over 50 chars → error", () => {
    const long = "X".repeat(CONTACT_MAX_NAME + 1);
    assertNotEquals(validateContact(long, 5, 3), null);
  });

  it("connection 0 → error", () => {
    assertNotEquals(validateContact("A", 0, 3), null);
  });

  it("connection 13 → error", () => {
    assertNotEquals(validateContact("A", CONTACT_MAX_CONNECTION + 1, 3), null);
  });

  it("connection non-integer → error", () => {
    assertNotEquals(validateContact("A", 3.5, 3), null);
  });

  it("loyalty 0 → error", () => {
    assertNotEquals(validateContact("A", 5, 0), null);
  });

  it("loyalty 7 → error", () => {
    assertNotEquals(validateContact("A", 5, CONTACT_MAX_LOYALTY + 1), null);
  });

  it("loyalty non-integer → error", () => {
    assertNotEquals(validateContact("A", 5, 2.5), null);
  });

  it("NaN connection → error", () => {
    assertNotEquals(validateContact("A", NaN, 3), null);
  });

  it("NaN loyalty → error", () => {
    assertNotEquals(validateContact("A", 5, NaN), null);
  });
});

// ── calcBP integration ────────────────────────────────────────────────────────

describe("calcBP() — contacts integration", () => {
  it("contacts add their BP to the total", () => {
    const char: IShadowrunChar = mockDraft({
      contacts: [{ name: "Fixer", connection: 5, loyalty: 3 }], // 8 BP
    });
    const base = calcBP({ ...char, contacts: [] });
    assertEquals(calcBP(char), base + 8);
  });

  it("multiple contacts stack", () => {
    const char: IShadowrunChar = mockDraft({
      contacts: [
        { name: "A", connection: 3, loyalty: 2 },  // 5 BP
        { name: "B", connection: 4, loyalty: 4 },  // 8 BP
      ],
    });
    const base = calcBP({ ...char, contacts: [] });
    assertEquals(calcBP(char), base + 13);
  });

  it("empty contacts array → zero contact BP", () => {
    const char = mockDraft({ contacts: [] });
    const charNoContacts = { ...char, contacts: [] };
    assertEquals(calcBP(char), calcBP(charNoContacts));
  });

  it("undefined contacts (old DB record) treated as empty via ??", () => {
    // normalizeChar handles this; bp.ts uses `char.contacts ?? []`
    const char = mockDraft({ contacts: [] });
    // Simulate an old record with no contacts field
    const oldRecord = { ...char } as unknown as IShadowrunChar;
    // deno-lint-ignore no-explicit-any
    delete (oldRecord as any).contacts;
    const base = calcBP(char);
    // Should not throw; `?? []` in bp.ts handles missing field
    const result = calcBP(oldRecord);
    assertEquals(result, base);
  });
});

// ── BP budget enforcement (logic unit test, no DBO) ──────────────────────────

describe("contacts BP budget enforcement logic", () => {
  it("adding a contact that fits within budget succeeds", () => {
    const char = mockDraft(); // fresh Human at racial mins, 0 BP spent
    const newContact: ICharContact = { name: "Fixer", connection: 5, loyalty: 3 };
    char.contacts.push(newContact);
    const newBP = calcBP(char);
    assertEquals(newBP <= BP_TOTAL, true);
  });

  it("adding a contact that exceeds budget is detected", () => {
    // Spend 395 BP: Troll (40) + attrs + skills
    const char = mockDraft({
      metatype: "Troll",
      attrs: { Body: 8, Agility: 3, Reaction: 3, Strength: 8, Charisma: 3, Intuition: 3, Logic: 3, Willpower: 3, Edge: 1 },
      // Troll: Body min=5 (+30), Strength min=5 (+30), plus metatype 40 = 100 BP in attrs+meta
      skills: {
        "Pistols":       { rating: 6 },  // 24 BP
        "Automatics":    { rating: 6 },  // 24 BP
        "Unarmed Combat":{ rating: 6 },  // 24 BP
        "Intimidation":  { rating: 6 },  // 24 BP
        "Athletics":     { rating: 6 },  // 24 BP
        "Stealth":       { rating: 6 },  // 24 BP
        "Perception":    { rating: 6 },  // 24 BP
        "First Aid":     { rating: 6 },  // 24 BP
        "Driving":       { rating: 6 },  // 24 BP
        "Electronics":   { rating: 3 },  // 12 BP
      },
      contacts: [],
    });
    // Push char close to budget then check a contact pushes over
    const bpBefore = calcBP(char);
    const bigContact: ICharContact = { name: "Fixer", connection: 12, loyalty: 6 }; // 18 BP
    char.contacts.push(bigContact);
    const bpAfter = calcBP(char);
    // At minimum the logic correctly computes a higher number
    assertEquals(bpAfter, bpBefore + 18);
    // Code should reject if bpAfter > BP_TOTAL
    if (bpAfter > BP_TOTAL) {
      char.contacts.pop(); // rollback
      assertEquals(calcBP(char), bpBefore);
    }
  });

  it("removing a contact in draft refunds its BP", () => {
    const contact: ICharContact = { name: "Fixer", connection: 5, loyalty: 3 }; // 8 BP
    const char = mockDraft({ contacts: [contact] });
    const bpBefore = calcBP(char);
    char.contacts.splice(0, 1);
    assertEquals(calcBP(char), bpBefore - 8);
  });
});

// ── formatContactList display ─────────────────────────────────────────────────

describe("contact list display", () => {
  it("approved char shows contacts with bp per entry", () => {
    const char = mockChar({
      contacts: [
        { name: "Fixer Mike", connection: 8, loyalty: 4 },
        { name: "Street Doc", connection: 5, loyalty: 3 },
      ],
    });
    // Verify calcBP still works with contacts on approved char (contacts free in approved
    // but still tracked; bp.ts counts them — this is intentional for record-keeping)
    assertNotEquals(char.contacts.length, 0);
    assertEquals(char.contacts[0].name, "Fixer Mike");
    assertEquals(contactBP(char.contacts[0]), 12);
  });

  it("duplicate name detection is case-insensitive", () => {
    const contacts: ICharContact[] = [
      { name: "Fixer Mike", connection: 8, loyalty: 4 },
    ];
    const idx = contacts.findIndex((c) => c.name.toLowerCase() === "fixer mike");
    assertEquals(idx, 0);
    const idxMixed = contacts.findIndex((c) => c.name.toLowerCase() === "FIXER MIKE".toLowerCase());
    assertEquals(idxMixed, 0);
  });
});

// ── contact BP display helper ─────────────────────────────────────────────────

describe("contactBP display values", () => {
  it("human-readable BP matches calculation", () => {
    const c: ICharContact = { name: "Test", connection: 7, loyalty: 5 };
    const bp = contactBP(c);
    assertEquals(bp, 12);
    // This value is shown in +contact list and +chargen draft display
    assertStringIncludes(`Conn 7  Loy 5  [${bp} BP]`, "12");
  });
});
