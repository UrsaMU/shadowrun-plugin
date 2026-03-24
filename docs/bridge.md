# Shadowrun Plugin — ai-gm Bridge

When `@ursamu/ai-gm` is installed alongside this plugin, they connect automatically through `gameHooks` with no configuration required.

## What Happens

**On plugin init:**

1. The SR4 game system definition is written to `server.gm.custom_systems` (the DBO collection ai-gm reads on startup)
2. A `gm:system:register` event is emitted so a running ai-gm instance registers the system immediately without a restart

**After every `+roll` or `+roll/edge`:**

3. A `shadowrun:roll` event is emitted with the pool, hits, glitch status, and optional threshold
4. If a GM round is open in that room, ai-gm injects the roll result into the player's round context
5. The GM LLM sees the mechanical outcome when it adjudicates — e.g. `[SR4 ROLL] Ghost: 8 dice → 3 hits vs threshold 4 — FAIL GLITCH`

## SR4 Game System

The seeded `IGameSystem` teaches ai-gm SR4E mechanics:

| Field | Value |
|-------|-------|
| `id` | `shadowrun-4e` |
| `moveThresholds.fullSuccess` | 4 hits |
| `moveThresholds.partialSuccess` | 1 hit |
| Hard moves | 10 (ICE trace, weapon jam, spirit turns hostile, …) |
| Soft moves | 8 (succeed with evidence, contact wants a favor, …) |
| `adjudicationHint` | Corporate-noir fiction-first framing |

The ai-gm GM prompt is loaded with SR4 dice pool rules, glitch mechanics, and condition monitor rules automatically when `shadowrun-4e` is the active system.

## Activating the SR4 System

After both plugins init, switch ai-gm to SR4:

```
+gm/config/system shadowrun-4e
```

Or it activates on the next `+gm/session/open` if no other system is explicitly set.

## No ai-gm? No Problem

The bridge is fully decoupled. If ai-gm is not installed:

- `gameHooks.emit("gm:system:register", ...)` fires and is simply not listened to — no error
- `gameHooks.emit("shadowrun:roll", ...)` fires and is silently ignored — `.catch(() => {})` swallows any error
- All Shadowrun commands work exactly as normal
- The DBO write to `server.gm.custom_systems` is harmless if ai-gm is never installed

## Technical Details

See [ai-gm/docs/bridge.md](https://github.com/UrsaMU/ai-gm/blob/main/docs/bridge.md) for the full event contract and how to implement the same pattern for other game systems.
