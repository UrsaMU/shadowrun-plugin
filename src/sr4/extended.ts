// ─── Extended & Teamwork test rules (SR4A pp. 62–65) ─────────────────────────

/**
 * Extended test: accumulate hits across multiple rolls until threshold is met.
 * Each roll reduces the pool by one die (SR4A p. 63 — optional; we track a
 * simpler model: pool stays constant, hits accumulate, staff sets max rolls).
 *
 * Returns the accumulated hit total after adding this roll's hits.
 */
export function accumulateHits(current: number, newHits: number): number {
  return current + newHits;
}

/**
 * Check if an extended test is complete.
 * SR4A p. 63: success when accumulated hits ≥ threshold.
 */
export function extendedTestComplete(accumulated: number, threshold: number): boolean {
  return accumulated >= threshold;
}

/**
 * Teamwork test: one primary actor and up to maxTeam assistants.
 * Each assistant (with relevant skill ≥ 1) contributes dice to the primary's pool.
 * SR4A p. 64: assistants add dice equal to their hits to the primary's pool.
 *
 * This function computes the effective pool for the primary actor:
 *   primaryPool + sum(assistantHits) — capped at twice the primary's pool.
 */
export function teamworkPool(primaryPool: number, assistantHits: number[]): number {
  const bonus = assistantHits.reduce((sum, h) => sum + h, 0);
  const cap   = primaryPool * 2;
  return Math.min(primaryPool + bonus, cap);
}

/**
 * Maximum number of assistants allowed on a teamwork test.
 * SR4A p. 64: up to (attribute or skill rating) assistants, minimum 1.
 */
export function maxAssistants(relevantRating: number): number {
  return Math.max(1, relevantRating);
}

/** M1 FIX: Maximum dice pool size — prevents computational DoS via +extend 99999/1. */
export const MAX_POOL = 30;

/**
 * Validate a dice pool size (1–MAX_POOL, integer only).
 * M1 FIX: Caps pool at MAX_POOL to prevent DoS attempts.
 * Returns an error string on failure, or null on success.
 */
export function validatePoolSize(pool: number): string | null {
  if (!Number.isInteger(pool) || pool < 1) return "Pool must be a positive integer.";
  if (pool > MAX_POOL) return `Pool cannot exceed ${MAX_POOL}.`;
  return null;
}

/**
 * Validate an extended test threshold (1–50).
 */
export function validateExtendedThreshold(threshold: number): string | null {
  if (!Number.isInteger(threshold) || threshold < 1 || threshold > 50) {
    return "Threshold must be an integer from 1 to 50.";
  }
  return null;
}

/**
 * Validate an accumulated hit total for display.
 */
export function validateAccumulated(hits: number): string | null {
  if (!Number.isInteger(hits) || hits < 0) {
    return "Accumulated hits must be a non-negative integer.";
  }
  return null;
}
