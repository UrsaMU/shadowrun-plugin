// ─── SR4 Quality definitions (20th Anniversary, pp. 90–97) ────────────────────
// Variable-cost qualities store their base/minimum cost; notes describe the range.

export interface IQualityDef {
  name: string;
  bp: number;
  type: "positive" | "negative";
  /** Human-readable note for variable-cost or rated qualities. */
  note?: string;
}

const _list: IQualityDef[] = [
  // ── Positive qualities ──────────────────────────────────────────────────────
  { name: "Adept",                         bp: 5,  type: "positive" },
  { name: "Ambidextrous",                  bp: 5,  type: "positive" },
  { name: "Animal Empathy",                bp: 10, type: "positive" },
  { name: "Aptitude",                      bp: 10, type: "positive" },
  { name: "Astral Chameleon",              bp: 5,  type: "positive" },
  { name: "Blandness",                     bp: 10, type: "positive" },
  { name: "Codeslinger",                   bp: 10, type: "positive" },
  { name: "Double Jointed",               bp: 5,  type: "positive" },
  { name: "Erased",                        bp: 5,  type: "positive", note: "5 or 10 BP — staff adjusts" },
  { name: "Exceptional Attribute",         bp: 20, type: "positive" },
  { name: "First Impression",             bp: 5,  type: "positive" },
  { name: "Focused Concentration",        bp: 10, type: "positive", note: "10 BP (rating 1) or 20 BP (rating 2) — staff adjusts" },
  { name: "Guts",                          bp: 5,  type: "positive" },
  { name: "High Pain Tolerance",          bp: 5,  type: "positive", note: "5/10/15 BP (rating 1–3) — staff adjusts" },
  { name: "Home Ground",                  bp: 10, type: "positive" },
  { name: "Human-Looking",               bp: 5,  type: "positive" },
  { name: "Lucky",                         bp: 20, type: "positive" },
  { name: "Magician",                      bp: 15, type: "positive" },
  { name: "Magic Resistance",             bp: 5,  type: "positive", note: "5 BP per rating (max rating 4) — staff adjusts" },
  { name: "Mentor Spirit",               bp: 5,  type: "positive" },
  { name: "Murky Link",                   bp: 10, type: "positive" },
  { name: "Mystic Adept",                bp: 10, type: "positive" },
  { name: "Natural Hardening",           bp: 10, type: "positive" },
  { name: "Natural Immunity",            bp: 5,  type: "positive", note: "5 or 15 BP — staff adjusts" },
  { name: "Photographic Memory",         bp: 10, type: "positive" },
  { name: "Quick Healer",                bp: 10, type: "positive" },
  { name: "Resistance to Pathogens",     bp: 5,  type: "positive", note: "5 or 10 BP — staff adjusts" },
  { name: "Spirit Affinity",             bp: 10, type: "positive" },
  { name: "Technomancer",                bp: 5,  type: "positive" },
  { name: "Toughness",                   bp: 10, type: "positive" },
  { name: "Will to Live",                bp: 5,  type: "positive", note: "5 BP per rating (max rating 3) — staff adjusts" },

  // ── Negative qualities ──────────────────────────────────────────────────────
  { name: "Addiction",                   bp: 5,  type: "negative", note: "5–30 BP (Mild/Moderate/Severe/Burnout) — staff adjusts" },
  { name: "Allergy",                     bp: 5,  type: "negative", note: "5–20 BP — staff adjusts" },
  { name: "Astral Beacon",              bp: 5,  type: "negative" },
  { name: "Bad Luck",                   bp: 20, type: "negative" },
  { name: "Codeblock",                  bp: 5,  type: "negative" },
  { name: "Combat Paralysis",           bp: 20, type: "negative" },
  { name: "Elf Poser",                  bp: 5,  type: "negative" },
  { name: "Gremlins",                   bp: 5,  type: "negative", note: "5 BP per rating (max rating 4) — staff adjusts" },
  { name: "Incompetent",               bp: 5,  type: "negative" },
  { name: "Infirm",                     bp: 20, type: "negative" },
  { name: "Low Pain Tolerance",         bp: 10, type: "negative" },
  { name: "Ork Poser",                  bp: 5,  type: "negative" },
  { name: "Pacifist",                   bp: 5,  type: "negative", note: "5 or 10 BP — staff adjusts" },
  { name: "Scorched",                   bp: 5,  type: "negative", note: "+10 BP for hackers/technomancers — staff adjusts" },
  { name: "Sensitive Neural Structure", bp: 5,  type: "negative", note: "+10 BP for hackers/technomancers — staff adjusts" },
  { name: "Sensitive System",           bp: 15, type: "negative" },
  { name: "Simsense Vertigo",           bp: 10, type: "negative", note: "+15 BP for hackers/technomancers — staff adjusts" },
  { name: "SINner",                     bp: 5,  type: "negative", note: "5 or 10 BP — staff adjusts" },
  { name: "Spirit Bane",               bp: 10, type: "negative" },
  { name: "Uncouth",                    bp: 20, type: "negative" },
  { name: "Uneducated",                bp: 20, type: "negative" },
  { name: "Weak Immune System",         bp: 5,  type: "negative" },
];

const _byName = new Map<string, IQualityDef>(
  _list.map((q) => [q.name.toLowerCase(), q]),
);

/** All quality definitions. */
export const QUALITIES: ReadonlyMap<string, IQualityDef> = _byName;

/**
 * Look up a quality by name, case-insensitively.
 * Returns the definition or null if not found.
 */
export function resolveQuality(input: string): IQualityDef | null {
  return _byName.get(input.toLowerCase()) ?? null;
}
