# Tests & Utility

> Extended tests, teamwork, toxin resistance, and dice roll history.

## Commands

| Command | Syntax | Lock | Description |
|---------|--------|------|-------------|
| `+extend` | `+extend <pool>/<threshold>[/<accumulated>]` | connected | Roll one interval of an extended test |
| `+teamwork` | `+teamwork <pool>/<threshold>[/<hits>,...]` | connected | Teamwork test with assistant contributions |
| `+toxin` | `+toxin[/<switch>] [<args>]` | connected | View toxin/drug info or roll resistance |
| `+rolllog` | `+rolllog[/all] [<player>]` | connected | View dice roll history |

---

## Extended Tests

Extended tests represent tasks that require multiple intervals to complete
(SR4A p. 59). Each `+extend` call rolls one interval and tracks accumulated hits.

```
+extend 8/10             Roll 8 dice vs threshold 10 (from 0 accumulated)
+extend 8/10/4           Roll 8 dice vs threshold 10 with 4 hits already banked
```

The output shows hits this interval, total accumulated, and whether the
threshold has been met.

---

## Teamwork Tests

The lead character rolls normally; each assistant contributing hits adds
them to the leader's pool (capped at the leader's skill rating).

```
+teamwork 6/4            Lead roll: 6 dice vs threshold 4, no assistants
+teamwork 6/4/2,3        Lead roll with 2 assistants contributing 2 and 3 hits
```

---

## Toxins & Drugs

### +toxin switches

| Switch | Arg | Description |
|--------|-----|-------------|
| `/list` | `[drugs]` | List all toxins, or pass `drugs` to list drugs only |
| `/resist` | `<toxin>` | Roll resistance (Body + relevant attribute; reads sheet only) |
| `/drug` | `<name>` | Show drug stats and crash effect DV |

```
+toxin/list                  List all toxins and their effects
+toxin/list drugs            List drugs only
+toxin/resist Neurostun VIII Roll to resist Neurostun VIII
+toxin/drug Jazz             Show Jazz stats (onset, effect, crash DV)
```

> `+toxin/resist` reads Body and Willpower directly from your character sheet.
> No user-supplied stat override is accepted — this is a security invariant.

---

## Dice Roll Log

`+rolllog` shows a history of recent dice rolls. Staff can view any player's log.

```
+rolllog            View your last 20 rolls
+rolllog/all        View your full roll history
+rolllog Alice      [Staff] View Alice's last 20 rolls
+rolllog/all Alice  [Staff] View Alice's full history
```
