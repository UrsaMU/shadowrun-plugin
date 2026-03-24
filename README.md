# Shadowrun 4E Plugin for UrsaMU

> A full Shadowrun 4th Edition 20th Anniversary rules implementation for UrsaMU.
> Covers character generation, dice mechanics, combat, magic, Matrix, vehicles,
> contacts, karma advancement, run management, and more — all in one plugin.

## Install

Place in `src/plugins/shadowrun/` — auto-discovered on next restart.

Or add to `plugins.manifest.json`:
```json
{ "plugins": [{ "name": "shadowrun", "url": "https://github.com/UrsaMU/shadowrun-plugin", "ref": "v0.2.0" }] }
```

**Requires** `@ursamu/jobs-plugin` ≥ 1.0.0 for chargen approval workflows.

---

## Command Overview

| Category | Commands |
|----------|----------|
| Character Generation | `+chargen`, `+sheet` |
| Dice & Combat | `+roll`, `+init`, `+attack`, `+damage`, `+heal` |
| Magic | `+magic`, `+drain`, `+summon`, `+astral`, `+assense`, `+banish`, `+initiate`, `+powers` |
| Matrix | `+matrix`, `+hack`, `+compile`, `+thread`, `+submerse` |
| Gear & Equipment | `+gear`, `+cyber`, `+weapons`, `+armor` |
| Skills & Advancement | `+karma`, `+knowledge`, `+language` |
| Contacts & Social | `+contact`, `+legwork`, `+favor`, `+rep` |
| Economy & Lifestyle | `+pay`, `+lifestyle`, `+acquire` |
| Vehicles & Drones | `+vehicle`, `+pilot`, `+gunnery` |
| Run Management | `+run`, `+critter` |
| Utility | `+extend`, `+teamwork`, `+toxin`, `+rolllog` |

---

## Documentation

| Topic | File |
|-------|------|
| Character generation (400 BP), metatypes, qualities, jobs | [docs/chargen.md](docs/chargen.md) |
| Dice mechanics, combat, damage, healing | [docs/dice-combat.md](docs/dice-combat.md) |
| Magic, spirits, initiation, adept powers | [docs/magic.md](docs/magic.md) |
| Matrix, hacking, Technomancers | [docs/matrix.md](docs/matrix.md) |
| Gear catalogue, cyberware, armor auto-derivation | [docs/gear.md](docs/gear.md) |
| Karma, active skills, knowledge, languages | [docs/advancement.md](docs/advancement.md) |
| Contacts, legwork, favors, reputation | [docs/contacts.md](docs/contacts.md) |
| Nuyen, lifestyle tiers, acquisition | [docs/economy.md](docs/economy.md) |
| Vehicles, drones, pilot, gunnery | [docs/vehicles.md](docs/vehicles.md) |
| Runs, scene management, critters | [docs/runs.md](docs/runs.md) |
| Extended tests, teamwork, toxins, roll log | [docs/utilities.md](docs/utilities.md) |
| REST API, storage schema | [docs/rest-api.md](docs/rest-api.md) |
| Security hardening notes | [docs/security.md](docs/security.md) |

---

## Storage

| Collection | Schema type | Purpose |
|------------|-------------|---------|
| `shadowrun.chars` | `IShadowrunChar` | Character sheets |
| `shadowrun.rolllog` | `IRollLogEntry` | Dice roll history |
| `shadowrun.runs` | `IRunEntry` | Run/scene records |
