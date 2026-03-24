# Security Notes

> Defense-in-depth measures built into the Shadowrun plugin.
> Each item below corresponds to a closed exploit test in `tests/security/`.

---

## Input Validation

### Prototype-Poison Key Rejection

All user-supplied string fields that could become object keys are validated
through a shared `isPrototypePoisonKey()` guard in `src/sr4/validation.ts`.

Blocked values:

| Pattern | Examples |
|---------|---------|
| Known dangerous keys | `__proto__`, `constructor`, `prototype` |
| Built-in Object methods | `toString`, `valueOf`, `hasOwnProperty`, `isPrototypeOf`, `propertyIsEnumerable`, `toLocaleString` |
| Double-underscore prefix | `__anything` |

**Fields protected:**
- Gear item names (`+gear/add`) — exploit test `m-g1-gear-name-poison`
- Gear notes (`+gear/note`) — exploit test `l-g1-gear-note-poison`
- Contact names (`+contact/add`, `/edit`) — exploit test `m-c1-contact-poison`
- Knowledge skill names (`+knowledge/add`)
- Language names (`+language/add`)

Notes containing a dangerous identifier as a **substring** are permitted
(e.g. `"has constructor kit attached"` is fine); only bare exact matches
and `__`-prefixed strings are blocked.

---

## Armor Stacking Cap

**Exploit:** Adding every armor item in the catalogue would yield a ballistic
armor total far exceeding any legitimate loadout, making characters
effectively invulnerable.

**Fix:** `recomputeArmorFromGear()` clamps the summed ballistic and impact
totals to `MAX_ARMOR_BALLISTIC = 20` and `MAX_ARMOR_IMPACT = 20`.

A legitimate maximum loadout (Full Body Armor + all accessories) reaches
approximately B18/I15 — well within the cap. Stacking 30 items (theoretical
B300+) is clamped to B20.

**Exploit test:** `m-g2-armor-cap`

---

## Catalogue Output Guard

**Exploit:** `+gear/catalog` with no filter iterates the entire ~350-item
catalogue and sends it in a single message, flooding slow MUSH clients
and enabling rapid soft-DoS by spamming the command.

**Fix:** `safeCatalogSlice()` caps unfiltered output at
`MAX_CATALOG_UNFILTERED_ROWS = 40` and appends a hint to use a category
filter for the full list.

**Exploit test:** `l-g2-catalog-guard`

---

## Dice Pool Cap

**Exploit:** A very large dice pool in an extended test forces the server to
generate thousands of random numbers per message, enabling a CPU-based DoS.

**Fix:** All dice pools are capped at `MAX_POOL = 30` before rolling.

**Exploit test:** `c1-roll-dos`

---

## Stat Override Prevention

**Exploit:** `+toxin/resist` accepting a user-supplied attribute value allows
a player to pass any number as their Body or Willpower, trivially ignoring
all toxins.

**Fix:** `+toxin/resist` reads Body and Willpower exclusively from the
character sheet. No user-supplied stat value is accepted.

**Exploit test:** `l1-null-assert`

---

## REST Authorization

**Exploit:** A logged-in player could request another player's character sheet
via the REST endpoint by supplying a different player ID.

**Fix:** Non-staff callers receive a `403 Forbidden` when the requested
`playerId` does not match their own session user ID.

**Exploit tests:** `h1-h2-rest`, `p6-security`

---

## Vehicle & Pilot Bounds

- Pilot/gunnery **thresholds** are bounded **1–20**; values outside this
  range are rejected with an error message.
- Vehicle **damage values** are bounded **−50..50** to prevent integer
  overflow or nonsensical damage states.

---

## Damage Cap

Directly applied damage (`+damage`, `+heal/apply`) is bounded to the size of
the condition monitor (10 + ⌈Body÷2⌉ physical; 10 + ⌈Willpower÷2⌉ stun)
to prevent out-of-range box states.

**Exploit test:** `m1-damage-cap`
