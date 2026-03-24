# @ursamu/shadowrun-plugin

Shadowrun 4th Edition (20th Anniversary) for [UrsaMU](https://github.com/ursamu/ursamu). Full rules implementation: character generation, dice mechanics, combat, magic, Matrix, vehicles, contacts, karma, and run management.

## Requirements

- [UrsaMU](https://github.com/ursamu/ursamu) ≥ 1.9
- `@ursamu/jobs-plugin` ≥ 1.0.0 (chargen approval workflow)

## Install

```bash
ursamu plugin install jsr:@ursamu/shadowrun-plugin
```

Or place in `src/plugins/shadowrun/` — auto-discovered on next restart.

## Commands

| Category | Commands |
|----------|----------|
| Character Generation | `+chargen`, `+sheet` |
| Dice & Combat | `+roll`, `+init`, `+attack`, `+damage`, `+heal` |
| Magic | `+magic`, `+drain`, `+summon`, `+astral`, `+banish`, `+initiate`, `+powers` |
| Matrix | `+matrix`, `+hack`, `+compile`, `+thread`, `+submerse` |
| Gear & Equipment | `+gear`, `+cyber`, `+weapons` |
| Skills & Advancement | `+karma`, `+knowledge`, `+language` |
| Contacts & Social | `+contact`, `+legwork`, `+favor`, `+rep` |
| Economy & Lifestyle | `+pay`, `+lifestyle`, `+acquire` |
| Vehicles & Drones | `+vehicle`, `+pilot`, `+gunnery` |
| Run Management | `+run`, `+critter` |
| Utility | `+extend`, `+teamwork`, `+toxin`, `+rolllog` |

## Documentation

| Topic | |
|-------|-|
| Character generation, metatypes, qualities | [docs/chargen.md](docs/chargen.md) |
| Dice mechanics, combat, damage, healing | [docs/dice-combat.md](docs/dice-combat.md) |
| Magic, spirits, initiation, adept powers | [docs/magic.md](docs/magic.md) |
| Matrix, hacking, Technomancers | [docs/matrix.md](docs/matrix.md) |
| Gear catalogue, cyberware, armor | [docs/gear.md](docs/gear.md) |
| Karma, skills, knowledge, languages | [docs/advancement.md](docs/advancement.md) |
| Contacts, legwork, favors, reputation | [docs/contacts.md](docs/contacts.md) |
| Nuyen, lifestyle tiers, acquisition | [docs/economy.md](docs/economy.md) |
| Vehicles, drones, pilot, gunnery | [docs/vehicles.md](docs/vehicles.md) |
| Run management, critters | [docs/runs.md](docs/runs.md) |
| Extended tests, teamwork, toxins, roll log | [docs/utilities.md](docs/utilities.md) |
| REST API & storage schema | [docs/rest-api.md](docs/rest-api.md) |
| ai-gm bridge integration | [docs/bridge.md](docs/bridge.md) |
| Security hardening | [docs/security.md](docs/security.md) |

## Development

```bash
deno test --allow-env tests/   # full suite
deno check mod.ts              # type-check
```

## License

MIT — Copyright (c) 2026 Lemuel Canady, Jr.
