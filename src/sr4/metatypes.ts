// ─── SR4 Metatype definitions (20th Anniversary, p. 66) ───────────────────────
// Format: attrs[name] = [racialMin, naturalMax]

export interface IMetatypeDef {
  bp: number;
  attrs: Record<string, [number, number]>;
  abilities: string[];
}

export const METATYPES: Record<string, IMetatypeDef> = {
  Human: {
    bp: 0,
    attrs: {
      Body: [1, 6], Agility: [1, 6], Reaction: [1, 6], Strength: [1, 6],
      Charisma: [1, 6], Intuition: [1, 6], Logic: [1, 6], Willpower: [1, 6],
      Edge: [2, 7],
    },
    abilities: ["(None — highest base Edge)"],
  },
  Elf: {
    bp: 30,
    attrs: {
      Body: [1, 6], Agility: [2, 7], Reaction: [1, 6], Strength: [1, 6],
      Charisma: [3, 8], Intuition: [1, 6], Logic: [1, 6], Willpower: [1, 6],
      Edge: [1, 6],
    },
    abilities: ["Low-Light Vision"],
  },
  Dwarf: {
    bp: 25,
    attrs: {
      Body: [2, 7], Agility: [1, 6], Reaction: [1, 5], Strength: [3, 8],
      Charisma: [1, 6], Intuition: [1, 6], Logic: [1, 6], Willpower: [2, 7],
      Edge: [1, 6],
    },
    abilities: ["Thermographic Vision", "+2 dice Body vs. pathogens/toxins"],
  },
  Ork: {
    bp: 20,
    attrs: {
      Body: [4, 9], Agility: [1, 6], Reaction: [1, 6], Strength: [3, 8],
      Charisma: [1, 5], Intuition: [1, 6], Logic: [1, 5], Willpower: [1, 6],
      Edge: [1, 6],
    },
    abilities: ["Low-Light Vision"],
  },
  Troll: {
    bp: 40,
    attrs: {
      Body: [5, 10], Agility: [1, 5], Reaction: [1, 6], Strength: [5, 10],
      Charisma: [1, 4], Intuition: [1, 5], Logic: [1, 5], Willpower: [1, 6],
      Edge: [1, 6],
    },
    abilities: ["Thermographic Vision", "+1 Reach", "+1 natural armor"],
  },
};

export const METATYPE_NAMES = Object.keys(METATYPES);

export function getMetatype(name: string): IMetatypeDef | null {
  const key = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  return METATYPES[key] ?? null;
}

/** Build a fresh attrs record initialized to racial minimums. */
export function racialBaseAttrs(metatype: string): Record<string, number> {
  const meta = METATYPES[metatype];
  if (!meta) return {};
  return Object.fromEntries(
    Object.entries(meta.attrs).map(([k, [min]]) => [k, min]),
  );
}
