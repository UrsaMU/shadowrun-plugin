# Skills & Advancement

> Karma spending, active skill advancement, knowledge skills, and languages.

## Commands

| Command | Syntax | Lock | Description |
|---------|--------|------|-------------|
| `+karma` | `+karma[/<switch>] [<args>]` | connected | View and spend karma |
| `+knowledge` | `+knowledge[/<switch>] [<args>]` | connected | Manage knowledge skills |
| `+language` | `+language[/<switch>] [<args>]` | connected | Manage language skills |

---

## Karma

`+karma` with no switch shows your current karma total and log.

### +karma switches

| Switch | Arg | Description |
|--------|-----|-------------|
| `/log` | `[<player>]` | Show karma log (staff can view any player) |
| `/award` | `<player>=<amount> <reason>` | **[Staff]** Award karma with a reason |
| `/spend` | `<amount>=<reason>` | Free-spend karma (custom advancement) |
| `/advance/skill` | `<Skill>=<N>` | Raise an active skill to rating N |
| `/advance/attr` | `<Attr>=<N>` | Raise an attribute to N |
| `/advance/spec` | `<Skill>:<Spec>` | Buy a skill specialization (costs 2 karma) |
| `/advance/skillgroup` | `<Group>=<N>` | Raise an intact skill group to N |

### Karma Costs (SR4A p. 275)

| Advancement | Karma Cost |
|-------------|------------|
| Active skill +1 | New rating × 2 |
| Skill specialization | 2 |
| Skill group +1 | New rating × 5 |
| Attribute +1 | New rating × 4 |
| Magic/Resonance +1 | New rating × 3 |
| Initiation / Submersion | 10 + (grade × 3) |

```
+karma                        View karma total and recent log
+karma/log                    Full karma log
+karma/log Alice              [Staff] View Alice's karma log
+karma/award Alice=5 Run reward
+karma/advance/skill Pistols=5    Raise Pistols to 5
+karma/advance/attr Agility=6     Raise Agility to 6
+karma/advance/spec Pistols:Colts Buy Colts specialization
+karma/spend 3=Bought a contact upgrade
```

---

## Knowledge Skills

Knowledge skills represent a character's areas of academic or street expertise.
They are tracked separately from active skills and are not used in combat.

### +knowledge switches

| Switch | Arg | Description |
|--------|-----|-------------|
| `/add` | `<Name>=<rating>/<category>` | Add a knowledge skill |
| `/remove` | `<Name>` | Remove a knowledge skill |
| `/advance` | `<Name>` | Spend karma to raise the skill by 1 |
| `/list` | — | List all your knowledge skills |

```
+knowledge/add Security Procedures=3/professional   Add a knowledge skill
+knowledge/add Gang Turf=4/street                   Street knowledge
+knowledge/advance Security Procedures              Raise by 1 (costs karma)
+knowledge/remove Gang Turf                         Remove a knowledge skill
+knowledge/list                                     View all knowledge skills
```

> Skill names that match prototype-poison keys (`__proto__`, `constructor`,
> `__` prefix, etc.) are rejected as a defense-in-depth measure.

---

## Languages

Language skills follow the same structure as knowledge skills. Native languages
are free and do not count against BP or karma.

### +language switches

| Switch | Arg | Description |
|--------|-----|-------------|
| `/add` | `<Language>=<rating>[/native]` | Add a language (append `/native` for a free native language) |
| `/remove` | `<Language>` | Remove a language |
| `/advance` | `<Language>` | Spend karma to raise by 1 |
| `/list` | — | List all your languages |

```
+language/add English=N/native     Add English as your native tongue (free)
+language/add Spanish=3            Add Spanish at rating 3
+language/advance Spanish          Raise Spanish by 1
+language/list                     View all languages
```
