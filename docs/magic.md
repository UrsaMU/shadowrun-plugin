# Magic

> Hermetic mages, shamans, adepts, initiation, and astral space for SR4A.

## Commands

| Command | Syntax | Lock | Description |
|---------|--------|------|-------------|
| `+magic` | `+magic[/<switch>]` | connected | View magic rating, drain track, and spell list |
| `+drain` | `+drain <force>` | connected | Roll drain resistance after casting a spell |
| `+summon` | `+summon[/<switch>] <type>=<force>` | connected | Summon a spirit |
| `+astral` | `+astral` | connected | Toggle astral perception on/off |
| `+assense` | `+assense <target>` | connected | Roll assensing against a target |
| `+banish` | `+banish <spirit name or force>` | connected | Roll banishing test |
| `+initiate` | `+initiate [/list] [<metamagic>]` | connected | Advance initiation grade or buy metamagic |
| `+powers` | `+powers[/list]` | connected | View adept powers and Power Point balance |

---

## Spellcasting

Spells are declared in chargen with `+chargen/spell <Name>`. During play,
resolve spellcasting as a dice roll: `+roll <Magic + relevant skill>` against
the target's resistance pool.

After casting, roll drain with:

```
+drain 8     Roll drain resistance for a Force 8 spell
```

Drain DV is `(Force ÷ 2)` rounded up, resisted by Willpower + relevant
attribute (tradition-dependent).

## +magic switches

| Switch | Description |
|--------|-------------|
| `/spells` | Show the full spell catalogue with drain values |

---

## Spirits

`+summon` summons a spirit of the given type at the specified Force. Available
spirit types depend on your tradition (hermetic vs. shaman vs. other).

```
+summon/list              Show spirit types available for your tradition
+summon Fire Spirit=6     Summon a Force 6 Fire Spirit (hermetic)
+summon Beast Spirit=4    Summon a Force 4 Beast Spirit (shaman)
```

### +summon switches

| Switch | Description |
|--------|-------------|
| `/list` | Show spirit types available for your tradition |

---

## Astral Space

```
+astral          Toggle astral perception on or off
+assense Alice   Roll assensing against Alice (Magic + Assensing)
```

Astral perception allows you to see auras and detect magic. While perceiving,
you are dual-natured (affected by both physical and astral attacks).

---

## Banishing

```
+banish Flame Spirit     Banish by spirit name
+banish 6                Banish by Force
```

Banishing is an opposed test: your Magic + Banishing vs. the spirit's Force.
Each net hit reduces the spirit's services by one.

---

## Initiation & Metamagic

Initiation raises your Magic ceiling and grants access to metamagic techniques.
Each grade costs **10 + (grade × 3) karma** (ordeal discount not yet automated).

```
+initiate/list           Show all available metamagics
+initiate Centering      Purchase Centering metamagic (costs karma)
+initiate                Show your current initiation grade and metamagics
```

### +initiate switches

| Switch | Description |
|--------|-------------|
| `/list` | Show the full metamagic catalogue |

---

## Adept Powers

Adepts spend Power Points (equal to their Magic rating) on adept powers.

```
+powers          Show your current PP balance and purchased powers
+powers/list     Show the full adept power catalogue with PP costs
```

### +powers switches

| Switch | Description |
|--------|-------------|
| `/list` | Show the full adept power catalogue |
