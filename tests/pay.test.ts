// ─── Nuyen / pay tests ─────────────────────────────────────────────────────────

import { assertEquals, assertNotEquals, assertStringIncludes } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { validateTransfer, MAX_TRANSFER } from "../src/sr4/nuyen.ts";
import type { INuyenLogEntry } from "../src/types.ts";

// ── validateTransfer() ────────────────────────────────────────────────────────

describe("validateTransfer()", () => {
  it("valid transfer → null", () => assertEquals(validateTransfer(10_000, 500), null));
  it("transfer exact balance → null", () => assertEquals(validateTransfer(500, 500), null));
  it("amount = 0 → error", () => assertNotEquals(validateTransfer(1000, 0), null));
  it("amount negative → error", () => assertNotEquals(validateTransfer(1000, -100), null));
  it("amount float → error", () => assertNotEquals(validateTransfer(1000, 1.5), null));
  it("amount > balance → error", () => assertNotEquals(validateTransfer(100, 200), null));
  it("amount = 0 balance → error", () => assertNotEquals(validateTransfer(0, 1), null));
  it("amount > MAX_TRANSFER → error", () => assertNotEquals(validateTransfer(MAX_TRANSFER + 1, MAX_TRANSFER + 1), null));
  it("amount = MAX_TRANSFER, sufficient balance → null", () => assertEquals(validateTransfer(MAX_TRANSFER, MAX_TRANSFER), null));
  it("MAX_TRANSFER is 10_000_000", () => assertEquals(MAX_TRANSFER, 10_000_000));
  it("error mentions insufficient funds when over balance", () => {
    const err = validateTransfer(50, 100);
    assertStringIncludes(err ?? "", "50");
  });
});

// ── INuyenLogEntry schema ─────────────────────────────────────────────────────

describe("INuyenLogEntry schema", () => {
  it("required fields", () => {
    const entry: INuyenLogEntry = { timestamp: Date.now(), delta: -500 };
    assertEquals(typeof entry.timestamp, "number");
    assertEquals(entry.delta, -500);
    assertEquals(entry.counterparty, undefined);
    assertEquals(entry.reason, undefined);
  });

  it("full entry with optional fields", () => {
    const entry: INuyenLogEntry = {
      timestamp: 1000,
      delta: 1000,
      counterparty: "Fixer Mike",
      reason: "Gear split",
    };
    assertEquals(entry.counterparty, "Fixer Mike");
    assertEquals(entry.reason, "Gear split");
  });

  it("negative delta = sent nuyen", () => {
    const entry: INuyenLogEntry = { timestamp: 0, delta: -200 };
    assertEquals(entry.delta < 0, true);
  });

  it("positive delta = received nuyen", () => {
    const entry: INuyenLogEntry = { timestamp: 0, delta: 1000 };
    assertEquals(entry.delta > 0, true);
  });
});

// ── log sorting logic ─────────────────────────────────────────────────────────

describe("nuyen log sorting", () => {
  it("sorts newest-first", () => {
    const log: INuyenLogEntry[] = [
      { timestamp: 1000, delta: 100 },
      { timestamp: 3000, delta: 200 },
      { timestamp: 2000, delta: 300 },
    ];
    const sorted = [...log].sort((a, b) => b.timestamp - a.timestamp);
    assertEquals(sorted[0].delta, 200);
    assertEquals(sorted[1].delta, 300);
    assertEquals(sorted[2].delta, 100);
  });
});

// ── mockChar nuyenLog defaults ────────────────────────────────────────────────

describe("mockChar nuyenLog defaults", () => {
  it("nuyenLog defaults to empty array", async () => {
    const { mockChar } = await import("./helpers/mockU.ts");
    const char = mockChar();
    assertEquals(char.nuyenLog, []);
  });

  it("nuyenLog can be overridden", async () => {
    const { mockChar } = await import("./helpers/mockU.ts");
    const entry: INuyenLogEntry = { timestamp: 0, delta: 500, counterparty: "Bob" };
    const char = mockChar({ nuyenLog: [entry] });
    assertEquals(char.nuyenLog.length, 1);
    assertEquals(char.nuyenLog[0].counterparty, "Bob");
  });
});

// ── transfer mutation logic ───────────────────────────────────────────────────

describe("transfer mutation logic", () => {
  it("sender nuyen decreases by amount", async () => {
    const { mockChar } = await import("./helpers/mockU.ts");
    const sender = mockChar({ nuyen: 1000 });
    const amount = 300;
    sender.nuyen -= amount;
    assertEquals(sender.nuyen, 700);
  });

  it("recipient nuyen increases by amount", async () => {
    const { mockChar } = await import("./helpers/mockU.ts");
    const recipient = mockChar({ nuyen: 500 });
    const amount = 300;
    recipient.nuyen += amount;
    assertEquals(recipient.nuyen, 800);
  });

  it("log entry pushed to both parties", async () => {
    const { mockChar } = await import("./helpers/mockU.ts");
    const sender    = mockChar({ nuyen: 1000 });
    const recipient = mockChar({ nuyen: 0 });
    const amount    = 400;
    const now       = Date.now();

    sender.nuyen    -= amount;
    recipient.nuyen += amount;

    const sentEntry: INuyenLogEntry = { timestamp: now, delta: -amount, counterparty: "Bob" };
    const recvEntry: INuyenLogEntry = { timestamp: now, delta:  amount, counterparty: "Alice" };
    sender.nuyenLog.push(sentEntry);
    recipient.nuyenLog.push(recvEntry);

    assertEquals(sender.nuyenLog.length, 1);
    assertEquals(sender.nuyenLog[0].delta, -400);
    assertEquals(recipient.nuyenLog.length, 1);
    assertEquals(recipient.nuyenLog[0].delta, 400);
  });
});
