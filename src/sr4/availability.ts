// ─── Availability & acquisition rules (SR4A pp. 314–315) ─────────────────────

/**
 * Availability rating tiers.
 * SR4A p. 314: items above 8 are restricted, above 12 are forbidden.
 */
export type AvailabilityTier = "standard" | "restricted" | "forbidden";

/**
 * Determine availability tier from numeric rating.
 * ≤8 → standard; 9–12 → restricted; ≥13 → forbidden.
 */
export function availabilityTier(rating: number): AvailabilityTier {
  if (rating <= 8) return "standard";
  if (rating <= 12) return "restricted";
  return "forbidden";
}

/**
 * Acquisition test threshold: ceil(availability / 2).
 * SR4A p. 314.
 */
export function acquisitionThreshold(availabilityRating: number): number {
  return Math.ceil(availabilityRating / 2);
}

/**
 * Acquisition dice pool: Negotiation + Charisma.
 * SR4A p. 314.
 */
export function acquisitionPool(negotiation: number, charisma: number, contactBonus: number): number {
  return negotiation + charisma + contactBonus;
}

/**
 * Fencing value: stolen goods sell at reduced price.
 * SR4A p. 315: fence offers 20–40% of street price.
 * Use 30% as default middle estimate.
 */
export function fencingValue(streetPrice: number, percentage = 0.3): number {
  return Math.floor(streetPrice * percentage);
}

/**
 * Validate an availability rating (1–24).
 * Returns null if valid, error string if not.
 */
export function validateAvailability(rating: number): string | null {
  if (!Number.isInteger(rating) || rating < 1 || rating > 24) {
    return "Availability rating must be an integer from 1 to 24.";
  }
  return null;
}
