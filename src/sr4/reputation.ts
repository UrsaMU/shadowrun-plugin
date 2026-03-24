// ─── Reputation & Lifestyle rules (SR4A pp. 276–278) ──────────────────────────

// ── Lifestyle ─────────────────────────────────────────────────────────────────

export type LifestyleTier = "street" | "squatter" | "low" | "middle" | "high" | "luxury";

export const LIFESTYLE_COSTS: Record<LifestyleTier, number> = {
  street:   40,
  squatter: 100,
  low:      500,
  middle:   2_000,
  high:     5_000,
  luxury:   10_000,
};

export const LIFESTYLE_TIERS: LifestyleTier[] = [
  "street", "squatter", "low", "middle", "high", "luxury",
];

/**
 * Monthly nuyen cost for a given lifestyle tier.
 * SR4A p. 278.
 */
export function lifestyleCost(tier: LifestyleTier): number {
  return LIFESTYLE_COSTS[tier];
}

/**
 * Validate a lifestyle tier string.
 * Returns null if valid, error message if invalid.
 */
export function validateLifestyle(tier: string): string | null {
  if (LIFESTYLE_TIERS.includes(tier as LifestyleTier)) return null;
  return `Invalid lifestyle. Choose: ${LIFESTYLE_TIERS.join(", ")}.`;
}

// ── Reputation ────────────────────────────────────────────────────────────────

/**
 * Maximum Street Cred a character can accumulate.
 * No hard cap in RAW — set a practical ceiling here.
 */
export const MAX_REP = 99;

/**
 * Clamp a reputation value into the valid range [0, MAX_REP].
 */
export function clampRep(value: number): number {
  return Math.max(0, Math.min(MAX_REP, Math.round(value)));
}
