// ─── Weapon & Armor database (SR4A pp. 310–342) ───────────────────────────────

export type WeaponCategory =
  | "light pistol"
  | "heavy pistol"
  | "machine pistol"
  | "submachine gun"
  | "assault rifle"
  | "shotgun"
  | "sniper rifle"
  | "light machine gun"
  | "melee"
  | "throwing"
  | "heavy weapon";

export interface IWeaponEntry {
  name: string;
  category: WeaponCategory;
  /** Damage Value: base DV before hits and wound modifiers. */
  dv: number;
  /** Damage type: P = Physical, S = Stun. */
  damageType: "P" | "S";
  /** Accuracy rating (SR4A p. 310). */
  accuracy: number;
  /** Reach for melee weapons (0 for ranged). */
  reach: number;
  /** Ammo capacity; 0 for melee. */
  ammo: number;
  /** Recoil compensation built into the weapon. */
  recoilComp: number;
  /** Availability rating. */
  availability: number;
  /** Street cost in nuyen. */
  cost: number;
  description: string;
}

export const WEAPON_CATALOGUE: IWeaponEntry[] = [
  // ── Light Pistols ──────────────────────────────────────────────────────────
  { name: "Ares Light Fire 75",    category: "light pistol",    dv:4,  damageType:"P", accuracy:5, reach:0, ammo:16, recoilComp:0, availability:2,  cost:700,    description: "Compact concealable pistol; popular with corporate employees." },
  { name: "Walther Palm Pistol",   category: "light pistol",    dv:3,  damageType:"P", accuracy:4, reach:0, ammo:2,  recoilComp:0, availability:4,  cost:180,    description: "Two-shot palm-sized holdout; extremely concealable." },
  // ── Heavy Pistols ──────────────────────────────────────────────────────────
  { name: "Ares Predator IV",      category: "heavy pistol",    dv:5,  damageType:"P", accuracy:5, reach:0, ammo:15, recoilComp:1, availability:5,  cost:725,    description: "Standard-issue heavy pistol; workhorse of Ares security." },
  { name: "Browning Ultra-Power",  category: "heavy pistol",    dv:5,  damageType:"P", accuracy:5, reach:0, ammo:10, recoilComp:0, availability:4,  cost:650,    description: "Reliable, powerful large-calibre semi-auto." },
  { name: "Colt Government 2066",  category: "heavy pistol",    dv:5,  damageType:"P", accuracy:4, reach:0, ammo:8,  recoilComp:0, availability:4,  cost:575,    description: "Classic retro-style government model." },
  // ── Machine Pistols ────────────────────────────────────────────────────────
  { name: "Ares Crusader II",      category: "machine pistol",  dv:4,  damageType:"P", accuracy:5, reach:0, ammo:40, recoilComp:1, availability:8,  cost:830,    description: "High-capacity machine pistol; burst-fire capable." },
  { name: "Steyr TMP",             category: "machine pistol",  dv:4,  damageType:"P", accuracy:4, reach:0, ammo:30, recoilComp:0, availability:8,  cost:800,    description: "Compact burst-fire pistol; favored by organized crime." },
  // ── Submachine Guns ────────────────────────────────────────────────────────
  { name: "Heckler & Koch MP-5",   category: "submachine gun",  dv:5,  damageType:"P", accuracy:5, reach:0, ammo:30, recoilComp:2, availability:4,  cost:685,    description: "Classic reliable SMG; common in corporate security." },
  { name: "Ingram Smartgun X",     category: "submachine gun",  dv:5,  damageType:"P", accuracy:5, reach:0, ammo:32, recoilComp:2, availability:6,  cost:900,    description: "Modified for smartgun systems; integral laser." },
  { name: "Uzi IV",                category: "submachine gun",  dv:5,  damageType:"P", accuracy:4, reach:0, ammo:24, recoilComp:2, availability:4,  cost:500,    description: "Cheap and plentiful gangbanger staple." },
  // ── Assault Rifles ─────────────────────────────────────────────────────────
  { name: "Ares Alpha",            category: "assault rifle",   dv:6,  damageType:"P", accuracy:5, reach:0, ammo:42, recoilComp:2, availability:14, cost:2650,   description: "Top-tier assault rifle with integral GL; military-grade." },
  { name: "AK-97",                 category: "assault rifle",   dv:6,  damageType:"P", accuracy:5, reach:0, ammo:38, recoilComp:2, availability:4,  cost:950,    description: "Ubiquitous assault rifle; cheap and everywhere." },
  { name: "Colt M22A2",            category: "assault rifle",   dv:6,  damageType:"P", accuracy:5, reach:0, ammo:20, recoilComp:2, availability:8,  cost:1000,   description: "NATO-standard select-fire battle rifle." },
  // ── Shotguns ───────────────────────────────────────────────────────────────
  { name: "Mossberg AM-CMDT",      category: "shotgun",         dv:7,  damageType:"P", accuracy:4, reach:0, ammo:10, recoilComp:1, availability:4,  cost:600,    description: "Semi-automatic combat shotgun; wide damage pattern." },
  { name: "Remington 990",         category: "shotgun",         dv:7,  damageType:"P", accuracy:3, reach:0, ammo:8,  recoilComp:0, availability:3,  cost:450,    description: "Pump-action hunting shotgun; reliable." },
  // ── Sniper Rifles ──────────────────────────────────────────────────────────
  { name: "Ares Desert Strike",    category: "sniper rifle",    dv:8,  damageType:"P", accuracy:8, reach:0, ammo:14, recoilComp:3, availability:14, cost:17500,  description: "Top-tier precision anti-material rifle." },
  { name: "Ranger Arms SM-3",      category: "sniper rifle",    dv:8,  damageType:"P", accuracy:8, reach:0, ammo:6,  recoilComp:2, availability:16, cost:28000,  description: "Ultra-precision long-range sniper; breaks down for concealment." },
  // ── Melee ──────────────────────────────────────────────────────────────────
  { name: "Knife",                 category: "melee",           dv:3,  damageType:"P", accuracy:5, reach:0, ammo:0,  recoilComp:0, availability:1,  cost:30,     description: "Common blade; ubiquitous street weapon." },
  { name: "Monofilament Whip",     category: "melee",           dv:8,  damageType:"P", accuracy:5, reach:1, ammo:0,  recoilComp:0, availability:10, cost:10000,  description: "Monomolecular whip; slices through almost anything." },
  { name: "Stun Baton",            category: "melee",           dv:6,  damageType:"S", accuracy:5, reach:1, ammo:0,  recoilComp:0, availability:4,  cost:750,    description: "Electric stun baton; non-lethal takedown." },
  { name: "Shock Gloves",          category: "melee",           dv:5,  damageType:"S", accuracy:5, reach:0, ammo:0,  recoilComp:0, availability:4,  cost:550,    description: "Electrified combat gloves; concealable stun weapon." },
];

/** Look up a weapon by case-insensitive name. */
export function lookupWeapon(name: string): IWeaponEntry | null {
  const lower = name.toLowerCase();
  return WEAPON_CATALOGUE.find((w) => w.name.toLowerCase() === lower) ?? null;
}

// ── Armor catalogue ───────────────────────────────────────────────────────────

export interface IArmorEntry {
  name: string;
  /** Ballistic armor rating. */
  ballistic: number;
  /** Impact armor rating. */
  impact: number;
  /** Availability rating. */
  availability: number;
  /** Street cost. */
  cost: number;
  description: string;
}

export const ARMOR_CATALOGUE: IArmorEntry[] = [
  { name: "Armor Jacket",          ballistic:8, impact:6, availability:4,  cost:900,    description: "Standard runner armor; covers torso and arms." },
  { name: "Armor Vest",            ballistic:6, impact:4, availability:4,  cost:500,    description: "Concealable body armor; fits under regular clothing." },
  { name: "Lined Coat",            ballistic:6, impact:4, availability:4,  cost:700,    description: "Stylish armored coat; fashionable and functional." },
  { name: "Body Armor (full)",     ballistic:10, impact:8, availability:14, cost:11000,  description: "Military-grade full body armor; heavy but excellent protection." },
  { name: "Helmet",                ballistic:2, impact:2, availability:2,  cost:100,    description: "Standard protective helmet; adds to any armor suit." },
  { name: "Forearm Guards",        ballistic:1, impact:2, availability:2,  cost:75,     description: "Hardened forearm pads; partial protection." },
  { name: "Shin Guards",           ballistic:0, impact:1, availability:1,  cost:40,     description: "Hardened shin protection; worn under trousers." },
  { name: "Mortimer of London (formal)", ballistic:5, impact:3, availability:8, cost:3000, description: "High-fashion armored suit; corp meetings and runs." },
  { name: "Securetech PPP Vitals", ballistic:3, impact:2, availability:4,  cost:500,    description: "Layered panels for vital areas; concealable." },
  { name: "Form-Fitting Body Armor", ballistic:4, impact:2, availability:8, cost:1200,  description: "Skintight armored bodysuit; wearable under other clothing." },
];

/** Look up an armor piece by case-insensitive name. */
export function lookupArmor(name: string): IArmorEntry | null {
  const lower = name.toLowerCase();
  return ARMOR_CATALOGUE.find((a) => a.name.toLowerCase() === lower) ?? null;
}
