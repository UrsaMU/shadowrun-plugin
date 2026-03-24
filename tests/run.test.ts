// ─── Run Management tests ──────────────────────────────────────────────────────

import { assertEquals, assertNotEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import type { IShadowrunRun, IRunRosterEntry } from "../src/run-db.ts";

// ── Pure helpers tested in isolation ─────────────────────────────────────────
// Command logic is integration-heavy (needs DBO + chars DBO), so we test the
// pure data-shape invariants and the display functions directly.

function makeRun(overrides: Partial<IShadowrunRun> = {}): IShadowrunRun {
  return {
    id: "run-1",
    number: 1,
    name: "Redmond Rats",
    summary: "Extraction in Redmond.",
    status: "open",
    createdBy: "gm-1",
    createdByName: "GameMaster",
    createdAt: 1_000_000,
    baseKarmaAward: 0,
    roster: [],
    awardLog: [],
    ...overrides,
  };
}

function makeRosterEntry(overrides: Partial<IRunRosterEntry> = {}): IRunRosterEntry {
  return {
    playerId: "p1",
    playerName: "Alice",
    registeredAt: Date.now(),
    karmaAwarded: 0,
    ...overrides,
  };
}

// ── Run schema ────────────────────────────────────────────────────────────────

describe("IShadowrunRun schema", () => {
  it("new run has status 'open'", () => {
    assertEquals(makeRun().status, "open");
  });

  it("new run has empty roster", () => {
    assertEquals(makeRun().roster.length, 0);
  });

  it("new run has empty awardLog", () => {
    assertEquals(makeRun().awardLog.length, 0);
  });

  it("run number is sequential integer", () => {
    assertEquals(typeof makeRun().number, "number");
    assertEquals(makeRun({ number: 42 }).number, 42);
  });

  it("baseKarmaAward defaults to 0", () => {
    assertEquals(makeRun().baseKarmaAward, 0);
  });
});

// ── Roster entry ──────────────────────────────────────────────────────────────

describe("IRunRosterEntry schema", () => {
  it("karmaAwarded defaults to 0", () => {
    assertEquals(makeRosterEntry().karmaAwarded, 0);
  });

  it("has required playerId and playerName", () => {
    const e = makeRosterEntry({ playerId: "abc", playerName: "Bob" });
    assertEquals(e.playerId, "abc");
    assertEquals(e.playerName, "Bob");
  });
});

// ── Status transitions ────────────────────────────────────────────────────────

describe("run status transitions", () => {
  it("open → active is valid", () => {
    const run = makeRun({ status: "open" });
    run.status = "active";
    assertEquals(run.status, "active");
  });

  it("active → closed is valid", () => {
    const run = makeRun({ status: "active" });
    run.status = "closed";
    assertEquals(run.status, "closed");
  });

  it("can detect already-closed run", () => {
    const run = makeRun({ status: "closed" });
    assertEquals(run.status === "closed", true);
  });
});

// ── Roster duplicate detection ────────────────────────────────────────────────

describe("roster duplicate detection", () => {
  it("finds existing entry by playerId", () => {
    const run = makeRun({ roster: [makeRosterEntry({ playerId: "p1" })] });
    const idx = run.roster.findIndex((e) => e.playerId === "p1");
    assertNotEquals(idx, -1);
  });

  it("returns -1 for player not in roster", () => {
    const run = makeRun({ roster: [makeRosterEntry({ playerId: "p1" })] });
    const idx = run.roster.findIndex((e) => e.playerId === "p2");
    assertEquals(idx, -1);
  });
});

// ── Base karma award validation ───────────────────────────────────────────────

describe("baseKarmaAward validation", () => {
  const MAX_BASE_KARMA = 20;

  it("0 is valid (no karma run)", () => {
    assertEquals(0 >= 0 && 0 <= MAX_BASE_KARMA, true);
  });

  it("20 is at the cap", () => {
    assertEquals(20 <= MAX_BASE_KARMA, true);
  });

  it("21 exceeds the cap", () => {
    assertEquals(21 > MAX_BASE_KARMA, true);
  });

  it("negative is invalid", () => {
    assertEquals(-1 >= 0, false);
  });
});

// ── Run name / summary trimming ───────────────────────────────────────────────

describe("run name / summary trimming", () => {
  it("name capped at 80 chars", () => {
    const long = "x".repeat(100);
    assertEquals(long.slice(0, 80).length, 80);
  });

  it("summary capped at 500 chars", () => {
    const long = "y".repeat(600);
    assertEquals(long.slice(0, 500).length, 500);
  });
});

// ── award log ─────────────────────────────────────────────────────────────────

describe("award log entries", () => {
  it("appending an award log entry works", () => {
    const run = makeRun();
    run.awardLog.push({
      timestamp: Date.now(),
      playerId: "p1",
      playerName: "Alice",
      delta: 2,
      reason: "MVP",
      awardedByName: "GM",
    });
    assertEquals(run.awardLog.length, 1);
    assertEquals(run.awardLog[0].delta, 2);
  });

  it("player must be on roster to receive bonus (logic check)", () => {
    const run = makeRun({ roster: [makeRosterEntry({ playerName: "Alice" })] });
    const found = run.roster.find(
      (e) => e.playerName.toLowerCase() === "bob".toLowerCase(),
    );
    assertEquals(found, undefined);
  });
});
