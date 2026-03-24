# Shadowrun 4E Plugin for UrsaMU

> A full Shadowrun 4th Edition 20th Anniversary rules implementation for UrsaMU.
> Covers character generation, dice mechanics, combat, magic, Matrix, vehicles,
> contacts, karma advancement, run management, and more — all in one plugin.

## Install

Place in `src/plugins/shadowrun/` — auto-discovered on next restart.

Or add to `plugins.manifest.json`:
```json
{ "plugins": [{ "name": "shadowrun", "url": "https://github.com/UrsaMU/shadowrun-plugin", "ref": "v1.0.0" }] }
```

**Requires** `@ursamu/jobs-plugin` ≥ 1.0.0 for chargen approval workflows.

---

## Command Reference

### Character Generation

| Command | Syntax | Lock | Description |
|---------|--------|------|-------------|
| `+chargen` | `+chargen[/<switch>] [<arg>]` | connected | Character generation (400 BP) |
| `+sheet` | `+sheet [<player>]` | connected | View character sheet |

#### +chargen switches

| Switch | Arg | Description |
|--------|-----|-------------|
| `/metatype` | `Human\|Elf\|Dwarf\|Ork\|Troll` | Set metatype |
| `/attr` | `<Attr>=<value>` | Purchase an attribute |
| `/skill` | `<Skill>=<N>[:<Spec>]` | Purchase an active skill (+ optional spec) |
| `/quality` | `<Quality>` | Add a quality |
| `/quality/remove` | `<Quality>` | Remove a quality from draft |
| `/resources` | `<nuyen>` | Set starting nuyen (multiples of 5,000¥) |
| `/tradition` | `<type>` | Set magical tradition (requires Magician quality) |
| `/spell` | `<Name>` | Add a known spell (3 BP each) |
| `/spell/remove` | `<Name>` | Remove a spell from draft |
| `/submit` | — | Submit for staff review |
| `/approve` | `<player>` | **[Staff]** Approve character |
| `/reset` | `<player>` | **[Staff]** Return to draft |
| `/wipe` | `<player>` | **[Staff]** Delete character record |

---

### Dice & Combat

| Command | Syntax | Lock | Description |
|---------|--------|------|-------------|
| `+roll` | `+roll[/edge] <pool>[/<threshold>]` | connected | Roll SR4 dice pool |
| `+init` | `+init[/<switch>] [<args>]` | connected | Roll initiative |
| `+attack` | `+attack[/<switch>] <target>=<weapon>` | connected | Resolve an attack |
| `+damage` | `+damage[/stun] <boxes>` | connected | Apply damage |
| `+heal` | `+heal[/<switch>] [<args>]` | connected | Manage healing |

#### +roll switches

| Switch | Description |
|--------|-------------|
| `/edge` | Burn Edge — reroll all non-hits once after the first roll |

#### +init switches

| Switch | Description |
|--------|-------------|
| `/edge` | Burn Edge — reroll any die showing 1–4 once |
| `/manual <attrSum>+<n>` | Manual roll, bypasses sheet lookup |

#### +attack switches

| Switch | Description |
|--------|-------------|
| `/full` | Target uses full defence (Reaction + Intuition + combat skill) |
| `/apply` | Apply pre-resolved damage directly (staff use) |
| `/recoil` | Reset accumulated recoil to 0 |
| `/wound` | Show your current wound modifier |

> **Note:** Armor ratings are derived automatically from your gear — use `+gear/add`
> to equip armor items. There is no manual armor override.

#### +damage switches

| Switch | Description |
|--------|-------------|
| `/stun` | Apply stun damage instead of physical |

#### +heal switches

| Switch | Description |
|--------|-------------|
| `/rest` | One stun healing tick (adequate rest) |
| `/firstaid` | Roll First Aid + Logic (once per wound) |
| `/longcare` | Roll Medicine + Logic (repeatable) |
| `/apply <type>=<n>` | **[Staff]** Directly heal N stun or physical boxes |
| `/reset` | **[Staff]** Clear both condition monitors |

---

### Magic

| Command | Syntax | Lock | Description |
|---------|--------|------|-------------|
| `+magic` | `+magic[/<switch>]` | connected | View magic rating and spell list |
| `+drain` | `+drain <force>` | connected | Roll drain resistance after casting |
| `+summon` | `+summon[/<switch>] <type>=<force>` | connected | Summon a spirit |
| `+astral` | `+astral` | connected | Toggle astral perception |
| `+assense` | `+assense <target>` | connected | Roll assensing on a target |
| `+banish` | `+banish <spirit name or force>` | connected | Roll banishing test |
| `+initiate` | `+initiate [/list] [<metamagic>]` | connected | Advance initiation grade |
| `+powers` | `+powers[/list]` | connected | View adept powers and PP balance |

#### +summon switches

| Switch | Description |
|--------|-------------|
| `/list` | Show spirit types available for your tradition |

#### +initiate switches

| Switch | Description |
|--------|-------------|
| `/list` | Show full metamagic catalogue |

#### +magic switches

| Switch | Description |
|--------|-------------|
| `/spells` | Show full spell catalogue |

---

### Matrix

| Command | Syntax | Lock | Description |
|---------|--------|------|-------------|
| `+matrix` | `+matrix[/<switch>] [<args>]` | connected | View/manage commlink and Matrix status |
| `+hack` | `+hack <node>=<action>[/<threshold>]` | connected | Perform a hacking action |
| `+compile` | `+compile[/<switch>] <sprite>=<force>` | connected | Compile a sprite (Technomancer) |
| `+thread` | `+thread[/<switch>] <form>=<force>` | connected | Thread a complex form (Technomancer) |
| `+submerse` | `+submerse [/list] [<echo>]` | connected | Advance submersion grade |

#### +matrix switches

| Switch | Description |
|--------|-------------|
| `/setup <model>=<F>/<R>/<Sig>/<Sys>` | **[Staff]** Set commlink stats |
| `/program/load <name>` | Load a program (up to Response active at once) |
| `/program/unload <name>` | Unload a running program |
| `/programs` | Show the program catalogue |

#### +hack actions

`probe`, `access`, `crash`, `attack`, `spoof`, `trace`, `edit`, `analyze`

#### +compile / +thread / +submerse switches

| Switch | Description |
|--------|-------------|
| `/list` | Show available sprites / complex forms / Echoes |

---

### Vehicles & Drones

| Command | Syntax | Lock | Description |
|---------|--------|------|-------------|
| `+vehicle` | `+vehicle[/<switch>] [<args>]` | connected | View/manage vehicles |
| `+pilot` | `+pilot <threshold>` | connected | Roll pilot test (1–20) |
| `+gunnery` | `+gunnery <threshold>` | connected | Roll gunnery test (1–20) |

#### +vehicle switches

| Switch | Description |
|--------|-------------|
| `/catalogue` | Browse the vehicle catalogue |
| `/add <Name>=<type>` | **[Staff]** Register a vehicle |
| `/remove <Name>` | **[Staff]** Remove a vehicle |
| `/damage <Name>=<n>` | **[Staff]** Apply physical damage boxes (-50..50) |

---

### Skills & Advancement

| Command | Syntax | Lock | Description |
|---------|--------|------|-------------|
| `+karma` | `+karma[/<switch>] [<args>]` | connected | View and spend karma |
| `+knowledge` | `+knowledge[/<switch>] [<args>]` | connected | Manage knowledge skills |
| `+language` | `+language[/<switch>] [<args>]` | connected | Manage language skills |

#### +karma switches

| Switch | Description |
|--------|-------------|
| `/log [<player>]` | Show karma log (staff: any player) |
| `/award <player>=<amount> <reason>` | **[Staff]** Award karma |
| `/spend <amount>=<reason>` | Free-spend karma |
| `/advance/skill <Skill>=<N>` | Raise an active skill rating |
| `/advance/attr <Attr>=<N>` | Raise an attribute |
| `/advance/spec <Skill>:<Spec>` | Buy a skill specialization (2 karma) |
| `/advance/skillgroup <Group>=<N>` | Raise an intact skill group |

#### +knowledge switches

| Switch | Description |
|--------|-------------|
| `/add <Name>=<rating>/<category>` | Add a knowledge skill |
| `/remove <Name>` | Remove a knowledge skill |
| `/advance <Name>` | Spend karma to raise a knowledge skill by 1 |
| `/list` | List your knowledge skills |

#### +language switches

| Switch | Description |
|--------|-------------|
| `/add <Language>=<rating>[/native]` | Add a language (native = free) |
| `/remove <Language>` | Remove a language |
| `/advance <Language>` | Spend karma to raise a language by 1 |
| `/list` | List your languages |

---

### Contacts & Social

| Command | Syntax | Lock | Description |
|---------|--------|------|-------------|
| `+contact` | `+contact[/<switch>] [<args>]` | connected | Manage NPC contacts |
| `+legwork` | `+legwork <contact>=<topic>/<threshold>` | connected | Legwork extended test via contact |
| `+favor` | `+favor <contact>=<rating> <request>` | connected | Request a favor |
| `+rep` | `+rep[/<switch>] [<args>]` | connected | View/adjust reputation |

#### +contact switches

| Switch | Description |
|--------|-------------|
| `/add <Name>=<Conn>/<Loy>` | Add a contact |
| `/edit <Name>=<Conn>/<Loy>` | Update an existing contact |
| `/remove <Name>` | Remove a contact |
| `/view <player>` | **[Staff]** View another player's contacts |

#### +rep switches

| Switch | Description |
|--------|-------------|
| `/set <field>=<value>` | **[Staff]** Set streetcred, notoriety, or public awareness |
| `/add <field>=<delta>` | **[Staff]** Add/subtract from a reputation field |

---

### Economy & Lifestyle

| Command | Syntax | Lock | Description |
|---------|--------|------|-------------|
| `+pay` | `+pay[/<switch>] [<args>]` | connected | Transfer nuyen |
| `+lifestyle` | `+lifestyle[/<switch>] [<args>]` | connected | Manage lifestyle tier |
| `+acquire` | `+acquire <item>=<avail>[/<contact>]` | connected | Roll acquisition test |

#### +pay switches

| Switch | Description |
|--------|-------------|
| `/set <player>=<amount>` | **[Staff]** Set nuyen directly |
| `/log` | Show last 20 transactions |

#### +lifestyle switches

| Switch | Description |
|--------|-------------|
| `/set <tier>` | Change lifestyle tier (street/squatter/low/middle/high/luxury) |
| `/pay` | Deduct this month's cost from nuyen |
| `/view <player>` | **[Staff]** View another player's lifestyle |

---

### Gear, Cyberware & Weapons

| Command | Syntax | Lock | Description |
|---------|--------|------|-------------|
| `+gear` | `+gear[/<switch>] [<args>]` | connected | Manage gear and equipment |
| `+cyber` | `+cyber[/<switch>] [<args>]` | connected | View/manage implants |
| `+weapons` | `+weapons[/<switch>] [<args>]` | connected | Browse weapon database |
| `+armor` | `+armor[/<switch>] [<args>]` | connected | Browse armor database |

#### +gear switches

| Switch | Description |
|--------|-------------|
| `/add <Name>=<qty>` | Add a gear item (auto-applies catalogue stats: armor, RC, etc.) |
| `/remove <Name>` | Remove a gear item (armor and RC totals update automatically) |
| `/set <Name>=<qty>` | Update quantity on an existing item |
| `/note <Name>=<text>` | Add or update a note on a gear item |
| `/info <Name>` | Show full catalogue stat block for a named item |
| `/catalog [<category>]` | Browse the gear catalogue (filter by category for full list) |
| `/view <player>` | **[Staff]** View another player's gear |

Armor (`armorRating` / `armorImpact`) and Recoil Compensation are recomputed from
your gear list every time you add or remove an item. Totals are capped at **20** to
prevent armour-stacking exploits (SR4A layering rule is not auto-enforced).

**Gear catalogue categories:** `armor`, `armor-mod`, `melee-weapon`, `ranged-weapon`,
`firearm-accessory`, `ammo`, `grenade`, `explosive`, `commlink`, `os`,
`matrix-program`, `electronics`, `sensor`, `security`, `drug`, `chemical`,
`medical`, `survival`, `tool`, `id`, `magical`, `misc`

#### +cyber switches

| Switch | Description |
|--------|-------------|
| `/install <item>=<grade>` | **[Staff]** Install an implant |
| `/remove <item>` | **[Staff]** Remove an implant |
| `/list` | Show the implant catalogue |

#### +weapons / +armor switches

| Switch | Description |
|--------|-------------|
| `/list [<category>]` | List entries (weapons: filter by category) |
| `/view <Name>` | Show full stat block |

---

### Tests & Utility

| Command | Syntax | Lock | Description |
|---------|--------|------|-------------|
| `+extend` | `+extend <pool>/<threshold>[/<accumulated>]` | connected | One interval of an extended test |
| `+teamwork` | `+teamwork <pool>/<threshold>[/<hits>,...]` | connected | Teamwork test with assistant contributions |
| `+toxin` | `+toxin[/<switch>] [<args>]` | connected | View toxins or roll resistance |
| `+rolllog` | `+rolllog[/all] [<player>]` | connected | View dice roll history |

#### +toxin switches

| Switch | Description |
|--------|-------------|
| `/list [drugs]` | List toxins or drugs |
| `/resist <toxin>` | Roll resistance (reads your char-sheet attrs — no override) |
| `/drug <name>` | Show drug stats and crash DV |

---

### Run Management

| Command | Syntax | Lock | Description |
|---------|--------|------|-------------|
| `+run` | `+run[/<switch>] [<args>]` | connected | Run (scene) management |
| `+critter` | `+critter[/<switch>] [<args>]` | connected | Browse critter/NPC stat blocks |

#### +run switches

| Switch | Description |
|--------|-------------|
| `/create <name>=<summary>` | **[Staff]** Create a run |
| `/open <run#>` | **[Staff]** Mark a run as active |
| `/close <run#>=<baseKarma>` | **[Staff]** Close run and award base karma |
| `/award <run#> <player>=<karma> <why>` | **[Staff]** Bonus karma to one player |
| `/register [<run#>]` | Register for a run |
| `/unregister [<run#>]` | Unregister from a run |
| `/roster [<run#>]` | Show run roster |
| `/info <run#>` | Show full run details |

#### +critter switches

| Switch | Description |
|--------|-------------|
| `/list [<category>]` | List critters, optionally by category |
| `/view <Name>` | Show full stat block |

---

## Chargen System (SR4A 400 BP)

| Item | Cost |
|------|------|
| Metatype | 0–40 BP (racial adjustment) |
| Attribute +1 above racial minimum | 10 BP |
| Active skill rank | 4 BP |
| Skill specialization | +2 BP |
| Positive quality | listed BP (35 BP max) |
| Negative quality | −listed BP (35 BP max refund) |
| 5,000¥ starting nuyen | 1 BP (max 250,000¥) |
| Known spell | 3 BP each |
| Native language | free |
| Additional language | 2 BP per rating point |

---

## Dice Mechanics

SR4 pools use d6s. A **hit** is a 5 or 6. A **glitch** occurs when half or more
of the dice show 1s. A **critical glitch** is a glitch with zero hits.

```
+roll 8          Roll 8 dice (no threshold)
+roll 8/3        Roll 8 dice vs threshold 3
+roll/edge 8     Roll 8, reroll all non-hits once (Edge burn)
```

---

## Security Notes

- `+toxin/resist` reads Body and Willpower from the **character sheet only** — no
  user-supplied stat override is accepted.
- All user-supplied string fields (gear names, gear notes, contact names, knowledge
  skill names) reject prototype-polluting key names (`__proto__`, `constructor`,
  `__` prefix, and similar) via a shared `isPrototypePoisonKey()` guard.
- Armor totals derived from gear are **capped at B20/I20** to prevent stacking exploits.
- `+gear/catalog` without a category filter is capped at **40 rows** with a prompt
  to use a category filter — prevents terminal flooding on slow clients.
- Dice pools are capped at **30** (`MAX_POOL`) to prevent extended-test DoS.
- Pilot/gunnery thresholds are bounded **1–20**; vehicle damage values **−50..50**.

---

## Storage

| Collection | Schema type | Purpose |
|------------|-------------|---------|
| `shadowrun.chars` | `IShadowrunChar` | Character sheets |
| `shadowrun.rolllog` | `IRollLogEntry` | Dice roll history |
| `shadowrun.runs` | `IRunEntry` | Run/scene records |

---

## REST Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/shadowrun/char/<playerId>` | Bearer | Fetch character as JSON |

Non-staff callers may only fetch their own approved character.

> REST routes persist until server restart after plugin removal.

---

## Jobs Integration

On `+chargen/submit`, a job opens in the **CGEN** bucket. Staff review the sheet
with `+sheet <player>` and approve with `+chargen/approve <player>`. The CGEN job
closes automatically on approval.
