# Gear, Cyberware & Weapons

> Equipment tracking with automatic armor and recoil compensation derivation.
> ~350-item gear catalogue covering all SR4A equipment categories.

## Commands

| Command | Syntax | Lock | Description |
|---------|--------|------|-------------|
| `+gear` | `+gear[/<switch>] [<args>]` | connected | Manage gear and equipment |
| `+cyber` | `+cyber[/<switch>] [<args>]` | connected | View/manage cyberware implants |
| `+weapons` | `+weapons[/<switch>] [<args>]` | connected | Browse weapon database |
| `+armor` | `+armor[/<switch>] [<args>]` | connected | Browse armor database |

---

## +gear switches

| Switch | Arg | Description |
|--------|-----|-------------|
| `/add` | `<Name>=<qty>` | Add a gear item; auto-applies catalogue stats (armor, RC, etc.) |
| `/remove` | `<Name>` | Remove an item; armor and RC totals recompute automatically |
| `/set` | `<Name>=<qty>` | Update the quantity on an existing item |
| `/note` | `<Name>=<text>` | Add or update a free-text note on a gear item |
| `/info` | `<Name>` | Show the full catalogue stat block for a named item |
| `/catalog` | `[<category>]` | Browse the gear catalogue (use a category for full list) |
| `/view` | `<player>` | **[Staff]** View another player's gear list |

---

## Armor Auto-Derivation

When you add or remove a gear item, `armorRating` (ballistic) and
`armorImpact` are **automatically recomputed** by summing the `ballistic`
and `impact` values from every item in your gear list.

Totals are **capped at B20 / I20** to prevent armor-stacking exploits.
The SR4A layering rule (only the highest single armor counts as a base)
is not automatically enforced — staff may adjust as needed.

```
+gear                          List all gear + armor/RC totals
+gear/add Armor Jacket=1       Add Armor Jacket (B8/I6 applied automatically)
+gear/add Lined Coat=1         Stack a Lined Coat on top
+gear/remove Armor Jacket      Remove it (totals recompute)
+gear/info Lined Coat          View full stat block from catalogue
+gear/set Stimulant Patch Rating 3=2   Update quantity to 2
+gear/note Ares Predator IV=Smartlinked, silencer attached
+gear/catalog armor            Browse all armor items
+gear/catalog ranged-weapon    Browse all ranged weapons
+gear/view Alice               [Staff] View Alice's gear
```

---

## Gear Catalogue Categories

| Category | Description |
|----------|-------------|
| `armor` | Full armor suits and jackets |
| `armor-mod` | Armor accessories and modifications |
| `melee-weapon` | Blades, clubs, and unarmed |
| `ranged-weapon` | Firearms, bows, and throwing |
| `firearm-accessory` | Silencers, scopes, smartlinks, etc. |
| `ammo` | Ammunition types (hollow point, APDS, etc.) |
| `grenade` | Grenades |
| `explosive` | Plastic explosive and detonators |
| `commlink` | Personal computers and commlinks |
| `os` | Operating systems |
| `matrix-program` | Hacking and utility programs |
| `electronics` | Sensors, cameras, bugs |
| `sensor` | Sensor suites and modules |
| `security` | Locks, alarms, maglocks |
| `drug` | Street and pharmaceutical drugs |
| `chemical` | Reagents, compounds |
| `medical` | Medkits, stim patches, trauma patches |
| `survival` | Camping, environment, climbing gear |
| `tool` | Toolkits for skills |
| `id` | Fake SINs, licenses |
| `magical` | Foci, alchemical preparations |
| `misc` | Miscellaneous equipment |

Use `+gear/catalog` (no filter) to see the first 40 items with a prompt to
filter. Without a category, output is capped at **40 rows** to prevent
terminal flooding on slow clients.

---

## Cyberware

Cyberware is installed and removed by staff. Essence cost is tracked on the
character sheet and reduces the Magic/Resonance ceiling.

```
+cyber               View your installed cyberware and Essence remaining
+cyber/list          Browse the full implant catalogue
+cyber/install Wired Reflexes 1=alphaware    [Staff] Install implant
+cyber/remove Wired Reflexes 1               [Staff] Remove implant
```

### +cyber switches

| Switch | Arg | Description |
|--------|-----|-------------|
| `/install` | `<item>=<grade>` | **[Staff]** Install a cyberware implant |
| `/remove` | `<item>` | **[Staff]** Remove an implant |
| `/list` | — | Show the full implant catalogue |

---

## Weapons & Armor Databases

`+weapons` and `+armor` are read-only catalogue browsers. To equip a weapon
or armor in play, use `+gear/add`.

```
+weapons/list                  List all weapons
+weapons/list ranged-weapon    Filter by category
+weapons/view Ares Predator IV Full stat block

+armor/list                    List all armor
+armor/view Armor Jacket       Full stat block
```

### +weapons / +armor switches

| Switch | Arg | Description |
|--------|-----|-------------|
| `/list` | `[<category>]` | List entries, optionally filtered by category |
| `/view` | `<Name>` | Show the full stat block |
