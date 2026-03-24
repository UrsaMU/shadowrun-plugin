// ─── SR4 dice mechanics — comprehensive tests ────────────────────────────────

import { assertEquals, assert, assertFalse } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { rollPool, rollEdge, summarize, physBoxes, stunBoxes } from "../src/sr4/dice.ts";

// ── Deterministic RNG helpers ─────────────────────────────────────────────────

/** Returns a fixed sequence of values (modulo 1) via Math.random replacement. */
function fixedRng(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length];
}

/** RNG that always returns the same face value. */
function always(face: number): () => number {
  // Math.ceil(rng() * 6) === face  →  rng() must be in ((face-1)/6, face/6]
  const v = face / 6;
  return () => v;
}

// ── summarize() ───────────────────────────────────────────────────────────────

describe("summarize()", () => {
  it("counts hits (5s and 6s)", () => {
    const r = summarize([1, 2, 3, 4, 5, 6]);
    assertEquals(r.hits, 2);
  });

  it("counts ones", () => {
    const r = summarize([1, 1, 2, 3, 5, 6]);
    assertEquals(r.ones, 2);
  });

  it("glitch when exactly half dice are ones (even pool)", () => {
    // pool 6: ceil(6/2) = 3 ones needed
    const r = summarize([1, 1, 1, 4, 5, 6]);
    assert(r.glitch, "should be a glitch");
    assertFalse(r.critGlitch, "has hits so not critical");
  });

  it("glitch when exactly half dice are ones (odd pool)", () => {
    // pool 5: ceil(5/2) = 3 ones needed
    const r = summarize([1, 1, 1, 4, 5]);
    assert(r.glitch);
    assertFalse(r.critGlitch);
  });

  it("no glitch when fewer than half dice are ones", () => {
    // pool 6: need 3 ones; only 2 here
    const r = summarize([1, 1, 2, 3, 5, 6]);
    assertFalse(r.glitch);
  });

  it("critical glitch when glitch AND zero hits", () => {
    const r = summarize([1, 1, 1, 2, 3, 4]);
    assert(r.glitch);
    assert(r.critGlitch);
    assertEquals(r.hits, 0);
  });

  it("all ones is a critical glitch", () => {
    const r = summarize([1, 1, 1, 1]);
    assert(r.critGlitch);
  });

  it("all sixes — no glitch, all hits", () => {
    const r = summarize([6, 6, 6, 6]);
    assertEquals(r.hits, 4);
    assertFalse(r.glitch);
  });

  it("empty dice array — no hits, no glitch", () => {
    const r = summarize([]);
    assertEquals(r.hits, 0);
    assertFalse(r.glitch);
    assertFalse(r.critGlitch);
  });

  it("single die — 1 one triggers glitch (ceil(1/2)=1)", () => {
    const r = summarize([1]);
    assert(r.glitch);
    assert(r.critGlitch);
  });

  it("single die — 5 is a hit, no glitch", () => {
    const r = summarize([5]);
    assertEquals(r.hits, 1);
    assertFalse(r.glitch);
  });
});

// ── rollPool() ────────────────────────────────────────────────────────────────

describe("rollPool()", () => {
  it("clamps pool to minimum 1", () => {
    const r = rollPool(0, always(3));
    assertEquals(r.dice.length, 1);
  });

  it("clamps negative pool to minimum 1", () => {
    const r = rollPool(-5, always(3));
    assertEquals(r.dice.length, 1);
  });

  it("rolls the requested number of dice", () => {
    const r = rollPool(8, always(3));
    assertEquals(r.dice.length, 8);
  });

  it("all dice hit when rng always returns 5", () => {
    const r = rollPool(6, always(5));
    assertEquals(r.hits, 6);
    assertFalse(r.glitch);
  });

  it("all dice are 1s — critical glitch", () => {
    const r = rollPool(4, always(1));
    assertEquals(r.hits, 0);
    assert(r.critGlitch);
  });

  it("uses the injected rng", () => {
    // sequence: 1,2,3,4,5,6 → 2 hits (5 and 6)
    const r = rollPool(6, fixedRng([1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6, 6 / 6]));
    assertEquals(r.hits, 2);
  });

  it("floors fractional pool", () => {
    const r = rollPool(3.9, always(6));
    assertEquals(r.dice.length, 3);
  });
});

// ── rollEdge() ────────────────────────────────────────────────────────────────

describe("rollEdge()", () => {
  it("total hits = initial hits + reroll hits", () => {
    // Initial: [1,2,3,4,5,6] → 2 hits; non-hits = 4; reroll: [5,5,5,5] → 4 more
    let call = 0;
    const rng = () => {
      call++;
      // First 6 calls: 1/6, 2/6, 3/6, 4/6, 5/6, 6/6
      if (call <= 6) return call / 6;
      return 5 / 6; // remaining reroll dice all hit
    };
    const r = rollEdge(6, rng);
    assertEquals(r.initial.hits, 2);
    assertEquals(r.reroll.dice.length, 4); // 4 non-hits rerolled
    assertEquals(r.totalHits, r.initial.hits + r.reroll.hits);
  });

  it("if all dice hit initially, reroll pool is 0 → reroll has 1 die (min clamp)", () => {
    const r = rollEdge(4, always(6));
    assertEquals(r.initial.hits, 4);
    // 0 non-hits, but rollPool clamps to 1
    assertEquals(r.reroll.dice.length, 1);
  });

  it("reroll is independent — non-hits from initial do not infect reroll glitch", () => {
    // Initial: all 1s (4 dice, glitch+crit); reroll of 4 dice all hit
    let call = 0;
    const rng = () => {
      call++;
      return call <= 4 ? 1 / 6 : 6 / 6;
    };
    const r = rollEdge(4, rng);
    assert(r.initial.critGlitch, "initial should be crit glitch");
    assertEquals(r.reroll.hits, 4);
    assertEquals(r.totalHits, 4);
  });
});

// ── physBoxes() and stunBoxes() ───────────────────────────────────────────────

describe("physBoxes()", () => {
  it("Body 1 → 9 boxes", () => assertEquals(physBoxes(1), 9));
  it("Body 2 → 9 boxes", () => assertEquals(physBoxes(2), 9));
  it("Body 3 → 10 boxes", () => assertEquals(physBoxes(3), 10));
  it("Body 4 → 10 boxes", () => assertEquals(physBoxes(4), 10));
  it("Body 6 → 11 boxes", () => assertEquals(physBoxes(6), 11));
  it("Body 10 → 13 boxes", () => assertEquals(physBoxes(10), 13));
  it("clamps Body 0 to 1 → 9 boxes", () => assertEquals(physBoxes(0), 9));
});

describe("stunBoxes()", () => {
  it("Willpower 1 → 9 boxes", () => assertEquals(stunBoxes(1), 9));
  it("Willpower 3 → 10 boxes", () => assertEquals(stunBoxes(3), 10));
  it("Willpower 6 → 11 boxes", () => assertEquals(stunBoxes(6), 11));
  it("clamps Willpower 0 to 1 → 9 boxes", () => assertEquals(stunBoxes(0), 9));
});
