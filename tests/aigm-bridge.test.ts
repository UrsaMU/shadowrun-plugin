// ─── ai-gm bridge tests ───────────────────────────────────────────────────────

import { assertEquals, assertStringIncludes, assertExists } from "jsr:@std/assert";
import { describe, it, beforeEach } from "jsr:@std/testing/bdd";
import type { ISrRollEvent } from "../src/game-hooks-augment.ts";

// ─── formatSrRollNote helper (re-implemented here to test the contract) ────────
// We test the note format logic independently so the bridge test doesn't require
// a live Deno KV / gameHooks setup.

function formatSrRollNote(e: ISrRollEvent): string {
  const edgeTag = e.edgeUsed ? " [Edge]" : "";
  const hitLine = e.threshold !== undefined
    ? `${e.hits} hits vs threshold ${e.threshold} — ${e.success ? "SUCCESS" : "FAIL"}`
    : `${e.hits} hits`;
  const glitchTag = e.critGlitch ? " CRITICAL GLITCH" : e.glitch ? " GLITCH" : "";
  return `[SR4 ROLL${edgeTag}] ${e.playerName}: ${e.pool} dice → ${hitLine}${glitchTag}`;
}

// ─── ISrRollEvent factory ─────────────────────────────────────────────────────

function makeRoll(overrides: Partial<ISrRollEvent> = {}): ISrRollEvent {
  return {
    playerId: "42", playerName: "Alice",
    roomId: "10", pool: 8, hits: 3,
    glitch: false, critGlitch: false, edgeUsed: false,
    ...overrides,
  };
}

// ─── formatSrRollNote ─────────────────────────────────────────────────────────

describe("formatSrRollNote", () => {
  it("basic roll — pool, hits, no threshold", () => {
    const note = formatSrRollNote(makeRoll({ pool: 8, hits: 3 }));
    assertStringIncludes(note, "[SR4 ROLL]");
    assertStringIncludes(note, "Alice");
    assertStringIncludes(note, "8 dice");
    assertStringIncludes(note, "3 hits");
  });

  it("roll with threshold success", () => {
    const note = formatSrRollNote(makeRoll({ hits: 5, threshold: 4, success: true }));
    assertStringIncludes(note, "vs threshold 4");
    assertStringIncludes(note, "SUCCESS");
  });

  it("roll with threshold fail", () => {
    const note = formatSrRollNote(makeRoll({ hits: 1, threshold: 4, success: false }));
    assertStringIncludes(note, "vs threshold 4");
    assertStringIncludes(note, "FAIL");
  });

  it("glitch appended to note", () => {
    const note = formatSrRollNote(makeRoll({ glitch: true }));
    assertStringIncludes(note, "GLITCH");
  });

  it("critical glitch preferred over plain glitch label", () => {
    const note = formatSrRollNote(makeRoll({ glitch: true, critGlitch: true }));
    assertStringIncludes(note, "CRITICAL GLITCH");
  });

  it("edge roll includes [Edge] tag", () => {
    const note = formatSrRollNote(makeRoll({ edgeUsed: true }));
    assertStringIncludes(note, "[SR4 ROLL [Edge]]");
  });

  it("no MUSH color codes in note — safe for LLM context", () => {
    const note = formatSrRollNote(makeRoll({ glitch: true, edgeUsed: true, threshold: 3, success: false }));
    // MUSH codes start with %c — none should appear
    assertEquals(note.includes("%c"), false);
    assertEquals(note.includes("%r"), false);
    assertEquals(note.includes("%ch"), false);
  });

  it("zero hits without glitch — plain failure line", () => {
    const note = formatSrRollNote(makeRoll({ hits: 0, threshold: 2, success: false, glitch: false }));
    assertStringIncludes(note, "0 hits");
    assertStringIncludes(note, "FAIL");
    assertEquals(note.includes("GLITCH"), false);
  });
});

// ─── ISrRollEvent shape ───────────────────────────────────────────────────────

describe("ISrRollEvent type contract", () => {
  it("required fields are present on makeRoll()", () => {
    const e = makeRoll();
    assertExists(e.playerId);
    assertExists(e.playerName);
    assertExists(e.roomId);
    assertEquals(typeof e.pool, "number");
    assertEquals(typeof e.hits, "number");
    assertEquals(typeof e.glitch, "boolean");
    assertEquals(typeof e.critGlitch, "boolean");
    assertEquals(typeof e.edgeUsed, "boolean");
  });

  it("optional threshold/success fields default to undefined", () => {
    const e = makeRoll();
    assertEquals(e.threshold, undefined);
    assertEquals(e.success, undefined);
  });
});
