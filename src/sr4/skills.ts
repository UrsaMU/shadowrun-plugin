// ─── SR4 canonical active skill list (20th Anniversary, pp. 118–128) ──────────

export const ACTIVE_SKILLS: ReadonlySet<string> = new Set([
  // Combat
  "Archery", "Automatics", "Blades", "Clubs", "Dodge",
  "Exotic Melee Weapon", "Exotic Ranged Weapon", "Heavy Weapons",
  "Longarms", "Pistols", "Throwing Weapons", "Unarmed Combat",
  // Physical
  "Climbing", "Disguise", "Diving", "Escape Artist", "Gymnastics",
  "Infiltration", "Navigation", "Palming", "Parachuting", "Perception",
  "Running", "Shadowing", "Survival", "Swimming", "Tracking",
  // Social
  "Con", "Etiquette", "Instruction", "Intimidation", "Leadership", "Negotiation",
  // Technical
  "Aeronautics Mechanic", "Armorer", "Artisan", "Automotive Mechanic",
  "Chemistry", "Computer", "Cybercombat", "Cybertechnology", "Data Search",
  "Demolitions", "Electronic Warfare", "First Aid", "Forgery", "Hacking",
  "Hardware", "Industrial Mechanic", "Locksmith", "Medicine",
  "Nautical Mechanic", "Software",
  // Resonance (Technomancer)
  "Compiling", "Decompiling", "Registering",
  // Vehicle
  "Gunnery", "Pilot Aerospace", "Pilot Aircraft", "Pilot Anthroform",
  "Pilot Exotic Vehicle", "Pilot Ground Craft", "Pilot Watercraft",
  // Magical (Awakened)
  "Arcana", "Assensing", "Astral Combat", "Banishing", "Binding",
  "Counterspelling", "Enchanting", "Ritual Spellcasting", "Spellcasting",
  "Summoning",
]);

/**
 * Look up a skill by name, case-insensitively.
 * Returns the canonical skill name or null if not found.
 */
export function resolveSkill(input: string): string | null {
  const lower = input.toLowerCase();
  for (const s of ACTIVE_SKILLS) {
    if (s.toLowerCase() === lower) return s;
  }
  return null;
}
