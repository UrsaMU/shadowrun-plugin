// ─── EXPLOIT TESTS: H1 (IDOR) and H2 (method restriction) ────────────────────
//
// H1 VULNERABILITY: Any authenticated user could read any approved player's
//   character sheet by supplying a different playerId in the URL path.
// H2 VULNERABILITY: routeHandler responded to POST/DELETE/PATCH with character
//   data instead of 405 Method Not Allowed.
//
// FIX (H1): targetId !== userId → 403 (REST is self-only; staff use +sheet).
// FIX (H2): non-GET requests → 405 before any auth or data access.

import { assertEquals } from "@std/assert";
import { describe, it, beforeEach, afterEach } from "@std/testing/bdd";
import { routeHandler } from "../../src/routes.ts";
import { chars } from "../../src/db.ts";
import type { IShadowrunChar } from "../../src/types.ts";

// ── minimal in-memory stub for chars DBO ─────────────────────────────────────
const _store: IShadowrunChar[] = [];

// Monkey-patch the chars DBO methods for tests (no real Deno KV needed).
const _origFind = chars.find.bind(chars);
const _stubFind = async (q: Record<string, string>) => {
  return _store.filter((c) => Object.entries(q).every(([k, v]) => (c as unknown as Record<string, unknown>)[k] === v));
};

function makeChar(playerId: string, state: IShadowrunChar["chargenState"] = "approved"): IShadowrunChar {
  return {
    id: `char-${playerId}`,
    playerId,
    playerName: `Player${playerId}`,
    metatype: "Human",
    attrs: { Body: 3, Agility: 3, Reaction: 3, Strength: 3, Charisma: 3, Intuition: 3, Logic: 3, Willpower: 3, Edge: 2 },
    skills: {},
    qualities: [],
    contacts: [],
    karmaAvailable: 0,
    karmaTotal: 0,
    karmaLog: [],
    firstAidApplied: false,
    gear: [],
    nuyenLog: [],
    armorRating: 0,
    armorImpact: 0,
    recoilComp: 0,
    recoilAccum: 0,
    implants: [],
    essence: 6,
    initDiceBonus: 0,
    spells: [],
    magicLoss: 0,
    astrally: false,
    spirits: [],
    adeptPowers: [],
    nuyen: 5000,
    physicalDmg: 0,
    stunDmg: 0,
    chargenState: state,
    initiationGrade: 0,
    submersionGrade: 0,
    metamagics: [],
    streetCred: 0,
    notoriety: 0,
    publicAwareness: 0,
    lifestyle: "low" as const,
    knowledgeSkills: {},
    languages: {},
  };
}

function req(method: string, path: string): Request {
  return new Request(`http://localhost${path}`, { method });
}

beforeEach(() => {
  _store.length = 0;
  (chars as unknown as Record<string, unknown>).find = _stubFind;
});
afterEach(() => {
  (chars as unknown as Record<string, unknown>).find = _origFind;
});

// ── H2: Method restriction ─────────────────────────────────────────────────────

describe("H2 — HTTP method restriction", () => {
  it("EXPLOIT: POST to char endpoint previously returned data, now returns 405", async () => {
    _store.push(makeChar("1"));
    const res = await routeHandler(req("POST", "/api/v1/shadowrun/char/1"), "1");
    assertEquals(res.status, 405);
  });

  it("DELETE returns 405", async () => {
    _store.push(makeChar("1"));
    const res = await routeHandler(req("DELETE", "/api/v1/shadowrun/char/1"), "1");
    assertEquals(res.status, 405);
  });

  it("PATCH returns 405", async () => {
    const res = await routeHandler(req("PATCH", "/api/v1/shadowrun/char/1"), "1");
    assertEquals(res.status, 405);
  });

  it("PUT returns 405", async () => {
    const res = await routeHandler(req("PUT", "/api/v1/shadowrun/char/1"), "1");
    assertEquals(res.status, 405);
  });

  it("GET still works for authenticated owner", async () => {
    _store.push(makeChar("42"));
    const res = await routeHandler(req("GET", "/api/v1/shadowrun/char/42"), "42");
    assertEquals(res.status, 200);
    const body = await res.json();
    assertEquals(body.data.playerId, "42");
  });
});

// ── H1: IDOR prevention ───────────────────────────────────────────────────────

describe("H1 — IDOR: own-character-only enforcement", () => {
  it("EXPLOIT: user 2 previously could read user 1's approved sheet, now gets 403", async () => {
    _store.push(makeChar("1", "approved")); // victim: player 1
    const res = await routeHandler(req("GET", "/api/v1/shadowrun/char/1"), "2"); // attacker: userId=2
    assertEquals(res.status, 403, "Cross-player read must be forbidden");
  });

  it("user can read their own approved sheet", async () => {
    _store.push(makeChar("5", "approved"));
    const res = await routeHandler(req("GET", "/api/v1/shadowrun/char/5"), "5");
    assertEquals(res.status, 200);
  });

  it("user can read their own draft sheet", async () => {
    _store.push(makeChar("5", "draft"));
    const res = await routeHandler(req("GET", "/api/v1/shadowrun/char/5"), "5");
    assertEquals(res.status, 200);
  });

  it("no path segment → defaults to own userId, returns own char", async () => {
    _store.push(makeChar("7", "approved"));
    const res = await routeHandler(req("GET", "/api/v1/shadowrun"), "7");
    assertEquals(res.status, 200);
    const body = await res.json();
    assertEquals(body.data.playerId, "7");
  });

  it("unauthenticated request returns 401 regardless of method", async () => {
    const res = await routeHandler(req("GET", "/api/v1/shadowrun/char/1"), null);
    assertEquals(res.status, 401);
  });

  it("404 when own char does not exist", async () => {
    const res = await routeHandler(req("GET", "/api/v1/shadowrun/char/99"), "99");
    assertEquals(res.status, 404);
  });
});
