# Dice & Combat

> SR4A dice mechanics, initiative, attack resolution, damage, and healing.

## Commands

| Command | Syntax | Lock | Description |
|---------|--------|------|-------------|
| `+roll` | `+roll[/edge] <pool>[/<threshold>]` | connected | Roll an SR4 dice pool |
| `+init` | `+init[/<switch>] [<args>]` | connected | Roll initiative |
| `+attack` | `+attack[/<switch>] <target>=<weapon>` | connected | Resolve an attack |
| `+damage` | `+damage[/stun] <boxes>` | connected | Apply damage to yourself |
| `+heal` | `+heal[/<switch>] [<args>]` | connected | Manage healing |

---

## Dice Mechanics

SR4 pools use d6s. A **hit** is a 5 or 6. A **glitch** occurs when half or
more of the dice show 1s. A **critical glitch** is a glitch with zero hits.

Dice pools are capped at **30** (`MAX_POOL`) to prevent abuse.

```
+roll 8          Roll 8 dice (no threshold — reports hits)
+roll 8/3        Roll 8 dice vs threshold 3 (net hits = hits − 3)
+roll/edge 8     Roll 8, then reroll all non-hits once (Edge burn)
+roll/edge 8/3   Edge burn against a threshold
```

---

## +roll switches

| Switch | Description |
|--------|-------------|
| `/edge` | Burn Edge — roll the pool, then reroll all non-hit dice once |

---

## Initiative

`+init` reads your Reaction + Intuition from your character sheet and adds
`1d6` (or more if augmented). The result is your initiative score for the pass.

```
+init               Standard initiative (Reaction + Intuition + 1d6)
+init/edge          Burn Edge on initiative — reroll any die showing 1–4 once
+init/manual 7+2    Manual roll: attrSum=7, roll 2d6 (bypasses sheet lookup)
```

### +init switches

| Switch | Arg | Description |
|--------|-----|-------------|
| `/edge` | — | Burn Edge — reroll any die showing 1–4 once |
| `/manual` | `<attrSum>+<n>` | Manual initiative; bypasses sheet attribute lookup |

---

## Attack Resolution

`+attack` reads the attacker's relevant combat skill + attribute from the
sheet, applies wound modifiers, and resolves the full SR4A attack sequence
against the target's defense pool.

```
+attack Alice=Ares Predator IV        Full attack roll vs Alice
+attack/full Alice=Ares Predator IV   Alice uses full defence
+attack/recoil                        Reset accumulated recoil to 0
+attack/wound                         Show your current wound modifier
```

### +attack switches

| Switch | Description |
|--------|-------------|
| `/full` | Target defends with Reaction + Intuition + combat skill (full defence) |
| `/apply` | **[Staff]** Apply pre-resolved damage directly to a target |
| `/recoil` | Reset your accumulated recoil counter to 0 |
| `/wound` | Display your current wound modifier (−1 per 3 boxes filled) |

> **Armor:** Armor ratings (`armorRating` / `armorImpact`) are derived
> automatically from your gear list. Use `+gear/add` to equip armor — there
> is no manual armor override command.

---

## Damage

`+damage` applies physical or stun damage boxes to your own condition monitor.

```
+damage 3        Apply 3 physical damage boxes
+damage/stun 2   Apply 2 stun damage boxes
```

### +damage switches

| Switch | Description |
|--------|-------------|
| `/stun` | Apply stun damage instead of physical |

---

## Healing

### +heal switches

| Switch | Arg | Description |
|--------|-----|-------------|
| `/rest` | — | One stun healing tick (adequate rest — SR4A p. 241) |
| `/firstaid` | — | Roll First Aid + Logic; heals stun (once per wound event) |
| `/longcare` | — | Roll Medicine + Logic; heals physical (repeatable) |
| `/apply` | `<type>=<n>` | **[Staff]** Directly heal N stun or physical boxes |
| `/reset` | — | **[Staff]** Clear both condition monitors entirely |

```
+heal/rest                 Tick off one stun box (rest)
+heal/firstaid             Roll First Aid to treat stun
+heal/longcare             Roll Medicine for long-term care
+heal/apply stun=3         [Staff] Heal 3 stun boxes
+heal/apply physical=2     [Staff] Heal 2 physical boxes
+heal/reset                [Staff] Full reset of condition monitors
```

---

## Extended & Teamwork Tests

See [utilities.md](utilities.md) for `+extend` and `+teamwork`.
