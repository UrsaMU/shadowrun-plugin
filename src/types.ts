// ─── Shadowrun 4E domain types ────────────────────────────────────────────────

export const CHAR_ATTRS = [
  "Body", "Agility", "Reaction", "Strength",
  "Charisma", "Intuition", "Logic", "Willpower", "Edge",
] as const;

export type CharAttr = typeof CHAR_ATTRS[number];

export type ChargenState = "draft" | "submitted" | "approved";

/** A purchased active skill, optionally with a specialization. */
export interface ICharSkill {
  rating: number;
  spec?: string;
}

/** A knowledge skill entry (academic, street, professional, or interest). */
export interface IKnowledgeSkill {
  rating: number;
  category: "academic" | "street" | "professional" | "interest";
}

/** A language skill entry. */
export interface ILanguageSkill {
  rating: number;
  /** True if this is the character's native language (free, rating ignored for BP). */
  native?: boolean;
}

/** A quality taken during chargen. */
export interface ICharQuality {
  name: string;
  /** BP cost (positive = costs BP, negative = refunds BP). */
  bp: number;
  type: "positive" | "negative";
}

/** A contact NPC with Connection and Loyalty ratings. */
export interface ICharContact {
  /** Display name; max 50 chars, MUSH-stripped. */
  name: string;
  /** How well-connected the contact is (1–12). */
  connection: number;
  /** How much the contact likes/trusts the runner (1–6). */
  loyalty: number;
}

/** One entry in a character's karma transaction log. */
export interface IKarmaLogEntry {
  /** Unix ms timestamp. */
  timestamp: number;
  /** Positive = awarded, negative = spent. */
  delta: number;
  /** Human-readable reason; max 200 chars. */
  reason: string;
  /** playerName of awarding staff, if externally granted. */
  awardedBy?: string;
  /** Advancement detail if this was a karma spend for advancement. */
  advancement?: {
    type: "skill" | "attr" | "skillgroup" | "spec";
    target: string;
    fromRating: number;
    toRating: number;
  };
}

/** A vehicle or drone owned by a character. */
export interface IVehicle {
  id: string;
  /** Display name (e.g. "Alice's Americar"). */
  name: string;
  /** Vehicle class. */
  type: "ground" | "air" | "water" | "drone";
  /** Handling rating. */
  handling: number;
  /** Acceleration. */
  accel: number;
  /** Top speed. */
  speed: number;
  /** Pilot rating (autopilot). */
  pilot: number;
  /** Body rating. */
  body: number;
  /** Armor rating. */
  armor: number;
  /** Sensor rating. */
  sensor: number;
  /** Physical damage boxes filled. */
  physicalDmg: number;
  /** playerId of the owner. */
  ownerId: string;
}

/** A hacker's or technomancer's commlink. */
export interface ICommlink {
  /** Commlink model name. */
  model: string;
  /** Firewall rating (1–6). */
  firewall: number;
  /** Response rating (1–6). */
  response: number;
  /** Signal rating (1–6). */
  signal: number;
  /** System rating (1–6). */
  system: number;
  /** Currently active programs. */
  programs: string[];
}

/** A complex form known by a technomancer. */
export interface IComplexForm {
  /** Form name from COMPLEX_FORM_LIST. */
  name: string;
  /** Sustained rating (1–6). */
  rating: number;
}

/** An adept power purchased with power points. */
export interface IAdeptPower {
  /** Canonical name from ADEPT_POWER_LIST. */
  name: string;
  /** PP cost for this purchase (base cost × rating for leveled powers). */
  ppCost: number;
  /** Rating for leveled powers; omitted for non-leveled. */
  rating?: number;
  /** Optional staff notes. */
  notes?: string;
}

/** A spirit summoned or bound by an Awakened character. */
export interface ISpiritRecord {
  id: string;
  /** Spirit type name (e.g. "Air", "Beasts"). */
  type: string;
  /** Spirit Force (1–12). */
  force: number;
  /** Remaining services owed by the spirit. */
  services: number;
  /** True if the spirit is permanently bound (costs 1 Karma). */
  bound: boolean;
  /** playerId of the summoner who called this spirit. */
  summonedBy: string;
  /** Unix ms timestamp when summoned. */
  summonedAt: number;
}

/** A spell known by an Awakened character. */
export interface ISpell {
  /** Canonical name matching SPELL_CATALOGUE (e.g. "Manabolt"). */
  name: string;
  /** Spell category. */
  category: "Combat" | "Detection" | "Health" | "Illusion" | "Manipulation";
  /** Mana spells resist only with body; physical spells interact with armour. */
  type: "mana" | "physical";
  /** Range: Line-of-Sight, Area, Touch, or Special. */
  range: "LOS" | "LOS(A)" | "T" | "Special";
  /** Damage type for Combat spells only. */
  damage?: "P" | "S";
  /** Additive base to DV (independent of Force). */
  dvBase: number;
  /** DV multiplier per Force: 0 | 0.5 | 1. Applied as ceil(Force × dvPerForce). */
  dvPerForce: number;
  /** Optional staff notes. */
  notes?: string;
}

/** A cyberware or bioware implant installed in a character. */
export interface IImplant {
  /** Canonical name matching IMPLANT_CATALOGUE (e.g. "Wired Reflexes 2"). */
  name: string;
  /** Whether this is cyberware or bioware. */
  category: "cyberware" | "bioware";
  /** Implant grade affecting Essence cost. */
  grade: "standard" | "alpha" | "beta" | "delta" | "cultured";
  /** Actual Essence cost: base × grade multiplier, rounded to 2 dp. */
  essenceCost: number;
  /** Optional staff notes. */
  notes?: string;
}

/** A gear item tracked on a character. */
export interface IGearItem {
  /** Display name; max 80 chars, MUSH-stripped. */
  name: string;
  /** Quantity (positive integer). */
  quantity: number;
  /** Optional note; max 200 chars. */
  note?: string;
  /** Gear category from catalogue (if matched). */
  category?: string;
  /** Ballistic armor rating contributed by this item. */
  ballistic?: number;
  /** Impact armor rating contributed by this item. */
  impact?: number;
  /** Recoil compensation bonus from this item. */
  recoilComp?: number;
}

/** One entry in a character's nuyen transaction log. */
export interface INuyenLogEntry {
  /** Unix ms timestamp. */
  timestamp: number;
  /** Positive = received, negative = sent/deducted. */
  delta: number;
  /** The other party's playerName, or "Staff" for admin adjustments. */
  counterparty?: string;
  /** Optional reason; max 200 chars. */
  reason?: string;
}

/** Full character record stored in shadowrun.chars DBO collection. */
export interface IShadowrunChar {
  id: string;
  playerId: string;
  playerName: string;
  metatype: string;
  attrs: Record<string, number>;
  skills: Record<string, ICharSkill>;
  qualities: ICharQuality[];
  /** Starting nuyen purchased with BP (1 BP per 5,000¥). */
  nuyen: number;
  physicalDmg: number;
  stunDmg: number;
  chargenState: ChargenState;
  /** CGEN job ID opened on submit. */
  jobId?: string;
  /** NPC contacts with Connection and Loyalty ratings. */
  contacts: ICharContact[];
  /** Karma available to spend on advancement. */
  karmaAvailable: number;
  /** Lifetime total karma earned (never decremented). */
  karmaTotal: number;
  /** Full karma transaction log. */
  karmaLog: IKarmaLogEntry[];
  /** True if first aid has already been applied since the last physical wound. */
  firstAidApplied: boolean;
  /** Gear items carried by the character. */
  gear: IGearItem[];
  /** Nuyen transaction log. */
  nuyenLog: INuyenLogEntry[];
  /** Sum of worn ballistic armour (default 0). */
  armorRating: number;
  /** Sum of worn impact armour (default 0). */
  armorImpact: number;
  /** Recoil compensation from weapon/implants (default 0). */
  recoilComp: number;
  /** Accumulated recoil this combat turn — reset to 0 at start of each turn (default 0). */
  recoilAccum: number;
  /** Installed cyberware and bioware implants (default []). */
  implants: IImplant[];
  /** Current Essence (recomputed from implants on each install/remove; default 6). */
  essence: number;
  /** Extra initiative dice from Wired Reflexes / Synaptic Booster (default 0). */
  initDiceBonus: number;
  /** Magical tradition ("Hermetic" or "Shaman"). Undefined for non-Awakened. */
  tradition?: "Hermetic" | "Shaman";
  /** Spells known by Awakened characters (default []). */
  spells: ISpell[];
  /** Points of permanent Magic attribute loss from Essence/drain damage (default 0). */
  magicLoss: number;
  /** Currently in astral perception mode (default false). */
  astrally: boolean;
  /** Active and bound spirits for this character (default []). */
  spirits: ISpiritRecord[];
  /** Adept powers purchased with power points (default []). */
  adeptPowers: IAdeptPower[];
  /** Hacker's commlink. Undefined for non-hackers. */
  commlink?: ICommlink;
  /** Technomancer Resonance attribute. Undefined for non-technomancers. */
  resonance?: number;
  /** Complex forms known by technomancers (default []). */
  complexForms?: IComplexForm[];
  /** Matrix damage boxes filled on the character's persona. */
  matrixDmg?: number;
  /** Vehicles and drones owned by this character (default []). */
  vehicles?: IVehicle[];
  /** Initiation grade (Awakened) — raises Magic cap by 1 per grade (default 0). */
  initiationGrade: number;
  /** Submersion grade (Technomancer) — raises Resonance cap by 1 per grade (default 0). */
  submersionGrade: number;
  /** Metamagics or Echoes learned at each grade (default []). */
  metamagics: string[];
  /** Street Cred earned from run completions (default 0). */
  streetCred: number;
  /** Notoriety earned from bad acts (default 0). */
  notoriety: number;
  /** Public Awareness / celebrity level (default 0). */
  publicAwareness: number;
  /** Current lifestyle tier (default "low"). */
  lifestyle: "street" | "squatter" | "low" | "middle" | "high" | "luxury";
  /** Knowledge skills (free — no BP cost). Default {}. */
  knowledgeSkills: Record<string, IKnowledgeSkill>;
  /** Language skills (native is free; others cost 2 BP each). Default {}. */
  languages: Record<string, ILanguageSkill>;
}
