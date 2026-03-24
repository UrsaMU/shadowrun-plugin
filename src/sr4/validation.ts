// ─── Shared input-validation guards ──────────────────────────────────────────
//
// Centralises prototype-pollution defence so every validator in the plugin
// applies the same rule without duplicating the key list.

/** Keys that would corrupt Object.prototype if used as property names. */
export const PROTOTYPE_POISON_KEYS = new Set([
  "__proto__", "constructor", "prototype",
  "toString", "valueOf", "hasOwnProperty",
  "isPrototypeOf", "propertyIsEnumerable", "toLocaleString",
]);

/**
 * Returns true if `name` is a known prototype-polluting key OR starts with `__`.
 * Use this guard in every user-supplied string that could become an object key.
 */
export function isPrototypePoisonKey(name: string): boolean {
  return PROTOTYPE_POISON_KEYS.has(name) || name.startsWith("__");
}
