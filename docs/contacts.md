# Contacts & Social

> NPC contact management, legwork, favors, and street reputation.

## Commands

| Command | Syntax | Lock | Description |
|---------|--------|------|-------------|
| `+contact` | `+contact[/<switch>] [<args>]` | connected | Manage NPC contacts |
| `+legwork` | `+legwork <contact>=<topic>/<threshold>` | connected | Legwork extended test via a contact |
| `+favor` | `+favor <contact>=<rating> <request>` | connected | Request a favor from a contact |
| `+rep` | `+rep[/<switch>] [<args>]` | connected | View/adjust street reputation |

---

## Contacts

Contacts are rated by **Connection** (how well-connected they are, 1–6) and
**Loyalty** (how much they like you, 1–6).

### +contact switches

| Switch | Arg | Description |
|--------|-----|-------------|
| `/add` | `<Name>=<Conn>/<Loy>` | Add a new contact |
| `/edit` | `<Name>=<Conn>/<Loy>` | Update Connection and Loyalty ratings |
| `/remove` | `<Name>` | Remove a contact |
| `/view` | `<player>` | **[Staff]** View another player's contacts |

```
+contact                         List all your contacts
+contact/add Fixer=4/3           Add a Fixer contact (Conn 4 / Loy 3)
+contact/edit Fixer=4/4          Update Fixer's loyalty to 4
+contact/remove Fixer            Remove Fixer from your contact list
+contact/view Alice              [Staff] View Alice's contacts
```

> Contact names that match prototype-poison keys are rejected as a
> defense-in-depth security measure.

---

## Legwork

`+legwork` initiates an extended test using a contact to gather information
on a topic. The contact's Connection + the runner's relevant skill forms
the dice pool; threshold represents the difficulty.

```
+legwork Fixer=Weapon Supplier/3     Roll Fixer's network to find a weapons dealer
+legwork Street Doc=Safe House/4     Roll for a safe house lead
```

---

## Favors

`+favor` calls in a favor from a contact. The request difficulty is rated
against the contact's Loyalty. High-rating favors strain the relationship.

```
+favor Fixer=2 I need a clean pistol
+favor Street Samurai=4 Cover my exit
```

---

## Reputation

Street reputation tracks how the shadows see your runner.

| Field | Description |
|-------|-------------|
| `streetcred` | Positive reputation earned through successful runs |
| `notoriety` | Negative reputation from failures, collateral damage, or betrayals |
| `publicawareness` | How well-known you are to the general public (dangerous) |

### +rep switches

| Switch | Arg | Description |
|--------|-----|-------------|
| `/set` | `<field>=<value>` | **[Staff]** Set a reputation field directly |
| `/add` | `<field>=<delta>` | **[Staff]** Add or subtract from a reputation field |

```
+rep                              View your reputation stats
+rep/set streetcred=5             [Staff] Set street cred to 5
+rep/add notoriety=2              [Staff] Add 2 to notoriety
+rep/add publicawareness=-1       [Staff] Reduce public awareness by 1
```
