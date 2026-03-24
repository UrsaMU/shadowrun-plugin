# Run Management

> Scene/run lifecycle management and critter/NPC stat blocks.

## Commands

| Command | Syntax | Lock | Description |
|---------|--------|------|-------------|
| `+run` | `+run[/<switch>] [<args>]` | connected | Run (scene) management |
| `+critter` | `+critter[/<switch>] [<args>]` | connected | Browse critter and NPC stat blocks |

---

## Runs

A **run** is a structured scene with a roster of registered players. Staff
create, open, and close runs; players register to join.

### +run switches

| Switch | Arg | Description |
|--------|-----|-------------|
| `/create` | `<name>=<summary>` | **[Staff]** Create a new run |
| `/open` | `<run#>` | **[Staff]** Mark a run as active and accepting registrations |
| `/close` | `<run#>=<baseKarma>` | **[Staff]** Close the run and award base karma to all participants |
| `/award` | `<run#> <player>=<karma> <why>` | **[Staff]** Award bonus karma to one player |
| `/register` | `[<run#>]` | Register yourself for a run (defaults to active run) |
| `/unregister` | `[<run#>]` | Unregister from a run |
| `/roster` | `[<run#>]` | Show the run's participant roster |
| `/info` | `<run#>` | Show full run details (summary, status, roster) |

```
+run                          List all runs (recent first)
+run/create Aztechnology Hit=Steal the prototype from Aztechnology.
+run/open 3                   [Staff] Open run #3
+run/register                 Register for the current active run
+run/register 3               Register for run #3 specifically
+run/unregister               Unregister from active run
+run/roster                   Show who is registered
+run/roster 3                 Show roster for run #3
+run/info 3                   Full details for run #3
+run/close 3=5                [Staff] Close run #3, award 5 base karma
+run/award 3 Alice=2 Exceptional roleplay
```

---

## Critters & NPCs

`+critter` is a read-only browser for the critter/NPC database. Stats include
attributes, skills, powers, and weaknesses.

### +critter switches

| Switch | Arg | Description |
|--------|-----|-------------|
| `/list` | `[<category>]` | List critters, optionally filtered by category |
| `/view` | `<Name>` | Show the full stat block for a critter |

```
+critter/list               Browse all critters
+critter/list paracritter   Filter by paracritter category
+critter/list spirit        Show all spirit types
+critter/view Barghest      Full stat block for a Barghest
+critter/view Lone Star Cop NPC stat block
```
