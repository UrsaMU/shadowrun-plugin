// ─── SR4 skill group definitions (20th Anniversary, pp. 119–128) ──────────────

export const SKILL_GROUPS: Record<string, string[]> = {
  "Athletics":   ["Gymnastics", "Running", "Swimming"],
  "Stealth":     ["Disguise", "Infiltration", "Palming", "Shadowing"],
  "Outdoors":    ["Navigation", "Survival", "Tracking"],
  "Firearms":    ["Automatics", "Longarms", "Pistols"],
  "Close Combat":["Blades", "Clubs", "Unarmed Combat"],
  "Cracking":    ["Cybercombat", "Electronic Warfare", "Hacking"],
  "Electronics": ["Computer", "Data Search", "Hardware", "Software"],
  "Engineering": ["Aeronautics Mechanic", "Automotive Mechanic",
                  "Industrial Mechanic", "Nautical Mechanic"],
  "Influence":   ["Con", "Etiquette", "Leadership", "Negotiation"],
  "Tasking":     ["Compiling", "Decompiling", "Registering"],
  "Conjuring":   ["Banishing", "Binding", "Summoning"],
  "Sorcery":     ["Counterspelling", "Ritual Spellcasting", "Spellcasting"],
};

/**
 * Resolve a skill group name case-insensitively.
 * Returns the canonical group name or null if not found.
 */
export function resolveSkillGroup(input: string): string | null {
  const lower = input.toLowerCase();
  for (const name of Object.keys(SKILL_GROUPS)) {
    if (name.toLowerCase() === lower) return name;
  }
  return null;
}

/** Return the skill names belonging to the given canonical group. */
export function skillsInGroup(group: string): string[] {
  return SKILL_GROUPS[group] ?? [];
}
