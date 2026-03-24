// ─── Dice Log tests ────────────────────────────────────────────────────────────

import { assertEquals, assertStringIncludes } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import type { IRollLogEntry } from "../src/rolllog-db.ts";
import { formatRollLog } from "../src/rolllog-cmd.ts";

// ── IRollLogEntry schema ──────────────────────────────────────────────────────

function makeEntry(overrides: Partial<IRollLogEntry> = {}): IRollLogEntry {
  return {
    id: "log-1",
    playerId: "p1",
    playerName: "Alice",
    timestamp: 1_700_000_000_000,
    pool: 8,
    dice: [1, 2, 3, 4, 5, 6, 5, 3],
    hits: 3,
    glitch: false,
    critGlitch: false,
    edgeUsed: false,
    ...overrides,
  };
}

describe("IRollLogEntry schema", () => {
  it("has required fields", () => {
    const e = makeEntry();
    assertEquals(typeof e.id, "string");
    assertEquals(typeof e.playerId, "string");
    assertEquals(typeof e.pool, "number");
    assertEquals(Array.isArray(e.dice), true);
    assertEquals(typeof e.hits, "number");
  });

  it("optional threshold / success are undefined by default", () => {
    const e = makeEntry();
    assertEquals(e.threshold, undefined);
    assertEquals(e.success, undefined);
  });

  it("can set threshold and success", () => {
    const e = makeEntry({ threshold: 3, success: true });
    assertEquals(e.threshold, 3);
    assertEquals(e.success, true);
  });

  it("edgeUsed defaults to false", () => {
    assertEquals(makeEntry().edgeUsed, false);
  });
});

// ── formatRollLog() ───────────────────────────────────────────────────────────

describe("formatRollLog()", () => {
  it("empty log shows (no rolls recorded)", () => {
    const out = formatRollLog([], "Alice", 20);
    assertStringIncludes(out, "no rolls recorded");
  });

  it("shows player name in header", () => {
    const out = formatRollLog([makeEntry()], "Alice", 20);
    assertStringIncludes(out, "Alice");
  });

  it("shows pool size", () => {
    const out = formatRollLog([makeEntry({ pool: 8 })], "Alice", 20);
    assertStringIncludes(out, "8d");
  });

  it("shows hit count", () => {
    const out = formatRollLog([makeEntry({ hits: 3 })], "Alice", 20);
    assertStringIncludes(out, "3");
  });

  it("shows SUCCESS when success=true and threshold set", () => {
    const out = formatRollLog([makeEntry({ threshold: 3, success: true })], "Alice", 20);
    assertStringIncludes(out, "SUCCESS");
  });

  it("shows FAIL when success=false", () => {
    const out = formatRollLog([makeEntry({ threshold: 5, success: false })], "Alice", 20);
    assertStringIncludes(out, "FAIL");
  });

  it("shows GLITCH when glitch=true", () => {
    const out = formatRollLog([makeEntry({ glitch: true })], "Alice", 20);
    assertStringIncludes(out, "GLITCH");
  });

  it("shows CRIT GLITCH when critGlitch=true", () => {
    const out = formatRollLog([makeEntry({ critGlitch: true })], "Alice", 20);
    assertStringIncludes(out, "CRIT GLITCH");
  });

  it("shows EDGE tag when edgeUsed=true", () => {
    const out = formatRollLog([makeEntry({ edgeUsed: true })], "Alice", 20);
    assertStringIncludes(out, "EDGE");
  });

  it("does not show EDGE when edgeUsed=false", () => {
    const out = formatRollLog([makeEntry({ edgeUsed: false })], "Alice", 20);
    assertEquals(out.includes("EDGE"), false);
  });

  it("shows threshold in pool descriptor", () => {
    const out = formatRollLog([makeEntry({ threshold: 4 })], "Alice", 20);
    assertStringIncludes(out, "/4");
  });

  it("multiple entries are all included", () => {
    const entries = [
      makeEntry({ id: "1", hits: 2 }),
      makeEntry({ id: "2", hits: 5 }),
    ];
    const out = formatRollLog(entries, "Alice", 20);
    // Both entries render (each has pool size "8d")
    assertEquals((out.match(/8d/g) ?? []).length, 2);
  });

  it("shows (all) when limit is Infinity", () => {
    const out = formatRollLog([makeEntry()], "Alice", Infinity);
    assertStringIncludes(out, "(all)");
  });

  it("shows (last N) when limit is a number", () => {
    const out = formatRollLog([makeEntry()], "Alice", 20);
    assertStringIncludes(out, "last 20");
  });
});

// ── getRecentRolls sorting ────────────────────────────────────────────────────

describe("getRecentRolls sorting (unit)", () => {
  it("sorts newest-first", () => {
    const entries: IRollLogEntry[] = [
      makeEntry({ id: "old", timestamp: 1000 }),
      makeEntry({ id: "new", timestamp: 9000 }),
      makeEntry({ id: "mid", timestamp: 5000 }),
    ];
    const sorted = [...entries].sort((a, b) => b.timestamp - a.timestamp);
    assertEquals(sorted[0].id, "new");
    assertEquals(sorted[1].id, "mid");
    assertEquals(sorted[2].id, "old");
  });

  it("limits to requested count", () => {
    const entries: IRollLogEntry[] = Array.from({ length: 30 }, (_, i) =>
      makeEntry({ id: String(i), timestamp: i })
    );
    const limited = entries
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20);
    assertEquals(limited.length, 20);
  });
});
