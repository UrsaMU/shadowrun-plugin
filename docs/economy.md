# Economy & Lifestyle

> Nuyen transfers, lifestyle tiers, and gear acquisition tests.

## Commands

| Command | Syntax | Lock | Description |
|---------|--------|------|-------------|
| `+pay` | `+pay[/<switch>] [<args>]` | connected | Transfer nuyen to another player |
| `+lifestyle` | `+lifestyle[/<switch>] [<args>]` | connected | Manage lifestyle tier |
| `+acquire` | `+acquire <item>=<avail>[/<contact>]` | connected | Roll an acquisition test |

---

## Nuyen

`+pay` transfers nuyen between players. Staff can set balances directly.

### +pay switches

| Switch | Arg | Description |
|--------|-----|-------------|
| `/set` | `<player>=<amount>` | **[Staff]** Set a player's nuyen directly |
| `/log` | — | Show your last 20 transactions |

```
+pay Alice=500           Transfer 500¥ to Alice
+pay/log                 View your transaction history
+pay/set Alice=10000     [Staff] Set Alice's nuyen to 10,000¥
```

---

## Lifestyle

Lifestyle represents your runner's cost of living between runs. Monthly costs
are deducted from nuyen when you pay rent.

### Lifestyle Tiers (SR4A p. 227)

| Tier | Monthly Cost | Description |
|------|-------------|-------------|
| `street` | 0¥ | Squatting, no fixed address |
| `squatter` | 500¥ | Marginal — coffin hotels, abandoned buildings |
| `low` | 2,000¥ | Basic amenities in a barrens apartment |
| `middle` | 5,000¥ | Comfortable, SINner-level housing |
| `high` | 10,000¥ | Upscale with security and amenities |
| `luxury` | 100,000¥ | Corporate penthouse level |

### +lifestyle switches

| Switch | Arg | Description |
|--------|-----|-------------|
| `/set` | `<tier>` | Change your lifestyle tier |
| `/pay` | — | Deduct this month's cost from your nuyen |
| `/view` | `<player>` | **[Staff]** View another player's lifestyle |

```
+lifestyle               View your current lifestyle tier and monthly cost
+lifestyle/set middle    Change to Middle lifestyle (5,000¥/month)
+lifestyle/pay           Pay this month's rent
+lifestyle/view Alice    [Staff] View Alice's lifestyle
```

---

## Acquisition

`+acquire` rolls an availability test to find an item on the black market.
Pool is Negotiation + Charisma (or contact's Connection if a contact is named).
Threshold is the item's availability rating.

```
+acquire Ares Predator IV=6           Roll to acquire the pistol (avail 6)
+acquire Lined Coat=4/Fixer           Use Fixer contact (avail 4)
```
