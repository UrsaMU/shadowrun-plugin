# PLAN.md — Shadowrun 4E 20th Anniversary Plugin for UrsaMU

## Current Status — **v0.2.0 — Gear Catalogue + Security Hardening**

| Feature | Command(s) | Tests | Status |
|---|---|---|---|
| Character generation (400 BP) | `+chargen` (10 switches) | 40+ cases | ✅ Done |
| Character sheet display | `+sheet` | Inline | ✅ Done |
| Dice pool rolling | `+roll [/edge]` | 34 cases | ✅ Done |
| Condition monitor damage | `+damage [/stun]` | 14 cases | ✅ Done |
| REST: read own character | `GET /api/v1/shadowrun/char/<id>` | 6 cases | ✅ Done |
| Security hardening (H1, H2, M1, L1) | REST, rolls, prototype poison | 4 exploit tests | ✅ Done |
| Contacts | `+contact` (5 switches) | 25+ cases | ✅ Done |
| Initiative | `+init [/edge] [/manual]` | 18 cases | ✅ Done |
| Karma advancement | `+karma` (9 switches) | 55 cases | ✅ Done |
| Healing | `+heal` (6 switches) | 22 cases | ✅ Done |
| Run management | `+run` (9 switches) | 30+ cases | ✅ Done |
| Dice log | `+rolllog` | 25+ cases | ✅ Done |
| Gear catalogue (~350 items) | `+gear` (7 switches incl. /info, /catalog) | — | ✅ Done |
| Gear → auto armor/RC derivation | `+gear/add`, `/remove` | — | ✅ Done |
| Security hardening (M-G1, M-G2, M-C1, L-G1, L-G2) | Gear/contact poison + armor cap + catalog flood | 5 exploit tests | ✅ Done |

**Test count: 196 tests / 940 steps — all green.**

**Current `IShadowrunChar` schema:**

```typescript
interface IShadowrunChar {
  id: string; playerId: string; playerName: string; metatype: string;
  attrs: Record<string, number>;
  skills: Record<string, ICharSkill>;
  qualities: ICharQuality[];
  contacts: ICharContact[];
  karmaAvailable: number; karmaTotal: number; karmaLog: IKarmaLogEntry[];
  firstAidApplied: boolean;
  nuyen: number; physicalDmg: number; stunDmg: number;
  chargenState: "draft" | "submitted" | "approved";
}
```

---

## Revised Build Order — Book-Complete Target

**Revised rationale:** The original plan deferred combat resolution and cyberware in favour of
scene-management tooling. The gap analysis against the SR4A rulebook revealed that without
combat resolution, wound modifiers, and cyberware, no archetype can play through a fight
mechanically. The revised order prioritises playability by archetype:

1. **P4-A / P4-B** (Gear + Nuyen) — low complexity, unblock chargen completeness
2. **P5-A** (Combat Resolution) — opposed tests, armor, damage resistance, wound modifiers
3. **P5-B** (Cyberware/Bioware) — Essence, implants, Wired Reflexes with real +d6
4. **P4-C** (Magic Track) — spells, drain, traditions; depends on P2-C karma ✅
5. **P5-C** (Spirits + Astral) — conjuring, binding, astral projection; depends on P4-C
6. **P5-D** (Adept Powers) — power point system, full power catalog; depends on P4-C
7. **P5-E** (Matrix / Hacking) — commlinks, personas, nodes, IC, cybercombat, technomancers
8. **P5-F** (Vehicles / Rigging) — vehicle stats, pilot tests, drone control, jump-in
9. **P6-A** (Initiation / Submersion) — grade-based advancement, echoes, metamagics
10. **P6-B** (Reputation + Lifestyle) — Street Cred, Notoriety, lifestyle costs
11. **P6-C** (Contact Mechanics) — legwork extended tests, networking, favor ratings
12. **P6-D** (Knowledge + Language Skills) — separate skill track, no BP cap
13. **P6-E** (Availability + Black Market) — gear acquisition tests via contacts
14. **P6-F** (Extended + Teamwork Tests) — multi-roll accumulation, secondary contributors
15. **P6-G** (Critters + NPC Stats) — enemy stat blocks for staff use
16. **P6-H** (Toxins + Drugs) — body resistance, addiction track
17. **P6-I** (Weapon + Armor Database) — full SR4A gear stat tables baked into chargen

---

## P4-A: Gear Tracking (`+gear`)

### Commands

| Command | Args | Lock | Description |
|---|---|---|---|
| `+gear` | _(none)_ | connected | List your gear |
| `+gear/add <Name>=<qty>` | name, qty | connected | Add gear item |
| `+gear/remove <Name>` | name | connected | Remove a gear item |
| `+gear/set <Name>=<qty>` | name, qty | connected | Set quantity on existing item |
| `+gear/note <Name>=<text>` | name, text | connected | Add a note to a gear item |
| `+gear/view <player>` | player name | admin | Staff: view another player's gear |

### DB Schema Addition

```typescript
export interface IGearItem {
  name: string;       // max 80 chars
  quantity: number;   // positive integer
  note?: string;      // max 200 chars
}

// Add to IShadowrunChar:
gear: IGearItem[];   // default []
```

### New Files

- `src/sr4/gear.ts` — `validateGearName()`, `validateQuantity()`
- `src/gear-cmd.ts`
- `tests/gear.test.ts`

### Dependencies

None.

---

## P4-B: Nuyen Transfers (`+pay`)

### Commands

| Command | Args | Lock | Description |
|---|---|---|---|
| `+pay <player>=<amount>` | player, amount | connected | Transfer nuyen to another player |
| `+pay/set <player>=<amount>` | player, amount | admin | Staff: set a player's nuyen directly |
| `+pay/log` | _(none)_ | connected | Show own nuyen transaction log |

### DB Schema Addition

```typescript
export interface INuyenLogEntry {
  timestamp: number;
  delta: number;              // negative = sent, positive = received
  counterparty?: string;      // playerName or "Staff"
  reason?: string;            // max 200 chars
}

// Add to IShadowrunChar:
nuyenLog: INuyenLogEntry[];  // default []
```

### Pure Functions

```typescript
validateTransfer(senderNuyen: number, amount: number): string | null
  // amount: positive integer; amount ≤ senderNuyen; amount ≤ 10_000_000
```

### New Files

- `src/pay-cmd.ts`
- `tests/pay.test.ts`

### Dependencies

None.

---

## P4-C: Magic Track (Awakened Chargen + Play)

### Overview

Magician/Mystic Adept chargen track, spell management, tradition selection, drain resistance,
and magic attribute advancement. Adept powers are in P5-D. Spirits/astral in P5-C.

**SR4 rules scope:**
- Magician quality (15 BP): spells, spirits, astral perception
- Mystic Adept quality (15 BP): treated as Magician for spells; power points split is P5-D
- Magic attribute: 1–6 natural max, purchased at 10 BP/point above racial min; karma cost = new rating × 5
- Tradition: Hermetic (drain = Logic + Willpower) or Shaman (drain = Charisma + Willpower)
- Spells: 3 BP each during chargen; no hard cap (limited by BP budget)
- Drain: `max(ceil(Force/2), 2)` boxes; resisted by `drainAttr + Willpower` dice; Stun unless Force > drainAttr (then Physical)
- Drain resistance uses `+roll` dice pool (hits reduce drain)
- Magic Loss: tracked as `magicLoss` field; decremented by Essence loss from cyberware (wired in P5-B)

### New Chargen Switches

| Switch | Args | Description |
|---|---|---|
| `+chargen/tradition <type>` | Hermetic\|Shaman | Set magical tradition (requires Magician or Mystic Adept quality) |
| `+chargen/spell <Name>` | spell name | Add a spell during chargen (3 BP each) |
| `+chargen/spell/remove <Name>` | spell name | Remove a spell from draft |

### New Commands

| Command | Args | Lock | Description |
|---|---|---|---|
| `+drain <force>` | force (integer) | connected | Roll drain resistance after casting |
| `+magic` | _(none)_ | connected | Show magic-specific sheet section |

### DB Schema Addition

```typescript
export interface ISpell {
  name: string;       // max 60 chars, from SPELL_LIST lookup
  category: "Combat" | "Detection" | "Health" | "Illusion" | "Manipulation";
  type: "mana" | "physical";
  range: "LOS" | "LOS(A)" | "T" | "Special";
  damage?: "P" | "S";     // Combat spells only
  dvBase: number;         // Drain Value base (integer)
  dvPerForce: number;     // 0 | 0.5 | 1 — stored as number, DV = ceil(Force * dvPerForce) + dvBase
  notes?: string;
}

// Add to IShadowrunChar:
tradition?: "Hermetic" | "Shaman";
spells: ISpell[];          // default []
magicLoss: number;         // default 0; decremented by Essence loss
```

### Pure Functions — `src/sr4/magic.ts`

```typescript
isAwakened(char): boolean
traditionLinkedAttr(char): string | null   // "Logic" | "Charisma" | null
drainPool(char): number                    // drainAttr + Willpower
calcDrainDv(force, drainAttrValue): { dv: number; type: "physical"|"stun" }
spellBP(spells): number                    // spells.length * 3
```

### Dependencies

P2-C (karma, for Magic attribute advancement) — ✅ done.

---

## P5-A: Combat Resolution

### Overview

The core fight loop that every archetype depends on. Implements the SR4A opposed test chain
(attack vs. defence), armor penetration, damage resistance, and wound modifiers. Also adds
the full initiative-pass structure (not just rolling the number).

**SR4A rules (pp. 136–169):**
- **Attack test**: attacker rolls `Skill + Agility` (ranged) or `Skill + Strength` (melee);
  net hits added to weapon's base DV
- **Defence test**: defender rolls `Reaction + Intuition` (ranged) or `Reaction + Intuition`
  (melee, or `close combat skill + Reaction` if active defence declared)
- **Damage**: `baseDV + netHits` vs. armour/AP modifier — if DV > modified armour, damage
  type is Physical; else Stun
- **Resistance test**: `Body + modified armour rating` (physical) or `Body` (stun, no armour);
  each hit reduces DV by 1
- **Wound modifiers**: −1 to all dice pools per 3 boxes filled on *either* condition monitor
- **Recoil**: cumulative −1 per shot beyond the first in the same action (semi-auto, burst, full-auto)

### New Commands

| Command | Args | Lock | Description |
|---|---|---|---|
| `+attack <target>=<weapon>` | target, weapon shortname | connected | Resolve a ranged or melee attack |
| `+attack/full <target>=<weapon>` | target, weapon | connected | Full defence declared by target |
| `+woundmod` | _(none)_ | connected | Show current wound modifier |

### DB Schema Additions

```typescript
// Add to IShadowrunChar:
armorRating: number;          // sum of all worn armour (default 0)
armorImpact: number;          // impact armour (default 0)
recoilComp: number;           // recoil compensation (default 0)
recoilAccum: number;          // accumulated recoil this combat turn (default 0; reset each turn)
```

### Pure Functions — `src/sr4/combat.ts`

```typescript
woundModifier(char): number
  // -floor((physicalDmg + stunDmg) / 3)

resolveAttack(attacker, defender, weapon, attackDice, defenceDice): ICombatResult
  // returns { netHits, finalDV, damageType, resisted, appliedDmg }

armorVsAP(armorRating: number, ap: number): number
  // max(0, armorRating + ap)  — AP is negative for most weapons

damageType(finalDV: number, modifiedArmor: number): "physical" | "stun"
  // finalDV > modifiedArmor → physical; else stun
```

### New Files

- `src/sr4/combat.ts` — pure combat functions
- `src/attack-cmd.ts`
- `tests/combat.test.ts`

### Integration Points

- `src/damage-cmd.ts` — `applyPhysical()`/`applyStun()` already exist; `+attack` calls them
- `src/roll-cmd.ts` — `+attack` reuses `rollPool()` for attack and defence dice
- Wound modifier: applied in `+roll` output as a displayed modifier; no auto-deduction
  (player self-declares, staff adjudicates)

### Dependencies

P1 dice pool ✅, P1 damage ✅.

---

## P5-B: Cyberware / Bioware

### Overview

Essence tracking, implant management, and all downstream effects: wound modifier changes,
Wired Reflexes granting real +1d6 per rating, magic penalty from Essence loss.

**SR4A rules (pp. 329–358):**
- Every implant has an Essence cost; max Essence = 6; reaching 0 = death
- Cyberware grades: Standard / Alpha (×0.9) / Beta (×0.8) / Delta (×0.7)
- Bioware grades: Standard / Cultured (×0.9) / Alpha (×0.8)
- Magic penalty: floor(6 − currentEssence) points deducted from Magic attribute
- Wired Reflexes 1/2/3: +1/+2/+3 initiative dice (real d6s, not just a bonus to sum)
- Synaptic Booster 1/2/3: +1/+2/+3 initiative dice (stacks with Wired Reflexes up to +4d6 total)

### New Commands

| Command | Args | Lock | Description |
|---|---|---|---|
| `+cyber` | _(none)_ | connected | List installed cyberware/bioware |
| `+cyber/install <item>=<grade>` | item, grade | admin | Install implant (staff action) |
| `+cyber/remove <item>` | item | admin | Remove implant |

### DB Schema Additions

```typescript
export interface IImplant {
  name: string;
  category: "cyberware" | "bioware";
  grade: "standard" | "alpha" | "beta" | "delta" | "cultured";
  essenceCost: number;      // base cost * grade multiplier, rounded to 2 dp
  notes?: string;
}

// Add to IShadowrunChar:
implants: IImplant[];       // default []
essence: number;            // default 6; recomputed from implants on change
initDiceBonus: number;      // extra d6s from Wired Reflexes/Synaptic Booster; default 0
```

### Pure Functions — `src/sr4/cyberware.ts`

```typescript
calcEssence(implants): number        // 6 − sum(essenceCost), min 0
magicPenalty(essence): number        // max(0, floor(6 − essence))
gradeCostMultiplier(grade): number   // standard=1, alpha=0.9, beta=0.8, delta=0.7, cultured=0.9
initDiceFromImplants(implants): number  // sum Wired Reflexes + Synaptic Booster (cap 4)
```

### Integration Points

- `src/init-cmd.ts` — `initFromSheet()` reads `char.initDiceBonus`, passes to `rollInitiative(attrSum, 1 + initDiceBonus)`
- `src/sr4/magic.ts` — `drainPool()` accounts for magic penalty from Essence loss
- `src/sheet-cmd.ts` — add CYBERWARE section + Essence display

### Dependencies

P1 damage ✅, P4-C magic (for magic penalty interaction).

---

## P5-C: Spirits + Astral

### Overview

Conjuring, spirit management, and astral space. Requires P4-C (magic attribute, traditions).

**SR4A rules (pp. 183–209):**
- **Summoning**: `Summoning + Magic` (threshold = spirit Force); net hits = services owed
- **Drain from summoning**: `Force − hits` Stun damage; resisted by Willpower + Charisma (shaman) or Willpower + Logic (hermetic)
- **Binding**: Extended opposed test; binds spirit into permanent service; costs 1 Karma
- **Banishing**: Opposed `Banishing + Magic` vs. spirit's `Force × 2`
- **Spirit types by tradition**: Hermetic → Air/Earth/Fire/Water/Man; Shaman → Beasts/Elements/Man
- **Astral Perception**: Magicians can shift to astral (free action); see auras, signatures
- **Astral Projection**: Full body separation; astral form travels; physical body vulnerable
- **Assensing**: `Assensing + Intuition` to read aura for health/magic/emotion information
- **Astral Combat**: `Magic + Willpower` vs target `Magic + Willpower`; each net hit = Force/2 Stun
- **Astral Signatures**: Left for `Force ÷ 2` hours after any magical action

### New Commands

| Command | Args | Lock | Description |
|---|---|---|---|
| `+summon <type>=<force>` | spirit type, force | connected | Roll summoning test |
| `+banish <spirit>` | spirit name/id | connected | Roll banishing test |
| `+astral` | _(none)_ | connected | Toggle astral perception on/off |
| `+assense <target>` | player or object | connected | Roll assensing test |

### DB Schema Additions

```typescript
export interface ISpiritRecord {
  id: string;
  type: string;
  force: number;
  services: number;       // remaining services owed
  bound: boolean;
  summonedBy: string;     // playerId
  summonedAt: number;
}

// Add to IShadowrunChar:
astrally: boolean;        // currently in astral perception mode; default false
spirits: ISpiritRecord[]; // active/bound spirits; default []
```

### Dependencies

P4-C magic ✅ required.

---

## P5-D: Adept Powers

### Overview

Power point system for physical adepts. Adept quality (5 BP) purchased in chargen; power
points = Magic attribute; powers cost 0.25–2 PP each.

**SR4A rules (pp. 178–182):**
- Power Points = Magic rating
- Powers purchased from catalog; fractions stored as exact values (×4 integer internally)
- Permanently active unless otherwise noted
- Advancement: raise Magic → gain power points; spend karma same as other attrs (new rating × 5)

### New Chargen Switch

```
+chargen/power <PowerName>    Add an adept power (draft only; requires Adept or Mystic Adept quality)
+chargen/power/remove <Name>  Remove a power from draft
```

### New Command

```
+powers    List your adept powers and remaining power point balance
```

### DB Schema Addition

```typescript
export interface IAdeptPower {
  name: string;       // from ADEPT_POWER_LIST lookup
  ppCost: number;     // stored as exact decimal (e.g. 0.5, 0.25, 1.0, 2.0)
  rating?: number;    // for rated powers (e.g. Improved Attribute 1–4)
  notes?: string;
}

// Add to IShadowrunChar:
adeptPowers: IAdeptPower[];   // default []
```

### Pure Functions — `src/sr4/adept.ts`

```typescript
powerPointsUsed(powers): number    // sum of ppCost
powerPointsAvailable(char): number // char.attrs["Magic"] − powerPointsUsed − magicPenalty
validateAddPower(char, power): string | null
```

### Dependencies

P4-C (Magic attribute) ✅.

---

## P5-E: Matrix / Hacking

### Overview

The largest single subsystem. Full Matrix gameplay for hackers and technomancers.

**SR4A rules (pp. 212–285):**
- Every device has: Firewall, Response, Signal, System attributes (1–6)
- Commlink is hub; all player devices form a PAN
- **Hacking**: `Hacking + Logic` vs. node Firewall; gain access, steal data, crash systems
- **Cybercombat**: `Cybercombat + Logic` vs. IC `Pilot + Firewall`; each net hit = Stun to persona
- **Matrix damage**: Persona has a Condition Monitor (8 + System/2 boxes)
- **Programs**: Armor, Attack, Stealth, Exploit, Spoof, Analyze, Browse, Decrypt (+dozens more)
- **Technomancer**: Uses Resonance instead of programs; compiles sprites (like spirits); complex forms instead of programs; Fading instead of Drain
- **IC types**: Probe (detect), Trace (locate), Black IC (attack), Killer (attack), Scramble (crash), etc.
- **Security alerts**: Passive Alert → Active Alert → Shutdown/Trace

### New Commands

| Command | Args | Lock | Description |
|---|---|---|---|
| `+hack <node>=<action>` | node, action | connected | Perform a matrix action |
| `+node` | _(none)_ | connected | Show current matrix location |
| `+matrix` | _(none)_ | connected | Show commlink stats + programs |
| `+compile <type>=<force>` | sprite type, force | connected | Technomancer: compile sprite |
| `+thread <form>=<force>` | complex form, force | connected | Technomancer: thread a form |

### DB Schema Additions

```typescript
export interface ICommlink {
  model: string;
  firewall: number; response: number; signal: number; system: number;
  programs: string[];   // active program names
}

export interface IComplexForm {
  name: string;
  rating: number;
}

// Add to IShadowrunChar:
commlink?: ICommlink;
resonance?: number;           // Technomancer only; default undefined
complexForms?: IComplexForm[]; // Technomancer only; default []
```

### Dependencies

P1 dice pool ✅, P5-B cyberware (implant datajacks affect Matrix stats).

---

## P5-F: Vehicles / Rigging

### Overview

Vehicle stats, pilot tests, drone management, and rigger jump-in.

**SR4A rules (pp. 143–145, 166–168, 286–328):**
- Vehicles have: Handling, Accel, Speed, Pilot, Body, Armor, Sensor, Avail, Cost
- **Pilot test**: `Pilot skill + Reaction` vs. threshold (based on maneuver difficulty)
- **Gunnery test**: `Gunnery + appropriate attr` vs. target defence
- **Jump-in**: Rigger with Control Rig implant VR-controls vehicle; uses vehicle senses
- **Drone autosofts**: Skill programs that let drones act semi-autonomously
- **Vehicle damage**: Armour absorbs; Body for resistance test; separate condition monitor

### New Commands

| Command | Args | Lock | Description |
|---|---|---|---|
| `+vehicle` | _(none)_ | connected | List your vehicles/drones |
| `+vehicle/add <Name>=<type>` | name, type | admin | Register vehicle to player |
| `+pilot <maneuver>/<threshold>` | maneuver, threshold | connected | Roll pilot test |
| `+gunnery <pool>/<threshold>` | pool, threshold | connected | Roll gunnery test |

### DB Schema Additions

```typescript
export interface IVehicle {
  id: string;
  name: string;
  type: "ground" | "air" | "water" | "drone";
  handling: number; accel: number; speed: number;
  pilot: number; body: number; armor: number; sensor: number;
  physicalDmg: number;
  ownerId: string;
}

// Add to IShadowrunChar:
vehicles: IVehicle[];   // default []
```

### Dependencies

P1 dice pool ✅, P5-B (Control Rig implant for jump-in).

---

## P6-A: Initiation / Submersion

### Overview

Grade-based advancement system that raises the cap on Magic or Resonance beyond 6.
Each grade costs `10 × newGrade` karma and grants a metamagic ability or Echo.

**SR4A rules (pp. 198–200, 268–270):**
- Initiation Grade: costs 10 × (grade) karma; raises Magic max cap by 1
- Submersion Grade: same, raises Resonance max cap by 1
- Each grade grants one metamagic/Echo: Centering, Masking, Shielding, Anchoring, Reflexion, etc.
- Requires lodge or mentor spirit (flavor; no mechanical gating in plugin)

### DB Schema Additions

```typescript
// Add to IShadowrunChar:
initiationGrade: number;       // default 0
submersionGrade: number;       // default 0
metamagics: string[];          // list of learned metamagic/echo names; default []
```

### New Command

```
+initiate    Pay karma to advance initiation grade
+submerse    Pay karma to advance submersion grade (technomancer)
```

### Dependencies

P4-C magic ✅, P5-E matrix (for submersion).

---

## P6-B: Reputation + Lifestyle

### Overview

Street Cred, Notoriety, and Public Awareness tracked on character. Lifestyle tier affects
monthly nuyen costs, which can be deducted via `+lifestyle/pay` at session end.

**SR4A rules (pp. 276–278):**
- Street Cred: earned from run completions; +1 per successful run
- Notoriety: earned from bad acts; +1 per incident
- Public Awareness: celebrity level
- Lifestyle: Street 40¥ / Squatter 100¥ / Low 500¥ / Middle 2,000¥ / High 5,000¥ / Luxury 10,000¥

### DB Schema Additions

```typescript
// Add to IShadowrunChar:
streetCred: number;          // default 0
notoriety: number;           // default 0
publicAwareness: number;     // default 0
lifestyle: "street" | "squatter" | "low" | "middle" | "high" | "luxury";  // default "low"
```

### New Command

```
+lifestyle              Show current lifestyle and monthly cost
+lifestyle/set <tier>   Change lifestyle tier (admin or self; nuyen deducted)
+rep                    Show reputation stats
```

### Dependencies

P4-B nuyen ✅.

---

## P6-C: Contact Mechanics

### Overview

Full contact-usage rules: legwork (extended tests), networking (arrange meetings), swag
(acquire gear), and favor ratings. Contacts are already stored; this adds the dice mechanics.

**SR4A rules (pp. 104–107):**
- **Availability check**: contact available if 1d6 ≥ Connection rating
- **Legwork**: Extended test `Charisma + Connection` (threshold = info difficulty, interval = 1 hr)
- **Networking**: Arrange meeting with NPC (`Connection + Charisma` vs. NPC importance)
- **Swag**: Contact adds `Connection` dice to acquisition/fencing test
- **Favor ratings**: 1 (minor) → 6 (major risk); Loyalty sets willingness ceiling

### New Command

```
+legwork <contact>=<topic>/<threshold>   Roll legwork extended test
+favor <contact>=<rating> <request>      Request a favor (staff logs)
```

### Dependencies

P2-A contacts ✅.

---

## P6-D: Knowledge + Language Skills

### Overview

Separate skill track from active skills. Knowledge skills don't cost BP (free); Language
skills cost 2 BP per rating. Both are post-chargen advanceable at `new rating × 1` karma.

**SR4A rules (pp. 115–116):**
- Knowledge skills: academic, street, professional, interests — GM-adjudicated use
- Language skills: native language is free; additional languages cost 2 BP each
- Advancement: `new rating × 1` karma (cheaper than active skills)

### DB Schema Addition

```typescript
// Add to ICharSkill (extend existing):
// OR use a separate map:
knowledgeSkills: Record<string, { rating: number; category: "academic" | "street" | "professional" | "interest" }>;
languages: Record<string, { rating: number }>;
```

### Dependencies

P2-C karma ✅.

---

## P6-E: Availability + Black Market

### Overview

Gear acquisition test system. Restricted and forbidden items require an Availability test
via contacts or black market. Determines how long it takes to source items.

**SR4A rules (pp. 314–315):**
- Availability rating: standard / restricted / forbidden
- Acquisition test: `Negotiation + Charisma` (extended, interval = 1 day, threshold = availability ÷ 2)
- Contact with correct specialization adds dice
- Fencing (selling stolen goods): similar test at reduced nuyen value

### New Command

```
+acquire <item>=<availability>   Start acquisition test (logged; staff resolves)
```

### Dependencies

P4-A gear ✅, P4-B nuyen ✅, P6-C contacts.

---

## P6-F: Extended + Teamwork Tests

### Overview

Multi-roll resolution for tasks that take time. Teamwork for secondary characters assisting.

**SR4A rules (pp. 59–61):**
- **Extended test**: roll `skill + attr` repeatedly; accumulate hits; stop when hits ≥ threshold or limit reached
- **Teamwork**: primary rolls normally; each helper rolls same pool; each helper's single hit = +1 bonus die to primary (max = highest helper's skill rating)
- `+extend <pool>/<threshold>/<interval>` tracks accumulated hits across rolls

### New Command

```
+extend <pool>/<threshold>/<interval>   Begin/continue an extended test
+teamwork <pool>                        Roll teamwork contribution dice
```

### Dependencies

P1 dice pool ✅.

---

## P6-G: Critter + NPC Stats

### Overview

Staff-facing stat block system. Create and store NPCs/critters. Use combat commands against them.

### DB Schema (new collection)

```typescript
export interface INPC {
  id: string;
  name: string;
  attrs: Record<string, number>;
  skills: Record<string, number>;
  armor: number;
  physicalDmg: number; stunDmg: number;
  powers?: string[];        // critter power names
  notes?: string;
}
```

### New Commands (admin only)

```
+npc/create <name>          Create a blank NPC stat block
+npc/set <name> <field>=<v> Set a stat on an NPC
+npc/list                   List active NPCs in scene
+npc/roll <name> <pool>     Roll dice for an NPC
```

### Dependencies

P5-A combat ✅.

---

## P6-H: Toxins + Drugs

### Overview

Substance resistance tests, duration tracking, and addiction system.

**SR4A rules (pp. 259–264):**
- Toxin: `Body (+ armour for contact/injection)` vs. `Power` threshold; each net hit reduces effect
- Effect types: Nausea, Stun, Physical, Confusion (varies by substance)
- Addiction: `Willpower` vs. `Addiction Rating`; on fail, addiction trait added to character
- Drugs: stat modifiers (positive/negative), duration in rounds/minutes

### DB Schema Addition

```typescript
// Add to IShadowrunChar:
addictions: string[];    // substance names; default []
```

### New Command

```
+toxin <power>/<vector>   Roll toxin resistance (Body vs. Power)
```

### Dependencies

P1 damage ✅, P5-A combat for integration.

---

## P6-I: Weapon + Armor Database

### Overview

Bake the full SR4A gear stat tables into chargen so players can pick items by name and have
DV, AP, availability, and cost auto-populated. Replaces the current free-text gear tracking.

**Scope:** ~200 weapons + ~60 armor entries from SR4A pp. 315–345.

### Data File

```typescript
// src/sr4/weapons.ts — exported lookup table
export interface IWeaponStat {
  name: string;
  category: string;         // Pistol, SMG, Assault Rifle, etc.
  dv: number;               // base DV
  ap: number;               // armor penetration (negative = penetrates)
  mode: string;             // SA, SA/BF, SA/BF/FA, etc.
  rc: number;               // recoil compensation
  ammo: number;
  avail: string;            // e.g. "4R", "12F"
  cost: number;
}

// src/sr4/armor.ts — exported lookup table
export interface IArmorStat {
  name: string;
  ballistic: number;
  impact: number;
  avail: string;
  cost: number;
}
```

### Integration Points

- `src/chargen-cmd.ts` — `+chargen/gear <name>` looks up weapon/armor, adds to `gear[]`
- `src/sr4/combat.ts` — `+attack <target>=<weapon>` looks up weapon DV + AP from table

### Dependencies

P4-A gear ✅, P5-A combat ✅.

---

## Schema Evolution Summary

Every `IShadowrunChar` field addition is handled by `normalizeChar()` in `src/db.ts` using
the `??=` mutation pattern. New fields added per phase:

| Phase | New Fields |
|---|---|
| P4-A | `gear[]` |
| P4-B | `nuyenLog[]` |
| P4-C | `tradition`, `spells[]`, `magicLoss` |
| P5-A | `armorRating`, `armorImpact`, `recoilComp`, `recoilAccum` |
| P5-B | `implants[]`, `essence`, `initDiceBonus` |
| P5-C | `astrally`, `spirits[]` |
| P5-D | `adeptPowers[]` |
| P5-E | `commlink?`, `resonance?`, `complexForms?` |
| P5-F | `vehicles[]` |
| P6-A | `initiationGrade`, `submersionGrade`, `metamagics[]` |
| P6-B | `streetCred`, `notoriety`, `publicAwareness`, `lifestyle` |
| P6-D | `knowledgeSkills`, `languages` |
| P6-H | `addictions[]` |

Each field defaults to a safe value (`0`, `[]`, `false`, `undefined`) in `normalizeChar()`.
No migration scripts needed.
