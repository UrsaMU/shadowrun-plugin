# REST API & Storage

> HTTP endpoints and database schema for the Shadowrun plugin.

## REST Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/shadowrun/char/<playerId>` | Bearer | Fetch a character sheet as JSON |

### Authorization

- Authenticated callers (valid Bearer token) may only fetch **their own** character
  unless they hold the `admin`, `wizard`, or `superuser` flag.
- Staff may fetch any character by player ID.
- Unauthenticated requests receive `401 Unauthorized`.
- Requests for a non-existent character receive `404 Not Found`.

### Response

```json
{
  "id": "abc123",
  "playerId": "player456",
  "playerName": "Alice",
  "metatype": "Elf",
  "attrs": { "Body": 3, "Agility": 5, "Reaction": 4, "Strength": 2, "Charisma": 5, "Intuition": 4, "Logic": 3, "Willpower": 3, "Edge": 3, "Magic": 6 },
  "skills": { "Pistols": { "rating": 4, "spec": "Colts" } },
  "qualities": [{ "name": "Analytical Mind", "bp": 5, "positive": true }],
  "contacts": [{ "name": "Fixer", "connection": 4, "loyalty": 3 }],
  "gear": [{ "name": "Armor Jacket", "quantity": 1, "ballistic": 8, "impact": 6 }],
  "armorRating": 8,
  "armorImpact": 6,
  "recoilComp": 0,
  "nuyen": 15000,
  "karma": 10,
  "status": "approved"
}
```

> REST routes registered via `registerPluginRoute` persist until server
> restart even after plugin removal.

---

## Storage Schema

All collections are namespaced under `shadowrun.*` in Deno KV via the DBO
abstraction layer.

### shadowrun.chars — `IShadowrunChar`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Internal record ID |
| `playerId` | `string` | UrsaMU player object ID |
| `playerName` | `string` | Display name at time of chargen |
| `metatype` | `string` | `Human`, `Elf`, `Dwarf`, `Ork`, or `Troll` |
| `attrs` | `Record<string, number>` | Attribute ratings (Body, Agility, etc.) |
| `skills` | `Record<string, ICharSkill>` | Active skill ratings and specializations |
| `qualities` | `ICharQuality[]` | Positive and negative qualities |
| `contacts` | `ICharContact[]` | NPC contacts with Connection/Loyalty |
| `gear` | `IGearItem[]` | Equipment list with cached stats |
| `armorRating` | `number` | Derived ballistic armor total (from gear) |
| `armorImpact` | `number` | Derived impact armor total (from gear) |
| `recoilComp` | `number` | Derived recoil compensation (from gear) |
| `nuyen` | `number` | Current nuyen balance |
| `karma` | `number` | Unspent karma |
| `karmaLog` | `IKarmaEntry[]` | Full karma award/spend history |
| `status` | `"draft" \| "pending" \| "approved"` | Chargen workflow state |

### shadowrun.rolllog — `IRollLogEntry`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Record ID |
| `playerId` | `string` | Player who made the roll |
| `pool` | `number` | Dice pool size |
| `threshold` | `number \| null` | Threshold (if any) |
| `hits` | `number` | Hits rolled |
| `glitch` | `boolean` | Whether a glitch occurred |
| `critGlitch` | `boolean` | Whether a critical glitch occurred |
| `edge` | `boolean` | Whether Edge was burned |
| `timestamp` | `number` | Unix timestamp (ms) |

### shadowrun.runs — `IRunEntry`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Record ID |
| `name` | `string` | Run name |
| `summary` | `string` | Staff-provided summary |
| `status` | `"pending" \| "active" \| "closed"` | Run lifecycle state |
| `roster` | `string[]` | Player IDs registered for the run |
| `baseKarma` | `number \| null` | Base karma awarded on close |
| `createdAt` | `number` | Unix timestamp (ms) |
| `closedAt` | `number \| null` | Unix timestamp (ms) |
