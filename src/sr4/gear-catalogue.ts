// ─── SR4 Gear Catalogue (core rulebook pp. 310–342) ──────────────────────────
// All gear available via +gear/add. Armor entries drive armorRating/armorImpact.
// Weapon entries are for reference; combat stats live in weapons.ts.

export type GearCategory =
  | "armor"
  | "armor-mod"
  | "melee-weapon"
  | "ranged-weapon"
  | "firearm-accessory"
  | "ammo"
  | "grenade"
  | "explosive"
  | "commlink"
  | "os"
  | "matrix-program"
  | "electronics"
  | "sensor"
  | "security"
  | "drug"
  | "chemical"
  | "medical"
  | "survival"
  | "tool"
  | "id"
  | "magical"
  | "misc";

export interface IGearCatalogueEntry {
  name: string;
  category: GearCategory;
  subcategory?: string;
  /** Ballistic armor rating added when this item is in gear. */
  ballistic?: number;
  /** Impact armor rating added when this item is in gear. */
  impact?: number;
  /** Recoil compensation bonus from this item. */
  recoilComp?: number;
  /** Damage value string for reference (e.g. "STR/2+3P", "6S(e)"). */
  dv?: string;
  /** Armor penetration modifier. */
  ap?: number;
  /** Fire modes string (e.g. "SA/BF/FA"). */
  modes?: string;
  /** Ammo capacity. */
  ammo?: number;
  /** Commlink Response. */
  response?: number;
  /** Commlink Signal. */
  signal?: number;
  /** OS Firewall. */
  firewall?: number;
  /** OS System. */
  system?: number;
  /** Availability rating. */
  availability: number | string;
  /** Street cost in nuyen. */
  cost: number;
  description?: string;
}

// ─────────────────────────────────────────────────────────────────────────────

export const GEAR_CATALOGUE: IGearCatalogueEntry[] = [

  // ── ARMOR ─────────────────────────────────────────────────────────────────

  { name: "Actioneer Business Clothes", category: "armor", ballistic: 5, impact: 3, availability: 8,    cost: 1500,  description: "Corporate-grade armored business wear; inconspicuous." },
  { name: "Armor Clothing",             category: "armor", ballistic: 4, impact: 0, availability: 2,    cost: 500,   description: "Ordinary-looking clothing with light ballistic protection." },
  { name: "Armor Jacket",               category: "armor", ballistic: 8, impact: 6, availability: 2,    cost: 900,   description: "Standard runner armor; covers torso and arms." },
  { name: "Armor Vest",                 category: "armor", ballistic: 6, impact: 4, availability: 4,    cost: 600,   description: "Concealable body armor; fits under regular clothing." },
  { name: "Camouflage Suit",            category: "armor", ballistic: 8, impact: 6, availability: 4,    cost: 1200,  description: "Camo-patterned armored suit for field ops." },
  { name: "Chameleon Suit",             category: "armor", ballistic: 6, impact: 4, availability: "10R", cost: 8000,  description: "Color-shifting adaptive camouflage suit." },
  { name: "Full Body Armor",            category: "armor", ballistic: 10, impact: 8, availability: "14R", cost: 6000, description: "Military-grade full body armor; heavy but excellent protection." },
  { name: "Leather Jacket",             category: "armor", ballistic: 2, impact: 2, availability: 0,    cost: 200,   description: "Basic leather jacket; minimal protection." },
  { name: "Lined Coat",                 category: "armor", ballistic: 6, impact: 4, availability: 2,    cost: 700,   description: "Stylish armored coat; fashionable and functional." },
  { name: "Urban Explorer Jumpsuit",    category: "armor", ballistic: 6, impact: 6, availability: 8,    cost: 500,   description: "Armored jumpsuit for urban infiltration." },
  { name: "Form-Fitting Body Armor",    category: "armor", ballistic: 4, impact: 2, availability: 8,    cost: 1200,  description: "Skintight armored bodysuit; wearable under other clothing." },
  { name: "Mortimer of London Greatcoat", category: "armor", ballistic: 5, impact: 3, availability: 8,  cost: 3000,  description: "High-fashion armored greatcoat; corp meetings and runs." },
  { name: "Securetech PPP Vitals",      category: "armor", ballistic: 3, impact: 2, availability: 4,    cost: 500,   description: "Layered panel armor for vital areas; concealable." },

  // ── ARMOR: Helmets & Shields ───────────────────────────────────────────────

  { name: "Helmet",                     category: "armor", ballistic: 1, impact: 2, availability: 2,    cost: 100,   description: "Standard protective helmet; stackable with armor." },
  { name: "Helmet (full)",              category: "armor", ballistic: 2, impact: 2, availability: 4,    cost: 150,   description: "Full enclosed helmet; greater protection." },
  { name: "Ballistic Shield",           category: "armor", ballistic: 6, impact: 4, availability: "12R", cost: 1500, description: "Full-body ballistic shield; one-handed use." },
  { name: "Riot Shield",                category: "armor", ballistic: 2, impact: 6, availability: "6R",  cost: 200,  description: "Riot-control impact shield." },
  { name: "Taser Shield",               category: "armor", ballistic: 2, impact: 6, availability: "10R", cost: 750,  description: "Shock-equipped riot shield; taser capability." },
  { name: "Forearm Guards",             category: "armor", ballistic: 1, impact: 2, availability: 2,    cost: 75,    description: "Hardened forearm pads; partial protection." },
  { name: "Shin Guards",                category: "armor", ballistic: 0, impact: 1, availability: 1,    cost: 40,    description: "Hardened shin protection; worn under trousers." },

  // ── ARMOR MODIFICATIONS ────────────────────────────────────────────────────

  { name: "Chemical Protection Rating 1",  category: "armor-mod", availability: 8,    cost: 250,   description: "Seals armor against chemical agents; Rating 1." },
  { name: "Chemical Protection Rating 2",  category: "armor-mod", availability: 8,    cost: 500,   description: "Seals armor against chemical agents; Rating 2." },
  { name: "Chemical Protection Rating 3",  category: "armor-mod", availability: 8,    cost: 750,   description: "Seals armor against chemical agents; Rating 3." },
  { name: "Chemical Protection Rating 4",  category: "armor-mod", availability: 8,    cost: 1000,  description: "Seals armor against chemical agents; Rating 4." },
  { name: "Chemical Protection Rating 5",  category: "armor-mod", availability: 8,    cost: 1250,  description: "Seals armor against chemical agents; Rating 5." },
  { name: "Chemical Protection Rating 6",  category: "armor-mod", availability: 8,    cost: 1500,  description: "Seals armor against chemical agents; Rating 6." },
  { name: "Chemical Seal",                 category: "armor-mod", availability: 6,    cost: 5000,  description: "Fully seals armor for CBRN environments." },
  { name: "Fire Resistance Rating 1",      category: "armor-mod", availability: 4,    cost: 100,   description: "Fire/heat resistant armor layer; Rating 1." },
  { name: "Fire Resistance Rating 2",      category: "armor-mod", availability: 4,    cost: 200,   description: "Fire/heat resistant armor layer; Rating 2." },
  { name: "Fire Resistance Rating 3",      category: "armor-mod", availability: 4,    cost: 300,   description: "Fire/heat resistant armor layer; Rating 3." },
  { name: "Fire Resistance Rating 4",      category: "armor-mod", availability: 4,    cost: 400,   description: "Fire/heat resistant armor layer; Rating 4." },
  { name: "Fire Resistance Rating 5",      category: "armor-mod", availability: 4,    cost: 500,   description: "Fire/heat resistant armor layer; Rating 5." },
  { name: "Fire Resistance Rating 6",      category: "armor-mod", availability: 4,    cost: 600,   description: "Fire/heat resistant armor layer; Rating 6." },
  { name: "Insulation Rating 1",           category: "armor-mod", availability: 4,    cost: 150,   description: "Cold/thermal insulation; Rating 1." },
  { name: "Insulation Rating 2",           category: "armor-mod", availability: 4,    cost: 300,   description: "Cold/thermal insulation; Rating 2." },
  { name: "Insulation Rating 3",           category: "armor-mod", availability: 4,    cost: 450,   description: "Cold/thermal insulation; Rating 3." },
  { name: "Insulation Rating 4",           category: "armor-mod", availability: 4,    cost: 600,   description: "Cold/thermal insulation; Rating 4." },
  { name: "Insulation Rating 5",           category: "armor-mod", availability: 4,    cost: 750,   description: "Cold/thermal insulation; Rating 5." },
  { name: "Insulation Rating 6",           category: "armor-mod", availability: 4,    cost: 900,   description: "Cold/thermal insulation; Rating 6." },
  { name: "Nonconductivity Rating 1",      category: "armor-mod", availability: 6,    cost: 200,   description: "Electrical insulation; Rating 1." },
  { name: "Nonconductivity Rating 2",      category: "armor-mod", availability: 6,    cost: 400,   description: "Electrical insulation; Rating 2." },
  { name: "Nonconductivity Rating 3",      category: "armor-mod", availability: 6,    cost: 600,   description: "Electrical insulation; Rating 3." },
  { name: "Nonconductivity Rating 4",      category: "armor-mod", availability: 6,    cost: 800,   description: "Electrical insulation; Rating 4." },
  { name: "Nonconductivity Rating 5",      category: "armor-mod", availability: 6,    cost: 1000,  description: "Electrical insulation; Rating 5." },
  { name: "Nonconductivity Rating 6",      category: "armor-mod", availability: 6,    cost: 1200,  description: "Electrical insulation; Rating 6." },
  { name: "Shock Frills",                  category: "armor-mod", availability: "6R",  cost: 200,   description: "Electrified frills on armor; shocks on contact." },
  { name: "Thermal Damping Rating 1",      category: "armor-mod", availability: "10F", cost: 500,   description: "Masks heat signature; Rating 1." },
  { name: "Thermal Damping Rating 2",      category: "armor-mod", availability: "10F", cost: 1000,  description: "Masks heat signature; Rating 2." },
  { name: "Thermal Damping Rating 3",      category: "armor-mod", availability: "10F", cost: 1500,  description: "Masks heat signature; Rating 3." },
  { name: "Thermal Damping Rating 4",      category: "armor-mod", availability: "10F", cost: 2000,  description: "Masks heat signature; Rating 4." },
  { name: "Thermal Damping Rating 5",      category: "armor-mod", availability: "10F", cost: 2500,  description: "Masks heat signature; Rating 5." },
  { name: "Thermal Damping Rating 6",      category: "armor-mod", availability: "10F", cost: 3000,  description: "Masks heat signature; Rating 6." },

  // ── MELEE WEAPONS ─────────────────────────────────────────────────────────

  { name: "Combat Axe",           category: "melee-weapon", dv: "STR/2+4P", ap: -1, availability: "8R",  cost: 600,   description: "Heavy combat axe; brutal chopping damage." },
  { name: "Forearm Snap-Blades",  category: "melee-weapon", dv: "STR/2+2P",         availability: "6R",  cost: 150,   description: "Concealable spring-loaded blades." },
  { name: "Katana",               category: "melee-weapon", dv: "STR/2+3P", ap: -1, availability: "4R",  cost: 1000,  description: "Traditional Japanese blade; razor-sharp." },
  { name: "Knife",                category: "melee-weapon", dv: "STR/2+1P",         availability: 0,     cost: 20,    description: "Common blade; ubiquitous street weapon." },
  { name: "Monofilament Sword",   category: "melee-weapon", dv: "STR/2+3P", ap: -1, availability: "8R",  cost: 750,   description: "Monomolecular-edged sword; slices through armor." },
  { name: "Survival Knife",       category: "melee-weapon", dv: "STR/2+1P", ap: -1, availability: 0,     cost: 50,    description: "Sturdy outdoor/combat knife." },
  { name: "Sword",                category: "melee-weapon", dv: "STR/2+3P",         availability: "4R",  cost: 350,   description: "Standard one-handed sword." },
  { name: "Club",                 category: "melee-weapon", dv: "STR/2+1P",         availability: 0,     cost: 30,    description: "Simple impact weapon." },
  { name: "Extendable Baton",     category: "melee-weapon", dv: "STR/2+1P",         availability: 0,     cost: 50,    description: "Collapsible security baton." },
  { name: "Sap",                  category: "melee-weapon", dv: "STR/2+1S",         availability: 0,     cost: 30,    description: "Lead-weighted striking bag; stun damage." },
  { name: "Staff",                category: "melee-weapon", dv: "STR/2+2P",         availability: 0,     cost: 50,    description: "Two-handed staff; Reach 2." },
  { name: "Stun Baton",           category: "melee-weapon", dv: "6S(e)",            availability: "4R",  cost: 400,   description: "Electric stun baton; non-lethal takedown." },
  { name: "Monofilament Whip",    category: "melee-weapon", dv: "8P",      ap: -4,  availability: "12F", cost: 3000,  description: "Monomolecular whip; slices through almost anything." },
  { name: "Pole Arm",             category: "melee-weapon", dv: "STR/2+2P", ap: -2, availability: "4R",  cost: 1000,  description: "Reach weapon; halberd or spear type." },
  { name: "Monofilament Chainsaw",category: "melee-weapon", dv: "5P",      ap: -2,  availability: 4,     cost: 300,   description: "Monomolecular chainsaw; terrifying close-quarters weapon." },
  { name: "Shock Gloves",         category: "melee-weapon", dv: "5S(e)",            availability: "3R",  cost: 200,   description: "Electrified combat gloves; concealable stun weapon." },

  // ── THROWING WEAPONS ──────────────────────────────────────────────────────

  { name: "Bows",                 category: "ranged-weapon", subcategory: "bow",  dv: "STR+2P",           availability: 0,     cost: 0,    description: "Bows (cost = Rating × 100¥; DV = STR+2P)." },
  { name: "Shuriken",             category: "ranged-weapon", subcategory: "throwing", dv: "STR/2P",        availability: 2,     cost: 30,   description: "Throwing stars; concealable." },
  { name: "Throwing Knife",       category: "ranged-weapon", subcategory: "throwing", dv: "STR/2+1P",      availability: 2,     cost: 20,   description: "Balanced throwing knife." },

  // ── RANGED WEAPONS: Tasers ─────────────────────────────────────────────────

  { name: "Defiance EX Shocker",  category: "ranged-weapon", subcategory: "taser",    dv: "8S(e)",  modes: "SS",  ammo: 4,  availability: 4,     cost: 250,  description: "Single-shot taser pistol." },
  { name: "Yamaha Pulsar",        category: "ranged-weapon", subcategory: "taser",    dv: "6S(e)",  modes: "SA",  ammo: 4,  availability: 4,     cost: 150,  description: "Semi-auto taser; favored by security." },

  // ── RANGED WEAPONS: Holdout Pistols ───────────────────────────────────────

  { name: "Raecor Sting",         category: "ranged-weapon", subcategory: "holdout pistol",  dv: "6P(f)", ap: 5,  modes: "SS",  ammo: 5,  availability: "6R",  cost: 350,  description: "Flechette holdout; nasty surprise." },
  { name: "Streetline Special",   category: "ranged-weapon", subcategory: "holdout pistol",  dv: "4P",             modes: "SS",  ammo: 6,  availability: "4R",  cost: 100,  description: "Cheap disposable holdout pistol." },

  // ── RANGED WEAPONS: Light Pistols ─────────────────────────────────────────

  { name: "Colt America L36",     category: "ranged-weapon", subcategory: "light pistol",    dv: "4P",             modes: "SA",  ammo: 11, availability: "4R",  cost: 150,  description: "Lightweight semi-auto; popular civilian carry." },
  { name: "Fichetti Security 600",category: "ranged-weapon", subcategory: "light pistol",    dv: "4P",             modes: "SA",  ammo: 30, availability: "6R",  cost: 450,  description: "High-capacity security pistol." },
  { name: "Hammerli 620S",        category: "ranged-weapon", subcategory: "light pistol",    dv: "4P", recoilComp: 1, modes: "SA", ammo: 6, availability: "8R", cost: 650,  description: "Target pistol with integral RC." },
  { name: "Yamaha Sakura Fubuki", category: "ranged-weapon", subcategory: "light pistol",    dv: "4P",             modes: "SA/BF", ammo: 40, availability: "10R", cost: 2000, description: "Multi-mag burst-fire light pistol." },

  // ── RANGED WEAPONS: Heavy Pistols ─────────────────────────────────────────

  { name: "Ares Predator IV",     category: "ranged-weapon", subcategory: "heavy pistol",    dv: "5P", ap: -1,   modes: "SA",  ammo: 15, recoilComp: 1, availability: "4R",  cost: 350,  description: "Standard-issue heavy pistol; Ares security workhorse." },
  { name: "Ares Viper Slivergun", category: "ranged-weapon", subcategory: "heavy pistol",    dv: "8P(f)", ap: 5,  modes: "SA/BF", ammo: 30, availability: "5R", cost: 500,  description: "Flechette pistol; lethal unarmored spray." },
  { name: "Colt Manhunter",       category: "ranged-weapon", subcategory: "heavy pistol",    dv: "5P", ap: -1,   modes: "SA",  ammo: 16, availability: "4R",  cost: 300,  description: "Reliable high-cap semi-auto." },
  { name: "Remington Roomsweeper",category: "ranged-weapon", subcategory: "heavy pistol",    dv: "5P", ap: -1,   modes: "SA",  ammo: 8,  availability: "6R",  cost: 250,  description: "Short-barrel heavy pistol; room-clearing." },
  { name: "Ruger Super Warhawk",  category: "ranged-weapon", subcategory: "heavy pistol",    dv: "6P", ap: -2,   modes: "SS",  ammo: 6,  availability: "3R",  cost: 250,  description: "Big-bore revolver; powerful but slow." },

  // ── RANGED WEAPONS: Machine Pistols ───────────────────────────────────────

  { name: "Ceska Black Scorpion", category: "ranged-weapon", subcategory: "machine pistol",  dv: "4P",  modes: "SA/BF",    ammo: 35, recoilComp: 1, availability: "8R", cost: 550,  description: "Compact burst-fire machine pistol." },
  { name: "Steyr TMP",            category: "ranged-weapon", subcategory: "machine pistol",  dv: "4P",  modes: "SA/BF/FA", ammo: 30, availability: "8R", cost: 600,  description: "Compact full-auto pistol; favored by organized crime." },

  // ── RANGED WEAPONS: Submachine Guns ───────────────────────────────────────

  { name: "AK-97 Carbine",        category: "ranged-weapon", subcategory: "submachine gun",  dv: "5P",  modes: "SA/BF/FA", ammo: 30, recoilComp: 1, availability: "4R", cost: 400,  description: "Short AK variant; reliable and cheap." },
  { name: "HK-227-X",             category: "ranged-weapon", subcategory: "submachine gun",  dv: "5P",  modes: "SA/BF/FA", ammo: 28, recoilComp: 1, availability: "8R", cost: 800,  description: "High-quality HK submachine gun." },
  { name: "HK MP-5 TX",           category: "ranged-weapon", subcategory: "submachine gun",  dv: "5P",  modes: "SA/BF/FA", ammo: 20, recoilComp: 2, availability: "4R", cost: 550,  description: "Classic reliable SMG; common in corporate security." },
  { name: "Ingram Smartgun X",    category: "ranged-weapon", subcategory: "submachine gun",  dv: "5P",  modes: "BF/FA",    ammo: 32, recoilComp: 2, availability: "6R", cost: 650,  description: "Smartgun-equipped SMG; integral laser." },
  { name: "Uzi IV",               category: "ranged-weapon", subcategory: "submachine gun",  dv: "5P",  modes: "BF",       ammo: 24, recoilComp: 1, availability: "4R", cost: 500,  description: "Cheap and plentiful gangbanger staple." },

  // ── RANGED WEAPONS: Assault Rifles ────────────────────────────────────────

  { name: "AK-97",                category: "ranged-weapon", subcategory: "assault rifle",   dv: "6P", ap: -1, modes: "SA/BF/FA", ammo: 38, recoilComp: 2, availability: "4R",  cost: 500,   description: "Ubiquitous assault rifle; cheap and everywhere." },
  { name: "Ares Alpha",           category: "ranged-weapon", subcategory: "assault rifle",   dv: "6P", ap: -1, modes: "SA/BF/FA", ammo: 42, recoilComp: 2, availability: "12F", cost: 1700,  description: "Top-tier assault rifle with integral grenade launcher." },
  { name: "FN HAR",               category: "ranged-weapon", subcategory: "assault rifle",   dv: "6P", ap: -1, modes: "SA/BF/FA", ammo: 35, recoilComp: 2, availability: "8R",  cost: 1000,  description: "Reliable full-auto battle rifle." },
  { name: "HK XM30",              category: "ranged-weapon", subcategory: "assault rifle",   dv: "6P", ap: -1, modes: "SA/BF/FA", ammo: 30, recoilComp: 1, availability: "15F", cost: 2500,  description: "Next-gen military assault rifle." },

  // ── RANGED WEAPONS: Sport / Hunting Rifles ────────────────────────────────

  { name: "Ruger 100",            category: "ranged-weapon", subcategory: "sport rifle",     dv: "7P", ap: -1, modes: "SA",       ammo: 5,  availability: "4R",  cost: 900,   description: "Semi-auto hunting rifle." },
  { name: "PJSS Elephant Rifle",  category: "ranged-weapon", subcategory: "sport rifle",     dv: "9P", ap: -1, modes: "SS",       ammo: 2,  availability: "12R", cost: 6000,  description: "Big-bore heavy game rifle; extreme stopping power." },

  // ── RANGED WEAPONS: Sniper Rifles ─────────────────────────────────────────

  { name: "Ranger Arms SM-4",     category: "ranged-weapon", subcategory: "sniper rifle",    dv: "8P", ap: -3, modes: "SA",       ammo: 15, recoilComp: 2, availability: "16F", cost: 6200,  description: "Ultra-precision long-range sniper; breaks down for concealment." },
  { name: "Walther MA-2100",      category: "ranged-weapon", subcategory: "sniper rifle",    dv: "7P", ap: -3, modes: "SA",       ammo: 10, recoilComp: 2, availability: "10F", cost: 5000,  description: "Reliable precision semi-auto sniper." },

  // ── RANGED WEAPONS: Shotguns ───────────────────────────────────────────────

  { name: "Mossberg AM-CMDT",     category: "ranged-weapon", subcategory: "shotgun",         dv: "9P(f)", ap: 5, modes: "SA/BF/FA", ammo: 10, recoilComp: 1, availability: "12R", cost: 1000, description: "Combat shotgun; wide damage pattern." },
  { name: "Remington 990",        category: "ranged-weapon", subcategory: "shotgun",         dv: "7P", ap: -1, modes: "SA",        ammo: 8,  availability: "4R",  cost: 550,  description: "Pump-action hunting shotgun; reliable." },

  // ── RANGED WEAPONS: Special ────────────────────────────────────────────────

  { name: "Ares S-III Super Squirt", category: "ranged-weapon", subcategory: "squirt gun",   dv: "chemical", modes: "SA", ammo: 20, availability: 4, cost: 500,  description: "Chemical delivery pistol; payload varies." },
  { name: "Fichetti Pain Inducer",   category: "ranged-weapon", subcategory: "special",      dv: "special",              modes: "SS", availability: "8R", cost: 2000, description: "Directed pain inducer; non-lethal area denial." },
  { name: "Parashield Dart Pistol",  category: "ranged-weapon", subcategory: "dart",         dv: "drug/toxin", ap: -2, modes: "SA", ammo: 5, availability: "6R", cost: 600,  description: "Dart pistol for chemical/tranq delivery." },
  { name: "Parashield Dart Rifle",   category: "ranged-weapon", subcategory: "dart",         dv: "drug/toxin", ap: -2, modes: "SA", ammo: 10, availability: "6R", cost: 1700, description: "Long-range dart rifle; sniper-range tranq delivery." },

  // ── RANGED WEAPONS: Machine Guns ──────────────────────────────────────────

  { name: "Ingram White Knight",  category: "ranged-weapon", subcategory: "light machine gun", dv: "6P", ap: -1, modes: "BF/FA", ammo: 100, recoilComp: 5, availability: "12F", cost: 2000,  description: "Vehicle-portable LMG with integral tripod." },
  { name: "Stoner-Ares M202",     category: "ranged-weapon", subcategory: "light machine gun", dv: "6P", ap: -2, modes: "FA",    ammo: 100, recoilComp: 0, availability: "12F", cost: 4500,  description: "Heavy sustained-fire machine gun." },
  { name: "Ultimax HMG-2",        category: "ranged-weapon", subcategory: "heavy machine gun", dv: "7P", ap: -3, modes: "FA",    ammo: 100, recoilComp: 3, availability: "15F", cost: 7500,  description: "Heavy machine gun; crew-served." },

  // ── RANGED WEAPONS: Assault Cannons ───────────────────────────────────────

  { name: "Panther XXL",          category: "ranged-weapon", subcategory: "assault cannon",   dv: "10P", ap: -5, modes: "SS", ammo: 15, recoilComp: 1, availability: "20F", cost: 5500, description: "Anti-materiel assault cannon; vehicle-killer." },

  // ── RANGED WEAPONS: Launchers ─────────────────────────────────────────────

  { name: "Ares Antioch-2",       category: "ranged-weapon", subcategory: "grenade launcher", dv: "grenade", modes: "SS", ammo: 8,  availability: "8F",  cost: 600,   description: "Single-shot grenade launcher; tube-fed." },
  { name: "ArmTech MGL-12",       category: "ranged-weapon", subcategory: "grenade launcher", dv: "grenade", modes: "SA", ammo: 12, availability: "10F", cost: 2000,  description: "Revolver-style 12-round grenade launcher." },
  { name: "Aztechnology Striker", category: "ranged-weapon", subcategory: "missile launcher", dv: "missile", modes: "SS", ammo: 1,  availability: "10F", cost: 1000,  description: "Single-shot shoulder-fired missile launcher." },
  { name: "Mitsubishi Yakusoku MRL", category: "ranged-weapon", subcategory: "missile launcher", dv: "missile", modes: "SA", ammo: 8, availability: "20F", cost: 12000, description: "Multi-round missile launcher; military hardware." },

  // ── FIREARM ACCESSORIES ───────────────────────────────────────────────────

  { name: "Airburst Link",        category: "firearm-accessory", availability: "6R",  cost: 500,   description: "Programs grenades to airburst at set distance." },
  { name: "Bipod",                category: "firearm-accessory", recoilComp: 2,       availability: 0,     cost: 100,   description: "Folding bipod; +2 RC when deployed prone." },
  { name: "Concealable Holster",  category: "firearm-accessory", availability: 0,     cost: 75,    description: "Deep-concealment holster; reduces detection chance." },
  { name: "Gas-Vent 2 System",    category: "firearm-accessory", recoilComp: 2,       availability: "4R",  cost: 200,   description: "Muzzle compensator; reduces recoil (RC+2)." },
  { name: "Gas-Vent 3 System",    category: "firearm-accessory", recoilComp: 3,       availability: "6R",  cost: 400,   description: "Heavy compensator; reduces recoil (RC+3)." },
  { name: "Gyro Stabilization",   category: "firearm-accessory", recoilComp: 6,       availability: 7,     cost: 3000,  description: "Gyroscopic stabilizer harness; RC+6." },
  { name: "Hidden Gun Arm Slide", category: "firearm-accessory", availability: 4,     cost: 350,   description: "Spring-loaded arm holster; fast draw." },
  { name: "Imaging Scope",        category: "firearm-accessory", availability: 3,     cost: 300,   description: "Optical/electronic scope for ranged fire." },
  { name: "Laser Sight",          category: "firearm-accessory", availability: 2,     cost: 100,   description: "Visible laser aiming device; +1 die aimed." },
  { name: "Periscope",            category: "firearm-accessory", availability: 3,     cost: 50,    description: "Corner-shooting periscope attachment." },
  { name: "Quick-Draw Holster",   category: "firearm-accessory", availability: 4,     cost: 100,   description: "Speed holster; reduces draw action." },
  { name: "Shock Pad",            category: "firearm-accessory", recoilComp: 1,       availability: 2,     cost: 50,    description: "Recoil-absorbing shoulder pad; RC+1." },
  { name: "Silencer",             category: "firearm-accessory", availability: "8F",  cost: 200,   description: "Reduces sound signature; single-use limited." },
  { name: "Smart Firing Platform",category: "firearm-accessory", recoilComp: 4,       availability: "12F", cost: 2000,  description: "Automated stabilized firing mount." },
  { name: "Smartgun System, internal", category: "firearm-accessory", availability: "6R", cost: 0, description: "Built-in smartlink system (weapon cost varies)." },
  { name: "Smartgun System, external", category: "firearm-accessory", availability: "4R", cost: 400, description: "Add-on smartlink system; clips to rail." },
  { name: "Sound Suppressor",     category: "firearm-accessory", availability: "12F", cost: 300,   description: "Full suppressor; near-silent operation." },
  { name: "Spare Clips (10)",     category: "firearm-accessory", availability: 4,     cost: 50,    description: "Ten additional magazines for a specific firearm." },
  { name: "Speed Loader",         category: "firearm-accessory", availability: 2,     cost: 25,    description: "Revolver speed loader; fast reload." },
  { name: "Tripod",               category: "firearm-accessory", recoilComp: 6,       availability: 4,     cost: 300,   description: "Heavy tripod mount; RC+6 when emplaced." },

  // ── AMMUNITION (per 10 rounds) ────────────────────────────────────────────

  { name: "APDS Rounds",          category: "ammo", dv: "-1", ap: -6, availability: "16F", cost: 70,   description: "Armor-piercing discarding sabot; -6 AP." },
  { name: "Assault Cannon Rounds",category: "ammo",                   availability: "16F", cost: 450,  description: "Standard assault cannon ammunition (×10)." },
  { name: "Explosive Rounds",     category: "ammo", dv: "+1",         availability: "8F",  cost: 50,   description: "+1 DV explosive-tipped rounds." },
  { name: "EX-Explosive Rounds",  category: "ammo", dv: "+2", ap: -1, availability: "12F", cost: 100,  description: "+2 DV, -1 AP enhanced explosive rounds." },
  { name: "Flechette Rounds",     category: "ammo", dv: "+2", ap: 5,  availability: "2R",  cost: 100,  description: "+2 DV flechette; lethal unarmored, poor vs. armor." },
  { name: "Gel Rounds",           category: "ammo", dv: "-1", ap: 2,  availability: "4R",  cost: 30,   description: "Non-lethal gel; -1 DV (Stun), +2 AP." },
  { name: "Hollow Point Rounds",  category: "ammo", dv: "+1", ap: 2,  availability: "4R",  cost: 40,   description: "+1 DV, +2 AP; lethal but poor vs. armor." },
  { name: "Injection Darts",      category: "ammo",                   availability: "4R",  cost: 75,   description: "Dart rounds for chemical/drug payload delivery." },
  { name: "Regular Ammo",         category: "ammo",                   availability: "2R",  cost: 20,   description: "Standard full-metal-jacket ammunition." },
  { name: "Stick-n-Shock",        category: "ammo", dv: "6S(e)",      availability: "5R",  cost: 80,   description: "Taser rounds; electrical stun damage." },
  { name: "Tracer Rounds",        category: "ammo",                   availability: "5R",  cost: 75,   description: "Tracer-marked rounds for target spotting." },
  { name: "Taser Dart",           category: "ammo",                   availability: 2,     cost: 50,   description: "Standard taser darts (×10)." },
  { name: "Arrows (10)",          category: "ammo",                   availability: 0,     cost: 50,   description: "Standard arrows for bows." },
  { name: "Injection Arrows (10)",category: "ammo",                   availability: "4R",  cost: 500,  description: "Hollow-tip arrows for chemical/drug delivery." },
  { name: "Crossbow Bolts (10)",  category: "ammo",                   availability: 0,     cost: 50,   description: "Standard crossbow bolts." },
  { name: "Injection Bolts (10)", category: "ammo",                   availability: "4R",  cost: 500,  description: "Hollow-tip bolts for chemical/drug delivery." },

  // ── GRENADES ──────────────────────────────────────────────────────────────

  { name: "Flashbang Grenade",     category: "grenade", dv: "6S", ap: -3,  availability: "6R",  cost: 30,  description: "Flash-bang; 6S Stun to all in 10m radius (-3 AP)." },
  { name: "Flash-Pak",             category: "grenade",                     availability: 4,     cost: 200, description: "Single-use bright flash; blinds sensors." },
  { name: "Fragmentation Grenade", category: "grenade", dv: "12P(f)", ap: 5, availability: "10F", cost: 35, description: "Frag grenade; 12P flechette, -1/m radius." },
  { name: "High Explosive Grenade",category: "grenade", dv: "10P", ap: -2,  availability: "7F",  cost: 45,  description: "HE grenade; 10P, -2/m blast radius." },
  { name: "Gas Grenade",           category: "grenade", dv: "chemical",     availability: 4,     cost: 20,  description: "Chemical agent grenade (payload separate)." },
  { name: "Smoke Grenade",         category: "grenade",                     availability: "4R",  cost: 30,  description: "Dense smoke obscures vision in 10m radius." },
  { name: "Thermal Smoke Grenade", category: "grenade",                     availability: "6R",  cost: 35,  description: "Blocks thermographic vision in 10m radius." },

  // ── ROCKETS & MISSILES ────────────────────────────────────────────────────

  { name: "Anti-Vehicle Rocket",   category: "explosive", dv: "16P",      ap: -6,  availability: "20F", cost: 1000, description: "Anti-vehicle rocket; 16P, -2/-6 AP, -4/m blast." },
  { name: "Fragmentation Rocket",  category: "explosive", dv: "16P(f)",   ap: 5,   availability: "16F", cost: 500,  description: "Frag rocket; 16P(f), -1/m blast." },
  { name: "High Explosive Rocket", category: "explosive", dv: "14P",      ap: -2,  availability: "20F", cost: 750,  description: "HE rocket; 14P, -2/m blast." },

  // ── EXPLOSIVES ────────────────────────────────────────────────────────────

  { name: "Commercial Explosives (1kg)", category: "explosive", availability: "8R",  cost: 100,  description: "Commercial-grade explosive; Rating 3." },
  { name: "Foam Explosives (1kg)",       category: "explosive", availability: "12F", cost: 400,  description: "Foam plastic explosive; shaping-grade. Rating 4–15." },
  { name: "Plastic Explosives (1kg)",    category: "explosive", availability: "16F", cost: 400,  description: "Mil-grade plastic explosive; Rating 4–15." },
  { name: "Detonator Cap",              category: "explosive", availability: "8R",  cost: 75,   description: "Electronic/radio detonator cap." },

  // ── COMMLINKS ─────────────────────────────────────────────────────────────

  { name: "Meta Link",        category: "commlink", response: 1, signal: 2, availability: 0,    cost: 100,  description: "Basic budget commlink; minimal specs." },
  { name: "CMT Clip",         category: "commlink", response: 1, signal: 3, availability: 0,    cost: 300,  description: "Clip-on commlink; popular among low-income users." },
  { name: "Sony Emperor",     category: "commlink", response: 2, signal: 3, availability: 0,    cost: 700,  description: "Mid-range Sony commlink; solid performer." },
  { name: "Renraku Sensei",   category: "commlink", response: 2, signal: 4, availability: 0,    cost: 1000, description: "Renraku student commlink; good signal." },
  { name: "Novatech Airware", category: "commlink", response: 3, signal: 3, availability: 0,    cost: 1250, description: "Novatech mid-tier; good response." },
  { name: "Erika Elite",      category: "commlink", response: 3, signal: 4, availability: 0,    cost: 2500, description: "Erika flagship; popular fashion commlink." },
  { name: "Hermes Ikon",      category: "commlink", response: 4, signal: 3, availability: 0,    cost: 3000, description: "High-end Hermes; runner favorite." },
  { name: "Transys Avalon",   category: "commlink", response: 4, signal: 4, availability: 0,    cost: 5000, description: "Premium Transys commlink; near top-end." },
  { name: "Fairlight Caliban",category: "commlink", response: 4, signal: 5, availability: 0,    cost: 8000, description: "Top-end Fairlight; legendary hacker hardware." },

  // ── OPERATING SYSTEMS ─────────────────────────────────────────────────────

  { name: "Vector Xim",       category: "os", firewall: 1, system: 1, availability: 0,    cost: 200,  description: "Budget OS; minimal security." },
  { name: "Redcap Nix",       category: "os", firewall: 1, system: 2, availability: 0,    cost: 400,  description: "Mid-budget OS." },
  { name: "Renraku Ichi",     category: "os", firewall: 2, system: 2, availability: 0,    cost: 600,  description: "Renraku standard OS." },
  { name: "Mangadyne Deva",   category: "os", firewall: 2, system: 3, availability: 0,    cost: 800,  description: "Corporate-grade OS." },
  { name: "Iris Orb",         category: "os", firewall: 3, system: 3, availability: 0,    cost: 1000, description: "High-end general-use OS." },
  { name: "Novatech Navi",    category: "os", firewall: 3, system: 4, availability: 0,    cost: 1500, description: "Pro-grade Novatech OS; runner standard." },

  // ── ELECTRONICS: Commlink Accessories ─────────────────────────────────────

  { name: "AR Gloves",            category: "electronics", subcategory: "commlink-accessory", availability: 3,     cost: 250,  description: "Gesture-input AR gloves." },
  { name: "Biometric Reader",     category: "electronics", subcategory: "commlink-accessory", availability: 4,     cost: 200,  description: "Fingerprint/retinal reader for commlink auth." },
  { name: "Nanopaste Trodes",     category: "electronics", subcategory: "commlink-accessory", availability: 2,     cost: 100,  description: "Self-adhering neural interface trodes." },
  { name: "Printer",              category: "electronics", subcategory: "commlink-accessory", availability: 0,     cost: 5,    description: "Micro printer for physical document output." },
  { name: "Satellite Link",       category: "electronics", subcategory: "commlink-accessory", availability: 3,     cost: 500,  description: "Satellite uplink; extends comm range globally." },
  { name: "Sim Module",           category: "electronics", subcategory: "commlink-accessory", availability: 3,     cost: 100,  description: "Simulated sensory experience module." },
  { name: "Sim Module (Hot-sim)", category: "electronics", subcategory: "commlink-accessory", availability: "4F",  cost: 250,  description: "Illegal hot-sim module; full-immersion VR." },
  { name: "Simrig",               category: "electronics", subcategory: "commlink-accessory", availability: 3,     cost: 1000, description: "Full-body simsense recording rig." },
  { name: "Skinlink",             category: "electronics", subcategory: "commlink-accessory", availability: 6,     cost: 50,   description: "Body-area network via skin contact." },
  { name: "Subvocal Microphone",  category: "electronics", subcategory: "commlink-accessory", availability: 6,     cost: 50,   description: "Throat mic; picks up subvocalized speech." },
  { name: "Trodes",               category: "electronics", subcategory: "commlink-accessory", availability: 3,     cost: 50,   description: "Neural interface trode set; wired type." },

  // ── ELECTRONICS: Storage & Software ───────────────────────────────────────

  { name: "Datachip",             category: "electronics", subcategory: "storage",   availability: 0,     cost: 1,    description: "Pocket data storage chip; various capacities." },
  { name: "Electronic Paper",     category: "electronics", subcategory: "storage",   availability: 0,     cost: 20,   description: "Flexible digital paper display." },
  { name: "Holo Projector",       category: "electronics", subcategory: "display",   availability: 3,     cost: 200,  description: "Compact holographic projector." },

  // ── ELECTRONICS: RFID Tags ────────────────────────────────────────────────

  { name: "RFID Tag (standard)",  category: "electronics", subcategory: "rfid",      availability: 0,     cost: 1,    description: "Standard RFID tracking/ID tag." },
  { name: "RFID Tag (security)",  category: "electronics", subcategory: "rfid",      availability: 4,     cost: 100,  description: "Encrypted security RFID tag." },
  { name: "RFID Tag (sensor)",    category: "electronics", subcategory: "rfid",      availability: 4,     cost: 500,  description: "RFID tag with environmental sensor payload." },
  { name: "RFID Tag (stealth)",   category: "electronics", subcategory: "rfid",      availability: 6,     cost: 5,    description: "Low-emission stealth RFID; hard to detect." },

  // ── ELECTRONICS: Communications & Countermeasures ─────────────────────────

  { name: "Headjammer Rating 1",  category: "electronics", subcategory: "countermeasure", availability: "6R",  cost: 250,  description: "Personal comm jammer; Rating 1." },
  { name: "Headjammer Rating 3",  category: "electronics", subcategory: "countermeasure", availability: "6R",  cost: 750,  description: "Personal comm jammer; Rating 3." },
  { name: "Headjammer Rating 6",  category: "electronics", subcategory: "countermeasure", availability: "6R",  cost: 1500, description: "Personal comm jammer; Rating 6." },
  { name: "Area Jammer Rating 3", category: "electronics", subcategory: "countermeasure", availability: "9F",  cost: 1500, description: "Area comm jammer; Rating 3, affects all in range." },
  { name: "Area Jammer Rating 6", category: "electronics", subcategory: "countermeasure", availability: "18F", cost: 3000, description: "Area comm jammer; Rating 6." },
  { name: "Directional Jammer Rating 3", category: "electronics", subcategory: "countermeasure", availability: "6F", cost: 1500, description: "Directional comm jammer; Rating 3." },
  { name: "Directional Jammer Rating 6", category: "electronics", subcategory: "countermeasure", availability: "12F", cost: 3000, description: "Directional comm jammer; Rating 6." },
  { name: "Micro-Transceiver Rating 3",  category: "electronics", subcategory: "comms",          availability: 6,     cost: 600,  description: "Miniaturized radio transceiver; Rating 3." },
  { name: "Micro-Transceiver Rating 6",  category: "electronics", subcategory: "comms",          availability: 12,    cost: 1200, description: "Miniaturized radio transceiver; Rating 6." },
  { name: "Tag Eraser",           category: "electronics", subcategory: "countermeasure", availability: "6F",  cost: 150,  description: "Destroys RFID tags; data security tool." },
  { name: "White Noise Generator Rating 3", category: "electronics", subcategory: "countermeasure", availability: 4, cost: 150, description: "Audio masking generator; Rating 3." },
  { name: "White Noise Generator Rating 6", category: "electronics", subcategory: "countermeasure", availability: 7, cost: 300, description: "Audio masking generator; Rating 6." },

  // ── SENSORS: Vision Devices ────────────────────────────────────────────────

  { name: "Binoculars Rating 1",  category: "sensor", subcategory: "vision", availability: 0,     cost: 50,   description: "Basic optical binoculars; 5× mag." },
  { name: "Binoculars Rating 2",  category: "sensor", subcategory: "vision", availability: 2,     cost: 100,  description: "Mid-range binoculars with electronic enhancement." },
  { name: "Binoculars Rating 3",  category: "sensor", subcategory: "vision", availability: 3,     cost: 150,  description: "High-power electronic binoculars." },
  { name: "Camera (trideo)",      category: "sensor", subcategory: "vision", availability: 0,     cost: 100,  description: "Pocket trideo camera; records video/stills." },
  { name: "Contact Lenses Rating 1", category: "sensor", subcategory: "vision", availability: 6,  cost: 50,   description: "Vision-enhanced contact lenses; 1 capacity." },
  { name: "Contact Lenses Rating 2", category: "sensor", subcategory: "vision", availability: 6,  cost: 100,  description: "Vision-enhanced contact lenses; 2 capacity." },
  { name: "Contact Lenses Rating 3", category: "sensor", subcategory: "vision", availability: 6,  cost: 150,  description: "Vision-enhanced contact lenses; 3 capacity." },
  { name: "Glasses Rating 1",     category: "sensor", subcategory: "vision", availability: 0,     cost: 25,   description: "Enhanced AR/vision glasses; 1 capacity." },
  { name: "Glasses Rating 2",     category: "sensor", subcategory: "vision", availability: 0,     cost: 50,   description: "Enhanced AR/vision glasses; 2 capacity." },
  { name: "Glasses Rating 3",     category: "sensor", subcategory: "vision", availability: 0,     cost: 75,   description: "Enhanced AR/vision glasses; 3 capacity." },
  { name: "Glasses Rating 4",     category: "sensor", subcategory: "vision", availability: 0,     cost: 100,  description: "Enhanced AR/vision glasses; 4 capacity." },
  { name: "Goggles Rating 1",     category: "sensor", subcategory: "vision", availability: 0,     cost: 50,   description: "Tactical goggles; 1 capacity." },
  { name: "Goggles Rating 2",     category: "sensor", subcategory: "vision", availability: 0,     cost: 100,  description: "Tactical goggles; 2 capacity." },
  { name: "Goggles Rating 3",     category: "sensor", subcategory: "vision", availability: 0,     cost: 150,  description: "Tactical goggles; 3 capacity." },
  { name: "Goggles Rating 4",     category: "sensor", subcategory: "vision", availability: 0,     cost: 200,  description: "Tactical goggles; 4 capacity." },
  { name: "Goggles Rating 6",     category: "sensor", subcategory: "vision", availability: 0,     cost: 300,  description: "Maximum-capacity tactical goggles." },
  { name: "Mage Sight Goggles",   category: "sensor", subcategory: "vision", availability: "12R", cost: 2000, description: "Goggles that let mundanes see astral signatures." },
  { name: "Endoscope",            category: "sensor", subcategory: "vision", availability: 8,     cost: 250,  description: "Flexible visual probe; under-door or into vents." },
  { name: "Monocle Rating 1",     category: "sensor", subcategory: "vision", availability: 4,     cost: 25,   description: "Enhanced monocle; 1 capacity." },
  { name: "Monocle Rating 2",     category: "sensor", subcategory: "vision", availability: 4,     cost: 50,   description: "Enhanced monocle; 2 capacity." },
  { name: "Monocle Rating 3",     category: "sensor", subcategory: "vision", availability: 4,     cost: 75,   description: "Enhanced monocle; 3 capacity." },
  { name: "Monocle Rating 4",     category: "sensor", subcategory: "vision", availability: 4,     cost: 100,  description: "Enhanced monocle; 4 capacity." },

  // ── SENSORS: Vision Enhancements ──────────────────────────────────────────

  { name: "Flare Compensation",     category: "sensor", subcategory: "vision-enhancement", availability: 2,     cost: 50,   description: "Auto-adjusts for flash/flare; negates blind." },
  { name: "Image Link",             category: "sensor", subcategory: "vision-enhancement", availability: 0,     cost: 25,   description: "AR display overlay for visual devices." },
  { name: "Low-Light Vision",       category: "sensor", subcategory: "vision-enhancement", availability: 4,     cost: 100,  description: "Amplifies ambient light; no darkness penalty." },
  { name: "Smartlink",              category: "sensor", subcategory: "vision-enhancement", availability: "4R",  cost: 500,  description: "Wireless weapon-targeting HUD display." },
  { name: "Thermographic Vision",   category: "sensor", subcategory: "vision-enhancement", availability: 6,     cost: 100,  description: "Sees heat signatures; penetrates light smoke." },
  { name: "Ultrasound Sensor",      category: "sensor", subcategory: "vision-enhancement", availability: 8,     cost: 1000, description: "Echolocation; 'sees' through walls at short range." },
  { name: "Vision Enhancement Rating 1", category: "sensor", subcategory: "vision-enhancement", availability: "4R", cost: 100, description: "+1 Perception dice for visual tests." },
  { name: "Vision Enhancement Rating 2", category: "sensor", subcategory: "vision-enhancement", availability: "4R", cost: 200, description: "+2 Perception dice for visual tests." },
  { name: "Vision Enhancement Rating 3", category: "sensor", subcategory: "vision-enhancement", availability: "4R", cost: 300, description: "+3 Perception dice for visual tests." },
  { name: "Vision Magnification",   category: "sensor", subcategory: "vision-enhancement", availability: 2,     cost: 100,  description: "Optical/electronic zoom; up to 50×." },

  // ── SENSORS: Audio Devices ─────────────────────────────────────────────────

  { name: "Earbuds Rating 1",     category: "sensor", subcategory: "audio", availability: 0,     cost: 10,   description: "Basic audio earbuds; 1 capacity." },
  { name: "Earbuds Rating 2",     category: "sensor", subcategory: "audio", availability: 0,     cost: 20,   description: "Enhanced earbuds; 2 capacity." },
  { name: "Earbuds Rating 3",     category: "sensor", subcategory: "audio", availability: 0,     cost: 30,   description: "High-end earbuds; 3 capacity." },
  { name: "Headphones Rating 1",  category: "sensor", subcategory: "audio", availability: 0,     cost: 50,   description: "Enhanced headphones; 1 capacity." },
  { name: "Headphones Rating 2",  category: "sensor", subcategory: "audio", availability: 0,     cost: 100,  description: "Enhanced headphones; 2 capacity." },
  { name: "Headphones Rating 3",  category: "sensor", subcategory: "audio", availability: 0,     cost: 150,  description: "Enhanced headphones; 3 capacity." },

  // ── SENSORS: Audio Enhancements ───────────────────────────────────────────

  { name: "Audio Enhancement Rating 1", category: "sensor", subcategory: "audio-enhancement", availability: 3,  cost: 100, description: "+1 Perception dice for audio tests." },
  { name: "Audio Enhancement Rating 2", category: "sensor", subcategory: "audio-enhancement", availability: 3,  cost: 200, description: "+2 Perception dice for audio tests." },
  { name: "Audio Enhancement Rating 3", category: "sensor", subcategory: "audio-enhancement", availability: 3,  cost: 300, description: "+3 Perception dice for audio tests." },
  { name: "Select Sound Filter Rating 1", category: "sensor", subcategory: "audio-enhancement", availability: 8, cost: 200, description: "Filters noise; +1 die vs. audio-based disruption." },
  { name: "Select Sound Filter Rating 3", category: "sensor", subcategory: "audio-enhancement", availability: 8, cost: 600, description: "Advanced noise filter; Rating 3." },
  { name: "Select Sound Filter Rating 6", category: "sensor", subcategory: "audio-enhancement", availability: 8, cost: 1200, description: "Maximum audio filtering; Rating 6." },
  { name: "Spatial Recognizer",    category: "sensor", subcategory: "audio-enhancement", availability: 6,     cost: 100,  description: "Directional audio; pinpoints sound sources." },

  // ── SENSORS: Specialized ──────────────────────────────────────────────────

  { name: "Atmosphere Sensor",    category: "sensor", subcategory: "specialized", availability: 2,     cost: 25,   description: "Detects toxic/hazardous atmospheric conditions." },
  { name: "Cyberware Scanner Rating 2", category: "sensor", subcategory: "specialized", availability: "4R", cost: 150, description: "Detects cyberware implants; Rating 2." },
  { name: "Cyberware Scanner Rating 4", category: "sensor", subcategory: "specialized", availability: "4R", cost: 300, description: "Detects cyberware implants; Rating 4." },
  { name: "Directional Microphone",category: "sensor", subcategory: "specialized", availability: 4,     cost: 50,   description: "Parabolic mic; eavesdrop at long range." },
  { name: "Geiger Counter",       category: "sensor", subcategory: "specialized", availability: 4,     cost: 50,   description: "Detects ionizing radiation." },
  { name: "Laser Microphone Rating 3", category: "sensor", subcategory: "specialized", availability: "8R", cost: 150, description: "Reads window vibrations to listen inside rooms." },
  { name: "Laser Range Finder",   category: "sensor", subcategory: "specialized", availability: 8,     cost: 100,  description: "Precise laser distance measurement." },
  { name: "MAD Scanner Rating 1", category: "sensor", subcategory: "specialized", availability: "6R",  cost: 75,   description: "Metal/alloy detector; Rating 1." },
  { name: "MAD Scanner Rating 3", category: "sensor", subcategory: "specialized", availability: "6R",  cost: 225,  description: "Metal/alloy detector; Rating 3." },
  { name: "Motion Sensor",        category: "sensor", subcategory: "specialized", availability: 4,     cost: 50,   description: "Passive motion detection device." },
  { name: "Olfactory Scanner Rating 3", category: "sensor", subcategory: "specialized", availability: 4, cost: 1500, description: "Chemical/scent detection; Rating 3." },
  { name: "Radio Signal Scanner Rating 3", category: "sensor", subcategory: "specialized", availability: "4R", cost: 75, description: "Passive radio frequency scanner; Rating 3." },

  // ── SECURITY: Locks ────────────────────────────────────────────────────────

  { name: "Key Lock Rating 3",    category: "security", subcategory: "lock", availability: 0,     cost: 30,   description: "Standard mechanical key lock; Rating 3." },
  { name: "Key Lock Rating 6",    category: "security", subcategory: "lock", availability: 0,     cost: 60,   description: "High-security mechanical lock; Rating 6." },
  { name: "Maglock Rating 3",     category: "security", subcategory: "lock", availability: 3,     cost: 300,  description: "Electronic maglock; Rating 3." },
  { name: "Maglock Rating 6",     category: "security", subcategory: "lock", availability: 6,     cost: 600,  description: "High-security maglock; Rating 6." },

  // ── SECURITY: B&E Tools ────────────────────────────────────────────────────

  { name: "Autopicker Rating 3",  category: "security", subcategory: "bnb",  availability: "8R",  cost: 600,  description: "Electronic lock-picking device; Rating 3." },
  { name: "Autopicker Rating 6",  category: "security", subcategory: "bnb",  availability: "8R",  cost: 1200, description: "Electronic lock-picking device; Rating 6." },
  { name: "Cellular Glove Molder",category: "security", subcategory: "bnb",  availability: "12F", cost: 200,  description: "Creates duplicate fingerprints from scan." },
  { name: "Chisel",               category: "security", subcategory: "bnb",  availability: 0,     cost: 20,   description: "Pry tool; opens doors/containers." },
  { name: "Keycard Copier Rating 3", category: "security", subcategory: "bnb", availability: "8F", cost: 900, description: "Duplicates proximity/mag-stripe keycards; R3." },
  { name: "Keycard Copier Rating 6", category: "security", subcategory: "bnb", availability: "8F", cost: 1800, description: "Duplicates proximity/mag-stripe keycards; R6." },
  { name: "Lockpick Set",         category: "security", subcategory: "bnb",  availability: "6R",  cost: 300,  description: "Manual lockpicking tools; requires skill." },
  { name: "Maglock Passkey Rating 3", category: "security", subcategory: "bnb", availability: "9F", cost: 6000, description: "Bypasses maglocks up to its rating; Rating 3." },
  { name: "Maglock Passkey Rating 6", category: "security", subcategory: "bnb", availability: "18F", cost: 12000, description: "Bypasses maglocks up to its rating; Rating 6." },
  { name: "Miniwelder",           category: "security", subcategory: "bnb",  availability: 2,     cost: 250,  description: "Compact plasma cutter/welder; cuts through barriers." },
  { name: "Sequencer Rating 3",   category: "security", subcategory: "bnb",  availability: "9F",  cost: 600,  description: "Cracks electronic keypads/cards; Rating 3." },
  { name: "Sequencer Rating 6",   category: "security", subcategory: "bnb",  availability: "18F", cost: 1200, description: "Cracks electronic keypads/cards; Rating 6." },
  { name: "Wire Clippers",        category: "security", subcategory: "bnb",  availability: 0,     cost: 25,   description: "Cuts wire fences, cable locks, etc." },

  // ── SECURITY: Restraints ───────────────────────────────────────────────────

  { name: "Metal Restraints",     category: "security", subcategory: "restraint", availability: 0,     cost: 20,   description: "Standard steel handcuffs." },
  { name: "Plasteel Restraints",  category: "security", subcategory: "restraint", availability: "6R",  cost: 50,   description: "High-strength plasteel cuffs; cyberware-resistant." },
  { name: "Plastic Restraints (10)", category: "security", subcategory: "restraint", availability: 0,  cost: 10,   description: "Zip-tie style plastic restraints; ×10." },
  { name: "Containment Manacles", category: "security", subcategory: "restraint", availability: "6R",  cost: 200,  description: "Heavy-duty manacles; blocks cyberarm movement." },

  // ── DRUGS ─────────────────────────────────────────────────────────────────

  { name: "Cram",       category: "drug", availability: "2R",  cost: 10,   description: "Stimulant; +2 Reaction, +1 Initiative. 8h. Crash: -2 Reaction." },
  { name: "Deepweed",   category: "drug", availability: "8F",  cost: 400,  description: "Astral hallucinogen; enables astral perception in mundanes." },
  { name: "Jazz",       category: "drug", availability: "2R",  cost: 75,   description: "Combat stimulant; +2 Reaction, +3 Initiative. Short duration." },
  { name: "Kamikaze",   category: "drug", availability: "4R",  cost: 100,  description: "Battle drug; massive combat boosts, severe crash." },
  { name: "Long Haul",  category: "drug", availability: 0,     cost: 50,   description: "Stimulant; negates fatigue/sleep need for 24h." },
  { name: "Nitro",      category: "drug", availability: "2R",  cost: 50,   description: "Speed drug; +2 Agility, +2 Reaction, risk of heart failure." },
  { name: "Novacoke",   category: "drug", availability: "2R",  cost: 10,   description: "Stimulant; +1 Charisma, -1 Logic. Highly addictive." },
  { name: "Psyche",     category: "drug", availability: 0,     cost: 200,  description: "Focus drug; +1 die for Logic/Intuition tests. Crash penalty." },
  { name: "Zen",        category: "drug", availability: "4R",  cost: 5,    description: "Calming drug; +1 die for mental composure, -1 Reaction." },

  // ── CHEMICAL AGENTS ───────────────────────────────────────────────────────

  { name: "CS/Tear Gas",          category: "chemical", availability: "4R",  cost: 20,   description: "Tear gas; -2 Perception, -2 Agility while exposed." },
  { name: "Gamma-Scopolamine",    category: "chemical", availability: "14F", cost: 200,  description: "Truth serum; compels honest answers." },
  { name: "Narcoject",            category: "chemical", availability: "8R",  cost: 50,   description: "Knock-out drug; Body test vs. Rating or unconscious." },
  { name: "Nausea Gas",           category: "chemical", availability: "6R",  cost: 25,   description: "Incapacitating nausea agent." },
  { name: "Neuro-Stun VIII",      category: "chemical", availability: "12R", cost: 60,   description: "Nerve agent; high-DV stun toxin." },
  { name: "Pepper Punch",         category: "chemical", availability: 0,     cost: 5,    description: "Capsaicin spray; -2 all actions while in eyes." },
  { name: "Seven-7",              category: "chemical", availability: "20F", cost: 1000, description: "Lethal nerve agent; military-grade chemical weapon." },
  { name: "Glue Sprayer",         category: "chemical", availability: 2,     cost: 150,  description: "Fast-setting adhesive foam; immobilizes target." },
  { name: "Thermite Burning Bar", category: "chemical", availability: "16R", cost: 500,  description: "Burns at extreme temp; melts through metal/barriers." },

  // ── MEDICAL / BIOTECH ─────────────────────────────────────────────────────

  { name: "Biomonitor",           category: "medical", availability: 0,     cost: 300,  description: "Biosigns monitoring wristband; links to medkit." },
  { name: "Disposable Syringe",   category: "medical", availability: 4,     cost: 10,   description: "Single-use sterile injection syringe." },
  { name: "Medkit Rating 1",      category: "medical", availability: 0,     cost: 100,  description: "Basic first-aid kit; Rating 1." },
  { name: "Medkit Rating 3",      category: "medical", availability: 0,     cost: 300,  description: "Standard field medkit; Rating 3." },
  { name: "Medkit Rating 6",      category: "medical", availability: 0,     cost: 600,  description: "Advanced trauma kit; Rating 6." },
  { name: "Medkit Supplies",      category: "medical", availability: 0,     cost: 50,   description: "Replacement supplies for a used medkit." },
  { name: "DocWagon Contract (Basic)",          category: "medical", availability: 0,     cost: 5000,  description: "Basic DocWagon contract; 10-min response." },
  { name: "DocWagon Contract (Gold)",           category: "medical", availability: 0,     cost: 25000, description: "Gold DocWagon; 7-min response, more services." },
  { name: "DocWagon Contract (Platinum)",       category: "medical", availability: 0,     cost: 50000, description: "Platinum DocWagon; 4-min response, trauma team." },
  { name: "DocWagon Contract (Super-Platinum)", category: "medical", availability: 0,     cost: 100000, description: "Super-Platinum; dedicated team, 2-min response." },

  // ── SLAP PATCHES ──────────────────────────────────────────────────────────

  { name: "Antidote Patch Rating 3", category: "medical", subcategory: "patch", availability: 3,     cost: 150,  description: "Counteracts toxins; +Rating dice vs. toxin DV." },
  { name: "Antidote Patch Rating 6", category: "medical", subcategory: "patch", availability: 6,     cost: 300,  description: "Strong antidote patch; Rating 6." },
  { name: "Stimulant Patch Rating 3",category: "medical", subcategory: "patch", availability: 6,     cost: 75,   description: "Stimulant boost; negates 3 boxes of Stun damage temporarily." },
  { name: "Stimulant Patch Rating 6",category: "medical", subcategory: "patch", availability: 12,    cost: 150,  description: "Strong stimulant; negates 6 boxes of Stun temporarily." },
  { name: "Tranq Patch Rating 6",    category: "medical", subcategory: "patch", availability: 12,    cost: 120,  description: "Sedative patch; Body+Willpower vs. Rating or unconscious." },
  { name: "Tranq Patch Rating 10",   category: "medical", subcategory: "patch", availability: 20,    cost: 200,  description: "Maximum-strength tranq; Rating 10." },
  { name: "Trauma Patch",            category: "medical", subcategory: "patch", availability: 2,     cost: 500,  description: "Emergency stabilizer; prevents death, +2 Stabilization." },

  // ── DISGUISES ─────────────────────────────────────────────────────────────

  { name: "Latex Face Mask",          category: "misc", subcategory: "disguise", availability: 8,     cost: 500,  description: "Realistic latex face prosthetic; alters appearance." },
  { name: "Nanopaste Disguise (small)",category: "misc", subcategory: "disguise", availability: 12,    cost: 500,  description: "Nano-paint for full facial/body disguise; small container." },
  { name: "Nanopaste Disguise (large)",category: "misc", subcategory: "disguise", availability: 16,    cost: 1000, description: "Nano-paint disguise; large container, multiple uses." },

  // ── SURVIVAL GEAR ─────────────────────────────────────────────────────────

  { name: "Chemsuit Rating 3",    category: "survival", availability: 6,     cost: 300,  description: "Chemical/biological hazard suit; Rating 3 protection." },
  { name: "Chemsuit Rating 6",    category: "survival", availability: 12,    cost: 600,  description: "Chemical/biological hazard suit; Rating 6 protection." },
  { name: "Climbing Gear",        category: "survival", availability: 0,     cost: 200,  description: "Ropes, harness, carabiners, and pitons." },
  { name: "Diving Gear",          category: "survival", availability: 6,     cost: 2000, description: "Full scuba/rebreather diving equipment set." },
  { name: "Flashlight",           category: "survival", availability: 0,     cost: 25,   description: "Standard battery-powered flashlight." },
  { name: "Gas Mask",             category: "survival", availability: 0,     cost: 200,  description: "Sealed respirator with HEPA filter." },
  { name: "Gecko Tape Gloves",    category: "survival", availability: 12,    cost: 250,  description: "Adhesive gloves for climbing sheer surfaces." },
  { name: "GPS",                  category: "survival", availability: 3,     cost: 200,  description: "Personal GPS navigator." },
  { name: "Hazmat Suit",          category: "survival", availability: 8,     cost: 1000, description: "Full CBRN hazmat suit; full-body sealed protection." },
  { name: "Light Stick",          category: "survival", availability: 0,     cost: 5,    description: "Chemical light stick; 8-hour glow, disposable." },
  { name: "Magnesium Torch",      category: "survival", availability: 0,     cost: 20,   description: "Bright long-burning torch; works underwater." },
  { name: "Micro Flare Launcher", category: "survival", availability: 0,     cost: 50,   description: "Compact flare launcher for signaling." },
  { name: "Micro Flares (10)",    category: "survival", availability: 0,     cost: 25,   description: "Signal flares for micro-launcher; ×10." },
  { name: "Rappelling Gloves",    category: "survival", availability: 0,     cost: 70,   description: "Heat-resistant gloves for rope work." },
  { name: "Respirator Rating 3",  category: "survival", availability: 3,     cost: 75,   description: "Filters airborne toxins; Rating 3." },
  { name: "Respirator Rating 6",  category: "survival", availability: 6,     cost: 150,  description: "Heavy-duty respirator; Rating 6." },
  { name: "Survival Kit",         category: "survival", availability: 4,     cost: 100,  description: "Emergency survival kit; food, water, shelter, first aid." },
  { name: "Grapple Gun",          category: "survival", availability: "8R",  cost: 500,  description: "Fires grapple hook; range 100m." },
  { name: "Catalyst Stick",       category: "survival", availability: "8F",  cost: 120,  description: "Fast-dissolving rope trigger; cuts rope on command." },
  { name: "Microwire (100m)",     category: "survival", availability: 4,     cost: 50,   description: "High-tensile monomolecular wire; 100m spool." },
  { name: "Myomeric Rope (10m)",  category: "survival", availability: 10,    cost: 200,  description: "Shape-memory rope; collapses/extends on signal." },
  { name: "Standard Rope (100m)", category: "survival", availability: 0,     cost: 50,   description: "Durable climbing rope; 100m coil." },
  { name: "Stealth Rope (100m)",  category: "survival", availability: "8F",  cost: 85,   description: "Low-visibility black rope; 100m coil." },

  // ── TOOLS ─────────────────────────────────────────────────────────────────

  { name: "Tool Kit",             category: "tool", availability: 0,     cost: 500,   description: "Portable tools for a single skill; fits in a bag." },
  { name: "Tool Shop",            category: "tool", availability: 8,     cost: 5000,  description: "Workshop tools for a single skill; requires a van or space." },
  { name: "Tool Facility",        category: "tool", availability: 12,    cost: 100000, description: "Full professional facility for a single skill." },

  // ── ID & CREDSTICKS ───────────────────────────────────────────────────────

  { name: "Certified Credstick",      category: "id", availability: 0,     cost: 25,   description: "Anonymous certified digital cash; untraceable." },
  { name: "Fake License Rating 2",    category: "id", availability: "6F",  cost: 200,  description: "Fake professional license; Rating 2." },
  { name: "Fake License Rating 4",    category: "id", availability: "12F", cost: 400,  description: "Fake professional license; Rating 4." },
  { name: "Fake License Rating 6",    category: "id", availability: "18F", cost: 600,  description: "Fake professional license; Rating 6." },
  { name: "Fake SIN Rating 2",        category: "id", availability: "6F",  cost: 2000, description: "Counterfeit System Identification Number; Rating 2." },
  { name: "Fake SIN Rating 4",        category: "id", availability: "12F", cost: 4000, description: "Counterfeit SIN; Rating 4." },
  { name: "Fake SIN Rating 6",        category: "id", availability: "18F", cost: 6000, description: "Counterfeit SIN; Rating 6 (near-perfect)." },

  // ── MAGICAL EQUIPMENT ─────────────────────────────────────────────────────

  { name: "Spellcasting Focus F1",    category: "magical", subcategory: "focus", availability: "4R",  cost: 15000,  description: "Spellcasting focus; Force 1. Adds force dice to spellcasting." },
  { name: "Spellcasting Focus F2",    category: "magical", subcategory: "focus", availability: "8R",  cost: 30000,  description: "Spellcasting focus; Force 2." },
  { name: "Spellcasting Focus F3",    category: "magical", subcategory: "focus", availability: "12R", cost: 45000,  description: "Spellcasting focus; Force 3." },
  { name: "Spellcasting Focus F4",    category: "magical", subcategory: "focus", availability: "16R", cost: 60000,  description: "Spellcasting focus; Force 4." },
  { name: "Counterspelling Focus F1", category: "magical", subcategory: "focus", availability: "4R",  cost: 5000,   description: "Counterspelling focus; Force 1." },
  { name: "Counterspelling Focus F2", category: "magical", subcategory: "focus", availability: "8R",  cost: 10000,  description: "Counterspelling focus; Force 2." },
  { name: "Counterspelling Focus F3", category: "magical", subcategory: "focus", availability: "12R", cost: 15000,  description: "Counterspelling focus; Force 3." },
  { name: "Sustaining Focus F1",      category: "magical", subcategory: "focus", availability: "4R",  cost: 10000,  description: "Sustaining focus; Force 1. Maintains a spell without concentration." },
  { name: "Sustaining Focus F2",      category: "magical", subcategory: "focus", availability: "8R",  cost: 20000,  description: "Sustaining focus; Force 2." },
  { name: "Sustaining Focus F3",      category: "magical", subcategory: "focus", availability: "12R", cost: 30000,  description: "Sustaining focus; Force 3." },
  { name: "Summoning Focus F1",       category: "magical", subcategory: "focus", availability: "4R",  cost: 15000,  description: "Summoning focus; Force 1." },
  { name: "Summoning Focus F2",       category: "magical", subcategory: "focus", availability: "8R",  cost: 30000,  description: "Summoning focus; Force 2." },
  { name: "Summoning Focus F3",       category: "magical", subcategory: "focus", availability: "12R", cost: 45000,  description: "Summoning focus; Force 3." },
  { name: "Banishing Focus F1",       category: "magical", subcategory: "focus", availability: "4R",  cost: 5000,   description: "Banishing focus; Force 1." },
  { name: "Banishing Focus F2",       category: "magical", subcategory: "focus", availability: "8R",  cost: 10000,  description: "Banishing focus; Force 2." },
  { name: "Banishing Focus F3",       category: "magical", subcategory: "focus", availability: "12R", cost: 15000,  description: "Banishing focus; Force 3." },
  { name: "Binding Focus F1",         category: "magical", subcategory: "focus", availability: "4R",  cost: 10000,  description: "Binding focus; Force 1." },
  { name: "Binding Focus F2",         category: "magical", subcategory: "focus", availability: "8R",  cost: 20000,  description: "Binding focus; Force 2." },
  { name: "Binding Focus F3",         category: "magical", subcategory: "focus", availability: "12R", cost: 30000,  description: "Binding focus; Force 3." },
  { name: "Weapon Focus F1",          category: "magical", subcategory: "focus", availability: "5R",  cost: 10000,  description: "Weapon focus; Force 1. Weapon counts as magical." },
  { name: "Weapon Focus F2",          category: "magical", subcategory: "focus", availability: "10R", cost: 20000,  description: "Weapon focus; Force 2." },
  { name: "Weapon Focus F3",          category: "magical", subcategory: "focus", availability: "15R", cost: 30000,  description: "Weapon focus; Force 3." },
  { name: "Power Focus F1",           category: "magical", subcategory: "focus", availability: "5R",  cost: 25000,  description: "Power focus; Force 1. Adds to all Magic tests." },
  { name: "Power Focus F2",           category: "magical", subcategory: "focus", availability: "10R", cost: 50000,  description: "Power focus; Force 2." },
  { name: "Power Focus F3",           category: "magical", subcategory: "focus", availability: "15R", cost: 75000,  description: "Power focus; Force 3." },
  { name: "Spirit Binding Materials F1", category: "magical", subcategory: "supplies", availability: 2, cost: 500,  description: "Ritual binding materials for Force 1 spirit." },
  { name: "Spirit Binding Materials F3", category: "magical", subcategory: "supplies", availability: 6, cost: 1500, description: "Ritual binding materials for Force 3 spirit." },
  { name: "Spirit Binding Materials F6", category: "magical", subcategory: "supplies", availability: 12, cost: 3000, description: "Ritual binding materials for Force 6 spirit." },
  { name: "Magical Lodge Materials F3",  category: "magical", subcategory: "supplies", availability: 6, cost: 1500, description: "Materials to establish a Force 3 magical lodge." },
  { name: "Magical Lodge Materials F6",  category: "magical", subcategory: "supplies", availability: 12, cost: 3000, description: "Materials to establish a Force 6 magical lodge." },
  { name: "Fetish (Combat)",         category: "magical", subcategory: "fetish", availability: "8R",  cost: 200,  description: "Fetish for combat spells; reduces drain." },
  { name: "Fetish (Detection)",      category: "magical", subcategory: "fetish", availability: 2,     cost: 50,   description: "Fetish for detection spells." },
  { name: "Fetish (Healing)",        category: "magical", subcategory: "fetish", availability: 2,     cost: 500,  description: "Fetish for health/healing spells." },
  { name: "Fetish (Illusion)",       category: "magical", subcategory: "fetish", availability: 2,     cost: 100,  description: "Fetish for illusion spells." },
  { name: "Fetish (Manipulation)",   category: "magical", subcategory: "fetish", availability: "6R",  cost: 300,  description: "Fetish for manipulation spells." },

  // ── MATRIX PROGRAMS ───────────────────────────────────────────────────────

  { name: "Analyze Rating 3",        category: "matrix-program", availability: 0,     cost: 150,  description: "Inspects nodes, icons, and IC; Rating 3." },
  { name: "Analyze Rating 6",        category: "matrix-program", availability: 0,     cost: 300,  description: "Inspects nodes, icons, and IC; Rating 6." },
  { name: "Attack Rating 3",         category: "matrix-program", availability: "6R",  cost: 1500, description: "Offensive hacking program; Rating 3." },
  { name: "Attack Rating 6",         category: "matrix-program", availability: "6R",  cost: 3000, description: "Offensive hacking program; Rating 6." },
  { name: "Browse Rating 3",         category: "matrix-program", availability: 0,     cost: 150,  description: "Searches nodes for data; Rating 3." },
  { name: "Browse Rating 6",         category: "matrix-program", availability: 0,     cost: 300,  description: "Searches nodes for data; Rating 6." },
  { name: "Command Rating 3",        category: "matrix-program", availability: 0,     cost: 150,  description: "Controls drones/agents; Rating 3." },
  { name: "Command Rating 6",        category: "matrix-program", availability: 0,     cost: 300,  description: "Controls drones/agents; Rating 6." },
  { name: "Decrypt Rating 3",        category: "matrix-program", availability: 0,     cost: 150,  description: "Cracks encrypted files/IC; Rating 3." },
  { name: "Decrypt Rating 6",        category: "matrix-program", availability: 0,     cost: 300,  description: "Cracks encrypted files/IC; Rating 6." },
  { name: "Edit Rating 3",           category: "matrix-program", availability: 0,     cost: 150,  description: "Edits files on nodes; Rating 3." },
  { name: "Encrypt Rating 3",        category: "matrix-program", availability: 0,     cost: 150,  description: "Encrypts files; Rating 3." },
  { name: "Exploit Rating 3",        category: "matrix-program", availability: "6R",  cost: 1500, description: "Finds and exploits node vulnerabilities; Rating 3." },
  { name: "Exploit Rating 6",        category: "matrix-program", availability: "6R",  cost: 3000, description: "Finds and exploits node vulnerabilities; Rating 6." },
  { name: "Spoof Rating 3",          category: "matrix-program", availability: "6R",  cost: 1500, description: "Spoofs commands to IC and devices; Rating 3." },
  { name: "Spoof Rating 6",          category: "matrix-program", availability: "6R",  cost: 3000, description: "Spoofs commands to IC and devices; Rating 6." },
  { name: "Track Rating 3",          category: "matrix-program", availability: "6R",  cost: 1500, description: "Traces the origin of wireless signals; Rating 3." },

  // ── MISC ──────────────────────────────────────────────────────────────────

  { name: "Flashlight (infrared)",   category: "misc", availability: 4,     cost: 50,   description: "Infrared flashlight; invisible without thermographic vision." },
  { name: "Evidence Eliminator",     category: "misc", availability: "10F", cost: 400,  description: "Destroys forensic traces; nano-solvent spray." },
  { name: "Microtransceiver",        category: "misc", availability: 4,     cost: 100,  description: "Tiny hidden communicator; ear canal sized." },
  { name: "Optical Cable (10m)",     category: "misc", availability: 0,     cost: 10,   description: "Fiber-optic data cable for direct connection." },
  { name: "Plastcuffs (10)",         category: "misc", availability: 0,     cost: 5,    description: "Disposable plastic restraints; 10 pack." },
  { name: "Spray Paint Can",         category: "misc", availability: 0,     cost: 5,    description: "Aerosol spray paint; tag, mark, or obscure." },
  { name: "Stealth Tags (10)",       category: "misc", availability: "6F",  cost: 50,   description: "RFID tags with low-signature; 10 pack." },
];

// ─────────────────────────────────────────────────────────────────────────────

/** Look up a gear entry by case-insensitive exact name. */
export function lookupGear(name: string): IGearCatalogueEntry | null {
  const lower = name.toLowerCase();
  return GEAR_CATALOGUE.find((e) => e.name.toLowerCase() === lower) ?? null;
}

/** All unique gear categories present in the catalogue. */
export function gearCategories(): GearCategory[] {
  return [...new Set(GEAR_CATALOGUE.map((e) => e.category))];
}

/** Filter catalogue by category (case-insensitive). */
export function gearByCategory(cat: string): IGearCatalogueEntry[] {
  return GEAR_CATALOGUE.filter((e) => e.category === cat.toLowerCase());
}

/**
 * Maximum number of rows returned when the catalogue is displayed without
 * a category filter. Prevents flooding the player's terminal with 350+ lines
 * when +gear/catalog is called with no argument.
 */
export const MAX_CATALOG_UNFILTERED_ROWS = 40;

/**
 * Return at most MAX_CATALOG_UNFILTERED_ROWS entries from a list.
 * Used by gear-cmd.ts to guard unfiltered catalogue output.
 */
export function safeCatalogSlice(list: IGearCatalogueEntry[]): IGearCatalogueEntry[] {
  return list.slice(0, MAX_CATALOG_UNFILTERED_ROWS);
}
