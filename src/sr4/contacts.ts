// ─── SR4 contact validation and BP math (pure, no side effects) ───────────────

import type { ICharContact } from "../types.ts";
import { isPrototypePoisonKey } from "./validation.ts";

export const CONTACT_MAX_NAME       = 50;
export const CONTACT_MAX_CONNECTION = 12;
export const CONTACT_MAX_LOYALTY    = 6;

/**
 * BP cost for a single contact during chargen.
 * SR4A p. 104: cost = Connection + Loyalty.
 */
export function contactBP(c: ICharContact): number {
  return c.connection + c.loyalty;
}

/** Total BP cost for all contacts on a character. */
export function contactsBP(contacts: ICharContact[]): number {
  return contacts.reduce((sum, c) => sum + contactBP(c), 0);
}

/**
 * Validate contact fields.
 * Returns null if valid, or a player-facing error string.
 */
export function validateContact(
  name: string,
  connection: number,
  loyalty: number,
): string | null {
  if (!name || name.length < 1) return "Contact name cannot be empty.";
  if (name.length > CONTACT_MAX_NAME) {
    return `Contact name must be ≤ ${CONTACT_MAX_NAME} characters.`;
  }
  if (isPrototypePoisonKey(name)) return "Invalid contact name.";
  if (!Number.isInteger(connection) || connection < 1 || connection > CONTACT_MAX_CONNECTION) {
    return `Connection must be 1–${CONTACT_MAX_CONNECTION}.`;
  }
  if (!Number.isInteger(loyalty) || loyalty < 1 || loyalty > CONTACT_MAX_LOYALTY) {
    return `Loyalty must be 1–${CONTACT_MAX_LOYALTY}.`;
  }
  return null;
}

// ── Legwork & Favor mechanics (SR4A pp. 105–107) ──────────────────────────────

/**
 * Legwork dice pool: Charisma + contact Connection.
 * SR4A p. 105.
 */
export function legworkPool(charisma: number, contact: ICharContact): number {
  return charisma + contact.connection;
}

/**
 * Contact willing to help if Loyalty ≥ favor rating.
 * SR4A p. 106: loyalty sets willingness ceiling.
 */
export function contactWilling(contact: ICharContact, favorRating: number): boolean {
  return contact.loyalty >= favorRating;
}

/**
 * Connection dice added to acquisition/fencing test via a dealer contact.
 * SR4A p. 106.
 */
export function contactAcquisitionBonus(contact: ICharContact): number {
  return contact.connection;
}

/**
 * Validate a favor rating (1–6).
 * Returns null if valid, error string if not.
 */
export function validateFavorRating(rating: number): string | null {
  if (!Number.isInteger(rating) || rating < 1 || rating > 6) {
    return "Favor rating must be an integer from 1 (minor) to 6 (major risk).";
  }
  return null;
}

/**
 * Validate a legwork threshold (1–20).
 */
export function validateLegworkThreshold(threshold: number): string | null {
  if (!Number.isInteger(threshold) || threshold < 1 || threshold > 20) {
    return "Threshold must be an integer from 1 to 20.";
  }
  return null;
}
