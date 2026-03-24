# Matrix

> Commlinks, hacking, Technomancers, sprites, and complex forms for SR4A.

## Commands

| Command | Syntax | Lock | Description |
|---------|--------|------|-------------|
| `+matrix` | `+matrix[/<switch>] [<args>]` | connected | View/manage commlink and Matrix status |
| `+hack` | `+hack <node>=<action>[/<threshold>]` | connected | Perform a hacking action |
| `+compile` | `+compile[/<switch>] <sprite>=<force>` | connected | Compile a sprite (Technomancer) |
| `+thread` | `+thread[/<switch>] <form>=<force>` | connected | Thread a complex form (Technomancer) |
| `+submerse` | `+submerse [/list] [<echo>]` | connected | Advance submersion grade or buy an Echo |

---

## Commlinks

Every runner needs a commlink. Staff set commlink stats with `/setup`:

```
+matrix                  View your commlink stats and loaded programs
+matrix/programs         Browse the program catalogue
+matrix/program/load Exploit        Load a program (up to Response active at once)
+matrix/program/unload Exploit      Unload a running program
```

### +matrix switches

| Switch | Arg | Description |
|--------|-----|-------------|
| `/setup` | `<model>=<F>/<R>/<Sig>/<Sys>` | **[Staff]** Set commlink stats (Firewall/Response/Signal/System) |
| `/program/load` | `<name>` | Load a program (limited to Response programs active simultaneously) |
| `/program/unload` | `<name>` | Unload a running program |
| `/programs` | — | Show the program catalogue |

---

## Hacking

`+hack` resolves a single Matrix action. The attacker's Hacking + Exploit
(or the relevant skill) is rolled against the node's System + Firewall.

```
+hack SecureNode=probe              Probe the target node
+hack SecureNode=access/3           Attempt access against threshold 3
+hack SecureNode=crash              Crash a running program
+hack SecureNode=edit               Edit a file
```

### Hacking Actions

| Action | Description |
|--------|-------------|
| `probe` | Passive scan — assess node defenses |
| `access` | Gain unauthorized access to a node |
| `crash` | Crash a program running on the node |
| `attack` | Deal Matrix damage to a node or agent |
| `spoof` | Send a command as if from a legitimate user |
| `trace` | Locate the physical origin of a signal |
| `edit` | Modify a file on the node |
| `analyze` | Identify IC, agents, or active users on a node |

---

## Technomancers

Technomancers interact with the Matrix through Resonance rather than hardware.

### Sprites

Compiled sprites act like spirits for the Matrix — they perform tasks and
provide services.

```
+compile/list               Show available sprite types
+compile Data Sprite=6      Compile a Force 6 Data Sprite
```

### +compile switches

| Switch | Description |
|--------|-------------|
| `/list` | Show available sprite types |

### Complex Forms

Complex forms are threaded like spells — they provide Matrix capabilities
without software.

```
+thread/list                Show all complex forms
+thread Exploit=6           Thread Exploit at Force 6
```

### +thread switches

| Switch | Description |
|--------|-------------|
| `/list` | Show available complex forms |

---

## Submersion

Submersion raises a Technomancer's Resonance ceiling and grants Echoes.
Cost: **10 + (grade × 3) karma**.

```
+submerse/list              Show available Echoes
+submerse Amplification     Purchase Amplification Echo
+submerse                   Show current submersion grade and Echoes
```

### +submerse switches

| Switch | Description |
|--------|-------------|
| `/list` | Show the full Echo catalogue |
